import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '@shared/ipc-channels'
import type { InitProgress, StackStatus } from '@shared/types'

export interface LocalAIApi {
  initialize: (defaultModel: string) => Promise<void>
  start: () => Promise<void>
  stop: () => Promise<void>
  getStatus: () => Promise<StackStatus>
  openChat: () => Promise<void>
  onLog: (cb: (line: string) => void) => () => void
  onInitProgress: (cb: (progress: InitProgress) => void) => () => void
}

const api: LocalAIApi = {
  initialize: (defaultModel) => ipcRenderer.invoke(IPC.INIT, defaultModel),
  start: () => ipcRenderer.invoke(IPC.START),
  stop: () => ipcRenderer.invoke(IPC.STOP),
  getStatus: () => ipcRenderer.invoke(IPC.STATUS),
  openChat: () => ipcRenderer.invoke(IPC.OPEN_CHAT),
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
