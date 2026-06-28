/**
 * AI 数字分身 · 前后端共享类型
 * ---------------------------------------------------------------
 * 前端 fetch /api/chat 时构造 ChatMessage[]，后端原样收下做校验。
 */

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

/** 客户端 POST /api/chat 的 body 结构 */
export type ChatRequestBody = {
  messages: ChatMessage[];
  /** 当前轮附带的岗位 JD 图片（data URL）· 存在时走视觉模型 Qwen-VL 做匹配 */
  image?: string;
};

/** 防护上限（PROJECT_GUIDE 第 102 行：成本与滥用防护） */
export const CHAT_LIMITS = {
  /** 单条消息字符数上限 · 控制单次 token 消耗 */
  MAX_MESSAGE_LENGTH: 1000,
  /** 客户端历史保留多少条 · 5 轮对话足够 */
  MAX_HISTORY: 10,
  /** 同 IP 1 分钟内最多请求次数 */
  MAX_REQUESTS_PER_MINUTE: 12,
  /** JD 图片 data URL 字符数上限（约 6MB 图）· 前端已压缩，这里兜底 */
  MAX_IMAGE_DATAURL_LENGTH: 8_000_000,
} as const;

export type ChatErrorCode =
  | "MISSING_API_KEY"
  | "MISSING_VISION_KEY"
  | "INVALID_REQUEST"
  | "MESSAGE_TOO_LONG"
  | "IMAGE_TOO_LARGE"
  | "TOO_MANY_MESSAGES"
  | "RATE_LIMIT"
  | "UPSTREAM_ERROR";

export type ChatErrorPayload = {
  error: ChatErrorCode;
  message: string;
};
