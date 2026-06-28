/**
 * DeepSeek 客户端 · 流式 chat completion（文本）
 * ---------------------------------------------------------------
 * 现在只是通用 OpenAI 兼容层 openai-stream.ts 的薄封装：
 * 填好 DeepSeek 的 baseUrl / model 默认值即可。换别的文本模型只改这里。
 *
 * DeepSeek API 文档：https://api-docs.deepseek.com/api/create-chat-completion
 */

import type { ChatMessage } from "./types";
import { streamOpenAIChat } from "./openai-stream";

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
 * 流式调用 DeepSeek（纯文本对话）。
 * @returns ReadableStream<string>，每个 chunk 是 delta 文本片段
 * @throws 上游非 2xx 或网络错误时 throw（调用方需要 try/catch）
 */
export async function streamDeepSeek(
  messages: ChatMessage[],
  opts: DeepSeekOptions,
): Promise<ReadableStream<string>> {
  return streamOpenAIChat({
    apiKey: opts.apiKey,
    baseUrl: opts.baseUrl || DEFAULT_BASE_URL,
    model: opts.model || DEFAULT_MODEL,
    messages,
    temperature: 0.4,
    maxTokens: 1500,
    signal: opts.signal,
  });
}
