/**
 * POST /api/board/admin/login · 站长后台登录（邮箱 + 密码）
 * ---------------------------------------------------------------
 * 校验 env 凭据 → 签发 HMAC 会话 token 写进 httpOnly cookie。
 * 简单 IP 频率限制防暴力破解（内存版，单实例够用）。
 */
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createSessionToken,
  verifyCredentials,
  SESSION_MAX_AGE_S,
} from "@/lib/board/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 8;
const hits = new Map<string, number[]>();

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

function rateLimited(key: string): boolean {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_MAX) {
    hits.set(key, arr);
    return true;
  }
  arr.push(now);
  hits.set(key, arr);
  return false;
}

export async function POST(req: Request) {
  if (rateLimited(clientIp(req))) {
    return NextResponse.json(
      { message: "尝试太频繁了，过几分钟再试" },
      { status: 429 }
    );
  }

  if (!process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json(
      { message: "后台未配置（缺 ADMIN_SESSION_SECRET）" },
      { status: 503 }
    );
  }

  let payload: { email?: string; password?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "请求格式错误" }, { status: 400 });
  }

  const email = (payload.email ?? "").trim();
  const password = payload.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ message: "邮箱和密码都要填" }, { status: 400 });
  }

  if (!verifyCredentials(email, password)) {
    return NextResponse.json({ message: "邮箱或密码不对" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });
  return res;
}
