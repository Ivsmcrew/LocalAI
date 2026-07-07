import type { AppEnv } from './schema'

declare const __LOCALAI_ENV__: AppEnv

/** 
 * Переменные окружения для доступа в процессах 
 * Во время сборки electron-vite берет __LOCALAI_ENV__ и заменяет на .env файл
 * */
export const env: AppEnv = __LOCALAI_ENV__

/** URL для доступа к веб-интерфейсу */
export const WEBUI_URL = `http://${env.SERVICE_HOST}:${env.WEBUI_PORT}`
/** URL для доступа к API Ollama */
export const OLLAMA_API_URL = `http://${env.SERVICE_HOST}:${env.OLLAMA_PORT}`
/** URL для доступа к API Ollama tags */
export const OLLAMA_TAGS_URL = `${OLLAMA_API_URL}/api/tags`
