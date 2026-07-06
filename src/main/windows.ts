import { BrowserWindow, shell } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
import { existsSync } from 'fs'
import { APP_NAME, openDevtools, WEBUI_URL } from '@shared/env'

let controlWindow: BrowserWindow | null = null
let chatWindow: BrowserWindow | null = null

function getPreloadPath(): string {
  const js = join(__dirname, '../preload/index.js')
  const mjs = join(__dirname, '../preload/index.mjs')
  if (existsSync(js)) return js
  return mjs
}

export function createControlWindow(): BrowserWindow {
  if (controlWindow && !controlWindow.isDestroyed()) {
    controlWindow.focus()
    return controlWindow
  }

  controlWindow = new BrowserWindow({
    width: 480,
    height: 640,
    resizable: false,
    show: false,
    title: APP_NAME,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  controlWindow.webContents.on('preload-error', (_event, preloadPath, error) => {
    console.error(`Preload failed (${preloadPath}):`, error)
  })

  controlWindow.webContents.on('did-fail-load', (_event, code, description, url) => {
    console.error(`Failed to load ${url}: [${code}] ${description}`)
  })

  controlWindow.once('ready-to-show', () => {
    controlWindow?.show()
    if (openDevtools) {
      controlWindow?.webContents.openDevTools()
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    controlWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    controlWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  controlWindow.on('closed', () => {
    controlWindow = null
  })

  return controlWindow
}

export function openChatWindow(): BrowserWindow {
  if (chatWindow && !chatWindow.isDestroyed()) {
    chatWindow.focus()
    return chatWindow
  }

  chatWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: `${APP_NAME} Chat`,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  chatWindow.loadURL(WEBUI_URL)

  chatWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  chatWindow.on('closed', () => {
    chatWindow = null
  })

  return chatWindow
}

export function closeChatWindow(): void {
  if (chatWindow && !chatWindow.isDestroyed()) {
    chatWindow.close()
    chatWindow = null
  }
}

export function getControlWindow(): BrowserWindow | null {
  return controlWindow
}

export function getChatWindow(): BrowserWindow | null {
  return chatWindow
}
