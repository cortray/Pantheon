# UZI-Skill Web 客户端

React + Vite + TypeScript + TailwindCSS + shadcn-ui 构建的 UZI-Skill 深度分析前端，
后端为 `client/server.py`（Python stdlib，零额外依赖）。可选 Electron 桌面壳。

## 桌面客户端（Electron）

```powershell
cd client
npm install                        # electron + electron-builder
npm run electron:pack              # 生成 dist-electron/win-unpacked/ 免安装目录
npm run electron:build             # 生成安装包：portable + nsis（dist-electron/）
```

- 主进程自动探测 Python（`UZI_PYTHON` → conda `uzi-skill` → PATH），spawn `server.py` 后加载界面
- 打包包含引擎（`run.py` / `skills/deep-analysis/scripts` / `commands` / **内置 reports**）到 `resources/engine/`，
  `UZI_ENGINE_ROOT` 环境变量让后端在打包布局下正确定位
- **报告目录**：打包版指向 `%APPDATA%/uzi-client-desktop/reports`（可写、持久），首次启动自动迁移内置报告；`UZI_REPORTS_DIR` 可覆盖
- 调试日志：`%APPDATA%/uzi-client-desktop/uzi-electron.log`
- 退出自动清理 Python 子进程树（taskkill /T）

## 快速启动（生产）

```powershell
# 1. 构建前端（输出到 client/static/，仅需改前端后执行）
cd client/web
npm install
npm run build

# 1b. （可选）skills/design 品牌主题有更新时，重新生成主题：
npm run design:themes   # 解析 skills/design/*/DESIGN.md → src/assets/themes.css + src/lib/themes.ts
npm run build

# 2. 启动服务（自动托管前端 + 报告 + API）
cd <repo-root>
python client.py              # http://127.0.0.1:8787
# 或
python client/server.py --port 9000
```

## 开发模式（热更新）

```powershell
# 终端 1：Python 后端
python client/server.py --port 8787 --no-browser

# 终端 2：Vite dev（代理 /api 与 /reports 到 8787）
cd client/web
npm run dev                  # http://127.0.0.1:5173
```

## 功能

| 页面 | 能力 |
|---|---|
| 仪表盘 | 后端健康 / 缓存股票总览（评分·定调·风格·agent 徽章）/ 最近报告 |
| 分析中心 | 单股 / 对比(2-4) / 组合 CSV 三种模式 · lite/medium/deep · 流派锁定 · 强制重抓 · **远程模式（--remote 公网分享，可自动装 cloudflared）** · 实时日志轮询 · 任务队列 · 取消/停止 · **历史任务持久化（重启不丢，可删除）** |
| 报告视图 | 结构化：总览（多空辩论·风险·买入区）/ 22 维评分 / 66 评委投票·流派共识·Top 多空 / 机构模型（DCF·LBO·IC·BCG）/ 完整 HTML iframe |
| 报告列表 | 全部 standalone HTML 产物 |
| 缓存浏览器 | .cache/ 全部股票 · 搜索 · 数据徽章 · **recharts 评分分布图（65/50 参考线）** |
| 命令文档 | commands/*.md Markdown 渲染 · **搜索过滤 + 命令描述（frontmatter）+ 参数提示 + 标题 TOC 锚点 + 代码块一键复制** |
| **主题设置** | **skills/design 74 套品牌主题一键切换**（linear/stripe/claude/airbnb…）+ 明暗三态（浅色/深色/跟随系统）+ 品牌搜索 · 由 `scripts/design-themes-gen.cjs` 自动生成 |
| **命令面板** | **Ctrl+K 全局搜索**：页面导航 / 缓存股票直达报告 / 品牌主题切换 / 明暗切换 / 刷新数据 |

## API（client/server.py）

```
GET  /api/health · /api/reports · /api/cache · /api/jobs · /api/jobs/{id}?since=N
GET  /api/stocks/{ticker} · /api/panel/{ticker} · /api/dimensions/{ticker}
GET  /api/raw/{ticker}?dims=1_financials,10_valuation
GET  /api/commands[/{name}] · /api/skills
POST /api/analyze  {mode: single|versus|portfolio, ticker/tickers/portfolio_csv, depth, school, no_resume, remote, install_cloudflared}
POST /api/jobs/{id}/cancel
DELETE /api/jobs/{id}      （删除历史任务 · 运行中 409）
GET  /reports/{rel}   （路径穿越防护）
```

## 健壮性设计

- 全部 API 返回 JSON，异常捕获统一 400/404/500 + 错误信息
- 任务进程隔离（subprocess）· 并发上限 2（`UZI_MAX_JOBS` 可调）· 可取消
- **任务历史持久化**：`client/data/jobs/*.json` 原子写入（tmp + rename），日志落盘截断 300KB 节流保存；重启自动恢复历史任务，运行中任务标记「服务重启，任务中断」；`DELETE /api/jobs/{id}` 删除
- ticker/路径白名单校验，防注入与路径穿越
- **SPA 历史路由回退**：`/report/:ticker` 等前端路由刷新/直达时返回 index.html（非 API/非静态资产路径）
- **全局错误边界**：渲染崩溃不白屏——展示错误信息 + 重试按钮；引擎 dashboard 字段（string/数组/对象）智能容错渲染，杜绝 React #31
- 损坏缓存容错（读取失败返回 404 而非 500）
- 前端：React Query 缓存/重试/轮询 · 全局错误态 · 空态与骨架屏
