import { execFile, spawn, type ChildProcess } from 'child_process'
import { promisify } from 'util'
import { access } from 'fs/promises'
import { constants } from 'fs'
import { CONTAINER_NAME } from '@shared/env'

const execFileAsync = promisify(execFile)

const DOCKER_APP = '/Applications/Docker.app'
const DOCKER_BIN = '/Applications/Docker.app/Contents/Resources/bin/docker'

export class DockerService {
  private log: (line: string) => void

  constructor(onLog: (line: string) => void) {
    this.log = onLog
  }

  async isInstalled(): Promise<boolean> {
    try {
      await access(DOCKER_APP, constants.F_OK)
      return true
    } catch {
      return false
    }
  }

  async isRunning(): Promise<boolean> {
    try {
      await execFileAsync(DOCKER_BIN, ['info'], { timeout: 10_000 })
      return true
    } catch {
      try {
        await execFileAsync('docker', ['info'], { timeout: 10_000 })
        return true
      } catch {
        return false
      }
    }
  }

  async ensureRunning(timeoutMs = 120_000): Promise<void> {
    if (await this.isRunning()) {
      this.log('Docker is already running')
      return
    }

    this.log('Starting Docker Desktop...')
    await execFileAsync('open', ['-gj', '-a', 'Docker'])

    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      if (await this.isRunning()) {
        this.log('Docker is ready')
        return
      }
      await sleep(2000)
    }

    throw new Error('Docker Desktop did not start within the timeout period')
  }

  async run(args: string[], cwd: string, options?: { quiet?: boolean }): Promise<string> {
    const bin = (await this.isRunningWithPath()) ? DOCKER_BIN : 'docker'
    if (!options?.quiet) {
      this.log(`docker ${args.join(' ')}`)
    }
    const { stdout, stderr } = await execFileAsync(bin, args, {
      cwd,
      maxBuffer: 10 * 1024 * 1024,
      timeout: 600_000,
    })
    if (!options?.quiet && stderr.trim()) {
      this.log(stderr.trim())
    }
    return stdout
  }

  runStreaming(args: string[], cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const bin = DOCKER_BIN
      const child = spawn(bin, args, { cwd, shell: false })
      attachOutput(child, this.log, resolve, reject)
    })
  }

  async composePull(cwd: string): Promise<void> {
    await this.run(['compose', 'pull'], cwd)
  }

  async composeUp(cwd: string, containerName = CONTAINER_NAME): Promise<void> {
    if (await this.isContainerRunning(containerName, false)) {
      this.log(`Container ${containerName} is already running`)
      return
    }

    try {
      await this.run(['compose', 'up', '-d'], cwd)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      const isNameConflict =
        message.includes('Conflict') || message.includes('already in use')
      if (!isNameConflict) throw err

      this.log(`Removing conflicting container ${containerName}...`)
      await this.run(['rm', '-f', containerName], '/')
      await this.run(['compose', 'up', '-d'], cwd)
    }
  }

  async composeStop(cwd: string): Promise<void> {
    await this.run(['compose', 'stop'], cwd)
  }

  async isContainerRunning(name: string, quiet = true): Promise<boolean> {
    try {
      const out = await this.run(['inspect', '-f', '{{.State.Running}}', name], '/', { quiet })
      return out.trim() === 'true'
    } catch {
      return false
    }
  }

  private async isRunningWithPath(): Promise<boolean> {
    try {
      await access(DOCKER_BIN, constants.F_OK)
      return true
    } catch {
      return false
    }
  }
}

function attachOutput(
  child: ChildProcess,
  log: (line: string) => void,
  resolve: () => void,
  reject: (err: Error) => void,
): void {
  child.stdout?.on('data', (data: Buffer) => {
    data
      .toString()
      .split('\n')
      .filter(Boolean)
      .forEach((line) => log(line))
  })
  child.stderr?.on('data', (data: Buffer) => {
    data
      .toString()
      .split('\n')
      .filter(Boolean)
      .forEach((line) => log(line))
  })
  child.on('error', reject)
  child.on('close', (code) => {
    if (code === 0) resolve()
    else reject(new Error(`docker exited with code ${code}`))
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
