// ── API client：fetch 封装 + 错误规范化 ──
import type {
  AnalyzeRequest,
  CacheStock,
  CommandDoc,
  Dimensions,
  HealthInfo,
  JobInfo,
  JobLog,
  PanelSummary,
  ReportMeta,
  SkillInfo,
  StockDetail,
} from './types'

const BASE = import.meta.env.VITE_API_BASE ?? ''

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
  } catch (e) {
    throw new ApiError(0, `网络错误：无法连接后端服务（${(e as Error).message}）`)
  }
  if (!res.ok) {
    let msg = `请求失败 (${res.status})`
    try {
      const body = (await res.json()) as { error?: string }
      if (body.error) msg = body.error
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, msg)
  }
  return (await res.json()) as T
}

export const api = {
  health: () => request<HealthInfo>('/api/health'),
  reports: () => request<{ reports: ReportMeta[] }>('/api/reports'),
  cache: () => request<{ stocks: CacheStock[] }>('/api/cache'),
  stock: (ticker: string) => request<StockDetail>(`/api/stocks/${encodeURIComponent(ticker)}`),
  panel: (ticker: string) => request<{ investors: unknown[] }>(`/api/panel/${encodeURIComponent(ticker)}`),
  dimensions: (ticker: string) => request<Dimensions>(`/api/dimensions/${encodeURIComponent(ticker)}`),
  rawDims: (ticker: string, dims: string[]) =>
    request<Record<string, unknown>>(
      `/api/raw/${encodeURIComponent(ticker)}?dims=${encodeURIComponent(dims.join(','))}`,
    ),
  jobs: () => request<{ jobs: JobInfo[] }>('/api/jobs'),
  jobLog: (id: string, since = 0) =>
    request<JobLog>(`/api/jobs/${encodeURIComponent(id)}?since=${since}`),
  cancelJob: (id: string) =>
    request<{ id: string; status: string }>(`/api/jobs/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
    }),
  deleteJob: (id: string) =>
    request<{ id: string; deleted: boolean }>(`/api/jobs/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
  analyze: (body: AnalyzeRequest) =>
    request<{ job_id: string; status: string }>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  commands: () => request<{ commands: Array<{ name: string; file: string; size: number }> }>('/api/commands'),
  command: (name: string) => request<CommandDoc>(`/api/commands/${encodeURIComponent(name)}`),
  skills: () => request<{ skills: SkillInfo[] }>('/api/skills'),
}

/** 面板摘要快捷函数（StockDetail 已含 panel_summary） */
export function signalLabel(s: string): string {
  const map: Record<string, string> = {
    bullish: '看多',
    neutral: '中性',
    bearish: '看空',
    skip: '跳过',
  }
  return map[s] ?? s
}

export function signalClass(s: string): string {
  if (s === 'bullish') return 'text-emerald-600 dark:text-emerald-400'
  if (s === 'bearish') return 'text-red-600 dark:text-red-400'
  if (s === 'neutral') return 'text-amber-600 dark:text-amber-400'
  return 'text-muted-foreground'
}
