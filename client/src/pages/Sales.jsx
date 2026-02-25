import { useState, useEffect } from 'react'
import { api } from '../api'
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Table,
  Alert,
  Spinner,
} from 'react-bootstrap'

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

  const inStockProducts = products.filter((p) => p.quantity > 0)

  return (
    <>
      <h1 className="h4 mb-4 fw-semibold">Sales</h1>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Row>
        <Col lg={5} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom py-3">
              <Card.Title as="h6" className="mb-0 fw-semibold">
                Record Sale
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleRecordSale}>
                <Form.Group className="mb-3">
                  <Form.Label>Product</Form.Label>
                  <Form.Select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    required
                  >
                    <option value="">Select product</option>
                    {inStockProducts.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.productName} — ₹{Number(p.price).toFixed(2)} (Stock: {p.quantity})
                      </option>
                    ))}
                  </Form.Select>
                  {inStockProducts.length === 0 && products.length > 0 && (
                    <Form.Text className="text-warning">No products in stock.</Form.Text>
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    value={quantitySold}
                    onChange={(e) => setQuantitySold(e.target.value)}
                    required
                  />
                </Form.Group>
                {productId && (
                  <div className="mb-3 p-2 rounded bg-light">
                    <span className="text-muted small">Total: </span>
                    <strong className="text-success fs-5">₹{totalAmount}</strong>
                  </div>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  disabled={submitting || inStockProducts.length === 0}
                >
                  {submitting ? 'Recording...' : 'Record Sale'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          {lastSale && (
            <Card className="border-0 shadow-sm mb-4 border-start border-primary border-3">
              <Card.Body className="py-3">
                <Card.Title as="h6" className="text-muted small text-uppercase mb-2">
                  Last bill
                </Card.Title>
                <p className="mb-1 fw-medium">
                  {lastSale.productId?.productName} × {lastSale.quantitySold} = ₹
                  {Number(lastSale.totalAmount).toFixed(2)}
                </p>
                <p className="mb-0 small text-muted">
                  Sold by: {lastSale.soldBy?.name}
                </p>
              </Card.Body>
            </Card>
          )}

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3 d-flex flex-wrap align-items-center gap-2">
              <Card.Title as="h6" className="mb-0 fw-semibold">
                Sales history
              </Card.Title>
              <Form.Control
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="ms-auto"
                style={{ maxWidth: '10rem' }}
              />
            </Card.Header>
            {loading ? (
              <Card.Body className="text-center py-5">
                <Spinner animation="border" size="sm" />
                <span className="ms-2">Loading...</span>
              </Card.Body>
            ) : sales.length === 0 ? (
              <Card.Body className="text-center text-muted py-5">
                No sales for this date.
              </Card.Body>
            ) : (
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Amount</th>
                    <th>Sold by</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s._id}>
                      <td>{s.productId?.productName || '—'}</td>
                      <td>{s.quantitySold}</td>
                      <td>₹{Number(s.totalAmount).toFixed(2)}</td>
                      <td className="text-muted">{s.soldBy?.name || '—'}</td>
                      <td className="text-muted small">
                        {s.createdAt ? new Date(s.createdAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </Col>
      </Row>
    </>
  )
}
