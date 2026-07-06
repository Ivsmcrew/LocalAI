import type { ServiceStatus as ServiceStatusType } from '@shared/types'
import styles from './ServiceStatus.module.css'

const STATE_LABELS: Record<string, string> = {
  idle: 'Idle',
  starting: 'Starting...',
  ready: 'Ready',
  error: 'Error',
  stopped: 'Stopped',
}

interface Props {
  name: string
  service: ServiceStatusType
}

export function ServiceStatus({ name, service }: Props) {
  return (
    <div className={styles.row}>
      <span className={styles.name}>{name}</span>
      <span className={`${styles.dot} ${styles[service.state]}`} />
      <span className={styles.state}>{STATE_LABELS[service.state] ?? service.state}</span>
      {service.message && <span className={styles.message}>{service.message}</span>}
    </div>
  )
}
