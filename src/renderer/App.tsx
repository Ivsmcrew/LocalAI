import { ControlPanel } from './components/ControlPanel'
import { InitWizard } from './components/InitWizard'
import { useStack } from './hooks/useStack'
import styles from './App.module.css'

export default function App() {
  const { status, logs, loading, error, initProgress, initialize, start, stop, openChat } =
    useStack()

  if (!status) {
    return (
      <div className={styles.loading}>
        {error ?? 'Loading...'}
      </div>
    )
  }

  if (!status.initialized) {
    return (
      <div className={styles.app}>
        <InitWizard
          loading={loading}
          error={error}
          initProgress={initProgress}
          onInitialize={initialize}
        />
      </div>
    )
  }

  return (
    <div className={styles.app}>
      <ControlPanel
        status={status}
        logs={logs}
        loading={loading}
        error={error}
        onStart={start}
        onStop={stop}
        onOpenChat={openChat}
      />
    </div>
  )
}
