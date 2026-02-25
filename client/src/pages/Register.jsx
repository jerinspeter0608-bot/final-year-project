import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Card, Form, Button, Alert } from 'react-bootstrap'
import './Auth.css'

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'inventory', label: 'Inventory & Stock Controller' },
  { value: 'sales', label: 'Sales Staff' },
  { value: 'supplier', label: 'Supplier Manager' },
]

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('sales')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, email, password, role)
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err.message || 'Registration failed'
      const hint = (err.status === 403 || err.status === 502 || err.status === 503)
        ? ' Make sure the backend is running: cd server && npm run dev'
        : ''
      setError(msg + hint)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card-wrap">
        <Card>
          <Card.Body className="p-4">
            <Card.Title>Inventory Monitor</Card.Title>
            <Card.Text className="card-subtitle">Create a new account</Card.Text>
            <Form onSubmit={handleSubmit}>
              {error && (
                <Alert variant="danger" className="py-2 small mb-3">
                  {error}
                </Alert>
              )}
              <Form.Group className="mb-3" controlId="reg-name">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="reg-email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="reg-password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="reg-role">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Button
                type="submit"
                variant="primary"
                className="w-100"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </Form>
            <p className="auth-switch mb-0">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}
