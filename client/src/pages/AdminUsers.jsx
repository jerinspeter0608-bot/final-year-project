import { useState, useEffect } from 'react'
import { api } from '../api'
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
  Badge,
} from 'react-bootstrap'

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'sales', label: 'Sales' },
  { value: 'supplier', label: 'Supplier' },
]

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'sales' })

  const loadUsers = () => {
    api('/users')
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const openAdd = () => {
    setEditingId(null)
    setForm({ name: '', email: '', password: '', role: 'sales' })
    setShowModal(true)
    setError('')
    setSuccess('')
  }

  const openEdit = (u) => {
    setEditingId(u._id)
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setShowModal(true)
    setError('')
    setSuccess('')
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm({ name: '', email: '', password: '', role: 'sales' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      if (editingId) {
        const body = { name: form.name, email: form.email, role: form.role }
        if (form.password) body.password = form.password
        await api(`/users/${editingId}`, { method: 'PUT', body: JSON.stringify(body) })
        setSuccess('User updated.')
      } else {
        await api('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
          }),
        })
        setSuccess('User created.')
      }
      loadUsers()
      closeModal()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return
    try {
      await api(`/users/${id}`, { method: 'DELETE' })
      setSuccess('User deleted.')
      loadUsers()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
        <h1 className="h4 mb-0 fw-semibold">User Management</h1>
        <Button variant="primary" size="sm" onClick={openAdd}>
          Add User
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Card className="border-0 shadow-sm">
        {loading ? (
          <Card.Body className="text-center py-5">
            <Spinner animation="border" size="sm" />
            <span className="ms-2">Loading users...</span>
          </Card.Body>
        ) : users.length === 0 ? (
          <Card.Body className="text-center text-muted py-5">
            No users yet. Click &quot;Add User&quot; to create one.
          </Card.Body>
        ) : (
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td className="text-muted">{u.email}</td>
                  <td>
                    <Badge bg="secondary" className="text-uppercase">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Button variant="outline-secondary" size="sm" className="me-1" onClick={() => openEdit(u)}>
                      Edit
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(u._id, u.name)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit User' : 'Add User'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Full name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                disabled={!!editingId}
                placeholder="you@example.com"
              />
              {editingId && <Form.Text className="text-muted">Email cannot be changed.</Form.Text>}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password {editingId && '(leave blank to keep current)'}</Form.Label>
              <Form.Control
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={editingId ? 0 : 6}
                required={!editingId}
                placeholder={editingId ? '••••••••' : 'Min. 6 characters'}
              />
            </Form.Group>
            <Form.Group className="mb-0">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingId ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}
