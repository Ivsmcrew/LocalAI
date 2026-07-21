import 'dotenv/config'

/** Переменные окружения для electron-builder (запускается вне electron-vite, обычным Node) */
const APP_ID = process.env.VITE_APP_ID
const APP_NAME = process.env.VITE_APP_NAME

/** Конфигурация сборки для Electron Builder */
export default {
  appId: APP_ID,
  productName: APP_NAME,
  mac: {
    category: 'public.app-category.productivity',
    icon: 'resources/icon.png',
    target: ['dmg', 'dir']
  },
  directories: {
    output: 'release'
  },
  extraResources: [
    {
      from: 'resources/docker-compose.template.yml',
      to: 'docker-compose.template.yml'
    },
    {
      from: 'resources/searxng',
      to: 'searxng'
    }
  ],
  files: ['out/**/*']
}
