/**
 * UZI-Skill 桌面客户端 · Electron 主进程
 *
 * 职责：
 *  1. 探测 Python 运行时（env UZI_PYTHON → conda uzi-skill → PATH）
 *  2. 以子进程启动 server.py（托管前端 + API + 报告）
 *  3. 健康轮询就绪后创建 BrowserWindow 加载后端 URL
 *  4. 退出时清理 Python 子进程树
 */
const { app, BrowserWindow, dialog, shell } = require('electron')
const { spawn, execFile, spawnSync } = require('child_process')
const path = require('path')
const http = require('http')
const fs = require('fs')

const isPackaged = app.isPackaged

// 调试日志文件（打包版排查用）
const LOG_FILE = path.join(app.getPath('userData'), 'uzi-electron.log')
function log(msg) {
  try {
    fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${msg}\n`)
  } catch {
    /* ignore */
  }
  console.log(msg)
}
process.on('uncaughtException', (e) => log('uncaughtException: ' + (e && e.stack ? e.stack : e)))
process.on('unhandledRejection', (e) => log('unhandledRejection: ' + e))

// 引擎根：打包后 = resources/engine；开发 = 仓库根
const ENGINE_ROOT = isPackaged
  ? path.join(process.resourcesPath, 'engine')
  : path.join(__dirname, '..', '..') // client/electron/main.js -> 仓库根
const SERVER_PY = isPackaged
  ? path.join(ENGINE_ROOT, 'server.py')
  : path.join(ENGINE_ROOT, 'client', 'server.py')

let pythonProc = null
let mainWindow = null
let port = 8787

/** 候选 Python 解释器（优先级从高到低） */
function candidatePythons() {
  const list = []
  const env = process.env.UZI_PYTHON
  if (env) list.push(env)
  // conda 环境探测（Windows 常见路径）
  for (const base of [
    process.env.CONDA_PREFIX,
    path.join(process.env.USERPROFILE || '', 'anaconda3'),
    path.join(process.env.USERPROFILE || '', 'miniconda3'),
    'D:\\software\\anaconda3',
    'C:\\ProgramData\\anaconda3',
  ]) {
    if (base) list.push(path.join(base, 'envs', 'uzi-skill', 'python.exe'))
    if (base) list.push(path.join(base, 'python.exe'))
  }
  list.push('python')
  list.push('python3')
  return list
}

/** 检查 python 是否存在且可用 */
function pythonAvailable(py) {
  try {
    if (fs.existsSync(py)) return true
    if (py === 'python' || py === 'python3') {
      // PATH 命令探测
      const r = spawnSync(py, ['-c', 'import sys; print(sys.version)'], {
        timeout: 5000,
        stdio: 'pipe',
        encoding: 'utf-8',
        windowsHide: true,
      })
      return r.status === 0 && (r.stdout || '').includes('3.')
    }
  } catch {
    /* ignore */
  }
  return false
}

/** 探测可用端口（异步） */
function findPort(start) {
  const net = require('net')
  return (async () => {
    for (let p = start; p < start + 10; p++) {
      const free = await new Promise((resolve) => {
        const srv = net.createServer()
        srv.once('error', () => resolve(false))
        srv.once('listening', () => srv.close(() => resolve(true)))
        srv.listen(p, '127.0.0.1')
      })
      if (free) return p
    }
    return start
  })()
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: 3000 }, (res) => {
      let data = ''
      res.on('data', (c) => (data += c))
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch {
          reject(new Error('bad json'))
        }
      })
    })
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('timeout'))
    })
  })
}

/** 等待后端健康（最长 90s） */
async function waitHealthy(url, timeoutMs = 90000) {
  const deadline = Date.now() + timeoutMs
  let lastErr = null
  while (Date.now() < deadline) {
    try {
      const body = await httpGetJson(url)
      if (body && body.ok) return body
    } catch (e) {
      lastErr = e
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw lastErr || new Error('backend timeout')
}

function killPythonProc() {
  if (!pythonProc) return
  try {
    if (process.platform === 'win32' && pythonProc.pid) {
      execFile('taskkill', ['/pid', String(pythonProc.pid), '/T', '/F'])
    } else {
      pythonProc.kill('SIGTERM')
    }
  } catch {
    /* ignore */
  }
  pythonProc = null
}

async function startBackend() {
  // 1. 找 Python
  let py = null
  for (const cand of candidatePythons()) {
    if (pythonAvailable(cand)) {
      py = cand
      break
    }
  }
  if (!py) {
    log('python not found')
    dialog.showErrorBox(
      'Python 运行时未找到',
      '未找到可用的 Python 3.10+ 环境。\n\n请安装 Python 并执行：\n  pip install -r requirements.txt\n\n或在环境变量 UZI_PYTHON 中指定 Python 路径。',
    )
    app.quit()
    return
  }
  log('using python: ' + py)

  // 2. 端口
  port = await findPort(8787)
  log('port: ' + port)

  // 3. 启动后端
  if (!fs.existsSync(SERVER_PY)) {
    log('server.py missing: ' + SERVER_PY)
    dialog.showErrorBox('后端文件缺失', '找不到 ' + SERVER_PY + '\n请重新构建前端：cd client/web && npm run build')
    app.quit()
    return
  }
  const env = {
    ...process.env,
    PYTHONIOENCODING: 'utf-8',
    PYTHONUNBUFFERED: '1',
    UZI_NO_AUTO_OPEN: '1',
  }
  if (isPackaged) {
    env.UZI_ENGINE_ROOT = ENGINE_ROOT
    // 报告目录指向可写的用户数据目录，并把打包内置报告首次迁移过去
    const userReports = path.join(app.getPath('userData'), 'reports')
    fs.mkdirSync(userReports, { recursive: true })
    const builtinReports = path.join(ENGINE_ROOT, 'skills', 'deep-analysis', 'scripts', 'reports')
    try {
      if (fs.existsSync(builtinReports)) {
        for (const entry of fs.readdirSync(builtinReports)) {
          const src = path.join(builtinReports, entry)
          const dst = path.join(userReports, entry)
          if (!fs.existsSync(dst) && fs.statSync(src).isDirectory()) {
            fs.cpSync(src, dst, { recursive: true })
            log('[reports] migrated builtin -> ' + dst)
          }
        }
      }
    } catch (e) {
      log('[reports] migrate skip: ' + e.message)
    }
    env.UZI_REPORTS_DIR = userReports
    log('[reports] dir = ' + userReports)
  }

  pythonProc = spawn(py, [SERVER_PY, '--port', String(port), '--no-browser'], {
    cwd: path.dirname(SERVER_PY),
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  pythonProc.stdout.on('data', (d) => {
    // 过滤后端 banner 的装饰性框线（U+2500-257F）与空行，保留有用输出
    for (const line of String(d).split(/\r?\n/)) {
      const t = line.trim()
      if (!t) continue
      if (!t.replace(/[\u2500-\u257F]/g, '').trim()) continue // 纯框线行
      log('[py] ' + t)
    }
  })
  pythonProc.stderr.on('data', (d) => log('[py-err] ' + String(d).trimEnd()))
  pythonProc.on('exit', (code) => {
    log('[py] exited ' + code)
    pythonProc = null
  })

  // 4. 等待就绪
  try {
    const health = await waitHealthy('http://127.0.0.1:' + port + '/api/health')
    log('[backend] ready at ' + port + ' python_ok=' + health.python_ok)
  } catch (e) {
    log('[backend] fail: ' + e.message)
    dialog.showErrorBox(
      '后端启动失败',
      'Python 后端未能就绪：' + e.message + '\n\n请确认已安装依赖：\npip install -r requirements.txt',
    )
    app.quit()
    return
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#09090b',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })
  mainWindow.on('ready-to-show', () => mainWindow && mainWindow.show())
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 外部链接（报告新窗口等）交给系统浏览器
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  const devUrl = process.env.UZI_DEV_URL
  if (devUrl) {
    mainWindow.loadURL(devUrl)
  } else {
    mainWindow.loadURL('http://127.0.0.1:' + port + '/')
  }
  log('window -> http://127.0.0.1:' + port + '/')
}

app.whenReady().then(async () => {
  log('app ready')
  await startBackend()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  killPythonProc()
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  killPythonProc()
})
