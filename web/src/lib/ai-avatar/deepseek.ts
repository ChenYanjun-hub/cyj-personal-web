/**
 * DeepSeek 客户端 · 流式 chat completion
 * ---------------------------------------------------------------
 * PROJECT_GUIDE 第 55 行架构铁律："模型调用做成可替换层"——
 * 换模型（通义 / 智谱 / Kimi 等）只改这一个文件，
 * 其余代码（prompt.ts / route.ts / 前端组件）零改动。
 *
 * 设计：
 *  - 手写 fetch + SSE 解析，不引入第三方 LLM SDK
 *  - 返回标准 ReadableStream<string>，每个 chunk 是 delta 文本
 *  - 上游错误直接 throw，调用方负责 try/catch + 用户友好 fallback
 *
 * DeepSeek API 文档：https://api-docs.deepseek.com/api/create-chat-completion
 * 兼容 OpenAI Chat API 格式，因此切别的 OpenAI-兼容 model 时只改 baseUrl + model 即可。
 */

import type { ChatMessage } from "./types";

const DEFAULT_MODEL = "deepseek-chat";
const DEFAULT_BASE_URL = "https://api.deepseek.com";

export type DeepSeekOptions = {
  apiKey: string;
  /** 默认 deepseek-chat；可换 deepseek-reasoner 等 */
  model?: string;
  /** 默认 https://api.deepseek.com */
  baseUrl?: string;
  /** 可选 AbortSignal · 客户端断开时上游也取消 */
  signal?: AbortSignal;
};

/**
 * 流式调用 DeepSeek。
 *
 * @returns ReadableStream<string>，每个 chunk 是 SSE delta 里的文本片段
 * @throws 上游非 2xx 或网络错误时 throw（调用方需要 try/catch）
 */
export async function streamDeepSeek(
  messages: ChatMessage[],
  opts: DeepSeekOptions,
): Promise<ReadableStream<string>> {
  const url = `${opts.baseUrl ?? DEFAULT_BASE_URL}/chat/completions`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model ?? DEFAULT_MODEL,
      messages,
      stream: true,
      // 低温度避免发挥；DeepSeek 默认 1.0，0.4 让回答更稳定贴合 system prompt
      temperature: 0.4,
      // 单次回答上限（防止意外长输出消耗 token）
      max_tokens: 1500,
    }),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    // 把错误文本读出来（不超过 200 字符，避免日志噪音）
    const errText = await res.text().catch(() => "");
    throw new Error(
      `DeepSeek upstream ${res.status}: ${errText.slice(0, 200)}`,
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream<string>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          // 收尾：把 buffer 里残留的最后一行也处理掉
          flushLine(buffer.trim(), controller);
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });

        // SSE 格式：每条以 "data: ..." 开头，块之间 \n 分隔。
        // 但 chunk 可能落在行中间，所以保留最后一行（不完整）放回 buffer 等下一次拼接。
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!flushLine(line.trim(), controller)) {
            // [DONE] 信号 · 主动关闭
            controller.close();
            return;
          }
        }
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}

/**
 * 处理一行 SSE 数据。
 * @returns false 表示遇到 [DONE]，调用方应该关闭流；true 表示继续。
 */
function flushLine(
  line: string,
  controller: ReadableStreamDefaultController<string>,
): boolean {
  if (!line) return true;
  if (!line.startsWith("data:")) return true;

  const data = line.slice(5).trim();
  if (data === "[DONE]") return false;

  try {
    const json = JSON.parse(data) as {
      choices?: Array<{ delta?: { content?: string } }>;
    };
    const delta = json.choices?.[0]?.delta?.content;
    if (typeof delta === "string" && delta.length > 0) {
      controller.enqueue(delta);
    }
  } catch {
    // 跳过无法解析的行（如 SSE ping / 空 keepalive）
  }
  return true;
}
