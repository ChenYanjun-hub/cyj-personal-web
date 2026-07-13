"use client";

/**
 * 第二幕（主体）：About Me · 我是谁
 * ---------------------------------------------------------------
 * 设计方向：严格按用户提供的 LIUWENTAO 参考图复刻。
 * 关键原则：
 *  - 左右双栏（左照片+姓名 / 右 About me + 板块）
 *  - 纯黑白单色，零 accent 装饰，靠留白和字号层级
 *  - 板块标题全大写英文，内容中文，简历感
 *  - 底部"能力对照 ↓ / 具备技能 ↓"文字锚词替代彩色按钮
 *
 * 数据：南京工业大学 城乡规划 5 年 + 同济规划院子公司 1 年 + 3 个 AI 项目
 * 待负责人提供：本人照片（占位见 portrait-placeholder）
 *
 * 字符串：长 note 用反引号 `` 避免内层中文/英文混排引号潜在 build 问题。
 */

import { useEffect, useRef, useState } from "react";

// 第三方：reactbits.dev 的 ProfileCard（3D 倾斜 + holographic 反光）
// 通过 `npx jsrepo@latest add` 拉到 src/components/reactbits/
// 国内可达，组件本身只用 React hooks + CSS（无 motion/three 等重型依赖）
import ProfileCard from "@/components/reactbits/ProfileCard";
import type { MouseEvent as ReactMouseEvent } from "react";

// v2.1: ABOUT 标题文本拆字符 · 用于每字母独立 hover 动画
const ABOUT_TITLE_CHARS = "ABOUT YANJUN CHEN".split("");

// 动画时长（必须与 globals.css 里 letter-fly-cycle 的 duration 一致）
const LETTER_CYCLE_MS = 650;

// 单字母 hover handler · 用 setTimeout 兜底，不依赖 onAnimationEnd（React fast refresh 后偶尔不绑）
function handleLetterEnter(e: ReactMouseEvent<HTMLSpanElement>) {
  const el = e.currentTarget;
  if (el.classList.contains("cycling")) return;
  el.classList.add("cycling");
  window.setTimeout(() => {
    el.classList.remove("cycling");
  }, LETTER_CYCLE_MS + 20);
}

const EDUCATION = {
  date: "2019.09 — 2024.06",
  org: "南京工业大学",
  detail: "城乡规划 · 本科五年制",
  // a 在校荣誉 / b 竞赛经历（套用 WORK 的 a、/b、 marker 排版）
  honors: [
    "GPA 3.61/4.0（排名专业前 25%）",
    "校级奖学金 二等 3 次、三等 3 次",
    "校级优秀毕业设计",
    "学生会摄影部副部长",
    "大创项目负责人",
  ],
  awards: [
    "「华设杯」第三届江苏省大学生国土空间规划大赛 二等奖",
    "KTK 靳埭强设计奖 2023 优秀奖",
    "第十届「共享杯」科技资源共享服务创新大赛 优秀奖",
    "建筑学院微空间改造设计竞赛 优秀奖",
  ],
};

// 一段工作经历里同时担三个 role（a 城乡规划师 / b AI 产品经理 / c 宣传部新媒体）
// 每个 role 可选 lead / deep / participated 三个层级；AI 角色用 items 编号条（head + body）
type WorkRole = {
  title: string;
  lead?: string;
  deep?: string[];
  participated?: string[];
  items?: { head: string; body: string }[];
};

const WORK: {
  date: string;
  org: string;
  detail: string;
  roles: WorkRole[];
} = {
  date: "2025.04 — 2026.05",
  org: "同济规划设计研究院分院",
  detail: "下属上海隆际建筑规划设计有限公司",
  roles: [
    {
      title: "城乡规划师",
      lead: "信阳柳林矿坑文旅项目",
      deep: [
        "长丰汽车城战略规划项目",
        "长丰核聚变城设计项目",
        "信阳青年营地设计项目",
        "南安市乡村振兴项目",
        "哈密市国土空间规划评估工作",
      ],
      participated: [
        "巴里坤县村庄规划项目",
        "徐汇美丽街区建设项目",
        "连心门改造项目",
      ],
    },
    {
      title: "AI 产品经理",
      items: [
        {
          head: "探索「专业设计能力 + AI 工具」的新型生产模式，主导 AIGC 效果图工作流落地",
          body: "基于规划设计项目的效果图生产需求，调研传统流程在周期、成本和风格一致性上的痛点，提出 AIGC 辅助设计方案并推动落地。负责 AI 应用场景定义与工作流设计，成功推动 5 个项目引入 AIGC 图像生成与渲染，将效果图生产拆解为需求输入 → 空间信息提取 → 提示词生成 → 图像渲染 → 结果筛选 → 人工优化的可复用业务流程；根据空间尺度、建筑风格、功能业态和汇报场景设计差异化提示词与生成策略，通过多轮生成、局部重绘和参数调整控制输出。为团队提供工具、提示词与成果优化支持，降低使用门槛，团队渲染效果图效率提升约 48%。",
        },
        {
          head: "作为 AI 产品经理，主导公司内部 AI 产品从 0→1 落地",
          body: "负责【同舟建景规范问答助手】与【合同审查助手】两个垂直场景 RAG 产品的全流程（需求定义、PRD 撰写、技术选型、知识库构建、评测体系、红线治理、迭代决策），并以 AI 辅助编码完成原型落地。把「设计师跨 89 部规范翻 PDF」「购销合同初审靠人工」等真实痛点，转化为可演示、可联调、可追溯的 AI 工作台；自建多维评测 + 一票否决机制管控幻觉与编造风险，将编造类红线维度做到工程可控（≥94%），沉淀完整 PRD 与可迁移的 AI 产品方法论。（详见 AI 项目作品集）",
        },
        {
          head: "总结实践经验，牵头编写单位内部《大模型训练手册》",
          body: "围绕大模型认知、Prompt 方法、业务场景、工具操作和风险规范构建内容体系，将个人实践沉淀为团队可复用的知识产品；持续收集同事在 AI 工具使用中的问题与反馈，迭代操作方法、提示词模板与培训内容，提升团队对生成式 AI 的理解与使用效率。",
        },
      ],
    },
    {
      title: "宣传部新媒体宣传",
      deep: [
        "长丰汽车城战略规划项目宣传视频剪辑",
        "同济规划院宣传部数字人+LOGO 设计",
        "规划院青年-曹威宜访谈-综艺感宣传视频剪辑",
      ],
    },
  ],
};

const AI_PROJECTS = [
  {
    name: "云上米轨",
    desc: "滇越铁路垂直领域数字化知识服务平台 · BtoBtoC",
  },
  {
    name: "建景规规范问答助手",
    desc: "toB · 垂类 RAG 知识助手",
  },
  {
    name: "合同审查助手",
    desc: "toB · AI Workflow · 垂直场景 MVP",
  },
];

export default function AboutMe() {
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

  // v2：双向 observer · 把 about 幕的可见状态写到 body[data-section]
  // 用途：在 about 幕（橄榄绿底）滚到时，让 fixed nav 文字色自动切换为米黄
  // 阈值 0.3：视口里 30% 是 about 内容才算"进入"，避免边缘抖动
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            document.body.dataset.section = "about";
          } else if (document.body.dataset.section === "about") {
            delete document.body.dataset.section;
          }
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(node);
    return () => {
      obs.disconnect();
      if (document.body.dataset.section === "about") {
        delete document.body.dataset.section;
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about-me"
      className={`about${visible ? " visible" : ""}`}
    >
      {/* 居中大标题：ABOUT YANJUN CHEN
       * v2 巨字 Bebas Neue condensed 撑满 viewport
       * v2.1 每个字母 hover 触发 "向左滑出 + 从右划入归位" cycle 动画
       *  - aria-label 给屏幕阅读器完整文本
       *  - 子 span aria-hidden 跳过逐字读 */}
      <h2 className="about-title" aria-label="ABOUT YANJUN CHEN">
        {ABOUT_TITLE_CHARS.map((ch, i) =>
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

      <div className="about-grid">
        {/* 左栏：ProfileCard（3D 倾斜 holographic 卡片，me.png 当 avatar）+ 大字拼音姓名 */}
        <div className="about-left">
          {/*
            ProfileCard 来自 reactbits.dev（JS-CSS 版）。
            - avatarUrl 用 /me.png（包含照片 + 名字 + 学校的完整人物名片）
            - name / title 是 ProfileCard 底部小字
            - showUserInfo=false：关掉默认的 mini-avatar + handle + Contact 板块
              （这一坨和右栏的内容会重复；保留 details 即可）
            - enableTilt=true：鼠标 hover 时 3D 倾斜
            - 默认 holographic 内层渐变（蓝紫色）+ behind glow
          */}
          <ProfileCard
            avatarUrl="/me.png"
            iconUrl="/pc-icon.png"
            grainUrl="/pc-grain.webp"
            name="陈彦均"
            title="AI Product Manager"
            handle="ChenYanjun-hub"
            status="Open to 2026"
            contactText="Contact"
            showUserInfo={false}
            enableTilt={true}
            enableMobileTilt={false}
          />

          {/* 大字拼音姓名 — 视觉上承载左下角的"签名感"（参考图 LIUWENTAO 的处理） */}
          <p className="about-signature">CHEN YANJUN</p>
        </div>

        {/* 右栏：4 个板块 */}
        <div className="about-right">
          {/* EDUCATION */}
          <section className="about-block">
            <h3 className="about-block-title">EDUCATION</h3>
            <div className="about-entry">
              <p className="about-entry-line">{EDUCATION.org}</p>
              <p className="about-entry-line">
                {EDUCATION.detail} ｜ {EDUCATION.date}
              </p>
              <p className="about-entry-line muted">
                <span className="work-role-marker">a、</span>
                {EDUCATION.honors.join("；")}
              </p>
              <p className="about-entry-line muted">
                <span className="work-role-marker">b、</span>
                竞赛经历：{EDUCATION.awards.join("、")}
              </p>
            </div>
          </section>

          {/* WORK EXPERIENCE
           *  这一段工作经历同时担两个 role（a 城乡规划师 / b 宣传部新媒体），
           *  每个 role 内可有 主导 / 深度参与 / 参与 三个层级（按需出现）。
           *  排版策略：role 之间留间距，每个层级一行 + 自然换行（line-height 1.6） */}
          <section className="about-block">
            <h3 className="about-block-title">WORK EXPERIENCE</h3>
            <div className="about-entry">
              <p className="about-entry-line">{WORK.org}</p>
              <p className="about-entry-line">
                {WORK.detail} ｜ {WORK.date}
              </p>
              {WORK.roles.map((role, idx) => (
                <div key={role.title} className="work-role-block">
                  <p className="about-entry-line">
                    <span className="work-role-marker">
                      {String.fromCharCode(97 + idx)}、
                    </span>
                    {role.title}
                  </p>
                  {role.lead ? (
                    <p className="about-entry-line muted">主导：{role.lead}</p>
                  ) : null}
                  {role.deep ? (
                    <p className="about-entry-line muted">
                      深度参与：{role.deep.join("、")}
                    </p>
                  ) : null}
                  {role.participated ? (
                    <p className="about-entry-line muted">
                      参与：{role.participated.join("、")}
                    </p>
                  ) : null}
                  {role.items?.map((it, i) => (
                    <div key={i} className="work-item">
                      <p className="about-entry-line">
                        {i + 1}、{it.head}
                      </p>
                      <p className="about-entry-line muted">{it.body}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* AI PROJECTS */}
          <section className="about-block">
            <h3 className="about-block-title">AI PROJECTS</h3>
            <div className="about-entry">
              {AI_PROJECTS.map((p) => (
                <p key={p.name} className="about-entry-line">
                  <span className="project-name">{p.name}</span>
                  <span className="project-sep" aria-hidden>
                    {" "}
                    ｜{" "}
                  </span>
                  <span className="muted">{p.desc}</span>
                </p>
              ))}
            </div>
          </section>

          {/* 子幕跳转：参考图里 "Project" 风格的极简锚词 */}
          <section className="about-block">
            <h3 className="about-block-title">SEE MORE</h3>
            <div className="about-jumps">
              <a href="#compare" className="about-jump">
                能力对照
                <span className="jump-arrow" aria-hidden>
                  ↓
                </span>
              </a>
              <a href="#skills" className="about-jump">
                具备技能
                <span className="jump-arrow" aria-hidden>
                  ↓
                </span>
              </a>
            </div>
          </section>
        </div>
      </div>

      {/* 底部居中 Project 风格滚动提示 */}
      <p className="about-scrollcue" aria-hidden>
        Project
      </p>
    </section>
  );
}
