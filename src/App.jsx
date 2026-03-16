import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

// Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyEmail from './pages/auth/VerifyEmail'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/Dashboard'
import Meters from './pages/meters/Meters'
import AddMeter from './pages/meters/AddMeter'
import MeterAlerts from './pages/meters/MeterAlerts'
import MeterDetail from './pages/meters/MeterDetail'
import Telemetry from './pages/telemetry/Telemetry'
import Payments from './pages/payments/Payments'
import Tokens from './pages/tokens/Tokens'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import AdminConsole from './pages/AdminConsole'

// Components
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="meters" element={<Meters />} />
          <Route
            path="meters/add"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AddMeter />
              </RoleRoute>
            }
          />
          <Route
            path="meters/alerts"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <MeterAlerts />
              </RoleRoute>
            }
          />
          <Route path="meters/:id" element={<MeterDetail />} />
          <Route path="telemetry" element={<Telemetry />} />
          <Route path="payments" element={<Payments />} />
          <Route path="tokens" element={<Tokens />} />
          <Route
            path="admin-console"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminConsole />
              </RoleRoute>
            }
          />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
