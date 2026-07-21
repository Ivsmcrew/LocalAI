import { useEffect, useRef } from 'react'
import type { StackStatus, ViewBounds } from '@shared/types'
import styles from './ChatPage.module.css'

interface Props {
  status: StackStatus
}

function readBounds(el: HTMLElement): ViewBounds {
  const rect = el.getBoundingClientRect()
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  }
}

export function ChatPage({ status }: Props) {
  const ready = status.webui.state === 'ready'
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ready) {
      void window.api.hideWebuiView()
      return
    }

    const el = hostRef.current
    if (!el) return

    const report = (mode: 'show' | 'bounds' = 'bounds') => {
      const bounds = readBounds(el)
      if (bounds.width <= 0 || bounds.height <= 0) return
      if (mode === 'show') {
        void window.api.showWebuiView(bounds)
      } else {
        void window.api.setWebuiViewBounds(bounds)
      }
    }

    // Wait a frame so flex/sidebar layout has settled before attaching the view.
    const raf = requestAnimationFrame(() => report('show'))

    const onBounds = () => report('bounds')
    const ro = new ResizeObserver(onBounds)
    ro.observe(el)
    window.addEventListener('resize', onBounds)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', onBounds)
      void window.api.hideWebuiView()
    }
  }, [ready])

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

  return <div ref={hostRef} className={styles.page} />
}
