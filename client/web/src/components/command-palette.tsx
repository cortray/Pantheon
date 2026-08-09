import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  ChartColumn,
  FolderOpen,
  Gauge,
  LineChart,
  Play,
  RefreshCcw,
  Search,
  Sun,
  Moon,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { api } from '@/lib/api'
import { themes } from '@/lib/themes'
import { useTheme } from '@/components/theme-provider'
import { Badge } from '@/components/ui/badge'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PAGES = [
  { id: '/', label: '仪表盘', icon: Gauge },
  { id: '/analyze', label: '分析中心', icon: Play },
  { id: '/reports', label: '报告列表', icon: FolderOpen },
  { id: '/cache', label: '缓存浏览器', icon: ChartColumn },
  { id: '/docs', label: '命令文档', icon: BookOpen },
]

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { theme, setTheme, themeId, setThemeId } = useTheme()
  const [query, setQuery] = useState('')

  const cache = useQuery({ queryKey: ['cache'], queryFn: api.cache, enabled: open })

  useEffect(() => {
    if (open) setQuery('')
  }, [open])

  const close = () => onOpenChange(false)
  const go = (path: string) => {
    navigate(path)
    close()
  }

  const q = query.trim().toLowerCase()
  const stockItems = (cache.data?.stocks ?? [])
    .filter((s) => (q ? s.ticker.toLowerCase().includes(q) || (s.name ?? '').toLowerCase().includes(q) : false))
    .slice(0, 6)
  const themeItems = themes
    .filter((t) => (q ? t.id.includes(q) || t.label.toLowerCase().includes(q) : true))
    .slice(0, 8)

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="搜索页面 / 缓存股票 / 品牌主题…（↑↓ 选择，回车执行）" value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>没有找到「{query}」相关的结果</CommandEmpty>

        {/* 快捷操作（无搜索词时显示） */}
        {!q && (
          <CommandGroup heading="快捷操作">
            <CommandItem value="quick:analyze" onSelect={() => go('/analyze')}>
              <Play className="size-4 text-muted-foreground" />
              发起新分析
            </CommandItem>
            <CommandItem
              value="quick:refresh"
              onSelect={async () => {
                await qc.invalidateQueries()
                close()
              }}
            >
              <RefreshCcw className="size-4 text-muted-foreground" />
              刷新全部数据
            </CommandItem>
            <CommandItem
              value="quick:mode"
              onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="size-4 text-muted-foreground" /> : <Moon className="size-4 text-muted-foreground" />}
              切换为{theme === 'dark' ? '浅色' : '深色'}模式
            </CommandItem>
          </CommandGroup>
        )}

        <CommandGroup heading="页面">
          {PAGES.map((p) => (
            <CommandItem key={p.id} value={`page:${p.label}`} onSelect={() => go(p.id)}>
              <p.icon className="size-4 text-muted-foreground" />
              {p.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {/* 缓存股票直达（有搜索词时优先显示） */}
        {stockItems.length > 0 && (
          <CommandGroup heading="缓存股票">
            {stockItems.map((s) => (
              <CommandItem key={s.ticker} value={`stock:${s.ticker}`} onSelect={() => go(`/report/${encodeURIComponent(s.ticker)}`)}>
                <LineChart className="size-4 text-muted-foreground" />
                <span>{s.name ?? s.ticker}</span>
                <span className="ml-1 font-mono text-xs text-muted-foreground">{s.ticker}</span>
                {s.overall_score !== null && (
                  <Badge variant="outline" className="ml-auto text-[10px]">{s.overall_score}</Badge>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />
        <CommandGroup heading={`品牌主题（当前：${themes.find((t) => t.id === themeId)?.label ?? themeId}）`}>
          {themeItems.map((t) => (
            <CommandItem
              key={t.id}
              value={`theme:${t.id}`}
              onSelect={() => {
                setThemeId(t.id)
                close()
              }}
            >
              <span className="size-2.5 shrink-0 rounded-full border" style={{ backgroundColor: t.primary }} />
              <span>{t.label}</span>
              {t.id === themeId && <span className="ml-auto text-xs text-primary">当前</span>}
            </CommandItem>
          ))}
        </CommandGroup>

        {q && (
          <>
            <CommandSeparator />
            <CommandGroup heading="明暗模式">
              <CommandItem value="mode:light" onSelect={() => { setTheme('light'); close() }}>
                <Sun className="size-4 text-muted-foreground" /> 浅色
              </CommandItem>
              <CommandItem value="mode:dark" onSelect={() => { setTheme('dark'); close() }}>
                <Moon className="size-4 text-muted-foreground" /> 深色
              </CommandItem>
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <div className="px-3 py-1.5 text-[10px] text-muted-foreground">
          提示：Ctrl+K 打开/关闭 · ↑↓ 选择 · Enter 执行
        </div>
      </CommandList>
    </CommandDialog>
  )
}

// 全局快捷键钩子：Ctrl/Cmd + K
export function useCommandPaletteHotkey(
  open: boolean,
  setOpen: (v: boolean) => void,
) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(!open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])
}
