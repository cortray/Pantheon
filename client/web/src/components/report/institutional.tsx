import type { Synthesis } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export function InstitutionalTab({ syn }: { syn: Synthesis }) {
  const m = syn.institutional_modeling
  if (!m) {
    return <p className="rounded-lg border p-4 text-sm text-muted-foreground">该缓存没有机构建模数据。</p>
  }

  const cards: Array<{ title: string; value: string; note: string; tone: 'good' | 'bad' | 'mid' }> = []
  if (m.dcf_intrinsic !== undefined && m.dcf_intrinsic !== null) {
    const margin = m.dcf_safety_margin_pct ?? 0
    cards.push({
      title: 'DCF 内在价值',
      value: `¥${m.dcf_intrinsic.toFixed(2)}`,
      note: `安全边际 ${margin >= 0 ? '+' : ''}${margin.toFixed(1)}% · ${m.dcf_verdict ?? ''}`,
      tone: margin >= 0 ? 'good' : margin >= -30 ? 'mid' : 'bad',
    })
  }
  if (m.lbo_irr_pct !== undefined && m.lbo_irr_pct !== null) {
    cards.push({
      title: 'LBO IRR',
      value: `${m.lbo_irr_pct.toFixed(1)}%`,
      note: m.lbo_verdict ?? '',
      tone: (m.lbo_irr_pct ?? 0) >= 20 ? 'good' : (m.lbo_irr_pct ?? 0) >= 10 ? 'mid' : 'bad',
    })
  }
  if (m.target_price !== undefined && m.target_price !== null) {
    cards.push({
      title: '目标价',
      value: `¥${m.target_price.toFixed(2)}`,
      note: `${m.initiating_rating ?? ''} · 上行 ${m.upside_pct ?? '—'}%`,
      tone: (m.upside_pct ?? 0) >= 0 ? 'good' : 'bad',
    })
  }
  if (m.ic_recommendation) {
    cards.push({
      title: 'IC Memo',
      value: m.ic_recommendation,
      note: m.comps_verdict ?? '',
      tone: /买入|重仓/.test(m.ic_recommendation) ? 'good' : /回避|减持/.test(m.ic_recommendation) ? 'bad' : 'mid',
    })
  }
  if (m.bcg_position) {
    cards.push({
      title: 'BCG 矩阵',
      value: m.bcg_position,
      note: `行业吸引力 ${m.industry_attractiveness ?? '—'}%`,
      tone: /Star|明星/.test(m.bcg_position) ? 'good' : /Dog|瘦狗/.test(m.bcg_position) ? 'bad' : 'mid',
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{c.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  c.tone === 'good' ? 'text-emerald-600 dark:text-emerald-400'
                  : c.tone === 'bad' ? 'text-red-600 dark:text-red-400'
                  : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {c.value}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">评级矩阵</CardTitle>
          <CardDescription>首次覆盖 / 行业吸引力 / 现金流强度综合</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Metric label="行业吸引力" value={m.industry_attractiveness ?? null} />
          <Metric label="DCF 安全边际" value={m.dcf_safety_margin_pct ?? null} suffix="%" />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        以上为脚本机构建模（DCF / LBO / Comps / IC Memo / BCG），完整推导见「HTML」Tab 的完整报告。
      </p>
    </div>
  )
}

function Metric({ label, value, suffix = '' }: { label: string; value: number | null; suffix?: string }) {
  if (value === null || value === undefined) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <Badge variant="outline">—</Badge>
      </div>
    )
  }
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-mono text-xs">{value.toFixed(1)}{suffix}</span>
      </div>
      <Progress value={pct} className={value >= 60 ? 'bg-emerald-500/20' : 'bg-amber-500/20'} />
    </div>
  )
}
