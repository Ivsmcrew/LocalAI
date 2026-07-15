import { execFile } from 'child_process'
import { promisify } from 'util'
import { access } from 'fs/promises'
import { constants } from 'fs'
import { env, OLLAMA_TAGS_URL } from '@shared/env'

const execFileAsync = promisify(execFile)

const OLLAMA_APP = '/Applications/Ollama.app'
const OLLAMA_BIN_CANDIDATES = [
  '/Applications/Ollama.app/Contents/Resources/ollama',
  '/usr/local/bin/ollama',
  '/opt/homebrew/bin/ollama',
]

export class OllamaService {
  private log: (line: string) => void

  constructor(onLog: (line: string) => void) {
    this.log = onLog
  }

  async isInstalled(): Promise<boolean> {
    try {
      await access(OLLAMA_APP, constants.F_OK)
      return true
    } catch {
      return false
    }
  }

  async start(): Promise<void> {
    this.log('Starting Ollama...')
    await execFileAsync('open', ['-gj', '-a', 'Ollama'])
  }

  async waitForReady(timeoutMs = 60_000): Promise<void> {
    this.log('Waiting for Ollama API...')
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      if (await this.isReady()) {
        this.log('Ollama is ready')
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

  async pullModel(model: string): Promise<void> {
    this.log(`Pulling Ollama model: ${model}`)
    const bin = (await this.resolveBinary()) ?? 'ollama'
    await execFileAsync(bin, ['pull', model], {
      maxBuffer: 10 * 1024 * 1024,
      timeout: 600_000,
    })
    this.log(`Model ${model} pulled successfully`)
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

  async stop(): Promise<void> {
    this.log('Stopping Ollama...')
    try {
      await execFileAsync('pkill', ['Ollama'])
    } catch {
      // already stopped
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
