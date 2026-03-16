import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const RoleRoute = ({ allowedRoles = [], children }) => {
  const { user } = useAuthStore()
  const role = user?.role

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RoleRoute
