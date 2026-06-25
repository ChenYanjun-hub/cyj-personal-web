/**
 * 第四幕「其他」· 爱好数据（漫画卡牌 + 详情页共用）
 * ---------------------------------------------------------------
 * life.tsx 的扇形卡牌与 /hobbies/[slug] 详情页都读这份数据，保证两边一致。
 * persona：参考 Studio375「Ten Years Away」的 "THE ___" 角色化标签（卡片肩章）。
 * tone：每个爱好一套渐变两端色（漫画封面底 + 详情页主色带）。
 * glyph：用 emoji 当快速可辨的漫画图标（暂无插画，待负责人补真插画后替换为图片）。
 *
 * 内容深度：tagline 已定稿；详情页正文（故事 / 作品）待负责人补全，先骨架占位。
 */

export type Hobby = {
  slug: string;
  zh: string;
  en: string;
  /** 卡片肩章 · "THE ___" 角色化标签 */
  persona: string;
  /** 一句话定调（第一人称，克制真诚） */
  tagline: string;
  /** 漫画图标（emoji，缺图兜底） */
  glyph: string;
  /** 卡牌插画封面（public/hobbies/<slug>.png）· 自带卡框与标题，比例 3:4.2 */
  image?: string;
  /** 渐变两端色 [亮, 深] */
  tone: [string, string];
};

export const HOBBIES: Hobby[] = [
  {
    slug: "vibe-coding",
    zh: "Vibe Coding",
    en: "Vibe Coding",
    persona: "THE BUILDER",
    tagline: "和 AI 结对编程，把想法直接编译成产品。",
    glyph: "💻",
    image: "/hobbies/vibe-coding.png",
    tone: ["#3a9d8f", "#0f2723"],
  },
  {
    slug: "3d-printing",
    zh: "3D 打印",
    en: "3D Printing",
    persona: "THE MAKER",
    tagline: "把屏幕里的模型，变成握在手里的实物。",
    glyph: "🖨️",
    image: "/hobbies/3d-printing.png",
    tone: ["#e0852f", "#2a1606"],
  },
  {
    slug: "photography",
    zh: "摄影",
    en: "Photography",
    persona: "THE OBSERVER",
    tagline: "按下快门，是替时间留住一帧。",
    glyph: "📷",
    image: "/hobbies/photography.png",
    tone: ["#3f78c4", "#0d1a2e"],
  },
  {
    slug: "gaming",
    zh: "游戏",
    en: "Gaming",
    persona: "THE PLAYER",
    tagline: "好游戏是被精心设计的心流——我也在拆解它。",
    glyph: "🎮",
    image: "/hobbies/gaming.png",
    tone: ["#7a55c8", "#160f28"],
  },
  {
    slug: "aigc",
    zh: "AIGC 创作",
    en: "AIGC",
    persona: "THE PROMPTER",
    tagline: "把提示词当画笔，让审美和模型一起进化。",
    glyph: "✨",
    image: "/hobbies/aigc.png",
    tone: ["#c8568f", "#28101d"],
  },
  {
    slug: "painting",
    zh: "绘画",
    en: "Painting",
    persona: "THE PAINTER",
    tagline: "素描练到专业八级，手比鼠标更早学会表达。",
    glyph: "🎨",
    image: "/hobbies/painting.png",
    tone: ["#cf5a3c", "#2a0f08"],
  },
  {
    slug: "cycling",
    zh: "骑行",
    en: "Cycling",
    persona: "THE RIDER",
    tagline: "用车轮丈量一座城市的尺度。",
    glyph: "🚲",
    image: "/hobbies/cycling.png",
    tone: ["#4ba35a", "#0f2614"],
  },
  {
    slug: "skating",
    zh: "轮滑",
    en: "Roller Skating",
    persona: "THE SKATER",
    tagline: "失重的那半秒，是最纯粹的自由。",
    glyph: "🛼",
    image: "/hobbies/skating.png",
    tone: ["#3aa6b8", "#0a2429"],
  },
];

export function getHobby(slug: string): Hobby | undefined {
  return HOBBIES.find((h) => h.slug === slug);
}
