import { mkdir, readFile, writeFile, access } from 'fs/promises'
import { join } from 'path'
import { constants } from 'fs'
import { homedir } from 'os'
import type { AppConfig } from '@shared/types'
import {
  APP_NAME,
  CONTAINER_NAME,
  DOCKER_IMAGE,
  OLLAMA_PORT,
  WEBUI_PORT,
} from '@shared/env'

const CONFIG_DIR = join(homedir(), 'Library', 'Application Support', APP_NAME)
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')
const COMPOSE_FILE = join(CONFIG_DIR, 'docker-compose.yml')

export class ConfigService {
  getUserDataPath(): string {
    return CONFIG_DIR
  }

  getComposePath(): string {
    return COMPOSE_FILE
  }

  async ensureUserDataDir(): Promise<void> {
    await mkdir(CONFIG_DIR, { recursive: true })
  }

  async readConfig(): Promise<AppConfig | null> {
    try {
      const raw = await readFile(CONFIG_FILE, 'utf-8')
      return JSON.parse(raw) as AppConfig
    } catch {
      return null
    }
  }

  async writeConfig(config: AppConfig): Promise<void> {
    await this.ensureUserDataDir()
    await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8')
  }

  async setupComposeFile(templatePath: string): Promise<string> {
    await this.ensureUserDataDir()
    const template = await readFile(templatePath, 'utf-8')
    const compose = template
      .replaceAll('{{CONTAINER_NAME}}', CONTAINER_NAME)
      .replaceAll('{{DOCKER_IMAGE}}', DOCKER_IMAGE)
      .replaceAll('{{WEBUI_PORT}}', String(WEBUI_PORT))
      .replaceAll('{{OLLAMA_PORT}}', String(OLLAMA_PORT))
    await writeFile(COMPOSE_FILE, compose, 'utf-8')
    return COMPOSE_FILE
  }

  async configExists(): Promise<boolean> {
    try {
      await access(CONFIG_FILE, constants.F_OK)
      return true
    } catch {
      return false
    }
  }
}

export { CONFIG_DIR, CONFIG_FILE, COMPOSE_FILE }
