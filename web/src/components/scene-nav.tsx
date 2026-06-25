"use client";

/**
 * 幕导航 · 右侧引导栏 + 左下 UP/NEXT + GSAP 幕布切场（仅首页）
 * ---------------------------------------------------------------
 * 5 幕（About Me 三子幕合一）：名片 / 关于我 / 作品集 / Other / 联系。
 *  - 右侧竖向圆点：点击跳到对应幕，hover/当前显示幕名
 *  - 左下 UP / NEXT：跳上一/下一幕，首幕隐藏 UP、末幕隐藏 NEXT
 *  - 全局锚点拦截：顶部导航 / 汉堡菜单 / CTA / 留言板等指向「其它幕」的
 *    #链接，统一走 GSAP 幕布切场，并精确跳到锚点本体（如 #board）
 *  - 幕布切场：有方向地扫幕盖屏 → 盖住瞬间瞬时跳 → 揭幕，盖屏时显示目标幕名 + 序号
 *  - 当前幕判定：取"顶部已越过视口 35% 线"的最后一幕（compare/skills 归到关于我）
 *  - prefers-reduced-motion 时退回原生跳转、无幕布动画（吸附在 CSS 同步关）
 *
 * 纯叠加：不改各幕内部 / 不碰 Life 拖拽 / Closing 留言板。自由滚动与幕内小跳不触发幕布。
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// bg = 该幕主题背景色（幕布切场用之）；留空 → CSS 兜底橙色（.scene-curtain）
const SCENES = [
  { id: "card", label: "名片", bg: "" },
  { id: "about-me", label: "关于我", bg: "#4a5c0e" },
  { id: "work", label: "作品集", bg: "#b85a35" },
  { id: "life", label: "Other", bg: "" },
  { id: "contact", label: "联系", bg: "#16140f" },
] as const;

const LAST = SCENES.length - 1;
const PAD2 = (n: number) => String(n).padStart(2, "0");

export default function SceneNav() {
  const activeRef = useRef(0);
  const animatingRef = useRef(false);
  // 当前幕 → 驱动引导栏高亮 / UP·NEXT 显隐（仅这点用 state）
  const railRef = useRef<HTMLElement>(null);
  const upRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);

  // 命令式刷新「当前幕」相关 UI（不用 state，避免每次滚动 re-render）
  const paint = (idx: number) => {
    railRef.current
      ?.querySelectorAll(".scene-dot")
      .forEach((d, i) => d.classList.toggle("on", i === idx));
    if (upRef.current) upRef.current.disabled = idx === 0;
    if (nextRef.current) nextRef.current.disabled = idx === LAST;
  };

  // 当前幕：顶部越过视口 35% 线的最后一幕（关于我覆盖 compare/skills 三屏）
  useEffect(() => {
    const els = SCENES.map((s) => document.getElementById(s.id));
    const onScroll = () => {
      const line = window.innerHeight * 0.35;
      let idx = 0;
      els.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= line) idx = i;
      });
      if (idx !== activeRef.current) {
        activeRef.current = idx;
        paint(idx);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { contextSafe } = useGSAP({ scope: rootRef });

  const jumpEl = (id: string) =>
    document.getElementById(id)?.scrollIntoView({
      behavior: "auto",
      block: "start",
    });

  // 幕布切场：扫幕盖屏 → 盖住瞬间瞬时跳到 targetId → 揭幕（方向跟随上一/下一）
  const runCurtain = contextSafe(
    (targetId: string, destIdx: number, down: boolean) => {
      const curtain = curtainRef.current;
      const inner = innerRef.current;
      if (!curtain || !inner) {
        jumpEl(targetId);
        return;
      }
      // 命令式写幕名/序号，避免 React state 异步导致显示上一幕
      if (nameRef.current) nameRef.current.textContent = SCENES[destIdx].label;
      if (indexRef.current)
        indexRef.current.textContent = `${PAD2(destIdx + 1)} / ${PAD2(
          SCENES.length
        )}`;
      // 幕布底色 = 目标幕主题色；留空则清掉内联样式 → 回落 CSS 兜底橙
      curtain.style.background = SCENES[destIdx].bg;
      animatingRef.current = true;
      gsap
        .timeline({
          defaults: { ease: "power3.inOut" },
          onComplete: () => {
            animatingRef.current = false;
          },
        })
        .set(curtain, {
          autoAlpha: 1,
          scaleY: 0,
          transformOrigin: down ? "50% 100%" : "50% 0%",
        })
        .set(inner, { autoAlpha: 0, y: down ? 24 : -24 })
        .to(curtain, { scaleY: 1, duration: 0.4 })
        .to(
          inner,
          { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out" },
          "-=0.18"
        )
        .add(() => jumpEl(targetId))
        .to(
          inner,
          {
            autoAlpha: 0,
            y: down ? -24 : 24,
            duration: 0.22,
            ease: "power2.in",
          },
          "+=0.12"
        )
        .set(curtain, { transformOrigin: down ? "50% 0%" : "50% 100%" })
        .to(curtain, { scaleY: 0, duration: 0.4 })
        .set(curtain, { autoAlpha: 0 });
    }
  );

  // 统一入口：targetId = 滚动目标元素，destIdx = 所属幕（用于方向/幕名）
  const navigate = (targetId: string, destIdx: number) => {
    if (animatingRef.current) return;
    const down = destIdx > activeRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      jumpEl(targetId);
      return;
    }
    runCurtain(targetId, destIdx, down);
  };
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  // 圆点 / UP / NEXT
  const go = (i: number) => {
    const target = Math.max(0, Math.min(LAST, i));
    if (target === activeRef.current) return;
    navigate(SCENES[target].id, target);
  };

  // 全局拦截：指向「其它幕」的 #锚点（顶部导航 / 汉堡 / CTA / 留言板）走幕布
  useEffect(() => {
    const sceneOf = (el: Element) => {
      const top = el.getBoundingClientRect().top;
      let idx = 0;
      SCENES.forEach((s, i) => {
        const sec = document.getElementById(s.id);
        if (sec && sec.getBoundingClientRect().top <= top + 1) idx = i;
      });
      return idx;
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      const a = (e.target as HTMLElement)?.closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")!.slice(1);
      if (!id) return;
      const targetEl = document.getElementById(id);
      if (!targetEl) return;
      const destIdx = sceneOf(targetEl);
      // 幕内小跳（目标就在当前幕，如 #compare/#skills/同幕 #board）→ 保持原生
      if (destIdx === activeRef.current) return;
      e.preventDefault();
      navigateRef.current(id, destIdx);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div ref={rootRef}>
      <nav className="scene-rail" aria-label="幕导航" ref={railRef}>
        {SCENES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`scene-dot${i === 0 ? " on" : ""}`}
            onClick={() => go(i)}
            aria-label={`跳到「${s.label}」`}
          >
            <span className="scene-dot-label">{s.label}</span>
            <span className="scene-dot-mark" aria-hidden />
          </button>
        ))}
      </nav>

      <div className="scene-jump">
        <button
          type="button"
          className="scene-jump-btn"
          ref={upRef}
          onClick={() => go(activeRef.current - 1)}
          disabled
          aria-label="上一幕"
        >
          <span className="scene-jump-arrow" aria-hidden>
            ↑
          </span>
          <span className="scene-jump-dir">UP</span>
        </button>
        <button
          type="button"
          className="scene-jump-btn"
          ref={nextRef}
          onClick={() => go(activeRef.current + 1)}
          aria-label="下一幕"
        >
          <span className="scene-jump-dir">NEXT</span>
          <span className="scene-jump-arrow" aria-hidden>
            ↓
          </span>
        </button>
      </div>

      {/* GSAP 幕布切场覆盖层（默认隐藏） */}
      <div className="scene-curtain" ref={curtainRef} aria-hidden>
        <div className="scene-curtain-inner" ref={innerRef}>
          <span className="scene-curtain-name" ref={nameRef}>
            {SCENES[0].label}
          </span>
          <span className="scene-curtain-index" ref={indexRef}>
            01 / {PAD2(SCENES.length)}
          </span>
        </div>
      </div>
    </div>
  );
}
