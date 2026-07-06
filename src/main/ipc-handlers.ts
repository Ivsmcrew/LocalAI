import { ipcMain, dialog, app, type BrowserWindow } from 'electron'
import { join } from 'path'
import { IPC } from '@shared/consts'
import { APP_NAME } from '@shared/env'
import { getStackManager } from './stack'
import { closeChatWindow, getControlWindow, openChatWindow } from './windows'

/** Регистрация IPC-хендлеров */
export function registerIpcHandlers(composeTemplatePath: string): void {
  const manager = getStackManager()

  manager.onLog((line) => {
    const win = getControlWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send(IPC.LOG, line)
    }
  })

  manager.onInitProgress((progress) => {
    const win = getControlWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send(IPC.INIT_PROGRESS, progress)
    }
  })

  ipcMain.handle(IPC.INIT, async (_event, defaultModel: string) => {
    await manager.initialize({ defaultModel, composeTemplatePath })
  })

  ipcMain.handle(IPC.START, async () => {
    await manager.start()
    openChatWindow()
  })

  ipcMain.handle(IPC.STOP, async () => {
    closeChatWindow()
    await manager.stop()
  })

  ipcMain.handle(IPC.STATUS, async () => {
    return manager.getStatus()
  })

  ipcMain.handle(IPC.OPEN_CHAT, async () => {
    const status = await manager.getStatus()
    if (status.webui.state === 'ready') {
      openChatWindow()
    } else {
      throw new Error('WebUI is not running. Start the stack first.')
    }
  })
}

/** Обработка закрытия приложения */
export async function handleAppQuit(): Promise<boolean> {
  const manager = getStackManager()
  const status = await manager.getStatus()

  if (!status.running && status.webui.state !== 'ready') {
    return true
  }

  const win = getControlWindow()
  const result = await dialog.showMessageBox(win ?? (undefined as unknown as BrowserWindow), {
    type: 'question',
    buttons: ['Stop stack and quit', 'Quit without stopping', 'Cancel'],
    defaultId: 0,
    cancelId: 2,
    title: `Quit ${APP_NAME}`,
    message: 'The AI stack is still running.',
    detail: 'Do you want to stop Docker container and Ollama before quitting?',
  })

  if (result.response === 2) return false
  if (result.response === 0) {
    closeChatWindow()
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
