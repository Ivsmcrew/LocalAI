import { ServiceStatus } from '../components/ServiceStatus'
import { LogViewer } from '../components/LogViewer'
import type { StackStatus } from '@shared/types'
import { APP_NAME } from '@shared/env'
import styles from './ControlPanel.module.css'

interface Props {
  status: StackStatus
  logs: string[]
  loading: boolean
  error: string | null
  onStart: () => void
  onStop: () => void
  onOpenChat: () => void
}

export function ControlPanel({
  status,
  logs,
  loading,
  error,
  onStart,
  onStop,
  onOpenChat,
}: Props) {
  const isRunning = status.webui.state === 'ready'

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{APP_NAME}</h1>
        <span className={`${styles.badge} ${isRunning ? styles.badgeReady : styles.badgeIdle}`}>
          {isRunning ? 'Running' : 'Stopped'}
        </span>
      </header>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} disabled={loading || isRunning} onClick={onStart}>
          {loading && !isRunning ? 'Starting...' : 'Start'}
        </button>
        <button className={styles.btnSecondary} disabled={loading || !isRunning} onClick={onStop}>
          Stop
        </button>
        <button className={styles.btnSecondary} disabled={!isRunning} onClick={onOpenChat}>
          Open Chat
        </button>
      </div>

      {status.defaultModel && (
        <div className={styles.modelInfo}>Model: {status.defaultModel}</div>
      )}

      {!loading && !isRunning && status.initialized && (
        <div className={styles.hint}>Stack is ready. Press Start to launch the chat.</div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      <section className={styles.statusSection}>
        <h2 className={styles.sectionTitle}>Services</h2>
        <ServiceStatus name="Docker" service={status.docker} />
        <ServiceStatus name="Ollama" service={status.ollama} />
        <ServiceStatus name="WebUI" service={status.webui} />
      </section>

      <LogViewer logs={logs} />
    </div>
  )
}
