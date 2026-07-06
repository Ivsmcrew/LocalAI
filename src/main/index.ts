import { env } from '@shared/env'
import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createControlWindow } from './windows'
import {
  getComposeTemplatePath,
  handleAppQuit,
  registerIpcHandlers,
} from './ipc-handlers'

/** Запуск приложения */
app.whenReady().then(() => {
  electronApp.setAppUserModelId(env.APP_ID)

  /** Включение горячих клавиш по типу F12 */
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  /** Регистрация IPC-хендлеров(INIT, START итд) */
  registerIpcHandlers(getComposeTemplatePath())

  /** Создание стартового окна(окно управления) */
  createControlWindow()

  /** Для macOS: если приложение закрыто, то открыть новое окно управления */
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createControlWindow()
    }
  })
})

/** 
 * Обработка закрытия всех окон 
 * Для всех кроме macOS: завершить приложение
*/
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/** Обработка закрытия приложения */
let isQuitting = false
app.on('before-quit', async (event) => {
  if (isQuitting) return
  event.preventDefault()

  const shouldQuit = await handleAppQuit()
  if (shouldQuit) {
    isQuitting = true
    app.quit()
  }
})
