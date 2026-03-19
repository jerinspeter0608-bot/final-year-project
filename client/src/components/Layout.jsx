import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

const NAV_CONFIG = {
  admin: [
    {
      section: 'Main',
      links: [
        { to: '/admin', icon: '▦', label: 'Dashboard' },
        { to: '/admin/users', icon: '○', label: 'Users' },
        { to: '/admin/reports', icon: '▷', label: 'Reports' },
      ],
    },
    {
      section: 'Inventory',
      links: [
        { to: '/products', icon: '□', label: 'Products' },
        { to: '/sales', icon: '◇', label: 'Sales' },
        { to: '/suppliers', icon: '▽', label: 'Suppliers' },
        { to: '/restock', icon: '△', label: 'Restock' },
        { to: '/requests', icon: '◎', label: 'Requests' },
      ],
    },
  ],
  inventory: [
    {
      section: 'Main',
      links: [
        { to: '/products', icon: '□', label: 'Products' },
        { to: '/requests', icon: '◎', label: 'Requests' },
      ],
    },
  ],
  sales: [
    {
      section: 'Main',
      links: [{ to: '/sales', icon: '◇', label: 'Sales' }],
    },
  ],
  supplier: [
    {
      section: 'Main',
      links: [
        { to: '/suppliers', icon: '▽', label: 'Suppliers' },
        { to: '/restock', icon: '△', label: 'Restock' },
        { to: '/requests', icon: '◎', label: 'Requests' },
      ],
    },
  ],
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const role = user?.role || ''
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const sections = NAV_CONFIG[role] || []

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-brand">
          <NavLink to="/" className="sidebar-brand-link">
            <span className="sidebar-brand-icon">◈</span>
            Inventory Monitor
          </NavLink>
        </div>

        <nav className="sidebar-nav">
          {sections.map((sec) => (
            <div key={sec.section} className="sidebar-section">
              <div className="sidebar-section-title">{sec.section}</div>
              {sec.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/admin'}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sidebar-link-icon">{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{role}</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="layout-main">
        <header className="layout-header">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <span />
            <span />
            <span />
          </button>
          <div className="layout-header-greeting">
            Welcome back, <strong>{user?.name?.split(' ')[0]}</strong>
          </div>
        </header>
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
