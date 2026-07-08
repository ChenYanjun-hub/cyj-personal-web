"use client";

/**
 * /board-admin · 留言板站长后台登录页
 * ---------------------------------------------------------------
 * 邮箱 + 密码 → POST /api/board/admin/login 换 httpOnly 会话 cookie。
 * 登录成功跳回 /#board（留言板本体自动进入编辑模式：拖便签存位置 / 删除）。
 */

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

export default function BoardAdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [already, setAlready] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/board/admin/session")
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.admin) setAlready(true);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/board/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "登录失败，请稍后再试");
        return;
      }
      window.location.href = "/#board";
    } catch {
      setError("网络异常，请稍后再试");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="admin-login">
      <div className="admin-login-card">
        <p className="admin-login-eyebrow">MESSAGE BOARD · 站长后台</p>
        <h1 className="admin-login-title">登录编辑留言板</h1>
        {already ? (
          <p className="admin-login-hint">
            你已登录。
            <a href="/#board">回到留言板编辑 →</a>
          </p>
        ) : (
          <form className="admin-login-form" onSubmit={submit}>
            <label className="admin-login-label">
              邮箱
              <input
                className="admin-login-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="你的登录邮箱"
                autoComplete="username"
                required
              />
            </label>
            <label className="admin-login-label">
              密码
              <input
                className="admin-login-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="登录密码"
                autoComplete="current-password"
                required
              />
            </label>
            {error ? (
              <p className="admin-login-error" role="alert">
                {error}
              </p>
            ) : null}
            <button
              className="admin-login-submit"
              type="submit"
              disabled={busy || !email.trim() || !password}
            >
              {busy ? "登录中…" : "登录"}
            </button>
          </form>
        )}
        <a className="admin-login-back" href="/#board">
          ← 返回留言板
        </a>
      </div>
    </main>
  );
}
