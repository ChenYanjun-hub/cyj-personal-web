import type { Metadata } from "next";
import AiWorks from "@/components/works/ai-works";

/*
  /works/ai · AI 项目作品集跳转页
  ---------------------------------------------------------------
  首页第三幕 Portfolio 左栏「AI 项目作品集」的跳转目标。
  页面主体在 components/works/ai-works.tsx（client，含实时时钟 + IO 入场）。
  风格参考：Andy Reff 作品集（黑底 + 巨字 + 纵向大卡片流）。
*/

export const metadata: Metadata = {
  title: "AI 项目作品集 · 陈彦均",
  description:
    "陈彦均的 AI 项目作品集：云上米轨、建景规规范问答助手、Coze 情感陪伴 Agent 等 7 个从已开发到蓝图阶段的 AI 产品实践。",
};

export default function AiWorksRoute() {
  return <AiWorks />;
}
