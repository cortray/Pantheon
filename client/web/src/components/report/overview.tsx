import type { ReactNode } from 'react'
import type { Synthesis } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ShieldAlert } from 'lucide-react'

export function OverviewTab({ syn }: { syn: Synthesis }) {
  const dash = syn.dashboard
  const gd = syn.great_divide
  return (
    <div className="space-y-5">
      {/* 核心结论 */}
      {dash?.core_conclusion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">综合结论</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/90">{dash.core_conclusion}</p>
          </CardContent>
        </Card>
      )}

      {/* 多空辩论 */}
      {gd?.punchline && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">多空大辩论</CardTitle>
            <CardDescription>{gd.punchline}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                🐂 多方
                {gd.bull_score !== undefined && <Badge variant="secondary">{gd.bull_score} 分</Badge>}
              </div>
              <ScrollArea className="h-40 rounded-md border p-3">
                <ul className="space-y-2 text-sm">
                  {(gd.bull_say_rounds ?? ['多方论点见完整报告']).map((t, i) => (
                    <li key={i} className="leading-relaxed">{t}</li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
                🐻 空方
                {gd.bear_score !== undefined && <Badge variant="secondary">{gd.bear_score} 分</Badge>}
              </div>
              <ScrollArea className="h-40 rounded-md border p-3">
                <ul className="space-y-2 text-sm">
                  {(gd.bear_say_rounds ?? ['空方论点见完整报告']).map((t, i) => (
                    <li key={i} className="leading-relaxed">{t}</li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 风险 */}
      {(syn.risks?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="size-4" /> 核心风险（{syn.risks?.length}）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {syn.risks?.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed">
                  <span className="text-red-500">●</span>
                  {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 买入区 */}
      {syn.buy_zones && Object.keys(syn.buy_zones).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">买入区参考</CardTitle>
            <CardDescription>按不同投资流派给出的价位参考（非投资建议）</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {Object.entries(syn.buy_zones).map(([key, z]) => (
              <div key={key} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{zoneLabel(key)}</Badge>
                  <span className="font-mono text-sm font-semibold">{z.zone}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{z.logic}</p>
                <p className="mt-1 text-xs text-primary">触发：{z.trigger}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 情报/作战计划（容错渲染：字段可能是 string / string[] / 对象） */}
      {(dash?.intelligence || dash?.battle_plan) && (
        <div className="grid gap-4 md:grid-cols-2">
          {dash.intelligence && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">情报速览</CardTitle>
              </CardHeader>
              <CardContent>
                <SmartContent value={dash.intelligence} />
              </CardContent>
            </Card>
          )}
          {dash.battle_plan && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">作战计划</CardTitle>
              </CardHeader>
              <CardContent>
                <SmartContent value={dash.battle_plan} />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 数据缺口提示 */}
      {syn.data_gaps && syn.data_gaps.total_gaps !== undefined && syn.data_gaps.total_gaps > 0 && (
        <Alert>
          <AlertTitle>数据缺口 {syn.data_gaps.coverage_pct}% 覆盖</AlertTitle>
          <AlertDescription>
            {syn.data_gaps.unresolved} 项未解决：
            {(syn.data_gaps.tasks ?? [])
              .filter((t) => t.status === 'pending')
              .map((t) => `${t.dim}.${t.field}`)
              .join('、') || '无'}
          </AlertDescription>
        </Alert>
      )}

      <Separator />
      {syn.panel_insights && (
        <p className="text-xs leading-relaxed text-muted-foreground">💡 评委观察：{syn.panel_insights}</p>
      )}
    </div>
  )
}

/**
 * 智能内容渲染：引擎产出的 dashboard 字段类型不稳定
 * （string / string[] / {news,risks,catalysts} 等对象），
 * 全部容错渲染，杜绝 React #31（对象作为 child）。
 */
function SmartContent({ value }: { value: unknown }) {
  if (typeof value === 'string') {
    return <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{value}</p>
  }
  if (Array.isArray(value)) {
    return (
      <ul className="space-y-1.5">
        {value.map((v, i) => (
          <li key={i} className="text-sm leading-relaxed text-muted-foreground">
            <SmartLeaf v={v} />
          </li>
        ))}
      </ul>
    )
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    return (
      <div className="space-y-3">
        {entries.map(([k, v]) => (
          <div key={k}>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">{k}</div>
            {Array.isArray(v) ? (
              <ul className="space-y-1">
                {v.map((item, i) => (
                  <li key={i} className="text-sm leading-relaxed text-muted-foreground">
                    <SmartLeaf v={item} />
                  </li>
                ))}
              </ul>
            ) : typeof v === 'object' && v !== null ? (
              <pre className="overflow-x-auto rounded-md bg-muted p-2 text-xs text-muted-foreground">
                {JSON.stringify(v, null, 2)}
              </pre>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">{String(v)}</p>
            )}
          </div>
        ))}
      </div>
    )
  }
  return null
}

function SmartLeaf({ v }: { v: unknown }) {
  if (typeof v === 'string') return <>{v}</>
  if (typeof v === 'number' || typeof v === 'boolean') return <>{String(v)}</>
  if (v && typeof v === 'object') {
    return (
      <span className="font-mono text-xs">{JSON.stringify(v)}</span>
    )
  }
  return null
}

function zoneLabel(key: string): string {
  const map: Record<string, string> = {
    value: '价值派',
    growth: '成长派',
    technical: '技术派',
    youzi: '游资',
  }
  return map[key] ?? key
}

// 保持 ReactNode 类型导出（无实际用途，防误删 import）
export type { ReactNode }
