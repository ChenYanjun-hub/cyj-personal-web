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
  honor: "24 届优秀毕业设计",
};

// 一段工作经历里同时担两个 role（a 城乡规划师 / b 宣传部新媒体）
// 每个 role 可选 lead / deep / participated 三个层级
type WorkRole = {
  title: string;
  lead?: string;
  deep?: string[];
  participated?: string[];
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
    desc: "垂类 RAG 复用于法律 / 商务场景",
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
              <p className="about-entry-line muted">{EDUCATION.honor}</p>
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
