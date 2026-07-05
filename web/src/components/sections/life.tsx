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

// 分类色：AI 青绿 / 商业金 / 产品蓝 / 哲学紫 / 生活玫红 / 城市土棕 / 设计陶橙
const BOOKS: Book[] = [
  {
    id: "biz-1",
    category: "商业",
    categoryEn: "BUSINESS",
    title: "商业分析全攻略",
    cover: encodeURI("/books/商业分析全攻略.jpg"),
    tone: "#c08a2e",
  },
  {
    id: "urban-1",
    category: "城市",
    categoryEn: "URBAN",
    title: "美国大城市的死与生",
    cover: encodeURI("/books/美国大城市的死与生.jpg"),
    tone: "#8a6a4a",
  },
  {
    id: "pm-1",
    category: "产品",
    categoryEn: "PRODUCT",
    title: "产品经理装备书",
    cover: encodeURI("/books/产品经理装备书.jpg"),
    tone: "#3f6fc4",
  },
  {
    id: "urban-2",
    category: "城市",
    categoryEn: "URBAN",
    title: "看不见的城市",
    cover: encodeURI("/books/看不见的城市.jpg"),
    tone: "#8a6a4a",
  },
  {
    id: "phi-1",
    category: "哲学",
    categoryEn: "PHILOSOPHY",
    title: "认知觉醒",
    cover: encodeURI("/books/认知觉醒.jpg"),
    tone: "#7a55a8",
  },
  {
    id: "design-1",
    category: "设计",
    categoryEn: "DESIGN",
    title: "引爆灵感",
    cover: encodeURI("/books/引爆灵感.jpg"),
    tone: "#c25e3a",
  },
  {
    id: "urban-3",
    category: "城市",
    categoryEn: "URBAN",
    title: "江村经济",
    cover: encodeURI("/books/江村经济.jpg"),
    tone: "#8a6a4a",
  },
  {
    id: "urban-4",
    category: "城市",
    categoryEn: "URBAN",
    title: "东京代谢",
    cover: encodeURI("/books/东京代谢.jpg"),
    tone: "#8a6a4a",
  },
  {
    id: "pm-2",
    category: "产品",
    categoryEn: "PRODUCT",
    title: "Shape Up",
    cover: encodeURI("/books/SHAPE UP！图形.jpg"),
    tone: "#3f6fc4",
  },
  {
    id: "urban-5",
    category: "城市",
    categoryEn: "URBAN",
    title: "城村共生",
    cover: encodeURI("/books/城村共生.jpg"),
    tone: "#8a6a4a",
  },
  {
    id: "design-2",
    category: "设计",
    categoryEn: "DESIGN",
    title: "膨胀的艺术",
    cover: encodeURI("/books/膨胀的艺术.jpg"),
    tone: "#c25e3a",
  },
  {
    id: "urban-6",
    category: "城市",
    categoryEn: "URBAN",
    title: "隐形逻辑",
    cover: encodeURI("/books/隐形逻辑.jpg"),
    tone: "#8a6a4a",
  },
  {
    id: "life-1",
    category: "生活",
    categoryEn: "LIFE",
    title: "一个人的四季餐桌",
    cover: encodeURI("/books/一个人的四季餐桌.jpg"),
    tone: "#b8556e",
  },
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
  // active 不再 clamp，可无限增减（环形）；显示用的索引另取模
  const activeRef = useRef(0);
  // 圆弧布局常量：step=每张牌的圆心角(deg)，radius=圆弧半径(px，越大越平)
  const consts = useRef({ step: 10, radius: 1600, scaleStep: 0.04 });
  const drag = useRef({ on: false, startX: 0, dx: 0, moved: false, raf: 0 });
  // 拖拽：把像素位移换算成"翻了几张" → 用近中心的水平步距（弦长 radius·sin(step)）
  const dragSpacing = () =>
    consts.current.radius *
    Math.sin((consts.current.step * Math.PI) / 180);
  // 每张牌上一帧的环形 rel，用于检测"跨接缝回绕"以瞬移
  const prevRels = useRef<number[]>([]);

  // 环形最近距离：把 (i - activeFloat) 折到 [-N/2, N/2]
  const circRel = (i: number, activeFloat: number) => {
    let rel = ((i - activeFloat) % N + N) % N;
    if (rel > N / 2) rel -= N;
    return rel;
  };
  const modIdx = (v: number) => ((Math.round(v) % N) + N) % N;

  const cards = () =>
    stageRef.current
      ? Array.from(
          stageRef.current.querySelectorAll<HTMLElement>(".other-card")
        )
      : [];

  // 按视口宽度计算弧的布局常量（mount + resize）
  // 注意：不要把 radius 放进 CSS 自定义属性再用 getComputedStyle 读——clamp() 不会被解析成
  // px（返回字面串），parseFloat 得 NaN，会一直回退默认值。弧常量是行为参数，直接 JS 算最稳。
  // radius 决定相邻牌中心距（弦长 ≈ radius·sin(step)）→ 越大牌越疏。
  const readConsts = useCallback(() => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
    const mobile = vw <= 760;
    consts.current = mobile
      ? { step: 12, radius: clamp(4.2 * vw, 1300, 1750), scaleStep: 0.06 }
      : { step: 10, radius: clamp(1.3 * vw, 1150, 2800), scaleStep: 0.04 };
  }, []);

  // 核心布局：把牌摆在一个大圆弧上（位置/旋转/下沉由 半径+角度 耦合，像参考图那样
  // 一张张分开、平铺无 3D、阶梯状下沉），activeFloat 可为小数（环形）
  const applyLayout = useCallback((activeFloat: number, animate: boolean) => {
    const { step, radius, scaleStep } = consts.current;
    const activeIdx = modIdx(activeFloat);
    cards().forEach((el, i) => {
      const rel = circRel(i, activeFloat); // 环形最近距离 → 一侧滑出、另一侧转入
      const ax = Math.abs(rel);
      const phi = (rel * step * Math.PI) / 180; // 该牌在圆弧上的角度
      const tx = radius * Math.sin(phi); // 沿弧水平展开
      const ty = radius * (1 - Math.cos(phi)); // 沿弧向下沉（两侧都更低 → 微笑弧）
      const rotZ = rel * step; // 切向旋转（与位置耦合，自然不别扭）
      const scale = Math.max(0.82, 1 - ax * scaleStep); // 尺寸接近，中心仅略大
      const op = clamp(1 - (ax - 2.2) / 1.0, 0, 1); // ±2 仍满显（在视口边缘被裁露一截）
      const far = ax > 2.9;
      // 跨接缝回绕（rel 突变 > N/2）的牌：本帧不过渡，瞬移到另一侧（此刻它在背面已隐形）
      const prev = prevRels.current[i];
      const wrapped = prev !== undefined && Math.abs(rel - prev) > N / 2;
      prevRels.current[i] = rel;
      const smooth = animate && !wrapped;
      el.style.transition = smooth ? "" : "none";
      // 落定时按距离加延迟 → 沿弧涟漪式归位（拖拽中 / 瞬移无延迟）
      el.style.transitionDelay = smooth ? `${(ax * 0.04).toFixed(3)}s` : "0s";
      el.style.transform = `translate(-50%, -50%) translateX(${tx.toFixed(1)}px) translateY(${ty.toFixed(1)}px) rotateZ(${rotZ.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      el.style.zIndex = String(100 - Math.round(ax * 10));
      el.style.opacity = op.toFixed(3);
      el.style.pointerEvents = far ? "none" : "auto";
      el.classList.toggle("is-active", activeIdx === i);
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
      const af = activeRef.current - d.dx / dragSpacing();
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
      // 不 clamp：环形可无限增减
      const target = Math.round(activeRef.current - d.dx / dragSpacing());
      if (target === activeRef.current) applyLayout(target, true);
      else setActive(target);
    }
    // 未移动 = 点击：交给卡片 onClick 处理
  };

  // 卡片点击：拖拽中拦截；侧牌走环形最近路径归中；中心牌放行导航
  const onCardClick = (i: number, e: ReactMouseEvent<HTMLAnchorElement>) => {
    if (drag.current.moved) {
      e.preventDefault();
      return;
    }
    if (i !== modIdx(activeRef.current)) {
      e.preventDefault();
      // 沿最近一侧把第 i 张转到中心
      let d = ((i - modIdx(activeRef.current)) % N + N) % N;
      if (d > N / 2) d -= N;
      setActive((a) => a + d);
    }
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((a) => a - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setActive((a) => a + 1);
    }
  };

  const cur = HOBBIES[modIdx(active)];

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
            {/* 飘动层：异步浮动（负 delay 错开相位 + 微调时长，像风里的纸） */}
            <span
              className="other-card-float"
              style={{
                animationDelay: `-${(i * 0.8).toFixed(2)}s`,
                animationDuration: `${(5.6 + (i % 3) * 0.7).toFixed(2)}s`,
              }}
            >
              <span
                className={`other-card-page${h.image ? " has-img" : ""}`}
              >
                {h.image ? (
                  <Image
                    src={h.image}
                    alt={`${h.zh} · ${h.persona} 漫画卡牌`}
                    fill
                    sizes="(max-width: 760px) 60vw, 320px"
                    className="other-card-img"
                    draggable={false}
                  />
                ) : (
                  <span className="other-card-glyph" aria-hidden>
                    {h.glyph}
                  </span>
                )}
              </span>
              <span className="other-card-label">{h.persona}</span>
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
          onClick={() => setActive((a) => a - 1)}
        >
          ‹
        </button>

        <div className="other-caption">
          <span className="other-caption-index">
            {String(modIdx(active) + 1).padStart(2, "0")} /{" "}
            {String(N).padStart(2, "0")}
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
          onClick={() => setActive((a) => a + 1)}
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
