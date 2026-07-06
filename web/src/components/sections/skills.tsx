"use client";

/**
 * 第二幕（子幕 b）：能力技能 · 已掌握的硬技能
 * ---------------------------------------------------------------
 * About Me 章节的第三个子幕。与"能力对照"互补：
 *  - 能力对照（子幕 a）= 规划训练给的可迁移软潜质
 *  - 能力技能（子幕 b）= 已掌握的 AI 时代硬技能
 *
 * 内容来源：分身知识库采集清单.md 第三类（已定稿），按四板块组织。
 *
 * 表现形式铁律（PROJECT_GUIDE 第 152 行）：
 *  - 绝不用百分比 / 星级 / 进度条
 *  - 用"动词分级"：熟练 / 能运用 / 了解学习中
 *  - 每项配一句"我用这个能力做过什么"的真实备注
 *
 * 视觉：4 板块网格（桌面 2x2 或 4 列）+ 入场 stagger，沿用 About Me 章节 token。
 *
 * 字符串注意：全部用反引号 `` 包，避免内层引号引起的 build error（见 dev-log）。
 */

import { useEffect, useRef, useState } from "react";

type Level = "熟练" | "能运用" | "了解学习中";

type SkillItem = {
  name: string;
  level: Level;
  note: string;
};

type SkillBlock = {
  title: string;
  /** 可选副标题，比如"核心"、"差异化亮点" */
  flag?: string;
  items: SkillItem[];
};

const BLOCKS: SkillBlock[] = [
  {
    title: "AI 产品能力",
    flag: "核心",
    items: [
      {
        name: "AI 知识体系搭建",
        level: "熟练",
        note: `三层框架：AI 基础层 / LLM 认知层 / 落地技术路径层（Prompt / RAG / Fine-tuning / Agent / AI Coding）`,
      },
      {
        name: "RAG 应用设计",
        level: "熟练",
        note: `建景规独立完整 PRD（含技术架构、向量库选型、分块策略、评测集 50→100→250 迭代）`,
      },
      {
        name: "Prompt 工程",
        level: "熟练",
        note: `Coze 多 Agent 应用 · 提示词主导 + 三层记忆架构（碎片 / 短期 / 长期）`,
      },
      {
        name: "Agent 应用设计",
        level: "能运用",
        note: `AI 情感伴侣 V1（Coze 已发布）· 三层记忆架构 · C 端情感陪伴方向技术验证`,
      },
      {
        name: "AI 评估与质量管理",
        level: "熟练",
        note: `特别注重每个技术路径的"评估方法"与"现存问题"· PM 判断 AI 能否嵌入产品的核心工具`,
      },
      {
        name: "LLM / 多模态能力边界",
        level: "熟练",
        note: `熟悉 DeepSeek / 通义 / 智谱 / Claude / Codex 等主流模型的能力特点与成本结构`,
      },
    ],
  },
  {
    title: "产品设计与方法",
    items: [
      {
        name: "PRD 撰写",
        level: "熟练",
        note: `建景规独立完整 PRD：执行摘要 / 用户调研 / 竞品 / 理想态与评测 / 技术附录`,
      },
      {
        name: "竞品分析",
        level: "熟练",
        note: `建景规 10+ 维度框架（市场分析 / 竞争格局 / 痛点 / 政策 / 产品形态分布 / 机会点）· 咨询级深度`,
      },
      {
        name: "用户研究",
        level: "能运用",
        note: `信阳柳林实地访谈 + 小红书声量分析 + 建景规问卷设计 · 方法论持续精进中`,
      },
      {
        name: "产品方案设计与原型",
        level: "熟练",
        note: `Figma 野生菌数字手帐原型 · Axure / 墨刀已下载学习中`,
      },
      {
        name: "需求分析与方案分解",
        level: "熟练",
        note: `信阳柳林：精神定位 → 24 子项目 → 资金测算 · 完整跨层分解链`,
      },
    ],
  },
  {
    title: "技术与动手能力",
    flag: "差异化亮点",
    items: [
      {
        name: "Vibe Coding 与 AI 全栈交付",
        level: "熟练",
        note: `Claude Code 主力 + Cursor + VSCode · 云上米轨完整技术栈（Next.js 16 / Supabase / pgvector / DeepSeek / DashScope）`,
      },
      {
        name: "AI 辅助下的产品架构能力",
        level: "熟练",
        note: `自己主导技术选型决策（LLM / 向量库 / Auth / 数据库），AI 协作实现`,
      },
      {
        name: "与工程团队协作的语言能力",
        level: "能运用",
        note: `理解前后端 / 数据库 / API / 部署架构核心概念 · 熟练 Git / GitHub`,
      },
    ],
  },
  {
    title: "专业领域 & 工具",
    items: [
      {
        name: "城乡规划专业",
        level: "熟练",
        note: `南工大 5 年 + 同济规划院 1 年 · 两篇 GIS 空间数据分析研究（一篇《华中建筑》发表，一篇 2 万字国际期刊投递）`,
      },
      {
        name: "GIS 与空间数据分析",
        level: "熟练",
        note: `ArcGIS / QGIS 深度使用 · 论文级研究成果验证`,
      },
      {
        name: "规划与设计软件",
        level: "熟练",
        note: `AutoCAD / SketchUp / Rhino / Photoshop / Illustrator`,
      },
      {
        name: "AIGC 工具",
        level: "熟练",
        note: `Midjourney / Nano Banana Pro 渲染效果图 · 即梦 / 星流做海报与视觉创作`,
      },
      {
        name: "知识管理 / 办公",
        level: "熟练",
        note: `Obsidian + Codex 维护个人 AI 知识库 · PowerPoint 精通`,
      },
    ],
  },
];

// 等级 → tag 的 className 后缀（用于变色：熟练 = accent / 能运用 = ink / 了解 = 灰）
function levelClass(level: Level): string {
  switch (level) {
    case "熟练":
      return "skill-level skill-level-mastered";
    case "能运用":
      return "skill-level skill-level-applied";
    case "了解学习中":
      return "skill-level skill-level-learning";
  }
}

export default function Skills() {
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
      id="skills"
      className={`skills${visible ? " visible" : ""}`}
    >
      {/* About Me 章节贯穿头 */}
      <p className="about-chapter about-chapter-sub">
        <span className="about-rule" aria-hidden />
        <span>About Me · 子幕 b · 具备技能</span>
        <span className="about-rule" aria-hidden />
      </p>

      {/* 子幕标题 */}
      <header className="skills-header">
        <h2 className="skills-title">已掌握的硬技能</h2>
        <p className="skills-subtitle">
          按"能做成什么"分级 — 熟练 / 能运用 / 了解学习中。
          <br />
          不用百分比、星级、进度条 — 转行者用诚实说话。
        </p>
      </header>

      {/* 4 板块网格 */}
      <div className="skills-blocks">
        {BLOCKS.map((block, blockIdx) => (
          <article
            key={block.title}
            className="skills-block"
            style={
              { ["--block-i"]: blockIdx } as React.CSSProperties
            }
          >
            <h3 className="skills-block-title">
              {block.title}
              {block.flag && (
                <span className="skills-block-flag">· {block.flag}</span>
              )}
            </h3>

            <ul className="skills-list">
              {block.items.map((item) => (
                <li key={item.name} className="skill-item">
                  <div className="skill-item-head">
                    <span className="skill-name">{item.name}</span>
                    <span className={levelClass(item.level)}>
                      {item.level}
                    </span>
                  </div>
                  <p className="skill-note">{item.note}</p>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
