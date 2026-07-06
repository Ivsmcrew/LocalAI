const fs = require('fs')
const path = require('path')

/** @param {string} filePath */
function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  /** @type {Record<string, string>} */
  const env = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
  }
  return env
}

/** @param {string} mode */
function loadBuildEnv(mode) {
  const env = parseEnvFile(path.resolve(__dirname, '.env'))

  const req = (key) => {
    const value = env[key]
    if (!value) throw new Error(`Missing .env variable: ${key}`)
    return value
  }

  return {
    APP_ID: req('APP_ID'),
    APP_NAME: req('APP_NAME'),
    SERVICE_HOST: req('SERVICE_HOST'),
    WEBUI_PORT: Number(req('WEBUI_PORT')),
    OLLAMA_PORT: Number(req('OLLAMA_PORT')),
    CONTAINER_NAME: req('CONTAINER_NAME'),
    DOCKER_IMAGE: req('DOCKER_IMAGE'),
    DEFAULT_MODEL: req('DEFAULT_MODEL'),
    DEFAULT_MODELS: req('DEFAULT_MODELS').split(',').map((m) => m.trim()),
    REQUEST_TIMEOUT_MS: Number(req('REQUEST_TIMEOUT_MS')),
    OPEN_DEVTOOLS: mode === 'development' && env.DEV_OPEN_DEVTOOLS === 'true',
  }
}

module.exports = { loadBuildEnv }
