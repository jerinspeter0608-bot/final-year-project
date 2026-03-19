import { useState, useEffect } from 'react'
import { api } from '../api'
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap'
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading dashboard...</span>
      </div>
    )
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>
  }

  if (!stats) return null

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, color: 'stat-card--teal' },
    { label: 'Low Stock Items', value: stats.lowStockCount, color: 'stat-card--amber' },
    { label: 'Out of Stock', value: stats.outOfStockCount, color: 'stat-card--red' },
    { label: "Today's Sales", value: stats.todaySalesCount, color: 'stat-card--blue' },
    { label: "Today's Revenue", value: `₹${Number(stats.todaySalesTotal).toFixed(2)}`, color: 'stat-card--green' },
    { label: 'Total Revenue', value: `₹${Number(stats.totalSalesAmount).toFixed(2)}`, color: 'stat-card--purple' },
  ]

  return (
    <>
      <h1 className="h4 mb-4 fw-semibold">Dashboard</h1>
      <Row xs={1} sm={2} lg={3} className="g-3 mb-4">
        {statCards.map(({ label, value, color }) => (
          <Col key={label}>
            <Card className={`stat-card h-100 ${color}`}>
              <Card.Body className="py-3">
                <Card.Text className="text-muted small mb-1 text-uppercase" style={{ letterSpacing: '0.04em', fontSize: '0.75rem' }}>
                  {label}
                </Card.Text>
                <Card.Title as="div" className="mb-0 fs-4 fw-bold">
                  {value}
                </Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}
