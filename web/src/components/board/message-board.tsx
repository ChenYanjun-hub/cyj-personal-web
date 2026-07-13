"use client";

/**
 * 留言板 · 网格底板 + 可拖动便签（收尾幕内，id="board"）
 * ---------------------------------------------------------------
 * 风格：网格纸底板 + 手绘夹子夹住的便签，可随意拖动重新摆放。
 *  - GET /api/board 拉列表；POST 发表后即时贴上来
 *  - 便签绝对定位（transform translate + rotate），拖拽直接改 DOM transform（流畅），落下写回 state
 *  - 布局：默认按留言时间（created_at DESC）走「实测高度列瀑布流」，长短便签不重叠、正文全显示
 *  - 站长后台（/board-admin 邮箱+密码登录）：进编辑模式后拖便签 = 全局保存位置、可删除/重置
 *  - 普通访客拖动仅本会话客户端，不入库（每位访客自己摆，不互相影响）
 *  - 用户内容 React {text} 渲染（自动转义），pre-wrap 保留换行
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, PointerEvent as ReactPointerEvent } from "react";
import { BOARD_LIMITS } from "@/lib/board/limits";

type BoardMessage = {
  id: number;
  name: string;
  body: string;
  created_at: number;
  pos_x: number | null;
  pos_y: number | null;
  rot: number | null;
  z_order: number;
  hidden?: number;
};

type Pos = { x: number; y: number; rot: number; z: number; manual: boolean };

const NOTE_W = 210;
const NOTE_H = 172; // 仅作实测前的高度兜底
const GAP_X = 30;
const GAP_Y = 26;
const PAD = 26;

// 按 id 的稳定伪随机（抖动/旋转不会每次渲染都变）
function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function relTime(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "刚刚";
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} 天前`;
  return new Date(ts).toLocaleDateString("zh-CN");
}

// 手绘风格夹子（binder clip）· 颜色随 .board-note-clip 的 color
function BoardClip() {
  return (
    <svg
      width="44"
      height="30"
      viewBox="0 0 44 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 11 L33 11 L29 24 L15 24 Z" className="board-clip-body" />
      <path d="M15 11 C 13 3, 21 3, 20 10.5" />
      <path d="M29 11 C 31 3, 23 3, 24 10.5" />
    </svg>
  );
}

export default function MessageBoard() {
  const [messages, setMessages] = useState<BoardMessage[]>([]);
  const [positions, setPositions] = useState<Map<number, Pos>>(new Map());
  const [canvasH, setCanvasH] = useState(480);
  const [loaded, setLoaded] = useState(false);
  // 类无限画布：世界层平移量（鼠标中键/滚轮下压拖动）
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  // 触摸端：长按 2s 激活拖动的便签（加脉冲动画类）
  const [armedNote, setArmedNote] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 站长编辑模式：由 httpOnly 会话 cookie 决定（GET /api/board/admin/session）
  const [isAdmin, setIsAdmin] = useState(false);

  const honeypotRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const noteRefs = useRef<Map<number, HTMLElement>>(new Map());
  const zTop = useRef(1);
  // 统一手势：pan=平移底板 / note=拖便签 / pending=触摸待判定（长按→拖便签，滑动→平移）
  const gesture = useRef<{
    kind: "pan" | "note" | "pending";
    id?: number;
    el?: HTMLElement;
    sx: number;
    sy: number;
    panOx: number;
    panOy: number;
    nox: number;
    noy: number;
    rot: number;
    moved: boolean;
    timer?: number;
  } | null>(null);

  // 拉留言列表：服务端已设位置的便签（pos_x 非空）直接采用，其余走瀑布流
  useEffect(() => {
    let alive = true;
    fetch("/api/board")
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !Array.isArray(d.messages)) return;
        const list = d.messages as BoardMessage[];
        setMessages(list);
        const maxZ = list.reduce((mx, m) => Math.max(mx, m.z_order || 0), 1);
        zTop.current = maxZ;
        setPositions((prev) => {
          const next = new Map(prev);
          for (const m of list) {
            if (m.pos_x != null && m.pos_y != null) {
              next.set(m.id, {
                x: m.pos_x,
                y: m.pos_y,
                rot: m.rot ?? 0,
                z: m.z_order || 1,
                manual: true,
              });
            }
          }
          return next;
        });
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  // 查询是否已登录站长 → 决定是否进编辑模式
  useEffect(() => {
    let alive = true;
    fetch("/api/board/admin/session")
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.admin) setIsAdmin(true);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // 布局：手动定位（拖过/后台设过）的便签保留；其余按时间序走实测高度列瀑布流
  const layout = useCallback(() => {
    const canvas = canvasRef.current;
    const W = canvas?.clientWidth || 820;
    const cols = Math.max(
      1,
      Math.floor((W - PAD * 2 + GAP_X) / (NOTE_W + GAP_X))
    );
    setPositions((prev) => {
      const next = new Map(prev);
      const colBottom = new Array(cols).fill(PAD) as number[];
      let maxBottom = 0;
      for (const m of messages) {
        const el = noteRefs.current.get(m.id);
        const h = el?.offsetHeight || NOTE_H;
        const existing = next.get(m.id);
        if (existing?.manual) {
          maxBottom = Math.max(maxBottom, existing.y + h);
          continue;
        }
        // 选最短列填入
        let col = 0;
        for (let c = 1; c < cols; c++) {
          if (colBottom[c] < colBottom[col]) col = c;
        }
        const jx = (rand(m.id) * 2 - 1) * 8;
        const rot = (rand(m.id + 3) * 2 - 1) * 4;
        const x = PAD + col * (NOTE_W + GAP_X) + jx;
        const y = colBottom[col];
        next.set(m.id, {
          x,
          y,
          rot,
          z: existing?.z ?? m.z_order ?? ++zTop.current,
          manual: false,
        });
        colBottom[col] = y + h + GAP_Y;
        maxBottom = Math.max(maxBottom, y + h);
      }
      setCanvasH(Math.max(360, maxBottom + PAD));
      return next;
    });
  }, [messages]);

  useEffect(() => {
    layout();
  }, [layout]);

  useEffect(() => {
    const onResize = () => layout();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [layout]);

  /* ---------------- 统一手势（拖便签 / 平移底板）----------------
     鼠标：左键拖便签、中键平移；触摸：滑动=平移，便签上长按 2s=拖便签 */
  const LONG_PRESS_MS = 2000;
  const TOUCH_MOVE_CANCEL = 12;

  // setPointerCapture 对无效指针会抛异常（尤其合成事件），兜底不让它中断手势
  const capture = (el: HTMLElement, id: number) => {
    try {
      el.setPointerCapture(id);
    } catch {}
  };

  const beginNoteDrag = (
    id: number,
    el: HTMLElement,
    atX: number,
    atY: number
  ) => {
    const g = gesture.current;
    if (!g) return;
    const p = positions.get(id);
    zTop.current += 1;
    el.style.zIndex = String(zTop.current);
    el.classList.add("dragging");
    g.kind = "note";
    g.id = id;
    g.el = el;
    g.sx = atX;
    g.sy = atY;
    g.nox = p?.x ?? 0;
    g.noy = p?.y ?? 0;
    g.rot = p?.rot ?? 0;
    g.moved = false;
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const canvas = e.currentTarget;
    const noteEl = (e.target as HTMLElement).closest(
      ".board-note"
    ) as HTMLElement | null;
    const noteId = noteEl ? Number(noteEl.dataset.id) : NaN;
    const base = {
      sx: e.clientX,
      sy: e.clientY,
      panOx: pan.x,
      panOy: pan.y,
      nox: 0,
      noy: 0,
      rot: 0,
      moved: false,
    };

    if (e.pointerType === "mouse") {
      if (e.button === 1) {
        // 中键 → 平移底板
        e.preventDefault();
        capture(canvas, e.pointerId);
        gesture.current = { kind: "pan", ...base };
        setPanning(true);
      } else if (e.button === 0 && noteEl && Number.isFinite(noteId)) {
        // 左键点便签 → 直接拖便签
        capture(canvas, e.pointerId);
        gesture.current = { kind: "pending", ...base };
        beginNoteDrag(noteId, noteEl, e.clientX, e.clientY);
      }
      return;
    }

    // 触摸
    capture(canvas, e.pointerId);
    if (noteEl && Number.isFinite(noteId)) {
      // 挂起：长按 2s 才拖便签；期间滑动超阈值 → 转平移
      const timer = window.setTimeout(() => {
        const g = gesture.current;
        if (!g || g.kind !== "pending") return;
        setArmedNote(noteId);
        navigator.vibrate?.(25);
        beginNoteDrag(noteId, noteEl, g.sx, g.sy);
      }, LONG_PRESS_MS);
      gesture.current = { kind: "pending", id: noteId, el: noteEl, ...base, timer };
    } else {
      gesture.current = { kind: "pan", ...base };
      setPanning(true);
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.sx;
    const dy = e.clientY - g.sy;
    if (Math.abs(dx) + Math.abs(dy) > 3) g.moved = true;

    if (g.kind === "pending") {
      // 触摸滑动超阈值（还没长按达成）→ 取消长按，改为平移底板
      if (Math.abs(dx) + Math.abs(dy) > TOUCH_MOVE_CANCEL) {
        if (g.timer) window.clearTimeout(g.timer);
        g.kind = "pan";
        g.sx = e.clientX;
        g.sy = e.clientY;
        g.panOx = pan.x;
        g.panOy = pan.y;
        setPanning(true);
      }
      return;
    }
    if (g.kind === "pan") {
      setPan({ x: g.panOx + dx, y: g.panOy + dy });
      return;
    }
    if (g.el) {
      g.el.style.transform = `translate(${g.nox + dx}px, ${g.noy + dy}px) rotate(${g.rot}deg)`;
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g) {
      setPanning(false);
      return;
    }
    if (g.timer) window.clearTimeout(g.timer);
    if (g.kind === "note" && g.id != null && g.el) {
      g.el.classList.remove("dragging");
      if (g.moved) {
        const nx = g.nox + (e.clientX - g.sx);
        const ny = g.noy + (e.clientY - g.sy);
        const id = g.id;
        const rot = g.rot;
        setPositions((prev) => {
          const n = new Map(prev);
          const p = n.get(id);
          if (p) n.set(id, { ...p, x: nx, y: ny, z: zTop.current, manual: true });
          return n;
        });
        if (isAdmin) {
          void fetch(`/api/board/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ x: Math.round(nx), y: Math.round(ny), rot }),
          })
            .then((res) => {
              if (res.status === 401) {
                setIsAdmin(false);
                setError("登录已过期，请重新登录后台");
              }
            })
            .catch(() => {});
        }
      }
    }
    gesture.current = null;
    setPanning(false);
    setArmedNote(null);
  };

  /* ---------------- 站长后台操作 ---------------- */
  const logout = async () => {
    try {
      await fetch("/api/board/admin/logout", { method: "POST" });
    } catch {}
    setIsAdmin(false);
  };

  const toggleHidden = async (id: number, hidden: boolean) => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`/api/board/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden }),
      });
      if (res.status === 401) {
        setIsAdmin(false);
        setError("登录已过期，请重新登录后台");
        return;
      }
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, hidden: hidden ? 1 : 0 } : m))
        );
      }
    } catch {
      setError("操作失败，请稍后再试");
    }
  };

  const deleteNote = async (id: number) => {
    if (!isAdmin) return;
    if (
      !window.confirm("永久删除这条留言？删除不可恢复；只想暂时下架请用「隐藏」。")
    )
      return;
    try {
      const res = await fetch(`/api/board/${id}`, { method: "DELETE" });
      if (res.status === 401) {
        setIsAdmin(false);
        setError("登录已过期，请重新登录后台");
        return;
      }
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        noteRefs.current.delete(id);
        setPositions((prev) => {
          const n = new Map(prev);
          n.delete(id);
          return n;
        });
      }
    } catch {
      setError("删除失败，请稍后再试");
    }
  };

  const resetNote = async (id: number) => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`/api/board/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset: true }),
      });
      if (res.status === 401) {
        setIsAdmin(false);
        setError("登录已过期，请重新登录后台");
        return;
      }
      if (res.ok) {
        // 清掉手动标记 → 下次布局回到瀑布流
        setPositions((prev) => {
          const n = new Map(prev);
          n.delete(id);
          return n;
        });
        setMessages((prev) => prev.slice());
      }
    } catch {
      setError("重置失败，请稍后再试");
    }
  };

  /* ---------------- 发表 ---------------- */
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const n = name.trim();
    const b = body.trim();
    if (!n || !b) {
      setError("名字和留言都要填哦");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: n,
          body: b,
          website: honeypotRef.current?.value || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "发表失败，请稍后再试");
        return;
      }
      if (data.message) {
        setMessages((prev) => [data.message as BoardMessage, ...prev]);
        setBody("");
      }
    } catch {
      setError("网络异常，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="board" className="board">
      <header className="board-head">
        <p className="closing-eyebrow">MESSAGES · 留言板</p>
        <p className="board-desc">
          路过留一句 · 发表即时贴上来 · 便签可以随意拖着摆
        </p>
      </header>

      {/* 站长编辑模式条 */}
      {isAdmin ? (
        <p className="board-admin-status">
          🔧 编辑模式 · 拖便签调整位置（自动保存）· 便签角上 ✕ 删除 / ⟲ 复位
          <button type="button" className="board-admin-exit" onClick={logout}>
            退出后台
          </button>
        </p>
      ) : null}

      {/* 发表条 */}
      <form className="board-form" onSubmit={submit}>
        <input
          className="board-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="你的称呼"
          maxLength={BOARD_LIMITS.NAME_MAX}
          aria-label="你的称呼"
        />
        <textarea
          className="board-textarea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="写点什么…（最多 500 字）"
          maxLength={BOARD_LIMITS.BODY_MAX}
          rows={2}
          aria-label="留言内容"
        />
        <input
          ref={honeypotRef}
          className="board-hp"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <div className="board-form-foot">
          <span className="board-count">
            {body.length}/{BOARD_LIMITS.BODY_MAX}
          </span>
          <button
            className="board-submit"
            type="submit"
            disabled={submitting || !name.trim() || !body.trim()}
          >
            {submitting ? "贴上…" : "贴上留言"}
          </button>
        </div>
        {error ? (
          <p className="board-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      {/* 网格底板（固定视窗）· 内含可平移的大画布世界层 */}
      <div
        className={`board-canvas${panning ? " board-canvas--panning" : ""}`}
        ref={canvasRef}
        style={{ backgroundPosition: `${pan.x}px ${pan.y}px` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onMouseDown={(e) => {
          if (e.button === 1) e.preventDefault(); // 抑制中键自动滚动
        }}
      >
        {!loaded ? (
          <p className="board-empty">加载中…</p>
        ) : messages.length === 0 ? (
          <p className="board-empty">还没有留言，来当第一个 👋</p>
        ) : (
          <div
            className="board-world"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px)`,
              minHeight: canvasH,
            }}
          >
            {messages.map((m) => {
              const p = positions.get(m.id);
            return (
              <article
                key={m.id}
                data-id={m.id}
                ref={(el) => {
                  if (el) noteRefs.current.set(m.id, el);
                  else noteRefs.current.delete(m.id);
                }}
                className={`board-note${armedNote === m.id ? " board-note--armed" : ""}${m.hidden ? " board-note--hidden" : ""}`}
                style={
                  p
                    ? {
                        transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`,
                        zIndex: p.z,
                      }
                    : { opacity: 0 }
                }
              >
                <span className="board-note-clip">
                  <BoardClip />
                </span>
                {isAdmin && m.hidden ? (
                  <span className="board-note-hidden-tag">已隐藏</span>
                ) : null}
                {isAdmin ? (
                  <div className="board-note-tools">
                    {p?.manual ? (
                      <button
                        type="button"
                        className="board-note-reset"
                        aria-label="复位到默认排布"
                        title="复位到默认排布"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => resetNote(m.id)}
                      >
                        ⟲
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="board-note-hide"
                      aria-label={m.hidden ? "取消隐藏" : "隐藏这条留言"}
                      title={m.hidden ? "取消隐藏（前台恢复显示）" : "隐藏（前台不再显示）"}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => toggleHidden(m.id, !m.hidden)}
                    >
                      {m.hidden ? "显" : "隐"}
                    </button>
                    <button
                      type="button"
                      className="board-note-del"
                      aria-label="永久删除这条留言"
                      title="永久删除（不可恢复）"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => deleteNote(m.id)}
                    >
                      ✕
                    </button>
                  </div>
                ) : null}
                <div className="board-note-head">
                  <span className="board-note-name">{m.name}</span>
                  <span className="board-note-time">{relTime(m.created_at)}</span>
                </div>
                <p className="board-note-body">{m.body}</p>
              </article>
            );
            })}
          </div>
        )}
      </div>

      {/* 站长登录入口（未登录时显示，进 /board-admin） */}
      {!isAdmin ? (
        <div className="board-admin-entry">
          <a href="/board-admin">🔧 站长登录</a>
        </div>
      ) : null}
    </section>
  );
}
