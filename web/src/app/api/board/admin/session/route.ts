/**
 * GET /api/board/admin/session · 前端查询当前是否已登录站长
 * （httpOnly cookie 前端读不到，故用此端点判断是否进编辑模式）
 */
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/board/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return NextResponse.json({ admin: isAdminRequest(req) });
}
