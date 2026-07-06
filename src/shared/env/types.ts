export interface AppEnv {
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
