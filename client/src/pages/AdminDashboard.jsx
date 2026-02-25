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
    { label: 'Total Products', value: stats.totalProducts, variant: 'primary' },
    { label: 'Low Stock Items', value: stats.lowStockCount, variant: 'warning' },
    { label: 'Out of Stock', value: stats.outOfStockCount, variant: 'danger' },
    { label: "Today's Sales (count)", value: stats.todaySalesCount, variant: 'info' },
    { label: "Today's Sales (amount)", value: `₹${Number(stats.todaySalesTotal).toFixed(2)}`, variant: 'success' },
    { label: 'Total Sales Amount', value: `₹${Number(stats.totalSalesAmount).toFixed(2)}`, variant: 'dark' },
  ]

  return (
    <>
      <h1 className="h4 mb-4 fw-semibold">Admin Dashboard</h1>
      <Row xs={1} sm={2} lg={3} className="g-3">
        {statCards.map(({ label, value, variant }) => (
          <Col key={label}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <Card.Text className="text-muted small mb-1">{label}</Card.Text>
                <Card.Title as="div" className={`mb-0 text-${variant} fs-4 fw-bold`}>
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
