import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { HOBBIES, getHobby } from "@/components/hobbies/hobbies-data";

/*
  /hobbies/[slug] · 爱好详情页（第四幕「其他」卡牌的跳转目标）
  ---------------------------------------------------------------
  数据来自 components/hobbies/hobbies-data.ts（与卡牌共用）。
  generateStaticParams 把 8 个爱好全部静态预渲染（阿里云静态部署友好）。
  正文（故事 / 作品）待负责人补全，先用「整理中」骨架占位，clicks 不 404。
*/

export function generateStaticParams() {
  return HOBBIES.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const h = getHobby(slug);
  if (!h) return {};
  return {
    title: `${h.zh} · 其他 · 陈彦均`,
    description: h.tagline,
  };
}

export default async function HobbyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const h = getHobby(slug);
  if (!h) notFound();

  return (
    <main
      className="hobby"
      style={
        {
          "--tone-a": h.tone[0],
          "--tone-b": h.tone[1],
        } as React.CSSProperties
      }
    >
      {/* 顶部返回条 */}
      <div className="hobby-topbar">
        <Link href="/#life" className="hobby-back">
          ← 返回「其他」
        </Link>
        <span className="hobby-topbar-persona">{h.persona}</span>
      </div>

      {/* Hero：爱好主色带 + 漫画图标 + 中英名 + 一句话 */}
      <header className="hobby-hero">
        <span className="hobby-hero-halftone" aria-hidden />
        <span className="hobby-glyph" aria-hidden>
          {h.glyph}
        </span>
        <div className="hobby-hero-text">
          <p className="hobby-en">{h.en}</p>
          <h1 className="hobby-zh">{h.zh}</h1>
          <p className="hobby-tag">{h.tagline}</p>
        </div>
      </header>

      {/* 正文：故事 + 作品（骨架占位，待补全） */}
      <div className="hobby-body">
        <section className="hobby-section">
          <p className="hobby-section-eyebrow">STORY</p>
          <h2 className="hobby-section-heading">这件事于我</h2>
          <p className="hobby-tbd">
            内容整理中 · 这里会写：我怎么开始的、它给了我什么、和我做产品 / 做设计之间的连接。
          </p>
        </section>

        <section className="hobby-section">
          <p className="hobby-section-eyebrow">GALLERY</p>
          <h2 className="hobby-section-heading">作品 / 记录</h2>
          <div className="hobby-gallery">
            {[0, 1, 2].map((i) => (
              <div key={i} className="hobby-gallery-ph" aria-hidden>
                <span>整理中</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 页尾出口 */}
      <footer className="hobby-footer">
        <Link href="/#life" className="hobby-footer-link">
          ← 返回全部爱好
        </Link>
        <Link href="/#contact" className="hobby-footer-link">
          联系方式 →
        </Link>
      </footer>
    </main>
  );
}
