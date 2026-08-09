import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Ban,
  FileText,
  FolderInput,
  Globe,
  Layers,
  Loader2,
  Play,
  Send,
  Terminal,
  Trash2,
} from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import type { AnalyzeRequest, JobInfo } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

type Mode = 'single' | 'versus' | 'portfolio'

const DEPTH_INFO: Record<string, string> = {
  lite: '最快 · 30-60s · 7 维核心 + 10 评委',
  medium: '默认 · 2-4min · 完整 22 维报告',
  deep: '全量 · 5-10min · 22 维 + 66 评委 agent 深评',
}

export default function AnalyzePage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [mode, setMode] = useState<Mode>('single')
  const [ticker, setTicker] = useState('')
  const [tickers, setTickers] = useState('600519.SH 000858.SZ')
  const [portfolioCsv, setPortfolioCsv] = useState('ticker,weight,note\n600519.SH,0.5,白酒龙头\n002414.SZ,0.5,军工红外')
  const [depth, setDepth] = useState<AnalyzeRequest['depth']>('medium')
  const [school, setSchool] = useState('')
  const [noResume, setNoResume] = useState(false)
  const [remote, setRemote] = useState(false)
  const [installCf, setInstallCf] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const jobs = useQuery({
    queryKey: ['jobs'],
    queryFn: api.jobs,
    refetchInterval: (q) => {
      const active = (q.state.data?.jobs ?? []).some((j) => j.status === 'running' || j.status === 'queued')
      return active ? 2000 : 15000
    },
  })
  const jobList = jobs.data?.jobs ?? []

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setSubmitting(true)
      try {
        const body: AnalyzeRequest = {
          mode,
          depth,
          school: school || undefined,
          no_resume: noResume,
          remote,
          install_cloudflared: remote ? installCf : undefined,
        }
        if (mode === 'single') {
          if (!ticker.trim()) throw new ApiError(400, '请输入股票代码或中文名')
          body.ticker = ticker.trim()
        } else if (mode === 'versus') {
          const list = tickers.split(/[\s,，;；]+/).filter(Boolean)
          if (list.length < 2 || list.length > 4) throw new ApiError(400, '对比模式需要 2-4 个股票代码')
          body.tickers = list
        } else {
          if (!portfolioCsv.trim()) throw new ApiError(400, '请输入组合 CSV')
          body.portfolio_csv = portfolioCsv
        }
        await api.analyze(body)
        await qc.invalidateQueries({ queryKey: ['jobs'] })
      } catch (err) {
        setError(err instanceof ApiError ? err.message : String(err))
      } finally {
        setSubmitting(false)
      }
    },
    [mode, ticker, tickers, portfolioCsv, depth, school, noResume, remote, installCf, qc],
  )

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">分析中心</h1>
        <p className="text-sm text-muted-foreground">
          提交分析任务，实时查看引擎日志；完成后一键打开结构化视图或完整 HTML 报告。
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* 提交表单 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="size-4" /> 发起分析
            </CardTitle>
            <CardDescription>单股 / 多股对比 / 组合批量 · 深度与流派可选</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="single">单股</TabsTrigger>
                  <TabsTrigger value="versus">对比</TabsTrigger>
                  <TabsTrigger value="portfolio">组合</TabsTrigger>
                </TabsList>

                <TabsContent value="single" className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="ticker">股票代码 / 名称</Label>
                    <Input
                      id="ticker"
                      placeholder="如 600519.SH / 贵州茅台 / AAPL"
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value)}
                      disabled={submitting}
                    />
                    <p className="text-xs text-muted-foreground">支持 A 股 / 港股 / 美股</p>
                  </div>
                </TabsContent>

                <TabsContent value="versus" className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="tickers">股票列表（2-4 个）</Label>
                    <Textarea
                      id="tickers"
                      value={tickers}
                      onChange={(e) => setTickers(e.target.value)}
                      disabled={submitting}
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground">空格 / 逗号分隔 · 自动复用缓存</p>
                  </div>
                </TabsContent>

                <TabsContent value="portfolio" className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="csv">组合 CSV（ticker,weight,note）</Label>
                    <Textarea
                      id="csv"
                      value={portfolioCsv}
                      onChange={(e) => setPortfolioCsv(e.target.value)}
                      disabled={submitting}
                      rows={5}
                      className="font-mono text-xs"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>深度</Label>
                  <Select value={depth} onValueChange={(v) => setDepth(v as AnalyzeRequest['depth'])} disabled={submitting}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lite">lite · 快速</SelectItem>
                      <SelectItem value="medium">medium · 默认</SelectItem>
                      <SelectItem value="deep">deep · 全量</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{DEPTH_INFO[depth]}</p>
                </div>
                <div className="space-y-1.5">
                  <Label>流派锁定（可选）</Label>
                  <Select value={school} onValueChange={setSchool} disabled={submitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="全部流派" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">全部流派</SelectItem>
                      <SelectItem value="A">A · 价值派</SelectItem>
                      <SelectItem value="B">B · 成长派</SelectItem>
                      <SelectItem value="C">C · 宏观派</SelectItem>
                      <SelectItem value="D">D · 技术派</SelectItem>
                      <SelectItem value="E">E · 中国价投</SelectItem>
                      <SelectItem value="F">F · 游资</SelectItem>
                      <SelectItem value="G">G · 量化</SelectItem>
                      <SelectItem value="H">H · 科技领袖</SelectItem>
                      <SelectItem value="I">I · Serenity</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">锁定单一流派视角</p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="text-sm font-medium">强制重抓</div>
                  <div className="text-xs text-muted-foreground">忽略缓存重新采集（--no-resume）</div>
                </div>
                <Switch checked={noResume} onCheckedChange={setNoResume} disabled={submitting} />
              </div>

              <div className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">远程模式</div>
                    <div className="text-xs text-muted-foreground">
                      分析后通过 Cloudflare Tunnel 生成公网链接（需 cloudflared）
                    </div>
                  </div>
                  <Switch checked={remote} onCheckedChange={setRemote} disabled={submitting} />
                </div>
                {remote && (
                  <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                    <div>
                      <div className="text-sm font-medium">自动安装 cloudflared</div>
                      <div className="text-xs text-muted-foreground">
                        缺失时自动下载安装（--install-cloudflared）
                      </div>
                    </div>
                    <Switch checked={installCf} onCheckedChange={setInstallCf} disabled={submitting} />
                  </div>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>提交失败</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                {submitting ? '提交中…' : '开始分析'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 任务面板 */}
        <div className="space-y-4 lg:col-span-3">
          <JobList
            jobs={jobList}
            loading={jobs.isLoading}
            onOpen={(ticker) => navigate(`/report/${encodeURIComponent(ticker)}`)}
          />
          <ActiveJobLogs jobs={jobList} />
        </div>
      </div>
    </div>
  )
}

function jobBadge(status: string) {
  const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    running: 'default',
    queued: 'secondary',
    done: 'secondary',
    error: 'destructive',
    cancelled: 'outline',
    cancelling: 'secondary',
  }
  return map[status] ?? 'outline'
}

function JobList({
  jobs,
  loading,
  onOpen,
}: {
  jobs: JobInfo[]
  loading: boolean
  onOpen: (ticker: string) => void
}) {
  const qc = useQueryClient()
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const cancel = async (id: string) => {
    setCancelling(id)
    try {
      await api.cancelJob(id)
      await qc.invalidateQueries({ queryKey: ['jobs'] })
    } finally {
      setCancelling(null)
    }
  }

  const remove = async (id: string) => {
    setDeleting(id)
    try {
      await api.deleteJob(id)
      await qc.invalidateQueries({ queryKey: ['jobs'] })
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 p-6 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> 加载任务…
        </CardContent>
      </Card>
    )
  }
  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-6 text-muted-foreground">
          <Terminal className="size-5" />
          暂无任务。提交分析后实时进度会显示在这里。
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="size-4" /> 任务队列（{jobs.length}）
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {jobs.map((j) => (
          <div key={j.id} className="flex items-center gap-3 rounded-lg border p-2.5">
            <Badge variant={jobBadge(j.status)} className="w-20 justify-center">
              {j.status === 'cancelling' ? '取消中' : j.status}
            </Badge>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="truncate">{j.ticker}</span>
                <span className="text-xs text-muted-foreground">{j.mode}</span>
                {j.depth && (
                  <span className="rounded bg-muted px-1 text-[10px] text-muted-foreground">{j.depth}</span>
                )}
                {j.school && (
                  <span className="rounded bg-primary/10 px-1 text-[10px] text-primary">{j.school} 派</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {j.status === 'error' ? (j.error ?? '失败') : `${j.log_len ?? 0} 字符日志`}
              </div>
            </div>
            {j.status === 'done' && j.report_url && (
              <Button size="sm" variant="outline" onClick={() => onOpen(j.ticker)}>
                <FileText className="size-3.5" /> 查看
              </Button>
            )}
            {j.status === 'done' && j.remote && j.remote_url && (
              <Button size="sm" variant="secondary" asChild>
                <a href={j.remote_url} target="_blank" rel="noreferrer">
                  <Globe className="size-3.5" /> 公网
                </a>
              </Button>
            )}
            {(j.status === 'running' || j.status === 'queued' || (j.status === 'done' && j.remote)) && (
              <Button size="sm" variant="ghost" onClick={() => cancel(j.id)} disabled={cancelling === j.id}>
                <Ban className="size-3.5" /> {j.remote ? '停止' : '取消'}
              </Button>
            )}
            {j.status !== 'running' && j.status !== 'queued' && (
              <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => remove(j.id)} disabled={deleting === j.id} title="删除历史任务">
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

/** 运行中任务的实时日志轮询面板 */
function ActiveJobLogs({ jobs }: { jobs: JobInfo[] }) {
  const active = jobs.filter((j) => j.status === 'running' || j.status === 'queued')
  if (active.length === 0) return null
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Terminal className="size-4" /> 实时日志
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 rounded-md border bg-background p-3 font-mono text-xs">
          {active.map((j) => (
            <JobLogView key={j.id} jobId={j.id} />
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function JobLogView({ jobId }: { jobId: string }) {
  const [log, setLog] = useState('')
  const [since, setSince] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    const poll = async () => {
      try {
        const data = await api.jobLog(jobId, since)
        if (cancelled) return
        if (data.log) {
          setLog((prev) => prev + data.log)
          setSince(data.log_len)
        }
        if (data.status === 'done' || data.status === 'error' || data.status === 'cancelled') {
          setDone(true)
          return
        }
        timer = setTimeout(poll, 1200)
      } catch {
        if (!cancelled) timer = setTimeout(poll, 3000)
      }
    }
    poll()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [jobId, since])

  return (
    <div className="mb-2">
      <div className="mb-1 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span className="rounded bg-primary/10 px-1 py-0.5 text-primary">job {jobId.slice(0, 8)}</span>
        {done ? '· 完成' : <Loader2 className="size-3 animate-spin" />}
      </div>
      <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all">{log || '等待输出…'}</pre>
      <Separator className="my-2" />
    </div>
  )
}
