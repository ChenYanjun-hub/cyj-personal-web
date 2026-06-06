import type { NextConfig } from "next";

/*
  V1 阶段配置说明
  ---------------------------------------------------------------
  当前 bundler = webpack。

  为什么 V1 选 webpack 而不是 Next.js 16 默认的 Turbopack：
   - 实测在本机环境（macOS + 双层中文路径 + ~/Documents/项目开发/ 下多个兄弟项目），
     Turbopack 的 workspace / 文件监听会越界，导致 next-server 进程内存膨胀
     （最严重一次撑到 60GB，系统卡死要重启）。
   - 即使把上层 shadcn 残留 workspace 配置 mv 到 archive、并设了 turbopack.root，
     dev 期间 next-server 仍然涨到几 GB、活动监视器报黄色，HMR 触发明显卡顿。
   - V1 阶段我们只需要一个 Hero 页 + 后续静态六幕，Webpack 已经稳跑 8 年，
     HMR 慢 5-10 倍但绝对值仍在几百毫秒，对小项目主观无感。
   - 原则：V1 稳定 > 性能。等 V2 或者 Turbopack 这块修复后再考虑切回。

  下面保留 turbopack.root 的配置（已无效但留着），方便将来切回 Turbopack 时直接复用。
*/
const nextConfig: NextConfig = {
  // @ts-expect-error - Next 16 运行时支持 bundler: 'webpack'（前面阶段二切回 webpack 兜底 Turbopack workspace 检测越界），
  // 但 NextConfig 类型声明里还没正式 export 这个字段；tsc 报 unknown property，运行时正常生效。
  bundler: "webpack",

  // 保留供将来切回 Turbopack 时使用；webpack 模式下被忽略
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
