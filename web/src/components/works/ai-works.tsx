"use client";

/**
 * AI 项目作品集页主体（/works/ai）
 * ---------------------------------------------------------------
 * 风格参考：Andy Reff 作品集（用户提供截图）
 *  - 近黑底 + 顶部三段式 nav（姓名 / 城市+实时秒钟 / 链接）
 *  - 巨字 "AI WORKS"（Bebas Neue · 沿用 about/portfolio 的 letter hover cycle）
 *  - 项目从上到下一卡一项目：左文案（标签 + 标题 + 简介 + 指标）+ 右视觉
 *
 * 内容来源：md/分身知识库采集清单.md（事实档案）。
 * 诚实原则：合同审查 / MOOGU / 多 Agent 平台在知识库里明确"未开始"，
 * 卡片如实标"规划中"，指标位换成"想验证什么"；不编造数据。
 *
 * 视觉素材：项目截图尚未提供 → 占位（渐变 + Bebas 水印词）。
 * 之后把截图放进 public/works/ai/ 并填上数据里的 shot 字段即自动替换。
 *
 * 为什么是 Client Component：实时时钟（ref 直写避免 re-render）+
 * IntersectionObserver 卡片入场 + 标题字母 hover 动画。
 */

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

import WorksNav from "@/components/works/works-nav";

/* ---------------- 巨字标题 · 字母 hover cycle（与 about/portfolio 同款） ---------------- */

const TITLE_CHARS = "AI WORKS".split("");
const LETTER_CYCLE_MS = 650;

function handleLetterEnter(e: ReactMouseEvent<HTMLSpanElement>) {
  const el = e.currentTarget;
  if (el.classList.contains("cycling")) return;
  el.classList.add("cycling");
  window.setTimeout(() => {
    el.classList.remove("cycling");
  }, LETTER_CYCLE_MS + 20);
}

/* ---------------- 数据 ---------------- */

type AiWork = {
  id: string;
  zh: string;
  en: string;
  /** 类别标签行（mono 小字 · 点分隔） */
  tags: string[];
  /** 项目状态 · kind 决定状态点样式（实心 = 已做出来 / 空心 = 规划中） */
  status: { kind: "built" | "shipped" | "planned"; label: string };
  desc: string;
  /** 已做项目：事实指标（大数字 + 小标签，参考图同款） */
  metrics?: { num: string; label: string }[];
  /** 规划中项目：用"想验证什么"替代指标位（知识库的诚实表达） */
  verify?: string;
  /** 占位视觉的 Bebas 水印词（拉丁字符） */
  mark: string;
  /** 占位视觉渐变两端色 */
  tone: [string, string];
  /** 真实截图（public 下路径）· 提供后自动替换占位视觉 */
  shot?: string;
  /** 案例详情页路由 · 建好后填上，cue 自动从"整理中"变为可点链接 */
  caseHref?: string;
  /** 获奖注记（小奖章 chip · accent 色） */
  award?: string;
};

const AI_WORKS: AiWork[] = [
  {
    id: "yunshangmigui",
    zh: "云上米轨",
    en: "Yun Shang Mi Gui · Yunnan–Vietnam Railway Knowledge Platform",
    tags: ["BtoBtoC", "AI 全栈", "RAG"],
    status: { kind: "shipped", label: "已上线公网 · 团队演示阶段" },
    desc: `把百年滇越铁路的文化遗产做成数字化知识服务平台——6 大模块 + 南渡 AI 知识问答。Next.js + Supabase + pgvector + DeepSeek 全栈独立交付，已部署上线（阿里云），从产品定义、AI 设计到部署运维一人走通全链路。`,
    metrics: [
      { num: "100%", label: "域内答案事实准确率 · 30 题实测" },
      { num: "95%", label: "越界拒答率 · 宁拒答不编造" },
    ],
    mark: "MIGUI",
    tone: ["#2f6f5e", "#0e1f1a"],
    caseHref: "/works/ai/yunshangmigui",
    award: "2026 中国国际大学生创新大赛 · 研究生组获奖",
  },
  {
    id: "jianjinggui",
    zh: "建景规规范问答助手",
    en: "Architectural Norm RAG Assistant",
    tags: ["To B", "垂类 RAG", "评测体系"],
    status: { kind: "built", label: "已开发 · 7 维评测受控 v1.0" },
    desc: `AI 版设计规范"法条数据库"——用自然语言查规划 / 建筑 / 景观 / 消防 / 结构 / 市政 6 类规范，每条回答附规范号、条文号、原文跳转，严守"不编造"红线。主导产品定义、技术选型、7 维评测体系与红线工程化，AI 辅助开发落地。`,
    metrics: [
      { num: "90.3", label: "7 维评测综合分 / 100（86.6→90.3）" },
      { num: "94%", label: "原文用词准确（86.2%→94%）" },
    ],
    mark: "RAG",
    tone: ["#2b4a72", "#0d1420"],
    caseHref: "/works/ai/jianjinggui",
  },
  {
    id: "contract",
    zh: "购销合同审查助手",
    en: "Sales Contract Review Assistant",
    tags: ["AI Workflow", "To B", "Coze"],
    status: { kind: "shipped", label: "已上线 Vercel · 垂直场景 MVP" },
    desc: `独立完成产品设计与全栈工程，把一个 Coze 审查工作流做成可上传文件、可审查、可下载报告的完整 Web 产品：三大页面 + .txt/.docx 解析 + 后端 API + Coze 文件工作流联调 + 结果标准化 + 异常退回示例兜底，已部署 Vercel 生产环境。`,
    metrics: [
      { num: "MVP", label: "完整链路跑通 · 已上线 Vercel" },
      { num: "2", label: "采购方 / 销售方 双立场审查" },
    ],
    mark: "CONTRACT",
    tone: ["#5a5246", "#171411"],
    caseHref: "/works/ai/contract",
  },
  {
    id: "moogu",
    zh: "MOOGU · 野生菌数字手帐",
    en: "MOOGU · Wild Mushroom Field Journal",
    tags: ["C 端", "多模态"],
    status: { kind: "planned", label: "规划中 · Figma 原型已完成" },
    desc: `野生菌爱好者的数字手帐——拍照识别、采集记录、风味笔记。产品原型已用 Figma 完成设计，是补 C 端产品经验的自选练习场。`,
    verify: "多模态 AI 在垂类 C 端工具里的真实价值与可用边界。",
    mark: "MOOGU",
    tone: ["#8a5a2d", "#1c120a"],
  },
  {
    id: "multi-agent",
    zh: "个人多 Agent 助手平台",
    en: "Personal Multi-Agent Platform",
    tags: ["Multi-Agent", "个人助手"],
    status: { kind: "planned", label: "规划中 · 蓝图阶段" },
    desc: `让多个各司其职的 Agent 协同处理个人事务——探索分工、调度、记忆共享的协同范式，是 Coze 单 Agent 实验之后的下一步。`,
    verify: "多 Agent 分工协作的调度方式与能力边界。",
    mark: "AGENTS",
    tone: ["#4a3f6e", "#120f1c"],
  },
  {
    id: "ai-emotion",
    zh: "AI 情感伴侣",
    en: "AI Emotional Partner",
    tags: ["C 端", "情感陪伴", "Coze"],
    status: { kind: "shipped", label: "Coze 已发布 · V1" },
    desc: `在 Coze 平台搭建并发布的情感伴侣 Agent。提示词主导 + 三层记忆架构（碎片 / 短期 / 长期），让长期陪伴有连续感。自评"已有一点人味，但远远不够"——对 C 端情感陪伴方向的真实技术验证，持续打磨记忆与回应的温度。`,
    metrics: [
      { num: "3", label: "层记忆架构 · 碎片 / 短期 / 长期" },
      { num: "V1", label: "Coze 平台已发布" },
    ],
    mark: "PARTNER",
    tone: ["#7a3a72", "#170d18"],
  },
];

/* ---------------- Component ---------------- */

export default function AiWorks() {
  const listRef = useRef<HTMLDivElement>(null);

  // 边缘辉光：rAF 节流的全局 mousemove，向每张卡写 --glow-x/y（光心 = 指针）
  // 与 --glow-o（强度：卡内 = 1，距边缘 140px 内线性渐亮，更远 = 0）。
  // CSS 的 ::before/::after 用这三个变量画内部光晕 + 边框光环。
  // 触屏（无 hover）直接不启用。
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    const root = listRef.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".aiwork-card"));
    const FADE = 140;
    let raf: number | null = null;

    const onMove = (e: MouseEvent) => {
      if (raf !== null) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        for (const card of cards) {
          const r = card.getBoundingClientRect();
          card.style.setProperty("--glow-x", `${e.clientX - r.left}px`);
          card.style.setProperty("--glow-y", `${e.clientY - r.top}px`);
          // 指针到卡片矩形的距离（在卡内为 0）
          const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
          const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
          const dist = Math.hypot(dx, dy);
          const intensity = dist >= FADE ? 0 : 1 - dist / FADE;
          card.style.setProperty("--glow-o", intensity.toFixed(3));
        }
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  // 卡片入场：进入视口加 .in（一次性），CSS 过渡负责 fade + rise
  useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".aiwork-card"));
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  return (
    <main className="aiworks">
      {/* 顶部三段式 nav（works 系列共用 · 含实时时钟） */}
      <WorksNav />

      {/* 巨字标题 · 左对齐（参考图 "WORK" 同位） */}
      <header className="aiworks-header">
        <h1 className="aiworks-title" aria-label="AI WORKS">
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
        </h1>
        <p className="aiworks-subtitle">
          {AI_WORKS.length} 个 AI 项目 · 从已开发到蓝图，按真实进度如实标注
        </p>
      </header>

      {/* 项目卡片流 · 从上到下一卡一项目 */}
      <div className="aiworks-list" ref={listRef}>
        {AI_WORKS.map((w) => (
          <article
            key={w.id}
            className="aiwork-card"
            style={
              {
                "--tone-a": w.tone[0],
                "--tone-b": w.tone[1],
              } as React.CSSProperties
            }
          >
            {/* 左：文案区 */}
            <div className="aiwork-copy">
              <div className="aiwork-head">
                <p className="aiwork-tags">{w.tags.join(" · ")}</p>
                <p className={`aiwork-status ${w.status.kind}`}>
                  <span className="aiwork-status-dot" aria-hidden />
                  {w.status.label}
                </p>
              </div>

              <h2 className="aiwork-title">{w.zh}</h2>
              <p className="aiwork-title-en">{w.en}</p>
              <p className="aiwork-desc">{w.desc}</p>

              {w.award ? (
                <p className="aiwork-award">
                  <span className="aiwork-award-seal" aria-hidden>
                    ★
                  </span>
                  {w.award}
                </p>
              ) : null}

              {w.metrics ? (
                <div className="aiwork-metrics">
                  {w.metrics.map((m) => (
                    <div key={m.label} className="aiwork-metric">
                      <span className="aiwork-metric-num">{m.num}</span>
                      <span className="aiwork-metric-label">{m.label}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {w.verify ? (
                <p className="aiwork-verify">
                  <span className="aiwork-verify-label">想验证什么</span>
                  {w.verify}
                </p>
              ) : null}

              {/* 案例详情：建好的项目可点跳转，其余先占位 */}
              {w.caseHref ? (
                <Link href={w.caseHref} className="aiwork-cue aiwork-cue-link">
                  查看项目详情 →
                </Link>
              ) : (
                <span className="aiwork-cue">CASE STUDY · 整理中</span>
              )}
            </div>

            {/* 右：视觉区 · 截图提供前用 渐变 + 水印词 占位 */}
            <div className="aiwork-visual">
              {w.shot ? (
                <div
                  className="aiwork-shot"
                  style={{ backgroundImage: `url(${w.shot})` }}
                  role="img"
                  aria-label={`${w.zh} 产品截图`}
                />
              ) : (
                <div className="aiwork-ph" aria-hidden>
                  <span className="aiwork-ph-mark">{w.mark}</span>
                  <span className="aiwork-ph-note">SCREENSHOT · 整理中</span>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* 页尾双向出口 */}
      <footer className="aiworks-footer">
        <Link href="/#work" className="aiworks-footer-link">
          ← 返回首页作品集
        </Link>
        <Link href="/works/planning" className="aiworks-footer-link">
          规划项目作品集 →
        </Link>
      </footer>
    </main>
  );
}
