import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '@shared/ipc-channels'
import type { InitProgress, StackStatus, ViewBounds } from '@shared/types'

export interface LocalAIApi {
  initialize: (defaultModel: string) => Promise<void>
  start: () => Promise<void>
  stop: () => Promise<void>
  getStatus: () => Promise<StackStatus>
  enterShell: () => Promise<void>
  showWebuiView: (bounds: ViewBounds) => Promise<void>
  hideWebuiView: () => Promise<void>
  setWebuiViewBounds: (bounds: ViewBounds) => Promise<void>
  onLog: (cb: (line: string) => void) => () => void
  onInitProgress: (cb: (progress: InitProgress) => void) => () => void
}

const api: LocalAIApi = {
  initialize: (defaultModel) => ipcRenderer.invoke(IPC.INIT, defaultModel),
  start: () => ipcRenderer.invoke(IPC.START),
  stop: () => ipcRenderer.invoke(IPC.STOP),
  getStatus: () => ipcRenderer.invoke(IPC.STATUS),
  enterShell: () => ipcRenderer.invoke(IPC.ENTER_SHELL),
  showWebuiView: (bounds) => ipcRenderer.invoke(IPC.WEBUI_VIEW_SHOW, bounds),
  hideWebuiView: () => ipcRenderer.invoke(IPC.WEBUI_VIEW_HIDE),
  setWebuiViewBounds: (bounds) => ipcRenderer.invoke(IPC.WEBUI_VIEW_BOUNDS, bounds),
  onLog: (cb) => {
    const handler = (_: Electron.IpcRendererEvent, line: string) => cb(line)
    ipcRenderer.on(IPC.LOG, handler)
    return () => ipcRenderer.removeListener(IPC.LOG, handler)
  },
  onInitProgress: (cb) => {
    const handler = (_: Electron.IpcRendererEvent, progress: InitProgress) => cb(progress)
    ipcRenderer.on(IPC.INIT_PROGRESS, handler)
    return () => ipcRenderer.removeListener(IPC.INIT_PROGRESS, handler)
  },
}

contextBridge.exposeInMainWorld('api', api)
