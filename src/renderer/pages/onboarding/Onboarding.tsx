import { useState } from 'react'
import type { InitProgress } from '@shared/types'
import { WelcomeStep } from './WelcomeStep'
import { SetupStep } from './SetupStep'

interface Props {
  loading: boolean
  error: string | null
  initProgress: InitProgress | null
  initComplete: boolean
  opening: boolean
  onInitialize: (model: string) => void
  onOpenLocalAI: () => void
}

export function Onboarding({
  loading,
  error,
  initProgress,
  initComplete,
  opening,
  onInitialize,
  onOpenLocalAI,
}: Props) {
  const [stage, setStage] = useState<'welcome' | 'setup'>(() =>
    initComplete ? 'setup' : 'welcome',
  )

  if (stage === 'welcome' && !initComplete) {
    return <WelcomeStep onContinue={() => setStage('setup')} />
  }

  return (
    <SetupStep
      loading={loading}
      error={error}
      initProgress={initProgress}
      initComplete={initComplete}
      opening={opening}
      onInitialize={onInitialize}
      onOpenLocalAI={onOpenLocalAI}
    />
  )
}
