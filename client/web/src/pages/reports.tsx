import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ExternalLink, FileText } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'

export default function ReportsPage() {
  const reports = useQuery({ queryKey: ['reports'], queryFn: api.reports, refetchInterval: 30_000 })
  const list = reports.data?.reports ?? []

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">报告列表</h1>
        <p className="text-sm text-muted-foreground">所有生成的 standalone HTML 报告产物</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4" /> 历史报告（{list.length}）
          </CardTitle>
          <CardDescription>standalone 报告已内联全部资源，可离线分享</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">暂无报告。</p>
          ) : (
            <div className="space-y-2">
              {list.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{r.ticker}</span>
                      {r.standalone ? (
                        <Badge variant="secondary" className="text-[10px]">standalone</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">full</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {r.size_kb} KB · {r.mtime}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/report/${encodeURIComponent(r.ticker)}`}>
                      结构化视图 <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={r.url} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-3.5" /> HTML
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
