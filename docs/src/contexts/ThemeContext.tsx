import { createContext, useMemo, useState, type ReactNode } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import type { PaletteMode } from '@mui/material/styles'
import { buildMuiTheme } from '../theme/muiTheme'

export interface ThemeContextType {
  mode: PaletteMode
  toggleTheme: () => void
}

interface ThemeModeProviderProps {
  children: ReactNode
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeModeProvider({ children }: ThemeModeProviderProps) {
  const [mode, setMode] = useState<PaletteMode>('light')

  const toggleTheme = () => {
    setMode((previousMode) => (previousMode === 'light' ? 'dark' : 'light'))
  }

  const contextValue = useMemo(
    () => ({
      mode,
      toggleTheme,
    }),
    [mode],
  )

  const theme = useMemo(() => buildMuiTheme(mode), [mode])

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}
