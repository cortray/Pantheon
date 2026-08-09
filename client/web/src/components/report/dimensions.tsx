import type { Dimensions } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const DIM_META: Record<string, { name: string; desc: string }> = {
  '0_basic': { name: '公司基本面', desc: '市值 / PE / 行业 / 上市信息' },
  '1_financials': { name: '财务质量', desc: 'ROE / 营收增速 / 负债率' },
  '2_kline': { name: 'K 线技术', desc: 'Stage / 均线 / 回撤' },
  '3_macro': { name: '宏观环境', desc: '利率 / 汇率 / 地缘' },
  '4_peers': { name: '同业对比', desc: '估值对标 / 排名' },
  '5_chain': { name: '产业链', desc: '主营构成 / 上下游' },
  '6_research': { name: '研报覆盖', desc: '评级 / 目标价 / 覆盖家数' },
  '7_industry': { name: '行业景气', desc: '生命周期 / TAM / 集中度' },
  '8_materials': { name: '原材料', desc: '成本结构 / 顺价能力' },
  '9_futures': { name: '期货关联', desc: '套保 / 大宗传导' },
  '10_valuation': { name: '估值水位', desc: 'PE/PB 分位 / DCF' },
  '11_governance': { name: '公司治理', desc: '质押 / 内部交易' },
  '12_capital_flow': { name: '资金流向', desc: '主力 / 解禁 / 融资' },
  '13_policy': { name: '政策监管', desc: '国家战略 / 补贴 / 出口管制' },
  '14_moat': { name: '护城河', desc: '壁垒 / 定价权' },
  '15_events': { name: '事件驱动', desc: '公告 / 新闻 / 催化剂' },
  '16_lhb': { name: '龙虎榜', desc: '游资 / 机构席位' },
  '17_sentiment': { name: '市场情绪', desc: '雪球 / 股吧热度' },
  '18_trap': { name: '杀猪盘检测', desc: '推广痕迹 / 异常对倒' },
  '19_contests': { name: '实盘比赛', desc: '雪球组合持仓' },
  '20_valuation_models': { name: '机构建模', desc: 'DCF / LBO / Comps' },
  '21_research_workflow': { name: '研究流程', desc: '研究员视角' },
  '22_deep_methods': { name: '深度方法', desc: 'IC Memo / BCG' },
}

export function DimensionsTab({
  dims,
  commentary,
}: {
  dims: Dimensions | null
  commentary?: Record<string, string>
}) {
  if (!dims) {
    return <EmptyNote text="该缓存没有 22 维评分数据（dimensions.json 缺失）" />
  }
  const entries = Object.entries(dims.dimensions ?? {})
  const top = [...entries].sort((a, b) => b[1].score - a[1].score)
  const bottom = [...entries].sort((a, b) => a[1].score - b[1].score)

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">22 维评分 · 基本面总分 {dims.fundamental_score}/100</CardTitle>
          <CardDescription>每维 0-10 分，权重标注在 label 后</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {entries.map(([key, d]) => {
            const meta = DIM_META[key] ?? { name: key, desc: '' }
            const pct = d.score * 10
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {meta.name}
                    <span className="ml-2 text-xs text-muted-foreground">{d.label}</span>
                  </span>
                  <span className="font-mono text-xs">{d.score}/10</span>
                </div>
                <Progress value={pct} className={pct >= 70 ? 'bg-emerald-500/20' : pct >= 50 ? 'bg-amber-500/20' : 'bg-red-500/20'} />
                <div className="flex flex-wrap gap-1">
                  {d.reasons_pass?.map((r, i) => (
                    <Badge key={`p${i}`} variant="secondary" className="text-[10px]">
                      ✓ {r}
                    </Badge>
                  ))}
                  {d.reasons_fail?.map((r, i) => (
                    <Badge key={`f${i}`} variant="destructive" className="text-[10px]">
                      ✗ {r}
                    </Badge>
                  ))}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {commentary && Object.keys(commentary).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agent 定性评语</CardTitle>
            <CardDescription>分析师对各维度的深度解读</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="flex flex-wrap">
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="top">强项</TabsTrigger>
                <TabsTrigger value="weak">弱项</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-3 space-y-3">
                {Object.entries(commentary).map(([key, text]) => (
                  <CommentBlock key={key} dimKey={key} text={text} />
                ))}
              </TabsContent>
              <TabsContent value="top" className="mt-3 space-y-3">
                {top.slice(0, 8).map(([key]) => (
                  <CommentBlock key={key} dimKey={key} text={commentary[key]} />
                ))}
              </TabsContent>
              <TabsContent value="weak" className="mt-3 space-y-3">
                {bottom.slice(0, 8).map(([key]) => (
                  <CommentBlock key={key} dimKey={key} text={commentary[key]} />
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CommentBlock({ dimKey, text }: { dimKey: string; text?: string }) {
  if (!text || text.includes('[脚本占位]')) return null
  const meta = DIM_META[dimKey] ?? { name: dimKey, desc: '' }
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-1 text-xs font-semibold text-primary">{meta.name}</div>
      <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  )
}

function EmptyNote({ text }: { text: string }) {
  return <p className="rounded-lg border p-4 text-sm text-muted-foreground">{text}</p>
}
