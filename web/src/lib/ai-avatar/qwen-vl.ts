/**
 * 通义千问 Qwen-VL 客户端 · 流式视觉 chat（读 JD 图片 + 岗位匹配）
 * ---------------------------------------------------------------
 * DashScope 的 OpenAI 兼容端点，多模态消息格式与 OpenAI 一致：
 *   user.content = [{type:"text",text}, {type:"image_url",image_url:{url}}]
 * 复用 openai-stream.ts 的流式层，只换 baseUrl / model / 多模态 content。
 *
 * DashScope 兼容模式文档：
 *   https://help.aliyun.com/zh/model-studio/developer-reference/compatibility-of-openai-with-dashscope
 */

import type { ChatMessage } from "./types";
import { streamOpenAIChat, type OpenAIMessage } from "./openai-stream";

const DEFAULT_MODEL = "qwen-vl-max";
const DEFAULT_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";

// 视觉匹配指令：让模型先读图、再对照 system prompt 里的真实档案做匹配
const MATCH_INSTRUCTION =
  "这是一张招聘岗位 JD 的截图。请先从图中提取关键岗位信息（公司/岗位、核心职责、硬性要求、加分项），" +
  "再严格对照上文给出的陈彦均的真实能力与项目，输出一份岗位匹配分析：\n" +
  "1）逐条关键要求的匹配度（强/中/弱 + 一句证据）；\n" +
  "2）最契合的 2-3 个亮点；\n" +
  "3）可能的 gap 及如何弥补；\n" +
  "4）总体匹配结论（一句话 + 建议）。\n" +
  "只基于已知事实，缺乏依据的地方如实说明，不要编造经历。";

export type QwenVLOptions = {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  signal?: AbortSignal;
};

/**
 * 流式调用 Qwen-VL 做「JD 图片 + 岗位匹配」。
 *
 * @param systemPrompt 陈彦均的真实档案（与文本路径同一份 SYSTEM_PROMPT）
 * @param history      纯文本对话历史（user/assistant），用于多轮上下文
 * @param imageDataUrl JD 图片的 data URL（data:image/...;base64,...）
 * @param userText     用户随图附带的文字（可为空）
 */
export async function streamQwenVL(
  systemPrompt: string,
  history: ChatMessage[],
  imageDataUrl: string,
  userText: string,
  opts: QwenVLOptions,
): Promise<ReadableStream<string>> {
  const textPart = userText.trim()
    ? `${MATCH_INSTRUCTION}\n\n补充说明：${userText.trim()}`
    : MATCH_INSTRUCTION;

  const messages: OpenAIMessage[] = [
    { role: "system", content: systemPrompt },
    // 历史里最后一条本是带图的 user，这里换成多模态版本，前面的历史保留文本
    ...history.slice(0, -1),
    {
      role: "user",
      content: [
        { type: "text", text: textPart },
        { type: "image_url", image_url: { url: imageDataUrl } },
      ],
    },
  ];

  return streamOpenAIChat({
    apiKey: opts.apiKey,
    baseUrl: opts.baseUrl || DEFAULT_BASE_URL,
    model: opts.model || DEFAULT_MODEL,
    messages,
    temperature: 0.3,
    maxTokens: 2000,
    signal: opts.signal,
  });
}
