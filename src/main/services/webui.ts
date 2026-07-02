import { WEBUI_URL } from '../../shared/types'

export class WebUIService {
  private log: (line: string) => void

  constructor(onLog: (line: string) => void) {
    this.log = onLog
  }

  async isReady(): Promise<boolean> {
    try {
      const res = await fetch(WEBUI_URL, { signal: AbortSignal.timeout(3000) })
      return res.ok || res.status === 200
    } catch {
      return false
    }
  }

  async waitForReady(timeoutMs = 120_000): Promise<void> {
    this.log('Waiting for Open WebUI...')
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      if (await this.isReady()) {
        this.log('Open WebUI is ready')
        return
      }
      await sleep(1000)
    }
    throw new Error('Open WebUI did not become ready within the timeout period')
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
