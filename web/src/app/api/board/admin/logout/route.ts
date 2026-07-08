/**
 * POST /api/board/admin/logout · 退出站长后台（清 cookie）
 */
import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/board/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
