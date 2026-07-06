// Сборка объекта StackStatus из флагов готовности сервисов (чистая функция).
import type { AppConfig, StackStatus } from '@shared/types'
import { WEBUI_PORT } from '@shared/env'

export interface StackStatusInput {
  cfg: AppConfig | null
  dockerReady: boolean
  ollamaReady: boolean
  webuiReady: boolean
  containerRunning: boolean
  running: boolean
}

export function buildStackStatus(input: StackStatusInput): StackStatus {
  const { cfg, dockerReady, ollamaReady, webuiReady, containerRunning, running } = input

  const isRunning =
    running || (dockerReady && ollamaReady && webuiReady && containerRunning)

  return {
    initialized: cfg?.initialized ?? false,
    running: isRunning,
    defaultModel: cfg?.defaultModel,
    docker: {
      state: dockerReady ? 'ready' : 'idle',
      message: dockerReady ? 'Running' : 'Not running',
    },
    ollama: {
      state: ollamaReady ? 'ready' : 'idle',
      message: ollamaReady ? 'API ready' : 'Not running',
    },
    webui: {
      state: webuiReady && containerRunning ? 'ready' : containerRunning ? 'starting' : 'idle',
      message: webuiReady ? `Ready on :${WEBUI_PORT}` : containerRunning ? 'Starting...' : 'Stopped',
    },
  }
}
