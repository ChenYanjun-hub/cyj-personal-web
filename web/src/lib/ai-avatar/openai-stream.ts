/**
 * 通用 OpenAI 兼容流式 chat 层
 * ---------------------------------------------------------------
 * PROJECT_GUIDE 架构铁律「模型调用做成可替换层」的落地：
 *  - DeepSeek（文本）和 Qwen-VL（视觉）都走 OpenAI 兼容协议，
 *    差异只是 baseUrl / model / 消息 content（纯文本 vs 多模态数组）。
 *  - 手写 fetch + SSE 解析，不引入第三方 LLM SDK。
 *  - 返回 ReadableStream<string>，每个 chunk 是 delta 文本。
 */

/** OpenAI 多模态 content 片段（视觉模型用） */
export type OpenAIContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

/** OpenAI 兼容消息：content 可为纯文本或多模态数组 */
export type OpenAIMessage = {
  role: "system" | "user" | "assistant";
  content: string | OpenAIContentPart[];
};

export type StreamChatOptions = {
  apiKey: string;
  baseUrl: string;
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
};

/**
 * 流式调用任意 OpenAI 兼容 /chat/completions。
 * @throws 上游非 2xx 或网络错误时 throw（调用方负责 try/catch）
 */
export async function streamOpenAIChat(
  opts: StreamChatOptions,
): Promise<ReadableStream<string>> {
  const res = await fetch(`${opts.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      stream: true,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 1500,
    }),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "");
    throw new Error(`upstream ${res.status}: ${errText.slice(0, 200)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream<string>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          flushLine(buffer.trim(), controller);
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!flushLine(line.trim(), controller)) {
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
 * @returns false 表示遇到 [DONE]（调用方应关闭流）；true 表示继续。
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
    // 跳过无法解析的行（SSE ping / 空 keepalive）
  }
  return true;
}
