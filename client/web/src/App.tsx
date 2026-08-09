import { useEffect } from 'react'
import { Suspense, lazy, useState } from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  ChartColumn,
  FolderOpen,
  Gauge,
  LineChart,
  Moon,
  Play,
  Search,
  Sun,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'
import { ThemeSettings } from '@/components/theme-settings'
import { CommandPalette, useCommandPaletteHotkey } from '@/components/command-palette'
import { ErrorBoundary } from '@/components/error-boundary'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'

// 代码分割：每个页面独立 chunk，首屏只加载 Dashboard
const DashboardPage = lazy(() => import('@/pages/dashboard'))
const AnalyzePage = lazy(() => import('@/pages/analyze'))
const ReportPage = lazy(() => import('@/pages/report'))
const ReportsPage = lazy(() => import('@/pages/reports'))
const CachePage = lazy(() => import('@/pages/cache'))
const DocsPage = lazy(() => import('@/pages/docs'))

const NAV = [
  { to: '/', label: '仪表盘', icon: Gauge, end: true },
  { to: '/analyze', label: '分析中心', icon: Play },
  { to: '/reports', label: '报告列表', icon: FolderOpen },
  { to: '/cache', label: '缓存浏览器', icon: ChartColumn },
  { to: '/docs', label: '命令文档', icon: BookOpen },
]

function Sidebar() {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r bg-muted/30 md:flex">
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LineChart className="size-4" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold">Pantheon</div>
          <div className="text-[11px] text-muted-foreground">股票深度分析台</div>
        </div>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <Separator />
      <div className="space-y-1 p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-xs text-muted-foreground"
          onClick={() => navigate('/analyze')}
        >
          <Play className="size-3.5" />
          快速分析
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="切换明暗"
            className="size-8 shrink-0"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <ThemeSettings />
        </div>
      </div>
    </aside>
  )
}

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  useCommandPaletteHotkey(paletteOpen, setPaletteOpen)

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="mx-auto max-w-[1600px] space-y-6 p-6">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/analyze" element={<AnalyzePage />} />
                <Route path="/report/:ticker" element={<ReportPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/cache" element={<CachePage />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/docs/:name" element={<DocsPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </TooltipProvider>
  )
}
