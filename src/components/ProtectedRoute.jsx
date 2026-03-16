import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checkAuth } = useAuthStore()

  if (!isAuthenticated || !checkAuth()) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
