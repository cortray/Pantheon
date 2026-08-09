import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { marked } from 'marked'
import { BookOpen, FileText, Search } from 'lucide-react'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

marked.setOptions({ gfm: true, breaks: true })

interface CommandMeta {
  name: string
  file: string
  size: number
  description?: string
  argument_hint?: string
}

// 渲染后的文档结构（标题锚点用）
interface TocItem {
  id: string
  level: number
  text: string
}

function renderMarkdown(src: string): { html: string; toc: TocItem[] } {
  try {
    // 剥离 frontmatter
    const body = src.replace(/^---\n[\s\S]*?\n---\n?/, '')
    const toc: TocItem[] = []
    const tokens = marked.lexer(body)
    const renderer = new marked.Renderer()
    const origHeading = renderer.heading.bind(renderer)
    let counter = 0
    renderer.heading = ({ tokens, depth }) => {
      const text = tokens.map((t) => ('text' in t ? t.text : '')).join('')
      const id = `h-${++counter}-${text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '')}`
      if (depth <= 3) toc.push({ id, level: depth, text })
      return `<h${depth} id="${id}">${text}</h${depth}>`
    }
    const html = marked.parser(tokens, { renderer })
    return { html, toc }
  } catch {
    return { html: `<pre>${src}</pre>`, toc: [] }
  }
}

export default function DocsPage() {
  const { name } = useParams<{ name: string }>()
  const [q, setQ] = useState('')

  const commands = useQuery({ queryKey: ['commands'], queryFn: api.commands })
  const list = (commands.data?.commands ?? []) as CommandMeta[]

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return list
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.description ?? '').toLowerCase().includes(query),
    )
  }, [list, q])

  const active = name ?? list[0]?.name

  const doc = useQuery({
    queryKey: ['command', active],
    queryFn: () => api.command(active!),
    enabled: Boolean(active),
  })

  const { html, toc } = useMemo(() => {
    if (!doc.data?.content) return { html: '', toc: [] }
    return renderMarkdown(doc.data.content)
  }, [doc.data])

  const activeMeta = list.find((c) => c.name === active)

  // 渲染后增强：给每个代码块注入复制按钮
  const articleRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const root = articleRef.current
    if (!root) return
    for (const pre of Array.from(root.querySelectorAll('pre'))) {
      if (pre.querySelector('.md-copy-btn')) continue
      const code = pre.querySelector('code')?.textContent ?? ''
      pre.style.position = 'relative'
      const btn = document.createElement('button')
      btn.className = 'md-copy-btn'
      btn.textContent = '复制'
      btn.onclick = () => {
        void navigator.clipboard.writeText(code).then(() => {
          btn.textContent = '已复制 ✓'
          setTimeout(() => (btn.textContent = '复制'), 1500)
        })
      }
      pre.appendChild(btn)
    }
  }, [html])

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">命令文档</h1>
        <p className="text-sm text-muted-foreground">
          commands/ 下的技能命令说明 · {list.length} 个命令 · 支持搜索与目录跳转
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* 命令列表 */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-4" /> 命令（{list.length}）
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="搜索命令 / 描述…"
                className="h-8 pl-8 text-xs"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {commands.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">没有匹配的命令</p>
            ) : (
              <ScrollArea className="h-[62vh]">
                <div className="space-y-1">
                  {filtered.map((c) => (
                    <Button
                      key={c.name}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'h-auto w-full justify-start gap-2 whitespace-normal py-2 text-left',
                        active === c.name && 'bg-primary/10 text-primary',
                      )}
                      asChild
                    >
                      <Link to={`/docs/${c.name}`}>
                        <FileText className="mt-0.5 size-3.5 shrink-0" />
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-medium">{c.name}</span>
                          {c.description && (
                            <span className="block truncate text-[10px] font-normal text-muted-foreground">
                              {c.description}
                            </span>
                          )}
                        </span>
                      </Link>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* 文档内容 */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">{active ?? '选择命令'}</CardTitle>
              {activeMeta?.argument_hint && (
                <Badge variant="outline" className="font-mono text-[10px]">
                  {activeMeta.argument_hint}
                </Badge>
              )}
              {activeMeta?.description && (
                <CardDescription className="w-full">{activeMeta.description}</CardDescription>
              )}
            </div>
            {toc.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {toc.slice(0, 12).map((t) => (
                  <a
                    key={t.id}
                    href={`#${t.id}`}
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                      t.level > 2 && 'ml-1.5',
                    )}
                  >
                    {t.text}
                  </a>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!active ? (
              <p className="py-8 text-center text-sm text-muted-foreground">左侧选择命令查看文档。</p>
            ) : doc.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : doc.isError ? (
              <p className="text-sm text-red-500">加载失败：{(doc.error as Error)?.message}</p>
            ) : (
              <ScrollArea className="h-[62vh]">
                <article
                  ref={articleRef}
                  className="md-body"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
