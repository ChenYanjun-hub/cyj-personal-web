import type { Metadata } from "next";
import CaseStudy, {
  type CaseStudyData,
} from "@/components/works/case-study";

/*
  /works/ai/contract · 购销合同审查助手案例详情页
  ---------------------------------------------------------------
  AI 作品集列表「购销合同审查助手」卡片的 CASE STUDY 跳转目标 · 用 CaseStudy 模板渲染。

  内容来源：md/分身知识库采集清单.md 项目 C（C.1–C.12，由负责人填全）。
  角色如实区分：他独立完成产品化与全栈工程（AI 审查工作流逻辑由同事在 Coze 配置），
  非 0-to-1 主导——口径与卡片 / 分身一致，不夸大。
*/

const DATA: CaseStudyData = {
  slug: "contract",
  category: "AI Workflow · toB · 合同初审",
  title: "购销合同审查助手",
  titleEn: "Sales Contract Review Assistant",
  intro: `他独立完成产品设计与全栈工程，把一个 Coze 审查工作流，做成可上传文件、可审查、可下载报告的完整 Web 产品——一个已部署 Vercel、公司内部测试中的购销合同初审辅助工具。`,
  tone: ["#5a5246", "#171411"],
  mark: "CONTRACT",
  heroBg: "/works/contract/cover.png",
  hero: {
    src: "/works/contract/02-workbench.png",
    alt: "合同审查工作台 · 上传合同材料 + 选我方公司/买卖方立场/审查模式，右侧系统连接状态与审查重点维度",
    w: 2922,
    h: 2666,
    caption:
      "审查工作台 · 左栏上传 .txt / .docx 合同材料，右栏「审查策略」选我方立场（买方 / 卖方）+ 审查模式（快速 / 精细）+ 系统连接状态——一屏配置完一次初审",
  },
  meta: [
    { label: "Role", value: "前后端产品化落地 · 工程接入 · 部署" },
    { label: "Team", value: "他独立完成产品与全栈工程 · 同事配置 Coze 审查工作流" },
    { label: "Stack", value: "Next.js · Vercel · Coze 文件工作流" },
    { label: "Type", value: "toB · AI Workflow · 垂直场景 MVP" },
  ],
  sections: [
    {
      id: "problem",
      eyebrow: "Customer Problem",
      heading: "客户问题",
      paragraphs: [
        `面向企业内部场景的购销合同智能审查，服务法务、采购、销售、内控岗位，用于合同签署前的标准化初审。它要解决三个真实痛点：`,
      ],
      bullets: [
        `标准不统一：传统审查依赖人工经验，不同审核人关注点不同，审查口径难一致`,
        `效率低、易漏审：购销合同数量大、频率高，人工逐条阅读慢，业务推进中容易漏审`,
        `知识难沉淀：审查结果停留在聊天记录或文档批注里，难以形成可复用、可复核的风险知识`,
      ],
      paragraphsAfter: [
        `所以产品目标不是替代正式法律意见，而是把购销合同初审流程标准化，帮团队更快发现高风险条款，并形成结构化、可复核的审查结果。`,
      ],
    },
    {
      id: "what-i-did",
      eyebrow: "What I Did",
      heading: "我做了什么",
      paragraphs: [
        `我独立完成了这个产品从设计到上线的全部产品化与全栈工程——把一个还停留在 Coze 概念的审查工作流，一个人做成了真正能上线的完整产品。合同审查的工作流逻辑由同事在 Coze 配置，其余全部——产品设计、前后端、联调、协议对齐、上线——都由我完成。`,
      ],
      bullets: [
        `三大核心页面：首页 / 审查工作台 / 结果页 的设计与实现`,
        `.txt 与 .docx 文件上传解析 + 后端 API 封装 + Coze 文件工作流接入`,
        `系统连接状态检测 + 审查结果标准化处理`,
        `Vercel 部署上线 + 多轮 UI/UX 细节优化（流程图标、结果页专业化展示、状态胶囊修复等）`,
      ],
      paragraphsAfter: [
        `最难的不是页面，是 Coze 文件工作流联调：真实工作流并不直接接收合同正文，而要先调 /v1/files/upload 拿到 file_id，再把 file_id 作为 hetong 参数传给 /v1/workflow/run；而且 Coze 返回的外层 data 其实是 JSON 字符串，后端要二次解析、提取 inner.data 作为报告内容。我为此新增了文件版接口 /api/review-file、在 lib/coze.ts 里实现完整的文件工作流链路——项目才从"前端套接口"真正变成"完整跑通真实 AI 工作流"。`,
      ],
      images: [
        {
          src: "/works/contract/01-home.png",
          alt: "购销合同审查助手首页整页 · Hero 平台主张 + 客户问题三卡 + 立场化风险识别 + 三步审查流程",
          w: 2922,
          h: 4304,
          tall: true,
          caption:
            "产品首页（整页）· 把同事的 Coze 审查工作流，做成有 Hero 主张、客户问题、能力说明与「三步完成初审」流程的完整 Web 产品——已部署 Vercel · 公司内部测试中",
        },
      ],
    },
    {
      id: "decisions",
      eyebrow: "Key Decisions",
      heading: "关键决策",
      paragraphs: [
        `几个让产品边界清晰、又守住低容错底线的决策：`,
      ],
      bullets: [
        `场景严格收敛在购销合同初审——不一上来做所有合同类型，让审查维度更稳定、更易验证价值`,
        `保留采购方 / 销售方两套立场——同一份合同在不同交易身份下关注点完全不同（采购方关注质量/交付/验收/违约救济，销售方关注付款/拒收拒付/责任限制）`,
        `定位"法务辅助工具"而非替代法律意见——保留免责声明 + 人工复核 + 失败兜底，不把模型输出包装成绝对正确的结论`,
        `做的是 AI 工作流产品而非 Prompt 包装——用户先上传合同、选立场和模式，再走固定工作流；结果统一标准化，接口异常时自动退回示例结果而不是白屏`,
      ],
      paragraphsAfter: [
        `防幻觉的思路不是"模型一定不能错"，而是"低容错场景下让输出可控、可解释、可兜底"——场景限制 + 固定工作流 + 结果标准化 + 异常退回示例模式；文档里也建立了审查项召回率、中高风险召回率、原文定位准确率、幻觉率、修改建议可用性等评测思路。`,
      ],
      images: [
        {
          src: "/works/contract/03-stance.png",
          alt: "审查策略面板 · 审查立场买方 / 卖方二选一，附两套立场关注点说明",
          w: 768,
          h: 1000,
          compact: true,
          caption:
            "保留买方 / 卖方两套立场——同一份合同在不同交易身份下关注点完全不同（买方重质量 / 交付 / 验收 / 违约救济，卖方重付款 / 验收期限 / 责任边界），立场决定系统识别风险的视角",
        },
      ],
    },
    {
      id: "after",
      eyebrow: "After",
      heading: "之后",
      paragraphs: [
        `我会把它定义为"完成核心链路、可真实运行、已部署 Vercel 公司内部测试的垂直场景 MVP"。`,
      ],
      bullets: [
        `完整用户流程跑通：上传合同 → 解析文件 → 配置审查策略 → 调用 Coze 文件工作流 → 展示结果 → 复制 / 下载报告`,
        `GitHub 管理代码 + Vercel 部署（公司内部测试）；/api/health 检测工作流连接状态，环境变量缺失时退回示例模式、不影响演示`,
        `迭代有迹可循：afe21ae 初始 MVP → 4dede76 .docx 解析 → 40f9897 Coze 文件工作流接入 → 后续 UI 与环境变量安全优化`,
      ],
      paragraphsAfter: [
        `如实说明：从商用角度它还不算完整产品——复杂 PDF/OCR、批量任务、权限控制、审计日志、企业规则库、标准合同模板对比等企业级能力都还没做。`,
      ],
      images: [
        {
          src: "/works/contract/04-status.png",
          alt: "系统连接状态卡 · 工作流已连接，服务端 Token / Workflow ID 已配置、API Base 显示",
          w: 1408,
          h: 386,
          maxW: 620,
          caption:
            "系统连接检测 · /api/health 实时校验工作流连接（Token / Workflow ID / API Base），环境变量缺失时退回示例模式不白屏——可真实运行 + 有兜底",
        },
      ],
    },
    {
      id: "results",
      eyebrow: "Results",
      heading: "成果",
      paragraphs: [
        `成果体现在三层：`,
      ],
      bullets: [
        `产品层：把原本只是"工作流概念"的合同审查能力，做成了含首页 / 工作台 / 结果页 / 连接状态的完整 Web 产品`,
        `工程层：.txt/.docx 上传解析、Coze 文件工作流接入、健康检查、结果标准化、Markdown 报告展示、Vercel 部署的完整链路`,
        `展示层：结果页不只给风险摘要，还支持风险等级筛选、专业报告元数据、复制报告、下载 .md/.txt——让输出更接近真实交付物，而非模型原始响应`,
      ],
      images: [
        {
          src: "/works/contract/05-result.png",
          alt: "购销合同智能审查报告页 · 审查评分 + 高/中/低风险统计 + 关键风险发现 + 风险清单（逐条原文/等级/置信度）",
          w: 2922,
          h: 2724,
          caption:
            "审查报告页 · 综合评分 + 高 / 中 / 低风险统计 + 关键风险发现卡 + 风险清单（逐条原文定位、风险等级、置信度、修改建议）——结构化、可复核的交付物，而非模型原始响应",
        },
        {
          src: "/works/contract/06-report.png",
          alt: "报告页底部 · 继续审查 / 复制报告 / 下载 Markdown，附「AI 仅供初审辅助、不构成法律意见」使用说明",
          w: 1420,
          h: 686,
          maxW: 620,
          caption:
            "交付与免责 · 报告可复制、下载 Markdown，并明确「AI 仅供初步审查辅助、不构成正式法律意见，高风险条款优先人工复核」——定位法务辅助工具而非替代",
        },
      ],
    },
    {
      id: "future",
      eyebrow: "Future State",
      heading: "未来目标",
      paragraphs: [
        `继续迭代会优先三件事：`,
      ],
      bullets: [
        `增强文档解析：补齐 PDF、扫描件、OCR（真实企业合同里非常常见，现在只支持 .txt/.docx）`,
        `报告结构化升级：把 Markdown 报告升级为更强的结构化风险项输出，支撑筛选、对比、统计与知识沉淀`,
        `引入企业化能力：标准合同模板对比、自定义规则库、企业制度接入、审批流衔接`,
      ],
      paragraphsAfter: [
        `这三件事能把产品从"AI 演示型工具"推进到"更接近企业工作流的专项审查系统"。`,
      ],
    },
  ],
  backHref: "/works/ai",
  backLabel: "返回 AI 作品集",
};

export const metadata: Metadata = {
  title: "购销合同审查助手 · AI 项目案例 · 陈彦均",
  description:
    "购销合同审查助手：toB AI Workflow 产品，把 Coze 合同审查工作流封装为可上传文件、可审查、可下载报告的完整 Web 产品，已部署 Vercel、公司内部测试中。",
};

export default function ContractCase() {
  return <CaseStudy data={DATA} />;
}
