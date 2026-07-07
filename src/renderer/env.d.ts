import type { LocalAIApi } from '../preload/index'

/** Это нужно для того чтобы TypeScript знал что переменные окружения доступны в процессе renderer */
/// <reference types="vite/client" />

/** Глобальный интерфейс для доступа к IPC в процессе renderer */
declare global {
  interface Window {
    api: LocalAIApi
  }
}