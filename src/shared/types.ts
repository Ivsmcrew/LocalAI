/** Состояние сервиса (Open WebUI, Ollama, Docker) */
export type ServiceState = 'idle' | 'starting' | 'ready' | 'error' | 'stopped'

/** Полный набор переменных окружения приложения */
export type AppEnv = {
  /** ID приложения */
  APP_ID: string
  /** Название приложения */
  APP_NAME: string
  /** Общий хост на котором работают Open WebUI и Ollama */
  SERVICE_HOST: string
  /** Порт веб-интерфейса (Open WebUI) */
  WEBUI_PORT: number
  /** Порт Ollama (LLM сервис) */
  OLLAMA_PORT: number
  /** Имя контейнера (Open WebUI) */
  CONTAINER_NAME: string
  /** Имя Docker образа (Open WebUI) */
  DOCKER_IMAGE: string
  /** Имя контейнера SearXNG */
  SEARXNG_CONTAINER_NAME: string
  /** Docker образ SearXNG */
  SEARXNG_IMAGE: string
  /** Порт SearXNG на хосте */
  SEARXNG_PORT: number
  /** Модель по умолчанию */
  DEFAULT_MODEL: string
  /** Модели по умолчанию */
  DEFAULT_MODELS: string[]
  /** Таймаут запроса к WebUI и Ollama */
  REQUEST_TIMEOUT_MS: number
}

/** Состояние сервиса (Open WebUI, Ollama, Docker) */
export interface ServiceStatus {
  state: ServiceState
  message?: string
}

/** Состояние стека сервисов (Open WebUI, Ollama, Docker) */
export interface StackStatus {
  /** Флаг инициализации приложения */
  initialized: boolean
  /** Флаг запуска приложения */
  running: boolean
  /** Модель по умолчанию */
  defaultModel?: string
  /** Состояние Docker */
  docker: ServiceStatus
  /** Состояние Ollama */
  ollama: ServiceStatus
  /** Состояние Open WebUI */
  webui: ServiceStatus
}

/** Конфигурация приложения */
export interface AppConfig {
  /** Флаг инициализации приложения */
  initialized: boolean
  /** Время инициализации приложения */
  initializedAt?: string
  /** Модель по умолчанию */
  defaultModel: string
  /** Путь к файлу compose */
  composePath: string
  /** Путь к пользовательским данным */
  userDataPath: string
}

/** Шаги инициализации приложения */
export type InitStepId =
  | 'preflight'
  | 'setup-files'
  | 'docker'
  | 'ollama'
  | 'smoke-test'
  | 'finalize'

/** Прогресс загрузки модели Ollama */
export interface ModelDownloadProgress {
  completed: number
  total: number
  digest?: string
}

/** Индикатор прогресса инициализации приложения */
export interface InitProgress {
  /** Шаг инициализации */
  step: InitStepId
  /** Процент выполнения */
  percent: number
  /** Сообщение */
  message: string
  /** Прогресс загрузки модели (байты) */
  download?: ModelDownloadProgress
}

/** Bounds for the embedded Open WebUI view (CSS pixels). */
export interface ViewBounds {
  x: number
  y: number
  width: number
  height: number
}
