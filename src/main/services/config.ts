import { mkdir, readFile, writeFile, copyFile, access } from 'fs/promises'
import { join } from 'path'
import { constants } from 'fs'
import { homedir } from 'os'
import type { AppConfig } from '../../shared/types'

const CONFIG_DIR = join(homedir(), 'Library', 'Application Support', 'LocalAI')
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
    await copyFile(templatePath, COMPOSE_FILE)
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
