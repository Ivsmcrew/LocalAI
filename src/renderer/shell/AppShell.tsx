import { useEffect, useState } from 'react'
import type { StackStatus } from '@shared/types'
import { RightSidebar } from './RightSidebar'
import { ChatPage } from '../pages/ChatPage'
import styles from './AppShell.module.css'

interface Props {
  status: StackStatus
  logs: string[]
  loading: boolean
  error: string | null
  onStart: () => void
  onStop: () => void
  onEnterShell: () => void
}

export function AppShell({
  status,
  logs,
  loading,
  error,
  onStart,
  onStop,
  onEnterShell,
}: Props) {
  const [rightOpen, setRightOpen] = useState(true)

  useEffect(() => {
    onEnterShell()
  }, [onEnterShell])

  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <ChatPage status={status} />
      </main>

      <RightSidebar
        open={rightOpen}
        status={status}
        logs={logs}
        loading={loading}
        error={error}
        onStart={onStart}
        onStop={onStop}
        onToggle={() => setRightOpen((v) => !v)}
      />
    </div>
  )
}
