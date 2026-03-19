import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Form, Button, Alert, InputGroup } from 'react-bootstrap'
import './Auth.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const nextErrors = {}
    const emailTrimmed = email.trim()
    if (!emailTrimmed) nextErrors.email = 'Email is required.'
    else if (!EMAIL_RE.test(emailTrimmed)) nextErrors.email = 'Enter a valid email address.'
    if (!password) nextErrors.password = 'Password is required.'
    else if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters.'

    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    try {
      await login(emailTrimmed, password)
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
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-logo">
            <span className="auth-logo-icon">◈</span>
            Inventory Monitor
          </div>
          <h1 className="auth-title">Welcome Back!</h1>
          <p className="auth-subtitle">Please enter log in details below</p>
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
                placeholder="Enter your mail"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }))
                  }
                }}
                required
                autoComplete="email"
                isInvalid={!!fieldErrors.email}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.email}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="login-password">
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: undefined }))
                    }
                  }}
                  required
                  autoComplete="current-password"
                  isInvalid={!!fieldErrors.password}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                  className="pw-toggle"
                  type="button"
                >
                  {showPw ? '🙈' : '👁'}
                </Button>
              </InputGroup>
              <Form.Control.Feedback type="invalid">
                {fieldErrors.password}
              </Form.Control.Feedback>
            </Form.Group>
            <Button
              type="submit"
              variant="primary"
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Log in'}
            </Button>
          </Form>
          <p className="auth-switch mb-0">
            Don&apos;t have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
      <div className="auth-right">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
        <div className="auth-right-content">
          <h2 className="auth-right-title">Inventory Management</h2>
          <p className="auth-right-text">
            Join our platform to streamline your inventory processes,
            reduce costs, and enhance productivity.
          </p>
        </div>
      </div>
    </div>
  )
}
