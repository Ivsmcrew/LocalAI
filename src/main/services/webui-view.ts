import { BrowserWindow, WebContentsView, type Rectangle } from 'electron'
import { WEBUI_URL } from '@shared/env'

let view: WebContentsView | null = null
let attachedWin: BrowserWindow | null = null
let loadedUrl: string | null = null
let visible = false

function ensureView(): WebContentsView {
  if (view) return view

  view = new WebContentsView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  view.webContents.setWindowOpenHandler(({ url }) => {
    void view?.webContents.loadURL(url)
    return { action: 'deny' }
  })

  return view
}

function attach(win: BrowserWindow, next: WebContentsView): void {
  if (attachedWin === win) return

  if (attachedWin && !attachedWin.isDestroyed() && view) {
    attachedWin.contentView.removeChildView(view)
  }

  win.contentView.addChildView(next)
  attachedWin = win
}

/** Show Open WebUI as a first-party Electron view (avoids iframe cookie/auth bugs). */
export function showWebuiView(win: BrowserWindow, bounds: Rectangle): void {
  const next = ensureView()
  attach(win, next)
  next.setBounds(bounds)
  next.setVisible(true)
  visible = true

  if (loadedUrl !== WEBUI_URL) {
    void next.webContents.loadURL(WEBUI_URL)
    loadedUrl = WEBUI_URL
  }
}

export function setWebuiViewBounds(bounds: Rectangle): void {
  if (!view || !visible) return
  view.setBounds(bounds)
}

export function hideWebuiView(): void {
  if (!view) return
  view.setVisible(false)
  visible = false
}

export function destroyWebuiView(): void {
  if (!view) return

  if (attachedWin && !attachedWin.isDestroyed()) {
    attachedWin.contentView.removeChildView(view)
  }

  // Electron tears down the webContents with the view.
  view = null
  attachedWin = null
  loadedUrl = null
  visible = false
}
