import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Form, Button, Alert, InputGroup } from 'react-bootstrap'
import './Auth.css'

const NAME_RE = /^[A-Za-z_]+$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('sales')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const nextErrors = {}
    const nameTrimmed = name.trim()
    const emailTrimmed = email.trim()

    if (!nameTrimmed) nextErrors.name = 'Name is required.'
    else if (!NAME_RE.test(nameTrimmed)) nextErrors.name = 'Name can contain only A–Z, a–z, and underscore (_).'

    if (!emailTrimmed) nextErrors.email = 'Email is required.'
    else if (!EMAIL_RE.test(emailTrimmed)) nextErrors.email = 'Enter a valid email address.'

    if (!password) nextErrors.password = 'Password is required.'
    else if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters.'

    if (!confirmPassword) nextErrors.confirmPassword = 'Confirm your password.'
    else if (confirmPassword !== password) nextErrors.confirmPassword = 'Passwords do not match.'

    if (!role) nextErrors.role = 'Role is required.'

    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    try {
      await register(nameTrimmed, emailTrimmed, password, role)
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
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-logo">
            <span className="auth-logo-icon">◈</span>
            Inventory Monitor
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Get started with your new account</p>
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
                placeholder="Enter your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (fieldErrors.name) {
                    setFieldErrors((prev) => ({ ...prev, name: undefined }))
                  }
                }}
                required
                autoComplete="name"
                isInvalid={!!fieldErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="reg-email">
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
            <Form.Group className="mb-3" controlId="reg-password">
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: undefined }))
                    }
                    if (fieldErrors.confirmPassword) {
                      setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                    }
                  }}
                  required
                  minLength={6}
                  autoComplete="new-password"
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
            <Form.Group className="mb-3" controlId="reg-confirm-password">
              <Form.Label>Confirm Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showConfirmPw ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (fieldErrors.confirmPassword) {
                      setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                    }
                  }}
                  required
                  autoComplete="new-password"
                  isInvalid={!!fieldErrors.confirmPassword}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  tabIndex={-1}
                  className="pw-toggle"
                  type="button"
                >
                  {showConfirmPw ? '🙈' : '👁'}
                </Button>
              </InputGroup>
              <Form.Control.Feedback type="invalid">
                {fieldErrors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="reg-role">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value)
                  if (fieldErrors.role) {
                    setFieldErrors((prev) => ({ ...prev, role: undefined }))
                  }
                }}
                isInvalid={!!fieldErrors.role}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {fieldErrors.role}
              </Form.Control.Feedback>
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
