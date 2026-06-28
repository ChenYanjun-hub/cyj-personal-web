/**
 * POST /api/chat · AI 分身后端
 * ---------------------------------------------------------------
 * PROJECT_GUIDE 第 56-57 行架构铁律：
 *  - 密钥只在服务端（DEEPSEEK_API_KEY 从 process.env 读，绝不出现在前端）
 *  - 前端只与本站后端通信（前端 fetch 这个 /api/chat，不直连 DeepSeek）
 *
 * 行为：
 *  1. 验证密钥存在
 *  2. 简单内存频率限制（IP 维度，1 分钟 12 次）
 *  3. 校验 messages 数组（长度 / 单条字数 / role）
 *  4. 拼上 system prompt（每次都加，不让客户端覆盖）
 *  5. 调 DeepSeek 流式接口
 *  6. 把流式 delta 文本以 chunked text/plain 返回
 *
 * 注意：内存频率限制只对单实例有效；阿里云上线后如果开多实例，
 * 需要换成 Redis 或 KV 存储。V1 单实例够用。
 */

import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/ai-avatar/prompt";
import { streamDeepSeek } from "@/lib/ai-avatar/deepseek";
import { streamQwenVL } from "@/lib/ai-avatar/qwen-vl";
import {
  CHAT_LIMITS,
  type ChatErrorCode,
  type ChatMessage,
} from "@/lib/ai-avatar/types";

/* ---------------- 频率限制 ---------------- */

const rateMap = new Map<string, number[]>();

function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - 60_000;
  const history = (rateMap.get(ip) ?? []).filter((t) => t > windowStart);
  if (history.length >= CHAT_LIMITS.MAX_REQUESTS_PER_MINUTE) return false;
  history.push(now);
  rateMap.set(ip, history);

  // 简单 GC：定期清空过期 IP（每 200 次清一次）
  if (rateMap.size > 200 && Math.random() < 0.05) {
    for (const [k, v] of rateMap) {
      if (v.every((t) => t <= windowStart)) rateMap.delete(k);
    }
  }
  return true;
}

function getClientIp(req: Request): string {
  // 阿里云 + Nginx 反代后，真实 IP 在 x-forwarded-for 里
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

/* ---------------- 校验 ---------------- */

function validateMessages(messages: unknown):
  | { ok: true; messages: ChatMessage[] }
  | { ok: false; code: ChatErrorCode; message: string } {
  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      ok: false,
      code: "INVALID_REQUEST",
      message: "messages 必须是非空数组",
    };
  }
  if (messages.length > CHAT_LIMITS.MAX_HISTORY) {
    return {
      ok: false,
      code: "TOO_MANY_MESSAGES",
      message: `最近对话过长，请清空重开（最多 ${CHAT_LIMITS.MAX_HISTORY} 条）`,
    };
  }

  const validated: ChatMessage[] = [];
  for (const raw of messages as unknown[]) {
    const m = raw as Partial<ChatMessage>;
    if (typeof m?.content !== "string") {
      return {
        ok: false,
        code: "INVALID_REQUEST",
        message: "消息 content 必须是字符串",
      };
    }
    if (m.content.length > CHAT_LIMITS.MAX_MESSAGE_LENGTH) {
      return {
        ok: false,
        code: "MESSAGE_TOO_LONG",
        message: `单条消息不能超过 ${CHAT_LIMITS.MAX_MESSAGE_LENGTH} 字`,
      };
    }
    if (m.role !== "user" && m.role !== "assistant") {
      return {
        ok: false,
        code: "INVALID_REQUEST",
        message: "role 只能是 user 或 assistant（system 由后端注入）",
      };
    }
    validated.push({ role: m.role, content: m.content });
  }
  return { ok: true, messages: validated };
}

/* ---------------- POST handler ---------------- */

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimitOk(ip)) {
    return errorJson(
      "RATE_LIMIT",
      "请求过于频繁，请稍等一分钟后再试",
      429,
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorJson("INVALID_REQUEST", "请求体不是有效 JSON", 400);
  }

  const messages = (body as { messages?: unknown })?.messages;
  const validation = validateMessages(messages);
  if (!validation.ok) {
    return errorJson(validation.code, validation.message, 400);
  }

  // 当前轮可选 JD 图片（data URL）：存在则走视觉模型 Qwen-VL 做岗位匹配
  const rawImage = (body as { image?: unknown })?.image;
  const imageDataUrl =
    typeof rawImage === "string" && rawImage.length > 0 ? rawImage : null;
  if (imageDataUrl) {
    if (!imageDataUrl.startsWith("data:image/")) {
      return errorJson("INVALID_REQUEST", "图片格式不支持（需 data:image）", 400);
    }
    if (imageDataUrl.length > CHAT_LIMITS.MAX_IMAGE_DATAURL_LENGTH) {
      return errorJson("IMAGE_TOO_LARGE", "图片过大，请换一张更小的截图再试", 413);
    }
  }

  try {
    let textStream: ReadableStream<string>;

    if (imageDataUrl) {
      // 视觉路径 · Qwen-VL：读 JD 图 + 对照档案做匹配
      const visionKey = process.env.DASHSCOPE_API_KEY;
      if (!visionKey) {
        return errorJson(
          "MISSING_VISION_KEY",
          "图片匹配功能尚未配置（服务器缺少 DASHSCOPE_API_KEY）",
          500,
        );
      }
      const lastUserText =
        [...validation.messages].reverse().find((m) => m.role === "user")
          ?.content ?? "";
      textStream = await streamQwenVL(
        SYSTEM_PROMPT,
        validation.messages,
        imageDataUrl,
        lastUserText,
        {
          apiKey: visionKey,
          model: process.env.DASHSCOPE_MODEL,
          baseUrl: process.env.DASHSCOPE_BASE_URL,
          signal: req.signal,
        },
      );
    } else {
      // 文本路径 · DeepSeek
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        return errorJson(
          "MISSING_API_KEY",
          "服务器尚未配置 DEEPSEEK_API_KEY（见 .env.example）",
          500,
        );
      }
      const fullMessages: ChatMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...validation.messages,
      ];
      textStream = await streamDeepSeek(fullMessages, {
        apiKey,
        model: process.env.DEEPSEEK_MODEL,
        baseUrl: process.env.DEEPSEEK_BASE_URL,
        signal: req.signal,
      });
    }

    // 把 string chunks 编码成 Uint8Array 走 chunked transfer
    const encoder = new TextEncoder();
    const byteStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = textStream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(encoder.encode(value));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
      cancel() {
        textStream.cancel().catch(() => {});
      },
    });

    return new Response(byteStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        // Nginx 反代时禁用 buffer（阿里云上线后必须）
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/chat] upstream error:", msg);
    return errorJson("UPSTREAM_ERROR", "AI 服务暂时不可用，请稍后再试", 502);
  }
}

function errorJson(
  code: ChatErrorCode,
  message: string,
  status: number,
): Response {
  return NextResponse.json({ error: code, message }, { status });
}
