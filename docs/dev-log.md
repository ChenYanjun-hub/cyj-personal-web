# 个人求职网页 · 开发日志

> 本日志按"阶段 / 日期"倒序追加。最新进展在最上面。
> 用途：记录关键决策、踩坑过程、未决问题，方便回看与继任协作者快速接上。
> 写作铁律：不编造任何技术细节，遇到不确定的事用"待验证 / 待回填"标注。

---

## 2026-06-06 · 阶段六：第五幕收尾 · V1 整体骨架达成 🎉

### 1. 阶段成果

#### 1.1 第五幕 closing.tsx
按 PROJECT_GUIDE 第 6 节（重编号后是第五幕）三构成：

- **TESTIMONIALS** 精选寄语墙（主）
  - 真实评价 · 非开放评论（防垃圾 + 防冷清）
  - 引言式排版：左侧 2px 实线 + 大字 quote + cite
  - 占位：3 条 dashed 边框 + 灰色斜体（待负责人提前求人收集）

- **GET IN TOUCH** 联系方式 CTA
  - 召唤语 `如果你在找一个 会动手的 AI 产品经理`（PROJECT_GUIDE 第 228 行原话）
  - 召唤语里"会动手的 AI 产品经理"用 accent 橙红 #D8552E + 得意黑 Oblique → 与 Hero tagline 视觉呼应
  - 3 行联系：EMAIL · GITHUB · RESUME（mono 标签 + 大字 link + 箭头）
  - 隐私边界提示（手机号 / 微信不直接公开）

- **MESSAGES** V2 折叠留言入口（占位）
  - dashed 占位框，说明"V2 上线 + 走 Supabase 后端中转"
  - 给定 `id="board"` 对应 Hero nav 的 `#board` 锚点

- **Footer**
  - "看到这里 · 感谢你给我的 30 秒"
  - "© 2026 陈彦均 · 用 Claude Code vibe coding 自己打的"

#### 1.2 改动
- 新建 `web/src/components/sections/closing.tsx`
- `globals.css` 追加 `.closing` 段约 280 行
- `page.tsx` 在 `<Life />` 后挂载 `<Closing />`
- 给 MESSAGES 板块加 `id="board"`，Hero nav 全部锚点联通

---

### 2. 🎯 V1 整体骨架 · 里程碑

**全部五幕到位**：

| 幕 | 组件 | 状态 |
|---|---|---|
| 第一幕 | Hero · 数字名片 | ✅ 含 Claude Design 移植 + 得意黑 + tagline + 十字准星 + 入场动画 |
| 第二幕 | About Me 章节 | ✅ 主体（ProfileCard 3D 倾斜 + 闪卡水印）+ 能力对照 + 具备技能 |
| 第三幕 | Portfolio | ✅ CORE / WIP / LAB 三板块 + inline 展开（详情待负责人补） |
| 第四幕 | Life & Vision | ✅ GALLERY / CRAFT / BOOKSHELF（素材待负责人补） |
| 第五幕 | Closing | ✅ TESTIMONIALS（待寄语）+ Contact CTA + Footer |

**Hero nav 锚点全部联通**：
- `#card` → Hero
- `#about-me` → AboutMe（章节起点）
- `#work` → Portfolio
- `#life` → Life
- `#contact` → Closing 章节起点
- `#board` → Closing 内 MESSAGES 板块

**视觉语言全站一致**：
- 第二~第五幕都是黑白单色 / 全大写英文板块标题 / hairline / 克制留白
- Hero 是色彩入口（accent #D8552E + 得意黑 + 十字准星）
- accent 在收尾召唤语处呼应一次，整站收闭环

---

### 3. V1 完成后待办（按优先级）

#### 3.1 内容补全（负责人）
- **作品集事实档案**：A.1-A.7 云上米轨 / B.1-B.8 建景规（详见阶段四）
- **视觉素材**：6 张多媒介作品 + 3D 打印 + 骑行（详见阶段五）
- **书架真实书单**：四类 + 每本一句感想
- **精选寄语**：提前求人收集 3-5 句
- **简历 PDF**：放到 `web/public/resume.pdf`

#### 3.2 V1 还差的关键功能
- **AI 数字分身**（PROJECT_GUIDE 核心差异化亮点）：`/api/chat` + DeepSeek + 系统提示词 + 防护 + 悬浮组件 UI
- **阿里云部署**：备案完成后做（Node + PM2 + Nginx + HTTPS）

#### 3.3 V1 polish（次优先）
- 全站 dead CSS 清理（`.about-portrait` 等遗留）
- capability-bridge / skills / closing 里 `{cond && <JSX/>}` 模式按 React Best Practices 改 ternary
- AIGC 城市轴测线稿底图叠到 Portfolio（V2 视觉外壳）

---

## 2026-06-06 · 阶段五：第四幕视觉与生活骨架（GALLERY / CRAFT / BOOKSHELF）

### 1. 阶段成果

#### 1.1 第四幕 life.tsx
按 PROJECT_GUIDE 第 5 节（重编号后是第四幕）三板块结构：

- **GALLERY** 视觉创作（主体）：
  - 顶部"素描 · 专业 8 级证书"徽章（PROJECT_GUIDE 王牌 · 官方背书的硬资质）
  - 多媒介作品 6 格网格：素描 / 水彩 / 刀画 / 丙烯 / 速写 / AIGC
  - AIGC 这格直接复用 `/hero-bg.png`（城市轴测，规划标注作品）
  - 每张图配标题 + 媒介标签 + 一句话

- **CRAFT** 生活切片（轻量）：
  - 3D 打印（爱动手）+ 骑行（活力）
  - 2 格大卡片，4:3 比例

- **BOOKSHELF** 我的书架（杀招）：
  - 四列：AI / BUSINESS / PRODUCT / PHILOSOPHY
  - 每本书：title + 一句感想（PROJECT_GUIDE 铁律：只放真读过的）
  - 当前全部占位"待负责人补 · 真读过 + 一句感想"

#### 1.2 视觉策略
- 与 About Me / Portfolio 同源：黑白单色 / 全大写英文板块标题 / hairline / 克制留白
- 占位策略：图片用 dashed 边框 + 中央 `TBD` + 媒介标签；文字用斜体灰色

#### 1.3 改动
- 新建 `web/src/components/sections/life.tsx`
- `globals.css` 追加 `.life` 段约 320 行
- `page.tsx` 在 `<Portfolio />` 后挂载 `<Life />`

---

### 2. 待补素材清单（提供给负责人）

#### 2.1 GALLERY · 多媒介作品图
负责人需要从画作中选若干张代表作，放到 `web/public/` 下，命名规则建议：
- `art-sketch.jpg` 素描
- `art-watercolor.jpg` 水彩
- `art-knife.jpg` 刀画
- `art-acrylic.jpg` 丙烯
- `art-photo.jpg` 摄影

补好后告诉我，我把 ARTWORKS 数组里 `src: null` 改成对应路径。

#### 2.2 CRAFT · 生活切片图
- `craft-3d-print.jpg` 3D 打印作品
- `craft-cycling.jpg` 骑行场景

#### 2.3 BOOKSHELF · 书单
四类（AI / 商业分析 / 产品经理 / 哲学），每类 2-4 本。
**铁律（PROJECT_GUIDE）**：只放真读过、聊得出来的书（面试会被问）。
每本配一句感想 / 为什么读 → 把书架变成你的大脑。

---

### 3. 下一阶段

第五幕 · 收尾：精选寄语墙 + 折叠留言入口（V2 Supabase）+ 联系方式 CTA
- 已知公开信息：邮箱 tmml1770998584@163.com / GitHub @ChenYanjun-hub
- 待负责人提前求人收集：3-5 句精选寄语（前同事 / 师长 / 合作者）

---

## 2026-06-06 · 阶段四：第三幕作品集骨架（CORE / WIP / LAB 三板块）

### 1. 阶段成果

#### 1.1 第三幕 portfolio.tsx
- 三板块结构（PROJECT_GUIDE 4.4 节"主次分明，绝不平铺"原则）：
  - **CORE**：2 个深度项目（云上米轨 + 建景规规范问答助手）
    - 大卡片 + chevron 展开 6 字段详情
    - 卡片头部：项目名 + 类型 + 一句话定位 + 技术栈 chips + 亮点 bullets
    - 展开后：项目定位 / 背景问题 / 我的角色 / AI 技术范式 / 成果 / 反思
  - **WIP**：3 个待建项目（MOOGU 野生菌 / 多 Agent 助手 / 合同审阅）
    - 中卡片 + **虚线边框**（视觉传达"规划中"）
    - 一句话方向 + 验证目标
  - **LAB**：2 个 Coze 已发布（失恋陪伴 / AI 情感伴侣 V1）
    - 中卡片 + 平台标 + 设计要点（三层记忆架构）

#### 1.2 视觉策略
- 与 About Me 同源：纯黑白单色 / 全大写英文板块标题（PORTFOLIO / CORE / WIP / LAB）/ hairline 分隔 / 克制留白
- PROJECT_GUIDE 第 166 行原方案的"线稿城市规划图"底图 V1 不依赖（用"分区 + 卡片"承担规划图视觉隐喻）
- V2 阶段负责人提供 AIGC 城市轴测线稿后再叠上去

#### 1.3 交互
- inline 展开（用户在阶段四之前确认）：点击 chevron 在原位展开详情，不跳路由
- 入场动画：IntersectionObserver 触发 stagger fade-in（title → subtitle → CORE → WIP → LAB）
- 尊重 `prefers-reduced-motion`

#### 1.4 改动
- 新建 `web/src/components/sections/portfolio.tsx`
- `globals.css` 追加 `.portfolio` 段约 280 行
- `page.tsx` 在 `<Skills />` 后挂载 `<Portfolio />`

---

### 2. 重要约定

#### 2.1 6 字段详情面板的占位策略
分身知识库第二类（项目详情）里 A.1-A.7 和 B.1-B.8 字段**全空**。
当前所有 Core 项目展开后都显示 `待负责人补全 · TBD`（斜体 + 灰色 + opacity 0.6）。
诚实表达"内容未到位"，避免编造。

#### 2.2 提供给负责人的"事实档案待补全字段清单"

**项目 A · 云上米轨**：
1. A.1 这个项目是什么？解决什么问题？
2. A.2 谁是 B 端（付费方），谁是 C 端（终端用户）？各自诉求？
3. A.3 我的具体角色？负责哪些部分？
4. A.4【重点】我做了哪些关键产品决策？为什么这么决策？尤其：怎么平衡 B 端和 C 端的不同诉求
5. A.5 用了哪些 AI 能力/技术？
6. A.6 现在做到什么程度？有什么成果或数据？（没有真实数据就如实写完成度）
7. A.7 踩过的坑 / 最大的反思

**项目 B · 建景规规范问答助手**：
1. B.1 这个项目是什么？目标用户？解决什么痛点？
2. B.2 我的具体角色？负责哪些部分？
3. B.3【分水岭 1】为什么选 RAG 而不是直接问通用大模型？怎么处理"幻觉"？
4. B.4【分水岭 2】怎么定义"回答得好不好"？做过什么 eval？哪怕自测准确率对比
5. B.5 知识库怎么构建和更新的？
6. B.6 技术选型（向量库 / embedding / 重排等，会多少写多少）
7. B.7 现在做到什么程度？测试效果如何？
8. B.8 踩过的坑 / 最大的反思（如"专业领域 RAG 最难的不是技术而是知识库质量"这类洞察很值钱）

→ 这些填到 `md/分身知识库采集清单.md` 对应字段后，我可以一次性同步进 portfolio.tsx 的 `detail` 数据。

---

### 3. 待办

- **[负责人]** 上方 A.1-A.7 + B.1-B.8 字段补全（按需）
- **[负责人]** 提供 AIGC 城市轴测线稿底图（用作 V2 portfolio 视觉外壳）
- **[Claude Code]** 下一阶段：第四幕视觉与生活
- **[Claude Code]** 全站收尾 polish 时清理 dead CSS（`.about-portrait` 等遗留）

---

## 2026-06-06 · 阶段三：About Me 头像升级为 ProfileCard（3D 倾斜 + 闪卡水印）

### 1. 阶段成果

#### 1.1 装入 reactbits.dev 的 ProfileCard（JS-CSS 版本）
- 通过 `npx jsrepo@latest add https://reactbits.dev/r/ProfileCard-JS-CSS` 拉源码
- 装到 `web/src/components/reactbits/`（`ProfileCard.jsx` + `ProfileCard.css`）
- 用 `jsrepo.config.mts` 配置 paths + 装 `jsrepo` + `@jsrepo/transform-javascript` 作 devDeps
- 国内可达 ✅（reactbits.dev 自己的 CDN，没踩 GitHub raw 国内被墙的坑）

#### 1.2 视觉资产到位
- `web/public/me.png`：负责人提供的**透明背景人物半身像**（1254×1254 RGBA）
- `web/public/pc-grain.webp`：闪卡水印 L 形钻石点阵纹理（reactbits 官方 demo asset）
- `web/public/pc-icon.png`：卡片右上角装饰图标
- 后两个从 `https://reactbits.dev/assets/demo/` 直接 curl 下来

#### 1.3 about-me.tsx 集成
- 左栏头像从 `<Image fill>` → `<Image width/height>` → 最终 **`<ProfileCard>`**
- props：`avatarUrl="/me.png"` + `iconUrl="/pc-icon.png"` + `grainUrl="/pc-grain.webp"` + `showUserInfo={false}` + `enableTilt={true}`
- 保留 `CHEN YANJUN` 大字签名在卡片下方

#### 1.4 globals.css ProfileCard override
- `.about .pc-avatar-content { mix-blend-mode: normal !important; }`
- 同步 `.about .pc-content`，保护 details 不被 luminosity 染色

---

### 2. 踩坑记录

#### 2.1 ❗ jsrepo `paths` 必须按"type"配置，`*` 通配不够
**症状**：`No path was provided for ProfileCard-JS-CSS of type component`。

**修复**：用 `npx jsrepo init <registry> --js` 让它自动生成 `jsrepo.config.mts`，
然后手动填 `paths: { "*": "./src/components/reactbits" }`，且 jsrepo 在 init 时自动追加了 `component: "./src/components/reactbits"` 双保险。

#### 2.2 ❗ 第一次效果：人物照片被彩虹染色（误判）
**症状**：把白底带文字的 me.png 喂给 ProfileCard，整张照片被 shine 染成彩虹乱码。

**根因**：ProfileCard 的 avatar 设计前提是**透明背景的人物半身像**（参考图 Javi 那种）。白底 PNG 加上 shine 的 `mix-blend-mode` → 灾难。

**修复**：负责人重新提供透明背景 PNG（macOS 内置"移除背景"功能）。

#### 2.3 ❗ 第二次效果：人物清晰了但还在被 luminosity 染色
**症状**：换透明 PNG 后，人物轮廓出来了，但仍然彩色失真。

**根因**：`.pc-avatar-content` 默认 `mix-blend-mode: luminosity`，让人物自身参与彩色反光。这个设计前提是 avatar 是**黑白调照片**（参考图 Javi 是黑白）。我们是彩色照片走 luminosity 颜色崩溃。

**修复**：globals.css 加 `.about .pc-avatar-content { mix-blend-mode: normal !important; }`。

#### 2.4 ❗ 闪卡水印完全没出现
**症状**：人物正确了，但参考图里那种"钻石 L 形纹理"完全没显示。

**根因**：ProfileCard 的 grain 纹理由 `grainUrl` prop 提供，我没传。`--grain: none` 默认下 grain 层透明 → 完全看不到水印。

**修复**：从 reactbits 官方 demo 下载 `grain.webp` + `iconpattern.png`，传给 ProfileCard。

---

### 3. 待办（不阻塞当前 commit）

- **[Claude Code]** capability-bridge.tsx / skills.tsx 里的 `{cond && <JSX/>}` 模式按 React Best Practices 改成 ternary（小 polish）
- **[Claude Code]** 不再使用的 `.about-portrait` / `.portrait-image` / `.portrait-placeholder` 等 CSS 段可以清理（dead code）
- **[负责人]** 分身知识库教育/工作字段补全
- **[负责人]** ICP 备案推进

---

### 4. 下一阶段候选

- 第三幕 · 作品集（PROJECT_GUIDE 4.4，V1 静态分区版）
- AI 分身后端骨架（DeepSeek + `/api/chat`）
- 全站子幕 polish + 章节贯穿头是否保留拍板

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
