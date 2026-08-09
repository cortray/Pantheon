# Pantheon · 万神殿

> 一份个股深度研究报告，汇集 9 大投资流派的决策视角、22 个维度的公开数据与 22 种机构级分析模型。

Pantheon 是一款面向 A 股 / 港股 / 美股的个人投资者深度分析工具。输入一只股票，它自动完成数据采集、财务建模、多流派评审与报告生成，输出一份自包含的 HTML 研究报告，全程免费数据源、无需任何 API key。

## 功能一览

- **多流派投资评审** — 内置 9 大投资流派（价值、成长、宏观、技术、中国价投、A 股短线游资、量化、科技领袖、AI 卡位）共 66 位虚拟评审，每位基于独立规则集给出评分、方向与引用依据的结论
- **22 维数据覆盖** — 行情、财务、K 线技术面、产业链、护城河、龙虎榜、资金流向、舆情热度、政策、杀猪盘特征识别等
- **22 种分析模型** — DCF 估值、同行对标、LBO、并购分析、三表预测、Porter 五力、BCG 矩阵、投委会备忘录、首次覆盖报告、催化剂日历等
- **三档运行模式** — 快速速判（1-2 分钟）、标准分析（5-8 分钟）、深度研究（15-20 分钟，含多空结构化辩论）
- **质量闸门** — 报告生成前执行 13 项自动校验，严重问题会阻止报告输出
- **跨市场支持** — A 股 / 港股 / 美股 / 日韩台等主要市场，中文名、代码、英文名均可识别
- **横向对比与组合** — 支持 2-4 只股票对比、CSV 持仓组合健康度分析
- **多形态产物** — 自包含 HTML 报告（可离线打开）、朋友圈竖图、群聊战报、一段话摘要

## 快速开始

安装完成后，在你的 AI 编程助手（Claude Code / Codex / Gemini CLI 等）中直接说：

```
分析 贵州茅台
深度分析 600519，出 IC 投委会备忘录
```

或使用预置命令：

```
/stock-deep-analyzer:analyze-stock 贵州茅台    # 完整分析
/stock-deep-analyzer:quick-scan 002217         # 30 秒速判
/stock-deep-analyzer:scan-trap 002217          # 杀猪盘排查
/stock-deep-analyzer:dcf 600519                # DCF 估值
```

命令行直跑：

```bash
python run.py 贵州茅台
```

## 安装

Pantheon 以 AI 编程助手插件 + Python CLI 两种形态分发，任选其一。

### Claude Code

```bash
/plugin marketplace add cortray/Pantheon
/plugin install stock-deep-analyzer
```

### Codex / OpenAI CLI

> 请按照 https://raw.githubusercontent.com/cortray/Pantheon/main/.codex/INSTALL.md 安装，然后分析 600519

### Cursor

```bash
/add-plugin stock-deep-analyzer
```

### Gemini CLI

```bash
gemini extensions install https://github.com/cortray/Pantheon
```

### OpenClaw / 其他 Agent

> 安装 https://github.com/cortray/Pantheon 这个股票分析技能

### Python CLI（直接运行）

```bash
git clone https://github.com/cortray/Pantheon.git
cd Pantheon
pip install -r requirements.txt
python run.py 贵州茅台
```

安装后注意：所有命令都需要 `stock-deep-analyzer:` 前缀（短名在某些环境不会自动解析），例如 `/stock-deep-analyzer:analyze-stock`。共提供 20 个命令。

## 使用指南

### 命令一览

| 命令 | 用途 |
|---|---|
| `analyze-stock <ticker>` | 完整深度分析（默认档位） |
| `quick-scan <ticker>` | 快速速判 |
| `panel-only <ticker>` | 仅查看评审投票结果 |
| `dcf <ticker>` | DCF 估值（WACC + 敏感性热力图） |
| `comps <ticker>` | 同行对标（PE/PB 分位） |
| `lbo <ticker>` | LBO 测算（PE 视角 IRR） |
| `initiate <ticker>` | 机构首次覆盖报告 |
| `ic-memo <ticker>` | 投委会备忘录（三情景回报） |
| `earnings <ticker>` | 财报解读 |
| `earnings-preview <ticker>` | 财报前瞻（一致预期 + 多空情景） |
| `catalysts <ticker>` | 催化剂日历 |
| `thesis <ticker>` | 投资逻辑追踪 |
| `screen <ticker>` | 量化筛选（价值/成长/质量） |
| `dd <ticker>` | 尽调清单 |
| `scan-trap <ticker>` | 杀猪盘排查 |
| `segmental-model <ticker>` | 分业务自下而上建模 |
| `ai-readiness <ticker>` | AI 产业链卡位评估 |
| `model-update <ticker>` | 财报后模型增量更新 |
| `returns` | 组合收益归因 |
| `rebalance` | 组合再平衡（含 A 股交易成本） |

### CLI 进阶

```bash
python run.py 600519.SH --depth lite          # 快速档
python run.py 300394.SZ --school I            # 只看某一流派的视角（A-I 任选）
python run.py --versus 茅台 五粮液 002594.SZ   # 多股对比
python run.py --portfolio holdings.csv        # 组合健康度
python run.py 600519.SH --output-dir /out     # 指定输出目录（可对接其他系统）
python run.py 600519.SH --remote              # 生成公网链接，手机可看
```

### 运行模式

| 模式 | 耗时 | 数据维度 | 评审规模 | 适用场景 |
|---|---|---|---|---|
| `lite` | 1-2 分钟 | 核心 7 项 | 10 位代表 | 快速判断、临时提问 |
| `medium`（默认） | 5-8 分钟 | 全部 22 项 | 66 位完整 | 常规深度分析 |
| `deep` | 15-20 分钟 | 22 项 + 强化兜底 | 66 位 + 多空辩论 | 建仓前研究、投委会材料 |

首次安装或网络异常时会自动降级到 `lite` 避免卡死，手动指定 `--depth` 始终优先。

## 投资评审模型

Pantheon 的核心不是单一算法，而是一个"多流派评审团"：将投资世界中观点差异最大的几类打法抽象为可计算的评审角色，同一份数据用不同哲学解读，分歧本身就是信息。

| 流派 | 代表视角 | 评审规模 |
|---|---|---|
| 经典价值 | 安全边际、护城河、ROE 质量 | 6 位 |
| 成长投资 | 增速、赛道、颠覆性创新 | 9 位 |
| 宏观对冲 | 周期位置、利率环境、逆向思维 | 7 位 |
| 技术趋势 | 趋势阶段、量价行为 | 4 位 |
| 中国价投 | 生意本质、管理层、认知差 | 7 位 |
| A 股短线游资 | 题材热度、盘面结构、情绪周期 | 24 位 |
| 量化系统 | 因子暴露、统计套利 | 4 位 |
| 科技领袖派 | 产业链视角、技术路线判断 | 4 位 |
| AI 卡位猎手 | 供应链瓶颈、卡脖子环节 | 1 位 |

每位评审的结论都来自量化规则集（共 240+ 条），并标注命中的具体依据；人工参与的评审环节会站在该流派立场上复核数据，允许覆盖规则打分但必须给出理由。

### 关于 AI 卡位视角（I 组）

该流派关注"当前 AI 浪潮中谁卡住了产业链咽喉"：不追已被充分定价的龙头，而是沿供应链向上游寻找不可替代、供给紧张、尚未被市场重新定价的环节。它也是唯一专门针对 AI 产业链的评审视角，可用 `--school I` 单独运行。

## 财务分析方法

覆盖投行与 PE 日常工作流，参数已适配 A 股环境（无风险利率 2.5% / 股权风险溢价 6% / 税率 25% / 终值增速 2.5%）：

- **估值**：DCF（两段自由现金流 + 终值 + 敏感性矩阵）、Comps、LBO、并购增厚/摊薄、三表联动预测
- **研究**：首次覆盖报告、财报解读、催化剂日历、投资逻辑追踪、量化筛选
- **决策**：投委会备忘录（三情景）、Porter 五力、BCG 矩阵、尽调清单、组合再平衡

## 数据与可靠性

### 数据源

全部为免费公开接口，无需付费订阅：

| 数据类型 | 主源 | 备用链 |
|---|---|---|
| 行情 / 估值 | 东方财富 | 雪球 → 腾讯 → 新浪 |
| 财务数据 | akshare | 雪球 F10 |
| K 线 / 技术指标 | akshare | yfinance |
| 交易行为数据 | akshare | 东方财富 |
| 公告 / 研报 | 巨潮资讯 | 同花顺 |
| 港股 / 美股 | akshare | yfinance |
| 全球同行 / 汇率 | Yahoo Finance | 本地同行 + 24h 缓存 |
| 宏观 / 舆情 | DuckDuckGo | 六大社交平台热榜 |

单一数据源失败会自动切换备用链，不会中断报告。

### 可选增强

- **东方财富妙想 API**：设置 `MX_APIKEY`（免费申领）后，中文名纠错与行情快照走官方通道，境外访问更稳定；未设置时自动回退，无需任何配置
- **雪球登录**：启用后可获取实盘组合持仓数据（`19_contests` 维度）；默认跳过，不影响其他维度

### 数据缺口策略

采集不到的数据不会用默认值填充：缺口会记录在 `_data_gaps.json` 并给出恢复建议；确实无法补齐的字段在报告中明确标注"数据缺失"，与"结论性看空"清晰区分。

### 质量闸门

报告组装前自动执行 13 项校验（行业分类合理性、数据完整性、港股数据链、评审覆盖率、分析记录是否完整等），严重项未修复时报告无法生成。每次修复过的缺陷都会沉淀为新的校验规则。

## 项目结构

```
Pantheon/
├── run.py                  # CLI 入口
├── skills/
│   └── deep-analysis/
│       ├── SKILL.md        # 分析工作流定义
│       ├── personas/       # 评审角色档案
│       ├── assets/         # 报告模板与资源
│       └── scripts/        # Python 业务代码
│           ├── fetch_*.py          # 22 个数据采集器（可独立运行）
│           ├── compute_deep_methods.py  # 财务建模
│           ├── assemble_report.py  # 报告组装
│           ├── lib/pipeline/       # 主流程（采集→评分→综合）
│           ├── lib/report/         # 报告渲染模块
│           ├── lib/self_review.py  # 质量校验
│           └── tests/              # 685 项测试
├── commands/               # 20 个预置命令
├── client/                 # Electron 桌面客户端
├── docs/                   # 文档与故障记录
├── requirements.txt
└── LICENSE
```

## 常见问题

**一次分析要多久？** 5-8 分钟（标准档），主要耗时在数据采集；纯计算部分不到 1 秒。`lite` 档 1-2 分钟。

**需要付费数据源吗？** 不需要。所有数据来自免费公开接口，零 API key。

**支持哪些市场？** A 股、港股、美股，以及日、韩、台等主要市场。

**报告可信度如何保证？** 生成前有 13 项自动校验；每条评审结论都要求引用数据依据；缺失数据会显式标注而非编造。

**报告能作为投资建议吗？** 不能。所有评分与评语均为算法输出，不代表任何真实投资者的观点。

**如何升级？** 每次启动自动检查 GitHub 新版本并提示；命令行用户 `git pull` 即可。

## 版本历史

| 版本 | 日期 | 要点 |
|---|---|---|
| v3.9.3 | 2026-08 | 现金流口径修正、同行兜底、渲染修复、深度档强制评审介入 |
| v3.9.2 | 2026-07 | 数据契约对齐、缺口识别修正、输出流程统一 |
| v3.9.1 | 2026-06 | 报告导航可折叠、可访问性改进 |
| v3.9.0 | 2026-06 | 新增首位基于实盘数据蒸馏的游资评审（66 位） |
| v3.8.x | 2026-06 | 新增 5 个分析命令、AI 卡位流派严谨化、技术指标扩展 |
| v1.0 – v3.7 | 2026-04 ~ 05 | 从 19 维/50 评审演进至 22 维/66 评审，引入三档模式、质量闸门、多股对比、管道架构 |

完整记录见 [RELEASE-NOTES.md](RELEASE-NOTES.md)。

## 免责声明

本工具由 AI 模型基于公开数据生成分析报告。所有评分、建议、模拟评语均为算法输出，**不构成投资建议**。投资有风险，入市需谨慎。

---

MIT License · [Pantheon](https://github.com/cortray/Pantheon)
