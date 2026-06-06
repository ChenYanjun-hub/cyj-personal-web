"use client";

/**
 * 第三幕：作品集 · Portfolio
 * ---------------------------------------------------------------
 * 视觉策略：与 About Me 同源（纯黑白单色、全大写英文板块标题、克制留白）。
 * PROJECT_GUIDE 第 4.4 节原方案是"线稿城市规划图"做底图，V1 暂不依赖底图（用分区 + 卡片
 * 承担"规划图"的视觉隐喻）；V2 阶段负责人提供 AIGC 城市轴测线稿后再叠上去。
 *
 * 三板块（PROJECT_GUIDE 主次分明原则）：
 *  - CORE: 2 个深度项目（云上米轨 + 建景规）— 大卡片 + inline 展开 7 字段详情
 *  - WIP:  3 个待建项目（MOOGU / 多 Agent / 合同审阅）— 中卡片 + 一句话方向
 *  - LAB:  2 个 Coze 已发布（失恋陪伴 / AI 情感伴侣）— 中卡片 + 设计要点
 *
 * 内容来源：分身知识库第二类（项目详情）+ PROJECT_GUIDE 第 4.4 节。
 * 注意：A.1-A.7 和 B.1-B.8 字段在知识库里**全空**，详情字段标 "待负责人补全"。
 *
 * 字符串：长 note 用反引号 `` 避免内层引号潜在 build 错误（见 dev-log 阶段二踩坑 3.1）。
 */

import { useEffect, useRef, useState } from "react";

/* ---------------- 数据 ---------------- */

type CoreDetail = {
  positioning: string | null;
  background: string | null;
  myRole: string | null;
  aiTech: string | null;
  outcome: string | null;
  reflection: string | null;
};

type CoreProject = {
  id: string;
  num: string;
  name: string;
  oneLiner: string;
  type: string;
  stack: string[];
  highlights: string[];
  detail: CoreDetail;
};

type WipProject = {
  id: string;
  num: string;
  name: string;
  oneLiner: string;
  validate: string;
};

type LabProject = {
  id: string;
  num: string;
  name: string;
  platform: string;
  design: string;
};

const CORE: CoreProject[] = [
  {
    id: "yunshangmigui",
    num: "01",
    name: "云上米轨",
    oneLiner: `滇越铁路垂直领域数字化知识服务平台`,
    type: "BtoBtoC",
    stack: [
      "Next.js 16",
      "React 19",
      "Tailwind v4",
      "Supabase",
      "pgvector",
      "DeepSeek",
      "DashScope",
    ],
    highlights: [
      `7 用户端模块 + 5 角色 Admin 后台 + 6 角色 RLS 权限设计`,
      `卖点：系统性 + 多方利益结构（呼应规划专业背景）`,
    ],
    detail: {
      positioning: null,
      background: null,
      myRole: null,
      aiTech: null,
      outcome: null,
      reflection: null,
    },
  },
  {
    id: "jianjinggui",
    num: "02",
    name: "建景规规范问答助手",
    oneLiner: `建筑 / 景观 / 规划 规范知识问答助手`,
    type: "toB · RAG",
    stack: [],
    highlights: [
      `卖点：toB 能力最硬证据`,
      `两个分水岭：① 怎么解决幻觉；② 怎么定义"回答得好不好"（Eval）`,
      `已有完整 PRD：执行摘要 / 用户调研 / 10+ 维度竞品 / 理想态与评测 / 技术附录`,
      `评测集 50 → 100 → 250 持续迭代中`,
    ],
    detail: {
      positioning: null,
      background: null,
      myRole: null,
      aiTech: null,
      outcome: null,
      reflection: null,
    },
  },
];

const WIP: WipProject[] = [
  {
    id: "moogu",
    num: "03",
    name: "MOOGU 野生菌数字手帐",
    oneLiner: `探索多模态 AI 在垂类 C 端工具的应用`,
    validate: `多模态 · 垂类 C 端`,
  },
  {
    id: "multi-agent",
    num: "04",
    name: "个人多 Agent 助手平台",
    oneLiner: `探索多 Agent 协同的能力边界`,
    validate: `多 Agent 协同`,
  },
  {
    id: "contract",
    num: "05",
    name: "合同审阅助手",
    oneLiner: `把垂直领域 RAG 复用到法律 / 商务场景`,
    validate: `垂类 RAG 跨场景复用`,
  },
];

const LAB: LabProject[] = [
  {
    id: "breakup",
    num: "06",
    name: "失恋陪伴助手",
    platform: `Coze · 已发布`,
    design: `提示词主导 + 三层记忆架构（碎片 / 短期 / 长期）`,
  },
  {
    id: "companion",
    num: "07",
    name: "AI 情感伴侣 V1",
    platform: `Coze · 已发布`,
    design: `提示词主导 + 三层记忆架构（碎片 / 短期 / 长期）`,
  },
];

/* ---------------- Core 项目详情面板（inline 展开） ---------------- */

const DETAIL_FIELDS: Array<{ key: keyof CoreDetail; label: string }> = [
  { key: "positioning", label: "项目定位" },
  { key: "background", label: "背景 / 问题" },
  { key: "myRole", label: "我的角色与产品决策" },
  { key: "aiTech", label: "AI 技术范式" },
  { key: "outcome", label: "成果 / 现状" },
  { key: "reflection", label: "我的反思" },
];

function ProjectDetail({ detail }: { detail: CoreDetail }) {
  return (
    // dl 是 HTML5 语义化的 description list，dt/dd 配对——HTML5 允许 div 包一对，
    // 但顶层必须是 dl 而不是 div，否则 dt/dd 不在合法上下文里
    <dl className="portfolio-detail">
      {DETAIL_FIELDS.map((field) => {
        const value = detail[field.key];
        return (
          <div key={field.key} className="portfolio-detail-row">
            <dt className="portfolio-detail-label">{field.label}</dt>
            <dd
              className={`portfolio-detail-value${value ? "" : " portfolio-detail-placeholder"}`}
            >
              {value ?? "待负责人补全 · TBD"}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

/* ---------------- 主组件 ---------------- */

export default function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  // 哪些 Core 卡片处于展开状态（用 Set 支持多个同时展开）
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

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

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section
      ref={sectionRef}
      id="work"
      className={`portfolio${visible ? " visible" : ""}`}
    >
      {/* 居中主标题（与 About me 同源处理） */}
      <h2 className="portfolio-title">Portfolio</h2>
      <p className="portfolio-subtitle">作品集 · 主次分明，不平铺</p>

      {/* ===== CORE 板块：深度项目 ===== */}
      <section className="portfolio-block portfolio-block-core">
        <header className="portfolio-block-header">
          <h3 className="portfolio-block-title">CORE</h3>
          <p className="portfolio-block-desc">
            深度项目实证 · 完整产品形态
          </p>
        </header>

        <div className="portfolio-core-list">
          {CORE.map((p) => {
            const isOpen = expanded.has(p.id);
            return (
              <article
                key={p.id}
                className={`portfolio-card portfolio-card-core${isOpen ? " open" : ""}`}
              >
                <div className="portfolio-card-head">
                  <span className="portfolio-num">[{p.num}]</span>
                  <div className="portfolio-card-body">
                    <h4 className="portfolio-card-name">
                      {p.name}
                      <span className="portfolio-card-type">· {p.type}</span>
                    </h4>
                    <p className="portfolio-card-oneliner">{p.oneLiner}</p>

                    {/* 技术栈 chips */}
                    {p.stack.length > 0 && (
                      <ul className="portfolio-stack">
                        {p.stack.map((s) => (
                          <li key={s} className="portfolio-stack-item">
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* 亮点 bullets */}
                    <ul className="portfolio-highlights">
                      {p.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Chevron 展开按钮 */}
                  <button
                    type="button"
                    className="portfolio-toggle"
                    aria-expanded={isOpen}
                    aria-label={
                      isOpen
                        ? `收起 ${p.name} 详情`
                        : `展开 ${p.name} 详情`
                    }
                    onClick={() => toggle(p.id)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>

                {/* inline 展开的详情面板 */}
                {isOpen && <ProjectDetail detail={p.detail} />}
              </article>
            );
          })}
        </div>
      </section>

      {/* ===== WIP 板块：待建区 ===== */}
      <section className="portfolio-block portfolio-block-wip">
        <header className="portfolio-block-header">
          <h3 className="portfolio-block-title">WIP</h3>
          <p className="portfolio-block-desc">
            规划中 · 探索方向（诚实表达成熟度）
          </p>
        </header>

        <div className="portfolio-grid">
          {WIP.map((p) => (
            <article
              key={p.id}
              className="portfolio-card portfolio-card-wip"
            >
              <span className="portfolio-num">[{p.num}]</span>
              <h4 className="portfolio-card-name">{p.name}</h4>
              <p className="portfolio-card-oneliner">{p.oneLiner}</p>
              <p className="portfolio-validate">
                <span className="portfolio-validate-label">验证方向 ·</span>{" "}
                {p.validate}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ===== LAB 板块：Agent 实验田 ===== */}
      <section className="portfolio-block portfolio-block-lab">
        <header className="portfolio-block-header">
          <h3 className="portfolio-block-title">LAB</h3>
          <p className="portfolio-block-desc">
            Agent 实验田 · 已发布的探索性作品
          </p>
        </header>

        <div className="portfolio-grid portfolio-grid-2col">
          {LAB.map((p) => (
            <article
              key={p.id}
              className="portfolio-card portfolio-card-lab"
            >
              <span className="portfolio-num">[{p.num}]</span>
              <h4 className="portfolio-card-name">{p.name}</h4>
              <p className="portfolio-platform">{p.platform}</p>
              <p className="portfolio-card-oneliner">{p.design}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 章节收尾提示 */}
      <p className="portfolio-segue">
        ↓ 接下来：视觉与生活
      </p>
    </section>
  );
}
