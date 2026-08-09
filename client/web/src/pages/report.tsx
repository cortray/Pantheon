import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { AlertCircle, ExternalLink, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { OverviewTab } from '@/components/report/overview'
import { DimensionsTab } from '@/components/report/dimensions'
import { PanelTab } from '@/components/report/panel'
import { InstitutionalTab } from '@/components/report/institutional'
import { scoreColor } from '@/lib/utils'

export default function ReportPage() {
  const { ticker = '' } = useParams<{ ticker: string }>()
  // hooks 必须在条件 return 之前调用（React 规则）
  const reports = useQuery({ queryKey: ['reports'], queryFn: api.reports })
  const stock = useQuery({
    queryKey: ['stock', ticker],
    queryFn: () => api.stock(ticker),
    retry: 1,
  })

  if (stock.isLoading) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (stock.isError || !stock.data) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>无法加载 {ticker}</AlertTitle>
          <AlertDescription>
            {(stock.error as Error)?.message ?? '未找到该股票的分析缓存。请先到「分析中心」发起分析。'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const { synthesis: syn, dimensions: dims, panel_summary: ps } = stock.data

  // 真实 HTML 报告（按 ticker 匹配，避免日期硬编码）
  const report = (reports.data?.reports ?? []).find(
    (r) => r.ticker === syn.ticker || r.id.startsWith(syn.ticker),
  )

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-6">
      {/* 头部 */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold">
            <span className={scoreColor(syn.overall_score)}>{syn.overall_score}</span>
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              {syn.name ?? syn.ticker}
              <span className="font-mono text-sm font-normal text-muted-foreground">{syn.ticker}</span>
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge>{syn.verdict_label}</Badge>
              {syn.style_label_cn && <Badge variant="outline">{syn.style_label_cn}</Badge>}
              {syn.agent_reviewed && <Badge variant="secondary">🧠 agent 深评</Badge>}
              {syn.school_lock && <Badge variant="secondary">🔒 {syn.school_lock} 派锁定</Badge>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {syn.verdict_detail} · 基本面 {syn.fundamental_score} · 评委共识 {syn.panel_consensus}
            </p>
          </div>
        </div>
        {report ? (
          <Button variant="outline" asChild title={`${report.id} · ${report.size_kb} KB`}>
            <a href={report.url} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" /> 完整 HTML 报告（{report.size_kb} KB）
            </a>
          </Button>
        ) : (
          <Button
            variant="outline"
            disabled
            title="暂无完整报告，请先在「分析中心」完成一次分析生成 HTML 报告"
          >
            <ExternalLink className="size-4" /> 完整 HTML 报告
          </Button>
        )}
      </header>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full max-w-xl grid-cols-5">
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="dimensions">22 维评分</TabsTrigger>
          <TabsTrigger value="panel">评委面板</TabsTrigger>
          <TabsTrigger value="institutional">机构模型</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab syn={syn} />
        </TabsContent>
        <TabsContent value="dimensions">
          <DimensionsTab dims={dims} commentary={syn.dim_commentary} />
        </TabsContent>
        <TabsContent value="panel">
          <PanelTab panelSummary={ps} schoolScores={syn.school_scores} />
        </TabsContent>
        <TabsContent value="institutional">
          <InstitutionalTab syn={syn} />
        </TabsContent>
        <TabsContent value="html">
          <HtmlTab ticker={syn.ticker} report={report} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function HtmlTab({ ticker, report }: { ticker: string; report?: { id: string; size_kb: number; url: string } }) {
  if (!report) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          未找到该股票的 HTML 报告产物。请先在「分析中心」完成一次分析（lite/medium/deep 均可生成完整 HTML 报告），
          或在仓库 reports/ 目录确认报告已生成。
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b p-3">
          <span className="text-sm text-muted-foreground">{report.id} · {report.size_kb} KB</span>
          <Button variant="outline" size="sm" asChild>
            <a href={report.url} target="_blank" rel="noreferrer">
              <ExternalLink className="size-3.5" /> 新窗口打开
            </a>
          </Button>
        </div>
        <iframe src={report.url} title={`${ticker} 完整报告`} className="h-[75vh] w-full" />
      </CardContent>
    </Card>
  )
}
