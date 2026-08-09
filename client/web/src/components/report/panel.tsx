import type { PanelSummary, SchoolScore } from '@/lib/types'
import { signalClass, signalLabel } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const SIGNAL_COLORS: Record<string, string> = {
  bullish: 'bg-emerald-500',
  neutral: 'bg-amber-500',
  bearish: 'bg-red-500',
  skip: 'bg-muted',
}

export function PanelTab({
  panelSummary,
  schoolScores,
}: {
  panelSummary: PanelSummary
  schoolScores?: Record<string, SchoolScore>
}) {
  const sig = panelSummary.signal_distribution ?? {}
  const total = panelSummary.n_investors || Object.values(sig).reduce((a, b) => a + b, 0) || 1
  const order: Array<keyof typeof SIGNAL_COLORS> = ['bullish', 'neutral', 'bearish', 'skip']

  return (
    <div className="space-y-5">
      {/* 投票分布 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            66 评委投票 · 共识 {panelSummary.panel_consensus ?? '—'}
          </CardTitle>
          <CardDescription>bullish / neutral / bearish / skip 占比</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex h-4 w-full overflow-hidden rounded-full">
            {order.map((s) => {
              const n = sig[s] ?? 0
              if (n === 0) return null
              return (
                <div
                  key={s}
                  className={SIGNAL_COLORS[s]}
                  style={{ width: `${(n / total) * 100}%` }}
                  title={`${signalLabel(s)}: ${n}`}
                />
              )
            })}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {order.map((s) => (
              <div key={s} className="rounded-lg border p-3 text-center">
                <div className={`text-2xl font-bold ${signalClass(s)}`}>{sig[s] ?? 0}</div>
                <div className="text-xs text-muted-foreground">{signalLabel(s)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 流派共识 */}
      {schoolScores && Object.keys(schoolScores).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">流派共识</CardTitle>
            <CardDescription>9 大流派各自的 consensus 与投票</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(schoolScores).map(([g, s]) => (
              <div key={g} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{s.label}</span>
                  <Badge variant="outline">{s.verdict}</Badge>
                </div>
                <div className="mt-2 text-2xl font-bold">{s.consensus}</div>
                <Progress value={s.consensus} className="mt-2" />
                <div className="mt-2 flex gap-1.5 text-[10px] text-muted-foreground">
                  <span className="text-emerald-500">多 {s.bullish}</span>
                  <span className="text-amber-500">中 {s.neutral}</span>
                  <span className="text-red-500">空 {s.bearish}</span>
                  <span>跳 {s.skip}</span>
                  <span>· {s.dominant_signal}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Top Bull / Bear */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-emerald-600 dark:text-emerald-400">Top 看多评委</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(panelSummary.top_bull ?? []).map((b, i) => (
              <div key={i} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{b.name}</span>
                  <Badge variant="secondary">{b.score} 分</Badge>
                </div>
                {b.headline && <p className="mt-1 text-xs text-muted-foreground">{b.headline}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-red-600 dark:text-red-400">Top 看空评委</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(panelSummary.top_bear ?? []).map((b, i) => (
              <div key={i} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{b.name}</span>
                  <Badge variant="secondary">{b.score} 分</Badge>
                </div>
                {b.headline && <p className="mt-1 text-xs text-muted-foreground">{b.headline}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
