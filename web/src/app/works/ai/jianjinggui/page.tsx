import type { Metadata } from "next";
import CaseStudy, {
  type CaseStudyData,
} from "@/components/works/case-study";

/*
  /works/ai/jianjinggui · 建景规规范问答助手案例详情页
  ---------------------------------------------------------------
  AI 作品集列表「建景规规范问答助手」卡片的 CASE STUDY 跳转目标。

  口径：以分身知识库 md B.1–B.11（最新真值，负责人确认）为准——
  6 类规范 / 综合 86.6→90.3 / 评测集 50→171 / 语料 89 部·6 域·10785 chunks / 77 条方法论。
  （项目早期 PROJECT_SUMMARY.md 结题快照是 5 域/89.9/150/52，已是过期数，不用。）
  方法论细节（RAG pipeline、7 维评测、噪声三次交集）取自项目工程文档，与 md 一致。
*/

const DATA: CaseStudyData = {
  slug: "jianjinggui",
  category: "RAG · toB · 规范法条数据库",
  title: "建景规规范问答助手",
  titleEn: "Architectural Norm RAG Assistant",
  intro: `AI 版设计规范"法条数据库"——用自然语言查规划 / 建筑 / 景观 / 消防 / 结构 / 市政 6 类规范，每条回答都附规范全称、标准号、条文号、原文摘引与 PDF 原文跳转，可追溯、不编造。`,
  tone: ["#2b4a72", "#0d1420"],
  mark: "RAG",
  hero: {
    src: "/works/jianjinggui/01-qa.png",
    alt: "建景规·助手 设计规范智能查询首页 · 左栏 6 类规范分类，中部「像查法条一样查规范」+ 示例问题，右栏规范出处",
    w: 2936,
    h: 1662,
    caption:
      "产品首页 · 左栏 6 类规范分类（规划 / 市政 / 建筑 / 景观 / 结构 / 消防，89 部 · 10785 条条文），中部「像查法条一样查规范」定位 + 示例问题，右栏「规范出处」回链原文",
  },
  meta: [
    { label: "Role", value: "产品负责人 · 决策者 · AI 辅助开发" },
    { label: "Stack", value: "DeepSeek · BGE-M3 · BGE-Reranker-v2 · Qdrant · SQLite · FastAPI · React" },
    { label: "Scale", value: "89 部规范 · 6 域 · 10785 chunks" },
    { label: "Type", value: "toB · 垂类 RAG · 评测体系" },
  ],
  sections: [
    {
      id: "problem",
      eyebrow: "Customer Problem",
      heading: "客户问题",
      paragraphs: [
        `目标用户是中型设计院的规划师 / 建筑师——专业、低容错、日常要反复查规范条文做设计依据。规划 / 建筑 / 景观 / 消防 / 结构 / 市政 6 类规范散落在大量 PDF（89 部 / 10785 chunks）里，查阅困难：`,
      ],
      bullets: [
        `关键词搜索难定位精确条款`,
        `跨规范查询要同时开多个 PDF 对照`,
        `强制性用语易混——"应 / 不应" vs "宜 / 不宜"，一字之差含义天差`,
        `数字数据（服务半径 / 绿地率 / 容积率等）查得慢`,
      ],
      paragraphsAfter: [
        `而通用大模型查规范会一本正经地编出不存在的规范号、条文号和数字——对"像查法条一样严谨"的场景完全不可接受。产品的立身之本，就是把这件事用工程手段守住。`,
      ],
    },
    {
      id: "what-i-did",
      eyebrow: "What I Did",
      heading: "我做了什么",
      paragraphs: [
        `我是项目的产品负责人与决策者，用 AI 辅助开发落地：从产品定义、技术选型、评测体系到红线治理全链路自己拍板，关键是能判断 AI 产出对不对、敢温柔挑战它的结论。`,
      ],
      bullets: [
        `产品定义：圈定 6 类规范范围，定 4 条红线——不编造 / 引用精确（规范全称 + 标准号 + 条文号 + 跳转）/ 强条用语不可错 / 不给合规结论`,
        `RAG pipeline：BGE-M3 召回 Top20 → BGE-Reranker-v2 重排 Top5 → 阈值过滤 → DeepSeek 流式生成；W3 加 multi-query 多路召回；0 命中触发"未在现行规范库中查询到"兜底`,
        `评测体系：7 维 LLM Judge（检索召回 / 精确条款 / 引用准确 / 原文用词★ / 数字精确★ / 边界识别 / 不编造★）+ 一票否决 veto`,
        `红线工程化：post_filter 剥离编造段、align_modal_verbs 校量词、align_numbers 校数字、dangling 监控越界引用号——红线靠拦截，不靠 prompt 祈祷`,
      ],
      paragraphsAfter: [
        `知识库构建是最难的一块：分块以"条"为基本单元、表格 / 公式独立成块、每块强制保留规范号 / 章节 / 条文号 / 页码元数据——因为"引用精确"是红线，元数据丢了就无法溯源。语料从 39 部扩到 89 部 / 6 域 / 10785 chunks，期间还做了系统性的 OCR 错字治理。`,
      ],
      images: [
        {
          src: "/works/jianjinggui/02-citation.png",
          alt: "实际问答 · 回答内联 [n] 引用角标，右栏结构化引用卡（规范全称 + 标准号 + 条文号 + 查看原文 PDF）",
          w: 2922,
          h: 1646,
          caption:
            "结构化引用 · 回答逐句挂 [n] 角标，右栏「规范出处」卡片给出规范全称 + 标准号 + 条文号 + 原文摘引 + PDF 跳转——把「引用精确」红线落到 UI",
        },
      ],
    },
    {
      id: "decisions",
      eyebrow: "Key Decisions",
      heading: "关键决策",
      paragraphs: [`几条最硬的取舍：`],
      bullets: [
        `RAG 而非微调——可解释（引用回链的前提）、可维护（新增规范 = 1 次 embedding）、规范库规模远不到微调量级；"答案可溯源"是立身之本，直接排除纯生成方案`,
        `红线工程化——发现把 chunks 修干净后模型反而更敢编造，于是把红线做成可检测、可拦截的后处理，而不是只清数据、只调 prompt`,
        `评测先于优化——拒绝"改了感觉好了"，所有改动过 7 维评测 + veto；"改了不涨 / 反而劣化"也如实记录`,
        `砍功能的纪律——用户最想要"上传方案查合规"，但它直接撞"不下合规结论"的定位 + OCR 质量风险，果断降级为"列相关条文供自查"，宁可少功能不破红线`,
      ],
      images: [
        {
          src: "/works/jianjinggui/04-reject.png",
          alt: "边界兜底场景 · 模糊问题触发智能追问，要求补充专业领域 / 设计对象 / 查询参数",
          w: 1846,
          h: 962,
          caption:
            "红线工程化 · 模糊问题（ambiguous）不硬答，触发兜底追问补全专业领域 / 设计对象 / 查询参数——宁可追问，不可编造，8 类边界各有兜底",
        },
      ],
    },
    {
      id: "eval",
      eyebrow: "Evaluation",
      heading: "评测，与对噪声的诚实",
      paragraphs: [
        `这个项目最值钱的不是代码，是一套"经得起方差检验"的评测方法论——也是我最想让人看到的部分。`,
      ],
      bullets: [
        `综合质量分 86.6（MVP）→ 88.3 → 90.3（首次破 90）`,
        `单次 veto 38 → 27 → 13；原文用词维度 86.2% → 94%`,
        `但单次 LLM Judge 约一半是噪声——他用三次交集 + 方差分析才认定一个真问题，绝不信单次分数`,
        `评测集从 50 条扩到 171 条；评测集本身要先校准——他发现过评测工具自己的 bug 污染结论`,
      ],
      paragraphsAfter: [
        `一条更深的方法论：二值阈值指标（veto）对噪声极敏感、连续均值（综合分）稳——headline 用连续分，找真问题用多次交集。这种"对自己指标的诚实"，正是判断 AI 能不能可靠嵌入产品的核心能力。`,
      ],
      images: [
        {
          src: "/works/jianjinggui/05-eval.png",
          alt: "质量评测报告 · 综合分 90.3、原文用词 94%、veto 38→13，7 维度评分 + 综合分趋势图",
          w: 1360,
          h: 1600,
          maxW: 560,
          caption:
            "质量评测报告 · 7 维 LLM Judge（171 题 · v2.0 回归）—— 综合分 90.3、原文用词 94%、单次 veto 38→13；headline 用连续均值，找真问题靠多次交集",
        },
      ],
    },
    {
      id: "after",
      eyebrow: "After",
      heading: "之后",
      paragraphs: [
        `核心闭环（能问 → 能答 → 能溯源）全通，已可本地 + 内网穿透（cloudflared）分享给他人体验。`,
      ],
      bullets: [
        `功能：MVP（结构化引用卡 + PDF 原文跳转 + 8 类边界兜底 + SSE 流式）+ V2（多轮对话、智能追问推荐、对话历史本地持久化、规范现行状态显示、侧栏规范分类 + 多选限定只查某几部、右栏内嵌 PDF 阅读器定位被引页）`,
        `质量：7 维综合分 90.3、单次 veto 砍到 13、原文用词 94%；多轮升级后离线评测确认无回归`,
        `语料：89 部 / 6 域 / 10785 chunks`,
      ],
      paragraphsAfter: [
        `如实说明：均为离线评测 + 自测数据，没有真实用户流量 / 留存 / 转化；toB 签约、商业化验证未开始——是下一阶段的事。`,
      ],
      images: [
        {
          src: "/works/jianjinggui/06-pdf.png",
          alt: "内嵌 PDF 阅读器 · 右栏定位到被引规范原文页（CJJ/T 75-2023 第 10 页），左栏回答附智能追问推荐",
          w: 2490,
          h: 1664,
          caption:
            "V2 · 右栏内嵌 PDF 阅读器直接定位被引页（《城市道路绿化设计标准》CJJ/T 75-2023 第 10 页）可缩放校对原文，左栏底部给智能追问推荐",
        },
        {
          src: "/works/jianjinggui/03-sidebar.png",
          alt: "多选限定提问框 · 只在选定的 3 部规范内提问",
          w: 1480,
          h: 358,
          maxW: 620,
          caption:
            "V2 · 多选限定——勾选若干规范后「只查」这几部（图中 3 部），把检索范围收窄到指定标准再提问",
        },
      ],
    },
    {
      id: "takeaways",
      eyebrow: "Takeaways",
      heading: "沉淀：77 条洞察 + 可迁移方法论",
      paragraphs: [
        `全过程沉淀成 77 条 AIPM 产品洞察（已主题化成 8 大主题 + 面试金句），其中可迁移到任何 AI 产品的核心几条：`,
      ],
      bullets: [
        `评测先于优化——没有可信评测，所有"优化"都是自我安慰`,
        `红线工程化——把"不编造 / 引用精确"做成可检测、可拦截的后处理，而非靠 prompt 祈祷`,
        `噪声意识 + 上游数据优先——区分真信号与判官噪声；数据质量是天花板，扩量前先体检数据`,
        `失败资产化、诚实交付——失败实验保留代码 + 默认关 flag + 文档解释；负面结论也是交付`,
      ],
      paragraphsAfter: [
        `这套方法论不绑定规范领域，是判断"AI 能力能否可靠嵌入产品"的通用工具——也是这个项目相对"只会调 prompt"的最大差异。`,
      ],
    },
  ],
  backHref: "/works/ai",
  backLabel: "返回 AI 作品集",
};

export const metadata: Metadata = {
  title: "建景规规范问答助手 · AI 项目案例 · 陈彦均",
  description:
    "建景规规范问答助手：toB 垂类 RAG，AI 版设计规范法条数据库。6 类规范、89 部语料，7 维 LLM Judge 评测体系，综合质量 90.3、原文用词 94%，严守可追溯红线。",
};

export default function JianjingguiCase() {
  return <CaseStudy data={DATA} />;
}
