import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { Home, ListMusic, LogOut, Menu, Settings, type LucideIcon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useThemeMode } from '../../hooks/useThemeMode'

const drawerWidth = 240

interface MenuItem {
  label: string
  path: string
  icon: LucideIcon
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', path: '/', icon: Home },
  { label: 'Projeta Música', path: '/projeta-musica', icon: ListMusic },
  { label: 'Settings', path: '/settings', icon: Settings },
]

interface AppLayoutProps {
  children: ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation()
  const { signOut, user } = useAuth()
  const { mode, toggleTheme } = useThemeMode()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [isDesktopDrawerOpen, setIsDesktopDrawerOpen] = useState(true)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  const currentDrawerWidth = !isMobile && isDesktopDrawerOpen ? drawerWidth : 0

  const toggleDrawer = () => {
    if (isMobile) {
      setIsMobileDrawerOpen((current) => !current)
      return
    }

    setIsDesktopDrawerOpen((current) => !current)
  }

  const closeMobileDrawer = () => {
    setIsMobileDrawerOpen(false)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          ml: { xs: 0, md: `${currentDrawerWidth}px` },
          width: { xs: '100%', md: `calc(100% - ${currentDrawerWidth}px)` },
        }}
      >
        {isMobile ? (
          <Toolbar sx={{ display: 'block', py: 1 }}>
            <Box className="flex items-center justify-between">
              <Typography variant="h6">Nossa Senhora Aparecida Oxford</Typography>
              <IconButton color="inherit" onClick={toggleDrawer} aria-label="Alternar menu lateral">
                <Menu size={18} />
              </IconButton>
            </Box>
            <Box className="flex items-center gap-2">
              <Typography variant="body2">{user?.email}</Typography>
              <IconButton color="inherit" onClick={signOut} aria-label="Sair">
                <LogOut size={18} />
              </IconButton>
            </Box>
          </Toolbar>
        ) : (
          <Toolbar className="flex items-center justify-between">
            <Box className="flex items-center gap-2">
              <IconButton color="inherit" onClick={toggleDrawer} aria-label="Alternar menu lateral">
                <Menu size={18} />
              </IconButton>
              <Typography variant="h6">Nossa Senhora Aparecida Oxford</Typography>
            </Box>
            <Box className="flex items-center gap-2">
              <Typography variant="body2">{user?.name}</Typography>
              <IconButton color="inherit" onClick={toggleTheme} aria-label="Alternar tema">
                <Typography variant="caption">{mode === 'light' ? 'Dark' : 'Light'}</Typography>
              </IconButton>
              <IconButton color="inherit" onClick={signOut} aria-label="Sair">
                <LogOut size={18} />
              </IconButton>
            </Box>
          </Toolbar>
        )}
      </AppBar>

      <Drawer
        variant="temporary"
        open={isMobileDrawerOpen}
        onClose={closeMobileDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => {
            const Icon = item.icon

            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={pathname === item.path}
                  onClick={closeMobileDrawer}
                >
                  <ListItemIcon>
                    <Icon size={18} />
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: currentDrawerWidth,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
          '& .MuiDrawer-paper': {
            width: currentDrawerWidth,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            borderRight: currentDrawerWidth === 0 ? 'none' : undefined,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
          },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => {
            const Icon = item.icon

            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton component={RouterLink} to={item.path} selected={pathname === item.path}>
                  <ListItemIcon>
                    <Icon size={18} />
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      </Drawer>
      <Box component="main" className="w-full p-6" sx={{ flexGrow: 1 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}

export default AppLayout
