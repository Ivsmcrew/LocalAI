// Пошаговый сценарий первой инициализации: preflight → docker → ollama → smoke test.
import { PreflightChecker } from './preflight-checker'
import type { InitOptions, ProgressEmitter, StackDeps } from './types'

export class StackInitializer {
  constructor(
    private deps: StackDeps,
    private events: ProgressEmitter,
  ) {}

  async run(options: InitOptions): Promise<void> {
    const { defaultModel, composeTemplatePath } = options
    const { config, docker, ollama, webui } = this.deps

    // Step 1: Preflight
    this.events.emitProgress({ step: 'preflight', percent: 5, message: 'Checking system requirements...' })
    await new PreflightChecker(this.deps, this.events).run()

    // Step 2: Setup files
    this.events.emitProgress({ step: 'setup-files', percent: 15, message: 'Setting up configuration files...' })
    const composePath = await config.setupComposeFile(composeTemplatePath)
    await config.writeConfig({
      initialized: false,
      defaultModel,
      composePath,
      userDataPath: config.getUserDataPath(),
    })

    const composeDir = config.getUserDataPath()

    // Step 3: Docker
    this.events.emitProgress({ step: 'docker', percent: 30, message: 'Pulling Open WebUI image...' })
    await docker.ensureRunning()
    await docker.composePull(composeDir)
    this.events.emitProgress({ step: 'docker', percent: 50, message: 'Starting Open WebUI container...' })
    await docker.composeUp(composeDir)

    // Step 4: Ollama
    this.events.emitProgress({ step: 'ollama', percent: 60, message: 'Setting up Ollama...' })
    await ollama.start()
    await ollama.waitForReady()
    this.events.emitProgress({ step: 'ollama', percent: 70, message: `Pulling model ${defaultModel}...` })
    await ollama.pullModel(defaultModel, (download) => {
      const ratio = download.total > 0 ? download.completed / download.total : 0
      const percent = Math.min(84, Math.round(70 + ratio * 14))
      this.events.emitProgress({
        step: 'ollama',
        percent,
        message: `Downloading ${defaultModel}… ${formatBytes(download.completed)} / ${formatBytes(download.total)}`,
        download,
      })
    })

    // Step 5: Smoke test
    this.events.emitProgress({ step: 'smoke-test', percent: 85, message: 'Running smoke test...' })
    await webui.waitForReady()
    const hasModel = await ollama.hasModel(defaultModel)
    if (!hasModel) {
      throw new Error(`Smoke test failed: model ${defaultModel} not found in Ollama`)
    }

    // Step 6: Finalize
    this.events.emitProgress({ step: 'finalize', percent: 95, message: 'Finalizing setup...' })
    await docker.composeStop(composeDir)
    await config.writeConfig({
      initialized: true,
      initializedAt: new Date().toISOString(),
      defaultModel,
      composePath,
      userDataPath: config.getUserDataPath(),
    })
    this.events.emitProgress({ step: 'finalize', percent: 100, message: 'Initialization complete!' })
    this.events.emitLog('Init complete. Open LocalAI to launch the app.')
  }
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** i
  return `${value < 10 && i > 0 ? value.toFixed(1) : Math.round(value)} ${units[i]}`
}
