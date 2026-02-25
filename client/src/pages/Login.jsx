import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Card, Form, Button, Alert } from 'react-bootstrap'
import './Auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err.message || 'Login failed'
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
            <Card.Text className="card-subtitle">Sign in to your account</Card.Text>
            <Form onSubmit={handleSubmit}>
              {error && (
                <Alert variant="danger" className="py-2 small mb-3">
                  {error}
                </Alert>
              )}
              <Form.Group className="mb-3" controlId="login-email">
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
              <Form.Group className="mb-3" controlId="login-password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </Form.Group>
              <Button
                type="submit"
                variant="primary"
                className="w-100"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </Form>
            <p className="auth-switch mb-0">
              Don&apos;t have an account? <Link to="/register">Register</Link>
            </p>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}
