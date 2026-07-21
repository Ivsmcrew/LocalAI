/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** ID приложения */
  readonly VITE_APP_ID: string
  /** Название приложения */
  readonly VITE_APP_NAME: string
  /** Общий хост на котором работают Open WebUI и Ollama */
  readonly VITE_SERVICE_HOST: string
  /** Порт веб-интерфейса (Open WebUI) */
  readonly VITE_WEBUI_PORT: string
  /** Порт Ollama (LLM сервис) */
  readonly VITE_OLLAMA_PORT: string
  /** Имя контейнера (Open WebUI) */
  readonly VITE_CONTAINER_NAME: string
  /** Имя Docker образа (Open WebUI) */
  readonly VITE_DOCKER_IMAGE: string
  /** Имя контейнера SearXNG */
  readonly VITE_SEARXNG_CONTAINER_NAME: string
  /** Docker образ SearXNG */
  readonly VITE_SEARXNG_IMAGE: string
  /** Порт SearXNG на хосте */
  readonly VITE_SEARXNG_PORT: string
  /** Модель по умолчанию */
  readonly VITE_DEFAULT_MODEL: string
  /** Модели по умолчанию */
  readonly VITE_DEFAULT_MODELS: string
  /** Таймаут запроса к WebUI и Ollama */
  readonly VITE_REQUEST_TIMEOUT_MS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
