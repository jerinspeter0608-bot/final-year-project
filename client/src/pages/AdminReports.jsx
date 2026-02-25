import { useState, useEffect } from 'react'
import { api } from '../api'
import './Page.css'

export default function AdminReports() {
  const [sales, setSales] = useState([])
  const [restocks, setRestocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('sales')

  useEffect(() => {
    setLoading(true)
    Promise.all([api('/sales?limit=100'), api('/restock')])
      .then(([salesData, restocksData]) => {
        setSales(salesData)
        setRestocks(restocksData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (error) return <div className="page error-msg">{error}</div>

  const totalSalesAmount = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0)

  return (
    <div className="page">
      <h1>Reports</h1>
      <div className="page-actions" style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'sales' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('sales')}
        >
          Sales Summary
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'restock' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('restock')}
        >
          Restock History
        </button>
      </div>

      {loading ? (
        <p className="empty-msg">Loading...</p>
      ) : activeTab === 'sales' ? (
        <>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Total sales amount (all time):</strong> ₹{totalSalesAmount.toFixed(2)}
          </p>
          <div className="table-wrap">
            {sales.length === 0 ? (
              <p className="empty-msg">No sales recorded.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Amount</th>
                    <th>Sold By</th>
                    <th>Date</th>
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
        </>
      ) : (
        <div className="table-wrap">
          {restocks.length === 0 ? (
            <p className="empty-msg">No restock entries.</p>
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
      )}
    </div>
  )
}
