import styles from './LogViewer.module.css'

interface Props {
  logs: string[]
}

export function LogViewer({ logs }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>Logs</div>
      <div className={styles.body}>
        {logs.length === 0 ? (
          <span className={styles.empty}>No logs yet</span>
        ) : (
          logs.map((line, i) => (
            <div key={i} className={styles.line}>
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
