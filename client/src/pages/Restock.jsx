import { useState, useEffect } from 'react'
import { api } from '../api'
import './Page.css'

export default function Restock() {
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [restocks, setRestocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    productId: '',
    supplierId: '',
    quantityAdded: '1',
  })
  const [submitting, setSubmitting] = useState(false)

  const loadProducts = () => api('/products').then(setProducts).catch(() => setProducts([]))
  const loadSuppliers = () => api('/suppliers').then(setSuppliers).catch(() => setSuppliers([]))
  const loadRestocks = () => {
    setLoading(true)
    api('/restock')
      .then(setRestocks)
      .catch(() => setRestocks([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts()
    loadSuppliers()
  }, [])
  useEffect(() => {
    loadRestocks()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.productId || !form.supplierId || !form.quantityAdded || Number(form.quantityAdded) < 1) {
      setError('Select product, supplier and enter quantity.')
      return
    }
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await api('/restock', {
        method: 'POST',
        body: JSON.stringify({
          productId: form.productId,
          supplierId: form.supplierId,
          quantityAdded: Number(form.quantityAdded),
        }),
      })
      setSuccess('Restock recorded. Product quantity updated.')
      setForm({ productId: '', supplierId: '', quantityAdded: '1' })
      loadProducts()
      loadRestocks()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <h1>Restock</h1>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      <div className="form-card">
        <h2>Record Restock</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Product</label>
            <select
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              required
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.productName} (Current: {p.quantity})
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Supplier</label>
            <select
              value={form.supplierId}
              onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
              required
            >
              <option value="">Select supplier</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.supplierName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Quantity Added</label>
            <input
              type="number"
              min="1"
              value={form.quantityAdded}
              onChange={(e) => setForm({ ...form, quantityAdded: e.target.value })}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Record Restock'}
            </button>
          </div>
        </form>
      </div>

      <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Restock History</h2>
      <div className="table-wrap">
        {loading ? (
          <p className="empty-msg">Loading...</p>
        ) : restocks.length === 0 ? (
          <p className="empty-msg">No restock entries yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Supplier</th>
                <th>Qty Added</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {restocks.map((r) => (
                <tr key={r._id}>
                  <td>{r.productId?.productName || '—'}</td>
                  <td>{r.supplierId?.supplierName || '—'}</td>
                  <td>{r.quantityAdded}</td>
                  <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
