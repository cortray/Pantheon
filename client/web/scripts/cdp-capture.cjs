// 通过 CDP 抓取页面 console / 异常信息
const http = require('http')

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = ''
      res.on('data', (c) => (d += c))
      res.on('end', () => resolve(JSON.parse(d)))
    }).on('error', reject)
  })
}

;(async () => {
  const targets = await getJson('http://127.0.0.1:9222/json')
  const page = targets.find((t) => t.type === 'page')
  if (!page) {
    console.log('no page target')
    return
  }
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  let id = 0
  const pending = {}
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const mid = ++id
      pending[mid] = resolve
      ws.send(JSON.stringify({ id: mid, method, params }))
    })

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending[msg.id]) {
      pending[msg.id](msg.result)
      delete pending[msg.id]
    } else if (msg.method === 'Runtime.consoleAPICalled') {
      const args = (msg.params.args || []).map((a) => a.value ?? a.description ?? '').join(' ')
      console.log('[console]', msg.params.type, ':', args.slice(0, 400))
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails
      console.log('[exception]', JSON.stringify(d).slice(0, 900))
    } else if (msg.method === 'Log.entryAdded') {
      console.log('[log]', msg.params.entry.level, ':', (msg.params.entry.text || '').slice(0, 300))
    }
  }

  ws.onopen = async () => {
    await send('Runtime.enable')
    await send('Log.enable')
    await send('Page.enable')
    // 重新加载页面捕获完整错误
    await send('Page.reload')
    setTimeout(() => {
      console.log('--- done ---')
      process.exit(0)
    }, 12000)
  }
})()
