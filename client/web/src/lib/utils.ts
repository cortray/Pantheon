import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 格式化 0-100 评分为带颜色语义的标签颜色 class */
export function scoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 65) return 'text-lime-600 dark:text-lime-400'
  if (score >= 45) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

/** verdict → badge variant */
export function verdictTone(verdict: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (/重仓|买入|强烈/.test(verdict)) return 'default'
  if (/蹲|偏多/.test(verdict)) return 'secondary'
  if (/回避|谨慎|偏空|中性/.test(verdict)) return 'destructive'
  return 'outline'
}

/** 时间戳格式化（容错） */
export function fmtTime(iso?: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('zh-CN', { hour12: false })
  } catch {
    return iso
  }
}

/** 百分比格式化 */
export function fmtPct(v?: number | string | null, digits = 1): string {
  if (v === undefined || v === null || v === '') return '—'
  const n = typeof v === 'string' ? parseFloat(v) : v
  if (Number.isNaN(n)) return String(v)
  return `${n.toFixed(digits)}%`
}
