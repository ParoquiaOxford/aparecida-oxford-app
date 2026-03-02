import { useState, type SyntheticEvent } from 'react'
import { Box, Paper, Tab, Tabs, Typography } from '@mui/material'

type SettingsTab = 'profile' | 'preferences'

function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  const handleTabChange = (_event: SyntheticEvent, value: SettingsTab) => {
    setActiveTab(value)
  }

  return (
    <Paper className="rounded-lg p-4">
      <Typography variant="h5" className="mb-4">
        Settings
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab value="profile" label="Perfil" />
        <Tab value="preferences" label="Preferências" />
      </Tabs>

      <Box className="pt-4">
        {activeTab === 'profile' ? (
          <Typography variant="body1">Gerencie seus dados de perfil e acesso.</Typography>
        ) : (
          <Typography variant="body1">Configure preferências visuais e de notificações.</Typography>
        )}
      </Box>
    </Paper>
  )
}

export default Settings
