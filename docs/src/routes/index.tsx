import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/Login'
import MusicProjector from '../pages/MusicProjector'
import Settings from '../pages/Settings'
import ProtectedRoute from './ProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          }
          path="/"
        />
        <Route
          element={
            <AppLayout>
              <Settings />
            </AppLayout>
          }
          path="/settings"
        />
        <Route
          element={
            <AppLayout>
              <MusicProjector />
            </AppLayout>
          }
          path="/projeta-musica"
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
