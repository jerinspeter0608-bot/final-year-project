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
} from 'react-bootstrap'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    supplierName: '',
    contactNumber: '',
    email: '',
    address: '',
  })

  const loadSuppliers = () => {
    api('/suppliers')
      .then(setSuppliers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadSuppliers()
  }, [])

  const openAdd = () => {
    setEditingId(null)
    setForm({ supplierName: '', contactNumber: '', email: '', address: '' })
    setShowModal(true)
    setError('')
    setSuccess('')
  }

  const openEdit = (s) => {
    setEditingId(s._id)
    setForm({
      supplierName: s.supplierName,
      contactNumber: s.contactNumber || '',
      email: s.email || '',
      address: s.address || '',
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
      if (editingId) {
        await api(`/suppliers/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        })
        setSuccess('Supplier updated.')
      } else {
        await api('/suppliers', { method: 'POST', body: JSON.stringify(form) })
        setSuccess('Supplier added.')
      }
      loadSuppliers()
      closeModal()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete supplier "${name}"?`)) return
    try {
      await api(`/suppliers/${id}`, { method: 'DELETE' })
      setSuccess('Supplier deleted.')
      loadSuppliers()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
        <h1 className="h4 mb-0 fw-semibold">Suppliers</h1>
        <Button variant="primary" size="sm" onClick={openAdd}>
          Add Supplier
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Card className="border-0 shadow-sm">
        {loading ? (
          <Card.Body className="text-center py-5">
            <Spinner animation="border" size="sm" />
            <span className="ms-2">Loading suppliers...</span>
          </Card.Body>
        ) : suppliers.length === 0 ? (
          <Card.Body className="text-center text-muted py-5">
            No suppliers yet. Click &quot;Add Supplier&quot; to create one.
          </Card.Body>
        ) : (
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Address</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s._id}>
                  <td className="fw-medium">{s.supplierName}</td>
                  <td className="text-muted">{s.contactNumber || '—'}</td>
                  <td className="text-muted">{s.email || '—'}</td>
                  <td className="text-muted">{s.address || '—'}</td>
                  <td className="text-end">
                    <Button variant="outline-secondary" size="sm" className="me-1" onClick={() => openEdit(s)}>
                      Edit
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(s._id, s.supplierName)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit Supplier' : 'Add Supplier'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Supplier name</Form.Label>
              <Form.Control
                value={form.supplierName}
                onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                required
                placeholder="e.g. ABC Wholesale"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact number</Form.Label>
              <Form.Control
                value={form.contactNumber}
                onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                placeholder="e.g. 9876543210"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="supplier@example.com"
              />
            </Form.Group>
            <Form.Group className="mb-0">
              <Form.Label>Address</Form.Label>
              <Form.Control
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Optional"
              />
            </Form.Group>
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
