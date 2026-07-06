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
