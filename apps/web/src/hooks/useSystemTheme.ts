import { useEffect } from 'react'
import { useTheme } from '@/stores/useTheme'

/**
 * 监听系统主题变化，仅在用户未手动存储偏好时跟随系统切换
 */
export function useSystemTheme() {
  const setMode = useTheme((s) => s.setMode)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')

    const handler = (e: MediaQueryListEvent) => {
      // 仅当用户没有显式存储偏好时才跟随系统
      const stored = window.localStorage.getItem('chameleon:theme')
      if (!stored) {
        setMode(e.matches ? 'dark' : 'light')
      }
    }

    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [setMode])
}
