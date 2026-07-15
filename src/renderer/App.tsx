import { useCallback, useEffect, useState } from 'react'
import { Onboarding } from './pages/onboarding/Onboarding'
import { AppShell } from './shell/AppShell'
import { useStack } from './hooks/useStack'
import styles from './App.module.css'

export default function App() {
  const {
    status,
    logs,
    loading,
    error,
    initProgress,
    initialize,
    start,
    stop,
    enterShell,
  } = useStack()
  const [opening, setOpening] = useState(false)
  /** null = not decided yet (avoids onboarding flash for returning users) */
  const [shellUnlocked, setShellUnlocked] = useState<boolean | null>(null)

  useEffect(() => {
    if (!status || shellUnlocked !== null) return
    // Returning user: enter shell immediately. Fresh install: stay in onboarding.
    setShellUnlocked(status.initialized)
  }, [status, shellUnlocked])

  const handleEnterShell = useCallback(() => {
    void enterShell()
  }, [enterShell])

  const handleOpenLocalAI = async () => {
    setOpening(true)
    try {
      await start()
      await enterShell()
      setShellUnlocked(true)
    } finally {
      setOpening(false)
    }
  }

  if (!status || shellUnlocked === null) {
    return <div className={styles.loading}>{error ?? 'Loading...'}</div>
  }

  if (!status.initialized || !shellUnlocked) {
    return (
      <div className={styles.app}>
        <Onboarding
          loading={loading}
          error={error}
          initProgress={initProgress}
          initComplete={status.initialized}
          opening={opening}
          onInitialize={initialize}
          onOpenLocalAI={handleOpenLocalAI}
        />
      </div>
    )
  }

  return (
    <AppShell
      status={status}
      logs={logs}
      loading={loading}
      error={error}
      onStart={start}
      onStop={stop}
      onEnterShell={handleEnterShell}
    />
  )
}
