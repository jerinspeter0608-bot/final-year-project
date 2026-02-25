import { useState, useEffect } from 'react'
import { api } from '../api'
import './Page.css'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    supplierName: '',
    contactNumber: '',
    email: '',
    address: '',
  })

  const loadSuppliers = () => {
    api('/suppliers')
      .then(setSuppliers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadSuppliers()
  }, [])

  const openAdd = () => {
    setEditingId(null)
    setForm({ supplierName: '', contactNumber: '', email: '', address: '' })
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const openEdit = (s) => {
    setEditingId(s._id)
    setForm({
      supplierName: s.supplierName,
      contactNumber: s.contactNumber || '',
      email: s.email || '',
      address: s.address || '',
    })
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      if (editingId) {
        await api(`/suppliers/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        })
        setSuccess('Supplier updated.')
      } else {
        await api('/suppliers', { method: 'POST', body: JSON.stringify(form) })
        setSuccess('Supplier added.')
      }
      loadSuppliers()
      closeForm()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete supplier "${name}"?`)) return
    try {
      await api(`/suppliers/${id}`, { method: 'DELETE' })
      setSuccess('Supplier deleted.')
      loadSuppliers()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <h1>Suppliers</h1>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}
      <div className="page-actions">
        <button type="button" className="btn btn-primary" onClick={openAdd}>
          Add Supplier
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Supplier' : 'Add Supplier'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Supplier Name</label>
                <input
                  value={form.supplierName}
                  onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <label>Contact Number</label>
                <input
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                />
              </div>
              <div className="form-row">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="form-row">
                <label>Address</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Add'}
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
        ) : suppliers.length === 0 ? (
          <p className="empty-msg">No suppliers. Add one above.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s._id}>
                  <td>{s.supplierName}</td>
                  <td>{s.contactNumber || '—'}</td>
                  <td>{s.email || '—'}</td>
                  <td>{s.address || '—'}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEdit(s)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(s._id, s.supplierName)}
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
