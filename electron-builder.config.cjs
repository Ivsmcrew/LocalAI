const { loadAppEnv } = require('./src/shared/env/load.cjs')

const { APP_ID, APP_NAME } = loadAppEnv()

/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId: APP_ID,
  productName: APP_NAME,
  mac: {
    category: 'public.app-category.productivity',
    icon: 'resources/icon.png',
    target: ['dmg', 'dir'],
  },
  directories: {
    output: 'release',
  },
  extraResources: [
    {
      from: 'resources/docker-compose.template.yml',
      to: 'docker-compose.template.yml',
    },
  ],
  files: ['out/**/*'],
}
