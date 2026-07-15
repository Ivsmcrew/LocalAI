/**
 * Приводим переменные окружения к типу AppEnv
 *
 * electron-vite загружает .env и expose'ит переменные через import.meta.env
 * (префикс VITE_ доступен во всех процессах). Здесь приводим типы (number/csv)
 * и валидируем обязательные переменные при загрузке модуля.
 */

import type { AppEnv } from '@shared/types'

/** Получение переменных окружения из import.meta.env */
const rawEnv = import.meta.env

/** Получение обязательной переменной окружения */
function req(name: string): string {
  const value = rawEnv[name]
  if (value === undefined || value === '') {
    throw new Error(
      `Missing required env variable: ${name}. See .env.example for the full list.`
    )
  }
  return value
}

/** Приведение переменной окружения к типу number */
function num(name: string): number {
  const value = req(name)
  const n = Number(value)
  if (Number.isNaN(n)) {
    throw new Error(`Env variable ${name} is not a valid number: got "${value}"`)
  }
  return n
}

/** Приведение переменной окружения к типу string[] */
function csv(name: string): string[] {
  const value = req(name)
  return value
    .split(',')
    .map((m) => m.trim())
    .filter((m) => m.length > 0)
}

export const env: AppEnv = {
  APP_ID: req('VITE_APP_ID'),
  APP_NAME: req('VITE_APP_NAME'),
  SERVICE_HOST: req('VITE_SERVICE_HOST'),
  WEBUI_PORT: num('VITE_WEBUI_PORT'),
  OLLAMA_PORT: num('VITE_OLLAMA_PORT'),
  CONTAINER_NAME: req('VITE_CONTAINER_NAME'),
  DOCKER_IMAGE: req('VITE_DOCKER_IMAGE'),
  DEFAULT_MODEL: req('VITE_DEFAULT_MODEL'),
  DEFAULT_MODELS: csv('VITE_DEFAULT_MODELS'),
  REQUEST_TIMEOUT_MS: num('VITE_REQUEST_TIMEOUT_MS')
}

/** URL для доступа к веб-интерфейсу */
export const WEBUI_URL = `http://${env.SERVICE_HOST}:${env.WEBUI_PORT}`
/** URL для доступа к API Ollama */
export const OLLAMA_API_URL = `http://${env.SERVICE_HOST}:${env.OLLAMA_PORT}`
/** URL для доступа к API Ollama tags */
export const OLLAMA_TAGS_URL = `${OLLAMA_API_URL}/api/tags`
