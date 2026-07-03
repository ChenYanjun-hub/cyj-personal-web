"use client";

/**
 * 规划项目作品集主体（/works/planning）
 * ---------------------------------------------------------------
 * 风格参考：Easy Map studio（用户提供截图）
 *  - 巨括号「( )」画框围住中间的项目视觉，作品可上下滚动/点目录切换
 *  - 左：项目目录（当前项目黑体高亮，其余灰）
 *  - 右：项目信息栏（角色 + 标题 + 标签 + 简介 + 事实数字 + 序号计数器）
 *
 * 内容来源：md/分身知识库采集清单.md。
 * 诚实原则：知识库里只有「信阳柳林矿坑」有完整事实档案（背景/角色/决策/资金测算），
 * 其余 8 个规划项目目前只有履历汇总里的项目名 + 参与度，如实标"内容整理中"，
 * 不编造项目背景、图片或数据（与 ai-works.tsx 的诚实表达一致）。
 *
 * 交互：单页切换（用户拍板，不做独立详情页）——
 *  - 整个画框区域 wheel 手势节流切换（一次手势切一张，防止连续跳多张）
 *  - 左侧目录点击直接跳转
 *  - 上/下方向键切换（无障碍）
 *  - 视觉素材：截图/效果图尚未提供 → 占位（渐变 + 项目水印词），
 *    之后把图放进 public/works/planning/ 并填 shot 字段即自动替换。
 *
 * 为什么是 Client Component：wheel/键盘交互 + 当前项目 state。
 * 为什么整页 position:fixed：单屏工具感——不随页面滚动，只在内部切换项目
 * （参考图是固定视口的"工具"而非可滚动长页）。
 */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

/* ---------------- 数据 ---------------- */

type Fact = { num: string; label: string };

type PlanningWork = {
  id: string;
  zh: string;
  en: string;
  role: "主导" | "深度参与" | "参与";
  /** 知识库是否有完整事实档案；false = 只有项目名，右栏显示"内容整理中" */
  documented: boolean;
  tags: string[];
  desc: string;
  facts?: Fact[];
  /** 占位视觉水印词（拉丁字符） */
  mark: string;
  /** 占位视觉渐变两端色 */
  tone: [string, string];
  /** 成果图集（public 下路径数组，第一张为项目封面）· 提供后自动替换占位视觉 */
  gallery?: string[];
};

/** 生成连号图集路径：/works/planning/<id>/<start>.jpg ...（start 默认 1） */
function seqGallery(id: string, count: number, start = 1): string[] {
  return Array.from(
    { length: count },
    (_, i) =>
      `/works/planning/${id}/${String(start + i).padStart(2, "0")}.jpg`,
  );
}

const PENDING_DESC =
  "内容整理中——项目背景、具体贡献与设计产出稍后补充，暂不编造细节。";

const PLANNING_WORKS: PlanningWork[] = [
  {
    id: "xinyang-liulin",
    zh: "信阳柳林矿坑文旅项目",
    en: "Xinyang Liulin Mine Pit Tourism",
    role: "主导",
    documented: true,
    tags: ["文旅融合", "矿坑改造", "生态修复"],
    desc: `文旅融合改造项目：将河南信阳一处 75 米高的废弃白崖矿坑（工业伤疤）改造为文旅消费场景，服务生态修复、文化赋能与乡村振兴，委托方为当地文旅投资集团。总工授权担任设计主导，带 4 人小组，从 2026.03 立项介入到 5.18 完成首次甲方方案汇报。独立提出「信心主题」（来信阳找信心）作为项目定位并被采纳，主导核心 IP「白崖之心」设计、24 个规划子项目的资金测算，以及 20 年期贷款方案对比测算（等额本息最优）；主笔矿坑崖壁设计、亲水露营地设计、规划总平面 CAD 与方案鸟瞰效果图。在 3 家公司同场竞标的甲方汇报会上，基于小红书热度调研提出"该项目对年轻人具备爆款潜力"的判断，获甲方认同。`,
    facts: [
      { num: "75m", label: "废弃白崖矿坑改造" },
      { num: "24", label: "规划子项目" },
      { num: "20年", label: "贷款方案测算周期" },
    ],
    mark: "LIULIN",
    tone: ["#8a5a3a", "#1c130a"],
    // 01 = 封面图，02-33 = 成果图（按 2026.05.11 方案汇总页码顺序）
    gallery: seqGallery("xinyang-liulin", 33),
  },
  {
    id: "changfeng-auto",
    zh: "长丰汽车城战略规划项目",
    en: "Changfeng Auto City Strategic Planning",
    role: "深度参与",
    documented: false,
    tags: ["战略规划", "汽车城"],
    desc: PENDING_DESC,
    mark: "AUTO",
    tone: ["#3f5a72", "#0d151f"],
  },
  {
    id: "changfeng-fusion",
    zh: "长丰核聚变城设计项目",
    en: "Changfeng Fusion City Design",
    role: "深度参与",
    documented: false,
    tags: ["核聚变城", "城市设计"],
    desc: PENDING_DESC,
    mark: "FUSION",
    tone: ["#2f7e8f", "#0a1f24"],
  },
  {
    id: "xinyang-youth",
    zh: "信阳青年营地设计项目",
    en: "Xinyang Youth Camp Design",
    role: "深度参与",
    documented: false,
    tags: ["青年营地", "场地设计"],
    desc: PENDING_DESC,
    mark: "YOUTH",
    tone: ["#4a8a5a", "#0f2016"],
  },
  {
    id: "nanan-rural",
    zh: "南安市乡村振兴项目",
    en: "Nan'an Rural Revitalization",
    role: "深度参与",
    documented: false,
    tags: ["乡村振兴"],
    desc: PENDING_DESC,
    mark: "NANAN",
    tone: ["#a37a2e", "#241a09"],
  },
  {
    id: "hami-spatial",
    zh: "哈密市国土空间规划评估工作",
    en: "Hami Territorial Spatial Planning Evaluation",
    role: "深度参与",
    documented: false,
    tags: ["国土空间规划", "评估"],
    desc: PENDING_DESC,
    mark: "HAMI",
    tone: ["#b08a55", "#241d12"],
  },
  {
    id: "barkol-village",
    zh: "巴里坤县村庄规划项目",
    en: "Barkol County Village Planning",
    role: "参与",
    documented: false,
    tags: ["村庄规划"],
    desc: PENDING_DESC,
    mark: "BARKOL",
    tone: ["#6a7a4a", "#161c0e"],
  },
  {
    id: "xuhui-block",
    zh: "徐汇美丽街区建设项目",
    en: "Xuhui Beautiful Block Construction",
    role: "参与",
    documented: false,
    tags: ["美丽街区", "城市更新"],
    desc: PENDING_DESC,
    mark: "XUHUI",
    tone: ["#5a5a62", "#151518"],
  },
  {
    id: "lianxin-gate",
    zh: "连心门改造项目",
    en: "Lianxin Gate Renovation",
    role: "参与",
    documented: true,
    tags: ["研学活动", "历史科普", "活动摄像"],
    desc: `「百年碉堡变身记——小小梦想改造家」：面向儿童的碉堡历史科普与绘画创作研学活动。作为 5 人拍摄团队中的特写摄像师之一，专项跟拍 1-3 号儿童，覆盖参观、科普讲解、绘画创作、作品采访全环节。为解决多主体活动中「重点不遗漏、细节不平均」的问题，团队设计「全景 + 双特写分组」的分层拍摄策略，据此在各环节捕捉孩子的探索动作、专注神态与创作细节，确保每位孩子获得不少于 10 处专属特写镜头；素材按「环节 + 编号」规范整理，保障后期剪辑完整还原每个孩子的个人叙事线。同时为百年碉堡的数字化资料收集与文创拓展开展衍生工作。`,
    facts: [
      { num: "5人", label: "拍摄团队 · 特写摄像师之一" },
      { num: "1-3号", label: "专项跟拍儿童 · 全环节覆盖" },
      { num: "10+", label: "每位孩子专属特写镜头" },
    ],
    mark: "GATE",
    tone: ["#7a4a3a", "#1a0f0a"],
    // 01 = 活动视频（封面 · 点击播放），02-05 = 现场照片，06-07 = 活动封面/海报
    gallery: [
      "/works/planning/lianxin-gate/01.mp4",
      ...seqGallery("lianxin-gate", 6, 2),
    ],
  },
];

const N = PLANNING_WORKS.length;
const PAD2 = (n: number) => String(n).padStart(2, "0");

/* ---------------- Component ---------------- */

export default function PlanningWorks() {
  const [active, setActive] = useState(0);
  // 当前项目图集内的图片索引（切换项目时归零）
  const [imgIdx, setImgIdx] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const wheelLock = useRef(false);
  const timeRef = useRef<HTMLSpanElement>(null);

  // 实时时钟（同 WorksNav 手法：ref 直写避免每秒 re-render）· 白底顶栏独立实现，
  // 不复用 .aiworks-nav（那是深色主题，套在这个白底页面上会违和）
  useEffect(() => {
    const update = () => {
      const t = new Date().toLocaleTimeString("en-GB", {
        timeZone: "Asia/Shanghai",
        hour12: false,
      });
      if (timeRef.current) timeRef.current.textContent = `${t} CST`;
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const go = useCallback((i: number) => {
    setActive(Math.max(0, Math.min(N - 1, i)));
    setImgIdx(0); // 换项目回到封面
  }, []);

  // wheel 手势节流切换：一次滚动手势只切一张，冷却期内忽略后续 wheel 事件
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelLock.current || Math.abs(e.deltaY) < 8) return;
      wheelLock.current = true;
      const dir = e.deltaY > 0 ? 1 : -1;
      setActive((prev) => Math.max(0, Math.min(N - 1, prev + dir)));
      setImgIdx(0); // 换项目回到封面
      window.setTimeout(() => {
        wheelLock.current = false;
      }, 550);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const w = PLANNING_WORKS[active];
  const gallery = w.gallery ?? [];
  const galleryN = gallery.length;

  // 图集翻页（循环：尾图再翻回封面）
  const flip = useCallback(
    (dir: 1 | -1) => {
      if (galleryN < 2) return;
      setImgIdx((prev) => (prev + dir + galleryN) % galleryN);
    },
    [galleryN],
  );

  // 键盘：上/下切项目 · 左/右翻当前项目图集
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") go(active + 1);
      else if (e.key === "ArrowUp") go(active - 1);
      else if (e.key === "ArrowRight") flip(1);
      else if (e.key === "ArrowLeft") flip(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go, flip]);

  // 越界钳制：快速连续操作时（stale closure）imgIdx 可能超出新项目的图集长度，
  // 渲染前 clamp 到合法范围，避免 gallery[imgIdx] 为 undefined 崩溃
  const safeIdx = galleryN > 0 ? Math.min(imgIdx, galleryN - 1) : 0;
  const current = gallery[safeIdx];

  return (
    <main className="planning">
      {/* 黑色外框 + 白色画布（参考图"整页被画框"效果，与中间巨括号呼应） */}
      <div className="planning-canvas">
        <header className="planning-nav">
          <Link href="/" className="planning-nav-name">
            陈彦均
          </Link>
          <div className="planning-nav-links">
            <Link href="/#work">首页</Link>
            <Link href="/works/ai">AI 作品集</Link>
            <span className="planning-nav-time" ref={timeRef}>
              --:--:-- CST
            </span>
          </div>
        </header>

        <div className="planning-frame" ref={frameRef}>
        {/* 左：项目目录 */}
        <nav className="planning-index" aria-label="规划项目目录">
          {PLANNING_WORKS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={`planning-index-item${
                i === active ? " active" : ""
              }${!item.documented ? " pending" : ""}`}
              onClick={() => go(i)}
              aria-current={i === active ? "true" : undefined}
            >
              {item.zh}
            </button>
          ))}
        </nav>

        {/* 中：巨括号画框 + 项目视觉 */}
        <div className="planning-stage">
          <svg
            className="planning-bracket planning-bracket-left"
            viewBox="0 0 60 600"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d="M50 4 C 10 150, 10 450, 50 596" />
          </svg>

          <div className="planning-visual" key={w.id}>
            {galleryN > 0 && current ? (
              <>
                {current.endsWith(".mp4") ? (
                  /* 视频：不自动播放（449MB 原片已压成 web 版，仍按需加载）——
                     preload=metadata 只取首帧信息，poster 用同名 -poster.jpg 约定 */
                  <video
                    key={current}
                    src={current}
                    poster={current.replace(".mp4", "-poster.jpg")}
                    className="planning-shot"
                    controls
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={current}
                    src={current}
                    alt={`${w.zh} 成果图 ${safeIdx + 1}/${galleryN}`}
                    className="planning-shot"
                  />
                )}
                {galleryN > 1 && (
                  <>
                    <button
                      type="button"
                      className="planning-gallery-btn planning-gallery-prev"
                      onClick={() => flip(-1)}
                      aria-label="上一张成果图"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="planning-gallery-btn planning-gallery-next"
                      onClick={() => flip(1)}
                      aria-label="下一张成果图"
                    >
                      →
                    </button>
                    <span className="planning-gallery-counter" aria-hidden>
                      {safeIdx + 1} / {galleryN}
                    </span>
                  </>
                )}
              </>
            ) : (
              <div
                className="planning-ph"
                style={
                  {
                    "--tone-a": w.tone[0],
                    "--tone-b": w.tone[1],
                  } as React.CSSProperties
                }
                aria-hidden
              >
                <span className="planning-ph-mark">{w.mark}</span>
                <span className="planning-ph-note">效果图 · 整理中</span>
              </div>
            )}
          </div>

          <svg
            className="planning-bracket planning-bracket-right"
            viewBox="0 0 60 600"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d="M10 4 C 50 150, 50 450, 10 596" />
          </svg>
        </div>

        {/* 右：项目信息栏 */}
        <aside className="planning-info" key={`info-${w.id}`}>
          <div className="planning-info-body">
            <p className="planning-info-role">{w.role}</p>
            <h2 className="planning-info-title">{w.zh}</h2>
            <p className="planning-info-en">{w.en}</p>
            <p className="planning-info-tags">{w.tags.join(" · ")}</p>
            <p
              className={`planning-info-desc${
                w.documented ? "" : " pending"
              }`}
            >
              {w.desc}
            </p>
            {w.facts ? (
              <div className="planning-info-facts">
                {w.facts.map((f) => (
                  <div key={f.label} className="planning-info-fact">
                    <span className="planning-info-fact-num">{f.num}</span>
                    <span className="planning-info-fact-label">
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <p className="planning-counter">
            {PAD2(active + 1)} / {PAD2(N)}
          </p>
        </aside>
        </div>

        <footer className="planning-footer">
          <Link href="/#work" className="planning-footer-link">
            ← 返回首页作品集
          </Link>
          <Link href="/works/ai" className="planning-footer-link">
            AI 项目作品集 →
          </Link>
        </footer>
      </div>
    </main>
  );
}
