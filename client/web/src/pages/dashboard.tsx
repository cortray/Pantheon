import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Play,
  Server,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { api } from '@/lib/api'
import { scoreColor, verdictTone } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function DashboardPage() {
  const health = useQuery({ queryKey: ['health'], queryFn: api.health })
  const cache = useQuery({ queryKey: ['cache'], queryFn: api.cache, refetchInterval: 30_000 })
  const reports = useQuery({ queryKey: ['reports'], queryFn: api.reports, refetchInterval: 30_000 })

  const stocks = cache.data?.stocks ?? []
  const reportList = reports.data?.reports ?? []

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">仪表盘</h1>
          <p className="text-sm text-muted-foreground">
            UZI-Skill 22 维深度分析 · 66 位投资大佬评审 · 一键触发
          </p>
        </div>
        <div className="flex items-center gap-2">
          {health.isLoading ? (
            <Skeleton className="h-9 w-40" />
          ) : health.data?.ok ? (
            <Badge variant="secondary" className="gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              后端在线 · Python {health.data.python_ok ? '就绪' : '缺依赖'}
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1.5">
              <AlertCircle className="size-3.5" />
              后端离线
            </Badge>
          )}
          <Button asChild>
            <Link to="/analyze">
              <Play className="size-4" /> 发起分析
            </Link>
          </Button>
        </div>
      </header>

      {health.data && !health.data.python_ok && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Python 依赖缺失</AlertTitle>
          <AlertDescription>
            当前 Python 环境缺少 akshare 等核心依赖，分析任务可能失败。请先安装：{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              pip install -r requirements.txt
            </code>
          </AlertDescription>
        </Alert>
      )}

      {/* 统计卡片 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Server className="size-4" />}
          label="缓存股票"
          value={stocks.length}
          hint="已完成分析的标的"
        />
        <StatCard
          icon={<Users className="size-4" />}
          label="评委规模"
          value="66"
          hint="跨 9 大流派"
        />
        <StatCard
          icon={<ShieldCheck className="size-4" />}
          label="Agent 深评"
          value={stocks.filter((s) => s.agent_reviewed).length}
          hint="含 agent role-play"
        />
        <StatCard
          icon={<ArrowRight className="size-4" />}
          label="HTML 报告"
          value={reportList.length}
          hint="历史产物"
        />
      </div>

      {/* 缓存股票总览 */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>缓存股票总览</CardTitle>
            <CardDescription>点击查看结构化分析视图（22 维评分 / 66 评委 / DCF / 多空辩论）</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/cache">全部缓存 →</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {cache.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : stocks.length === 0 ? (
            <EmptyState text="还没有任何分析缓存，点击右上角「发起分析」开始第一单。" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>股票</TableHead>
                  <TableHead>综合评分</TableHead>
                  <TableHead>定调</TableHead>
                  <TableHead>基本面</TableHead>
                  <TableHead>共识</TableHead>
                  <TableHead>风格</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>更新时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks.slice(0, 10).map((s) => (
                  <TableRow key={s.ticker} className="cursor-pointer">
                    <TableCell>
                      <Link to={`/report/${encodeURIComponent(s.ticker)}`} className="font-medium hover:underline">
                        {s.name}
                        <span className="ml-1.5 font-mono text-xs text-muted-foreground">{s.ticker}</span>
                      </Link>
                    </TableCell>
                    <TableCell className={scoreColor(s.overall_score ?? 0)}>
                      {s.overall_score ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={verdictTone(s.verdict_label ?? '')}>{s.verdict_label ?? '—'}</Badge>
                    </TableCell>
                    <TableCell>{s.fundamental_score ?? '—'}</TableCell>
                    <TableCell>{s.panel_consensus ?? '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.style ?? '—'}</TableCell>
                    <TableCell>
                      {s.agent_reviewed ? (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle2 className="size-3 text-emerald-500" /> 已深评
                        </Badge>
                      ) : (
                        <Badge variant="outline">脚本</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.mtime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 最新报告 */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>最近报告</CardTitle>
            <CardDescription>生成的 standalone HTML 产物</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/reports">全部报告 →</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {reports.isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : reportList.length === 0 ? (
            <EmptyState text="暂无报告。" />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {reportList.slice(0, 6).map((r) => (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {r.ticker}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">{r.date}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{r.size_kb} KB · {r.mtime}</div>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  hint: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold leading-none">{value}</div>
          <div className="mt-1 text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">{hint}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
      <AlertCircle className="size-8 opacity-40" />
      <p className="text-sm">{text}</p>
    </div>
  )
}
