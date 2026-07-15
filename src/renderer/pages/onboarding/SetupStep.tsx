import { useState } from 'react'
import { env } from '@shared/env'
import type { InitProgress } from '@shared/types'
import styles from './Onboarding.module.css'

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
  initComplete: boolean
  opening: boolean
  onInitialize: (model: string) => void
  onOpenLocalAI: () => void
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** i
  return `${value < 10 && i > 0 ? value.toFixed(1) : Math.round(value)} ${units[i]}`
}

export function SetupStep({
  loading,
  error,
  initProgress,
  initComplete,
  opening,
  onInitialize,
  onOpenLocalAI,
}: Props) {
  const [model, setModel] = useState<string>(env.DEFAULT_MODELS[0])
  const [customModel, setCustomModel] = useState('')
  const [useCustom, setUseCustom] = useState(false)

  const selectedModel = useCustom ? customModel.trim() : model
  const currentStepIndex = initProgress
    ? STEPS.findIndex((s) => s.id === initProgress.step)
    : -1

  const downloadPercent =
    initProgress?.download && initProgress.download.total > 0
      ? Math.round((initProgress.download.completed / initProgress.download.total) * 100)
      : null

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Set up {env.APP_NAME}</h2>
      <p className={styles.subtitle}>
        First-time setup will check your computer, download Open WebUI, and pull an Ollama model.
        This may take several minutes.
      </p>

      <div className={styles.steps}>
        {STEPS.map((step, i) => {
          const active = !initComplete && currentStepIndex === i
          const stepDone = initComplete || currentStepIndex > i
          return (
            <div
              key={step.id}
              className={`${styles.step} ${stepDone ? styles.done : ''} ${active ? styles.active : ''}`}
            >
              <span className={styles.stepIcon}>{stepDone ? '✓' : active ? '●' : '○'}</span>
              <span>{step.label}</span>
            </div>
          )
        })}
      </div>

      {initProgress && !initComplete && (
        <>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${initProgress.percent}%` }} />
            <span className={styles.progressText}>{initProgress.message}</span>
          </div>

          {downloadPercent !== null && initProgress.download && (
            <div className={styles.downloadProgress}>
              <div className={styles.downloadHeader}>
                <span>Model download</span>
                <span>
                  {formatBytes(initProgress.download.completed)} /{' '}
                  {formatBytes(initProgress.download.total)} ({downloadPercent}%)
                </span>
              </div>
              <div className={styles.downloadBar}>
                <div className={styles.downloadFill} style={{ width: `${downloadPercent}%` }} />
              </div>
            </div>
          )}
        </>
      )}

      {!loading && !initComplete && (
        <div className={styles.modelSelect}>
          <label className={styles.label}>Default model</label>
          <div className={styles.modelOptions}>
            {env.DEFAULT_MODELS.map((m) => (
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
              placeholder={`e.g. ${env.DEFAULT_MODEL}`}
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

      {initComplete ? (
        <button className={styles.primaryBtn} disabled={opening} onClick={onOpenLocalAI}>
          {opening ? 'Opening...' : `Open ${env.APP_NAME}`}
        </button>
      ) : (
        <button
          className={styles.primaryBtn}
          disabled={loading || !selectedModel}
          onClick={() => onInitialize(selectedModel)}
        >
          {loading ? 'Initializing...' : 'Start initialization'}
        </button>
      )}
    </div>
  )
}
