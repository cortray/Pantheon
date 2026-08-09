// ── 与 client/server.py API 对应的类型定义 ──

export interface HealthInfo {
  ok: boolean
  service: string
  python: string
  python_ok: boolean
  reports_dir: string
  cache_dir: string
  max_concurrent_jobs: number
  version: string
}

export interface ReportMeta {
  id: string
  ticker: string
  date: string
  mtime: string
  size_kb: number
  url: string
  standalone: boolean
}

export interface CacheStock {
  ticker: string
  name: string
  overall_score: number | null
  verdict_label: string | null
  fundamental_score: number | null
  panel_consensus: number | null
  style: string | null
  agent_reviewed: boolean
  school_lock: string | null
  mtime: string
  has_panel: boolean
  has_dimensions: boolean
}

export interface PanelSummary {
  n_investors: number
  signal_distribution: Record<string, number>
  vote_distribution?: Record<string, number>
  panel_consensus?: number
  school_scores?: Record<string, SchoolScore>
  top_bull: Array<{ name?: string; score?: number; headline?: string }>
  top_bear: Array<{ name?: string; score?: number; headline?: string }>
}

export interface SchoolScore {
  group: string
  label: string
  desc: string
  n_members: number
  n_active: number
  consensus: number
  avg_score: number
  score_mean: number
  verdict: string
  bullish: number
  neutral: number
  bearish: number
  skip: number
  dominant_signal: string
}

export interface InstitutionalModeling {
  dcf_intrinsic?: number | null
  dcf_safety_margin_pct?: number | null
  dcf_verdict?: string | null
  lbo_irr_pct?: number | null
  lbo_verdict?: string | null
  comps_verdict?: string | null
  initiating_rating?: string | null
  target_price?: number | null
  upside_pct?: number | null
  ic_recommendation?: string | null
  bcg_position?: string | null
  industry_attractiveness?: number | null
}

export interface GreatDivide {
  punchline?: string
  bull_avatar?: string
  bear_avatar?: string
  bull_score?: number
  bear_score?: number
  bull_signal?: string
  bear_signal?: string
  bull_say_rounds?: string[]
  bear_say_rounds?: string[]
}

export interface DimScore {
  score: number
  weight: number
  label: string
  reasons_pass?: string[]
  reasons_fail?: string[]
}

export interface StockDetail {
  ticker: string
  name: string
  synthesis: Synthesis
  dimensions: Dimensions | null
  panel_summary: PanelSummary
}

export interface Dimensions {
  fundamental_score: number
  dimensions: Record<string, DimScore>
}

export interface Synthesis {
  ticker: string
  name?: string
  overall_score: number
  verdict_label: string
  verdict_detail?: string
  fundamental_score: number
  panel_consensus: number
  school_lock?: string | null
  school_scores?: Record<string, SchoolScore>
  dim_commentary?: Record<string, string>
  institutional_modeling?: InstitutionalModeling
  detected_style?: string
  style_label_cn?: string
  style_explanation?: string
  agent_reviewed?: boolean
  panel_insights?: string
  great_divide?: GreatDivide
  debate?: unknown
  risks?: string[]
  buy_zones?: Record<string, { zone: string; logic: string; trigger: string }>
  friendly?: unknown
  fund_managers?: unknown
  dashboard?: {
    core_conclusion?: string
    data_perspective?: string
    intelligence?: string
    battle_plan?: string
  }
  data_gaps?: {
    coverage_pct?: number
    total_gaps?: number
    unresolved?: number
    tasks?: Array<{ dim: string; field: string; label: string; severity: string; status: string }>
  }
}

export interface JobInfo {
  id: string
  status: 'queued' | 'running' | 'done' | 'error' | 'cancelled' | 'cancelling'
  mode: string
  ticker: string
  depth?: string
  school?: string
  report_url?: string
  remote_url?: string
  remote?: boolean
  error?: string
  created_at?: string
  started_at?: string
  finished_at?: string
  log_len?: number
}

export interface JobLog {
  id: string
  status: string
  exit_code?: number
  report_url?: string
  error?: string
  log: string
  log_len: number
  created_at?: string
  started_at?: string
  finished_at?: string
}

export interface CommandDoc {
  name: string
  content: string
}

export interface SkillInfo {
  name: string
  has_skill: boolean
  description: string
}

// ── 提交分析请求 ──

export interface AnalyzeRequest {
  mode: 'single' | 'versus' | 'portfolio'
  ticker?: string
  tickers?: string[]
  portfolio_csv?: string
  depth: 'lite' | 'medium' | 'deep'
  school?: string
  no_resume?: boolean
  remote?: boolean
  install_cloudflared?: boolean
  output_dir?: string
}
