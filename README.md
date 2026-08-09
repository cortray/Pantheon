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

[安装](#安装) · [用法](#用法) · [三档深度](#-三档思考深度) · [评审团](#-66-位评审团) · [Serenity](#-i-组--serenity--ai-卡位瓶颈猎手) · [机构方法](#-22-种机构级方法) · [自查 gate](#-机械级自查-gate) · [报告截图](#-报告长什么样) · [FAQ](#-faq)

**中文** | [English](README_EN.md)

</div>

---

## 🚀 30 秒上手

**任何 agent 里丢一句话 · 装好就能用**。详细装法见 [安装](#安装)。

| 你用的 agent | 直接丢这句 |
|---|---|
| **Claude Code** | `/plugin marketplace add cortray/Pantheon` 然后 `/plugin install stock-deep-analyzer@uzi-skill` |
| **Codex / OpenAI CLI** | "按 https://raw.githubusercontent.com/cortray/Pantheon/main/.codex/INSTALL.md 装 Pantheon，分析 600519" |
| **Cursor** | `/add-plugin stock-deep-analyzer` |
| **Gemini CLI** | `gemini extensions install https://github.com/cortray/Pantheon` |
| **Hermes** | `curl -fsSL https://raw.githubusercontent.com/cortray/Pantheon/main/install-hermes.sh \| bash` · 详见 [INSTALL-HERMES.md](INSTALL-HERMES.md) |
| **OpenClaw / 龙虾** | "装 https://github.com/cortray/Pantheon 这个股票分析技能" |
| **CLI 直用** | `git clone https://github.com/cortray/Pantheon.git && cd Pantheon && pip install -r requirements.txt && python run.py 贵州茅台` |

装好后最常用 4 条命令（任何 agent 里直接说）：

```
/stock-deep-analyzer:analyze-stock 贵州茅台    ← 完整 22 维 × 66 评委分析（5-8min）
/stock-deep-analyzer:quick-scan 002217         ← 30 秒速判
/stock-deep-analyzer:scan-trap 002217          ← 杀猪盘排查
/stock-deep-analyzer:dcf 600519                ← DCF 估值专项
```

> 💡 **当前最新稳定版 v3.9.3** · 完整演进见 [更新日志](#-更新日志)：
> - **66 位评审团 · 9 大流派**（价值 / 成长 / 宏观 / 技术 / 中国价投 / 游资 / 量化 / 科技领袖 / AI 卡位猎手）· 242 条量化规则
> - **Serenity 严谨化**：8 罚分因子 + 3 级证据阶梯（"有定点量产"≈90 分 vs "仅题材"≈60 分）+ 供应链 8 层分层
> - **Tier-1 五方法**：`/ai-readiness` `/earnings-preview` `/model-update` `/returns` `/rebalance`
> - **多股对比 & 组合**：`--versus` 2-4 只横向对决 · `--portfolio` CSV 组合健康度 · 暗色模式 + 可折叠导航
> - **流派视角锁定**：`--school A-I` 只看一派的判断 · 报告带 SCHOOL LOCK banner
> - **架构**：v3.0 pipeline 默认主干 · 685 tests 全过 · v2.x API 100% 向后兼容（`UZI_LEGACY=1` 回老路径）

---

## 这是啥

一句话：输入一只股票，AI agent 变成你的私人分析师，跑完 22 个维度的数据、调 22 种华尔街分析模型、让 66 个投资风格完全不同的大佬各自打分，最后吐出一份 600KB 的 Bloomberg 风格报告。

```
/stock-deep-analyzer:analyze-stock 国盾量子
```

5-8 分钟后你会得到：
- **一份 HTML 报告** — 可以直接用浏览器打开，自包含，离线也能看
- **一张朋友圈竖图** — 1080×1920，直接发
- **一张微信群战报** — 1920×1080
- **一段话摘要** — 复制粘贴就能发群里

## 为什么做这个

看一只票的常规流程：东方财富翻基本面 → 同花顺看 K 线 → 雪球刷大 V 说了啥 → 研报系统找卖方观点 → Excel 算个 DCF → 结果买进去还是亏。

这些活儿本质上就是"搜集信息 → 多角度分析 → 给个结论"，为什么不交给 AI 全干了？

市面上的方案要么是输出三段废话的 GPT wrapper，要么是用不起的机构终端。所以我们自己搓了一个——**全免费数据源，零 API key，A 股直接能跑，从采集、建模到 66 位大佬评审一条龙出报告**。

---

## 安装

不管你用什么 agent，**都是丢一句话过去就行**：

### Claude Code

```
/plugin marketplace add cortray/Pantheon
/plugin install stock-deep-analyzer@uzi-skill
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
> Cursor / Gemini CLI / Codex 同理：**一律用 `/stock-deep-analyzer:<cmd>` 全名**，
> 避免短名解析失败。

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

### Windsurf / Devin / 其他 Agent

丢这句话进去：

> 克隆 https://github.com/cortray/Pantheon ，读 AGENTS.md 了解怎么用，帮我深度分析 贵州茅台。

### 📱 不在电脑前？

对任何 agent 说：

> 分析 贵州茅台，用远程模式，生成一个公网链接让我手机能看。

agent 会用 `--remote` 启动 Cloudflare Tunnel，给你一个 `https://xxx.trycloudflare.com` 链接。若本机没有 `cloudflared`，默认只提示安装方式；确认要自动安装时再加 `--install-cloudflared`。

---

## 用法

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
| `/stock-deep-analyzer:segmental-model 300308` | 分业务收入 bottom-up 建模 · 3 情景 × 3 年 projection · 对 DCF 反向校验 |
| `/stock-deep-analyzer:ai-readiness 002273` | 🆕 v3.8 · 单票 AI 就绪度/卡位评估 · 3 道 gate → Go/Wait + 评级 |
| `/stock-deep-analyzer:earnings-preview 002273` | 🆕 v3.8 · 财报**前**预览 · 一致预期 + Bull/Base/Bear + 隐含波动 |
| `/stock-deep-analyzer:model-update 002273` | 🆕 v3.8 · 新财报/指引增量更新模型 · 假设 delta → DCF/thesis 影响 |
| `/stock-deep-analyzer:returns` | 🆕 v3.8 · 组合收益归因 · 按持仓/行业拆解 + Top 贡献/拖累 |
| `/stock-deep-analyzer:rebalance` | 🆕 v3.8 · 逐持仓再平衡 · 漂移 + 交易清单 + A股印花税/佣金换手成本 |

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

## 🎯 评分校准

综合评分公式：`overall = fund_score × 0.6 + consensus × 0.4`

- **verdict 阈值**：80/65/50/35 → 值得重仓 / 可以蹲一蹲 / 观望 / 谨慎 / 回避
- **consensus neutral 权重**：0.6（价值派+游资偏保守，neutral 半权会让白马 consensus 失真）
- 真正的坑仍会 < 35 → **回避**，分数辨识度不降反升
- 诊断字段 `panel.json::consensus_formula.version` 可审计

---

## 🎚️ 三档思考深度

给用户自己选择分析力度——快想 / 正常 / 深挖：

```bash
python run.py 600519 --depth lite     # ⚡ 速判模式（1-2 分钟）
python run.py 600519                   # 📊 标准分析（5-8 分钟）· 默认
python run.py 600519 --depth deep      # 🔬 深度研究（15-20 分钟）
```

或通过环境变量：

```bash
export UZI_DEPTH=lite       # 或 medium / deep
python run.py 600519
```

### 三档差异一览

| 维度 | ⚡ **lite** 速判 | 📊 **medium** 标准 | 🔬 **deep** 机构级 |
|---|---|---|---|
| **预计耗时** | 1-2 分钟 | 5-8 分钟 | 15-20 分钟 |
| **fetcher 维度** | 核心 7 维 | 全 22 维 | 全 22 维 + 强化 fallback |
| **评委数量** | 10 位代表 | 66 位完整 | 66 位 + **Bull-Bear 结构化辩论** |
| **机构方法** | 只 DCF | 全 22 种 | 全 22 种 + **Segmental Build-Up** |
| **ddgs 定性查询** | **全 skip**（省 token）| 按需 · 预算 30 次 | 跑满 · 预算 60 次 |
| **fund_holders** | Top 5 完整业绩 | Top 20 完整 + 其余清单 | Top 100 完整 |
| **自查 gate** | critical block | critical block · warning 可 ack | 两级都 block |
| **Playwright 兜底** | ❌ 完全禁用 | opt-in · `UZI_PLAYWRIGHT_ENABLE=1` · **6 维** | ✅ 默认启用 · **10 维** · 首次 y/n 交互装 Chromium |
| **适用场景** | 随手看 / 老板临时问 / 预判 ETF 成分股 | 日常深度分析 · 写研报 | 投委会备忘录 · 建仓前深挖 |

### 自动降级策略

- **第一次安装** / `.cache/_global` 空时 → 自动切 lite（省首次冷启动时间）
- **网络预检 3+ 域不通** → 自动切 lite（避免卡死）
- 手动 `--depth` 始终覆盖自动判定

### 命令映射（隐式档位）

| 命令 | 隐式档位 |
|---|---|
| `/stock-deep-analyzer:quick-scan 600519` | lite |
| `/stock-deep-analyzer:panel-only 600519` | lite |
| `/stock-deep-analyzer:analyze-stock 600519` | medium（默认）|
| `/stock-deep-analyzer:ic-memo 600519` | deep |
| `/stock-deep-analyzer:initiate 600519` | deep |

---

## 🎭 66 位评审团

不是模板话术。每个人有自己的**量化规则集**（共 242 条），给出的建议必须引用具体命中了哪条。
v3.7.0 起新增 **13 位新晋科技大佬** + 独立的 **I 组 Serenity（AI 卡位/瓶颈猎手）**；v3.9.0 再添从十年实盘交割单蒸馏的 **股海贼王**，覆盖 9 大流派：

| 组 | 风格 | 人数 | 代表人物 |
|---|---|---|---|
| A | 经典价值 | 6 | 巴菲特 · 格雷厄姆 · 芒格 · 费雪 · 邓普顿 · 卡拉曼 |
| B | 成长投资 | 9 | 林奇 · 木头姐 · 蒂尔 · **Andreessen (a16z)** · **Gurley (Benchmark)** · **Naval** · **Gerstner (Altimeter)** · **Chamath** |
| C | 宏观对冲 | 7 | 索罗斯 · 达里奥 · 霍华德马克斯 · 德鲁肯米勒 · 罗伯逊 · **Burry（大空头）** · **Chanos（做空猎手）** |
| D | 技术趋势 | 4 | 利弗莫尔 · 米内尔维尼 · 达瓦斯 · 江恩 |
| E | 中国价投 | 7 | 段永平 · 张坤 · 朱少醒 · 谢治宇 · 冯柳 · 邓晓峰 · **张磊（高瓴）** |
| F | A 股游资 | 24 | 章盟主 · 赵老哥 · 炒股养家 · **股海贼王 🆕**（淘股吧十年实盘蒸馏）· 北京炒家 … |
| G | 量化系统 | 4 | 西蒙斯 · 索普 · 大卫·肖 · **Asness (AQR)** |
| H | 科技领袖派 🆕 | 4 | **黄仁勋 (NVIDIA)** · **马斯克 (Tesla)** · **Sam Altman (OpenAI)** · **Saylor (MSTR)** |
| I | AI 卡位/瓶颈猎手 🆕 | 1 | **Serenity** |

**举个例子**：

> **巴菲特** 给水晶光电打 62 分 · 中性
> "观望：护城河 27/40 可见；但 ROE 5 年最低 6.7%，达标率仅 0/5"
> ✅ 资产负债率 30% 保守 · ❌ ROE 5 年最低 6.7%

> **黄仁勋** 给某 CPO 光模块股打 100 分 · 看多
> "在 AI 算力链上 · 数据中心 Capex 直接受益 · 毛利率 ≥50% 定价权强——这是光速摩尔定律的受益方。"
> ✅ AI 算力需求强相关 · ✅ CUDA/生态绑定深

> **卡拉曼** 给水晶光电打 0 分 · 看空
> "看空核心：无 30% 安全边际"

---

## 🧠 I 组 · Serenity · AI 卡位/瓶颈猎手

> **重磅角色**：2026 年 X（推特）爆火的海外散户研究员 [@aleabitoreddit](https://x.com/aleabitoreddit)。
> 单独成组、单独评分——因为她的打法极度集中、极度逆共识，跟任何机构大佬都不一样。

### 她是谁

- 自述背景：**前 AI 研究科学家 · Nature 论文作者 · 前 RISC-V 基金会成员 · 半导体/光通信工程师**
- 二次元头像、匿名、不露脸、不卖课、不跟单，研究**全部免费公开**，X 粉丝 30 万+
- 成名战：提前约一年押中 InP 磷化铟衬底瓶颈股 **$AXTI（$12 → $70+，最高 $115–140）**，2026 Q1 被 IntelliEPI CEO 公开印证"InP 短缺是整个 AI 基建的瓶颈"

> ⚠️ 身份与收益均为**自述/媒体转述、未经第三方审计**，各来源数字互相矛盾。本项目仅蒸馏其**方法论**作为一个分析视角，不代表认可其真实战绩。详见 [`docs/serenity-research-dossier.md`](docs/serenity-research-dossier.md)（全网 20+ 来源逐条档案）。

### 她在 Pantheon 里的作用

把她的「**AI 产业链卡脖子/瓶颈点理论（Chokepoint Theory）**」做成一个可量化的评委——
**不买 AI 龙头**（英伟达这种已被充分定价的票），而是沿供应链往上游拆，找那个"全世界都绕不过去、又最容易供给见底"的二三线上游小盘，抢在市场定价前埋伏。

```
龙头被买爆 → 沿供应链往上拆 → 找最难替代的环节 → 找该环节里供给最紧的小盘 → 提前埋伏
```

**核心打分逻辑「卡位决定态度」**——不看估值便宜、不看成长快，只看一个变量：**这家公司的产品在当前 AI 浪潮里有没有卡住别人的脖子**。

| 判定 | 态度 |
|---|---|
| 卡住了（不可替代 + 供给瓶颈 + 没被定价） | 🟢 **看多 / 可能重仓** |
| 在 AI 链上但卡位不硬（能被替代 / 产能充足） | ⚖️ 中性 · 待验证 |
| 没卡到位 / 只是蹭概念 / 不在 AI 链 | 🔴 **直接 skip**（白酒、银行护城河满分也给 0 分） |

判一个环节是不是"卡位点"看三件事：① **难替代**（换供应商/材料/工艺要多久，越久越好 → `14_moat` 切换成本）② **供给紧**（产能跟不跟得上 AI 需求曲线，越跟不上越好 → `7_industry`）③ **没被定价**（市场还在用"周期股/老半导体/小众材料"旧叙事看它 → `5_chain` + `15_events`）。

### 怎么单独跑 Serenity 视角

```bash
python run.py 300394.SZ --school I       # 只看 Serenity 的"卡没卡位"判断
python run.py NVDA --school H             # 只看 H 组科技领袖派（黄仁勋/Musk/Altman/Saylor）
```

> 方法论六步法 + alpha 5 维详见 [`skills/deep-analysis/references/fin-methods/serenity-bottleneck.md`](skills/deep-analysis/references/fin-methods/serenity-bottleneck.md)；
> 语气库 + 评分规则见 [`skills/investor-panel/references/group-i-serenity.md`](skills/investor-panel/references/group-i-serenity.md)。

---

## 📐 22 种机构级方法

覆盖投行/PE 日常使用的 22 种分析模型，全部适配 A 股参数（rf=2.5% / ERP=6% / 税率 25% / 终值 g=2.5%）：

**估值建模**
- DCF（WACC 拆解 + 两段 FCF + Gordon Growth 终值 + 5×5 敏感性热力图）
- Comps 同行对标（PE / PB / EV-EBITDA 分位 + 隐含目标价）
- 三表预测（5 年 IS / BS / CF 联动）
- Quick LBO（PE 基金视角 IRR 交叉校验）
- 并购增厚/摊薄模型

**研究工作流**
- 首次覆盖报告（JPM/GS/MS 格式 · 评级 + 目标价 + 论点 + 风险）
- 财报 beat/miss 解读
- 催化剂日历（真实事件提取 + 未来预排 + 影响分级）
- 投资逻辑追踪（5 支柱健康度）
- 晨报 · 量化筛选 · 行业综述

**深度决策**
- IC 投委会备忘录（8 章节 · Bull/Base/Bear 三情景）
- Porter 五力 + BCG 矩阵
- DD 尽调清单（5 工作流 21 项 · 自动标注完成状态）
- 单位经济学 · 价值创造计划 · 组合再平衡

---

## 📸 报告长什么样

> 以下截图全部来自水晶光电（002273.SZ）的真实分析结果。

### 综合评分 + 核心结论

<img src="docs/screenshots/hero-score.png" width="700" />

### 多空大分歧 · The Great Divide

费雪 100 分 vs 卡拉曼 96 分，三轮互喷，每轮引用具体数字。

<img src="docs/screenshots/great-divide.png" width="700" />

### 66 位评审团 · 审判席

每个人一盏灯——绿色看多、红色看空、灰色中性。

<img src="docs/screenshots/jury-seats.png" width="700" />

### 聊天室模式

评委们用自己的语言风格发言，引用命中的具体规则。

<img src="docs/screenshots/chat-room.png" width="700" />

### DCF 估值 · 5×5 敏感性热力图

WACC 6.96% · 内在价值 ¥20.73 · 安全边际 -28.6%，颜色从深绿（低估）到深红（高估）。

<img src="docs/screenshots/dcf-model.png" width="700" />

### IC 投委会备忘录 · 三情景回报

Bull ¥26.95 / Base ¥20.73 / Bear ¥14.51，每个情景有概率和假设。

<img src="docs/screenshots/ic-memo.png" width="700" />

### 22 维深度卡

每个维度有独立可视化——K 线蜡烛图 / PE Band / 雷达图 / 供应链流程图 / 温度计 / 环形图。

<img src="docs/screenshots/deep-scan.png" width="700" />

### 朋友圈竖图 · 一键分享

<img src="docs/screenshots/share-card.png" width="300" />

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
| 港股 | akshare hk | yfinance |
| 美股 | yfinance | akshare us |
| 全球同行 | Yahoo Equity Screener + Fundamentals Timeseries | 本地行业同行 + 24h 缓存 |
| 全球汇率 | Yahoo Chart FX | 原币值始终保留 |
| 宏观 / 政策 / 舆情 / 杀猪盘 | DuckDuckGo web search | — |
| **社交热榜** | **微博 / 知乎 / 百度 / 抖音 / 头条 / B 站 · 各平台官方 JSON API** | 5min 文件缓存 · 单平台失败不影响其他 |

多层 fallback 链 — 一个源挂了自动切下一个。

### 全球同行业绩对比

分析单只股票时，`4_peers` 会先保留本地市场同行，再按细分行业发现全球上市公司候选，
只为相关度最高的 8 家补齐年度财务。报告展示全球同行中位数、目标公司分位、
营收规模/毛利率散点和跨市场明细表；Comps 估值也会复用有效全球同行。

已识别中国、香港、美国、日本、韩国、台湾、新加坡、印度、加拿大、澳大利亚、
英国及欧洲主要交易所，并支持 Yahoo 可识别的其他交易所代码作为通用全球标的。

口径约束：

- 年报、季度和 TTM 不混在同一序列。
- 营收、利润等金额保留原币值，另写基准币换算值；原始值不会被覆盖。
- 不同币种的原始市值不会直接用于规模相似度评分。
- 负利润和负 ROE 是有效数据，不会改写成零。
- 有效同行少于 3 家时只展示数据，不输出全球分位结论。
- 单个同行或汇率源失败不会中断主报告，失败代码会保留在结果中。

可选配置：

```bash
# 完全关闭全球同行，只保留原有本地同行
export UZI_DISABLE_GLOBAL_PEERS=1

# 调整最终补全数量，范围 3-12，默认 8
export UZI_GLOBAL_PEER_LIMIT=10
```

### 📱 6 平台社交热榜

散户情绪和杀猪盘题材经常先在抖音/小红书/微博发酵，DuckDuckGo 扫不到。`17_sentiment` 维度自动查：

- **微博热搜** · 抓 `weibo.com/ajax/side/hotSearch` · 50 条实时热搜
- **知乎热榜** · 抓 `zhihu.com/api/v3/feed/topstory/hot-list-web` · 50 条
- **百度热搜** · 抓 `top.baidu.com/api/board` · 实时榜单
- **抖音热点** · 抓 `douyin.com/aweme/v1/web/hot/search/list/` · 搜索热点
- **头条热榜** · 抓 `toutiao.com/hot-event/hot-board/` · 热点事件
- **B 站热搜** · 抓 `s.search.bilibili.com/main/hotword` · 全站热搜

股票名（含简称，如"贵州茅台"→"贵州"/"茅台"）在热榜标题里命中 → 计入情绪热度 + 记录具体条目。

数据结构：synthesis 的 `17_sentiment.data.hot_trend_mentions`：
```json
{
  "stock_name": "贵州茅台",
  "platforms_ok": 6,
  "total_hits": 3,
  "by_platform_count": {"weibo": 2, "zhihu": 1, ...},
  "mentions": { "weibo": [{"rank":3, "title":"茅台 1499 回归", ...}], ... }
}
```

### 🔑 可选：东方财富妙想 Skills API

`push2.eastmoney.com` 在大陆网络经常被反爬拦截。若设置
`MX_APIKEY`，Pantheon 会优先走官方 NLP API：

- **中文名纠错**："北部港湾" → 自动识别为 "北部湾港(000582.SZ)"
- **行情快照**：绕过 push2 直接拿到最新价/市值/PE/PB/行业

配置：
```bash
cp .env.example .env
# 编辑 .env 填入 MX_APIKEY（免费申领：https://dl.dfcfs.com/m/itc4）
```

无 key 时全部回退到 XueQiu/akshare 链，现有用户零感知。

### 🔓 需登录的数据源

部分数据源 2026 年起加了登录鉴权，Pantheon 默认**不主动弹登录窗**（保持无人值守）。
用户可按需启用：

| 数据源 | 维度 | 启用方式 | 影响 |
|---|---|---|---|
| **XueQiu cubes_search.json** | `19_contests` 实盘比赛持仓 | `export UZI_XQ_LOGIN=1` 然后 `python -m lib.xueqiu_browser login`（一次性弹浏览器登录） | 不启用：报告 19_contests 显示"⚠️ XueQiu 需登录，0 cube"；启用后能看到雪球 50+ 个实盘组合持有本股 |

#### XueQiu 登录步骤

```bash
# 1. 启用环境变量（一次性，可加进 .zshrc）
export UZI_XQ_LOGIN=1

# 2. 一次性登录（首次跑会弹有头浏览器，登录后回到终端按回车）
python -m lib.xueqiu_browser login
# → 浏览器弹出，手动账密 / 微信扫码 / 短信登录
# → 登录成功后回终端按回车，cookie 持久化到 ~/.uzi-skill/playwright-xueqiu/

# 3. 后续跑分析自动复用登录态（cookie 通常有效 ≥ 30 天）
python run.py 贵州茅台 --no-browser
# 19_contests 维度会显示真实雪球组合数 + 收益率分布

# 4. 如果直接跑 run.py 想启用，加 flag
python run.py 贵州茅台 --enable-xueqiu-login
```

#### 跳过登录（默认行为）

不想登录？什么都不用做。XueQiu 维度会清晰标注 `⚠️ 需登录，0 cube`，
其他 21 个维度照常工作。

#### 状态查询
```bash
python -m lib.xueqiu_browser status
# 显示：profile dir / cookie 是否存在 / 是否启用
```

### 🚨 数据缺口怎么处理

若某些字段脚本拿不到（网络限制 / 新股 / 停牌），pipeline **不会塞默认值糊弄**：

1. 生成 `_data_gaps.json` 列出每个缺口的建议恢复动作（浏览器 / MX / WebSearch / 推导）
2. Agent 按 [HARD-GATE-DATAGAPS](skills/deep-analysis/SKILL.md) 逐条尝试补齐
3. 真的补不到 → 在 `agent_analysis.json` 里 `data_gap_acknowledged` 显式承认
4. HTML 报告顶部显示橙色 banner + 相关字段显示 "—" 并划线

这样你永远能分辨"这只股真的不适合买" vs "只是数据没拿到"。

### 🌐 网络受限环境

Pantheon 在大陆和海外都能跑，但瓶颈不同，建议对号入座：

**大陆网络 · `pip install` 失败怎么办？**

`run.py` 和 `setup.sh` 会自动尝试国内镜像（清华 → 阿里云 → 中科大），
所以常见情况你什么都不用做。若要手动指定：

```bash
pip install -r requirements.txt \
    -i https://pypi.tuna.tsinghua.edu.cn/simple \
    --trusted-host pypi.tuna.tsinghua.edu.cn
```

**海外 agent · 数据源访问慢怎么办？**

国内数据源（尤其 `push2.eastmoney.com`）从海外访问经常超时。**强烈建议
设置 `MX_APIKEY`**（免费申领 → https://dl.dfcfs.com/m/itc4），它走
`mkapi2.dfcfs.com` 境内外都通，同时天然具备中文名纠错能力。

```bash
cp .env.example .env
# 编辑 .env 填入 MX_APIKEY
python run.py 贵州茅台
```

**双端都不通**：agent 应保留 `_data_gaps.json` / `_resolve_error.json`，
等网络恢复后直接跑 `stage2()` 可以复用已采集数据，不用从头来过。

详见 [AGENTS.md · 网络受限环境](AGENTS.md) 的场景 A/B/C 速查。

---

## 📁 项目结构

```
Pantheon/
├── run.py                              # ✅ 用户入口 (python run.py <ticker>)
├── AGENTS.md / CLAUDE.md / CODEX.md    # agent 指令
├── GEMINI.md                           # Gemini CLI 指引
├── RELEASE-NOTES.md                    # 完整版本日志
├── docs/BUGS-LOG.md                    # bug 登记 + 防回归清单
├── .claude-plugin/plugin.json          # Claude Code manifest
├── .cursor-plugin/plugin.json          # Cursor manifest
├── gemini-extension.json               # Gemini manifest
├── commands/                           # 20 个 slash commands
├── personas/                           # 66 位评委 persona
├── skills/
│   ├── deep-analysis/                  # ★ 主 skill (股票分析)
│   │   ├── SKILL.md
│   │   ├── references/                 # 方法论文档
│   │   ├── assets/                     # HTML 模板 + 65 头像 svg
│   │   └── scripts/                    # ← 所有 Python 业务代码
│   │       ├── run_real_test.py        # legacy stage1/stage2
│   │       ├── assemble_report.py      # HTML shell
│   │       ├── fetch_*.py              # 22 fetcher · 也是独立 CLI
│   │       ├── compute_deep_methods.py # 机构建模
│   │       ├── tests/                  # 685 pytest
│   │       └── lib/
│   │           ├── pipeline/           # 🆕 v3.0 管道式架构（默认路径）
│   │           │   ├── run.py          # run_pipeline 编排入口
│   │           │   ├── collect.py      # 并发 collector (22 adapter)
│   │           │   ├── score.py        # scoring 段
│   │           │   ├── synthesize.py   # stage2 薄 wrapper
│   │           │   ├── score_fns.py    # 纯函数
│   │           │   ├── preflight_helpers.py  # 网络/ticker preflight
│   │           │   ├── fetchers/registry.py  # 22 adapter 工厂
│   │           │   └── renderer/       # renderer stub
│   │           ├── tier1/              # 🆕 v3.8 · 5 个 Tier-1 方法
│   │           ├── versus_runner.py    # 🆕 v3.6 · --versus 多股对比
│   │           ├── portfolio_runner.py # 🆕 v3.6 · --portfolio 组合分析
│   │           ├── fund_holdings_runner.py # ETF/LOF 持仓循环
│   │           ├── report/             # assemble_report 拆分
│   │           │   ├── svg_primitives.py
│   │           │   ├── dim_viz.py
│   │           │   ├── institutional.py
│   │           │   ├── panel_cards.py
│   │           │   └── special_cards.py
│   │           ├── investor_criteria.py      # 66 人 × 242 规则
│   │           ├── investor_evaluator.py     # 规则引擎
│   │           ├── stock_features.py         # 108 标准化特征
│   │           ├── playwright_fallback.py    # Playwright 兜底
│   │           ├── self_review.py            # 机械自查 13 check
│   │           └── ...                       # 其他 lib 模块
│   ├── investor-panel/                 # 评审团 skill
│   ├── lhb-analyzer/                   # 龙虎榜 skill
│   └── trap-detector/                  # 杀猪盘 skill
├── client/                             # Electron 桌面客户端
│   ├── electron/                       # 主进程
│   ├── web/                            # React 前端 (Vite)
│   ├── static/                         # 构建产物
│   └── server.py                       # 本地 Web API
├── requirements.txt
└── LICENSE
```

**架构分层**：

| 层 | 文件 | 职责 |
|---|---|---|
| 入口 | `run.py` | CLI 主入口 · `UZI_LEGACY=1` 回退老路径 |
| 管道 | `lib/pipeline/*` | 主干 · collect / score / synthesize |
| 纯函数 | `lib/pipeline/score_fns.py` | score_dimensions / generate_panel / generate_synthesis |
| 渲染 | `lib/report/*` | svg / viz / inst / panel / special |
| Legacy | `run_real_test.py` + `assemble_report.py` | 向后兼容层 · re-export 所有迁移函数 |

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

每个判断都可以覆盖规则引擎的机械得分，但必须给出理由。

**三层评估**：真实持仓 → 行业亲和度 → 量化规则。真金白银比任何公式都有说服力。

### 🛡 机械级自查 gate

`lib/self_review.py` **13 条自动检查**覆盖所有历史 BUG 经验：

| severity | 抓什么 | 背后教训 |
|---|---|---|
| 🔴 critical | 行业碰撞（工业金属→农副食品加工） | 行业分类错了报告照发 |
| 🔴 critical | 维度缺失 / 空 data / 占位符 | fetcher 崩溃、wave2 timeout |
| 🔴 critical | HK kline 0 根 / HK 财报空 | 港股数据链断裂 |
| 🔴 critical | panel 全 skip / coverage < 60% | 数据灾难 |
| 🔴 critical | agent_analysis 缺 / 未 review | agent 偷懒 |
| 🟡 warning | DCF 全 0 / 金属股 materials 空 | 数据覆盖缺口 |
| 🟡 warning | 编造"苹果产业链"无 raw_data 证据 | 幻觉编造 |

**`assemble_report::assemble()` 入口自动跑 review**，critical > 0 → `raise RuntimeError("⛔ BLOCKED by self-review")`，**物理上无法出报告**，直到 agent 修完。

```bash
# agent 迭代流程
loop:
  python review_stage_output.py <ticker>
  读 .cache/<ticker>/_review_issues.json
  对每条 critical 执行 suggested_fix
  直到 critical == 0 才出 HTML
```

每次新 BUG 修完，对应的 `check_*` 规则都会加到 self_review，**下次同类问题跑完就自动抓到，不再靠用户反馈**。

---

## ❓ FAQ

**Q: 跑一次要多久？**
A: 5-8 分钟，主要是数据采集慢（22 个维度要调十几个 API）。纯计算的机构建模部分 < 1 秒。

**Q: 需要付费数据源吗？**
A: 不需要。全部免费源（akshare / yfinance / DuckDuckGo / 巨潮 / 东方财富 / 雪球），零 API key。

**Q: 港股美股能用吗？**
A: 能。`/stock-deep-analyzer:analyze-stock 00700.HK` 或 `/stock-deep-analyzer:analyze-stock AAPL`。

**Q: 数据准不准？**
A: 实时数据走东方财富 / 雪球，财报走巨潮 / akshare，和你在东方财富 App 上看到的一样。但 web search 质量不稳定（DuckDuckGo 中文搜索有时会返回无关结果），所以 AI 会做二次审查。

**Q: 能当投资建议吗？**
A: 不能。这是工具不是神仙，66 个大佬的意见都是规则引擎模拟的，不代表真人观点。买不买你自己决定。

**Q: 怎么知道这次报告数据是否可信？**
A: 报告生成前强制跑 13 条机械自查，critical 不过物理上发不出报告。`.cache/<ticker>/_review_issues.json` 里能看到本次跑有没有 warning，每条都带 `suggested_fix`。每次新 BUG 修完都加对应检查 → 下次同类问题自动抓到，不靠用户反馈。

**Q: 怎么升级到新版本？自动提示吗？**
A: 会。每次启动 CLI 或 agent 会话都会后台检测 GitHub 最新 release：
- 有新版本 → 弹三选一提示（是 / 跳过本版 / 否）+ 改动摘要
- 选"是"→ 按你装的方式执行对应命令：
  - Claude Code: `/plugin update stock-deep-analyzer`
  - git clone: `cd Pantheon && git pull`
  - Hermes: `hermes skills update cortray/Pantheon/skills/deep-analysis`
- 选"跳过本版"→ 该版本不再提示，下一个新版本出来时才再弹
- 选"否"→ 下次启动再问
- 网络慢 / 关掉检查：`export UZI_NO_UPDATE_CHECK=1`（CI 环境推荐）
- 缓存 6 小时 · 不会每次都打 GitHub API

**Q: 之前报告里有 BUG 怎么办？**
A: 2026-04-17 前跑过"工业金属 / 工业母机 / 工业机械"相关股票的用户，cache 里的 `7_industry` 维度是错的（云铝被归为农副食品加工的那个 bug）。清 cache 重跑即可：
```bash
rm -rf skills/deep-analysis/scripts/.cache/<ticker>/raw_data.json
python run.py <ticker> --no-resume
```

---

## 📋 更新日志

| 版本 | 日期 | 主要变化 |
|---|---|---|
| **Unreleased** | 2026-08-05 | **全球同行业绩对比 + 数据完整性 hotfix** · 自动按全球细分行业发现候选并补全 Top 8 年度财务，覆盖日/韩/台/新/印/加/澳/英/欧洲等 Yahoo 交易所后缀；原币与 USD 标准化值分离，跨币种原始市值不混算，同行失败隔离、后备候选递补并缓存 24h。报告新增目标高亮、同行中位数、全球分位、规模/毛利率散点和明细表，结果接入 Comps 与维度评分。22 个全球同行专项测试 · 全量 685 passed |
| **v3.9.3** | 2026-08-07 | **茅台深度实测驱动的数据/渲染修复** · ① 现金流误判：`fcf_positive` 从 OCF/净利比改为真实 FCF，茅台(FCF 658亿)不再显示"现金流为负"；`_ic_risks` 的"行业周期下行"不再无条件追加，仅行业判定衰退时才算。② 同行修复：push2 被反爬时 4_peers 曾只剩自己一行("暂无可比股")——新增 INDUSTRY_PEERS 硬编码同行兜底(白酒→五粮液/泸州老窖/洋河/山西汾酒)，用 `stock_financial_analysis_indicator_em`(不走 push2)拉 ROE。③ 渲染修复：评委 pass/fail dict 不再泄漏成 Python 字面量；4_peers 对比条 `abs(None)` 崩溃；一致目标价不再显示"(None)"。④ deep 档强制 agent 介入 role-play：`--depth deep` 不再 CLI 一把梭，须 stage1 → 读 persona → 写 agent_analysis.json(`per_investor_override` 已能真正合并)。45+ 回归测试 |
| **v3.9.2** | 2026-07-07 | **流程与数据契约 hotfix** · ① `fetch_financials` 显式输出 `ocf` / `ocf_history` / `ocf_to_net_income_ratio`，不再只把经营现金流藏在 `fcf` 字段里；`stock_features` 读入 OCF/净利比，避免 trap-detector 默认 1.0 误判。② `industry=None` 时 `fetch_peers` 返回 self-only fallback + reason，`fetch_valuation` 用 cninfo 市场加权 PE 兜底并标明原因。③ pipeline registry 字段契约对齐 legacy 输出，避免假 data_gaps。④ `agent_analysis.json` 结构性 schema error 现在真正 fallback 到脚本骨架。⑤ `run.py` 统一 fund summary / `--versus` / `--portfolio` 的浏览器、`--output-dir`、`--remote` 后处理；`cloudflared` 缺失时默认不自动安装。8 个新回归测试 |
| **v3.9.1** | 2026-06-23 | **HTML 报告导航栏可折叠** · v3.6.0 加的左侧 sticky 章节导航栏会略微遮挡正文，本次加折叠按钮：展开态 `◀`，点一下收起成一个 `☰` 小把手，再点一下展开 · 状态写入 `localStorage` 刷新记忆 · 全程安全 DOM(无 innerHTML) + `aria-expanded` 可访问性. 7 个新回归 · 总 649 passed |
| **v3.9.0** | 2026-06-11 | **新评委「股海贼王」· 首位从真实交割单蒸馏的评委 (65→66)** · 数据源：淘股吧十年实盘帖 (2016-02 开贴) · 3898 张持仓截图 OCR → **8951 笔反推交割单** + **5069 条发言**. 定量画像：33 万→3131 万 (~95 倍/10 年) · 持仓中位 1 天/P75 3 天 · 同时 3-5 只 · 第一重仓中位 51% · 10 年 2010 只票题材轮动. 方法论蒸馏（风格提炼·不逐字转载原帖）：复盘三问(为啥涨停/板块地位/大盘地位) · 弱转强快速板才算超预期 · 逻辑硬的低位票爆发力足 · 格局票=时代的情绪载体 · 反复强调不跟单. 落地：F 组 flagship · 6 条数据驱动规则 (阈值来自其真实行为统计) · 台词按风格原创撰写 · `docs/ghzw-dossier.md` 蒸馏档案. **原始交割单/截图/发言均为本地数据 · 未入库.** 实测：鸿博式妖股 bullish 100 (他真做过 22 次) · 茅台 bearish 9.5 · 美股 skip. 10 个新回归 · 总 642 passed |
| **v3.8.1** | 2026-06-09 | **skills 全面体检 · H/I 两组配套层 6 处补齐** · 体检发现 v3.6.3/v3.7.0 加 14 位评委时配套层漏更新（全部静默降级所以没暴露）：① 14 评委缺头像 SVG → 报告破图 ② `render_school_scores` order=[A..G] → H/I 两派分数永远不渲染 ③ GROUP_LABELS ×3 处缺 H/I → 显示裸字母 ④ GROUP_DEFAULT 缺 H/I → profile 全 "—" ⑤ STYLE_GROUP_WEIGHTS 缺 H/I → 风格加权对两组失效 ⑥ 13 新评委补显式 MARKET_SCOPE + PERSONAS voice 台词. 文档同步 ~35 处（52→65 评委 / 7→9 流派 / 180→236 规则 / --school A-G→A-I）. 10 个新体检回归 · 总 632 passed |
| **v3.8.0** | 2026-06-08 | **Tier-1 五方法 + Serenity 严谨化 + 技术指标/杜邦扩展** · ① Tier-1 5 方法（新包 `lib/tier1/`）：`/ai-readiness`（AI 就绪度/卡位 · 复用 `ai_chokepoint_score`）· `/earnings-preview`（财报前预测 · Bull/Base/Bear + 隐含波动）· `/model-update`（新财报/指引增量更新模型 · 假设 delta + 对 DCF/Comps/thesis 影响）· `/returns`（组合收益归因）· `/rebalance`（逐持仓再平衡 + 本地化换手成本，A股无资本利得税故不做 TLH）. ② Serenity 严谨化（不再只会看多）：8 罚分因子（炒作无订单/微盘流动性/杀猪盘/治理/周期/替代设计/地缘/稀释 · 封顶 60% 折扣）+ 3 级证据阶梯（强公告财报≈1.0 > 中媒体卖料≈0.85 > 弱叙事≈0.70）+ 供应链 8 层分层（材料→…→下游 · 越上游瓶颈分越高）. ③ 指标扩展：DuPont 杜邦分解（ROE 质量来源 margin_driven/leverage_driven）+ KDJ/OBV/Williams%R. 61 个新回归测试 · 总 622 passed |
| **v1.0 – v3.7.x** | 2026-04 ~ 2026-05 | 初版 19 维 + 50 评委 → 22 维 + 66 评委 · 51 评委 180 规则 → 242 规则 · 17 种机构方法 → 22 种 · 三档思考深度 · 机械自查 gate · 多股对比 & 组合 · 流派锁定 · pipeline 架构重构 · 完整演进见 [RELEASE-NOTES.md](RELEASE-NOTES.md) |

---

## ⚠️ 免责声明

本工具由 AI 模型基于公开数据生成分析报告。所有评分、建议、模拟评语均为算法输出，不代表任何真实投资者的实际观点。**不构成投资建议**，投资有风险，入市需谨慎。

---

<div align="center">

Pantheon · MIT License

</div>
