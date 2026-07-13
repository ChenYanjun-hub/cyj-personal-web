/**
 * /api/board/[id] · 站长后台操作单条留言（DELETE 删除 / PATCH 布局）
 * ---------------------------------------------------------------
 * 鉴权：邮箱+密码登录后的 httpOnly 会话 cookie（见 lib/board/auth）。
 *  - DELETE：永久删除（deleted=1，后台也不再显示）
 *  - PATCH ：设置便签位置 { x, y, rot } / { reset: true } 回瀑布流 / { hidden: bool } 隐藏切换
 */
import { NextResponse } from "next/server";
import {
  deleteMessage,
  setHidden,
  setNoteLayout,
  resetNoteLayout,
} from "@/lib/board/db";
import { isAdminRequest } from "@/lib/board/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseId(id: string): number | null {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ message: "无权限" }, { status: 401 });
  }
  const { id } = await params;
  const numId = parseId(id);
  if (numId === null) {
    return NextResponse.json({ message: "无效 id" }, { status: 400 });
  }
  return NextResponse.json({ ok: deleteMessage(numId) });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ message: "无权限" }, { status: 401 });
  }
  const { id } = await params;
  const numId = parseId(id);
  if (numId === null) {
    return NextResponse.json({ message: "无效 id" }, { status: 400 });
  }

  let payload: {
    x?: number;
    y?: number;
    rot?: number;
    reset?: boolean;
    hidden?: boolean;
  };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "请求格式错误" }, { status: 400 });
  }

  if (typeof payload.hidden === "boolean") {
    return NextResponse.json({ ok: setHidden(numId, payload.hidden) });
  }

  if (payload.reset) {
    return NextResponse.json({ ok: resetNoteLayout(numId) });
  }

  const { x, y, rot } = payload;
  if (
    typeof x !== "number" ||
    typeof y !== "number" ||
    typeof rot !== "number" ||
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(rot)
  ) {
    return NextResponse.json({ message: "位置参数无效" }, { status: 400 });
  }

  return NextResponse.json({ ok: setNoteLayout(numId, { x, y, rot }) });
}
