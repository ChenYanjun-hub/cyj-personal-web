/**
 * PM2 配置文件 · 阿里云生产环境
 * ---------------------------------------------------------------
 * 用法（在阿里云服务器 web/ 目录下）：
 *   pm2 start ecosystem.config.js          # 启动
 *   pm2 stop  ecosystem.config.js          # 停止
 *   pm2 restart cyj-personal-web           # 重启（不重读 ecosystem 文件）
 *   pm2 reload cyj-personal-web            # 优雅重启（0-downtime）
 *   pm2 logs cyj-personal-web              # 看实时日志
 *   pm2 save                               # 保存当前进程列表
 *   pm2 startup                            # 配开机自启
 *
 * 重要：
 *  - 这个文件**不包含敏感信息**（DEEPSEEK_API_KEY 等）
 *  - 生产 env 写在 web/.env.production（不入 git），next start 启动时自动读
 *  - 详见 deploy/README.md
 */

module.exports = {
  apps: [
    {
      // 进程名 · 用 pm2 命令时引用
      name: "cyj-personal-web",

      // 直接调用 Next.js 二进制（不走 pnpm/npm，避免 PATH 问题）
      script: "./node_modules/next/dist/bin/next",
      args: "start --port 3000",

      // 工作目录 · ecosystem.config.js 所在目录
      cwd: __dirname,

      // 单实例 · V1 流量量级单实例够用
      // 注意：app/api/chat 用了内存频率限制 Map，如果将来开 cluster 模式，
      // 需要换成 Redis 做分布式频率限制
      instances: 1,
      exec_mode: "fork",

      // 自动重启
      autorestart: true,
      watch: false,

      // 内存超 500MB 自动重启（防内存泄漏 / Turbopack 监听异常）
      max_memory_restart: "500M",

      // 启动失败重试
      max_restarts: 10,
      restart_delay: 4000,

      // 环境变量（敏感的不写这里，写 .env.production）
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // 让 next start 监听 0.0.0.0（默认 localhost 上线后 nginx 反代要求）
        HOSTNAME: "0.0.0.0",
      },

      // 日志（默认放到 ~/.pm2/logs，覆盖到项目目录方便排查）
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      time: true,
    },
  ],
};
