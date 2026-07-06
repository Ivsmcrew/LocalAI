// Проверка системы перед первой установкой: Docker, Ollama, порты, место на диске.
import { execFile } from 'child_process'
import { promisify } from 'util'
import { statfs } from 'fs/promises'
import { OLLAMA_PORT, WEBUI_PORT } from '@shared/env'
import type { ProgressEmitter, StackDeps } from './types'

const execFileAsync = promisify(execFile)
const MIN_DISK_BYTES = 10 * 1024 * 1024 * 1024

export class PreflightChecker {
  constructor(
    private deps: StackDeps,
    private events: ProgressEmitter,
  ) {}

  async run(): Promise<void> {
    const { docker, ollama } = this.deps

    if (!(await docker.isInstalled())) {
      throw new Error(
        'Docker Desktop is not installed. Download it from https://www.docker.com/products/docker-desktop/',
      )
    }

    if (!(await ollama.isInstalled())) {
      throw new Error('Ollama is not installed. Download it from https://ollama.com/download')
    }

    await this.checkPortFree(WEBUI_PORT, 'Open WebUI')
    await this.checkPortFree(OLLAMA_PORT, 'Ollama')

    try {
      const stats = await statfs('/')
      const freeBytes = stats.bfree * stats.bsize
      if (freeBytes < MIN_DISK_BYTES) {
        throw new Error('Less than 10 GB of free disk space available')
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('disk space')) throw err
      this.events.emitLog('Warning: could not verify disk space')
    }
  }

  private async checkPortFree(port: number, serviceName: string): Promise<void> {
    try {
      const { stdout } = await execFileAsync('lsof', ['-i', `:${port}`, '-sTCP:LISTEN', '-t'])
      if (stdout.trim()) {
        const pid = stdout.trim().split('\n')[0]
        throw new Error(
          `Port ${port} (${serviceName}) is already in use by process ${pid}. Stop it before initializing.`,
        )
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('Port')) throw err
      // lsof returns non-zero when port is free
    }
  }
}
