import type { AppEnv } from './types'

declare const __LOCALAI_ENV__: AppEnv

export const env: AppEnv = __LOCALAI_ENV__

export const WEBUI_URL = `http://${env.SERVICE_HOST}:${env.WEBUI_PORT}`
export const OLLAMA_API_URL = `http://${env.SERVICE_HOST}:${env.OLLAMA_PORT}`
export const OLLAMA_TAGS_URL = `${OLLAMA_API_URL}/api/tags`
