import { useState, useEffect } from 'react'
import { api } from '../api'
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap'

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
    { label: 'Total Products', value: stats.totalProducts, gradient: 'card--lavender' },
    { label: 'Low Stock Items', value: stats.lowStockCount, gradient: 'card--peach' },
    { label: 'Out of Stock', value: stats.outOfStockCount, gradient: 'card--pink' },
    { label: "Today's Sales (count)", value: stats.todaySalesCount, gradient: 'card--sky' },
    { label: "Today's Sales (amount)", value: `₹${Number(stats.todaySalesTotal).toFixed(2)}`, gradient: 'card--mint' },
    { label: 'Total Sales Amount', value: `₹${Number(stats.totalSalesAmount).toFixed(2)}`, gradient: 'card--rose' },
  ]

  return (
    <>
      <h1 className="h4 mb-4 fw-semibold">Admin Dashboard</h1>
      <Row xs={1} sm={2} lg={3} className="g-3">
        {statCards.map(({ label, value, gradient }) => (
          <Col key={label}>
            <Card className={`border-0 shadow-sm h-100 ${gradient}`}>
              <Card.Body>
                <Card.Text className="small mb-1" style={{ color: 'var(--app-text-muted)' }}>{label}</Card.Text>
                <Card.Title as="div" className="mb-0 fs-4 fw-bold" style={{ color: 'var(--app-text)' }}>
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
