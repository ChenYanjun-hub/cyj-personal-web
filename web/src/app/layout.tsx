import type { Metadata, Viewport } from "next";
import { Permanent_Marker, Bebas_Neue } from "next/font/google";
import localFont from "next/font/local";
import AiAvatar from "@/components/ai-avatar/ai-avatar";
import "./globals.css";

/*
  字体加载策略
  ---------------------------------------------------------------
  1. 中文与正文 sans：完全走系统字体回退链（globals.css 里配置）
     - macOS: SF Pro Display + PingFang SC
     - Windows: Segoe UI + Microsoft YaHei
     - 不引入 Noto Sans SC web font（首屏成本太高 + 国内可达性考量）

  2. Tagline 手写马克笔体：Permanent Marker
     - Claude Design 稿里 tagline "1 Person + AI = A Team" 用的就是这个
     - 拉丁字体、体积小（几十 KB）
     - next/font 在 build 时下载并打包到本地，不走 Google CDN，国内访问无问题

  3. 主姓名"陈彦均"专用字体：得意黑 / Smiley Sans
     - 开源中文字体（atelier-anchor 出品，免费商用，MIT-like 协议）
     - 字符向右上倾斜 + 超粗 → 给规整的中文姓名注入"年轻 / 锐利 / 有冲击力"
     - 字体文件 ~1.1MB（完整中文字符集，未做 subset）
     - 用 next/font/local 本地托管，display:swap 避免 FOIT
     - 未来 V2 阶段如果要进一步优化首屏：用 pyftsubset 做 subset，
       只保留"陈彦均"等少数字符，能压到 < 10 KB
*/
const permanentMarker = Permanent_Marker({
  variable: "--font-permanent-marker",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const smileySans = localFont({
  src: "./fonts/SmileySans-Oblique.ttf.woff2",
  variable: "--font-smiley-sans",
  display: "swap",
});

// V2 阶段加：Bebas Neue · Brutalist condensed display
// 用途：about 幕巨字标题 "ABOUT YANJUN CHEN"（参考 Jasmine Gunarto 风格）
// 拉丁字体、体积小（约 20KB），next/font 本地化打包，国内可达
const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "陈彦均 · AI 产品经理求职",
  description:
    "城乡规划师转型 AI 产品经理。深度项目实证 + AI 数字分身，递给你的数字名片。",
};

// viewportFit: "cover" 让页面内容/背景延伸到刘海与 Home Indicator 安全区之下，
// 否则移动端浏览器会在那块区域保留默认系统白色 UI——
// 表现为"OTHER 幕背景图上下两端始终有白边"（与滚动位置无关，因为那其实不是页面内容）。
// 配套：固定在屏幕上下边缘的悬浮控件（AI 分身按钮 / UP·NEXT）已加 safe-area-inset 内边距，
// 避免被刘海/Home Indicator 物理遮挡。
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbfbfd",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${permanentMarker.variable} ${smileySans.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* AI 数字分身悬浮组件 · 全站可见 · PROJECT_GUIDE 第 86-110 行规格 */}
        <AiAvatar />
      </body>
    </html>
  );
}
