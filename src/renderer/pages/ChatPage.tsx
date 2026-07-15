import { WEBUI_URL } from '@shared/env'
import type { StackStatus } from '@shared/types'
import styles from './ChatPage.module.css'

interface Props {
  status: StackStatus
}

export function ChatPage({ status }: Props) {
  const ready = status.webui.state === 'ready'

  if (!ready) {
    return (
      <div className={styles.placeholder}>
        <h2 className={styles.title}>Chat</h2>
        <p className={styles.text}>
          Open WebUI is not running yet. Start the stack from the right sidebar.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <iframe
        className={styles.frame}
        src={WEBUI_URL}
        title="Open WebUI"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  )
}
