"use client";

/**
 * 第五幕：收尾 · Get in touch（v2 暗色 finale）
 * ---------------------------------------------------------------
 * 六幕叙事的最后一击。v2 调整（用户拍板）：
 *  - 全站唯一的暗色块收尾 + Bebas Neue 巨字标题（与 ABOUT/PORTFOLIO/OTHER 一致的字母 hover）
 *  - 主 CTA = AI 数字分身（全站招牌）：唤起右下角分身 + 4 个快捷提问 + JD 匹配
 *  - 副入口 = 邮箱 / GitHub / 简历；撤掉空寄语墙；留言板 #board 并入分身卡
 *
 * 唤起分身：分身组件(ai-avatar.tsx)自己管开合，这里用 window 自定义事件 "ai-avatar:open"
 *          跨组件唤起（可带 send 自动发一条问题）。
 *
 * 暗底导航：closing 进视口时双向 IO 写 body[data-section]="closing"，
 *          让 fixed nav 文字转米黄（见 globals.css 的 body[data-section=closing] 规则）。
 */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

import MessageBoard from "@/components/board/message-board";

// PixelBlast 背景着色器（reactbits · Three.js + postprocessing）。
// 动态导入 + ssr:false：代码分割 ~Three.js 到独立 chunk，且跳过预渲染（避免 WebGL/document 报错）。
// 只在 closing 进视口 + 非 reduced-motion 时才挂载（见下方 visible / motionOK 门控）。
const PixelBlast = dynamic(() => import("@/components/reactbits/PixelBlast"), {
  ssr: false,
});

// v2 巨字标题字母 hover cycle（复用 globals.css 的 @keyframes letter-fly-cycle）
const TITLE_CHARS = "GET IN TOUCH".split("");
const LETTER_CYCLE_MS = 650;

function handleLetterEnter(e: ReactMouseEvent<HTMLSpanElement>) {
  const el = e.currentTarget;
  if (el.classList.contains("cycling")) return;
  el.classList.add("cycling");
  window.setTimeout(() => el.classList.remove("cycling"), LETTER_CYCLE_MS + 20);
}

// 唤起右下角 AI 分身（可选 send：唤起后自动发送的一条问题）
function openAgent(send?: string) {
  window.dispatchEvent(
    new CustomEvent("ai-avatar:open", { detail: send ? { send } : {} })
  );
}

// 与分身面板内的预设问题一致（点击 → 唤起分身并自动发送）
const QUICK_ASKS = [
  "他的核心优势是什么？",
  "他为什么从规划转 AI？",
  "他做过哪些 AI 项目？",
  "帮我做一个 JD 匹配分析",
];

type ContactLink = {
  label: string;
  value: string;
  href: string;
  external?: boolean;
};

const CONTACTS: ContactLink[] = [
  {
    label: "EMAIL",
    value: "tmml1770998584@163.com",
    href: "mailto:tmml1770998584@163.com",
  },
  {
    label: "GITHUB",
    value: "github.com/ChenYanjun-hub",
    href: "https://github.com/ChenYanjun-hub",
    external: true,
  },
  {
    label: "RESUME",
    // TODO【负责人】：把简历 PDF 放到 web/public/resume/resume.pdf（没放前点击会 404）
    // 已与负责人确认：这里只提供脱敏版公开简历（去手机号/住址/照片等），
    // 手机号/微信仍遵循下方"邮件联系后本人确认交换"的策略，不因此按钮被绕过。
    value: "脱敏版公开简历（PDF）",
    href: "/resume/resume.pdf",
    external: true,
  },
];

export default function Closing() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  // 背景着色器门控：默认关，mount 后若非 reduced-motion 才开（无障碍 + 避免 SSR 不一致）
  const [motionOK, setMotionOK] = useState(false);

  useEffect(() => {
    setMotionOK(
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  // 入场动画一次性触发
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  // 双向 IO：closing 进视口时写 body[data-section]="closing" → fixed nav 文字转米黄（暗底可读）
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            document.body.dataset.section = "closing";
          } else if (document.body.dataset.section === "closing") {
            delete document.body.dataset.section;
          }
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(node);
    return () => {
      obs.disconnect();
      if (document.body.dataset.section === "closing") {
        delete document.body.dataset.section;
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className={`closing${visible ? " visible" : ""}`}
    >
      {/* 背景着色器（PixelBlast）· 在内容之下（z-index 0）。
       *  仅在 closing 进视口（visible）+ 非 reduced-motion（motionOK）时挂载——
       *  Three.js chunk 滚到这一幕才加载；autoPauseOffscreen 再滚走时自动暂停。 */}
      <div className="closing-bg" aria-hidden>
        {visible && motionOK ? (
          <PixelBlast
            variant="square"
            color="#d8552e"
            pixelSize={5}
            patternScale={2.6}
            patternDensity={0.8}
            speed={0.4}
            edgeFade={0.3}
            enableRipples
            rippleSpeed={0.3}
            transparent
            autoPauseOffscreen
          />
        ) : null}
      </div>

      {/* 装饰：左下角半调网点 */}
      <span className="closing-halftone" aria-hidden />

      {/* 巨字标题区 */}
      <header className="closing-head">
        <p className="closing-eyebrow">CONTACT · 下一步</p>
        <h2 className="closing-title" aria-label="GET IN TOUCH">
          {TITLE_CHARS.map((ch, i) =>
            ch === " " ? (
              <span key={i} aria-hidden="true" className="letter-space">
                &nbsp;
              </span>
            ) : (
              <span
                key={i}
                aria-hidden="true"
                className="letter"
                onMouseEnter={handleLetterEnter}
              >
                {ch}
              </span>
            )
          )}
        </h2>
        <p className="closing-subtitle">
          不确定他合不合适？先把 JD 发给他的 AI 分身，30 秒看匹配度。
        </p>
      </header>

      <div className="closing-grid">
        {/* 主 CTA · AI 分身 */}
        <div className="closing-agent">
          <span className="closing-agent-glow" aria-hidden />
          <p className="closing-agent-eyebrow">★ 最快的方式</p>
          <h3 className="closing-agent-title">和他的 AI 分身聊</h3>
          <p className="closing-agent-desc">
            基于真实资料回答项目、能力、转型相关的问题；也能把你的招聘 JD
            发进来，做一份诚实的匹配分析——高亮匹配点，也直说成长项。
          </p>
          <button
            type="button"
            className="closing-agent-cta"
            onClick={() => openAgent()}
          >
            唤起 AI 分身
            <span className="closing-agent-cta-arrow" aria-hidden>
              →
            </span>
          </button>
          <div className="closing-agent-chips">
            {QUICK_ASKS.map((q) => (
              <button
                key={q}
                type="button"
                className="closing-agent-chip"
                onClick={() => openAgent(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* 副入口 · 直接联系 */}
        <aside className="closing-direct">
          <p className="closing-direct-callout">
            如果你需要一个<em>会动手的 AI 产品经理</em>，欢迎把他招进你的团队。
          </p>
          <ul className="closing-contact-list">
            {CONTACTS.map((c) => (
              <li key={c.label} className="closing-contact-row">
                <span className="closing-contact-label">{c.label}</span>
                <a
                  className="closing-contact-link"
                  href={c.href}
                  {...(c.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {c.value}
                  <span className="closing-contact-arrow" aria-hidden>
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="closing-privacy-note">
            手机号 / 微信不直接公开，邮件联系后由本人确认交换。
          </p>
        </aside>
      </div>

      {/* 留言板（id="board" 在组件内）· 联系区之后、页尾之前 */}
      <MessageBoard />

      <footer className="closing-footer">
        <p className="closing-thanks">看到这里 · 谢谢你给我的这几分钟</p>
        <p className="closing-meta">
          © 2026 陈彦均 Yanjun Chen · 本站由本人独立设计与开发
        </p>
      </footer>
    </section>
  );
}
