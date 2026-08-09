<div align="center">

# Pantheon · 万神殿

*"66 个投资大佬帮你看盘，巴菲特、赵老哥和股海贼王终于坐在了同一张桌子上。"*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://python.org)
[![Dimensions](https://img.shields.io/badge/Dimensions-22-brightgreen)]()
[![Investors](https://img.shields.io/badge/Investors-66-orange)]()
[![Methods](https://img.shields.io/badge/Institutional%20Methods-22-red)]()
[![Self-Review](https://img.shields.io/badge/Self--Review-13%20checks-blueviolet)](skills/deep-analysis/scripts/lib/self_review.py)

A 股 / 港股 / 美股 · 个股深度分析引擎 · **66 位评审团 × 9 大流派 × 22 维数据 × 22 种机构方法** · 最新 **v3.9.3**

[快速开始](#-快速开始) · [安装](#安装) · [使用](#-使用) · [三档深度](#-三档思考深度) · [评审团](#-66-位评审团) · [机构方法](#-22-种机构级方法) · [数据源](#-数据源) · [FAQ](#-faq)

**中文** | [English](README_EN.md)

</div>

---

## 🚀 快速开始

**任何 AI agent 里丢一句话，装好就能用。** 详细装法见 [安装](#安装)。

| 你用的 agent | 直接丢这句 |
|---|---|
| **Claude Code** | `/plugin marketplace add cortray/Pantheon` 然后 `/plugin install stock-deep-analyzer` |
| **Codex / OpenAI CLI** | "按 https://raw.githubusercontent.com/cortray/Pantheon/main/.codex/INSTALL.md 装 Pantheon，分析 600519" |
| **Cursor** | `/add-plugin stock-deep-analyzer` |
| **Gemini CLI** | `gemini extensions install https://github.com/cortray/Pantheon` |
| **OpenClaw / 龙虾** | "装 https://github.com/cortray/Pantheon 这个股票分析技能" |
| **CLI 直用** | `git clone https://github.com/cortray/Pantheon.git && cd Pantheon && pip install -r requirements.txt && python run.py 贵州茅台` |

装好后最常用 4 条命令（任何 agent 里直接说）：

```
/stock-deep-analyzer:analyze-stock 贵州茅台    ← 完整 22 维 × 66 评委分析（5-8min）
/stock-deep-analyzer:quick-scan 002217         ← 30 秒速判
/stock-deep-analyzer:scan-trap 002217          ← 杀猪盘排查
/stock-deep-analyzer:dcf 600519                ← DCF 估值专项
```

---

## ✨ 核心特性

- **66 位评审团 · 9 大流派** — 价值 / 成长 / 宏观 / 技术 / 中国价投 / A股游资 / 量化 / 科技领袖 / AI 卡位猎手，共 **242 条量化规则**。每位评委必须引用命中的具体规则发言，不是模板话术
- **22 维深度数据** — 行情、财务、K 线、产业链、护城河、龙虎榜、资金流、舆情、杀猪盘检测……全部免费源，零 API key
- **22 种机构级方法** — DCF / Comps / LBO / IC 备忘录 / Porter 五力 / BCG / 首次覆盖 / 财报解读 / 催化剂日历……
- **三档思考深度** — `lite` 30 秒速判 / `medium` 标准分析 / `deep` 机构级（含 Bull-Bear 结构化辩论）
- **机械级自查 gate** — 报告生成前强制 13 条自动检查，critical 不过物理上无法出报告
- **多股对比 & 组合** — `--versus` 2-4 只横向对决 · `--portfolio` CSV 组合健康度
- **流派视角锁定** — `--school A-I` 只看某一派的判断，报告带 SCHOOL LOCK banner
- **全球同行对比** — 自动发现全球同业并补全财务，报告展示中位数与目标公司分位
- **多市场支持** — A 股 / 港股 / 美股 / 日韩台等，中文名、代码、英文名都能识别
- **多种产物** — 自包含 HTML 报告、朋友圈竖图、微信群战报、一段话摘要，离线可看

---

## 📦 安装

不管你用什么 agent，**都是丢一句话过去就行**：

### Claude Code

```
/plugin marketplace add cortray/Pantheon
/plugin install stock-deep-analyzer
```

装好后说 `/stock-deep-analyzer:analyze-stock 贵州茅台`。

> ⚠️ **必须带 `stock-deep-analyzer:` 命名空间前缀**
>
> 装 plugin 后，所有 skill/command 都以 `stock-deep-analyzer:` 开头。
> 部分环境下短名（`/analyze-stock`）不会被自动解析——稳妥起见请一律用全名：
>
> - `/stock-deep-analyzer:analyze-stock <ticker>`
> - `/stock-deep-analyzer:quick-scan <ticker>`
> - `/stock-deep-analyzer:scan-trap <ticker>`
> - `/stock-deep-analyzer:dcf <ticker>`
> - `/stock-deep-analyzer:ic-memo <ticker>`
> - `/stock-deep-analyzer:investor-panel <ticker>`
> - `/stock-deep-analyzer:trap-detector <ticker>`
> - `/stock-deep-analyzer:deep-analysis <ticker>`
> - 等全部 20 条
>
> Cursor / Gemini CLI / Codex 同理：**一律用 `/stock-deep-analyzer:<cmd>` 全名**，避免短名解析失败。

### Codex

直接对 Codex 说：

> 请按照 https://raw.githubusercontent.com/cortray/Pantheon/main/.codex/INSTALL.md 的指引安装 Pantheon，然后帮我深度分析 贵州茅台。

### OpenClaw / 龙虾

对龙虾说：

> 帮我安装 https://github.com/cortray/Pantheon 这个股票分析技能，装好后分析 贵州茅台。

### Cursor

```
/add-plugin stock-deep-analyzer
```

然后说"分析 贵州茅台"。

### Gemini CLI

```bash
gemini extensions install https://github.com/cortray/Pantheon
```

### OpenCode

对 OpenCode 说：

> 请按照 https://raw.githubusercontent.com/cortray/Pantheon/main/.opencode/INSTALL.md 安装并分析 贵州茅台。

### 其他 Agent（Windsurf / Devin / …）

丢这句话进去：

> 克隆 https://github.com/cortray/Pantheon ，读 AGENTS.md 了解怎么用，帮我深度分析 贵州茅台。

### 📱 不在电脑前？

对任何 agent 说：

> 分析 贵州茅台，用远程模式，生成一个公网链接让我手机能看。

agent 会用 `--remote` 启动 Cloudflare Tunnel，给你一个 `https://xxx.trycloudflare.com` 链接。若本机没有 `cloudflared`，默认只提示安装方式；确认要自动安装时再加 `--install-cloudflared`。

---

## 🛠️ 使用

### 完整深度分析（5-8 分钟）

```
/stock-deep-analyzer:analyze-stock 水晶光电
/stock-deep-analyzer:analyze-stock 002273
/stock-deep-analyzer:analyze-stock 00700.HK
/stock-deep-analyzer:analyze-stock AAPL
/stock-deep-analyzer:analyze-stock 7203.T
/stock-deep-analyzer:analyze-stock 005930.KS
```

### 专项命令

> 都要加 `/stock-deep-analyzer:` 前缀才保证执行得通。

| 命令 | 干嘛的 |
|---|---|
| `/stock-deep-analyzer:dcf 600519` | DCF 估值 · WACC + 5×5 敏感性表 |
| `/stock-deep-analyzer:comps 002273` | 同行对标 · PE/PB 分位分析 |
| `/stock-deep-analyzer:lbo 600519` | LBO 测试 · PE 买方能赚多少 IRR |
| `/stock-deep-analyzer:initiate 002273` | 机构首次覆盖报告 · JPM/GS 格式 |
| `/stock-deep-analyzer:ic-memo 002273` | 投委会备忘录 · 三情景回报 |
| `/stock-deep-analyzer:earnings 002273` | 财报解读 · beat/miss 检测 |
| `/stock-deep-analyzer:catalysts 002273` | 催化剂日历 · 未来 60 天 |
| `/stock-deep-analyzer:thesis 002273` | 投资逻辑追踪 · 5 支柱监控 |
| `/stock-deep-analyzer:screen 002273` | 5 套量化筛选 · value/growth/quality |
| `/stock-deep-analyzer:dd 002273` | 尽调清单 · 5 工作流 21 项 |
| `/stock-deep-analyzer:quick-scan 002273` | 30 秒速判 |
| `/stock-deep-analyzer:panel-only 600519` | 只看 66 评委投票 |
| `/stock-deep-analyzer:scan-trap 002273` | 杀猪盘排查 |
| `/stock-deep-analyzer:segmental-model 300308` | 分业务收入 bottom-up 建模 · 3 情景 × 3 年 projection |
| `/stock-deep-analyzer:ai-readiness 002273` | 单票 AI 就绪度/卡位评估 · 3 道 gate → Go/Wait + 评级 |
| `/stock-deep-analyzer:earnings-preview 002273` | 财报**前**预览 · 一致预期 + Bull/Base/Bear + 隐含波动 |
| `/stock-deep-analyzer:model-update 002273` | 新财报/指引增量更新模型 · 假设 delta → DCF/thesis 影响 |
| `/stock-deep-analyzer:returns` | 组合收益归因 · 按持仓/行业拆解 + Top 贡献/拖累 |
| `/stock-deep-analyzer:rebalance` | 逐持仓再平衡 · 漂移 + 交易清单 + A股印花税/佣金换手成本 |

### CLI 直跑进阶玩法（git clone 用户）

```bash
python run.py 600519.SH --depth lite --no-browser   # 30-60s 快速档
python run.py 300394.SZ --school I                  # 只看 Serenity 卡位视角（A-I 九派任选）
python run.py --versus 茅台 五粮液 002594.SZ         # 2-4 只票横向对决 · ★WIN 高亮
python run.py --portfolio holdings.csv             # CSV 组合 · 加权评分 + 健康度
python run.py 600519.SH --output-dir /tmp/out      # SaaS 集成 · index.html + meta.json
python run.py 600519.SH --remote                   # 公网链接 · 缺 cloudflared 时默认不改系统
```

---

## 🎚️ 三档思考深度

给用户自己选择分析力度——快想 / 正常 / 深挖：

```bash
python run.py 600519 --depth lite     # ⚡ 速判模式（1-2 分钟）
python run.py 600519                   # 📊 标准分析（5-8 分钟）· 默认
python run.py 600519 --depth deep      # 🔬 深度研究（15-20 分钟）
```

| 维度 | ⚡ **lite** 速判 | 📊 **medium** 标准 | 🔬 **deep** 机构级 |
|---|---|---|---|
| **预计耗时** | 1-2 分钟 | 5-8 分钟 | 15-20 分钟 |
| **数据维度** | 核心 7 维 | 全 22 维 | 全 22 维 + 强化兜底 |
| **评委数量** | 10 位代表 | 66 位完整 | 66 位 + **Bull-Bear 结构化辩论** |
| **机构方法** | 只 DCF | 全 22 种 | 全 22 种 + **Segmental Build-Up** |
| **定性搜索** | 全部跳过（省 token）| 按需 · 预算 30 次 | 跑满 · 预算 60 次 |
| **基金持仓** | Top 5 完整业绩 | Top 20 完整 + 其余清单 | Top 100 完整 |
| **自查 gate** | critical block | critical block · warning 可 ack | 两级都 block |
| **浏览器兜底** | 关闭 | 可选启用 · 6 维 | 默认启用 · 10 维 |
| **适用场景** | 随手看 / 老板临时问 / 预判 ETF 成分股 | 日常深度分析 · 写研报 | 投委会备忘录 · 建仓前深挖 |

**自动降级**：首次安装或网络预检异常时自动切 lite，避免卡死；手动 `--depth` 始终优先。

**命令映射**：`quick-scan` / `panel-only` → lite；`analyze-stock` → medium（默认）；`ic-memo` / `initiate` → deep。

---

## 🎭 66 位评审团

不是模板话术。每个人有自己的**量化规则集**（共 242 条），给出的建议必须引用具体命中了哪条。覆盖 9 大流派：

| 组 | 风格 | 人数 | 代表人物 |
|---|---|---|---|
| A | 经典价值 | 6 | 巴菲特 · 格雷厄姆 · 芒格 · 费雪 · 邓普顿 · 卡拉曼 |
| B | 成长投资 | 9 | 林奇 · 木头姐 · 蒂尔 · Andreessen · Gurley · Naval · Gerstner · Chamath |
| C | 宏观对冲 | 7 | 索罗斯 · 达里奥 · 霍华德马克斯 · 德鲁肯米勒 · 罗伯逊 · Burry（大空头）· Chanos |
| D | 技术趋势 | 4 | 利弗莫尔 · 米内尔维尼 · 达瓦斯 · 江恩 |
| E | 中国价投 | 7 | 段永平 · 张坤 · 朱少醒 · 谢治宇 · 冯柳 · 邓晓峰 · 张磊（高瓴） |
| F | A 股游资 | 24 | 章盟主 · 赵老哥 · 炒股养家 · 股海贼王（淘股吧十年实盘蒸馏）· 北京炒家 … |
| G | 量化系统 | 4 | 西蒙斯 · 索普 · 大卫·肖 · Asness (AQR) |
| H | 科技领袖派 | 4 | 黄仁勋 (NVIDIA) · 马斯克 (Tesla) · Sam Altman (OpenAI) · Saylor (MSTR) |
| I | AI 卡位/瓶颈猎手 | 1 | Serenity |

**举个例子**：

> **巴菲特** 给水晶光电打 62 分 · 中性
> "观望：护城河 27/40 可见；但 ROE 5 年最低 6.7%，达标率仅 0/5"
> ✅ 资产负债率 30% 保守 · ❌ ROE 5 年最低 6.7%

> **黄仁勋** 给某 CPO 光模块股打 100 分 · 看多
> "在 AI 算力链上 · 数据中心 Capex 直接受益 · 毛利率 ≥50% 定价权强——这是光速摩尔定律的受益方。"
> ✅ AI 算力需求强相关 · ✅ CUDA/生态绑定深

> **卡拉曼** 给水晶光电打 0 分 · 看空
> "看空核心：无 30% 安全边际"

### 🧠 I 组 · Serenity · AI 卡位/瓶颈猎手

特殊的单人评委（2026 年 X 平台爆火的海外散户研究员 [@aleabitoreddit](https://x.com/aleabitoreddit)），
打法极度集中、极度逆共识：**不买 AI 龙头**，而是沿供应链往上游拆，找那个"全世界都绕不过去、又最容易供给见底"的二三线上游小盘，抢在市场定价前埋伏。

```
龙头被买爆 → 沿供应链往上拆 → 找最难替代的环节 → 找该环节里供给最紧的小盘 → 提前埋伏
```

**核心打分逻辑「卡位决定态度」**——不看估值便宜、不看成长快，只看一个变量：**这家公司的产品在当前 AI 浪潮里有没有卡住别人的脖子**。

| 判定 | 态度 |
|---|---|
| 卡住了（不可替代 + 供给瓶颈 + 没被定价） | 🟢 **看多 / 可能重仓** |
| 在 AI 链上但卡位不硬（能被替代 / 产能充足） | ⚖️ 中性 · 待验证 |
| 没卡到位 / 只是蹭概念 / 不在 AI 链 | 🔴 **直接 skip**（白酒、银行护城河满分也给 0 分） |

判一个环节是不是"卡位点"看三件事：① **难替代**（切换成本）② **供给紧**（产能跟不上 AI 需求曲线）③ **没被定价**（市场还在用旧叙事看它）。

```bash
python run.py 300394.SZ --school I       # 只看 Serenity 的"卡没卡位"判断
python run.py NVDA --school H             # 只看 H 组科技领袖派
```

> ⚠️ Serenity 的身份与收益均为自述/媒体转述、未经第三方审计。本项目仅蒸馏其**方法论**作为一个分析视角，不代表认可其真实战绩。详见 [`docs/serenity-research-dossier.md`](docs/serenity-research-dossier.md)。

---

## 📐 22 种机构级方法

覆盖投行 / PE 日常使用的 22 种分析模型，全部适配 A 股参数（rf=2.5% / ERP=6% / 税率 25% / 终值 g=2.5%）：

**估值建模**
- DCF（WACC 拆解 + 两段 FCF + Gordon Growth 终值 + 5×5 敏感性热力图）
- Comps 同行对标（PE / PB / EV-EBITDA 分位 + 隐含目标价）
- 三表预测（5 年 IS / BS / CF 联动）
- Quick LBO（PE 基金视角 IRR 交叉校验）
- 并购增厚/摊薄模型

**研究工作流**
- 首次覆盖报告（JPM/GS/MS 格式 · 评级 + 目标价 + 论点 + 风险）
- 财报 beat/miss 解读 · 催化剂日历（真实事件提取 + 影响分级）
- 投资逻辑追踪（5 支柱健康度）· 晨报 · 量化筛选 · 行业综述

**深度决策**
- IC 投委会备忘录（8 章节 · Bull/Base/Bear 三情景）
- Porter 五力 + BCG 矩阵
- DD 尽调清单（5 工作流 21 项 · 自动标注完成状态）
- 单位经济学 · 价值创造计划 · 组合再平衡

---

## 🔧 数据源

全部免费，零 API key：

| 数据 | 主源 | 备用 |
|---|---|---|
| 实时行情 / PE / 市值 | 东方财富 push2 | 雪球 → 腾讯 → 新浪 → 百度 |
| 财报历史 | akshare | 雪球 f10 |
| K 线 / 技术指标 | akshare | yfinance |
| 龙虎榜 / 北向 / 两融 | akshare | 东财 |
| 研报 / 公告 | 巨潮 cninfo + akshare | 同花顺 |
| 港股 / 美股 | akshare hk / yfinance | yfinance / akshare us |
| 全球同行 | Yahoo Equity Screener + Fundamentals Timeseries | 本地行业同行 + 24h 缓存 |
| 全球汇率 | Yahoo Chart FX | 原币值始终保留 |
| 宏观 / 政策 / 舆情 / 杀猪盘 | DuckDuckGo web search | — |
| **社交热榜** | **微博 / 知乎 / 百度 / 抖音 / 头条 / B 站 · 各平台官方 JSON API** | 5min 文件缓存 · 单平台失败不影响其他 |

多层 fallback 链 — 一个源挂了自动切下一个。

### 🌍 全球同行业绩对比

分析单只股票时，`4_peers` 会先保留本地市场同行，再按细分行业发现全球上市公司候选，
只为相关度最高的 8 家补齐年度财务。报告展示全球同行中位数、目标公司分位、
营收规模/毛利率散点和跨市场明细表；Comps 估值也会复用有效全球同行。

已识别中国、香港、美国、日本、韩国、台湾、新加坡、印度、加拿大、澳大利亚、
英国及欧洲主要交易所。口径约束：年报/季度/TTM 不混序列、金额保留原币值、
负利润和负 ROE 是有效数据不改写为零、有效同行少于 3 家只展示数据不输出分位结论、
单个同行或汇率源失败不会中断主报告。支持配置关闭全局同行或调整补全数量（3-12，默认 8）。

### 📱 6 平台社交热榜

散户情绪和杀猪盘题材经常先在抖音/小红书/微博发酵，DuckDuckGo 扫不到。`17_sentiment` 维度自动查：

- **微博热搜** · 50 条实时热搜 · **知乎热榜** · 50 条 · **百度热搜** · 实时榜单
- **抖音热点** · 搜索热点 · **头条热榜** · 热点事件 · **B 站热搜** · 全站热搜

股票名（含简称，如"贵州茅台"→"贵州"/"茅台"）在热榜标题里命中 → 计入情绪热度 + 记录具体条目。

### 🔑 可选：东方财富妙想 Skills API

`push2.eastmoney.com` 在大陆网络经常被反爬拦截。若设置 `MX_APIKEY`，Pantheon 会优先走官方 NLP API：

- **中文名纠错**："北部港湾" → 自动识别为 "北部湾港(000582.SZ)"
- **行情快照**：绕过 push2 直接拿到最新价/市值/PE/PB/行业

```bash
cp .env.example .env
# 编辑 .env 填入 MX_APIKEY（免费申领：https://dl.dfcfs.com/m/itc4）
```

无 key 时全部回退到 XueQiu/akshare 链，现有用户零感知。

### 🔓 可选：雪球登录

`19_contests` 维度（实盘比赛持仓）2026 年起加了登录鉴权，默认**不主动弹登录窗**（保持无人值守）。
如需启用：`python -m lib.xueqiu_browser login` 一次性登录（首次弹浏览器，账密 / 微信扫码 / 短信），
cookie 持久化到本地 profile，后续分析自动复用（通常有效 ≥ 30 天）。

跳过登录时该维度标注 `⚠️ 需登录`，其他 21 个维度照常工作。状态查询：`python -m lib.xueqiu_browser status`。

### 🚨 数据缺口怎么处理

若某些字段脚本拿不到（网络限制 / 新股 / 停牌），pipeline **不会塞默认值糊弄**：

1. 生成 `_data_gaps.json` 列出每个缺口的建议恢复动作（浏览器 / MX / WebSearch / 推导）
2. Agent 按 [HARD-GATE-DATAGAPS](skills/deep-analysis/SKILL.md) 逐条尝试补齐
3. 真的补不到 → 在 `agent_analysis.json` 里 `data_gap_acknowledged` 显式承认
4. HTML 报告顶部显示橙色 banner + 相关字段显示 "—" 并划线

这样你永远能分辨"这只股真的不适合买" vs "只是数据没拿到"。

### 🌐 网络受限环境

- **大陆网络 · `pip install` 失败**：`run.py` 和 `setup.sh` 会自动尝试国内镜像（清华 → 阿里云 → 中科大），常见情况什么都不用做
- **海外 agent · 数据源访问慢**：国内数据源（尤其 `push2.eastmoney.com`）从海外访问经常超时，**强烈建议设置 `MX_APIKEY`**（免费申领 → https://dl.dfcfs.com/m/itc4），它走 `mkapi2.dfcfs.com` 境内外都通，还天然具备中文名纠错
- **双端都不通**：保留 `_data_gaps.json` / `_resolve_error.json`，网络恢复后直接跑 `stage2()` 复用已采集数据，不用从头来过

详见 [AGENTS.md · 网络受限环境](AGENTS.md) 的场景 A/B/C 速查。

---

## 🏗️ 项目结构

```
Pantheon/
├── run.py                              # ✅ 用户入口 (python run.py <ticker>)
├── AGENTS.md / CLAUDE.md / CODEX.md    # agent 指令
├── GEMINI.md                           # Gemini CLI 指引
├── RELEASE-NOTES.md                    # 完整版本日志
├── docs/BUGS-LOG.md                    # bug 登记 + 防回归清单
├── commands/                           # 20 个 slash commands
├── personas/                           # 66 位评委 persona
├── skills/
│   ├── deep-analysis/                  # ★ 主 skill (股票分析)
│   │   ├── SKILL.md                    # 分析工作流
│   │   ├── references/                 # 方法论文档
│   │   ├── assets/                     # HTML 模板 + 头像
│   │   └── scripts/                    # ← 所有 Python 业务代码
│   │       ├── run_real_test.py        # legacy stage1/stage2
│   │       ├── assemble_report.py      # HTML 报告组装
│   │       ├── fetch_*.py              # 22 fetcher · 也是独立 CLI
│   │       ├── compute_deep_methods.py # 机构建模
│   │       ├── tests/                  # 685 pytest
│   │       └── lib/
│   │           ├── pipeline/           # 管道式架构（默认路径）
│   │           ├── tier1/              # 5 个 Tier-1 方法
│   │           ├── versus_runner.py    # --versus 多股对比
│   │           ├── portfolio_runner.py # --portfolio 组合分析
│   │           ├── fund_holdings_runner.py # ETF/LOF 持仓循环
│   │           ├── report/             # 报告渲染子模块
│   │           ├── investor_criteria.py      # 66 人 × 242 规则
│   │           ├── investor_evaluator.py     # 规则引擎
│   │           ├── stock_features.py         # 108 标准化特征
│   │           ├── playwright_fallback.py    # 浏览器兜底
│   │           ├── self_review.py            # 机械自查 13 check
│   │           └── ...                       # 其他模块
│   ├── investor-panel/                 # 评审团 skill
│   ├── lhb-analyzer/                   # 龙虎榜 skill
│   └── trap-detector/                  # 杀猪盘 skill
├── client/                             # Electron 桌面客户端
│   ├── electron/                       # 主进程
│   ├── web/                            # React 前端 (Vite)
│   ├── static/                         # 前端构建产物
│   └── server.py                       # 本地 Web API
├── requirements.txt
└── LICENSE
```

---

## 🧠 设计理念

**Agent 驱动分析，脚本只是工具。**

整个流程分两段——中间 agent 必须介入，**最后必须自查**（机械强制）：

```
Stage 1 (脚本)          → 数据采集 + 模型计算 + 规则引擎骨架分
        ⏸️ Agent 介入   → 读数据 → role-play 66 评委 → 写判断 → 审查假设
Stage 2 (脚本)          → 综合研判 + 自动跑 13 条自查 → 报告生成
                         ↑ critical 不过 → 拒绝出 HTML
```

**66 个评委不是跑公式出分数**——agent 要真正站在每个人的角度思考：

- 巴菲特分析苹果 → agent 知道这是伯克希尔第一大持仓 → override 看多
- 赵老哥分析美股 → agent 知道游资不做美股 → skip
- 木头姐分析白酒 → agent 知道她只看颠覆创新 → "不在平台里"
- 格雷厄姆看到 PE 33 → 不需要复杂推理 → 看空

每个判断都可以覆盖规则引擎的机械得分，但必须给出理由。**三层评估**：真实持仓 → 行业亲和度 → 量化规则。

### 🛡 机械级自查 gate

`lib/self_review.py` **13 条自动检查**覆盖所有历史 BUG 经验：

| severity | 抓什么 | 背后教训 |
|---|---|---|
| 🔴 critical | 行业碰撞（工业金属→农副食品加工） | 行业分类错了报告照发 |
| 🔴 critical | 维度缺失 / 空 data / 占位符 | fetcher 崩溃、超时 |
| 🔴 critical | HK kline 0 根 / HK 财报空 | 港股数据链断裂 |
| 🔴 critical | panel 全 skip / coverage < 60% | 数据灾难 |
| 🔴 critical | agent_analysis 缺 / 未 review | agent 偷懒 |
| 🟡 warning | DCF 全 0 / 金属股 materials 空 | 数据覆盖缺口 |
| 🟡 warning | 编造"苹果产业链"无 raw_data 证据 | 幻觉编造 |

**`assemble_report::assemble()` 入口自动跑 review**，critical > 0 → `raise RuntimeError("⛔ BLOCKED by self-review")`，**物理上无法出报告**，直到 agent 修完。每次新 BUG 修完，对应的 `check_*` 规则都会加入自查，下次同类问题自动抓到。

---

## ❓ FAQ

**Q: 跑一次要多久？**
A: 5-8 分钟，主要是数据采集慢（22 个维度要调十几个 API）。纯计算的机构建模部分 < 1 秒。

**Q: 需要付费数据源吗？**
A: 不需要。全部免费源（akshare / yfinance / DuckDuckGo / 巨潮 / 东方财富 / 雪球），零 API key。

**Q: 港股美股能用吗？**
A: 能。`/stock-deep-analyzer:analyze-stock 00700.HK` 或 `/stock-deep-analyzer:analyze-stock AAPL`。

**Q: 数据准不准？**
A: 实时数据走东方财富 / 雪球，财报走巨潮 / akshare，和你在东方财富 App 上看到的一样。web search 质量不稳定时（DuckDuckGo 中文搜索偶尔返回无关结果），AI 会做二次审查。

**Q: 能当投资建议吗？**
A: 不能。这是工具不是神仙，66 个大佬的意见都是规则引擎模拟的，不代表真人观点。买不买你自己决定。

**Q: 怎么知道这次报告数据是否可信？**
A: 报告生成前强制跑 13 条机械自查，critical 不过物理上发不出报告。`.cache/<ticker>/_review_issues.json` 里能看到本次 warning，每条都带 `suggested_fix`。

**Q: 怎么升级到新版本？自动提示吗？**
A: 会。每次启动都会后台检测 GitHub 最新 release（缓存 6 小时，不重复打 API）：
- 有新版本 → 弹三选一提示（是 / 跳过本版 / 否）+ 改动摘要
- Claude Code: `/plugin update stock-deep-analyzer` · git clone: `cd Pantheon && git pull`
- 跳过本版 → 该版本不再提示；选"否" → 下次启动再问

---

## 📋 更新日志

| 版本 | 日期 | 主要变化 |
|---|---|---|
| **Unreleased** | 2026-08-05 | **全球同行业绩对比 + 数据完整性** · 自动按全球细分行业发现候选并补全 Top 8 年度财务，覆盖日/韩/台/新/印/加/澳/英/欧洲等交易所后缀；原币与 USD 标准化值分离，跨币种原始市值不混算，同行失败隔离、后备递补并缓存 24h。报告新增同行中位数、全球分位、规模/毛利率散点和明细表。22 个专项测试 · 全量 685 passed |
| **v3.9.3** | 2026-08-07 | **茅台深度实测驱动的数据/渲染修复** · ① 现金流误判：`fcf_positive` 改为真实 FCF，茅台(FCF 658亿)不再显示"现金流为负"；"行业周期下行"风险仅行业判定衰退时才追加。② 同行修复：push2 被反爬时 4_peers 只剩自己一行——新增硬编码同行兜底(白酒→五粮液/泸州老窖/洋河/山西汾酒)。③ 渲染修复：评委 pass/fail dict 不再泄漏成 Python 字面量；对比条 `abs(None)` 崩溃；一致目标价不再显示"(None)"。④ deep 档强制 agent 介入 role-play：须 stage1 → 读 persona → 写 agent_analysis.json(`per_investor_override` 真正合并)。45+ 回归测试 |
| **v3.9.2** | 2026-07-07 | **流程与数据契约** · `fetch_financials` 显式输出 `ocf` / `ocf_history` / `ocf_to_net_income_ratio`，避免 trap-detector 误判；`industry=None` 时 peers 返回 self-only fallback；pipeline 字段契约对齐 legacy 输出，避免假 data_gaps；`agent_analysis.json` schema 错误真正 fallback 到脚本骨架；`--output-dir` / `--remote` 后处理统一。8 个新回归测试 |
| **v3.9.1** | 2026-06-23 | **HTML 报告导航栏可折叠** · 左侧 sticky 章节导航可收起成小把手，状态写入 `localStorage` 刷新记忆，全程安全 DOM + `aria-expanded` 可访问性。7 个新回归 · 总 649 passed |
| **v3.9.0** | 2026-06-11 | **新评委「股海贼王」· 首位从真实交割单蒸馏的评委 (65→66)** · 淘股吧十年实盘帖 (2016-02 开贴) · 3898 张持仓截图 OCR → **8951 笔反推交割单** + **5069 条发言**。定量画像：33 万→3131 万 (~95 倍/10 年) · 持仓中位 1 天/P75 3 天 · 同时 3-5 只 · 第一重仓中位 51%。方法论蒸馏（风格提炼·不逐字转载原帖）：复盘三问 · 弱转强快速板才算超预期 · 逻辑硬的低位票爆发力足 · 格局票=时代的情绪载体。落地：F 组 flagship · 6 条数据驱动规则 · `docs/ghzw-dossier.md` 蒸馏档案。实测：鸿博式妖股 bullish 100 · 茅台 bearish 9.5 · 美股 skip。10 个新回归 · 总 642 passed |
| **v3.8.1** | 2026-06-09 | **skills 全面体检 · H/I 两组配套层 6 处补齐** · 14 位新评委缺头像、`render_school_scores` 不含 H/I、GROUP_LABELS/GROUP_DEFAULT/STYLE_GROUP_WEIGHTS 缺 H/I、评委缺 MARKET_SCOPE + voice 台词，全部补齐。文档同步 ~35 处（52→65 评委 / 7→9 流派 / 180→236 规则 / --school A-G→A-I）。10 个新体检回归 · 总 632 passed |
| **v3.8.0** | 2026-06-08 | **Tier-1 五方法 + Serenity 严谨化 + 技术指标/杜邦扩展** · ① 5 个新命令：`/ai-readiness`（AI 就绪度/卡位）· `/earnings-preview`（财报前预测 · Bull/Base/Bear + 隐含波动）· `/model-update`（增量更新模型）· `/returns`（组合收益归因）· `/rebalance`（逐持仓再平衡 + 换手成本）。② Serenity 严谨化：8 罚分因子（封顶 60% 折扣）+ 3 级证据阶梯（强公告财报≈1.0 > 中媒体卖料≈0.85 > 弱叙事≈0.70）+ 供应链 8 层分层。③ DuPont 杜邦分解（ROE 质量来源）+ KDJ/OBV/Williams%R。61 个新回归测试 · 总 622 passed |
| **v1.0 – v3.7.x** | 2026-04 ~ 2026-05 | 初版 19 维 + 50 评委 → 22 维 + 66 评委 · 180 规则 → 242 规则 · 17 种机构方法 → 22 种 · 三档思考深度 · 机械自查 gate · 多股对比 & 组合 · 流派锁定 · 管道架构重构 · 完整演进见 [RELEASE-NOTES.md](RELEASE-NOTES.md) |

---

## ⚠️ 免责声明

本工具由 AI 模型基于公开数据生成分析报告。所有评分、建议、模拟评语均为算法输出，不代表任何真实投资者的实际观点。**不构成投资建议**，投资有风险，入市需谨慎。

---

<div align="center">

Pantheon · MIT License

</div>
