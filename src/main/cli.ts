#!/usr/bin/env node
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { getStackManager } from './stack'

const __dirname = dirname(fileURLToPath(import.meta.url))
const composeTemplate = join(__dirname, '../../resources/docker-compose.template.yml')

const manager = getStackManager()
manager.onLog((line) => console.log(line))

const command = process.argv[2]

async function main(): Promise<void> {
  switch (command) {
    // Первичная настройка: создание шаблона docker-compose, загрузка модели Ollama, запуск WebUI
    case 'init': {
      const model = process.argv[3] ?? 'llama3.2'
      manager.onInitProgress((p) =>
        console.log(`[${p.percent}%] ${p.step}: ${p.message}`),
      )
      await manager.initialize({ defaultModel: model, composeTemplatePath: composeTemplate })
      break
    }
    // Запуск стека: запуск контейнеров docker, запуск WebUI
    case 'start':
      await manager.start()
      console.log('Stack started. Open http://localhost:3000 in your browser.')
      break
    // Остановка стека: остановка контейнеров docker, остановка WebUI
    case 'stop':
      await manager.stop()
      break
    // Статус стека: проверка статуса контейнеров docker, проверка статуса WebUI
    case 'status': {
      const status = await manager.getStatus()
      console.log(JSON.stringify(status, null, 2))
      break
    }
    default:
      console.log('Usage: cli.ts <init|start|stop|status> [model]')
      process.exit(1)
  }
}

main().catch((err) => {
  console.error('Error:', err instanceof Error ? err.message : err)
  process.exit(1)
})
