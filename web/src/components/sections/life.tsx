"use client";

/**
 * 第四幕：其他 · Other（漫画卡牌版）
 * ---------------------------------------------------------------
 * 作用（PROJECT_GUIDE 第 5 节）：让 HR 从"评估你能不能干活"切换到"想认识你这个人"。
 *
 * v2 视觉/交互（用户拍板，参考 Studio375「Ten Years Away」）：
 *  - 把爱好做成一张张漫画风格纸牌，扇形漂浮排布
 *  - 指针按住左右拖拽 / 方向键 / 左右按钮切换；侧牌点击归中，中心牌点击进详情
 *  - 每张牌点击跳转 /hobbies/<slug> 详情页
 *
 * 性能：拖拽期间用 rAF 直接改 DOM（transform / z / opacity），不走 React state，
 *      避免每帧 re-render（同 hero 的节流手法）。落定时才 setActive 触发一次干净重排。
 *
 * 布局常量（spacing / angle / dip / scaleStep）放在 CSS 变量里，JS 读取后计算，
 * 这样响应式断点只改 CSS 即可，无需动 JS。
 */

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

import { HOBBIES } from "@/components/hobbies/hobbies-data";

const N = HOBBIES.length;
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

/* ---------------- 书架传送带数据 ----------------
 * 我读过的书 · 横向无限循环传送带（鼠标悬停暂停）。
 * cover：public 下封面图路径，待负责人提供后填入；为 null 时显示分类色占位。
 * tone：占位封面底色（按分类区分）。 */
type Book = {
  id: string;
  category: string;
  categoryEn: string;
  title: string | null;
  cover: string | null;
  tone: string;
};

const BOOKS: Book[] = [
  { id: "ai-1", category: "AI", categoryEn: "AI", title: null, cover: null, tone: "#2f9e8f" },
  { id: "biz-1", category: "商业", categoryEn: "BUSINESS", title: null, cover: null, tone: "#c08a2e" },
  { id: "pm-1", category: "产品", categoryEn: "PRODUCT", title: null, cover: null, tone: "#3f6fc4" },
  { id: "phi-1", category: "哲学", categoryEn: "PHILOSOPHY", title: null, cover: null, tone: "#7a55a8" },
  { id: "ai-2", category: "AI", categoryEn: "AI", title: null, cover: null, tone: "#2f9e8f" },
  { id: "biz-2", category: "商业", categoryEn: "BUSINESS", title: null, cover: null, tone: "#c08a2e" },
  { id: "pm-2", category: "产品", categoryEn: "PRODUCT", title: null, cover: null, tone: "#3f6fc4" },
  { id: "phi-2", category: "哲学", categoryEn: "PHILOSOPHY", title: null, cover: null, tone: "#7a55a8" },
];

function BookCard({ book, duplicate }: { book: Book; duplicate: boolean }) {
  return (
    <article
      className="shelf-book"
      style={{ "--cover-tone": book.tone } as React.CSSProperties}
      aria-hidden={duplicate ? true : undefined}
      title={book.title ?? `${book.category} · 书名待补`}
    >
      <div className="shelf-book-cover">
        {book.cover ? (
          <Image
            src={book.cover}
            alt={book.title ?? `${book.category}类书籍`}
            fill
            sizes="150px"
            className="shelf-book-img"
          />
        ) : (
          <div className="shelf-book-ph">
            <span className="shelf-book-ph-cat">{book.category}</span>
            <span className="shelf-book-ph-note">封面整理中</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default function Life() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(0);

  // 不触发 re-render 的可变量
  const activeRef = useRef(0);
  const consts = useRef({ spacing: 130, angle: 7, dip: 32, scaleStep: 0.07 });
  const drag = useRef({ on: false, startX: 0, dx: 0, moved: false, raf: 0 });

  const cards = () =>
    stageRef.current
      ? Array.from(
          stageRef.current.querySelectorAll<HTMLElement>(".other-card")
        )
      : [];

  // 从 CSS 变量读布局常量（mount + resize）
  const readConsts = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const num = (k: string, d: number) => {
      const v = parseFloat(cs.getPropertyValue(k));
      return Number.isFinite(v) ? v : d;
    };
    consts.current = {
      spacing: num("--card-spacing", 130),
      angle: num("--card-angle", 7),
      dip: num("--card-dip", 32),
      scaleStep: num("--card-scale-step", 0.07),
    };
  }, []);

  // 核心布局：给定（可为小数的）activeFloat，算出每张牌的 transform
  const applyLayout = useCallback((activeFloat: number, animate: boolean) => {
    const { spacing, angle, dip, scaleStep } = consts.current;
    cards().forEach((el, i) => {
      const rel = i - activeFloat;
      const ax = Math.abs(rel);
      const tx = rel * spacing;
      const ty = ax * dip; // 外侧牌向下沉 → 向下的扇形弧
      const rot = rel * angle;
      const scale = Math.max(0.72, 1 - ax * scaleStep);
      const far = ax > 3.4; // 太远的牌剔除
      el.style.transition = animate ? "" : "none";
      el.style.transform = `translate(-50%, -50%) translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg) scale(${scale})`;
      el.style.zIndex = String(100 - Math.round(ax * 10));
      el.style.opacity = far ? "0" : "1";
      el.style.pointerEvents = far ? "none" : "auto";
      el.classList.toggle("is-active", Math.round(activeFloat) === i);
    });
  }, []);

  // 入场：进入视口置 visible
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

  // mount：读常量 + 初始定位（无动画）+ resize 重排
  useEffect(() => {
    readConsts();
    applyLayout(0, false);
    const onResize = () => {
      readConsts();
      applyLayout(activeRef.current, true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [readConsts, applyLayout]);

  // active 变化：同步 ref + 带动画重排
  useEffect(() => {
    activeRef.current = active;
    applyLayout(active, true);
  }, [active, applyLayout]);

  /* ---------------- 指针拖拽 ---------------- */

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    d.on = true;
    d.startX = e.clientX;
    d.dx = 0;
    d.moved = false;
    stageRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.on) return;
    d.dx = e.clientX - d.startX;
    if (Math.abs(d.dx) > 6) d.moved = true;
    if (d.raf) return;
    d.raf = requestAnimationFrame(() => {
      d.raf = 0;
      const af = activeRef.current - d.dx / consts.current.spacing;
      applyLayout(af, false);
    });
  };

  const endDrag = () => {
    const d = drag.current;
    if (!d.on) return;
    d.on = false;
    if (d.raf) {
      cancelAnimationFrame(d.raf);
      d.raf = 0;
    }
    if (d.moved) {
      const target = clamp(
        Math.round(activeRef.current - d.dx / consts.current.spacing),
        0,
        N - 1
      );
      if (target === activeRef.current) applyLayout(target, true);
      else setActive(target);
    }
    // 未移动 = 点击：交给卡片 onClick 处理
  };

  // 卡片点击：拖拽中拦截；侧牌归中；中心牌放行导航
  const onCardClick = (i: number, e: ReactMouseEvent<HTMLAnchorElement>) => {
    if (drag.current.moved) {
      e.preventDefault();
      return;
    }
    if (i !== activeRef.current) {
      e.preventDefault();
      setActive(i);
    }
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((a) => clamp(a - 1, 0, N - 1));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setActive((a) => clamp(a + 1, 0, N - 1));
    }
  };

  const cur = HOBBIES[active];

  return (
    <section
      ref={sectionRef}
      id="life"
      className={`life${visible ? " visible" : ""}`}
    >
      {/* 装饰：右上角半调网点（漫画母题） */}
      <span className="other-halftone" aria-hidden />

      <header className="other-head">
        <p className="other-eyebrow">OTHER · 工作之外</p>
        <h2 className="other-title">
          这些<span className="other-title-accent">也是我</span>
        </h2>
        <p className="other-sub">按住左右拖动翻牌 · 点开任意一张了解更多</p>
      </header>

      {/* 卡牌舞台 · 指针拖拽 + 键盘 */}
      <div
        ref={stageRef}
        className="other-stage"
        role="group"
        aria-label="爱好卡牌 · 左右拖动切换"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        {HOBBIES.map((h, i) => (
          <Link
            key={h.slug}
            href={`/hobbies/${h.slug}`}
            className="other-card"
            style={
              {
                "--tone-a": h.tone[0],
                "--tone-b": h.tone[1],
              } as React.CSSProperties
            }
            aria-label={`${h.zh} — ${h.tagline}`}
            draggable={false}
            onClick={(e) => onCardClick(i, e)}
          >
            <span className="other-card-ribbon">{h.persona}</span>
            <span className="other-card-cover">
              <span className="other-card-glyph" aria-hidden>
                {h.glyph}
              </span>
            </span>
            <span className="other-card-foot">
              <span className="other-card-en">{h.en}</span>
              <span className="other-card-zh">{h.zh}</span>
            </span>
          </Link>
        ))}
      </div>

      {/* 控制区：上一张 / 当前爱好说明 + 进入 / 下一张 */}
      <div className="other-controls">
        <button
          type="button"
          className="other-nav-btn"
          aria-label="上一张"
          disabled={active === 0}
          onClick={() => setActive((a) => clamp(a - 1, 0, N - 1))}
        >
          ‹
        </button>

        <div className="other-caption">
          <span className="other-caption-index">
            {String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
          </span>
          <h3 className="other-caption-zh">{cur.zh}</h3>
          <p className="other-caption-tag">{cur.tagline}</p>
          <Link href={`/hobbies/${cur.slug}`} className="other-caption-cta">
            进入 {cur.en} →
          </Link>
        </div>

        <button
          type="button"
          className="other-nav-btn"
          aria-label="下一张"
          disabled={active === N - 1}
          onClick={() => setActive((a) => clamp(a + 1, 0, N - 1))}
        >
          ›
        </button>
      </div>

      {/* 书架传送带 · 横向无限循环（鼠标悬停暂停） */}
      <section className="shelf">
        <header className="shelf-head">
          <p className="other-eyebrow">BOOKSHELF · 我的书架</p>
          <p className="shelf-desc">读过的书 · 封面陆续补全（鼠标悬停暂停）</p>
        </header>
        <div className="shelf-belt">
          {/* 渲染两遍（原 + aria-hidden 副本）实现 translateX(-50%) 无缝循环 */}
          <div className="shelf-track">
            {[...BOOKS, ...BOOKS].map((b, i) => (
              <BookCard
                key={`${b.id}-${i}`}
                book={b}
                duplicate={i >= BOOKS.length}
              />
            ))}
          </div>
        </div>
      </section>

      <p className="life-segue">↓ 接下来：收尾与联系方式</p>
    </section>
  );
}
