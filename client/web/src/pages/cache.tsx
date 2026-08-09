import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api } from '@/lib/api'
import { scoreColor, verdictTone } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function CachePage() {
  const cache = useQuery({ queryKey: ['cache'], queryFn: api.cache, refetchInterval: 30_000 })
  const [q, setQ] = useState('')
  const stocks = cache.data?.stocks ?? []

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return stocks
    return stocks.filter(
      (s) =>
        s.ticker.toLowerCase().includes(query) ||
        (s.name ?? '').toLowerCase().includes(query) ||
        (s.verdict_label ?? '').toLowerCase().includes(query),
    )
  }, [stocks, q])

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">缓存浏览器</h1>
          <p className="text-sm text-muted-foreground">
            .cache/ 下全部已分析股票（{stocks.length} 只），点击进入结构化报告
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="搜索代码 / 名称 / 定调…"
            className="pl-8"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </header>

      {/* 评分分布图 */}
      {stocks.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">评分分布</CardTitle>
            <CardDescription>综合评分对比 · 参考线 65（可以蹲）/ 50（观望）</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stocks.slice(0, 16).map((s) => ({ name: s.ticker, score: s.overall_score ?? 0 }))} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} interval={0} angle={-25} textAnchor="end" height={48} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <ChartTooltip
                  cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                  contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
                <ReferenceLine y={65} stroke="var(--chart-2)" strokeDasharray="4 4" />
                <ReferenceLine y={50} stroke="var(--chart-3)" strokeDasharray="4 4" />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {stocks.slice(0, 16).map((s) => (
                    <Cell
                      key={s.ticker}
                      fill={
                        (s.overall_score ?? 0) >= 65 ? 'var(--chart-2)' : (s.overall_score ?? 0) >= 50 ? 'var(--chart-4)' : 'var(--chart-5)'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">缓存总览</CardTitle>
          <CardDescription>按更新时间倒序 · 评分着色</CardDescription>
        </CardHeader>
        <CardContent>
          {cache.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {stocks.length === 0 ? '暂无缓存，请先分析一只股票。' : '没有匹配的缓存。'}
            </p>
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
                  <TableHead>数据</TableHead>
                  <TableHead>时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.ticker}>
                    <TableCell>
                      <Link to={`/report/${encodeURIComponent(s.ticker)}`} className="font-medium hover:underline">
                        {s.name}
                        <span className="ml-1.5 font-mono text-xs text-muted-foreground">{s.ticker}</span>
                      </Link>
                    </TableCell>
                    <TableCell className={`font-mono font-semibold ${scoreColor(s.overall_score ?? 0)}`}>
                      {s.overall_score ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={verdictTone(s.verdict_label ?? '')}>{s.verdict_label ?? '—'}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">{s.fundamental_score ?? '—'}</TableCell>
                    <TableCell className="font-mono">{s.panel_consensus ?? '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.style ?? '—'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {s.has_dimensions && <Badge variant="outline" className="text-[10px]">22维</Badge>}
                        {s.has_panel && <Badge variant="outline" className="text-[10px]">66评委</Badge>}
                        {s.agent_reviewed && <Badge variant="secondary" className="text-[10px]">agent</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.mtime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
