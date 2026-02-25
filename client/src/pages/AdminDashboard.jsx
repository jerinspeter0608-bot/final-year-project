import { useState, useEffect } from 'react'
import { api } from '../api'
import './Page.css'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/dashboard/stats')
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page">Loading dashboard...</div>
  if (error) return <div className="page error-msg">{error}</div>
  if (!stats) return null

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      <div className="cards-grid">
        <div className="card">
          <p className="card-title">Total Products</p>
          <p className="card-value">{stats.totalProducts}</p>
        </div>
        <div className="card">
          <p className="card-title">Low Stock Items</p>
          <p className="card-value">{stats.lowStockCount}</p>
        </div>
        <div className="card">
          <p className="card-title">Out of Stock</p>
          <p className="card-value">{stats.outOfStockCount}</p>
        </div>
        <div className="card">
          <p className="card-title">Today&apos;s Sales (count)</p>
          <p className="card-value">{stats.todaySalesCount}</p>
        </div>
        <div className="card">
          <p className="card-title">Today&apos;s Sales (amount)</p>
          <p className="card-value">₹{Number(stats.todaySalesTotal).toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="card-title">Total Sales Amount</p>
          <p className="card-value">₹{Number(stats.totalSalesAmount).toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}
