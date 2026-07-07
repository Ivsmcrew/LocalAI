export type EnvFieldType = 'string' | 'number' | 'csv'

type TsType<T extends EnvFieldType> = T extends 'number'
  ? number
  : T extends 'csv'
    ? string[]
    : string

/**
 * Вычисляемый тип для переменных окружения
 */
export type AppEnv = {
  [K in keyof typeof ENV_SCHEMA]: TsType<(typeof ENV_SCHEMA)[K]['type']>
}

/**
 * Схема переменных окружения
 */
export const ENV_SCHEMA = {
  APP_ID: { type: 'string' },
  APP_NAME: { type: 'string' },
  SERVICE_HOST: { type: 'string' },
  WEBUI_PORT: { type: 'number' },
  OLLAMA_PORT: { type: 'number' },
  CONTAINER_NAME: { type: 'string' },
  DOCKER_IMAGE: { type: 'string' },
  DEFAULT_MODEL: { type: 'string' },
  DEFAULT_MODELS: { type: 'csv' },
  REQUEST_TIMEOUT_MS: { type: 'number' }
} as const
