import { useState, useEffect } from 'react'
import { api } from '../api'
import { Card, Table, Nav, Spinner, Alert } from 'react-bootstrap'

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

  if (error) return <Alert variant="danger">{error}</Alert>

  const totalSalesAmount = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0)

  return (
    <>
      <h1 className="h4 mb-4 fw-semibold">Reports</h1>

      <Nav variant="tabs" className="mb-4">
        <Nav.Item>
          <Nav.Link
            active={activeTab === 'sales'}
            onClick={() => setActiveTab('sales')}
            role="button"
          >
            Sales Summary
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            active={activeTab === 'restock'}
            onClick={() => setActiveTab('restock')}
            role="button"
          >
            Restock History
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" variant="primary" />
          <span className="ms-2">Loading...</span>
        </div>
      ) : activeTab === 'sales' ? (
        <>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="py-3">
              <span className="text-muted">Total sales (all time):</span>{' '}
              <strong className="text-success fs-5">₹{totalSalesAmount.toFixed(2)}</strong>
            </Card.Body>
          </Card>
          <Card className="border-0 shadow-sm">
            {sales.length === 0 ? (
              <Card.Body className="text-center text-muted py-5">
                No sales recorded.
              </Card.Body>
            ) : (
              <Table responsive hover className="mb-0">
                <thead className="table-light">
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
        </>
      ) : (
        <Card className="border-0 shadow-sm">
          {restocks.length === 0 ? (
            <Card.Body className="text-center text-muted py-5">
              No restock entries.
            </Card.Body>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
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
                    <td className="text-muted small">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}
    </>
  )
}
