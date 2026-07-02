import { useState } from 'react'
import { DEFAULT_MODELS, type InitProgress } from '../../shared/types'
import styles from './InitWizard.module.css'

const STEPS = [
  { id: 'preflight', label: 'System check' },
  { id: 'setup-files', label: 'Configuration' },
  { id: 'docker', label: 'Open WebUI' },
  { id: 'ollama', label: 'Ollama model' },
  { id: 'smoke-test', label: 'Verification' },
  { id: 'finalize', label: 'Done' },
] as const

interface Props {
  loading: boolean
  error: string | null
  initProgress: InitProgress | null
  onInitialize: (model: string) => void
}

export function InitWizard({ loading, error, initProgress, onInitialize }: Props) {
  const [model, setModel] = useState<string>(DEFAULT_MODELS[0])
  const [customModel, setCustomModel] = useState('')
  const [useCustom, setUseCustom] = useState(false)

  const selectedModel = useCustom ? customModel.trim() : model
  const currentStepIndex = initProgress
    ? STEPS.findIndex((s) => s.id === initProgress.step)
    : -1

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Welcome to LocalAI</h2>
      <p className={styles.subtitle}>
        First-time setup will download Open WebUI and an Ollama model. This may take several
        minutes.
      </p>

      <div className={styles.steps}>
        {STEPS.map((step, i) => {
          const done = currentStepIndex > i
          const active = currentStepIndex === i
          return (
            <div
              key={step.id}
              className={`${styles.step} ${done ? styles.done : ''} ${active ? styles.active : ''}`}
            >
              <span className={styles.stepIcon}>{done ? '✓' : active ? '●' : '○'}</span>
              <span>{step.label}</span>
            </div>
          )
        })}
      </div>

      {initProgress && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${initProgress.percent}%` }} />
          <span className={styles.progressText}>{initProgress.message}</span>
        </div>
      )}

      {!loading && (
        <div className={styles.modelSelect}>
          <label className={styles.label}>Default model</label>
          <div className={styles.modelOptions}>
            {DEFAULT_MODELS.map((m) => (
              <label key={m} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="model"
                  value={m}
                  checked={!useCustom && model === m}
                  onChange={() => {
                    setUseCustom(false)
                    setModel(m)
                  }}
                />
                {m}
              </label>
            ))}
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="model"
                checked={useCustom}
                onChange={() => setUseCustom(true)}
              />
              Custom
            </label>
          </div>
          {useCustom && (
            <input
              className={styles.customInput}
              type="text"
              placeholder="e.g. llama3.2"
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
            />
          )}
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <strong>Error:</strong> {error}
          {error.includes('Docker') && (
            <a
              href="https://www.docker.com/products/docker-desktop/"
              className={styles.link}
              onClick={(e) => {
                e.preventDefault()
                window.open('https://www.docker.com/products/docker-desktop/')
              }}
            >
              Download Docker Desktop
            </a>
          )}
          {error.includes('Ollama') && (
            <a
              href="https://ollama.com/download"
              className={styles.link}
              onClick={(e) => {
                e.preventDefault()
                window.open('https://ollama.com/download')
              }}
            >
              Download Ollama
            </a>
          )}
        </div>
      )}

      <button
        className={styles.primaryBtn}
        disabled={loading || !selectedModel}
        onClick={() => onInitialize(selectedModel)}
      >
        {loading ? 'Initializing...' : 'Start initialization'}
      </button>
    </div>
  )
}
