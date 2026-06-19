"use client";

/**
 * 项目案例详情页模板（/works/ai/<project> 共用）
 * ---------------------------------------------------------------
 * 风格参考：Andy Reff 案例页（用户提供 3 张截图）
 *  - Hero：色调渐变 + 巨字项目名 + 类别 mono 行 + 一段简介
 *  - 正文双栏：左侧 sticky 元信息（ROLE / TEAM / DURATION / TYPE），
 *    右侧六节内容（客户问题 / 之前 / 我做了什么 / 之后 / 商业价值 / 未来目标）
 *  - 每节：mono 英文 eyebrow + 中文大标题 + 段落 / 圆点列表
 *
 * 数据驱动：页面文件只供给 CaseStudyData，布局与动效全在这里。
 * 知识库未填的内容用 tbd 字段占位（页面上呈现为虚线框待补条）。
 *
 * 为什么是 Client Component：IntersectionObserver 分节入场。
 */

import Link from "next/link";
import { useEffect, useRef } from "react";

import WorksNav from "@/components/works/works-nav";
import { AI_CASES } from "@/components/works/ai-cases";

/* ---------------- 数据类型 ---------------- */

export type CaseMeta = {
  /** mono 大写英文标签（ROLE / TEAM / DURATION / TYPE …） */
  label: string;
  value: string;
};

export type CaseSection = {
  id: string;
  /** mono 英文 eyebrow（CUSTOMER PROBLEM …） */
  eyebrow: string;
  /** 中文大标题（客户问题 …） */
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  /** bullets 之后的收尾段落（如 B/C 端说明、诚实声明） */
  paragraphsAfter?: string[];
  /** 知识库未填内容的待补占位条（虚线框 muted 呈现） */
  tbd?: string;
};

export type CaseAward = {
  /** 章面年份（如 "2026"） */
  year: string;
  /** 章心大字（如 "获奖"） */
  seal: string;
  /** 章旁说明行（如 ["中国国际大学生创新大赛", "研究生组 · 获奖项目"]） */
  lines: string[];
};

export type CaseStudyData = {
  /** 路由 slug · 对应 ai-cases.ts 里的条目，用于算上一个/下一个项目 */
  slug: string;
  /** hero 顶部类别 mono 行（如 "AI 全栈 · BTOBTOC · RAG"） */
  category: string;
  title: string;
  titleEn: string;
  intro: string;
  /** hero 渐变两端色（沿用列表页该项目 tone） */
  tone: [string, string];
  /** hero 背景 Bebas 水印词 */
  mark: string;
  /** 获奖奖章（印章式 · hero 右下角，窄屏落到简介下方） */
  award?: CaseAward;
  meta: CaseMeta[];
  sections: CaseSection[];
  /** 页尾返回链接 */
  backHref: string;
  backLabel: string;
};

/* ---------------- Component ---------------- */

export default function CaseStudy({ data }: { data: CaseStudyData }) {
  const bodyRef = useRef<HTMLDivElement>(null);

  // 分节入场：进入视口加 .in（一次性）
  useEffect(() => {
    const root = bodyRef.current;
    if (!root) return;
    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>(".case-section")
    );
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 }
    );
    nodes.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, []);

  // 上一个 / 下一个项目（环形）。n=2 时 prev===next → 只显一张"下一个"卡，避免重复
  const idx = AI_CASES.findIndex((c) => c.slug === data.slug);
  const n = AI_CASES.length;
  const prev = idx >= 0 && n > 1 ? AI_CASES[(idx - 1 + n) % n] : null;
  const next = idx >= 0 && n > 1 ? AI_CASES[(idx + 1) % n] : null;
  const single = !!prev && !!next && prev.slug === next.slug;

  return (
    <main
      className="case"
      style={
        {
          "--tone-a": data.tone[0],
          "--tone-b": data.tone[1],
        } as React.CSSProperties
      }
    >
      <WorksNav />

      {/* Hero：渐变底 + 水印词 + 左下内容组（参考图 1 的构图） */}
      <header className="case-hero">
        <span className="case-hero-mark" aria-hidden>
          {data.mark}
        </span>
        <div className="case-hero-content">
          <p className="case-hero-category">{data.category}</p>
          <h1 className="case-hero-title">{data.title}</h1>
          <p className="case-hero-en">{data.titleEn}</p>
          <p className="case-hero-intro">{data.intro}</p>
        </div>

        {/* 获奖奖章 · 印章式（双环 + 章心大字 + 说明行） */}
        {data.award ? (
          <div
            className="case-award"
            aria-label={`${data.award.year} ${data.award.lines.join(" ")}`}
          >
            <span className="case-award-medal" aria-hidden>
              <span className="case-award-year">{data.award.year}</span>
              <span className="case-award-word">{data.award.seal}</span>
            </span>
            <span className="case-award-text">
              {data.award.lines.map((line, i) => (
                <span key={i} className="case-award-line">
                  {line}
                </span>
              ))}
            </span>
          </div>
        ) : null}
      </header>

      {/* 正文：左 sticky 元信息 + 右六节内容 */}
      <div className="case-body" ref={bodyRef}>
        <aside className="case-meta">
          {data.meta.map((m) => (
            <div key={m.label} className="case-meta-item">
              <span className="case-meta-label">{m.label}</span>
              <span className="case-meta-value">{m.value}</span>
            </div>
          ))}
        </aside>

        <div className="case-sections">
          {data.sections.map((s) => (
            <section key={s.id} className="case-section" id={s.id}>
              <p className="case-section-eyebrow">{s.eyebrow}</p>
              <h2 className="case-section-heading">{s.heading}</h2>
              {s.paragraphs?.map((p, i) => (
                <p key={i} className="case-section-p">
                  {p}
                </p>
              ))}
              {s.bullets ? (
                <ul className="case-section-list">
                  {s.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              ) : null}
              {s.paragraphsAfter?.map((p, i) => (
                <p key={`after-${i}`} className="case-section-p case-section-p-after">
                  {p}
                </p>
              ))}
              {s.tbd ? <p className="case-tbd">待补 · {s.tbd}</p> : null}
            </section>
          ))}
        </div>
      </div>

      {/* 页尾 · 上一个 / 下一个项目 pager（醒目大字 + 项目色辉光） */}
      <footer className="case-pager">
        <div className="case-pager-head">
          <span className="case-pager-eyebrow">SEE MORE</span>
          <Link href={data.backHref} className="case-pager-back">
            ↑ {data.backLabel}
          </Link>
        </div>

        {prev || next ? (
          <div className={`case-pager-grid${single ? " single" : ""}`}>
            {prev && !single ? (
              <Link
                href={`/works/ai/${prev.slug}`}
                className="case-pager-item case-pager-prev"
                style={
                  {
                    "--tone-a": prev.tone[0],
                    "--tone-b": prev.tone[1],
                  } as React.CSSProperties
                }
              >
                <span className="case-pager-glow" aria-hidden />
                <span className="case-pager-dir">← 上一个</span>
                <span className="case-pager-zh">{prev.zh}</span>
                <span className="case-pager-en">{prev.en}</span>
              </Link>
            ) : null}
            {next ? (
              <Link
                href={`/works/ai/${next.slug}`}
                className={`case-pager-item${single ? "" : " case-pager-next"}`}
                style={
                  {
                    "--tone-a": next.tone[0],
                    "--tone-b": next.tone[1],
                  } as React.CSSProperties
                }
              >
                <span className="case-pager-glow" aria-hidden />
                <span className="case-pager-dir">下一个 →</span>
                <span className="case-pager-zh">{next.zh}</span>
                <span className="case-pager-en">{next.en}</span>
              </Link>
            ) : null}
          </div>
        ) : null}
      </footer>
    </main>
  );
}
