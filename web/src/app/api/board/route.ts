/**
 * /api/board · 留言板（GET 列表 / POST 发表）
 * ---------------------------------------------------------------
 * 即时显示 + 防刷：蜜罐字段 + IP 频率限制 + 长度/必填校验。
 * 存储走 SQLite（@/lib/board/db），故强制 nodejs runtime + 不缓存。
 * 内存频率限制只对单实例有效；阿里云若开多实例需换 Redis（与 /api/chat 同注意）。
 */
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { addMessage, listMessages } from "@/lib/board/db";
import { BOARD_LIMITS } from "@/lib/board/limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// IP 维度：10 分钟内最多 3 条
const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 3;
const hits = new Map<string, number[]>();

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  const first = xff?.split(",")[0]?.trim();
  return first || req.headers.get("x-real-ip") || "unknown";
}

function ipHashOf(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
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

export async function GET() {
  try {
    return NextResponse.json({ messages: listMessages(100) });
  } catch {
    return NextResponse.json({ message: "留言板暂时不可用" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let payload: { name?: string; body?: string; website?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "请求格式错误" }, { status: 400 });
  }

  // 蜜罐：website 字段人类留空、机器人爱填 → 静默假成功（不暴露拦截规则）
  if (typeof payload.website === "string" && payload.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = (payload.name ?? "").trim();
  const body = (payload.body ?? "").trim();
  if (!name || !body) {
    return NextResponse.json({ message: "名字和留言都要填哦" }, { status: 400 });
  }
  if (name.length > BOARD_LIMITS.NAME_MAX) {
    return NextResponse.json(
      { message: `名字不超过 ${BOARD_LIMITS.NAME_MAX} 字` },
      { status: 400 }
    );
  }
  if (body.length > BOARD_LIMITS.BODY_MAX) {
    return NextResponse.json(
      { message: `留言不超过 ${BOARD_LIMITS.BODY_MAX} 字` },
      { status: 400 }
    );
  }

  if (rateLimited(ipHashOf(clientIp(req)))) {
    return NextResponse.json(
      { message: "留言太频繁了，过几分钟再来～" },
      { status: 429 }
    );
  }

  try {
    const message = addMessage({ name, body, ipHash: ipHashOf(clientIp(req)) });
    return NextResponse.json({ message });
  } catch {
    return NextResponse.json(
      { message: "留言保存失败，请稍后再试" },
      { status: 500 }
    );
  }
}
