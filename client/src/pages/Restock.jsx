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
    <>
      <h1 className="h4 mb-4 fw-semibold">Restock</h1>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Row>
        <Col lg={5} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom py-3">
              <Card.Title as="h6" className="mb-0 fw-semibold">
                Record restock
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Product</Form.Label>
                  <Form.Select
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
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Supplier</Form.Label>
                  <Form.Select
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
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Quantity added</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    value={form.quantityAdded}
                    onChange={(e) => setForm({ ...form, quantityAdded: e.target.value })}
                    required
                  />
                </Form.Group>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Record restock'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3">
              <Card.Title as="h6" className="mb-0 fw-semibold">
                Restock history
              </Card.Title>
            </Card.Header>
            {loading ? (
              <Card.Body className="text-center py-5">
                <Spinner animation="border" size="sm" />
                <span className="ms-2">Loading...</span>
              </Card.Body>
            ) : restocks.length === 0 ? (
              <Card.Body className="text-center text-muted py-5">
                No restock entries yet.
              </Card.Body>
            ) : (
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Supplier</th>
                    <th>Qty added</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {restocks.map((r) => (
                    <tr key={r._id}>
                      <td>{r.productId?.productName || '—'}</td>
                      <td className="text-muted">{r.supplierId?.supplierName || '—'}</td>
                      <td>{r.quantityAdded}</td>
                      <td className="text-muted small">
                        {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
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
