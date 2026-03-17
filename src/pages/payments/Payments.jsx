import { useEffect, useState } from 'react'
import { CreditCard, Plus, RefreshCw } from 'lucide-react'
import { paymentAPI } from '../../api'
import { useMeterStore } from '../../store/meterStore'
import Card from '../../components/Card'
import Loader from '../../components/Loader'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const Payments = () => {
  const { meters, fetchMeters } = useMeterStore()
  const [payments, setPayments] = useState([])
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkingId, setCheckingId] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [formData, setFormData] = useState({
    meter_id: '',
    amount: '',
  })

  useEffect(() => {
    loadPageData()
    fetchMeters()
  }, [])

  const loadPageData = async () => {
    setLoading(true)
    try {
      const [paymentRes, statsRes, txRes] = await Promise.all([
        paymentAPI.list(),
        paymentAPI.getStats(),
        paymentAPI.getTransactions({ limit: 10 }),
      ])
      setPayments(paymentRes.data.results || paymentRes.data || [])
      setStats(statsRes.data)
      setTransactions(txRes.data.results || txRes.data || [])
    } catch (error) {
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await paymentAPI.initiate({
        ...formData,
      })

      const token = response.data?.token_code
      toast.success(
        token
          ? `Payment complete! Token: ${token}`
          : 'Payment completed successfully'
      )

      setShowPaymentModal(false)
      setFormData({ meter_id: '', amount: '' })
      loadPageData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to initiate payment')
    }
  }

  const handleCheckStatus = async () => {
    toast.info('Payments are simulated and complete immediately; refresh to see updates.')
  }
const getStatusColor = (status) => {
    const colors = {
      COMPLETED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Manage your payment transactions</p>
        </div>
        <button
          onClick={() => setShowPaymentModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Make Payment</span>
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-gray-600">Total Payments</p>
            <p className="text-2xl font-bold text-gray-900">KSh {parseFloat(stats.total_payments || 0).toFixed(2)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Payment Count</p>
            <p className="text-2xl font-bold text-gray-900">{stats.payment_count || 0}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Average Payment</p>
            <p className="text-2xl font-bold text-gray-900">KSh {parseFloat(stats.average_payment || 0).toFixed(2)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Last Payment</p>
            <p className="text-sm font-semibold text-gray-900 mt-2">
              {stats.last_payment_date ? format(new Date(stats.last_payment_date), 'MMM dd, yyyy HH:mm') : 'N/A'}
            </p>
          </Card>
        </div>
      )}

      {/* Payments List */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader size="lg" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
            <p className="text-gray-500 mb-6">
              Make your first payment to add credit to your meter
            </p>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Make Payment</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.reference_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.meter?.serial_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      KSh {parseFloat(payment.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.token_code ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs truncate max-w-[120px]">{payment.token_code}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(payment.token_code)
                              toast.success('Token copied to clipboard')
                            }}
                            className="text-primary-600 hover:text-primary-800 text-xs"
                          >
                            Copy
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.payment_method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {payment.status === 'PENDING' && (
                        <button
                          onClick={() => handleCheckStatus(payment)}
                          disabled={checkingId === payment.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${checkingId === payment.id ? 'animate-spin' : ''}`} />
                          Check
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Recent Credit Transactions">
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500">No credit transactions found.</p>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((tx) => (
              <div key={tx.id} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{tx.transaction_type}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {tx.meter_serial || 'N/A'} • {format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">KSh {parseFloat(tx.amount).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Bal: {parseFloat(tx.balance_after).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Make Payment"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Meter
            </label>
            <select
              name="meter_id"
              value={formData.meter_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Choose a meter...</option>
              {meters.map((meter) => (
                <option key={meter.id} value={meter.id}>
                  {meter.serial_number} - KSh {parseFloat(meter.credit_balance).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (KSh)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="1"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="100.00"
              required
            />
          </div>


          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You will receive an M-Pesa prompt on your phone. Enter
              your PIN to complete the payment.
            </p>
          </div>

          <div className="flex space-x-3 justify-end">
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Initiate Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Payments
