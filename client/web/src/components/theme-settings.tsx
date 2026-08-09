import { useMemo, useState } from 'react'
import { Check, Monitor, Moon, Palette, Search, Sun } from 'lucide-react'
import { themes } from '@/lib/themes'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

export function ThemeSettings() {
  const { theme, setTheme, themeId, setThemeId } = useTheme()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return themes
    return themes.filter(
      (t) => t.label.toLowerCase().includes(query) || t.id.toLowerCase().includes(query),
    )
  }, [q])

  const modeOptions = [
    { id: 'light' as const, label: '浅色', icon: Sun },
    { id: 'dark' as const, label: '深色', icon: Moon },
    { id: 'system' as const, label: '跟随系统', icon: Monitor },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs text-muted-foreground">
          <Palette className="size-3.5" />
          主题设置
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>主题设置</DialogTitle>
          <DialogDescription>
            skills/design 品牌色板（{themes.length} 套）· 深浅模式独立生效
          </DialogDescription>
        </DialogHeader>

        {/* 明暗切换 */}
        <div className="grid grid-cols-3 gap-2">
          {modeOptions.map((m) => (
            <Button
              key={m.id}
              variant={theme === m.id ? 'default' : 'outline'}
              size="sm"
              className="justify-center gap-2"
              onClick={() => setTheme(m.id)}
            >
              <m.icon className="size-3.5" />
              {m.label}
            </Button>
          ))}
        </div>

        <Separator />

        {/* 品牌主题搜索 */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input placeholder="搜索品牌…（如 linear / stripe / claude）" className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <ScrollArea className="h-64 rounded-md border">
          <div className="grid grid-cols-2 gap-1.5 p-2 sm:grid-cols-3">
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => setThemeId(t.id)}
                className={cn(
                  'group flex items-center gap-2 rounded-md border px-2.5 py-2 text-left text-xs transition-colors',
                  themeId === t.id
                    ? 'border-primary bg-primary/10'
                    : 'hover:bg-accent',
                )}
              >
                <span
                  className="size-3.5 shrink-0 rounded-full border"
                  style={{ backgroundColor: t.primary }}
                  title={t.primary}
                />
                <span className="min-w-0 flex-1 truncate font-medium">{t.label}</span>
                {themeId === t.id && <Check className="size-3.5 shrink-0 text-primary" />}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-6 text-center text-sm text-muted-foreground">
                没有匹配的主题
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <Badge variant="outline">当前：{themes.find((t) => t.id === themeId)?.label ?? themeId}</Badge>
          <span>由 skills/design/ 自动生成 · scripts/design-themes-gen.cjs</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
