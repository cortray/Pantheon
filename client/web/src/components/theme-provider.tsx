'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { themes } from '@/lib/themes'

type Theme = 'dark' | 'light' | 'system'
type ThemeId = string // 'default' | 品牌主题 id（.theme-<id> class）

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  styleStorageKey?: string
}

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
  themeId: ThemeId
  setThemeId: (id: ThemeId) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'pantheon-theme',
  styleStorageKey = 'pantheon-theme-style',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme
    } catch {
      return defaultTheme
    }
  })
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    try {
      return localStorage.getItem(styleStorageKey) || 'default'
    } catch {
      return 'default'
    }
  })

  // 深浅色 class
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    if (theme === 'system') {
      const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(system)
      return
    }
    root.classList.add(theme)
  }, [theme])

  // 品牌设计主题 class（themes.css 定义 .theme-<id> 与 .theme-<id>.dark）
  useEffect(() => {
    const root = window.document.documentElement
    for (const t of themes) root.classList.remove(`theme-${t.id}`)
    if (themeId !== 'default') root.classList.add(`theme-${themeId}`)
    try {
      localStorage.setItem(styleStorageKey, themeId)
    } catch {
      /* ignore */
    }
  }, [themeId, styleStorageKey])

  const value: ThemeProviderState = {
    theme,
    setTheme: (t: Theme) => {
      try {
        localStorage.setItem(storageKey, t)
      } catch {
        /* ignore */
      }
      setTheme(t)
    },
    themeId,
    setThemeId,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
