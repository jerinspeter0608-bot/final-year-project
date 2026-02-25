import { useState, useEffect } from 'react'
import { api } from '../api'
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
  Badge,
  Row,
  Col,
} from 'react-bootstrap'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    productName: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    minThreshold: '0',
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
    setShowModal(true)
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
    setShowModal(true)
    setError('')
    setSuccess('')
  }

  const closeModal = () => {
    setShowModal(false)
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
      closeModal()
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

  const isLowStock = (p) => p.quantity < (p.minThreshold ?? 0) && p.quantity > 0
  const isOutOfStock = (p) => p.quantity === 0

  const getStatusBadge = (p) => {
    if (isOutOfStock(p)) return <Badge bg="danger">Out of stock</Badge>
    if (isLowStock(p)) return <Badge bg="warning" text="dark">Low stock</Badge>
    return <Badge bg="success">OK</Badge>
  }

  const getQuantityClass = (p) => {
    if (isOutOfStock(p)) return 'text-danger fw-bold'
    if (isLowStock(p)) return 'text-warning fw-semibold'
    return ''
  }

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
        <h1 className="h4 mb-0 fw-semibold">Products</h1>
        <Button variant="primary" size="sm" onClick={openAdd}>
          Add Product
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Card className="border-0 shadow-sm">
        {loading ? (
          <Card.Body className="text-center py-5">
            <Spinner animation="border" size="sm" />
            <span className="ms-2">Loading products...</span>
          </Card.Body>
        ) : products.length === 0 ? (
          <Card.Body className="text-center text-muted py-5">
            No products yet. Click &quot;Add Product&quot; to create one.
          </Card.Body>
        ) : (
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Min threshold</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <span className="fw-medium">{p.productName}</span>
                    {p.description && (
                      <div className="small text-muted">{p.description}</div>
                    )}
                  </td>
                  <td className="text-muted">{p.category || '—'}</td>
                  <td>₹{Number(p.price).toFixed(2)}</td>
                  <td className={getQuantityClass(p)}>{p.quantity}</td>
                  <td>{p.minThreshold ?? 0}</td>
                  <td>{getStatusBadge(p)}</td>
                  <td className="text-end">
                    <Button variant="outline-secondary" size="sm" className="me-1" onClick={() => openEdit(p)}>
                      Edit
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(p._id, p.productName)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit Product' : 'Add Product'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product name</Form.Label>
                  <Form.Control
                    value={form.productName}
                    onChange={(e) => setForm({ ...form, productName: e.target.value })}
                    required
                    placeholder="e.g. Rice (1kg)"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Groceries"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional"
              />
            </Form.Group>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Min threshold</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={form.minThreshold}
                    onChange={(e) => setForm({ ...form, minThreshold: e.target.value })}
                    title="Low-stock alert when quantity falls below this"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingId ? 'Update' : 'Add'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}
