import { execFile, spawn, type ChildProcess } from 'child_process'
import { promisify } from 'util'
import { access } from 'fs/promises'
import { constants } from 'fs'
import { env, OLLAMA_API_URL, OLLAMA_TAGS_URL } from '@shared/env'
import type { ModelDownloadProgress } from '@shared/types'

const execFileAsync = promisify(execFile)

const OLLAMA_APP = '/Applications/Ollama.app'
const OLLAMA_BIN_CANDIDATES = [
  '/Applications/Ollama.app/Contents/Resources/ollama',
  '/usr/local/bin/ollama',
  '/opt/homebrew/bin/ollama',
]

export type PullProgressCallback = (download: ModelDownloadProgress, status: string) => void

export class OllamaService {
  private log: (line: string) => void
  private serveProcess: ChildProcess | null = null

  constructor(onLog: (line: string) => void) {
    this.log = onLog
  }

  async isInstalled(): Promise<boolean> {
    try {
      await access(OLLAMA_APP, constants.F_OK)
      return true
    } catch {
      return (await this.resolveBinary()) !== null
    }
  }

  /**
   * Start the Ollama API without showing the Ollama.app chat UI.
   * Prefer `ollama serve` (headless); fall back to opening the app hidden.
   */
  async start(): Promise<void> {
    if (await this.isReady()) {
      this.log('Ollama is already running')
      return
    }

    this.log('Starting Ollama...')

    const bin = await this.resolveBinary()
    if (bin) {
      this.serveProcess = spawn(bin, ['serve'], {
        detached: true,
        stdio: 'ignore',
      })
      this.serveProcess.unref()
      this.serveProcess.on('exit', () => {
        this.serveProcess = null
      })
      return
    }

    // Fallback if the CLI binary is missing — hide the app UI as best we can
    await execFileAsync('open', ['-gj', '-a', 'Ollama'])
    await this.hideAppWindows()
  }

  async waitForReady(timeoutMs = 60_000): Promise<void> {
    this.log('Waiting for Ollama API...')
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      if (await this.isReady()) {
        this.log('Ollama is ready')
        // App fallback may still flash a window on first launch — hide again once ready
        await this.hideAppWindows()
        return
      }
      await sleep(1000)
    }
    throw new Error('Ollama API did not become ready within the timeout period')
  }

  async isReady(): Promise<boolean> {
    try {
      const res = await fetch(OLLAMA_TAGS_URL, { signal: AbortSignal.timeout(env.REQUEST_TIMEOUT_MS) })
      return res.ok
    } catch {
      return false
    }
  }

  async getModels(): Promise<string[]> {
    const res = await fetch(OLLAMA_TAGS_URL)
    if (!res.ok) throw new Error('Failed to fetch Ollama models')
    const data = (await res.json()) as { models?: Array<{ name: string }> }
    return (data.models ?? []).map((m) => m.name)
  }

  async hasModel(model: string): Promise<boolean> {
    const models = await this.getModels()
    return models.some((m) => m === model || m.startsWith(`${model}:`))
  }

  async pullModel(model: string, onProgress?: PullProgressCallback): Promise<void> {
    this.log(`Pulling Ollama model: ${model}`)

    const res = await fetch(`${OLLAMA_API_URL}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: model, stream: true }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Failed to pull model ${model}: ${res.status} ${body}`)
    }

    if (!res.body) {
      throw new Error(`Failed to pull model ${model}: empty response body`)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue

        let event: OllamaPullEvent
        try {
          event = JSON.parse(trimmed) as OllamaPullEvent
        } catch {
          continue
        }

        if (event.error) {
          throw new Error(`Failed to pull model ${model}: ${event.error}`)
        }

        if (
          onProgress &&
          typeof event.completed === 'number' &&
          typeof event.total === 'number' &&
          event.total > 0
        ) {
          onProgress(
            {
              completed: event.completed,
              total: event.total,
              digest: event.digest,
            },
            event.status ?? 'downloading',
          )
        }
      }
    }

    this.log(`Model ${model} pulled successfully`)
  }

  async stop(): Promise<void> {
    this.log('Stopping Ollama...')

    if (this.serveProcess?.pid) {
      try {
        process.kill(this.serveProcess.pid)
      } catch {
        // already exited
      }
      this.serveProcess = null
    }

    try {
      // CLI server process
      await execFileAsync('pkill', ['-f', 'ollama serve'])
    } catch {
      // not running
    }

    try {
      // GUI app (if it was used as fallback)
      await execFileAsync('pkill', ['Ollama'])
    } catch {
      // already stopped
    }
  }

  private async resolveBinary(): Promise<string | null> {
    for (const candidate of OLLAMA_BIN_CANDIDATES) {
      try {
        await access(candidate, constants.X_OK)
        return candidate
      } catch {
        // try next
      }
    }
    return null
  }

  /** Best-effort hide of Ollama.app windows (macOS). No-op if app isn't showing. */
  private async hideAppWindows(): Promise<void> {
    try {
      await execFileAsync('osascript', [
        '-e',
        'tell application "System Events" to if exists process "Ollama" then set visible of process "Ollama" to false',
      ])
    } catch {
      // Accessibility permission missing or process not present — ignore
    }
  }
}

interface OllamaPullEvent {
  status?: string
  digest?: string
  total?: number
  completed?: number
  error?: string
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
