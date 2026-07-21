import { BrowserWindow } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
import { existsSync, readFileSync } from 'fs'
import { homedir } from 'os'
import { env } from '@shared/env'
import { destroyWebuiView } from './services/webui-view'

const ONBOARDING_SIZE = { width: 480, height: 640 }
const SHELL_SIZE = { width: 1200, height: 800 }

let mainWindow: BrowserWindow | null = null

function getPreloadPath(): string {
  const js = join(__dirname, '../preload/index.js')
  const mjs = join(__dirname, '../preload/index.mjs')
  if (existsSync(js)) return js
  return mjs
}

function isAlreadyInitialized(): boolean {
  try {
    const configPath = join(
      homedir(),
      'Library',
      'Application Support',
      env.APP_NAME,
      'config.json',
    )
    if (!existsSync(configPath)) return false
    const raw = readFileSync(configPath, 'utf-8')
    const cfg = JSON.parse(raw) as { initialized?: boolean }
    return cfg.initialized === true
  } catch {
    return false
  }
}

export function createMainWindow(): BrowserWindow {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.focus()
    return mainWindow
  }

  const shellMode = isAlreadyInitialized()
  const size = shellMode ? SHELL_SIZE : ONBOARDING_SIZE

  mainWindow = new BrowserWindow({
    width: size.width,
    height: size.height,
    minWidth: shellMode ? 900 : undefined,
    minHeight: shellMode ? 600 : undefined,
    resizable: shellMode,
    show: false,
    title: env.APP_NAME,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.webContents.on('preload-error', (_event, preloadPath, error) => {
    console.error(`Preload failed (${preloadPath}):`, error)
  })

  mainWindow.webContents.on('did-fail-load', (_event, code, description, url) => {
    console.error(`Failed to load ${url}: [${code}] ${description}`)
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    destroyWebuiView()
    mainWindow = null
  })

  return mainWindow
}

/** Expand and unlock resize when entering the main app shell. */
export function enterShellWindow(): void {
  const win = getMainWindow()
  if (!win || win.isDestroyed()) return

  win.setResizable(true)
  win.setMinimumSize(900, 600)
  win.setSize(SHELL_SIZE.width, SHELL_SIZE.height, true)
  win.center()
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}
