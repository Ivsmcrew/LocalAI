import { resolve } from 'path'
import { createRequire } from 'module'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

const require = createRequire(import.meta.url)
const { loadBuildEnv } = require('./env.build.cjs')

/** Элиасы для импортов в проекте */
const sharedAlias = {
  '@main': resolve(__dirname, 'src/main'),
  '@preload': resolve(__dirname, 'src/preload'),
  '@renderer': resolve(__dirname, 'src/renderer'),
  '@shared': resolve(__dirname, 'src/shared'),
}

export default defineConfig(({ mode }) => {
  /** Подстановка переменных из .env в код на этапе сборки в переменную __LOCALAI_ENV__ */
  const define = {
    __LOCALAI_ENV__: JSON.stringify(loadBuildEnv(mode)),
  }

  return {
    /** Main process — backend приложения: оркестрация сервисов */
    main: {
      resolve: { alias: sharedAlias },
      plugins: [externalizeDepsPlugin()],
      define,
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
      define,
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
      define,
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
