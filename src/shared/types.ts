export const WEBUI_PORT = 3000
export const OLLAMA_PORT = 11434
export const WEBUI_URL = `http://localhost:${WEBUI_PORT}`
export const OLLAMA_API_URL = `http://localhost:${OLLAMA_PORT}`
export const OLLAMA_TAGS_URL = `${OLLAMA_API_URL}/api/tags`

export const CONTAINER_NAME = 'open-webui'
export const APP_NAME = 'LocalAI'

export type ServiceState = 'idle' | 'starting' | 'ready' | 'error' | 'stopped'

export interface ServiceStatus {
  state: ServiceState
  message?: string
}

export interface StackStatus {
  initialized: boolean
  running: boolean
  defaultModel?: string
  docker: ServiceStatus
  ollama: ServiceStatus
  webui: ServiceStatus
}

export interface AppConfig {
  initialized: boolean
  initializedAt?: string
  defaultModel: string
  composePath: string
  userDataPath: string
}

export type InitStepId =
  | 'preflight'
  | 'setup-files'
  | 'docker'
  | 'ollama'
  | 'smoke-test'
  | 'finalize'

export interface InitProgress {
  step: InitStepId
  percent: number
  message: string
}

export const IPC = {
  INIT: 'stack:init',
  START: 'stack:start',
  STOP: 'stack:stop',
  STATUS: 'stack:status',
  LOG: 'stack:log',
  INIT_PROGRESS: 'stack:init-progress',
  OPEN_CHAT: 'stack:open-chat',
} as const

export const DEFAULT_MODELS = ['llama3.2', 'mistral', 'gemma2:2b'] as const
