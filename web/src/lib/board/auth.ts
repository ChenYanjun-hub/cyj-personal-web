/**
 * 留言板站长后台 · 邮箱+密码鉴权（服务端专用）
 * ---------------------------------------------------------------
 * 无外部依赖：凭据比对 env（ADMIN_EMAIL / ADMIN_PASSWORD），
 * 会话用 HMAC-SHA256 签名的自包含 token 写进 httpOnly cookie（无需存库/Redis）。
 *
 * 需要的 env（生产写 web/.env.production，不入 git）：
 *   ADMIN_EMAIL           登录邮箱
 *   ADMIN_PASSWORD        登录密码
 *   ADMIN_SESSION_SECRET  会话签名密钥（一串足够长的随机串）
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "board_admin";
const SESSION_TTL_MS = 7 * 24 * 60 * 60_000; // 7 天

function secret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || null;
}

/** 定长安全比较，避免时序侧信道（长度不同直接 false） */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** 校验登录凭据是否匹配 env 配置 */
export function verifyCredentials(email: string, password: string): boolean {
  const e = process.env.ADMIN_EMAIL;
  const p = process.env.ADMIN_PASSWORD;
  if (!e || !p) return false;
  // 邮箱大小写不敏感、去空白；密码严格匹配
  const emailOk = safeEqual(email.trim().toLowerCase(), e.trim().toLowerCase());
  const pwOk = safeEqual(password, p);
  return emailOk && pwOk;
}

function sign(payload: string): string {
  return createHmac("sha256", secret() as string)
    .update(payload)
    .digest("base64url");
}

/** 生成会话 token：payload = "<email>.<expiryMs>"，附 HMAC 签名 */
export function createSessionToken(email: string): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `${Buffer.from(email).toString("base64url")}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

/** 校验会话 token：签名有效 + 未过期 + 邮箱仍等于 ADMIN_EMAIL */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token || !secret()) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [emailB64, expStr, sig] = parts;
  const payload = `${emailB64}.${expStr}`;
  if (!safeEqual(sig, sign(payload))) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const email = Buffer.from(emailB64, "base64url").toString("utf8");
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;
  return safeEqual(email.trim().toLowerCase(), adminEmail.trim().toLowerCase());
}

/** 从请求的 Cookie 头里取某个 cookie 值（避免依赖 next/headers 的版本差异） */
export function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}

/** 请求是否来自已登录站长 */
export function isAdminRequest(req: Request): boolean {
  return verifySessionToken(readCookie(req, ADMIN_COOKIE));
}

export const SESSION_MAX_AGE_S = Math.floor(SESSION_TTL_MS / 1000);
