/**
 * DELETE /api/board/[id] · 站长软删除一条留言
 * ---------------------------------------------------------------
 * 鉴权：Authorization: Bearer <BOARD_ADMIN_TOKEN>（token 只在服务端 env）。
 * 软删除（hidden=1），保留原始记录便于追溯。
 *
 * 用法示例（站长清垃圾留言）：
 *   curl -X DELETE https://你的域名/api/board/12 \
 *        -H "Authorization: Bearer $BOARD_ADMIN_TOKEN"
 */
import { NextResponse } from "next/server";
import { hideMessage } from "@/lib/board/db";

export const runtime = "nodejs";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = process.env.BOARD_ADMIN_TOKEN;
  if (!token || req.headers.get("authorization") !== `Bearer ${token}`) {
    return NextResponse.json({ message: "无权限" }, { status: 401 });
  }

  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    return NextResponse.json({ message: "无效 id" }, { status: 400 });
  }

  return NextResponse.json({ ok: hideMessage(numId) });
}
