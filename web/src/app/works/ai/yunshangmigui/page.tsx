import type { Metadata } from "next";
import CaseStudy, {
  type CaseStudyData,
} from "@/components/works/case-study";

/*
  /works/ai/yunshangmigui · 云上米轨案例详情页
  ---------------------------------------------------------------
  AI 作品集列表第一卡的 CASE STUDY 跳转目标 · 用 CaseStudy 模板渲染。

  内容来源：md/分身知识库采集清单.md 项目 A（A.1–A.7 已由负责人填全，
  2026-06 更新）。所有数据（30 题实测 / 平台规模 / 市场测算）均出自知识库，
  含"演示阶段、无业务数据"的诚实声明。
  结构：参考案例 6 节 + 增设"关键决策"（A.4 是 PM 案例核心卖点）。
*/

const DATA: CaseStudyData = {
  slug: "yunshangmigui",
  category: "AI 全栈 · BtoBtoC · RAG",
  title: "云上米轨",
  titleEn: "Yun Shang Mi Gui · Yunnan–Vietnam Railway Knowledge Platform",
  intro: `把百年滇越铁路的文化遗产做成数字化知识服务平台——6 大模块 + 南渡 AI 知识问答，从产品定义、AI 设计、全栈开发到部署运维一人走通，已上线公网。`,
  tone: ["#2f6f5e", "#0e1f1a"],
  mark: "MIGUI",
  heroBg: "/works/yunshangmigui/cover.png",
  award: {
    year: "2026",
    seal: "获奖",
    lines: ["中国国际大学生创新大赛", "研究生组 · 获奖项目"],
  },
  hero: {
    src: "/works/yunshangmigui/01-home.png",
    alt: "云上米轨平台首页 · 沉浸式落地页，巨字「一条云上米轨 半部西南近代史」+ 六大模块入口",
    w: 1600,
    h: 1004,
    caption:
      "平台首页 · 老地图肌理打底，巨字主张 + 六大模块入口（史料藏馆 / 云游导览 / 光影展览 / 研学社区 / 南渡 AI / 文创商城）",
  },
  meta: [
    { label: "Role", value: "产品负责人 · 唯一平台开发者" },
    { label: "Team", value: "昆明理工大学建筑学院 · 段文教授团队合作" },
    { label: "Duration", value: "约半年 · 2026.05 已上线公网" },
    { label: "Type", value: "团队自研 · BtoBtoC · 文化遗产数字化" },
  ],
  sections: [
    {
      id: "problem",
      eyebrow: "Customer Problem",
      heading: "客户问题",
      paragraphs: [
        `滇越铁路是中国第一条国际米轨铁路，通车已超过百年。实体遗存在老化，史料散落在各地馆藏与民间——这条线性工业文化遗产的传承，卡在五个真实痛点上：`,
      ],
      bullets: [
        `保护乏力：老站房、桥梁、隧道缺乏常态化守护，历史照片、工程图纸、文献档案无系统归集，部分珍贵史料濒临失传`,
        `传播断层：依赖线下展馆与纸质文献的静态传播，触达不了 Z 世代，青年认知度低、参与感弱`,
        `体验浅层：文旅开发停留在"打卡拍照"，缺专业讲解、古今对比与深度文化解读`,
        `研学缺位：没有标准化研学路线、学术导引与公共交流平台，学术价值释放不出来`,
        `变现不足：文化 IP 未系统开发、文创零散无序，商业收益无法反哺保护与传播`,
      ],
      paragraphsAfter: [
        `平台为此服务两端：B 端是博物馆、档案馆、文旅局、中小学、国企党建等机构（史料数字化、研学课程定制、文化 IP 合作），C 端是文史爱好者、高校师生与研学群体——全国近代史爱好者超 2000 万人，铁路文化爱好者约 800 万人。`,
      ],
    },
    {
      id: "before",
      eyebrow: "Before",
      heading: "之前",
      paragraphs: [
        `在这个平台之前，"查一段滇越铁路的历史"意味着翻书、逛论坛、碰运气。知识没有结构化，无法检索、无法问答；传统文博网站是静态展示，综合平台内容泛化——西南米轨这个垂直领域，没有一个系统性的数字化入口。`,
      ],
    },
    {
      id: "what-i-did",
      eyebrow: "What I Did",
      heading: "我做了什么",
      paragraphs: [
        `我是项目的产品负责人和唯一的平台开发者：整个数字平台从产品定义到部署运维由我一人以 vibe coding 方式（Claude Code 为主力）完成；合作方昆明理工大学建筑学院段文教授团队负责史料收集、田野调研与口述史采集等内容侧工作。具体分四层：`,
      ],
      bullets: [
        `产品层：定义 6 大模块（史料藏馆 / 云游导览 / 光影展览 / 研学社区 / 南渡 AI / 文创商城）的架构与用户旅程；确立"C 端体验先行、B 端底座同步"的推进策略；12 条关键架构决策全部以 Decision Notes 落档`,
        `AI 层：南渡 AI 的 RAG 全链路——DashScope text-embedding-v3（1024 维）+ pgvector 向量检索（top-4 召回 + 0.40 相似度阈值）+ DeepSeek V3 生成；System Prompt 强制引用规则与拒答策略；30 题评估集设计并脚本化执行`,
        `工程层：Next.js 16 + React 19 + Supabase 全栈——6 角色 RLS 权限在数据库层强制、7 个用户端模块 + 5 类 Admin 后台、完整 Auth 体系（注册 / 登录 / 邮件找回密码）、Leaflet GIS 地图（OSM 实测线路 + WGS84/GCJ-02 坐标系转换）、桌面 / 移动三端响应式`,
        `运维层：阿里云东京节点独立部署（nginx + pm2 + Next.js production），实战处理 ICP 备案约束、Google Fonts 被墙导致构建失败等真实问题`,
      ],
      images: [
        {
          src: "/works/yunshangmigui/02-nandu-ai.png",
          alt: "南渡 AI 实际问答 · 回答内联 [n] 引用角标 + 底部「文位引据」档案卡片",
          w: 1600,
          h: 1239,
          caption:
            "南渡 AI · 实际问答 —— 回答内联 [n] 引用角标、底部「文位引据」档案卡片回链原始史料（RAG：DashScope embedding 1024 维 + pgvector top-4 + DeepSeek V3）",
        },
        {
          src: "/works/yunshangmigui/04-archive.png",
          alt: "数字米轨史料藏馆 · 史料卡片网格",
          w: 1200,
          h: 2415,
          tall: true,
          caption:
            "史料藏馆 · 结构化史料网格（老地图 / 机车老照片 / 工程图纸 / 桥隧档案），全部向量化、可检索可问答",
        },
      ],
    },
    {
      id: "decisions",
      eyebrow: "Key Decisions",
      heading: "关键决策",
      paragraphs: [
        `开发资源只有一个人，B 端要专业严谨可管理，C 端要轻量沉浸低门槛——所有决策都是在真实约束下做的取舍：`,
      ],
      bullets: [
        `C 端体验先行、B 端底座同步——冷启动期 B 端只信"成型的平台 + C 端影响力"，资源优先投给可感知体验；但史料元数据结构与 5 部门 Admin 分权从第一天就按机构级标准建`,
        `引用回链，一个机制满足两端——AI 回答带 [n] 角标 → 渲染为档案卡片 → 点击直跳原始史料：C 端要"答案可信"，B 端与学术用户要"可溯源"，没有做两套系统`,
        `RAG 而非微调——可解释（引用回链的前提）、可维护（新增史料 = 1 次 embedding）、冷启动友好、成本低一个量级；相似度阈值 0.40 在测试集上反复标定：宁可拒答，不可编造`,
        `成本结构——DeepSeek V3（中文质量接近 GPT-4o、成本约 1/10）+ DashScope embedding，以 OpenAI 兼容协议接入，换模型是一行配置的事；实测单次对话成本约 $0.001`,
        `数据真实性 > 视觉对齐——34 个站点坐标与 OSM 实测线路偏差 5–77 公里，我推翻了已经跑通的"样条硬掰对齐"实现，保留真实偏差并留档说明：考据型产品宁可暴露数据瑕疵，不可制造虚假精确`,
      ],
      images: [
        {
          src: "/works/yunshangmigui/03-map.png",
          alt: "米轨 GIS 地图 · 全线 855 公里实测线路",
          w: 1600,
          h: 1004,
          caption:
            "GIS 地图 · 34 站点 + 522 点 OSM 实测线路覆盖全线 855km；站点与线路偏差 5–77km，保留真实偏差而非硬掰对齐",
        },
      ],
    },
    {
      id: "after",
      eyebrow: "After",
      heading: "之后",
      paragraphs: [
        `截至 2026 年 5 月底，平台已上线公网（阿里云东京节点），团队多人、多设备、多运营商网络实测可正常注册、登录、浏览与 AI 问答。`,
      ],
      bullets: [
        `平台规模：7 个用户端模块 + 5 类 Admin 后台 + 完整 Auth 体系，三端响应式`,
        `数据规模：18 条结构化史料全部向量化、34 个站点、522 点 OSM 实测线路覆盖全线 855 公里`,
        `AI 实测（30 题 smoke test，可脚本回归）：域内答案事实准确率 100%（20 题零幻觉）、越界拒答率 95%、首字节延迟 720ms、完整回答平均 3.7 秒`,
        `工程细节：京華老宋体本地子集化，首屏字体 4.5MB → 87KB`,
        `项目荣誉：入选 2026 年中国国际大学生创新大赛（研究生组）并获奖`,
      ],
      paragraphsAfter: [
        `如实说明：项目当前处于团队演示与汇报阶段，尚未对公众开放运营。以上是工程质量与 AI 质量数据，不是业务数据——B 端签约与商业化验证是下一阶段的事。`,
      ],
      images: [
        {
          src: "/works/yunshangmigui/05-admin.png",
          alt: "Admin 管理控制台 · 数据总览",
          w: 1600,
          h: 1002,
          caption:
            "Admin 后台 · 6 角色 RLS 分权（总览 / 史料 / 影像 / 商品 / 社区审核 / 用户），权限在数据库层强制",
        },
      ],
    },
    {
      id: "value",
      eyebrow: "Business Value",
      heading: "商业价值",
      paragraphs: [
        `市场侧：B 端机构（博物馆 / 档案馆 / 文旅局 / 中小学 / 国企党建）全国超 10 万家，云南本地政企研学与数字化项目年需求测算超 10 亿元；C 端核心客群约 210–230 万人，核心市场年规模测算 2–7 亿元。项目填补的是西南米轨垂直领域数字化平台的空白。`,
        `模式侧：变现路径"展示但不深做"——VIP 会员与文创商城完成了入口与体系设计（6 级角色、商品架构），支付闭环留到验证期。对外，这证明商业模式想清楚了；对内，省下的资源全部投给核心体验。砍掉的不是能力，是优先级。`,
        `对我个人：它是"1 Person + AI = A Team"的最强证据——产品、AI、工程、运维一个人走通全链路。这是我和大多数转型 PM 的关键差异。`,
      ],
      images: [
        {
          src: "/works/yunshangmigui/06-community.png",
          alt: "米轨同好社区 · UGC 帖子流",
          w: 1200,
          h: 1344,
          tall: true,
          caption:
            "研学社区 · UGC 内容沉淀（路线寻踪 / 摄影 / 游记），文化 IP 的轻量传播与社区入口",
        },
      ],
    },
    {
      id: "future",
      eyebrow: "Future State",
      heading: "未来目标",
      paragraphs: [
        `下一阶段：对公众开放运营，积累真实用户与留存数据；启动 B 端机构合作与商业化验证；持续扩充史料库与评估集（"青藏铁路"相邻领域拒答 case 已列入下一版优化）。`,
        `以及三条会带去下一个项目的方法论沉淀：`,
      ],
      bullets: [
        `AI 是调味料，不是主菜——南渡 AI 只占六分之一，承重的是史料、地图、社区；先想清楚用户旅程，再判断哪里值得加 AI`,
        `决策要文档化——12 条 Decision Notes 让每个选择可追溯、可复盘，独立项目尤其需要`,
        `约束驱动创新——备案约束 → 东京节点；字体被墙 → 子集化 4.5MB→87KB；适配时间不够 → 核心路径真适配 + 次要页面分级止损`,
      ],
    },
  ],
  backHref: "/works/ai",
  backLabel: "返回 AI 作品集",
};

export const metadata: Metadata = {
  title: "云上米轨 · AI 项目案例 · 陈彦均",
  description:
    "云上米轨：百年滇越铁路数字化知识服务平台（BtoBtoC），6 大模块 + 南渡 AI 知识问答，已上线公网。域内答案事实准确率 100%、越界拒答率 95%（30 题实测）。",
};

export default function YunShangMiGuiCase() {
  return <CaseStudy data={DATA} />;
}
