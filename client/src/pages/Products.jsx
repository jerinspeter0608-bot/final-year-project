import { useState, useEffect } from 'react'
import { api } from '../api'
import './Page.css'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    productName: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    minThreshold: '',
  })

  const loadProducts = () => {
    api('/products')
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const openAdd = () => {
    setEditingId(null)
    setForm({
      productName: '',
      description: '',
      category: '',
      price: '',
      quantity: '',
      minThreshold: '0',
    })
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const openEdit = (p) => {
    setEditingId(p._id)
    setForm({
      productName: p.productName,
      description: p.description || '',
      category: p.category || '',
      price: String(p.price),
      quantity: String(p.quantity),
      minThreshold: String(p.minThreshold ?? 0),
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
      const payload = {
        productName: form.productName,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        quantity: Number(form.quantity) || 0,
        minThreshold: Number(form.minThreshold) || 0,
      }
      if (editingId) {
        await api(`/products/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
        setSuccess('Product updated.')
      } else {
        await api('/products', { method: 'POST', body: JSON.stringify(payload) })
        setSuccess('Product added.')
      }
      loadProducts()
      closeForm()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete product "${name}"?`)) return
    try {
      await api(`/products/${id}`, { method: 'DELETE' })
      setSuccess('Product deleted.')
      loadProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const isLowStock = (p) => p.quantity < (p.minThreshold ?? 0)
  const isOutOfStock = (p) => p.quantity === 0

  return (
    <div className="page">
      <h1>Products</h1>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}
      <div className="page-actions">
        <button type="button" className="btn btn-primary" onClick={openAdd}>
          Add Product
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Product Name</label>
                <input
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <label>Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="form-row">
                <label>Category</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
              <div className="form-row">
                <label>Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <label>Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
              <div className="form-row">
                <label>Min Threshold (low-stock alert)</label>
                <input
                  type="number"
                  min="0"
                  value={form.minThreshold}
                  onChange={(e) => setForm({ ...form, minThreshold: e.target.value })}
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
        ) : products.length === 0 ? (
          <p className="empty-msg">No products. Add one above.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Min Threshold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>{p.productName}</td>
                  <td>{p.category || '—'}</td>
                  <td>₹{Number(p.price).toFixed(2)}</td>
                  <td className={isOutOfStock(p) ? 'out-of-stock' : isLowStock(p) ? 'low-stock' : ''}>
                    {p.quantity}
                  </td>
                  <td>{p.minThreshold ?? 0}</td>
                  <td>
                    {isOutOfStock(p) ? 'Out of stock' : isLowStock(p) ? 'Low stock' : 'OK'}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(p._id, p.productName)}
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
