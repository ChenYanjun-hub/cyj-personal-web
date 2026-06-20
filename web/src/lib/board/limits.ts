/**
 * 留言板限制常量 · 前后端共用
 * （纯常量，不含 server-only 依赖，客户端可安全 import 做输入上限）
 */
export const BOARD_LIMITS = {
  NAME_MAX: 24,
  BODY_MAX: 500,
} as const;
