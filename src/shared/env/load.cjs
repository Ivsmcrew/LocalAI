const fs = require('fs')
const path = require('path')
const { parse } = require('dotenv')
const { ENV_SCHEMA } = require('./schema.cjs')

const PROJECT_ROOT = path.resolve(__dirname, '../../..')

/** @param {string} [envFile] */
function readEnvFile(envFile = path.join(PROJECT_ROOT, '.env')) {
  const content = fs.readFileSync(envFile, 'utf8')
  return parse(content)
}

/** @param {string} type @param {string} raw */
function parseValue(type, raw) {
  switch (type) {
    case 'string':
      return raw
    case 'number':
      return Number(raw)
    case 'csv':
      return raw.split(',').map((m) => m.trim())
    default:
      throw new Error(`Unknown env field type: ${type}`)
  }
}

/** @param {string} [envFile] */
function loadAppEnv(envFile) {
  const raw = readEnvFile(envFile)
  /** @type {Record<string, unknown>} */
  const result = {}

  for (const [key, spec] of Object.entries(ENV_SCHEMA)) {
    const envKey = spec.envKey ?? key
    const value = raw[envKey]
    if (value === undefined || value === '') {
      throw new Error(`Missing .env variable: ${envKey}`)
    }
    result[key] = parseValue(spec.type, value)
  }

  return result
}

module.exports = { loadAppEnv, PROJECT_ROOT }
