import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const role = user?.role || ''

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="layout">
      <nav className="layout-nav">
        <NavLink to="/" className="layout-brand">
          Inventory Monitor
        </NavLink>
        <div className="layout-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          {(role === 'admin') && (
            <>
              <NavLink to="/admin">Dashboard</NavLink>
              <NavLink to="/admin/users">Users</NavLink>
              <NavLink to="/admin/reports">Reports</NavLink>
            </>
          )}
          {(role === 'admin' || role === 'inventory') && (
            <NavLink to="/products">Products</NavLink>
          )}
          {(role === 'admin' || role === 'sales') && (
            <NavLink to="/sales">Sales</NavLink>
          )}
          {(role === 'admin' || role === 'supplier') && (
            <>
              <NavLink to="/suppliers">Suppliers</NavLink>
              <NavLink to="/restock">Restock</NavLink>
            </>
          )}
        </div>
        <div className="layout-user">
          <span className="layout-role">{user?.name} ({role})</span>
          <button type="button" onClick={handleLogout} className="layout-logout">
            Logout
          </button>
        </div>
      </nav>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}
