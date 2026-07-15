import { resolve } from 'path'
import type { Plugin } from 'vite'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

/** Убирает crossorigin из index.html для обработки CORS */
function removeCrossOriginPlugin(): Plugin {
  return {
    name: 'remove-crossorigin',
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replace(/ crossorigin/g, '')
    },
  }
}

/** Элиасы для импортов в проекте */
const sharedAlias = {
  '@main': resolve(__dirname, 'src/main'),
  '@preload': resolve(__dirname, 'src/preload'),
  '@renderer': resolve(__dirname, 'src/renderer'),
  '@shared': resolve(__dirname, 'src/shared'),
}

export default defineConfig(() => {
  return {
    /** Main process — backend приложения: оркестрация сервисов */
    main: {
      resolve: { alias: sharedAlias },
      plugins: [externalizeDepsPlugin()],
      build: {
        rollupOptions: {
          input: {
            index: resolve(__dirname, 'src/main/index.ts'),
          },
          output: {
            format: 'es' as const,
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
          output: {
            format: 'es' as const,
          },
        },
      },
    },
    /** Renderer process — frontend приложения: UI */
    renderer: {
      resolve: { alias: sharedAlias },
      root: resolve(__dirname, 'src/renderer'),
      base: './',
      build: {
        modulePreload: false,
        rollupOptions: {
          input: {
            index: resolve(__dirname, 'src/renderer/index.html'),
          },
        },
      },
      plugins: [react(), removeCrossOriginPlugin()],
    },
  }
})
