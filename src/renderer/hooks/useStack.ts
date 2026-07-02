import { useCallback, useEffect, useState } from 'react'
import type { InitProgress, StackStatus } from '../../shared/types'

export function useStack() {
  const [status, setStatus] = useState<StackStatus | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initProgress, setInitProgress] = useState<InitProgress | null>(null)

  const refreshStatus = useCallback(async () => {
    if (!window.api) {
      setError('Application bridge is not available. Restart the app.')
      return
    }
    try {
      const s = await window.api.getStatus()
      setStatus(s)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [])

  useEffect(() => {
    if (!window.api) {
      setError('Application bridge is not available. Restart the app.')
      return
    }
    refreshStatus()
    const unsubLog = window.api.onLog((line) => {
      setLogs((prev) => [...prev.slice(-199), line])
    })
    const unsubProgress = window.api.onInitProgress((p) => setInitProgress(p))
    return () => {
      unsubLog()
      unsubProgress()
    }
  }, [refreshStatus])

  useEffect(() => {
    // Poll only during Start/Stop, not on every transient "starting" status
    if (!loading || initProgress) return

    let polls = 0
    const maxPolls = 90 // ~3 minutes at 2s interval

    const id = setInterval(async () => {
      polls += 1
      if (polls > maxPolls) {
        clearInterval(id)
        setError('Services are taking too long to start. Check Docker and try Stop → Start again.')
        return
      }
      await refreshStatus()
    }, 2000)

    return () => clearInterval(id)
  }, [loading, initProgress, refreshStatus])

  const initialize = async (model: string) => {
    setLoading(true)
    setError(null)
    setInitProgress(null)
    try {
      await window.api.initialize(model)
      await refreshStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const start = async () => {
    setLoading(true)
    setError(null)
    try {
      await window.api.start()
      await refreshStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const stop = async () => {
    setLoading(true)
    setError(null)
    try {
      await window.api.stop()
      await refreshStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const openChat = async () => {
    setError(null)
    try {
      await window.api.openChat()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return {
    status,
    logs,
    loading,
    error,
    initProgress,
    initialize,
    start,
    stop,
    openChat,
    refreshStatus,
  }
}
