import type { BuildEnv } from '../../env.build'

declare const __LOCALAI_ENV__: BuildEnv

/** В electron.vite.config.ts создается __LOCALAI_ENV__ */
const cfg = __LOCALAI_ENV__

export const APP_ID = cfg.APP_ID
export const APP_NAME = cfg.APP_NAME
export const SERVICE_HOST = cfg.SERVICE_HOST
export const WEBUI_PORT = cfg.WEBUI_PORT
export const OLLAMA_PORT = cfg.OLLAMA_PORT
export const CONTAINER_NAME = cfg.CONTAINER_NAME
export const DOCKER_IMAGE = cfg.DOCKER_IMAGE
export const DEFAULT_MODEL = cfg.DEFAULT_MODEL
export const DEFAULT_MODELS = cfg.DEFAULT_MODELS
export const REQUEST_TIMEOUT_MS = cfg.REQUEST_TIMEOUT_MS
export const openDevtools = cfg.OPEN_DEVTOOLS

export const WEBUI_URL = `http://${SERVICE_HOST}:${WEBUI_PORT}`
export const OLLAMA_API_URL = `http://${SERVICE_HOST}:${OLLAMA_PORT}`
export const OLLAMA_TAGS_URL = `${OLLAMA_API_URL}/api/tags`
