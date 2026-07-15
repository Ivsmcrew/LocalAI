import { ServiceStatus } from '../components/ServiceStatus'
import { LogViewer } from '../components/LogViewer'
import type { StackStatus } from '@shared/types'
import { env } from '@shared/env'
import styles from './RightSidebar.module.css'

interface Props {
  open: boolean
  status: StackStatus
  logs: string[]
  loading: boolean
  error: string | null
  onStart: () => void
  onStop: () => void
  onToggle: () => void
}

export function RightSidebar({
  open,
  status,
  logs,
  loading,
  error,
  onStart,
  onStop,
  onToggle,
}: Props) {
  const isRunning = status.webui.state === 'ready'

  return (
    <aside className={`${styles.aside} ${open ? styles.open : styles.collapsed}`}>
      <button type="button" className={styles.toggle} onClick={onToggle} title={open ? 'Collapse panel' : 'Expand panel'}>
        {open ? '⟩' : '⟨'}
      </button>

      {open && (
        <div className={styles.content}>
          <header className={styles.header}>
            <h2 className={styles.title}>Stack</h2>
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
          </div>

          {status.defaultModel && (
            <div className={styles.modelInfo}>Model: {status.defaultModel}</div>
          )}

          {!loading && !isRunning && (
            <div className={styles.hint}>Press Start to launch Docker and Ollama.</div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <section className={styles.statusSection}>
            <h3 className={styles.sectionTitle}>Services</h3>
            <ServiceStatus name="Docker" service={status.docker} />
            <ServiceStatus name="Ollama" service={status.ollama} />
            <ServiceStatus name="WebUI" service={status.webui} />
          </section>

          <div className={styles.logs}>
            <LogViewer logs={logs} />
          </div>

          <div className={styles.appName}>{env.APP_NAME}</div>
        </div>
      )}
    </aside>
  )
}
