"use client";

/**
 * 第二幕：能力对照 · 信任引擎
 * ---------------------------------------------------------------
 * 作用：正面回答 HR 心中"你凭什么能跳过来"。用结构化证据让 HR 自己得出"他能行"的结论。
 *
 * 内容来源：分身知识库采集清单.md 第 1.4 节（已定稿），信阳柳林项目为贯穿证据。
 * 收尾"承认短板"来自 4.2 节，按 PROJECT_GUIDE 第二幕规格"必须保留"。
 *
 * 交互（用户在 V1 阶段确认要做）：
 *  1) 卸货区 + 展开：每行默认显示标题 + 一句翻译，点击 chevron 展开看具体场景
 *  2) Scroll-triggered 入场：IntersectionObserver 检测 section 进入视口后，
 *     左右两栏分别 stagger fade-in，模拟"左栏先入、右栏逐条翻译"的能力迁移视觉
 *
 * 视觉延续 Hero 的设计语言：
 *  - accent #D8552E 用在编号与 ↔
 *  - 主标题"你凭什么能跳过来"用得意黑 Oblique
 *  - 一条 hairline 细线分隔每行（苹果式克制）
 *
 * 字符串注意：ROWS 数据里大量包含中文引号嵌套，全部用反引号 `` 包字符串，
 * 避免 ASCII " 引号被解析器当作字符串边界（曾踩坑，build error 见 dev-log）。
 */

import { useEffect, useRef, useState } from "react";

type Row = {
  id: string;
  leftTitle: string;
  rightTitle: string;
  leftSummary: string;
  rightSummary: string;
  leftDetail: string;
  rightDetail: string;
  /** 可选标签，比如最强项 */
  flag?: string;
};

const ROWS: Row[] = [
  {
    id: "01",
    leftTitle: "需求洞察",
    rightTitle: "用户研究与需求洞察",
    leftSummary: `从真实场景理解人的需求，不从主观想象出发。`,
    rightSummary: `一手访谈 + 二手数据交叉验证 — AIPM 做产品定义的底层能力。`,
    leftDetail: `在信阳柳林矿坑项目里，独立完成对当地亲子客群与户外爱好客群的实地访谈；主动跳出传统规划调研方法，用小红书做该矿坑的热度与讨论度分析，从社交平台真实声量里提炼出"该项目对年轻人具备爆款潜力"的判断。`,
    rightDetail: `这套"用真实用户行为驱动决策"的方法本质上就是 PM 做用户研究——介质换到 AI 产品时工具会变、底层方法不变。在甲方竞标会上我基于这份调研主动抛出"爆款潜力"判断，当场获得甲方认同，直接确定了项目后续方向。`,
  },
  {
    id: "02",
    leftTitle: "多方博弈",
    rightTitle: "利益相关方管理",
    flag: "最强项",
    leftSummary: `在政府、开发商、居民、生态多方诉求间找平衡——不是"画最美的图"，而是"推动一个能落地的方案"。`,
    rightSummary: `在业务 / 技术 / 设计 / 运营冲突中推动决策，量级和复杂度的起点远高于普通新人 PM。`,
    leftDetail: `信阳柳林项目对外：在 3 家公司同场竞标的甲方汇报会上（甲方 6 人出席），代表公司负责甲方诉求对接与项目细节沟通板块；对内：作为项目设计主导，协调 4 人小组在 2 个多月内完成方案首次甲方交付。`,
    rightDetail: `竞标场景对应"对外推动方向对齐"，小组协调对应"对内调动跨职能资源推动交付"。规划行业的多方博弈涉及政府、资本、终端用户、生态多方且周期长达 20 年级别——实际比许多 B 端 PM 面对的协调场景更难。`,
  },
  {
    id: "03",
    leftTitle: "战略到落地的分解",
    rightTitle: "产品战略拆解",
    leftSummary: `把宏观、模糊的战略目标层层分解为可执行落地方案——总规 → 控规 → 详规。`,
    rightSummary: `PM 做战略时最核心的工作——把模糊愿景翻译为功能矩阵 + 可量化的成本与收益模型。`,
    leftDetail: `信阳柳林走完一条从精神到财务的完整分解链 —— 第一层（精神定位）："信心主题"（来信阳找信心）被总工采纳为项目定位；第二层（产品分解）：24 个规划子项目 + 核心 IP "白崖之心"独立设计；第三层（财务落地）：所有子项目建设投入估算 + 20 年期甲方贷款方案对比测算（等额本金 vs 等额本息），最终给出"等额本息为最优"的结论。`,
    rightDetail: `资金测算与金融模型对比并非规划师的本职工作——主动跨界承担。这种"既能定义产品上层精神、又能下沉到商业财务模型"的全栈能力，在 PM 工作中是稀缺组合。`,
  },
  {
    id: "04",
    leftTitle: "系统与长期思维",
    rightTitle: "系统性产品思维",
    leftSummary: `城乡规划是少数必须在多维度、长周期下做决策的学科——一个空间方案的影响往往覆盖几十年。`,
    rightSummary: `不只解决眼前功能问题，看到产品在多重系统中的位置，对中长期可持续性负责。`,
    leftDetail: `信阳柳林主动构建跨层级系统视图：精神层（信心主题）、用户层（亲子 + 户外 + 社交平台年轻群体）、产品层（24 子项目 + IP 地标）、商业层（资金测算与贷款模型）、运营层（15 年现金流测算）；让"白崖之心"IP 同时承担流量入口与精神定位视觉化两个功能。在长期视角上主动把建设期 + 运营期纳入考虑——这超出了规划师本职。`,
    rightDetail: `许多 PM 容易陷在"做单点功能优化"的视角里；规划训练给我的底层认知是"任何单点动作都要回到系统里去检验"。这是相对于纯互联网背景 PM 的关键差异点。`,
  },
  {
    id: "05",
    leftTitle: "方案表达与共识",
    rightTitle: "跨职能沟通对齐",
    leftSummary: `方案最终读者是非专业背景的人（政府、企业、居民）——把复杂方案翻译成对方能听懂的版本是规划主业的一半。`,
    rightSummary: `面对不同对象用对方关心的语言去包装同一个产品方案——PM 工作中最日常、最考验功力的一项。`,
    leftDetail: `信阳柳林项目对外（竞标）：用甲方关心的"流量与市场"语言（小红书热度 + 爆款潜力）包装规划专业判断；对内（汇报）：把复杂的设计逻辑、调研结论、资金测算压缩为决策者能快速判断的形式；协调（小组）：把方案意图清晰传达给配合的 4 人小组，确保前期分析、案例研究、总图、模型各环节朝同一方向推进。`,
    rightDetail: `面对客户 / 老板用商业与市场语言；面对工程师用功能与实现路径；面对设计师用体验与场景；面对团队用清晰方向与任务。规划训练的"对象切换语境"能力可以直接复用到产品工作。`,
  },
];

export default function CapabilityBridge() {
  const sectionRef = useRef<HTMLElement>(null);
  // 入场动画一次性触发：进入视口后置 true，并 disconnect observer
  const [visible, setVisible] = useState(false);
  // v3 表格风：哪些行处于展开状态（Set 支持多行同时展开）
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // 入场触发：当 section 至少有 15% 进入视口时启动
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // v3 表格风：点击行 toggle 展开/折叠（Set 支持多行同时展开）
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
      id="compare"
      className={`bridge${visible ? " visible" : ""}`}
    >
      {/* About Me 章节贯穿头（三幕共用，告诉 HR 还在 About Me 里） */}
      <p className="about-chapter about-chapter-sub">
        <span className="about-rule" aria-hidden />
        <span>About Me · 子幕 a · 能力对照</span>
        <span className="about-rule" aria-hidden />
      </p>

      {/* 子幕本身的标题 */}
      <header className="bridge-header">
        <h2 className="bridge-title">你凭什么能跳过来</h2>
      </header>

      {/* v3 · editorial 表格风
       *  - 黑底浅字表头（参考图同款）
       *  - 5 行能力对照，每行 hover/open 整体变深底浅字（参考图同款交互）
       *  - 点击行 toggle 展开 leftDetail + rightDetail 双栏详细描述
       *  - 键盘可达：role=button + Enter/Space toggle */}
      <div className="bridge-table">
        <div className="bridge-table-head" aria-hidden>
          <div className="bridge-row-pane bridge-row-pane-left">
            <span className="bridge-col-num">No.</span>
            <span className="bridge-col-left">城乡规划师素养</span>
          </div>
          <span className="bridge-col-sep" />
          <div className="bridge-row-pane bridge-row-pane-right">
            <span className="bridge-col-right">AI 产品经理素养</span>
            <span className="bridge-col-toggle" />
          </div>
        </div>

        {ROWS.map((row, idx) => {
          const isOpen = expanded.has(row.id);
          return (
            <div
              key={row.id}
              className={`bridge-table-row${isOpen ? " open" : ""}`}
              style={{ ["--row-i"]: idx } as React.CSSProperties}
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              onClick={() => toggle(row.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(row.id);
                }
              }}
            >
              <div className="bridge-row-summary">
                <div className="bridge-row-pane bridge-row-pane-left">
                  <span className="bridge-col-num">{row.id}</span>
                  <span className="bridge-col-left">
                    {row.leftTitle}
                    {row.flag ? (
                      <span className="bridge-flag-inline">{row.flag}</span>
                    ) : null}
                  </span>
                </div>
                <span className="bridge-col-sep" aria-hidden>
                  ↔
                </span>
                <div className="bridge-row-pane bridge-row-pane-right">
                  <span className="bridge-col-right">{row.rightTitle}</span>
                  <span className="bridge-col-toggle" aria-hidden>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </div>
              </div>

              {isOpen ? (
                <div className="bridge-row-detail">
                  <div className="bridge-detail-block bridge-detail-left">
                    <h4>城乡规划师 · 具体场景</h4>
                    <p>{row.leftDetail}</p>
                  </div>
                  <div className="bridge-detail-block bridge-detail-right">
                    <h4>AI 产品经理 · 能力翻译</h4>
                    <p>{row.rightDetail}</p>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* 收尾：承认短板 + 引导第三/四幕 */}
      <footer className="bridge-footer">
        <p className="bridge-shortcomings">
          我也清楚自己的短板——纯互联网 C 端经验、系统化用户研究方法论、代码细节层面的工程能力。
          前两项我正在用自主开发 C 端产品（Coze 失恋陪伴 / AI 情感伴侣 / 规划中的野生菌手帐）
          和系统学习方法论补；第三项是 PM 该有的合理分工，不是要去补的事。
        </p>
        <p className="bridge-segue">
          下面是具体的硬技能与项目证据。
        </p>
      </footer>
    </section>
  );
}
