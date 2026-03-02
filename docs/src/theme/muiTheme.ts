import { createTheme, type PaletteMode, type ThemeOptions } from '@mui/material/styles'

export const getMuiThemeOptions = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: '#0f766e',
    },
    secondary: {
      main: '#1d4ed8',
    },
    background: {
      default: mode === 'light' ? '#f8fafc' : '#020617',
      paper: mode === 'light' ? '#ffffff' : '#0f172a',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h5: {
      fontWeight: 700,
    },
  },
})

export const buildMuiTheme = (mode: PaletteMode) => createTheme(getMuiThemeOptions(mode))
