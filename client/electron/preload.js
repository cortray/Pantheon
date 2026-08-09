// UZI-Skill 桌面客户端 · preload
// 最小暴露：引擎信息（渲染进程仍主要通过 /api/* HTTP 通信）
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('uzi', {
  isDesktop: true,
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
})
