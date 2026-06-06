import Hero from "@/components/sections/hero";
import AboutMe from "@/components/sections/about-me";
import CapabilityBridge from "@/components/sections/capability-bridge";
import Skills from "@/components/sections/skills";

/*
  根路径页面（/）的入口组件。
  纵向叙事五幕按顺序挂在这里（第二幕 About Me 内含 3 个连续滚动的子幕）。
  当前进度：
     <Hero />               ← 第一幕 · 数字名片（已实现）
     About Me 章节：
       <AboutMe />            ← 子幕 a · 我是谁（已实现）
       <CapabilityBridge />   ← 子幕 b · 能力对照（已实现）
       <Skills />             ← 子幕 c · 能力技能（已实现）
     <Portfolio />          ← 第三幕 · 作品集（待实现）
     <Life />               ← 第四幕 · 视觉与生活（待实现）
     <Closing />            ← 第五幕 · 收尾（待实现）
  AI 数字分身悬浮组件将放在 layout.tsx 里全站可见。
*/
export default function Home() {
  return (
    <main>
      <Hero />
      <AboutMe />
      <CapabilityBridge />
      <Skills />
    </main>
  );
}
