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

const EDUCATION = {
  date: "2019.09 — 2024.06",
  org: "南京工业大学",
  detail: "城乡规划 · 本科五年制",
  honor: "24 届优秀毕业设计",
};

const WORK = {
  date: "2025.04 — 2026.05",
  org: "同济规划设计研究院分院",
  detail: "下属上海隆际建筑规划设计有限公司",
  role: "城乡规划师 · 主导信阳柳林矿坑文旅项目",
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

  return (
    <section
      ref={sectionRef}
      id="about-me"
      className={`about${visible ? " visible" : ""}`}
    >
      {/* 居中大标题：About me */}
      <h2 className="about-title">About me</h2>

      <div className="about-grid">
        {/* 左栏：人物照片 + 大字拼音姓名 */}
        <div className="about-left">
          <div className="about-portrait">
            {/* TODO【负责人】：替换为本人照片
                做法：把竖向长方形人物照（推荐 3:4 或 4:5 比例）放到 web/public/me.jpg
                然后下面 placeholder 整块替换为 <img src="/me.jpg" alt="陈彦均" /> */}
            <div className="portrait-placeholder">
              <span>陈彦均</span>
              <span className="portrait-tip">PORTRAIT · TBD</span>
            </div>
          </div>

          {/* 大字拼音姓名 — 视觉上承载左下角的"签名感" */}
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

          {/* WORK EXPERIENCE */}
          <section className="about-block">
            <h3 className="about-block-title">WORK EXPERIENCE</h3>
            <div className="about-entry">
              <p className="about-entry-line">{WORK.org}</p>
              <p className="about-entry-line">
                {WORK.detail} ｜ {WORK.date}
              </p>
              <p className="about-entry-line muted">{WORK.role}</p>
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
