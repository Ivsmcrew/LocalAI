import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createControlWindow } from './windows'
import { getComposeTemplatePath, handleAppQuit, registerIpcHandlers } from './ipc-handlers'

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.localai.desktop')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerIpcHandlers(getComposeTemplatePath())
  createControlWindow()

	//Открыть DevTools
	// mainWindow.webContents.openDevTools()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createControlWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

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
