"use client";

/**
 * 留言板 · 网格底板 + 可拖动便签（收尾幕内，id="board"）
 * ---------------------------------------------------------------
 * 风格参考：网格纸底板 + 手绘夹子夹住的便签帖子，可随意拖动重新摆放。
 *  - GET /api/board 拉列表；POST 发表后即时变成一张新便签贴上来
 *  - 便签绝对定位（transform translate + rotate），指针拖拽时直接改 DOM transform（流畅），落下提交到 state
 *  - 拖拽位置仅本会话客户端，不入库（每位访客自己摆，不互相影响）
 *  - 防刷靠后端；用户内容 React {text} 渲染（自动转义），换行 pre-wrap 保留
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, PointerEvent as ReactPointerEvent } from "react";
import { BOARD_LIMITS } from "@/lib/board/limits";

type BoardMessage = {
  id: number;
  name: string;
  body: string;
  created_at: number;
};

type Pos = { x: number; y: number; rot: number; z: number };

const NOTE_W = 210;
const NOTE_H = 172;
const GAP_X = 30;
const GAP_Y = 42;
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
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 站长管理模式：token 存 localStorage（仅本机），#board-admin 触发输入
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminEntry, setAdminEntry] = useState(false);
  const [tokenInput, setTokenInput] = useState("");

  const honeypotRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const zTop = useRef(1);
  const drag = useRef<{
    el: HTMLElement;
    id: number;
    sx: number;
    sy: number;
    ox: number;
    oy: number;
    rot: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/board")
      .then((r) => r.json())
      .then((d) => {
        if (alive && Array.isArray(d.messages)) setMessages(d.messages);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  // 管理模式：读已存 token + 监听 #board-admin（站长访问 站点/#board-admin 唤出输入框）
  useEffect(() => {
    try {
      setAdminToken(localStorage.getItem("board_admin_token"));
    } catch {}
    const checkHash = () =>
      setAdminEntry(window.location.hash === "#board-admin");
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  // 给还没有位置的便签按网格散布分配初始位置（已拖动过的保留）
  const layout = useCallback(() => {
    const canvas = canvasRef.current;
    const W = canvas?.clientWidth || 820;
    const cols = Math.max(1, Math.floor((W - PAD * 2 + GAP_X) / (NOTE_W + GAP_X)));
    setPositions((prev) => {
      const next = new Map(prev);
      let i = 0;
      let maxBottom = 0;
      for (const m of messages) {
        let p = next.get(m.id);
        if (!p) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const jx = (rand(m.id) * 2 - 1) * 16;
          const jy = (rand(m.id + 9) * 2 - 1) * 14;
          const rot = (rand(m.id + 3) * 2 - 1) * 4.5;
          p = {
            x: PAD + col * (NOTE_W + GAP_X) + jx,
            y: PAD + row * (NOTE_H + GAP_Y) + jy,
            rot,
            z: ++zTop.current,
          };
          next.set(m.id, p);
        }
        maxBottom = Math.max(maxBottom, p.y + NOTE_H);
        i++;
      }
      setCanvasH(Math.max(480, maxBottom + PAD));
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

  /* ---------------- 拖拽 ---------------- */
  const onDown = (e: ReactPointerEvent<HTMLElement>, id: number) => {
    const p = positions.get(id);
    if (!p) return;
    const el = e.currentTarget;
    drag.current = {
      el,
      id,
      sx: e.clientX,
      sy: e.clientY,
      ox: p.x,
      oy: p.y,
      rot: p.rot,
      moved: false,
    };
    zTop.current += 1;
    el.style.zIndex = String(zTop.current);
    el.classList.add("dragging");
    el.setPointerCapture?.(e.pointerId);
  };

  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
    d.el.style.transform = `translate(${d.ox + dx}px, ${d.oy + dy}px) rotate(${d.rot}deg)`;
  };

  const onUp = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d) return;
    d.el.classList.remove("dragging");
    if (d.moved) {
      const dx = e.clientX - d.sx;
      const dy = e.clientY - d.sy;
      setPositions((prev) => {
        const n = new Map(prev);
        const p = n.get(d.id);
        if (p) n.set(d.id, { ...p, x: d.ox + dx, y: d.oy + dy, z: zTop.current });
        return n;
      });
    }
    drag.current = null;
  };

  /* ---------------- 站长管理 ---------------- */
  const enterAdmin = (e: FormEvent) => {
    e.preventDefault();
    const t = tokenInput.trim();
    if (!t) return;
    try {
      localStorage.setItem("board_admin_token", t);
    } catch {}
    setAdminToken(t);
    setAdminEntry(false);
    setTokenInput("");
    setError(null);
    // 清掉 #board-admin，避免分享链接带出
    if (window.location.hash === "#board-admin") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  const exitAdmin = () => {
    try {
      localStorage.removeItem("board_admin_token");
    } catch {}
    setAdminToken(null);
  };

  const deleteNote = async (id: number) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/board/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 401) {
        exitAdmin();
        setError("管理 token 无效，已退出管理模式");
        return;
      }
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
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

      {/* 站长管理条：#board-admin 唤出输入框；已登录显示状态 + 退出 */}
      {adminEntry ? (
        <form className="board-admin" onSubmit={enterAdmin}>
          <input
            className="board-input"
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="管理 token"
            aria-label="管理 token"
            autoComplete="off"
          />
          <button className="board-submit" type="submit">
            进入管理
          </button>
        </form>
      ) : adminToken ? (
        <p className="board-admin-status">
          🔑 管理模式 · 点便签右上角 ✕ 删除
          <button
            type="button"
            className="board-admin-exit"
            onClick={exitAdmin}
          >
            退出管理
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

      {/* 网格底板 · 可拖动便签 */}
      <div
        className="board-canvas"
        ref={canvasRef}
        style={{ height: canvasH }}
      >
        {!loaded ? (
          <p className="board-empty">加载中…</p>
        ) : messages.length === 0 ? (
          <p className="board-empty">还没有留言，来当第一个 👋</p>
        ) : (
          messages.map((m) => {
            const p = positions.get(m.id);
            return (
              <article
                key={m.id}
                className="board-note"
                style={
                  p
                    ? {
                        transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`,
                        zIndex: p.z,
                      }
                    : { opacity: 0 }
                }
                onPointerDown={(e) => onDown(e, m.id)}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
              >
                <span className="board-note-clip">
                  <BoardClip />
                </span>
                {adminToken ? (
                  <button
                    type="button"
                    className="board-note-del"
                    aria-label="删除这条留言"
                    title="删除"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => deleteNote(m.id)}
                  >
                    ✕
                  </button>
                ) : null}
                <div className="board-note-head">
                  <span className="board-note-name">{m.name}</span>
                  <span className="board-note-time">{relTime(m.created_at)}</span>
                </div>
                <p className="board-note-body">{m.body}</p>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
