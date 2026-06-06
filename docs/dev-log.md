# 个人求职网页 · 开发日志

> 本日志按"阶段 / 日期"倒序追加。最新进展在最上面。
> 用途：记录关键决策、踩坑过程、未决问题，方便回看与继任协作者快速接上。
> 写作铁律：不编造任何技术细节，遇到不确定的事用"待验证 / 待回填"标注。

---

## 2026-06-06 · 阶段二：第二幕重构为 About Me 章节（三子幕架构）

### 1. 阶段成果

#### 1.1 架构调整：第二幕从"信任引擎"升级为"About Me 人物主章"
PROJECT_GUIDE 原方案是平铺 6 幕（Hero / 能力对照 / 能力技能 / 作品集 / 视觉与生活 / 收尾）。
本阶段把"能力对照"和"能力技能"**降级为 About Me 章节内的两个子幕**，形成 5 幕结构：

```
第一幕 · Hero
第二幕 · About Me（章节）
        ├─ 主体：我是谁（信息看板）
        ├─ 子幕 a：能力对照
        └─ 子幕 b：具备技能
第三幕 · 作品集
第四幕 · 视觉与生活
第五幕 · 收尾
```

Nav 锚点从 7 项合并到 6 项（`#card / #about-me / #work / #life / #contact / #board`）。

#### 1.2 第二幕主体（about-me.tsx）按 LIUWENTAO 参考图严格复刻
- **关键学习**：我第一版凭空设计（圆形头像 / 装饰小标题 / accent 色 / CTA 按钮），被负责人当场指出"瞎设计"。
  之后负责人提供 LIUWENTAO 参考图 → 按参考图严格 visual recreation。
- 视觉语言：左右双栏 / 纯黑白单色 / 全大写英文板块标题 / 拼音姓名签名 / 底部 "Project" 滚动提示。
- 内容数据：教育 = 南京工业大学 2019.09—2024.06 / 工作 = 同济规划设计研究院分院下属上海隆际 2025.04—2026.05 / AI 项目 3 个（云上米轨 / 建景规 / 合同审查助手）。

#### 1.3 子幕 a：能力对照（capability-bridge.tsx）
- 5 行双栏对照（左规划师 / 右产品能力），内容来自分身知识库 1.4 节定稿。
- 交互：点击 chevron 展开/收起具体场景（信阳柳林证据）+ IntersectionObserver 入场 stagger。
- 收尾"承认短板"段落（按 PROJECT_GUIDE 第二幕规格"必须保留"）。

#### 1.4 子幕 b：具备技能（skills.tsx）
- 4 板块卡片：AI 产品能力 / 产品设计与方法 / 技术与动手能力 / 专业领域&工具。
- 内容来自分身知识库第三类定稿。
- 表现形式铁律（PROJECT_GUIDE）：**绝不用百分比/星级/进度条**，用"熟练 / 能运用 / 了解学习中"动词分级。

#### 1.5 设计 token 调整
- About Me 章节系统去掉 accent 装饰，纯黑白单色（呼应参考图）。
- accent `#D8552E` 仍是 Hero 的视觉签名色（十字准星 + 坐标 + tagline op），但不外溢到第二幕。

---

### 2. 决策记录

#### 2.1 为什么从 6 幕改为 5 幕（合并能力对照 + 能力技能 进 About Me）
原 6 幕里"能力对照（软潜质）"和"能力技能（硬技能）"本质都在回答"我是谁"的不同侧面。
合并进 About Me 后叙事更紧凑：HR 进入 About Me 章节 = 完整理解这个人；
作品集（第三幕）开始 = 实证；之后是人格与收尾。

#### 2.2 章节贯穿头：保留但极度克制
参考图本身没有贯穿头，但子幕需要让 HR 知道"还在 About Me 章节内"。
折中：保留"About Me · 子幕 a/b · ..."贯穿头，但用 `--ink-2` 灰色 + 极小字 + opacity 0.45，
绝不抢主标题。如果未来负责人觉得仍多余，可以一键删（删 `.about-chapter` 段 + 组件里那行）。

#### 2.3 头像照片暂用 placeholder + TODO
负责人未提供本人照片。当前是灰底渐变 + 虚线边框 + "陈彦均 · PORTRAIT · TBD"。
做法：照片放 `web/public/me.jpg`，把 placeholder div 整块换成 `<img src="/me.jpg" alt="陈彦均" />`。

---

### 3. 踩坑记录

#### 3.1 ❗ JSX 字符串里中文""被悄悄替换为 ASCII " → build error
**症状**：第一次写 capability-bridge.tsx 时，10+ 处 leftDetail/rightDetail 字段里的中文""引号
被工具或键盘自动转换为 ASCII `"`，导致 string literal 嵌套，Turbopack 报：

```
Expected ',', got 'ident'
```

**修复**：所有含内层引号的长字符串改用 **反引号 `` ` ``** 模板字符串，
内层 ASCII `"` 不再被识别为字符串边界。

**长期教训**：以后所有含中文长引号的 string literal 一律用 backtick，
不要赌"应该是中文""——尽量从根上消除歧义。

#### 3.2 ❗ 我凭空设计 About Me 视觉，没等参考图就动手
**症状**：第一版 about-me.tsx 加了圆形头像、accent 色装饰、章节贯穿小标题、CTA 按钮等 —
所有这些都不在负责人的视觉预期里。

**根因**：负责人之前只给了内容方向（照片、基本信息、教育、工作、AI 项目、子幕跳转），
没指定视觉风格。我没主动确认视觉参考，按"信息看板"自由发挥了一版。

**修复**：负责人提供 LIUWENTAO 参考图后，按图严格复刻。

**长期教训**：内容方向 ≠ 视觉方向。下次接到"做新幕"的任务，
**主动追问视觉参考图或样式参考**，不要凭空发挥。

#### 3.3 capability-bridge.tsx 没进 initial commit
**症状**：阶段一 commit (8323f62) 时 capability-bridge.tsx 还没写，
所以 initial commit 里没有它。本阶段 commit 时它显示为新增 (`??`)。

**不算错**：只是阶段切分的自然结果。但说明了"每一阶段就 commit"的重要性 —
如果阶段一时第二幕已开发到一半，应该独立 commit，而不是混进 initial commit 里。

---

### 4. 待办（不阻塞当前 commit）

- **[负责人]** 提供本人照片，放到 `web/public/me.jpg`
- **[负责人]** 补全分身知识库的教育/工作精确字段（南工大全名 / 上海隆际全名 / 时间），
  避免分身被问到时拿不到准信息
- **[负责人]** 第三幕 / 作品集（原第四幕）的两个深度档案：云上米轨 + 建景规
- **[Claude Code]** 章节贯穿头是否要进一步去掉 — 等负责人体验后定

---

### 5. 下一阶段候选

- 第三幕 · 作品集（按 PROJECT_GUIDE 4.4 节，V1 用静态分区图 + 项目卡片）
- 或：先把 AI 分身后端骨架搭起来（DeepSeek + `/api/chat` + 系统提示词 + 防护）

---

## 2026-06-04 ~ 06 · 阶段一：项目从 0 到 Hero v1

### 1. 已完成

#### 1.1 项目基础设施
- **脚手架**：Next.js 16.2.6 + React 19.2.4 + TypeScript 6.0.3 + Tailwind v4 + App Router + src/ 目录结构
- **包管理**：pnpm（用 corepack 激活，无需手动 `npm i -g`）
- **位置**：项目根 = `~/Documents/项目开发/网页作品集/`；Next.js 项目放在 `web/` 子目录；`docs/` `md/` `图片/` `作品集项目文件/` `claude design/` 等素材与 `web/` 平级
- **Git**：本地仓库初始化在项目根 `网页作品集/`，分支 `main`，远端 = `github.com:ChenYanjun-hub/<repo>`（首次 push 时在本日志记录最终仓库名）

#### 1.2 第一幕 Hero
- **设计来源**：用户在 Claude Design 工具里做了完整 Hero v1 设计稿，存到 `claude design/untitled/project/` 作为 handoff bundle
- **移植到 Next.js**：所有视觉迁到 `web/src/app/globals.css`（全局 CSS）；交互逻辑迁到 `web/src/components/sections/hero.tsx`（client component）
- **保留的设计语言**：
  - 主色 `#D8552E` 制图橙红（accent）
  - 视觉签名 = **十字准星 + 实时坐标 `E xxx.x N xxx.x`**（"规划师 / 工程图"母题的具象化交互）
  - 入场动画 = 6 元素 stagger fade-in（尊重 `prefers-reduced-motion`）
  - 背景 = AIGC 城市轴测线稿（`hero-bg.png`，3.4MB）+ radial veil 蒙版
  - 顶部 nav（数字名片 / 能力对照 / 具备技能 / 作品集 / 视觉与生活 / 联系方式 / 留言板）
  - 底部"OPEN TO 2026 OPPORTUNITIES" + 绿色脉冲
- **用户后续微调**：
  - 暂时隐藏"求职意向"eyebrow 板块（用 `SHOW_EYEBROW` 常量开关，未来恢复改一行）
  - tagline `1 Person + AI = A Team` 字号从 `clamp(22-46px)` 放大到 `clamp(36-80px)`，几乎与主姓名 138px 旗鼓相当
  - 主姓名"陈彦均"启用得意黑 / Smiley Sans Oblique 字体（向右上倾斜、超粗，制造"年轻 / 锐利"反差）

#### 1.3 字体策略
- **拉丁 sans**：完全走系统字体回退链（macOS SF Pro / Windows Segoe UI），不引入 web font
- **中文**：系统字体回退链（PingFang SC / Microsoft YaHei）+ Noto Sans SC 作 fallback name；**不引入** Noto Sans SC web font（中文字库太大，国内可达性考虑）
- **Tagline**：`next/font/google` 引入 Permanent Marker（拉丁手写马克笔体，几十 KB）
- **主姓名**：`next/font/local` 引入 Smiley Sans Oblique（1.1MB woff2，本地托管，display:swap）

---

### 2. 关键决策记录

#### 2.1 包管理器选 pnpm，不选 npm
原因：pnpm 装得快、磁盘占用少。代价：偶尔遇教程不匹配。可接受。

#### 2.2 项目根分两层
- `网页作品集/`（仓库根）：包含 `docs/`、`md/`、`图片/`、`作品集项目文件/`、`claude design/`、`web/`、PROJECT_GUIDE 等
- `web/`：纯 Next.js 项目，独立可移植

理由：素材与代码分开，docs 跟着仓库走，未来加后端 / 添加其他子项目时易扩展。

#### 2.3 AI 分身模型选 DeepSeek
方向已定（PROJECT_GUIDE 首选）：性价比高、指令遵循能力好、国内访问稳定。**待定**：API Key 申请、模型可替换层封装具体实现。

#### 2.4 域名 `cyjpersonalweb.cn` 已购，ICP 备案进行中
备案是上线瓶颈（7-20 工作日）。不阻塞代码开发。

#### 2.5 Hero V1 提前用上 AIGC 城市轴测背景图
PROJECT_GUIDE 原方案 V1 用纯白、V2 加背景。但 Claude Design 稿已经把背景图、蒙版、veil 都调好了，提前用上的边际成本接近 0。

#### 2.6 入场动画提前到 V1
原方案 V1 静态、V2 加动效。但 6 元素 stagger fade-in 是 Hero 氛围的关键一部分，去掉显得平。且支持 `prefers-reduced-motion`，对动效敏感用户无害。

---

### 3. 踩坑记录（教育性高，必读）

#### 3.1 ❗ Turbopack 文件监听越界 → next-server 吃 60GB 内存 → 系统卡死

**症状**：跑 `pnpm dev` 后几分钟，活动监视器里 next-server 进程内存涨到 60GB，整机卡死必须重启。

**根因链**：
1. `~/Documents/项目开发/`（即 web 的上两层）有 shadcn 残留：`package.json`（只装了 shadcn）+ `pnpm-workspace.yaml` + `pnpm-lock.yaml` + `package-lock.json` + 204MB 的 `node_modules`
2. Turbopack 的 workspace 检测**优先于** `turbopack.root` 配置——它顺着 `pnpm-workspace.yaml` / lockfile 把项目根错推到上层
3. `~/Documents/项目开发/` 下面有 4GB+ 的兄弟项目（建景规 1.8GB、滇越铁路 1.1GB、菜谱 290MB 等），全部被纳入文件监听
4. 几十万个 fs.watch 句柄 → 内存爆 → 卡死

**修复**：两步
- 把 `~/Documents/项目开发/` 下的 4 个残留配置文件 + node_modules 全部 `mv` 到 `_archive-shadcn-residue-20260605/`（不删，可还原）
- 在 `web/next.config.ts` 显式 `bundler: 'webpack'` 切回 webpack——稳定性优先于 HMR 速度

**回退条件**：未来如果 Turbopack 修复了这个 workspace 检测问题（或我们换更彻底的项目根隔离），可以把 `bundler: 'webpack'` 删掉切回 Turbopack。当前 `turbopack.root: process.cwd()` 已保留在配置里，方便届时直接切回。

#### 3.2 `next.config.ts` 不能用 runtime `import` 语句

**症状**：当我在 `next.config.ts` 用 `import { dirname } from "node:path"` 时，dev server 报：

```
× Failed to load next.config.ts
ReferenceError: exports is not defined in ES module scope
   at <unknown> (next.config.compiled.js:2:23)
```

**根因**：Next.js 用 esbuild 编译 `next.config.ts` 时，runtime import 会触发 CJS/ESM 模式识别冲突——产物用 `exports.x` 但被当 ESM 加载。

**修复**：`next.config.ts` 里**只用 `import type`**（编译后 0 字节），不要任何 runtime import。需要的运行时变量改用 `process.cwd()` 这类 Node.js 全局 API。

#### 3.3 GitHub release CDN 国内不可达（字体下载）

**症状**：用 `curl` 拉得意黑字体时，无论是 `release-assets.githubusercontent.com` 还是 `github.moeyy.xyz` 镜像，都 SSL 握手失败。

**修复**：让用户在浏览器手动下载 `smiley-sans-v2.0.1.zip`（浏览器能走 HTTP/2 + 自动重路由），解压后拖到 `web/src/app/fonts/`。

**长期教训**：项目里任何字体 / 模型 / 资产，能 npm/pnpm 拉的就走包管理器；不能的就提前问用户网络环境，做好"手动下载"预案。

#### 3.4 Claude Code 不应替用户后台跑 dev server

**踩坑过程**：开发早期我让 dev server 在 Claude Code 后台跑了 3 次，每次 session 切换可能产生孤儿进程，内存难定位。

**修复 = 工作流变更**：今后 dev server **只由用户在自己终端跑**——掌握 Ctrl+C 主动权、看实时输出、不跨 session。Claude Code 负责"写代码 / 改文件 / 读日志 / 一次性命令"，不负责管常驻进程。

---

### 4. 当前已知开放问题（不影响 commit）

- **得意黑字体 1.1MB**：生产首屏会有一次 "PingFang SC → 得意黑" 的 swap 跳变。V2 优化方案：用 `pyftsubset` 做中文 subset，只保留实际渲染的几个字符（"陈彦均"），能压到 < 10KB。
- **`claude design/` 目录 17MB**：作为设计史归档入库。如果后续仓库体积成为问题，可以考虑迁到 git LFS 或单独的 design 仓库。
- **第二~第六幕全部待开发**：sections/ 目录只有 hero.tsx 一个文件。下一阶段优先级排序见 PROJECT_GUIDE 第 6 节。

---

### 5. 下一阶段（候选）

- Hero 微调收尾（如有视觉调整）
- 第二幕：能力对照（信任引擎）—— 内容已在分身知识库 1.4 定稿
- 或：先把 AI 分身后端骨架搭起来（API Route + DeepSeek + 系统提示词 + 防护）

待用户拍板。
