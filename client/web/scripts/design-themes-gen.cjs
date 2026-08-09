// 由 design-tokens.json 生成品牌主题 CSS（src/assets/themes.css）与注册表（src/lib/themes.ts）
// 适配：Pantheon 客户端 · 输出到 client/web/src/assets/ 与 client/web/src/lib/
const fs = require('fs')
const path = require('path')

const tokens = JSON.parse(fs.readFileSync(path.join(__dirname, 'design-tokens.json'), 'utf8'))

// 文档格式 DESIGN.md 的品牌手工映射（primary/canvas/ink/muted/border/font/radius/on-primary/darkBg）
const MANUAL = {
  kraken: { primary: '#7132f5', canvas: '#ffffff', ink: '#101114', muted: '#9497a9', border: '#dedee5', font: "'Kraken-Brand','IBM Plex Sans',system-ui,sans-serif", radius: '0.75rem' },
  spotify: { primary: '#1DB954', canvas: '#ffffff', ink: '#191414', muted: '#6b6b6b', border: '#e0e0e0', font: "'Circular','Helvetica Neue',system-ui,sans-serif", radius: '0.75rem', onPrimary: '#000000', darkBg: '#121212' },
  tesla: { primary: '#E82127', canvas: '#ffffff', ink: '#171a20', muted: '#5c5e62', border: '#e2e3e3', font: "'Gotham','Arial',system-ui,sans-serif", radius: '0.125rem' },
  starbucks: { primary: '#00754A', canvas: '#ffffff', ink: '#1e3932', muted: '#4f6b5f', border: '#d9e2dd', font: "'SoDoSans','Helvetica Neue',sans-serif", radius: '0.625rem' },
  sanity: { primary: '#F03E2F', canvas: '#ffffff', ink: '#121923', muted: '#6e7683', border: '#e4e8ed', font: "'Inter','system-ui',sans-serif", radius: '0.125rem' },
  runwayml: { primary: '#000000', canvas: '#ffffff', ink: '#000000', muted: '#666666', border: '#e0e0e0', font: "'Inter',system-ui,sans-serif", radius: '0.875rem' },
  'nintendo-2001': { primary: '#6A5ACD', canvas: '#ffffff', ink: '#222222', muted: '#777777', border: '#c8c8c8', font: "'Trebuchet MS',system-ui,sans-serif", radius: '0rem' },
  mastercard: { primary: '#EB001B', canvas: '#ffffff', ink: '#1a1a1a', muted: '#666666', border: '#e5e5e5', font: "'Inter',system-ui,sans-serif", radius: '0.625rem' },
  lamborghini: { primary: '#FFD100', canvas: '#ffffff', ink: '#101010', muted: '#555555', border: '#e0e0e0', font: "'Barlow',system-ui,sans-serif", radius: '0.125rem', onPrimary: '#000000' },
  lovable: { primary: '#FF7000', canvas: '#ffffff', ink: '#1a1a1a', muted: '#6b6b6b', border: '#e8e8e8', font: "'Inter',system-ui,sans-serif", radius: '0.875rem' },
  theverge: { primary: '#000000', canvas: '#ffffff', ink: '#000000', muted: '#5a5a5a', border: '#e0e0e0', font: "'Miller Daily',Georgia,serif", radius: '0rem', darkBg: '#0a0a0a' }
}

function parseHex(hex) {
  const h = hex.replace('#', '')
  if (h.length === 3) return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function luminance(hex) {
  const [r, g, b] = parseHex(hex)
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function onColor(hex) {
  return luminance(hex) > 150 ? '#000000' : '#ffffff'
}

function inferRadius(t) {
  const hits = t.radiusHits
  if (t.styleHints.brutal || t.styleHints.sharp || (hits.none || 0) >= 5) return '0rem'
  if ((hits.pill || 0) >= 4 && (hits.md || 0) <= 3) return '0.875rem'
  if ((hits.lg || 0) >= 6 || (hits.xl || 0) >= 3) return '0.75rem'
  if ((hits.md || 0) >= 5 || (hits.sm || 0) >= 3) return '0.625rem'
  return '0.5rem'
}

// 从 frontmatter 颜色映射到 shadcn token
function buildTokens(t) {
  const manual = MANUAL[t.id]
  const c = t.colors
  const primary = manual?.primary || c.primary || '#0f172a'
  const canvas = manual?.canvas || c.canvas || c['surface-card'] || '#ffffff'
  const ink = manual?.ink || c.ink || c.body || '#111827'
  const muted = manual?.muted || c.muted || '#6b7280'
  const border = manual?.border || c['border-strong'] || c.hairline || '#e5e7eb'
  const soft = c['surface-soft'] || c['surface-strong'] || '#f5f5f5'
  const strong = c['surface-strong'] || '#ececec'
  const onPrimary = manual?.onPrimary || c['on-primary'] || '#ffffff'
  const font = manual?.font || (t.font ? `'${t.font.split(',')[0].replace(/'/g, '')}',system-ui,sans-serif` : 'ui-sans-serif,system-ui,sans-serif')
  const darkBg = manual?.darkBg || '#0a0a0c'
  const accent = c.green || c['signature-coral'] || c.orange || primary
  const radius = manual?.radius || inferRadius(t)

  return { primary, canvas, ink, muted, border, soft, strong, onPrimary, font, darkBg, accent, radius }
}

const css = []
const registry = []

for (const t of tokens) {
  const b = buildTokens(t)
  const id = t.id
  const name = (t.name || id).replace(/-design-analysis$/i, '').replace(/-/g, ' ')
  const darkOnPrimary = onColor(b.primary)

  registry.push({
    id,
    name: id,
    label: name,
    primary: b.primary,
    darkBg: b.darkBg
  })

  const lightVars = `--background: ${b.canvas};
  --foreground: ${b.ink};
  --card: ${b.canvas};
  --card-foreground: ${b.ink};
  --popover: ${b.canvas};
  --popover-foreground: ${b.ink};
  --primary: ${b.primary};
  --primary-foreground: ${b.onPrimary};
  --secondary: ${b.soft};
  --secondary-foreground: ${b.ink};
  --muted: ${b.soft};
  --muted-foreground: ${b.muted};
  --accent: ${b.strong};
  --accent-foreground: ${b.ink};
  --destructive: #ef4444;
  --border: ${b.border};
  --input: ${b.border};
  --ring: ${b.primary};
  --radius: ${b.radius};
  --font-sans: ${b.font};
  --chart-1: ${b.primary};
  --chart-2: ${b.accent};
  --chart-3: ${b.muted};
  --chart-4: ${b.soft};
  --chart-5: ${b.ink};`

  const darkVars = `--background: ${b.darkBg};
  --foreground: #ededf0;
  --card: #141416;
  --card-foreground: #ededf0;
  --popover: #141416;
  --popover-foreground: #ededf0;
  --primary: ${b.primary};
  --primary-foreground: ${darkOnPrimary};
  --secondary: #1f1f23;
  --secondary-foreground: #ededf0;
  --muted: #1f1f23;
  --muted-foreground: #9d9da6;
  --accent: #1f1f23;
  --accent-foreground: #ededf0;
  --destructive: #ef4444;
  --border: rgba(255,255,255,0.12);
  --input: rgba(255,255,255,0.15);
  --ring: ${b.primary};
  --radius: ${b.radius};
  --font-sans: ${b.font};
  --chart-1: ${b.primary};
  --chart-2: ${b.accent};
  --chart-3: #9d9da6;
  --chart-4: #1f1f23;
  --chart-5: #ededf0;`

  css.push(`/* ${id} — ${name} */
.theme-${id} {
${lightVars}
}
.theme-${id}.dark {
${darkVars}
}`)
}

// default 主题：保留现有 :root/.dark（此处仅注册条目）
registry.unshift({ id: 'default', name: 'default', label: '默认 (shadcn)', primary: '#0f172a', darkBg: '#09090b' })

const cssContent = `/* 自动生成：skills/design 品牌主题（${css.length} 套）—— 由 scripts/design-themes-gen.cjs 生成 */
/* 用法：在 <html> 上挂 .theme-<id> class（浅色）或 .theme-<id>.dark（深色）即可切换品牌色板 */
${css.join('\n\n')}
`
const assetsDir = path.join(__dirname, '..', 'src', 'assets')
const libDir = path.join(__dirname, '..', 'src', 'lib')
fs.mkdirSync(assetsDir, { recursive: true })
fs.writeFileSync(path.join(assetsDir, 'themes.css'), cssContent)

const tsContent = `// 自动生成：主题注册表（供主题切换 UI 使用）—— 由 scripts/design-themes-gen.cjs 生成
export interface ThemeDef {
  id: string
  name: string
  label: string
  primary: string
  darkBg: string
}

export const themes: ThemeDef[] = ${JSON.stringify(registry, null, 2)}

export const themeById = (id: string) => themes.find((t) => t.id === id)
`
fs.writeFileSync(path.join(libDir, 'themes.ts'), tsContent)

console.log('generated', css.length, 'themes -> src/assets/themes.css + src/lib/themes.ts')
