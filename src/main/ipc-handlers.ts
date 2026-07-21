import { ipcMain, dialog, app, type BrowserWindow } from 'electron'
import { join } from 'path'
import { IPC } from '@shared/ipc-channels'
import { env } from '@shared/env'
import type { ViewBounds } from '@shared/types'
import { getStackManager } from './stack'
import {
  destroyWebuiView,
  hideWebuiView,
  setWebuiViewBounds,
  showWebuiView,
} from './services/webui-view'
import { enterShellWindow, getMainWindow } from './windows'

function asBounds(bounds: ViewBounds): ViewBounds {
  return {
    x: Math.max(0, Math.round(bounds.x)),
    y: Math.max(0, Math.round(bounds.y)),
    width: Math.max(0, Math.round(bounds.width)),
    height: Math.max(0, Math.round(bounds.height)),
  }
}

/** Регистрация IPC-хендлеров */
export function registerIpcHandlers(
  composeTemplatePath: string,
  searxngTemplateDir: string,
): void {
  const manager = getStackManager()

  manager.onLog((line) => {
    const win = getMainWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send(IPC.LOG, line)
    }
  })

  manager.onInitProgress((progress) => {
    const win = getMainWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send(IPC.INIT_PROGRESS, progress)
    }
  })

  ipcMain.handle(IPC.INIT, async (_event, defaultModel: string) => {
    await manager.initialize({ defaultModel, composeTemplatePath, searxngTemplateDir })
  })

  ipcMain.handle(IPC.START, async () => {
    await manager.start({ composeTemplatePath, searxngTemplateDir })
  })

  ipcMain.handle(IPC.STOP, async () => {
    hideWebuiView()
    await manager.stop()
  })

  ipcMain.handle(IPC.STATUS, async () => {
    return manager.getStatus()
  })

  ipcMain.handle(IPC.ENTER_SHELL, async () => {
    enterShellWindow()
  })

  ipcMain.handle(IPC.WEBUI_VIEW_SHOW, async (_event, bounds: ViewBounds) => {
    const win = getMainWindow()
    if (!win || win.isDestroyed()) return
    showWebuiView(win, asBounds(bounds))
  })

  ipcMain.handle(IPC.WEBUI_VIEW_HIDE, async () => {
    hideWebuiView()
  })

  ipcMain.handle(IPC.WEBUI_VIEW_BOUNDS, async (_event, bounds: ViewBounds) => {
    setWebuiViewBounds(asBounds(bounds))
  })
}

/** Обработка закрытия приложения */
export async function handleAppQuit(): Promise<boolean> {
  const manager = getStackManager()
  const status = await manager.getStatus()

  if (!status.running && status.webui.state !== 'ready') {
    return true
  }

  const win = getMainWindow()
  const result = await dialog.showMessageBox(win ?? (undefined as unknown as BrowserWindow), {
    type: 'question',
    buttons: ['Stop stack and quit', 'Quit without stopping', 'Cancel'],
    defaultId: 0,
    cancelId: 2,
    title: `Quit ${env.APP_NAME}`,
    message: 'The AI stack is still running.',
    detail: 'Do you want to stop Docker container and Ollama before quitting?',
  })

  if (result.response === 2) return false
  if (result.response === 0) {
    hideWebuiView()
    await manager.stop()
  }
  destroyWebuiView()
  return true
}

/** Получить путь к шаблону docker-compose */
export function getComposeTemplatePath(): string {
  if (!app.isPackaged) {
    return join(__dirname, '../../resources/docker-compose.template.yml')
  }
  return join(process.resourcesPath, 'docker-compose.template.yml')
}

/** Получить путь к bundled-конфигу SearXNG */
export function getSearxngTemplateDir(): string {
  if (!app.isPackaged) {
    return join(__dirname, '../../resources/searxng')
  }
  return join(process.resourcesPath, 'searxng')
}
