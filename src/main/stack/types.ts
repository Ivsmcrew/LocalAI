// Общие типы для коллабораторов стека (зависимости, опции init, эмиттер прогресса).
import type { InitProgress } from '../../shared/types'
import type { ConfigService } from '../services/config'
import type { DockerService } from '../services/docker'
import type { OllamaService } from '../services/ollama'
import type { WebUIService } from '../services/webui'

export interface StackDeps {
  config: ConfigService
  docker: DockerService
  ollama: OllamaService
  webui: WebUIService
}

export interface ProgressEmitter {
  emitLog(line: string): void
  emitProgress(progress: InitProgress): void
}

export interface InitOptions {
  defaultModel: string
  composeTemplatePath: string
}
