import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parse } from 'dotenv'
import { ENV_SCHEMA, type AppEnv, type EnvFieldType } from './schema'

/** Корневая директория рабочего процесса Node.js */
export const PROJECT_ROOT = process.cwd()

/** Чтение файла .env */
function readEnvFile(envFile: string): Record<string, string> {
  let content: string
  try {
    content = readFileSync(envFile, 'utf8')
  } catch {
    throw new Error(
      `Missing .env file at ${envFile}. Run: cp .env.example .env`
    )
  }
  return parse(content)
}

/** Парсинг и преобразование значения переменной окружения */
function parseValue(type: EnvFieldType, raw: string): string | number | string[] {
  switch (type) {
    case 'string':
      return raw
    case 'number': {
      const n = Number(raw)
      if (Number.isNaN(n)) {
        throw new Error(`Env variable is not a valid number: got "${raw}"`)
      }
      return n
    }
    case 'csv':
      return raw
        .split(',')
        .map((m) => m.trim())
        .filter((m) => m.length > 0)
    default:
      throw new Error(`Unknown env field type: ${type as never}`)
  }
}

/** Загрузка переменных окружения из файла и сборка в формате AppEnv(build-time) */
export function loadAppEnv(envFile: string = resolve(PROJECT_ROOT, '.env')): AppEnv {
  const raw = readEnvFile(envFile)
  const result: Record<string, unknown> = {}
  const missing: string[] = []

  for (const [key, spec] of Object.entries(ENV_SCHEMA)) {
    const value = raw[key]
    if (value === undefined || value === '') {
      missing.push(key)
      continue
    }
    result[key] = parseValue(spec.type, value)
  }

  /** Проверка на отсутствие обязательных переменных окружения */
  if (missing.length > 0) {
    throw new Error(
      `Missing required .env variable(s): ${missing.join(', ')}. ` +
        `See .env.example for the full list.`
    )
  }

  return result as AppEnv
}
