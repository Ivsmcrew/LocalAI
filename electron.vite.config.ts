import { resolve } from 'path'
import { createRequire } from 'module'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

const require = createRequire(import.meta.url)
const { loadAppEnv } = require('./src/shared/env/load.cjs')

/** Элиасы для импортов в проекте */
const sharedAlias = {
  '@main': resolve(__dirname, 'src/main'),
  '@preload': resolve(__dirname, 'src/preload'),
  '@renderer': resolve(__dirname, 'src/renderer'),
  '@shared': resolve(__dirname, 'src/shared'),
}

export default defineConfig(() => {
  const envDefine = {
    __LOCALAI_ENV__: JSON.stringify(loadAppEnv()),
  }

  return {
    /** Main process — backend приложения: оркестрация сервисов */
    main: {
      resolve: { alias: sharedAlias },
      plugins: [externalizeDepsPlugin()],
      define: envDefine,
      build: {
        rollupOptions: {
          input: {
            index: resolve(__dirname, 'src/main/index.ts'),
          },
        },
      },
    },
    /** Preload process — contextBridge, безопасный API для UI */
    preload: {
      resolve: { alias: sharedAlias },
      plugins: [externalizeDepsPlugin()],
      build: {
        rollupOptions: {
          input: {
            index: resolve(__dirname, 'src/preload/index.ts'),
          },
        },
      },
    },
    /** Renderer process — frontend приложения: UI */
    renderer: {
      resolve: { alias: sharedAlias },
      root: resolve(__dirname, 'src/renderer'),
      base: './',
      define: envDefine,
      build: {
        modulePreload: false,
        rollupOptions: {
          input: {
            index: resolve(__dirname, 'src/renderer/index.html'),
          },
        },
      },
      plugins: [react()],
    },
  }
})
