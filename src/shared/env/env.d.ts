/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** ID приложения */
  readonly VITE_APP_ID: string
  /** Название приложения */
  readonly VITE_APP_NAME: string
  /** Хост сервиса */
  readonly VITE_SERVICE_HOST: string
  /** Порт веб-интерфейса */
  readonly VITE_WEBUI_PORT: string
  /** Порт Ollama */
  readonly VITE_OLLAMA_PORT: string
  /** Имя контейнера */
  readonly VITE_CONTAINER_NAME: string
  /** Имя Docker образа */
  readonly VITE_DOCKER_IMAGE: string
  /** Модель по умолчанию */
  readonly VITE_DEFAULT_MODEL: string
  /** Модели по умолчанию */
  readonly VITE_DEFAULT_MODELS: string
  /** Таймаут запроса */
  readonly VITE_REQUEST_TIMEOUT_MS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
