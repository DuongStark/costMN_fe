"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, ThemeProviderProps as NextThemeProviderProps } from "next-themes"

type Theme = "dark" | "light" | "system"

interface ThemeProviderProps extends NextThemeProviderProps {
  children: React.ReactNode
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [state, setState] = React.useState<ThemeProviderState>(initialState)

  const value = {
    ...state,
    setTheme: (theme: Theme) => {
      localStorage?.setItem(storageKey, theme)
      setState((state) => ({ ...state, theme }))
    },
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      {...props}
    >
      <ThemeProviderContext.Provider value={value}>
        {children}
      </ThemeProviderContext.Provider>
    </NextThemesProvider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

