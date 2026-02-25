import { useState, useEffect } from 'react'
import { api } from '../api'
import './Page.css'

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
  const [showForm, setShowForm] = useState(false)
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
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const openEdit = (u) => {
    setEditingId(u._id)
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const closeForm = () => {
    setShowForm(false)
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
      closeForm()
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
    <div className="page">
      <h1>User Management</h1>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}
      <div className="page-actions">
        <button type="button" className="btn btn-primary" onClick={openAdd}>
          Add User
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit User' : 'Add User'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  disabled={!!editingId}
                />
                {editingId && <small style={{ color: '#666' }}>Email cannot be changed.</small>}
              </div>
              <div className="form-row">
                <label>Password {editingId && '(leave blank to keep current)'}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={editingId ? 0 : 6}
                  required={!editingId}
                />
              </div>
              <div className="form-row">
                <label>Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-wrap">
        {loading ? (
          <p className="empty-msg">Loading...</p>
        ) : users.length === 0 ? (
          <p className="empty-msg">No users yet. Add one above.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEdit(u)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(u._id, u.name)}
                      style={{ marginLeft: '0.5rem' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
