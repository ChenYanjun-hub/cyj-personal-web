"use client";

/**
 * 第四幕：视觉与生活 · Life & Vision
 * ---------------------------------------------------------------
 * 作用（PROJECT_GUIDE 第 5 节）：让 HR 从"评估你能不能干活"切换到"想认识你这个人"。
 * 基调：克制的真诚 — 不要变成朋友圈 / 生活秀。
 *
 * 三板块：
 *  - GALLERY  视觉创作（主体）：素描 8 级证书 + 多媒介作品 + AIGC
 *  - CRAFT    生活切片（轻量）：3D 打印 + 骑行
 *  - BOOKSHELF 我的书架（杀招）：四类（AI / 商业 / PM / 哲学）+ 一句感想
 *
 * 素材状态：除了素描 8 级（已知事实）+ AIGC 1 张（hero-bg.png 已有），
 * 其余几乎全部待负责人补全。当前用占位提示传达"待补"状态。
 *
 * 视觉延续 About Me / Portfolio：纯黑白 / 全大写英文板块标题 / hairline / 克制留白。
 */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* ---------------- 数据 ---------------- */

/** 视觉创作作品（GALLERY 板块）·  每张图配标题 + 媒介 + 一句话 */
type Artwork = {
  id: string;
  /** 静态路径 web/public/... ，待补全时为 null（显示占位） */
  src: string | null;
  /** 媒介：素描 / 水彩 / 刀画 / 丙烯 / 速写 / AIGC / 摄影 */
  medium: string;
  title: string;
  /** 一句话 — 这张作品的故事或我的想法 */
  note: string;
};

const ARTWORKS: Artwork[] = [
  {
    id: "city-axonometric",
    src: "/hero-bg.png",
    medium: "AIGC",
    title: "城市轴测",
    note: "带专业知识在用 AI · 这张图身上的规划标注是 AIGC 中很少做对的细节。",
  },
  {
    id: "sketch-1",
    src: null,
    medium: "素描",
    title: "TBD",
    note: "待负责人选图 · 推荐人物 / 静物代表作",
  },
  {
    id: "watercolor-1",
    src: null,
    medium: "水彩",
    title: "TBD",
    note: "待负责人选图",
  },
  {
    id: "knife-1",
    src: null,
    medium: "刀画",
    title: "TBD",
    note: "待负责人选图",
  },
  {
    id: "acrylic-1",
    src: null,
    medium: "丙烯",
    title: "TBD",
    note: "待负责人选图",
  },
  {
    id: "photo-1",
    src: null,
    medium: "摄影",
    title: "TBD",
    note: "待负责人选图",
  },
];

/** 生活切片（CRAFT 板块） · 一两句话点到即止 */
type CraftItem = {
  id: string;
  /** 待补全时 null */
  src: string | null;
  title: string;
  note: string;
};

const CRAFTS: CraftItem[] = [
  {
    id: "3d-print",
    src: null,
    title: "3D 打印",
    note: "爱动手 · 把想法变成实物。待负责人补全图片与一句感想。",
  },
  {
    id: "cycling",
    src: null,
    title: "骑行",
    note: "活力与探索 · 待负责人补全图片与一句感想。",
  },
];

/** 书架（BOOKSHELF 板块） · 四类 · 每本一句感想 */
type Book = {
  title: string;
  /** 一句感想 — 待负责人补全时为 null */
  note: string | null;
};

type Shelf = {
  category: string;
  /** 中文标签 */
  zhCategory: string;
  books: Book[];
};

/** TODO【负责人】：把真正读过的书填进来，每本配一句感想 */
const SHELVES: Shelf[] = [
  {
    category: "AI",
    zhCategory: "AI",
    books: [
      { title: "（待补）", note: null },
      { title: "（待补）", note: null },
    ],
  },
  {
    category: "BUSINESS",
    zhCategory: "商业分析",
    books: [
      { title: "（待补）", note: null },
      { title: "（待补）", note: null },
    ],
  },
  {
    category: "PRODUCT",
    zhCategory: "产品经理",
    books: [
      { title: "（待补）", note: null },
      { title: "（待补）", note: null },
    ],
  },
  {
    category: "PHILOSOPHY",
    zhCategory: "哲学",
    books: [
      { title: "（待补）", note: null },
      { title: "（待补）", note: null },
    ],
  },
];

/* ---------------- 子组件 ---------------- */

function ArtworkCard({ work }: { work: Artwork }) {
  return (
    <figure className={`life-artwork${work.src ? "" : " life-artwork-empty"}`}>
      <div className="life-artwork-image">
        {work.src ? (
          <Image
            src={work.src}
            alt={work.title}
            width={800}
            height={1000}
            sizes="(max-width: 760px) 80vw, 30vw"
            className="life-artwork-img"
          />
        ) : (
          <div className="life-artwork-placeholder">
            <span className="life-artwork-medium-tag">{work.medium}</span>
            <span className="life-artwork-tbd">TBD</span>
          </div>
        )}
      </div>
      <figcaption className="life-artwork-caption">
        <div className="life-artwork-meta">
          <span className="life-artwork-medium">{work.medium}</span>
          <span className="life-artwork-title">{work.title}</span>
        </div>
        <p className="life-artwork-note">{work.note}</p>
      </figcaption>
    </figure>
  );
}

function CraftCard({ item }: { item: CraftItem }) {
  return (
    <article className={`life-craft${item.src ? "" : " life-craft-empty"}`}>
      <div className="life-craft-image">
        {item.src ? (
          <Image
            src={item.src}
            alt={item.title}
            width={800}
            height={600}
            sizes="(max-width: 760px) 90vw, 45vw"
            className="life-craft-img"
          />
        ) : (
          <div className="life-craft-placeholder">
            <span className="life-craft-tbd">TBD · 待补图</span>
          </div>
        )}
      </div>
      <h4 className="life-craft-title">{item.title}</h4>
      <p className="life-craft-note">{item.note}</p>
    </article>
  );
}

/* ---------------- 主组件 ---------------- */

export default function Life() {
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
      id="life"
      className={`life${visible ? " visible" : ""}`}
    >
      {/* 章节大标题 */}
      <h2 className="life-title">Life &amp; Vision</h2>
      <p className="life-subtitle">关于人，关于眼睛 · 克制的真诚</p>

      {/* ===== GALLERY 板块：视觉创作 ===== */}
      <section className="life-block life-block-gallery">
        <header className="life-block-header">
          <h3 className="life-block-title">GALLERY</h3>
          <p className="life-block-desc">
            视觉创作 · 传统功底 × AI 延伸
          </p>
        </header>

        {/* 素描 8 级证书徽章（PROJECT_GUIDE：王牌 · 官方背书的硬资质） */}
        <div className="life-badge">
          <span className="life-badge-label">官方资质</span>
          <span className="life-badge-value">素描 · 专业 8 级证书</span>
        </div>

        {/* 多媒介作品网格 */}
        <div className="life-gallery-grid">
          {ARTWORKS.map((w) => (
            <ArtworkCard key={w.id} work={w} />
          ))}
        </div>
      </section>

      {/* ===== CRAFT 板块：生活切片 ===== */}
      <section className="life-block life-block-craft">
        <header className="life-block-header">
          <h3 className="life-block-title">CRAFT</h3>
          <p className="life-block-desc">
            生活切片 · 爱动手、爱探索（点到即止）
          </p>
        </header>

        <div className="life-craft-grid">
          {CRAFTS.map((item) => (
            <CraftCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* ===== BOOKSHELF 板块：我的书架 ===== */}
      <section className="life-block life-block-shelf">
        <header className="life-block-header">
          <h3 className="life-block-title">BOOKSHELF</h3>
          <p className="life-block-desc">
            真读过的书 · 每本一句感想（把书架变成我的大脑）
          </p>
        </header>

        <div className="life-shelf-grid">
          {SHELVES.map((shelf) => (
            <div key={shelf.category} className="life-shelf-col">
              <h4 className="life-shelf-cat">
                {shelf.category}
                <span className="life-shelf-cat-zh">· {shelf.zhCategory}</span>
              </h4>
              <ul className="life-shelf-list">
                {shelf.books.map((b, i) => (
                  <li
                    key={`${shelf.category}-${i}`}
                    className={`life-shelf-book${b.note ? "" : " life-shelf-book-empty"}`}
                  >
                    <p className="life-shelf-book-title">{b.title}</p>
                    <p className="life-shelf-book-note">
                      {b.note ?? "待负责人补 · 真读过 + 一句感想"}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <p className="life-segue">↓ 接下来：收尾与联系方式</p>
    </section>
  );
}
