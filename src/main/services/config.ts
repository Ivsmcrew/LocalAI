import { mkdir, readFile, writeFile, access, cp } from 'fs/promises'
import { join } from 'path'
import { constants } from 'fs'
import { homedir } from 'os'
import type { AppConfig } from '@shared/types'
import { env } from '@shared/env'

const CONFIG_DIR = join(homedir(), 'Library', 'Application Support', env.APP_NAME)
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')
const COMPOSE_FILE = join(CONFIG_DIR, 'docker-compose.yml')
const SEARXNG_DIR = join(CONFIG_DIR, 'searxng')

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

  async setupComposeFile(templatePath: string, searxngTemplateDir: string): Promise<string> {
    await this.ensureUserDataDir()
    const template = await readFile(templatePath, 'utf-8')
    const compose = template
      .replaceAll('{{CONTAINER_NAME}}', env.CONTAINER_NAME)
      .replaceAll('{{DOCKER_IMAGE}}', env.DOCKER_IMAGE)
      .replaceAll('{{WEBUI_PORT}}', String(env.WEBUI_PORT))
      .replaceAll('{{OLLAMA_PORT}}', String(env.OLLAMA_PORT))
      .replaceAll('{{SEARXNG_CONTAINER_NAME}}', env.SEARXNG_CONTAINER_NAME)
      .replaceAll('{{SEARXNG_IMAGE}}', env.SEARXNG_IMAGE)
      .replaceAll('{{SEARXNG_PORT}}', String(env.SEARXNG_PORT))
    await writeFile(COMPOSE_FILE, compose, 'utf-8')
    await this.setupSearxngConfig(searxngTemplateDir)
    return COMPOSE_FILE
  }

  /** Copy bundled SearXNG config into user data (JSON format must be enabled). */
  private async setupSearxngConfig(templateDir: string): Promise<void> {
    await mkdir(SEARXNG_DIR, { recursive: true })
    await cp(templateDir, SEARXNG_DIR, { recursive: true, force: true })
  }

  async isConfigExists(): Promise<boolean> {
    try {
      await access(CONFIG_FILE, constants.F_OK)
      return true
    } catch {
      return false
    }
  }
}

export { CONFIG_DIR, CONFIG_FILE, COMPOSE_FILE, SEARXNG_DIR }
