import { useState, useEffect } from 'react'
import { api } from '../api'
import './Page.css'

export default function Sales() {
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [productId, setProductId] = useState('')
  const [quantitySold, setQuantitySold] = useState('1')
  const [submitting, setSubmitting] = useState(false)
  const [lastSale, setLastSale] = useState(null)
  const [dateFilter, setDateFilter] = useState(
    new Date().toISOString().slice(0, 10)
  )

  const loadProducts = () => {
    api('/products').then(setProducts).catch(() => setProducts([]))
  }

  const loadSales = () => {
    setLoading(true)
    api(`/sales?date=${dateFilter}`)
      .then(setSales)
      .catch(() => setSales([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    loadSales()
  }, [dateFilter])

  const handleRecordSale = async (e) => {
    e.preventDefault()
    if (!productId || !quantitySold || Number(quantitySold) < 1) {
      setError('Select a product and enter quantity.')
      return
    }
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      const data = await api('/sales', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          quantitySold: Number(quantitySold),
        }),
      })
      setLastSale(data)
      setSuccess('Sale recorded.')
      setQuantitySold('1')
      setProductId('')
      loadProducts()
      loadSales()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const product = products.find((p) => p._id === productId)
  const totalAmount = product
    ? (Number(product.price) * Number(quantitySold || 0)).toFixed(2)
    : '0.00'

  return (
    <div className="page">
      <h1>Sales</h1>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      <div className="form-card">
        <h2>Record Sale</h2>
        <form onSubmit={handleRecordSale}>
          <div className="form-row">
            <label>Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            >
              <option value="">Select product</option>
              {products
                .filter((p) => p.quantity > 0)
                .map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.productName} — ₹{Number(p.price).toFixed(2)} (Stock: {p.quantity})
                  </option>
                ))}
            </select>
          </div>
          <div className="form-row">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={quantitySold}
              onChange={(e) => setQuantitySold(e.target.value)}
              required
            />
          </div>
          {productId && (
            <p style={{ margin: '0 0 1rem', color: '#666' }}>
              Total: <strong>₹{totalAmount}</strong>
            </p>
          )}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Recording...' : 'Record Sale'}
            </button>
          </div>
        </form>
      </div>

      {lastSale && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
          <h3 style={{ margin: '0 0 0.5rem' }}>Last Bill</h3>
          <p style={{ margin: 0 }}>
            {lastSale.productId?.productName} × {lastSale.quantitySold} = ₹
            {Number(lastSale.totalAmount).toFixed(2)}
          </p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#666' }}>
            Sold by: {lastSale.soldBy?.name}
          </p>
        </div>
      )}

      <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Sales History</h2>
      <div className="form-row" style={{ maxWidth: 200, marginBottom: '1rem' }}>
        <label>Date</label>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>
      <div className="table-wrap">
        {loading ? (
          <p className="empty-msg">Loading...</p>
        ) : sales.length === 0 ? (
          <p className="empty-msg">No sales for this date.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Sold By</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s._id}>
                  <td>{s.productId?.productName || '—'}</td>
                  <td>{s.quantitySold}</td>
                  <td>₹{Number(s.totalAmount).toFixed(2)}</td>
                  <td>{s.soldBy?.name || '—'}</td>
                  <td>{s.createdAt ? new Date(s.createdAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
