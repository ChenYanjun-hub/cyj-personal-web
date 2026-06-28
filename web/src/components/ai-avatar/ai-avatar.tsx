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

type DisplayMessage = ChatMessage & { id: string; image?: string };

// 客户端压缩 JD 截图：长边限到 1400px，JPEG 0.85，控制上传体积又保文字清晰
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1400;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        const r = Math.min(MAX / width, MAX / height);
        width = Math.round(width * r);
        height = Math.round(height * r);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("当前浏览器不支持图片处理"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片读取失败，请换一张"));
    };
    img.src = url;
  });
}

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

// 首访引导气泡 · 三句循环打字机（第二句固定）
const HINT_LINES = [
  "嗨，我是彦均的 AI 分身 👋",
  "威风的龙！到！",
  "点我聊聊 · 项目 / 能力 / JD 匹配都能问",
];
const HINT_KEY = "ai-avatar-hint-dismissed";

export default function AiAvatar() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  // 暂存的 JD 图片（data URL）· 发送时随消息带上，走视觉模型匹配
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickImage = async (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件（JD 截图）");
      return;
    }
    try {
      const dataUrl = await compressImage(file);
      setPendingImage(dataUrl);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "图片处理失败");
    }
  };

  // 首访引导气泡：默认隐藏（SSR 无 localStorage），mount 后若未关闭过则显示
  const [hintDismissed, setHintDismissed] = useState(true);
  const [hintText, setHintText] = useState("");

  useEffect(() => {
    try {
      if (!localStorage.getItem(HINT_KEY)) setHintDismissed(false);
    } catch {
      // 隐私模式等读不到 localStorage：保持隐藏，不打扰
    }
  }, []);

  const dismissHint = () => {
    setHintDismissed(true);
    try {
      localStorage.setItem(HINT_KEY, "1");
    } catch {
      // 写不进就算了，至少本次会话不再显示
    }
  };

  // 气泡只在「未关闭 + 面板关着」时出现
  const hintVisible = !hintDismissed && !isOpen;

  // 打字机：逐字打 → 停顿 → 删除 → 下一句，循环
  useEffect(() => {
    if (!hintVisible) {
      setHintText("");
      return;
    }
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let line = 0;
    let char = 0;
    let mode: "type" | "hold" | "del" = "type";
    let timer: number;

    if (reduce) {
      // 减少动效：不逐字，整句循环展示
      setHintText(HINT_LINES[0]);
      let i = 0;
      const cycle = () => {
        i = (i + 1) % HINT_LINES.length;
        setHintText(HINT_LINES[i]);
        timer = window.setTimeout(cycle, 2600);
      };
      timer = window.setTimeout(cycle, 2600);
      return () => window.clearTimeout(timer);
    }

    const tick = () => {
      const full = HINT_LINES[line];
      if (mode === "type") {
        char += 1;
        setHintText(full.slice(0, char));
        if (char >= full.length) {
          mode = "hold";
          timer = window.setTimeout(tick, 2200);
        } else {
          timer = window.setTimeout(tick, 115);
        }
      } else if (mode === "hold") {
        mode = "del";
        timer = window.setTimeout(tick, 60);
      } else {
        char -= 1;
        setHintText(full.slice(0, Math.max(char, 0)));
        if (char <= 0) {
          line = (line + 1) % HINT_LINES.length;
          mode = "type";
          timer = window.setTimeout(tick, 420);
        } else {
          timer = window.setTimeout(tick, 55);
        }
      }
    };
    timer = window.setTimeout(tick, 480);
    return () => window.clearTimeout(timer);
  }, [hintVisible]);

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
    const image = pendingImage;
    if ((!trimmed && !image) || streaming) return;
    if (trimmed.length > CHAT_LIMITS.MAX_MESSAGE_LENGTH) {
      setError(`单条消息不能超过 ${CHAT_LIMITS.MAX_MESSAGE_LENGTH} 字`);
      return;
    }

    setError(null);
    setInput("");
    setPendingImage(null);

    const userId = `u-${Date.now()}`;
    const assistantId = `a-${Date.now()}`;

    const userMsg: DisplayMessage = {
      id: userId,
      role: "user",
      content:
        trimmed ||
        (image ? "（上传了一张招聘 JD 截图，请帮我做岗位匹配）" : ""),
      image: image ?? undefined,
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
      // 服务端历史用真实文字（不是展示用的占位）；图片单独放 body.image
      const serverUserMsg: DisplayMessage = {
        id: userId,
        role: "user",
        content: trimmed,
      };
      const historyForServer: ChatMessage[] = [...messages, serverUserMsg]
        .filter((m) => m.id !== "welcome")
        .slice(-CHAT_LIMITS.MAX_HISTORY)
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyForServer,
          ...(image ? { image } : {}),
        }),
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
      {/* 首访引导气泡：打字机三句循环 · 点气泡开对话 · × 关闭后不再出现 */}
      {hintVisible && (
        <div
          className="ai-avatar-hint"
          role="button"
          tabIndex={0}
          aria-label="打开 AI 分身咨询"
          onClick={() => {
            setIsOpen(true);
            dismissHint();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen(true);
              dismissHint();
            }
          }}
        >
          <button
            type="button"
            className="ai-avatar-hint-close"
            aria-label="不再提示"
            onClick={(e) => {
              e.stopPropagation();
              dismissHint();
            }}
          >
            ×
          </button>
          <span className="ai-avatar-hint-text">
            {hintText}
            <span className="ai-avatar-hint-caret" aria-hidden />
          </span>
        </div>
      )}

      {/* 右下角悬浮吉祥物（点击展开/收起 chat） */}
      <button
        type="button"
        className={`ai-avatar-petbtn${isOpen ? " open" : ""}`}
        aria-label={isOpen ? "关闭 AI 分身" : "打开 AI 分身"}
        aria-expanded={isOpen}
        onClick={() =>
          setIsOpen((v) => {
            const next = !v;
            if (next) dismissHint();
            return next;
          })
        }
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
                {m.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.image}
                    alt="上传的招聘 JD 截图"
                    className="ai-avatar-msg-img"
                  />
                )}
                {(m.content || (streaming && m.role === "assistant")) && (
                  <div className="ai-avatar-msg-text">
                    {m.content ||
                      (streaming && m.role === "assistant" ? "…" : "")}
                  </div>
                )}
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

          {/* 待发送的 JD 图片预览 */}
          {pendingImage && (
            <div className="ai-avatar-attach">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pendingImage}
                alt="待发送的 JD 截图"
                className="ai-avatar-attach-img"
              />
              <span className="ai-avatar-attach-tip">
                岗位 JD 已就绪 · 发送后做匹配分析
              </span>
              <button
                type="button"
                className="ai-avatar-attach-remove"
                aria-label="移除图片"
                onClick={() => setPendingImage(null)}
              >
                ×
              </button>
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
            {/* 隐藏文件输入 + 上传按钮（传 JD 截图） */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                pickImage(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              className="ai-avatar-upload"
              aria-label="上传招聘 JD 图片"
              title="上传招聘 JD 图片做匹配"
              onClick={() => fileInputRef.current?.click()}
              disabled={streaming}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </button>
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
              disabled={streaming || (!input.trim() && !pendingImage)}
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
