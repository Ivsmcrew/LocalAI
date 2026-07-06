/// <reference types="vite/client" />

import type { LocalAIApi } from '../preload/index'

declare global {
  interface Window {
    api: LocalAIApi
  }
}

export {}
