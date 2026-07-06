/** @type {Record<string, { type: 'string' | 'number' | 'csv', envKey?: string }>} */
const ENV_SCHEMA = {
  APP_ID: { type: 'string' },
  APP_NAME: { type: 'string' },
  SERVICE_HOST: { type: 'string' },
  WEBUI_PORT: { type: 'number' },
  OLLAMA_PORT: { type: 'number' },
  CONTAINER_NAME: { type: 'string' },
  DOCKER_IMAGE: { type: 'string' },
  DEFAULT_MODEL: { type: 'string' },
  DEFAULT_MODELS: { type: 'csv' },
  REQUEST_TIMEOUT_MS: { type: 'number' },
}

module.exports = { ENV_SCHEMA }
