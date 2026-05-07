import { create } from 'zustand'

type ThemeMode = 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
  toggle: () => void
  setMode: (mode: ThemeMode) => void
}

const STORAGE_KEY = 'chameleon:theme'

function getInitialMode(): ThemeMode {
  // 1. 优先读取 localStorage 中的用户偏好
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    // ignore
  }
  // 2. 跟随系统偏好
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

function applyThemeClass(mode: ThemeMode) {
  if (mode === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// 立即同步（在 React 渲染前执行）
applyThemeClass(getInitialMode())

export const useTheme = create<ThemeState>((set) => ({
  mode: getInitialMode(),
  toggle: () =>
    set((state) => {
      const next = state.mode === 'light' ? 'dark' : 'light'
      try {
        window.localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // ignore
      }
      applyThemeClass(next)
      return { mode: next }
    }),
  setMode: (mode: ThemeMode) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // ignore
    }
    applyThemeClass(mode)
    set({ mode })
  },
}))
