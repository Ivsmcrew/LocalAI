import { env } from '@shared/env'
import styles from './Onboarding.module.css'

interface Props {
  onContinue: () => void
}

export function WelcomeStep({ onContinue }: Props) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to {env.APP_NAME}</h1>
      <p className={styles.subtitle}>
        {env.APP_NAME} lets you work with artificial intelligence right on your computer.
      </p>

      <ul className={styles.bullets}>
        <li>Your data stays on your machine</li>
        <li>No subscription required</li>
        <li>Works even without the internet</li>
      </ul>

      <button className={styles.primaryBtn} onClick={onContinue}>
        Get started
      </button>
    </div>
  )
}
