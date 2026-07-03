import type { Metadata } from "next";
import PlanningWorks from "@/components/works/planning-works";

/*
  /works/planning · 规划项目作品集跳转页
  ---------------------------------------------------------------
  首页第三幕 Portfolio 右栏「规划项目作品集」的跳转目标。
  页面主体在 components/works/planning-works.tsx（client，参考 Easy Map
  studio 的巨括号画框 + 左目录 + 右信息栏单页切换布局）。
*/

export const metadata: Metadata = {
  title: "规划项目作品集 · 陈彦均",
  description:
    "陈彦均的城乡规划项目作品集：信阳柳林矿坑文旅融合项目等 9 个主导 / 深度参与 / 参与项目，转型 AI 产品经理前的真实规划实践。",
};

export default function PlanningWorksRoute() {
  return <PlanningWorks />;
}
