import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  /** 当前实际渲染的模式（light 或 dark，跟随系统已解析） */
  resolved: 'light' | 'dark'
  /** 用户选择的模式偏好 */
  mode: ThemeMode
  /** 切换模式 */
  setMode: (mode: ThemeMode) => void
  /** 切换 light/dark（system 状态下切换会固定到 light） */
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'chameleon:theme'

function readStoredTheme(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  } catch {
    /* ignore */
  }
  return 'system'
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredTheme)
  const [resolved, setResolved] = useState<'light' | 'dark'>(() => resolveTheme(readStoredTheme()))

  function setMode(next: ThemeMode) {
    setModeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }

  function toggle() {
    setMode(resolved === 'dark' ? 'light' : 'dark')
  }

  // 监听 resolved 变化，更新 <html> class
  useEffect(() => {
    const root = document.documentElement
    if (resolved === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [resolved])

  // 监听 mode 变化 → 重新 resolve
  useEffect(() => {
    setResolved(resolveTheme(mode))
  }, [mode])

  // 监听系统主题变化（当 mode === 'system' 时实时跟随）
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    function handler() {
      if (mode === 'system') {
        setResolved(mq.matches ? 'dark' : 'light')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode])

  return (
    <ThemeContext.Provider value={{ resolved, mode, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
