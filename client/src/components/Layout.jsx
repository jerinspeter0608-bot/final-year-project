import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap'
import './Layout.css'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const role = user?.role || ''

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const navLinkClass = ({ isActive }) =>
    `nav-link ${isActive ? 'active' : ''}`

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar
        expand="md"
        className="app-navbar"
        variant="dark"
      >
        <Container>
          <Navbar.Brand as={NavLink} to="/" className="fw-semibold">
            Inventory Monitor
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto">
              {role === 'admin' && (
                <>
                  <Nav.Link as={NavLink} to="/admin" className={navLinkClass}>
                    Dashboard
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/admin/users" className={navLinkClass}>
                    Users
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/admin/reports" className={navLinkClass}>
                    Reports
                  </Nav.Link>
                  <Dropdown as={Nav.Item} className="d-flex align-items-center">
                    <Dropdown.Toggle
                      variant="link"
                      id="admin-more-dropdown"
                      className={`nav-link text-decoration-none ${['/products', '/sales', '/suppliers', '/restock', '/requests'].some(path => location.pathname === path) ? 'active' : ''}`}
                    >
                      More
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item as={NavLink} to="/products">
                        Products
                      </Dropdown.Item>
                      <Dropdown.Item as={NavLink} to="/sales">
                        Sales
                      </Dropdown.Item>
                      <Dropdown.Item as={NavLink} to="/suppliers">
                        Suppliers
                      </Dropdown.Item>
                      <Dropdown.Item as={NavLink} to="/restock">
                        Restock
                      </Dropdown.Item>
                      <Dropdown.Item as={NavLink} to="/requests">
                        Requests
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </>
              )}
              {role === 'inventory' && (
                <>
                  <Nav.Link as={NavLink} to="/products" className={navLinkClass}>
                    Products
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/requests" className={navLinkClass}>
                    Requests
                  </Nav.Link>
                </>
              )}
              {role === 'sales' && (
                <Nav.Link as={NavLink} to="/sales" className={navLinkClass}>
                  Sales
                </Nav.Link>
              )}
              {role === 'supplier' && (
                <>
                  <Nav.Link as={NavLink} to="/suppliers" className={navLinkClass}>
                    Suppliers
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/restock" className={navLinkClass}>
                    Restock
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/requests" className={navLinkClass}>
                    Requests
                  </Nav.Link>
                </>
              )}
            </Nav>
            <Dropdown align="end" className="ms-md-2">
              <Dropdown.Toggle
                variant="outline-light"
                size="sm"
                className="d-flex align-items-center gap-2 border-0 bg-transparent text-white opacity-90"
                id="user-dropdown"
              >
                <span className="d-none d-sm-inline">{user?.name}</span>
                <span className="badge bg-light text-dark text-uppercase small">
                  {role}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.ItemText className="small text-muted">
                  {user?.email}
                </Dropdown.ItemText>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  Log out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <main className="app-main">
        <Container>
          <Outlet />
        </Container>
      </main>
    </div>
  )
}
