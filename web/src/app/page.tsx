import Hero from "@/components/sections/hero";

/*
  根路径页面（/）的入口组件。
  纵向叙事六幕都会按顺序挂在这里。
  V1 当前：只挂载 Hero（第一幕）。
  V2 / 后续开发顺序（PROJECT_GUIDE 第 3 节）：
     <Hero />               ← 第一幕 · 数字名片
     <CapabilityBridge />   ← 第二幕 · 能力对照
     <Skills />             ← 第三幕 · 能力技能
     <Portfolio />          ← 第四幕 · 作品集
     <Life />               ← 第五幕 · 视觉与生活
     <Closing />            ← 第六幕 · 收尾
   AI 数字分身悬浮组件不挂在这里，会放在 layout.tsx 里全站可见。

  这是 Server Component（无 'use client'）：
   - 没有任何客户端钩子（useState/useEffect）
   - 数据是写死的展示，无需在浏览器执行
   - Next.js 16 默认行为：组件在服务器渲染好 HTML，首屏更快、SEO 友好
*/
export default function Home() {
  return (
    <main>
      <Hero />
    </main>
  );
}
