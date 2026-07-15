import { ipcMain, dialog, app, type BrowserWindow } from 'electron'
import { join } from 'path'
import { IPC } from '@shared/ipc-channels'
import { env } from '@shared/env'
import { getStackManager } from './stack'
import { enterShellWindow, getMainWindow } from './windows'

/** Регистрация IPC-хендлеров */
export function registerIpcHandlers(composeTemplatePath: string): void {
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
    await manager.initialize({ defaultModel, composeTemplatePath })
  })

  ipcMain.handle(IPC.START, async () => {
    await manager.start()
  })

  ipcMain.handle(IPC.STOP, async () => {
    await manager.stop()
  })

  ipcMain.handle(IPC.STATUS, async () => {
    return manager.getStatus()
  })

  ipcMain.handle(IPC.ENTER_SHELL, async () => {
    enterShellWindow()
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
    await manager.stop()
  }
  return true
}

/** Получить путь к шаблону docker-compose */
export function getComposeTemplatePath(): string {
  if (!app.isPackaged) {
    return join(__dirname, '../../resources/docker-compose.template.yml')
  }
  return join(process.resourcesPath, 'docker-compose.template.yml')
}
