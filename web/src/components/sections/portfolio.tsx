"use client";

/**
 * 第三幕：作品集 · Portfolio（v3 主次版）
 * ---------------------------------------------------------------
 * v1：CORE / WIP / LAB 三板块 inline 展开
 * v2：左右对半双栏（AI / 规划）+ 中间竖线
 * v3（当前）：转行 AI 产品经理定位 —— AI 产品升为全宽主视觉（3 个已交付
 *   项目带封面卡片），规划降为下方紧凑「背景支撑带」（不删除，重定义为
 *   领域深度 + 交付力的能力迁移佐证）。导师点评：对半分不合适、规划别删。
 *
 * 视觉：沿用 v2 色块系统（赭石底 #b85a35 + 米黄字 #f0e8d8）
 *      + 主标题 "PORTFOLIO" Bebas Neue 巨字 + 每字母 hover cycle 动画
 *
 * 字符串：长 note 用反引号 `` 避免内层引号潜在 build 错误（见 dev-log 阶段二踩坑 3.1）。
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";

// v3 主标题字母 hover cycle 动画（复用 about-me 同款 + globals.css 的 @keyframes letter-fly-cycle）
const PORTFOLIO_TITLE_CHARS = "PORTFOLIO".split("");
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

// 主视觉：3 个已交付 AI 项目 · 首页只放真交付（未开始的在 /works/ai 全列表里）
type FeaturedAi = {
  slug: string;
  zh: string;
  /** 一行副标题 */
  sub: string;
  /** 案例详情页路由 */
  href: string;
  /** 封面图（public 路径） */
  cover: string;
  /** 封面 contain 展示时的底色（取封面边缘同色，留白无缝） */
  fill: string;
  /** 状态短语 */
  status: string;
  /** 状态点颜色 · 已上线绿 / 已开发琥珀 */
  dot: string;
};

const FEATURED_AI: FeaturedAi[] = [
  {
    slug: "yunshangmigui",
    zh: "云上米轨",
    sub: "滇越铁路垂直领域数字化知识服务平台",
    href: "/works/ai/yunshangmigui",
    cover: "/works/yunshangmigui/cover.png",
    fill: "#1e473c",
    status: "已上线公网 · 全栈独立交付",
    dot: "#5fbf8a",
  },
  {
    slug: "jianjinggui",
    zh: "建景规规范问答助手",
    sub: "垂类规范 RAG · 7 维评测体系",
    href: "/works/ai/jianjinggui",
    cover: "/works/jianjinggui/cover.png",
    fill: "#1d314c",
    status: "公司内部上线测试阶段",
    dot: "#d99a3a",
  },
  {
    slug: "contract",
    zh: "购销合同审查助手",
    sub: "AI Workflow · 上传即审 · 已部署 Vercel 内测",
    href: "/works/ai/contract",
    cover: "/works/contract/cover.png",
    fill: "#312c26",
    status: "公司内部上线测试阶段",
    dot: "#d99a3a",
  },
];

// 规划背景 · 主导 / 深度参与 / 参与 全部合并（chips 展示，全部入口进 /works/planning）
const PLANNING_WORKS: string[] = [
  "信阳柳林矿坑文旅项目",
  "长丰汽车城战略规划项目",
  "长丰核聚变城设计项目",
  "信阳青年营地设计项目",
  "南安市乡村振兴项目",
  "哈密市国土空间规划评估",
  "巴里坤县村庄规划项目",
  "徐汇美丽街区建设项目",
  "连心门改造项目",
];

// 规划背景定位语 · 把旧履历重定义为 AI PM 的能力迁移佐证
// TODO(用户确认)：可补真实年限 / 最想强调的能力关键词后再打磨
const PLANNING_NOTE = `产品与交付根基 —— 政企 / 文旅 / 空间规划的复杂项目实战：需求定义、多方干系人协调、从调研到落地交付，正是迁移为 AI 产品经理的领域深度与交付力。`;

/* ---------------- Component ---------------- */

export default function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null);
  // 入场动画一次性触发
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
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
      id="work"
      className={`portfolio${visible ? " visible" : ""}`}
    >
      {/* 居中主标题（与 About me 同源处理） */}
      <h2 className="portfolio-title" aria-label="PORTFOLIO">
        {PORTFOLIO_TITLE_CHARS.map((ch, i) =>
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

      {/* 主视觉：AI 产品作品集 · 3 个已交付项目封面卡片 */}
      <div className="portfolio-ai">
        <div className="portfolio-block-head">
          <div className="portfolio-block-titles">
            <span className="portfolio-block-zh">AI 产品作品集</span>
            <span className="portfolio-block-en">AI PRODUCT WORKS</span>
          </div>
          <Link href="/works/ai" className="portfolio-block-all">
            查看全部 →
          </Link>
        </div>

        <div className="portfolio-ai-grid">
          {FEATURED_AI.map((w) => (
            <Link
              key={w.slug}
              href={w.href}
              className="portfolio-ai-card"
              style={{ "--shot-fill": w.fill } as CSSProperties}
              aria-label={`${w.zh} 案例详情`}
            >
              <div
                className="portfolio-ai-cover"
                style={{ backgroundImage: `url(${w.cover})` }}
                role="img"
                aria-label={`${w.zh} 封面`}
              />
              <div className="portfolio-ai-body">
                <span className="portfolio-ai-zh">{w.zh}</span>
                <span className="portfolio-ai-sub">{w.sub}</span>
                <span
                  className="portfolio-ai-status"
                  style={{ "--dot": w.dot } as CSSProperties}
                >
                  {w.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 次要：规划背景支撑带 · 弱化但重定义为能力迁移佐证 */}
      <div className="portfolio-planning">
        <div className="portfolio-block-head">
          <div className="portfolio-block-titles">
            <span className="portfolio-plan-zh">
              规划背景
              <span className="portfolio-plan-en"> · PLANNING BACKGROUND</span>
            </span>
          </div>
          <Link href="/works/planning" className="portfolio-block-all">
            查看全部 →
          </Link>
        </div>
        <p className="portfolio-plan-note">{PLANNING_NOTE}</p>
        <ul className="portfolio-plan-chips">
          {PLANNING_WORKS.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
