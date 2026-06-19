/**
 * AI 案例索引 · 已建案例详情页的项目（有序）
 * ---------------------------------------------------------------
 * 用途：案例页（case-study.tsx）底部的"上一个 / 下一个项目"pager 据此计算前后项。
 * 顺序 = 阅读/展示顺序，与 ai-works.tsx 列表一致。
 * 新建一个案例页时，把它按顺序加进这里 + 在它的 page.tsx 里给 DATA 填 slug。
 */

export type AiCaseRef = {
  /** 路由 slug · 对应 /works/ai/<slug> */
  slug: string;
  zh: string;
  en: string;
  /** 项目色（pager 卡片 hover 辉光用） */
  tone: [string, string];
};

export const AI_CASES: AiCaseRef[] = [
  {
    slug: "yunshangmigui",
    zh: "云上米轨",
    en: "Yun Shang Mi Gui",
    tone: ["#2f6f5e", "#0e1f1a"],
  },
  {
    slug: "jianjinggui",
    zh: "建景规规范问答助手",
    en: "Architectural Norm RAG Assistant",
    tone: ["#2b4a72", "#0d1420"],
  },
  {
    slug: "contract",
    zh: "购销合同审查助手",
    en: "Sales Contract Review Assistant",
    tone: ["#5a5246", "#171411"],
  },
];
