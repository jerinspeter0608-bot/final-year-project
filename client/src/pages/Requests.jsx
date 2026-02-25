import { useState, useEffect } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import {
  Card,
  Row,
  Col,
  Nav,
  Form,
  Button,
  Table,
  Modal,
  Alert,
  Spinner,
  Badge,
} from 'react-bootstrap'

export default function Requests() {
  const { user } = useAuth()
  const role = user?.role || ''
  const isInventory = role === 'inventory'
  const canFulfill = role === 'admin' || role === 'supplier'

  const [requests, setRequests] = useState([])
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [requestType, setRequestType] = useState('refill')
  const [form, setForm] = useState({
    productId: '',
    quantityRequested: '1',
    productName: '',
    description: '',
    category: '',
    suggestedPrice: '',
    suggestedQuantity: '0',
    suggestedMinThreshold: '0',
    note: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const [fulfillModal, setFulfillModal] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [fulfillForm, setFulfillForm] = useState({ supplierId: '', quantityAdded: '' })
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadRequests = () => {
    setLoading(true)
    const query = canFulfill ? '?status=pending' : ''
    api(`/requests${query}`)
      .then(setRequests)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadRequests()
  }, [canFulfill])

  useEffect(() => {
    if (canFulfill || isInventory) {
      api('/products').then(setProducts).catch(() => setProducts([]))
      if (canFulfill) api('/suppliers').then(setSuppliers).catch(() => setSuppliers([]))
    }
  }, [canFulfill, isInventory])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      if (requestType === 'refill') {
        await api('/requests', {
          method: 'POST',
          body: JSON.stringify({
            type: 'refill',
            productId: form.productId,
            quantityRequested: Number(form.quantityRequested),
            note: form.note,
          }),
        })
        setSuccess('Refill request submitted.')
      } else {
        await api('/requests', {
          method: 'POST',
          body: JSON.stringify({
            type: 'new_product',
            productName: form.productName,
            description: form.description,
            category: form.category,
            suggestedPrice: form.suggestedPrice ? Number(form.suggestedPrice) : undefined,
            suggestedQuantity: form.suggestedQuantity ? Number(form.suggestedQuantity) : 0,
            suggestedMinThreshold: form.suggestedMinThreshold ? Number(form.suggestedMinThreshold) : 0,
            note: form.note,
          }),
        })
        setSuccess('New product request submitted.')
      }
      setForm({ productId: '', quantityRequested: '1', productName: '', description: '', category: '', suggestedPrice: '', suggestedQuantity: '0', suggestedMinThreshold: '0', note: '' })
      loadRequests()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFulfill = async (e) => {
    e.preventDefault()
    if (!fulfillModal) return
    const { supplierId, quantityAdded } = fulfillForm
    if (fulfillModal.type === 'refill' && (!supplierId || !quantityAdded || Number(quantityAdded) < 1)) {
      setError('Select supplier and enter quantity.')
      return
    }
    setActionLoading(true)
    setError('')
    try {
      const body = fulfillModal.type === 'refill'
        ? { supplierId, quantityAdded: Number(quantityAdded) }
        : {}
      await api(`/requests/${fulfillModal._id}/fulfill`, { method: 'PUT', body: JSON.stringify(body) })
      setSuccess(fulfillModal.type === 'refill' ? 'Refill fulfilled. Stock updated.' : 'New product created and request fulfilled.')
      setFulfillModal(null)
      setFulfillForm({ supplierId: '', quantityAdded: '' })
      loadRequests()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (e) => {
    e.preventDefault()
    if (!rejectModal) return
    setActionLoading(true)
    setError('')
    try {
      await api(`/requests/${rejectModal._id}/reject`, { method: 'PUT', body: JSON.stringify({ reason: rejectReason }) })
      setSuccess('Request rejected.')
      setRejectModal(null)
      setRejectReason('')
      loadRequests()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const openFulfill = (r) => {
    setFulfillModal(r)
    setFulfillForm({ supplierId: '', quantityAdded: r.type === 'refill' ? String(r.quantityRequested || '') : '' })
  }
  const openReject = (r) => {
    setRejectModal(r)
    setRejectReason('')
  }

  if (!isInventory && !canFulfill) return null

  return (
    <>
      <h1 className="h4 mb-4 fw-semibold">Requests</h1>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {isInventory && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white border-bottom py-3">
            <Nav variant="tabs" className="card-header-tabs border-0">
              <Nav.Item>
                <Nav.Link active={requestType === 'refill'} onClick={() => setRequestType('refill')} role="button">
                  Request refill
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link active={requestType === 'new_product'} onClick={() => setRequestType('new_product')} role="button">
                  Request new product
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleCreate}>
              {requestType === 'refill' ? (
                <Row>
                  <Col md={6}>
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
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Quantity requested</Form.Label>
                      <Form.Control
                        type="number"
                        min={1}
                        value={form.quantityRequested}
                        onChange={(e) => setForm({ ...form, quantityRequested: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Note (optional)</Form.Label>
                      <Form.Control
                        value={form.note}
                        onChange={(e) => setForm({ ...form, note: e.target.value })}
                        placeholder="Optional"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              ) : (
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Product name</Form.Label>
                      <Form.Control
                        value={form.productName}
                        onChange={(e) => setForm({ ...form, productName: e.target.value })}
                        required
                        placeholder="e.g. New Item"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Control
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        placeholder="Optional"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
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
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Suggested price (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.suggestedPrice}
                        onChange={(e) => setForm({ ...form, suggestedPrice: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Suggested quantity</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={form.suggestedQuantity}
                        onChange={(e) => setForm({ ...form, suggestedQuantity: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Suggested min threshold</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={form.suggestedMinThreshold}
                        onChange={(e) => setForm({ ...form, suggestedMinThreshold: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Note (optional)</Form.Label>
                      <Form.Control
                        value={form.note}
                        onChange={(e) => setForm({ ...form, note: e.target.value })}
                        placeholder="Optional"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Submitting...' : requestType === 'refill' ? 'Submit refill request' : 'Submit new product request'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom py-3">
          <Card.Title as="h6" className="mb-0 fw-semibold">
            {canFulfill ? 'Pending requests' : 'My requests'}
          </Card.Title>
        </Card.Header>
        {loading ? (
          <Card.Body className="text-center py-5">
            <Spinner animation="border" size="sm" />
            <span className="ms-2">Loading...</span>
          </Card.Body>
        ) : requests.length === 0 ? (
          <Card.Body className="text-center text-muted py-5">
            {canFulfill ? 'No pending requests.' : 'No requests yet.'}
          </Card.Body>
        ) : (
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Type</th>
                <th>Details</th>
                {canFulfill && <th>Requested by</th>}
                {!canFulfill && <th>Status</th>}
                <th>Date</th>
                {canFulfill && <th className="text-end">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td>
                    <Badge bg={r.type === 'refill' ? 'info' : 'secondary'}>
                      {r.type === 'refill' ? 'Refill' : 'New product'}
                    </Badge>
                  </td>
                  <td>
                    {r.type === 'refill' ? (
                      <>{r.productId?.productName} — Qty: {r.quantityRequested}</>
                    ) : (
                      <>{r.productName}{r.category ? ` (${r.category})` : ''}</>
                    )}
                    {r.note && <div className="small text-muted">{r.note}</div>}
                  </td>
                  {canFulfill && (
                    <td className="text-muted small">{r.requestedBy?.name}</td>
                  )}
                  {!canFulfill && (
                    <td>
                      <Badge bg={r.status === 'pending' ? 'warning' : r.status === 'fulfilled' ? 'success' : 'danger'} text={r.status === 'pending' ? 'dark' : undefined}>
                        {r.status}
                      </Badge>
                      {r.rejectionReason && <div className="small text-muted">{r.rejectionReason}</div>}
                    </td>
                  )}
                  <td className="text-muted small">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                  </td>
                  {canFulfill && (
                    <td className="text-end">
                      <Button variant="outline-success" size="sm" className="me-1" onClick={() => openFulfill(r)}>
                        Fulfill
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => openReject(r)}>
                        Reject
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Fulfill modal */}
      <Modal show={!!fulfillModal} onHide={() => setFulfillModal(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Fulfill request</Modal.Title>
        </Modal.Header>
        {fulfillModal && (
          <Form onSubmit={handleFulfill}>
            <Modal.Body>
              <p className="mb-3">
                {fulfillModal.type === 'refill' ? (
                  <>Refill <strong>{fulfillModal.productId?.productName}</strong> — requested: {fulfillModal.quantityRequested}</>
                ) : (
                  <>New product: <strong>{fulfillModal.productName}</strong></>
                )}
              </p>
              {fulfillModal.type === 'refill' ? (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Supplier</Form.Label>
                    <Form.Select
                      value={fulfillForm.supplierId}
                      onChange={(e) => setFulfillForm({ ...fulfillForm, supplierId: e.target.value })}
                      required
                    >
                      <option value="">Select supplier</option>
                      {suppliers.map((s) => (
                        <option key={s._id} value={s._id}>{s.supplierName}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-0">
                    <Form.Label>Quantity to add</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      value={fulfillForm.quantityAdded}
                      onChange={(e) => setFulfillForm({ ...fulfillForm, quantityAdded: e.target.value })}
                      required
                    />
                  </Form.Group>
                </>
              ) : (
                <p className="text-muted small mb-0">A new product will be created from the request details. Click Fulfill to confirm.</p>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setFulfillModal(null)}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={actionLoading}>
                {actionLoading ? 'Saving...' : 'Fulfill'}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>

      {/* Reject modal */}
      <Modal show={!!rejectModal} onHide={() => setRejectModal(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reject request</Modal.Title>
        </Modal.Header>
        {rejectModal && (
          <Form onSubmit={handleReject}>
            <Modal.Body>
              <p className="mb-3">
                {rejectModal.type === 'refill' ? (
                  <>Refill: {rejectModal.productId?.productName}</>
                ) : (
                  <>New product: {rejectModal.productName}</>
                )}
              </p>
              <Form.Group>
                <Form.Label>Reason (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Optional reason for rejection"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setRejectModal(null)}>Cancel</Button>
              <Button variant="danger" type="submit" disabled={actionLoading}>
                {actionLoading ? 'Rejecting...' : 'Reject'}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>
    </>
  )
}
