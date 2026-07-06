// Подписки и рассылка логов и прогресса инициализации в UI.
import type { InitProgress } from '@shared/types'

export class StackEvents {
  private logListeners: Array<(line: string) => void> = []
  private progressListeners: Array<(progress: InitProgress) => void> = []

  onLog(cb: (line: string) => void): () => void {
    this.logListeners.push(cb)
    return () => {
      this.logListeners = this.logListeners.filter((l) => l !== cb)
    }
  }

  onInitProgress(cb: (progress: InitProgress) => void): () => void {
    this.progressListeners.push(cb)
    return () => {
      this.progressListeners = this.progressListeners.filter((l) => l !== cb)
    }
  }

  emitLog(line: string): void {
    const ts = new Date().toISOString().slice(11, 19)
    const msg = `[${ts}] ${line}`
    this.logListeners.forEach((cb) => cb(msg))
    console.log(msg)
  }

  emitProgress(progress: InitProgress): void {
    this.progressListeners.forEach((cb) => cb(progress))
  }
}
