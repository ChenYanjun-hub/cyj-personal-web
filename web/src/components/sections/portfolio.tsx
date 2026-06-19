"use client";

/**
 * 第三幕：作品集 · Portfolio（v2 双栏跳转版）
 * ---------------------------------------------------------------
 * v1 结构：CORE / WIP / LAB 三板块 inline 展开
 * v2 调整：用户拍板改为左右双栏 + 中间竖线分割
 *  - 左板块：AI 项目（中英双语）→ 点击跳转 /works/ai
 *  - 右板块：规划项目（中英双语）→ 点击跳转 /works/planning
 *  - 跳转目标页面：待用户提供参考后实现
 *
 * 视觉：与 about 一致的 v2 色块系统（赭石底 #b85a35 + 米黄字 #f0e8d8）
 *      + 主标题 "PORTFOLIO" Bebas Neue 巨字 + 每字母 hover cycle 动画
 *
 * 字符串：长 note 用反引号 `` 避免内层引号潜在 build 错误（见 dev-log 阶段二踩坑 3.1）。
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

// v2 主标题字母 hover cycle 动画（复用 about-me 同款 + globals.css 的 @keyframes letter-fly-cycle）
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

type WorkLink = {
  id: string;
  zh: string;
  en: string;
};

// AI 项目作品集 · 包含已经/在做的 AI 相关项目
// 英文名为暂用直译版本 · 待用户 review / 替换正式英文名
const AI_WORKS: WorkLink[] = [
  {
    id: "yunshangmigui",
    zh: "云上米轨 · 滇越铁路垂直领域数字化知识服务平台",
    en: "Yun Shang Mi Gui · Yunnan–Vietnam Railway Knowledge Platform",
  },
  {
    id: "jianjinggui",
    zh: "建景规规范问答助手",
    en: "Architecture · Landscape · Planning Q&A Assistant",
  },
  {
    id: "contract",
    zh: "购销合同审查助手",
    en: "Sales Contract Review Assistant",
  },
  {
    id: "moogu",
    zh: "MOOGU · 野生菌数字手帐",
    en: "MOOGU · Wild Mushroom Field Journal",
  },
  {
    id: "multi-agent",
    zh: "个人多 Agent 助手平台",
    en: "Personal Multi-Agent Platform",
  },
  {
    id: "breakup",
    zh: "失恋陪伴",
    en: "Heartbreak Companion",
  },
  {
    id: "ai-emotion",
    zh: "AI 情感伴侣",
    en: "AI Emotional Partner",
  },
];

// 规划项目作品集 · 主导 / 深度参与 / 参与 全部合并按时间或重要度排
const PLANNING_WORKS: WorkLink[] = [
  {
    id: "xinyang-liulin",
    zh: "信阳柳林矿坑文旅项目",
    en: "Xinyang Liulin Mine Pit Tourism",
  },
  {
    id: "changfeng-auto",
    zh: "长丰汽车城战略规划项目",
    en: "Changfeng Auto City Strategic Planning",
  },
  {
    id: "changfeng-fusion",
    zh: "长丰核聚变城设计项目",
    en: "Changfeng Fusion City Design",
  },
  {
    id: "xinyang-youth",
    zh: "信阳青年营地设计项目",
    en: "Xinyang Youth Camp Design",
  },
  {
    id: "nanan-rural",
    zh: "南安市乡村振兴项目",
    en: "Nan'an Rural Revitalization",
  },
  {
    id: "hami-spatial",
    zh: "哈密市国土空间规划评估工作",
    en: "Hami Territorial Spatial Planning Evaluation",
  },
  {
    id: "barkol-village",
    zh: "巴里坤县村庄规划项目",
    en: "Barkol County Village Planning",
  },
  {
    id: "xuhui-block",
    zh: "徐汇美丽街区建设项目",
    en: "Xuhui Beautiful Block Construction",
  },
  {
    id: "lianxin-gate",
    zh: "连心门改造项目",
    en: "Lianxin Gate Renovation",
  },
];

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

      {/* 双栏 split：左 AI / 右 规划 · 中间一条极简竖线分隔 */}
      <div className="portfolio-split">
        {/* 左：AI 作品集 · 点击跳转 */}
        <Link
          href="/works/ai"
          className="portfolio-side portfolio-side-ai"
          aria-label="进入 AI 项目作品集"
        >
          <header className="portfolio-side-head">
            <span className="portfolio-side-label-zh">AI 项目作品集</span>
            <span className="portfolio-side-label-en">AI WORKS</span>
          </header>
          <ul className="portfolio-side-list">
            {AI_WORKS.map((w) => (
              <li key={w.id} className="portfolio-side-item">
                <span className="portfolio-side-item-zh">{w.zh}</span>
                <span className="portfolio-side-item-en">{w.en}</span>
              </li>
            ))}
          </ul>
          <span className="portfolio-side-cue">查看全部 →</span>
        </Link>

        {/* 中间极简竖线分隔 */}
        <div className="portfolio-split-line" aria-hidden />

        {/* 右：规划作品集 · 点击跳转 */}
        <Link
          href="/works/planning"
          className="portfolio-side portfolio-side-planning"
          aria-label="进入规划项目作品集"
        >
          <header className="portfolio-side-head">
            <span className="portfolio-side-label-zh">规划项目作品集</span>
            <span className="portfolio-side-label-en">PLANNING WORKS</span>
          </header>
          <ul className="portfolio-side-list">
            {PLANNING_WORKS.map((w) => (
              <li key={w.id} className="portfolio-side-item">
                <span className="portfolio-side-item-zh">{w.zh}</span>
                <span className="portfolio-side-item-en">{w.en}</span>
              </li>
            ))}
          </ul>
          <span className="portfolio-side-cue">查看全部 →</span>
        </Link>
      </div>
    </section>
  );
}
