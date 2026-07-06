import type { InitProgress, StackStatus } from '@shared/types'
import { env } from '@shared/env'

import { ConfigService } from '../services/config'
import { DockerService } from '../services/docker'
import { OllamaService } from '../services/ollama'
import { WebUIService } from '../services/webui'

import { StackEvents } from './stack-events'
import { StackInitializer } from './stack-initializer'
import { buildStackStatus } from './stack-status'
import type { InitOptions, StackDeps } from './types'

// Фасад стека: тонкий оркестратор start/stop/status/init, делегирует детали коллабораторам.
export class StackManager {
  private deps: StackDeps
  private events = new StackEvents()
  private running = false

  constructor() {
    const config = new ConfigService()
    const log = (line: string) => this.events.emitLog(line)
    this.deps = {
      config,
      docker: new DockerService(log),
      ollama: new OllamaService(log),
      webui: new WebUIService(log),
    }
  }

  onLog(cb: (line: string) => void): () => void {
    return this.events.onLog(cb)
  }

  onInitProgress(cb: (progress: InitProgress) => void): () => void {
    return this.events.onInitProgress(cb)
  }

  async getStatus(): Promise<StackStatus> {
    const cfg = await this.deps.config.readConfig()
    const [dockerReady, ollamaReady, webuiReady, containerRunning] = await Promise.all([
      this.deps.docker.isRunning(),
      this.deps.ollama.isReady(),
      this.deps.webui.isReady(),
      this.deps.docker.isContainerRunning(env.CONTAINER_NAME),
    ])

    return buildStackStatus({
      cfg,
      dockerReady,
      ollamaReady,
      webuiReady,
      containerRunning,
      running: this.running,
    })
  }

  async initialize(options: InitOptions): Promise<void> {
    await new StackInitializer(this.deps, this.events).run(options)
  }

  async start(): Promise<void> {
    const cfg = await this.deps.config.readConfig()
    if (!cfg?.initialized) {
      throw new Error('Stack not initialized. Run Init first.')
    }

    this.running = true
    this.events.emitLog('Starting AI stack...')

    const { docker, ollama, webui, config } = this.deps
    await docker.ensureRunning()
    await docker.composeUp(config.getUserDataPath())
    await ollama.start()
    await ollama.waitForReady()
    await webui.waitForReady()

    this.events.emitLog('Stack is ready')
  }

  async stop(): Promise<void> {
    this.events.emitLog('Stopping AI stack...')
    this.running = false

    const cfg = await this.deps.config.readConfig()
    if (cfg?.composePath) {
      try {
        await this.deps.docker.composeStop(this.deps.config.getUserDataPath())
      } catch (err) {
        this.events.emitLog(`Warning: could not stop container: ${err}`)
      }
    }

    await this.deps.ollama.stop()
    this.events.emitLog('Stack stopped')
  }
}

let instance: StackManager | null = null

export function getStackManager(): StackManager {
  if (!instance) instance = new StackManager()
  return instance
}
