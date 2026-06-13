"use client";

/**
 * /works 系列页面共用顶栏
 * ---------------------------------------------------------------
 * 三段式：姓名（回首页）/ 城市 + 实时秒钟（绝对居中）/ 链接。
 * 从 ai-works.tsx 抽出 · 列表页与案例详情页共用（样式 .aiworks-nav 系）。
 * 时钟用 ref 直写 textContent，避免每秒 re-render（同 hero 手法）。
 */

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function WorksNav() {
  const timeRef = useRef<HTMLSpanElement>(null);

  // 实时时钟：上海时区 · 24h 带秒（参考图 "Charlotte, NC — 02:03:38 EST" 格式）
  useEffect(() => {
    const update = () => {
      const t = new Date().toLocaleTimeString("en-GB", {
        timeZone: "Asia/Shanghai",
        hour12: false,
      });
      if (timeRef.current) {
        timeRef.current.textContent = `${t} CST`;
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <nav className="aiworks-nav">
      <Link href="/" className="aiworks-nav-name">
        陈彦均 YANJUN CHEN
      </Link>
      <div className="aiworks-nav-status" aria-hidden>
        <span>SHANGHAI, CN</span>
        <span className="aiworks-nav-sep">—</span>
        <span className="aiworks-nav-time" ref={timeRef}>
          --:--:-- CST
        </span>
      </div>
      <div className="aiworks-nav-links">
        <Link href="/#work">首页</Link>
        <Link href="/works/planning">规划作品集</Link>
      </div>
    </nav>
  );
}
