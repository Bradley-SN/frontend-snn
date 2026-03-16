import { useEffect, useState } from 'react'
import { Key, Plus, CheckCircle, XCircle, Clock, ShieldCheck } from 'lucide-react'
import { tokenAPI } from '../../api'
import { useMeterStore } from '../../store/meterStore'
import { useAuthStore } from '../../store/authStore'
import Card from '../../components/Card'
import Loader from '../../components/Loader'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const Tokens = () => {
  const { user } = useAuthStore()
  const { meters, fetchMeters } = useMeterStore()
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedMeterId, setSelectedMeterId] = useState('')
  const [history, setHistory] = useState([])
  const [tokenCode, setTokenCode] = useState('')
  const [selectedSerial, setSelectedSerial] = useState('')
  const [verifyResult, setVerifyResult] = useState(null)
  const [generateForm, setGenerateForm] = useState({
    meter_id: '',
    value: '',
    token_type: 'ENERGY',
  })

  const canGenerate = user?.role === 'ADMIN'
  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    loadTokens()
    fetchMeters()
  }, [])

  useEffect(() => {
    if (selectedMeterId) {
      loadTokenHistory(selectedMeterId)
      const meter = meters.find((m) => m.id === selectedMeterId)
      setSelectedSerial(meter?.serial_number || '')
    }
  }, [selectedMeterId, meters])

  const loadTokens = async () => {
    setLoading(true)
    try {
      const response = await tokenAPI.list()
      setTokens(response.data.results || response.data)
    } catch (error) {
      toast.error('Failed to load tokens')
    } finally {
      setLoading(false)
    }
  }

  const loadTokenHistory = async (meterId) => {
    try {
      const response = await tokenAPI.getHistory(meterId)
      setHistory(response.data || [])
    } catch (error) {
      setHistory([])
    }
  }

  const handleApplyToken = async (e) => {
    e.preventDefault()
    if (!selectedSerial) {
      toast.error('Select a meter serial number to apply token')
      return
    }

    try {
      const response = await tokenAPI.apply({
        token_code: tokenCode,
        serial_number: selectedSerial,
      })
      toast.success(response.data?.message || 'Token applied successfully!')
      setShowApplyModal(false)
      setTokenCode('')
      if (selectedMeterId) {
        loadTokenHistory(selectedMeterId)
      }
      loadTokens()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to apply token. Please check the code and try again.')
    }
  }

  const handleVerifyToken = async (e) => {
    e.preventDefault()
    if (!selectedSerial) {
      toast.error('Select a meter serial number first')
      return
    }

    try {
      const response = await tokenAPI.verify({
        token_code: tokenCode,
        serial_number: selectedSerial,
      })
      setVerifyResult(response.data)
      toast.success(response.data?.valid ? 'Token is valid' : 'Token is not valid')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to verify token')
    }
  }

  const handleGenerateToken = async (e) => {
    e.preventDefault()
    try {
      await tokenAPI.generate(generateForm)
      toast.success('Token generated successfully')
      setShowGenerateModal(false)
      setGenerateForm({ meter_id: '', value: '', token_type: 'ENERGY' })
      loadTokens()
      if (selectedMeterId) {
        loadTokenHistory(selectedMeterId)
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || error.response?.data?.value?.[0] || 'Failed to generate token')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      APPLIED: 'bg-green-100 text-green-800',
      GENERATED: 'bg-blue-100 text-blue-800',
      EXPIRED: 'bg-red-100 text-red-800',
      INVALID: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPLIED':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'GENERATED':
        return <Clock className="w-5 h-5 text-blue-600" />
      case 'EXPIRED':
      case 'INVALID':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Key className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tokens</h1>
          <p className="text-gray-600 mt-1">Manage your energy tokens</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setVerifyResult(null)
              setShowVerifyModal(true)
            }}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Verify Token</span>
          </button>
          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Apply Token</span>
          </button>
          {canGenerate && (
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Generate Token</span>
            </button>
          )}
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meter</label>
            <select
              value={selectedMeterId}
              onChange={(e) => setSelectedMeterId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select meter for token actions/history</option>
              {meters.map((meter) => (
                <option key={meter.id} value={meter.id}>
                  {meter.serial_number}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Selected Serial</label>
            <input
              value={selectedSerial}
              onChange={(e) => setSelectedSerial(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Meter serial number"
              readOnly={!isAdmin}
            />
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card>
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Key className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">How Tokens Work</h3>
            <p className="text-sm text-gray-600">
              Tokens are generated when you make a payment. Apply the token code to your meter
              to add credit. Each token can only be used once and expires after 30 days.
            </p>
          </div>
        </div>
      </Card>

      {/* Tokens List */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader size="lg" />
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tokens yet</h3>
            <p className="text-gray-500 mb-6">
              Tokens are automatically generated when you make a payment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(token.status)}
                  <div>
                    <div className="flex items-center space-x-3">
                      <p className="font-mono font-semibold text-lg text-gray-900">
                        {token.token_code}
                      </p>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          token.status
                        )}`}
                      >
                        {token.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Meter: {token.meter?.serial_number || 'N/A'} • Value: KSh{' '}
                      {parseFloat(token.value).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Generated: {format(new Date(token.generated_at), 'MMM dd, yyyy HH:mm')}
                      {token.applied_at &&
                        ` • Applied: ${format(
                          new Date(token.applied_at),
                          'MMM dd, yyyy HH:mm'
                        )}`}
                    </p>
                  </div>
                </div>
                {token.status === 'GENERATED' && (
                  <button
                    onClick={() => {
                      setTokenCode(token.token_code)
                      setShowApplyModal(true)
                    }}
                    className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Token History by Meter">
        {!selectedMeterId ? (
          <p className="text-sm text-gray-500">Select a meter above to view token history.</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-500">No token history for the selected meter.</p>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 15).map((token) => (
              <div key={token.id} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold text-gray-900">{token.token_code}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {token.token_type} • {format(new Date(token.generated_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(token.status)}`}>
                  {token.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Apply Token Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Apply Token"
      >
        <form onSubmit={handleApplyToken} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Code
            </label>
            <input
              type="text"
              value={tokenCode}
              onChange={(e) => setTokenCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-lg"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Make sure the token code is correct. Each token can only
              be used once.
            </p>
          </div>

          <div className="flex space-x-3 justify-end">
            <button
              type="button"
              onClick={() => setShowApplyModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Apply Token
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showVerifyModal} onClose={() => setShowVerifyModal(false)} title="Verify Token">
        <form onSubmit={handleVerifyToken} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Token Code</label>
            <input
              type="text"
              value={tokenCode}
              onChange={(e) => setTokenCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono"
              required
            />
          </div>

          {verifyResult && (
            <div className={`p-3 rounded-lg ${verifyResult.valid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {verifyResult.valid ? (
                <p className="text-sm">Valid token • Type: {verifyResult.token_type} • Value: {verifyResult.value}</p>
              ) : (
                <p className="text-sm">Invalid token</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowVerifyModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Close</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Verify</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} title="Generate Token">
        <form onSubmit={handleGenerateToken} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meter</label>
            <select
              value={generateForm.meter_id}
              onChange={(e) => setGenerateForm((prev) => ({ ...prev, meter_id: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Select meter</option>
              {meters.map((meter) => (
                <option key={meter.id} value={meter.id}>{meter.serial_number}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={generateForm.value}
                onChange={(e) => setGenerateForm((prev) => ({ ...prev, value: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Token Type</label>
              <select
                value={generateForm.token_type}
                onChange={(e) => setGenerateForm((prev) => ({ ...prev, token_type: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="ENERGY">ENERGY</option>
                <option value="TIME">TIME</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowGenerateModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg">Generate</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Tokens
