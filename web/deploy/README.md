# 部署指南 · 阿里云轻量服务器（Ubuntu 24.04 / 2C2G）

陈彦均个人站：Next.js 16 + better-sqlite3 留言板 + DeepSeek AI 分身。
形态：**Node 常驻（PM2）+ Nginx 反代 + Let's Encrypt SSL**，落在国内备案服务器。

> 本机已验证 `pnpm build` 通过。配置文件就绪：
> [`ecosystem.config.js`](../ecosystem.config.js)（PM2）、[`nginx.conf`](./nginx.conf)、[`.env.production.example`](../.env.production.example)。

---

## 0. 前置
- 阿里云轻量 2C2G，Ubuntu 24.04，已分配公网 IP
- 安全组放行 **22 / 80 / 443**
- 域名已 ICP 备案（备案接入需放行 80）
- 一个 DeepSeek API Key（https://platform.deepseek.com）

---

## 1. 系统准备（root 或 sudo）

```bash
# 1.1 关键：2GB 内存跑 next build 会 OOM → 先加 4G swap（一次性，永久生效）
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h   # 确认 Swap: 4.0Gi

# 1.2 系统更新 + 编译工具（better-sqlite3 是原生模块，需 gcc/make/python3）+ nginx
sudo apt update && sudo apt -y upgrade
sudo apt -y install build-essential python3 git nginx
```

## 2. Node 22 LTS + pnpm + pm2

```bash
# nvm 装 Node 22 LTS
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 22 && nvm use 22 && nvm alias default 22
node -v                       # v22.x

# pnpm + pm2
npm i -g pnpm pm2
```

## 3. 拉代码 + 持久化目录

```bash
sudo mkdir -p /opt && cd /opt
sudo git clone https://github.com/ChenYanjun-hub/cyj-personal-web.git
sudo chown -R $USER:$USER cyj-personal-web
cd cyj-personal-web/web

# 留言板 SQLite 持久目录（务必在部署目录之外，发版不丢数据）
sudo mkdir -p /var/lib/cyjweb
sudo chown -R $USER:$USER /var/lib/cyjweb
```

## 4. 环境变量

```bash
cp .env.production.example .env.production
nano .env.production
```
填：
- `DEEPSEEK_API_KEY=` 真实生产 key
- `BOARD_ADMIN_TOKEN=` 生成一串：`openssl rand -hex 24`
- `BOARD_DB_PATH=/var/lib/cyjweb/board.db`（已是默认，确认即可）

```bash
chmod 600 .env.production   # 仅 owner 可读
```
> `NODE_ENV / PORT / HOSTNAME` 已在 `ecosystem.config.js` 设置，不用写这里。

## 5. 装包 + 构建（必须在服务器上做）

```bash
pnpm install        # better-sqlite3 在此按服务器架构编译，切勿从本地拷 node_modules
pnpm build          # 有 4G swap 才不会 OOM
mkdir -p logs       # ecosystem 的日志目录
```

## 6. PM2 启动 + 开机自启

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup         # 按提示复制执行它打印的那行 sudo 命令
pm2 logs cyj-personal-web   # 看是否正常起来（Ctrl+C 退出查看）
curl -I http://127.0.0.1:3000   # 本机自测，应 200
```

## 7. Nginx 反代

```bash
# 改 server_name 为你的备案域名
nano deploy/nginx.conf
sudo cp deploy/nginx.conf /etc/nginx/sites-available/cyjweb.conf
sudo ln -s /etc/nginx/sites-available/cyjweb.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default   # 去掉默认站
sudo nginx -t && sudo systemctl reload nginx
```

## 8. 域名解析 + HTTPS

1. 域名控制台加 **A 记录**：`@` 和 `www` → 服务器公网 IP，等生效（`ping 你的域名` 指向对）。
2. 上 SSL：
```bash
sudo apt -y install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
# certbot 会自动改写 nginx 配置加 443 块 + 80→443 跳转，并设自动续期
```
3. 浏览器开 `https://你的域名` 验证：首页、AI 分身对话、留言板发/删。

---

## 日常更新（发版）

```bash
cd /opt/cyj-personal-web && git pull
cd web && pnpm install && pnpm build
pm2 reload cyj-personal-web      # 0-downtime 重启
```
> 留言数据在 `/var/lib/cyjweb/board.db`，发版不受影响。

## 排错
- **build 被 Killed / OOM**：确认 swap 生效（`free -h`），见 1.1。
- **better-sqlite3 报错 / 找不到绑定**：在 `web/` 跑 `pnpm rebuild better-sqlite3`；切勿用本地拷来的 node_modules。
- **AI 分身不回话**：`pm2 logs` 看错误；多为 `DEEPSEEK_API_KEY` 没配或额度问题。
- **留言发了刷新就没**：检查 `BOARD_DB_PATH` 指向 `/var/lib/cyjweb/board.db` 且该目录可写。
- **运行时频繁重启**：`ecosystem.config.js` 的 `max_memory_restart` 是 500M，2G 机器若想更宽松可调到 768M。
- **80 打不开**：安全组 + 备案接入是否都放行 80；`sudo nginx -t` 是否通过。
