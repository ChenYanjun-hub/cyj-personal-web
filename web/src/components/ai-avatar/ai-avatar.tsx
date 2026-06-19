"use client";

/**
 * AI 数字分身 · 悬浮组件（右下角泡泡 + 展开 chat 面板）
 * ---------------------------------------------------------------
 * 流程：
 *  1. 右下角泡泡按钮 · 点击展开/收起
 *  2. 展开后展示欢迎语 + 4 个预设问题
 *  3. 用户发送消息 → fetch /api/chat → 流式 reader 把 delta append 到最后一条 assistant 消息
 *  4. 错误时显示横幅，把空 assistant 占位移除
 *
 * 设计延续整站：黑白单色 + accent 用在泡泡和强调元素。
 * 移动端：面板占视口下半部分。
 */

import { useEffect, useRef, useState } from "react";
import {
  CHAT_LIMITS,
  type ChatErrorPayload,
  type ChatMessage,
} from "@/lib/ai-avatar/types";
import ClaudePet, { type PetState } from "./claude-pet";

type DisplayMessage = ChatMessage & { id: string };

const PRESET_QUESTIONS = [
  "他的核心优势是什么？",
  "他为什么从规划转 AI？",
  "他做过哪些 AI 项目？",
  "帮我做一个 JD 匹配分析",
];

const WELCOME: DisplayMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi，我是陈彦均的 AI 分身。关于他的项目、能力、转型故事和兴趣爱好，你都可以问我。也可以把招聘 JD 发给我，看看他和这个岗位有多匹配。",
};

export default function AiAvatar() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);

  // 吉祥物状态接真实事件：回答中→说话 / 失败→出错 / 悬停→打招呼 / 默认→待机
  const petState: PetState = streaming
    ? "talk"
    : error
      ? "error"
      : hovering
        ? "hello"
        : "idle";

  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 新消息进来自动滚到底
  useEffect(() => {
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, isOpen]);

  // ESC 关闭面板
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // 组件卸载时取消正在进行的请求
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    if (trimmed.length > CHAT_LIMITS.MAX_MESSAGE_LENGTH) {
      setError(`单条消息不能超过 ${CHAT_LIMITS.MAX_MESSAGE_LENGTH} 字`);
      return;
    }

    setError(null);
    setInput("");

    const userId = `u-${Date.now()}`;
    const assistantId = `a-${Date.now()}`;

    const userMsg: DisplayMessage = {
      id: userId,
      role: "user",
      content: trimmed,
    };
    const assistantPlaceholder: DisplayMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
    };

    // 立刻插入 user + 空 assistant 占位
    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // 后端只接受 user/assistant 历史，过滤掉前端 welcome 消息（不算真实对话）
      // 只发最近 MAX_HISTORY 条控制 token
      const historyForServer: ChatMessage[] = [...messages, userMsg]
        .filter((m) => m.id !== "welcome")
        .slice(-CHAT_LIMITS.MAX_HISTORY)
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyForServer }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let msg = "AI 服务暂时不可用，请稍后再试";
        try {
          const j: ChatErrorPayload = await res.json();
          if (j?.message) msg = j.message;
        } catch {
          // 解不出 JSON 就用默认提示
        }
        throw new Error(msg);
      }
      if (!res.body) throw new Error("无响应流");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m,
          ),
        );
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      const msg = err instanceof Error ? err.message : "未知错误";
      setError(msg);
      // 把空的 assistant 占位移除（避免留一条空消息）
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  // 外部唤起：收尾幕 CTA 通过 window 事件 "ai-avatar:open" 打开面板，
  // 可带 detail.send 自动发送一条问题。用 latest-ref 拿到最新 send（含最新历史）。
  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  });
  useEffect(() => {
    const onOpen = (e: Event) => {
      setIsOpen(true);
      const detail = (e as CustomEvent).detail as { send?: string } | undefined;
      if (detail?.send) {
        window.setTimeout(() => sendRef.current(detail.send as string), 80);
      }
    };
    window.addEventListener("ai-avatar:open", onOpen);
    return () => window.removeEventListener("ai-avatar:open", onOpen);
  }, []);

  const showPresets = messages.length <= 1 && !streaming;

  return (
    <>
      {/* 右下角悬浮吉祥物（点击展开/收起 chat） */}
      <button
        type="button"
        className={`ai-avatar-petbtn${isOpen ? " open" : ""}`}
        aria-label={isOpen ? "关闭 AI 分身" : "打开 AI 分身"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <ClaudePet state={petState} />
      </button>

      {/* Chat 面板 */}
      {isOpen && (
        <div
          className="ai-avatar-panel"
          role="dialog"
          aria-label="陈彦均 AI 分身"
        >
          {/* 顶部标识 */}
          <header className="ai-avatar-header">
            <div className="ai-avatar-identity">
              <span className="ai-avatar-name">陈彦均 · AI 分身</span>
              <span className="ai-avatar-tag">
                基于真实资料 · 答问 + JD 匹配
              </span>
            </div>
            <button
              type="button"
              className="ai-avatar-close"
              aria-label="关闭"
              onClick={() => setIsOpen(false)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </header>

          {/* 消息流 */}
          <div ref={listRef} className="ai-avatar-list">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`ai-avatar-msg ai-avatar-msg-${m.role}`}
              >
                <div className="ai-avatar-msg-text">
                  {m.content ||
                    (streaming && m.role === "assistant" ? "…" : "")}
                </div>
              </div>
            ))}
            {error && (
              <div className="ai-avatar-error" role="alert">
                {error}
              </div>
            )}
          </div>

          {/* 预设问题（只在初次显示，发过消息后隐藏） */}
          {showPresets && (
            <div className="ai-avatar-presets">
              {PRESET_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="ai-avatar-preset"
                  onClick={() => send(q)}
                  disabled={streaming}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* 输入区 */}
          <form
            className="ai-avatar-form"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                // Enter 发送，Shift+Enter 换行
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={
                streaming
                  ? "正在回答中…"
                  : "问点什么 · Enter 发送，Shift+Enter 换行"
              }
              rows={2}
              maxLength={CHAT_LIMITS.MAX_MESSAGE_LENGTH}
              disabled={streaming}
              className="ai-avatar-input"
              aria-label="输入消息"
            />
            <button
              type="submit"
              className="ai-avatar-send"
              disabled={streaming || !input.trim()}
              aria-label="发送"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
