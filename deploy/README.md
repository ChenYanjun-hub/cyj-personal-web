# 阿里云部署手册 · cyjpersonalweb.cn

> 从空白阿里云服务器到 https://cyjpersonalweb.cn 可访问的完整步骤。
> 假设：你已经买了阿里云 ECS（或轻量应用服务器），ICP 备案已通过。

---

## 前提清单（开干前确认这几件都到位）

- [ ] 阿里云 ECS / 轻量服务器（推荐 Ubuntu 22.04 LTS · 2 核 2G 起）
- [ ] 域名 `cyjpersonalweb.cn` ICP 备案已通过（工信部能查到备案号）
- [ ] 服务器安全组开放：22 (SSH) / 80 (HTTP) / 443 (HTTPS)
- [ ] DeepSeek API Key（手头有，会写到 .env.production）

---

## 步骤 1 · SSH 登录服务器 + 基础环境

```bash
# 本地终端 ssh 上去（用阿里云控制台给的公网 IP 和密码 / 密钥）
ssh root@<阿里云公网IP>

# 系统更新
apt update && apt upgrade -y

# 装常用工具
apt install -y curl git ufw build-essential

# 防火墙（如果阿里云控制台已经设了安全组，UFW 可以不开；但本地防火墙也建议开一层）
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

---

## 步骤 2 · 装 Node.js 24 LTS + pnpm

```bash
# Node 24 LTS · 走 NodeSource 源
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs

# 验证
node -v   # 应该是 v24.x
npm -v

# corepack 激活 pnpm（不用 npm install -g pnpm，更干净）
corepack enable
corepack prepare pnpm@latest --activate
pnpm -v   # 应该输出 11.x 或更新
```

---

## 步骤 3 · 装 PM2（进程管理）

```bash
npm install -g pm2

pm2 -v   # 验证
```

---

## 步骤 4 · 装 Nginx

```bash
apt install -y nginx

# 启动 + 开机自启
systemctl start nginx
systemctl enable nginx

# 验证：浏览器访问公网 IP，应该看到 Nginx 默认欢迎页
```

---

## 步骤 5 · 克隆仓库 + 装依赖 + build

```bash
# 选择部署目录（建议 /var/www）
mkdir -p /var/www
cd /var/www

# 克隆（如果仓库已 push 到 GitHub）
git clone https://github.com/ChenYanjun-hub/cyj-personal-web.git
cd cyj-personal-web/web

# 装依赖（pnpm 装很快）
pnpm install --frozen-lockfile

# 生产构建
pnpm build
# 看到 "✓ Compiled successfully" + Route 表，成功
```

---

## 步骤 6 · 配置生产环境变量

```bash
# 在 web/ 目录下
cp .env.production.example .env.production

# 编辑 · 把 DEEPSEEK_API_KEY 换成你的真实生产 key
nano .env.production
# 或 vim .env.production

# 权限收紧（只有 owner 能读）
chmod 600 .env.production

# 验证（不会泄露 key，只看是否设了）
ls -la .env.production
```

---

## 步骤 7 · PM2 启动 Next.js

```bash
# 还在 web/ 目录
# 创建日志目录（ecosystem.config.js 里指定的）
mkdir -p logs

# 启动
pm2 start ecosystem.config.js

# 看状态（应该看到 cyj-personal-web · online · 0% CPU · 100MB 左右内存）
pm2 status

# 看实时日志
pm2 logs cyj-personal-web --lines 30

# 看具体进程（验证 3000 端口在监听）
ss -lntp | grep 3000

# 保存当前进程列表（开机自启会用）
pm2 save

# 配开机自启 · 跟着输出的命令再执行一次
pm2 startup
```

**这一步成功的标志**：`curl http://127.0.0.1:3000` 在服务器上能看到 HTML。如果不行，先看 `pm2 logs` 排查。

---

## 步骤 8 · 配 Nginx 反代

```bash
# 拷贝 deploy/ 下的 Nginx 模板
cp /var/www/cyj-personal-web/deploy/nginx.example.conf \
   /etc/nginx/sites-available/cyjpersonalweb.cn.conf

# 软链接到 sites-enabled
ln -s /etc/nginx/sites-available/cyjpersonalweb.cn.conf \
      /etc/nginx/sites-enabled/

# 删除默认 site（避免和 80 端口冲突）
rm -f /etc/nginx/sites-enabled/default

# 但是！注意：模板里第一个 server 块是 HTTPS 的，证书路径还没存在
# 所以先**暂时把第 3 块（HTTPS 主域名）整段注释掉**，让 Nginx 能启
# 留下第 1 块（HTTP）用于 Let's Encrypt 签证书

# 检查语法
nginx -t

# reload
systemctl reload nginx
```

---

## 步骤 9 · Let's Encrypt 签 SSL 证书

```bash
# 装 certbot
apt install -y certbot python3-certbot-nginx

# 关键：这一步要求 DNS 已经把 cyjpersonalweb.cn 解析到这台服务器的 IP
# 在阿里云域名控制台加 A 记录：
#   主机记录 @     记录值 <服务器公网IP>
#   主机记录 www   记录值 <服务器公网IP>

# 等几分钟让 DNS 生效后，用 certbot 自动签 + 配
certbot --nginx -d cyjpersonalweb.cn -d www.cyjpersonalweb.cn

# 按提示填邮箱、同意 ToS、选是否 HTTPS 重定向

# 证书放在 /etc/letsencrypt/live/cyjpersonalweb.cn/
ls /etc/letsencrypt/live/cyjpersonalweb.cn/
# 看到 fullchain.pem + privkey.pem 就成
```

---

## 步骤 10 · 还原完整 Nginx 配置 + 最后 reload

```bash
# 把刚才注释的第 3 块（HTTPS 主域名）恢复
nano /etc/nginx/sites-available/cyjpersonalweb.cn.conf

# 检查 + reload
nginx -t
systemctl reload nginx
```

---

## 步骤 11 · 验证

```bash
# 国内任意机器（或者本地）
curl -I https://cyjpersonalweb.cn
# 期望：200 OK + 各种安全头

# 测一下 AI 分身后端
curl -X POST https://cyjpersonalweb.cn/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"你是谁"}]}'
# 期望：流式输出
```

**浏览器打开 https://cyjpersonalweb.cn** → 看到 Hero · 五幕 · 右下角 AI 分身泡泡 → 上线成功 🎉

---

## 后续维护

### 代码更新（你 push 到 GitHub 后）

```bash
cd /var/www/cyj-personal-web
git pull
cd web
pnpm install --frozen-lockfile   # 如果依赖有变
pnpm build
pm2 reload cyj-personal-web      # 零 downtime 重启
```

### SSL 证书自动续签

`certbot` 装好后会自动配 cron。验证：

```bash
systemctl status certbot.timer
certbot renew --dry-run    # 测试续签流程
```

### 监控 + 日志

```bash
pm2 logs cyj-personal-web --lines 100         # 应用日志
tail -f /var/log/nginx/cyjpersonalweb.access.log   # Nginx 访问日志
tail -f /var/log/nginx/cyjpersonalweb.error.log    # Nginx 错误日志
pm2 monit                                       # PM2 实时仪表
```

### 重启 / 排查问题

```bash
pm2 restart cyj-personal-web   # 重启 Next 进程
systemctl restart nginx        # 重启 Nginx
pm2 list                       # 看进程列表
pm2 info cyj-personal-web      # 看单个进程详情
```

---

## 常见问题

### Q: build 时报 OOM（内存不足）
2G 服务器 build 时会吃 1.5G+。临时加 swap：

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Q: AI 分身一直 500 错误
排查顺序：
1. `pm2 logs cyj-personal-web` 看错误堆栈
2. `.env.production` 里 `DEEPSEEK_API_KEY` 填对没（不要带引号）
3. `pm2 restart cyj-personal-web` 让进程重读 env
4. 服务器到 `api.deepseek.com` 网络通不通：`curl -I https://api.deepseek.com`

### Q: 流式响应没生效，要等很久才一次性出来
检查 Nginx 配置里 `/api/chat` 路径的 `proxy_buffering off`。这一行漏了就会被 buffer。

### Q: 改了 .env.production，PM2 不读新值
PM2 不会自动重读 env，必须：

```bash
pm2 restart cyj-personal-web --update-env
# 或者完整重启
pm2 delete cyj-personal-web
pm2 start ecosystem.config.js
```

---

## 安全清单（上线后 24 小时内做完）

- [ ] 关掉 root SSH，建普通用户用 sudo
- [ ] SSH 改用 key 登录，禁用密码
- [ ] 改 SSH 默认 22 端口
- [ ] `.env.production` 文件 chmod 600
- [ ] 阿里云控制台开 DDoS 基础防护
- [ ] 配 fail2ban 防爆破
- [ ] 监控 DeepSeek API 用量（控本）

---

## 上线后第一次检查的事

1. https://cyjpersonalweb.cn 国内访问稳定（用三大运营商 + 国内其他城市试）
2. 移动端 Safari / 微信内置浏览器看是否正常
3. AI 分身能稳定响应 · 测几个常见问题
4. 工信部备案号确认能在底部看到（如需要可加在 closing.tsx 的 footer）
5. 配 Google Analytics 或者其他统计（可选 V2）
