import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_HOME = {
  admin: '/admin',
  inventory: '/products',
  sales: '/sales',
  supplier: '/suppliers',
}

export default function RedirectByRole() {
  const { user } = useAuth()
  const role = user?.role || 'admin'
  const to = ROLE_HOME[role] || '/admin'
  return <Navigate to={to} replace />
}
