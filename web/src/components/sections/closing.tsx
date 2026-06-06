"use client";

/**
 * 第五幕：收尾 · 背书与联系
 * ---------------------------------------------------------------
 * 作用（PROJECT_GUIDE 第 6 节）：六幕叙事的最后一击 ——
 *  - 用真实寄语为前面五幕背书（精选 · 不开放评论防垃圾）
 *  - 给 HR 明确的下一步动作（CTA + 联系方式）
 *
 * 三构成（PROJECT_GUIDE 原方案）：
 *  1. TESTIMONIALS  精选寄语墙（主）· 真实有分量
 *  2. GET IN TOUCH  联系方式 + 召唤语
 *  3. (V2) 折叠开放留言（Supabase 后端 · V1 不做）
 *
 * 视觉延续 About Me / Portfolio / Life：黑白单色 / 全大写英文板块标题 / hairline。
 */

import { useEffect, useRef, useState } from "react";

/* ---------------- 数据 ---------------- */

type Testimonial = {
  id: string;
  /** 寄语正文 — 待负责人提前求人时为 null */
  quote: string | null;
  /** 寄语人姓名 / 称呼 */
  from: string | null;
  /** 关系（如：前同事 · 项目负责人 / 师长 · 同济规划院总工 / 等） */
  relation: string | null;
};

/** TODO【负责人】：提前向前同事/师长/合作者收集 3-5 句真实寄语 */
const TESTIMONIALS: Testimonial[] = [
  { id: "t1", quote: null, from: null, relation: null },
  { id: "t2", quote: null, from: null, relation: null },
  { id: "t3", quote: null, from: null, relation: null },
];

type ContactLink = {
  label: string;
  value: string;
  href: string;
  /** 是否在新标签页打开 */
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
    // TODO【负责人】：把简历 PDF 放到 web/public/resume.pdf
    value: "下载简历（PDF）",
    href: "/resume.pdf",
    external: true,
  },
];

/* ---------------- 主组件 ---------------- */

export default function Closing() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

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

  return (
    <section
      ref={sectionRef}
      id="contact"
      className={`closing${visible ? " visible" : ""}`}
    >
      {/* 章节大标题 */}
      <h2 className="closing-title">Get in touch</h2>
      <p className="closing-subtitle">让我们认识</p>

      {/* ===== TESTIMONIALS 板块：精选寄语墙 ===== */}
      <section className="closing-block closing-block-testimonials">
        <header className="closing-block-header">
          <h3 className="closing-block-title">TESTIMONIALS</h3>
          <p className="closing-block-desc">
            精选寄语 · 真实评价（非开放评论）
          </p>
        </header>

        <ul className="closing-testimonial-list">
          {TESTIMONIALS.map((t) => (
            <li
              key={t.id}
              className={`closing-testimonial${t.quote ? "" : " closing-testimonial-empty"}`}
            >
              <blockquote className="closing-quote">
                {t.quote ?? "等一句话，从某位前同事 / 师长 / 合作者处来"}
              </blockquote>
              <cite className="closing-cite">
                {t.from ? `— ${t.from}` : "— 待负责人补"}
                {t.relation && (
                  <span className="closing-cite-relation"> · {t.relation}</span>
                )}
              </cite>
            </li>
          ))}
        </ul>
      </section>

      {/* ===== GET IN TOUCH 板块：联系方式 + 召唤语 ===== */}
      <section className="closing-block closing-block-contact">
        <header className="closing-block-header">
          <h3 className="closing-block-title">GET IN TOUCH</h3>
          <p className="closing-block-desc">最直接的下一步</p>
        </header>

        {/* 召唤语（PROJECT_GUIDE 第 228 行原话） */}
        <p className="closing-callout">
          如果你在找一个 <em>会动手的 AI 产品经理</em>
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

        {/* 隐私边界提示（PROJECT_GUIDE 第 227 行：手机号/微信由分身做中介） */}
        <p className="closing-privacy-note">
          手机号 / 微信不直接公开，请通过邮箱联系后由本人确认交换。
        </p>
      </section>

      {/* ===== V2 折叠留言入口（占位） ===== */}
      <section id="board" className="closing-block closing-block-board">
        <header className="closing-block-header">
          <h3 className="closing-block-title">MESSAGES</h3>
          <p className="closing-block-desc">
            也欢迎留下你的建议 · V2 上线
          </p>
        </header>

        <div className="closing-board-placeholder">
          <p>
            留言入口将在 V2 阶段接入（Supabase 后端 + 经本站中转，保国内可达）。
            <br />
            目前请直接邮件或 GitHub。
          </p>
        </div>
      </section>

      {/* 最后一抹小字 */}
      <footer className="closing-footer">
        <p className="closing-thanks">
          看到这里 · 感谢你给我的 30 秒
        </p>
        <p className="closing-meta">
          © 2026 陈彦均 · 用 Claude Code vibe coding 自己打的
        </p>
      </footer>
    </section>
  );
}
