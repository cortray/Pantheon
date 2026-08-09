// 解析 skills/design/*/DESIGN.md 的 frontmatter（colors / typography）与正文风格特征
// 适配：Pantheon 客户端 · 读取仓库根 skills/design/ · 输出 design-tokens.json
const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, '..', '..', '..', 'skills', 'design')
const out = []

for (const entry of fs.readdirSync(dir)) {
  const file = path.join(dir, entry, 'DESIGN.md')
  if (!fs.existsSync(file)) continue
  const raw = fs.readFileSync(file, 'utf8')

  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/)
  const fm = fmMatch ? fmMatch[1] : ''

  const name = fm.match(/^name:\s*(.+)$/m)?.[1]?.trim() || entry
  const descRaw = fm.match(/^description:\s*(.+)$/m)?.[1]?.trim() || ''

  // colors 块：从 colors: 到下一个顶层键（typography 等），逐行解析 2 空格缩进键值对
  const colors = {}
  const colorsIdx = fm.indexOf('colors:')
  if (colorsIdx !== -1) {
    const rest = fm.slice(colorsIdx + 7)
    const block = rest.split(/\n\S/)[0] // 顶层键（行首非空白）截断
    for (const line of block.split('\n')) {
      const m = line.match(/^\s{2}([\w-]+):\s*["']?([^"'\s,]+)["']?\s*$/)
      if (m) colors[m[1]] = m[2]
    }
  }

  let font = ''
  const fontMatch = fm.match(/fontFamily:\s*"([^"]+)"/)
  if (fontMatch) font = fontMatch[1]

  const body = raw.slice(fmMatch ? fmMatch[0].length : 0)
  const radiusHits = {}
  for (const m of body.matchAll(/\{rounded\.([\w-]+)\}/g)) radiusHits[m[1]] = (radiusHits[m[1]] || 0) + 1
  const styleHints = {
    pill: /pill/i.test(body),
    glass: /glassmorph|glass morph|backdrop-blur/i.test(body),
    brutal: /brutalist|brutalism/i.test(body),
    sharp: /sharp|square corner|hard corner/i.test(body),
    gradient: /gradient/i.test(body),
    minimal: /minimal/i.test(body),
    neon: /neon/i.test(body)
  }

  out.push({ id: entry, name, desc: descRaw.slice(0, 200), font, colors, radiusHits, styleHints })
}

fs.writeFileSync(path.join(__dirname, 'design-tokens.json'), JSON.stringify(out, null, 1))
const low = out.filter((t) => Object.keys(t.colors).length < 4)
console.log('parsed', out.length, 'designs; low-color:', low.map((t) => t.id).join(', ') || 'none')
