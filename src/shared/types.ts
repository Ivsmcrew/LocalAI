export type ServiceState = 'idle' | 'starting' | 'ready' | 'error' | 'stopped'

/** Полный набор переменных окружения приложения */
export type AppEnv = {
  APP_ID: string
  APP_NAME: string
  SERVICE_HOST: string
  WEBUI_PORT: number
  OLLAMA_PORT: number
  CONTAINER_NAME: string
  DOCKER_IMAGE: string
  DEFAULT_MODEL: string
  DEFAULT_MODELS: string[]
  REQUEST_TIMEOUT_MS: number
}

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
