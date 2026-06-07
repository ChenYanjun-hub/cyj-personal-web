"use client";

/**
 * 第一幕：Hero · 数字名片（v1，来自 Claude Design 设计稿）
 * ---------------------------------------------------------------
 * 视觉签名 = 鼠标十字准星 + 实时坐标（规划师 / 工程图母题的具象化）。
 * 入场动画 = 6 元素 stagger fade-in（尊重 prefers-reduced-motion）。
 * 背景 = AIGC 城市轴测线稿 + radial veil 蒙版（提升文字可读性）。
 *
 * 为什么是 Client Component：
 *  - 监听 mousemove 实时更新十字准星位置 + 坐标 + 背景视差
 *  - 用 requestAnimationFrame 节流，60fps 稳定
 *  - mount 后触发 .loaded 启动 stagger 动画
 *
 * 视觉样式都在 src/app/globals.css 末尾 ".stage / .hero / .veil / ..." 一段，
 * 类名保留 design 稿原命名，方便对照 claude design/untitled/project/Hero.html 排查。
 *
 * 六幕地图（保留作约定参考）：
 *   sections/hero.tsx              ← 第一幕（本文件）
 *   sections/capability-bridge.tsx ← 第二幕 · 能力对照
 *   sections/skills.tsx            ← 第三幕 · 能力技能
 *   sections/portfolio.tsx         ← 第四幕 · 作品集
 *   sections/life.tsx              ← 第五幕 · 视觉与生活
 *   sections/closing.tsx           ← 第六幕 · 收尾
 */

import { useEffect, useRef, useState } from "react";

// 顶部导航锚点
// v1.2 结构调整：能力对照 + 具备技能 合并为 About Me 章节
// v2 调整：删"数字名片"（Hero 自身就是名片，重复）/ "About Me" → "关于我" / "视觉与生活" → "其他"
const NAV_LINKS = [
  { href: "#about-me", label: "关于我" },
  { href: "#work", label: "作品集" },
  { href: "#life", label: "其他" },
  { href: "#contact", label: "联系方式" },
  { href: "#board", label: "留言板" },
];

// Hero 底部关键词条（自我标签）
const KEYS = ["Agent 搭建", "Vibe Coding", "艺术审美", "产品思维"];

// 顶部 Eyebrow "求职意向 / AI 产品经理" 板块的显示开关
// 当前关闭（V1 暂时不显示，主姓名 + tagline 已经能讲清求职意图）
// 想恢复显示，把下面改回 true
const SHOW_EYEBROW = false;

export default function Hero() {
  const stageRef = useRef<HTMLElement>(null);
  const coordRef = useRef<HTMLDivElement>(null);
  // 顶部 nav 左侧实时时间 ref · 不走 React state 避免每分钟 re-render 整个 Hero
  const timeRef = useRef<HTMLSpanElement>(null);
  const [loaded, setLoaded] = useState(false);
  // 窄屏汉堡菜单的开合状态（宽屏 ≥ 760px 不显示，state 也不会真正被消费）
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // mount 下一帧切到 loaded，触发 stagger 入场动画
  useEffect(() => {
    const id = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // 鼠标交互：十字准星位置 + 实时坐标（模拟地理 E/N）+ 背景轻微视差
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let raf: number | null = null;

    const onMove = (e: MouseEvent) => {
      // 节流：一帧只更新一次 CSS 变量，避免 mousemove 高频触发重绘
      if (raf !== null) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const x = e.clientX;
        const y = e.clientY;

        // 十字准星位置 = 鼠标当前坐标
        stage.style.setProperty("--cx", `${x}px`);
        stage.style.setProperty("--cy", `${y}px`);

        // 背景视差：屏幕中心为 0 偏移，越靠边缘偏移越大（最大 ±11px）
        // 负号是让背景往鼠标"反方向"漂移，模拟纵深感
        const px = (x / w - 0.5) * -22;
        const py = (y / h - 0.5) * -22;
        stage.style.setProperty("--mx", `${px.toFixed(1)}px`);
        stage.style.setProperty("--my", `${py.toFixed(1)}px`);

        // 右上角坐标：E（东向，0→1000）+ N（北向，0→1000）模拟地理读数
        if (coordRef.current) {
          const E = ((x / w) * 1000).toFixed(1).padStart(6, "0");
          const N = ((1 - y / h) * 1000).toFixed(1).padStart(6, "0");
          coordRef.current.textContent = `E ${E}  N ${N}`;
        }
      });
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  // 顶部 nav 左侧实时时间（强制上海时区，12 小时制 + CST 标识）
  // 用 ref 直接改 textContent，每分钟刷一次，避免 React re-render
  useEffect(() => {
    const updateTime = () => {
      const t = new Date().toLocaleTimeString("en-US", {
        timeZone: "Asia/Shanghai",
        hour12: true,
        hour: "numeric",
        minute: "2-digit",
      });
      if (timeRef.current) {
        timeRef.current.textContent = `${t}  CST`;
      }
    };
    updateTime(); // mount 立即显示一次
    const id = setInterval(updateTime, 60_000); // 之后每分钟刷新
    return () => clearInterval(id);
  }, []);

  // 窄屏汉堡菜单：ESC 关闭 + 打开时锁 body scroll
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <section
      ref={stageRef}
      id="card"
      className={`stage${loaded ? " loaded" : ""}`}
      // data-treat：主题（V1 固定 line；blueprint / dark / spot 留到 V2 做隐藏切换）
      data-treat="line"
      // data-layout：主题 V1 固定居中（design 稿在代码里覆盖了部分元素的对齐，但整体居中）
      data-layout="center"
      // data-cross：十字准星显示开关；触屏 / 窄屏由 CSS 自动隐藏
      data-cross="on"
    >
      {/* 背景：AIGC 城市轴测线稿 + 微视差 */}
      <div className="bg" />
      {/* Veil 蒙版：放射渐变，让中心文字读得清晰 */}
      <div className="veil" />

      {/* 十字准星 + 圆点（视觉签名）*/}
      <div className="cross">
        <div className="h" />
        <div className="v" />
        <div className="dot" />
      </div>
      {/* 实时坐标：JS 通过 ref 更新文本，不走 React state，避免每帧 re-render */}
      <div className="coord" ref={coordRef}>
        E 000.0  N 000.0
      </div>

      {/* 顶部导航：
       *  - 左侧 nav-status：● SHANGHAI, CN + 实时时间（CST）+ 上海坐标
       *  - 右侧 navlinks
       *  CSS 用 justify-content: space-between 让两组各靠边
       */}
      <nav>
        <div className="nav-status">
          <span className="nav-loc">
            <span className="nav-loc-dot" />
            <span>SHANGHAI, CN</span>
          </span>
          <span className="nav-time" ref={timeRef}>
            --:-- CST
          </span>
          <span className="nav-coord">31.2304° N, 121.4737° E</span>
        </div>

        <div className="navlinks">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>

        {/* 窄屏汉堡按钮（≤ 760px 显示，宽屏 CSS display: none） */}
        <button
          type="button"
          className="nav-hamburger"
          aria-label="打开菜单"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(true)}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <line x1="3" y1="7" x2="21" y2="7" />
            <line x1="3" y1="14" x2="21" y2="14" />
            <line x1="9" y1="21" x2="21" y2="21" />
          </svg>
        </button>

        {/* 窄屏 mobile menu overlay · 全屏 paper 色覆盖 */}
        <div
          className={`nav-mobile-menu${mobileMenuOpen ? " open" : ""}`}
          aria-hidden={!mobileMenuOpen}
        >
          <button
            type="button"
            className="nav-mobile-close"
            aria-label="关闭菜单"
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
          <ul className="nav-mobile-list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* 中央 hero 主体 */}
      <div className="hero">
        {/* Eyebrow：求职意向标签 + 中英文岗位（V1 暂时关闭，见 SHOW_EYEBROW） */}
        {SHOW_EYEBROW && (
          <div className="eyebrow reveal d1">
            <span className="label">求职意向</span>
            <span>AI 产品经理</span>
            <span className="en">AI Product Manager</span>
          </div>
        )}

        {/* 主姓名：超大字 */}
        <h1 className="name reveal d2">陈彦均</h1>

        {/* Tagline：手写马克笔体（Permanent Marker），op/em 分别上色强调 */}
        <div className="tagline reveal d3">
          1&nbsp;Person <span className="op">+</span> AI{" "}
          <span className="op">=</span>{" "}
          <span className="em">A&nbsp;Team</span>
        </div>

        {/* 身份 + 位置 caption */}
        <div className="caption reveal d4">
          YANJUN CHEN <span className="dot">·</span> 上海 Shanghai
        </div>

        {/* CTA 按钮组：实心主按钮（查看作品集）+ 幽灵副按钮（联系方式）*/}
        <div className="links reveal d5">
          <a href="#work" className="solid">
            <span className="txt">查看作品集</span>
            <span className="chev">›</span>
          </a>
          <a href="#contact">
            <span className="txt">联系方式</span>
            <span className="chev">›</span>
          </a>
        </div>

        {/* 关键词条：4 个自我标签，圆点分隔（CSS 伪元素） */}
        <div className="keys reveal d6">
          {KEYS.map((k) => (
            <span key={k}>{k}</span>
          ))}
        </div>
      </div>

      {/* 底部状态条：绿色脉冲 + 求职状态文案 */}
      <div className="footer">
        <span className="pulse" />
        <span>OPEN TO 2026 OPPORTUNITIES</span>
      </div>

      {/* Scroll 提示：双 V 形向下箭头，慢速上下浮动 */}
      <div className="scrollcue" aria-hidden="true">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
