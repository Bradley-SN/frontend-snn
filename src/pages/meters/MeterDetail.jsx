import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Zap,
  Activity,
  Battery,
  MapPin,
  Power,
  PowerOff,
  Pencil,
  Trash2,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react'
import { useMeterStore } from '../../store/meterStore'
import { meterAPI, telemetryAPI } from '../../api'
import Card from '../../components/Card'
import Loader from '../../components/Loader'
import Modal from '../../components/Modal'
import { format } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

const MeterDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { currentMeter, fetchMeter, stats, fetchStats, events, fetchEvents, controlLoad } = useMeterStore()
  const [loading, setLoading] = useState(true)
  const [telemetryData, setTelemetryData] = useState([])
  const [latestTelemetry, setLatestTelemetry] = useState(null)
  const [showLoadControl, setShowLoadControl] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loadAction, setLoadAction] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingMeter, setDeletingMeter] = useState(false)
  const [editForm, setEditForm] = useState({
    billing_mode: 'ENERGY',
    energy_rate: '20.00',
    time_rate: '10.00',
    status: 'ACTIVE',
  })
  const canControlLoad = user?.role === 'ADMIN'
  const canEditMeter = user?.role === 'ADMIN'

  const isValidUuid = (value) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value || ''
    )

  useEffect(() => {
    if (!isValidUuid(id)) {
      toast.error('Invalid meter selected', { id: 'meter-invalid-id' })
      navigate('/meters', { replace: true })
      return
    }
    loadMeterData()
  }, [id])

  const loadMeterData = async () => {
    setLoading(true)

    try {
      // Meter details are required for this page to render.
      await fetchMeter(id)
    } catch (error) {
      console.error('Failed to load meter data:', error)
      toast.error('Failed to load meter details', { id: 'meter-load-error' })
      setLoading(false)
      return
    }

    // Secondary data should not break the page if unavailable.
    const [statsResult, eventsResult, telemetryListResult, telemetryLatestResult] = await Promise.allSettled([
      fetchStats(id),
      fetchEvents(id, { limit: 10 }),
      telemetryAPI.list(id, { limit: 20 }),
      telemetryAPI.getLatest(id),
    ])

    if (statsResult.status === 'rejected') {
      console.warn('Meter stats unavailable:', statsResult.reason)
    }

    if (eventsResult.status === 'rejected') {
      console.warn('Meter events unavailable:', eventsResult.reason)
    }

    if (telemetryListResult.status === 'fulfilled') {
      setTelemetryData(telemetryListResult.value.data?.results || telemetryListResult.value.data || [])
    } else {
      console.warn('Telemetry list unavailable:', telemetryListResult.reason)
      setTelemetryData([])
    }

    if (telemetryLatestResult.status === 'fulfilled') {
      setLatestTelemetry(telemetryLatestResult.value.data)
    } else {
      // 404 here is expected when meter has no telemetry yet.
      const statusCode = telemetryLatestResult.reason?.response?.status
      if (statusCode !== 404) {
        console.warn('Latest telemetry unavailable:', telemetryLatestResult.reason)
      }
      setLatestTelemetry(null)
    }

    setLoading(false)
  }

  const handleLoadControl = async () => {
    try {
      await controlLoad(id, loadAction)
      setShowLoadControl(false)
      await loadMeterData()
    } catch (error) {
      console.error('Failed to control load:', error)
    }
  }

  const openEditModal = () => {
    setEditForm({
      billing_mode: currentMeter?.billing_mode || 'ENERGY',
      energy_rate: currentMeter?.energy_rate || '20.00',
      time_rate: currentMeter?.time_rate || '10.00',
      status: currentMeter?.status || 'ACTIVE',
    })
    setShowEditModal(true)
  }

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleUpdateMeter = async (e) => {
    e.preventDefault()
    setSavingEdit(true)
    try {
      await meterAPI.update(id, {
        billing_mode: editForm.billing_mode,
        energy_rate: parseFloat(editForm.energy_rate),
        time_rate: parseFloat(editForm.time_rate),
        status: editForm.status,
      })
      toast.success('Meter updated successfully')
      setShowEditModal(false)
      await loadMeterData()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update meter')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDeleteMeter = async () => {
    setDeletingMeter(true)
    try {
      await meterAPI.delete(id)
      toast.success('Meter deleted successfully')
      navigate('/meters', { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete meter')
    } finally {
      setDeletingMeter(false)
      setShowDeleteModal(false)
    }
  }

  if (loading || !currentMeter) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" />
      </div>
    )
  }

  const chartData = telemetryData
    .slice()
    .reverse()
    .map((item) => ({
      time: format(new Date(item.server_timestamp), 'HH:mm'),
      power: parseFloat(item.power),
      voltage: parseFloat(item.voltage),
      current: parseFloat(item.current),
    }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/meters')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentMeter.serial_number}
            </h1>
            <p className="text-gray-600 mt-1">{currentMeter.device_model}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEditMeter && (
            <button
              onClick={openEditModal}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit Meter</span>
            </button>
          )}
          {canEditMeter && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Meter</span>
            </button>
          )}
          {canControlLoad && (
            <button
              onClick={() => {
                setLoadAction(currentMeter.load_connected ? 'disconnect' : 'connect')
                setShowLoadControl(true)
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentMeter.load_connected
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {currentMeter.load_connected ? (
                <>
                  <PowerOff className="w-5 h-5" />
                  <span>Disconnect Load</span>
                </>
              ) : (
                <>
                  <Power className="w-5 h-5" />
                  <span>Connect Load</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Battery className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Credit Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                KSh {parseFloat(currentMeter.credit_balance).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Power</p>
              <p className="text-2xl font-bold text-gray-900">
                {latestTelemetry ? `${parseFloat(latestTelemetry.power).toFixed(2)} W` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Energy</p>
              <p className="text-2xl font-bold text-gray-900">
                {parseFloat(currentMeter.total_energy_consumed).toFixed(2)} kWh
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentMeter.load_connected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Live Data */}
      {latestTelemetry && (
        <Card title="Live Readings">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Voltage</p>
              <p className="text-xl font-semibold text-gray-900">
                {parseFloat(latestTelemetry.voltage).toFixed(2)} V
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Current</p>
              <p className="text-xl font-semibold text-gray-900">
                {parseFloat(latestTelemetry.current).toFixed(3)} A
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Temperature</p>
              <p className="text-xl font-semibold text-gray-900">
                {latestTelemetry.temperature ? `${parseFloat(latestTelemetry.temperature).toFixed(1)} °C` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Last Update</p>
              <p className="text-xl font-semibold text-gray-900">
                {format(new Date(latestTelemetry.server_timestamp), 'HH:mm:ss')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Power Chart */}
      <Card title="Power Consumption (Last 24 Hours)">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="power" stroke="#0ea5e9" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <Card title="Recent Events">
          {events.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No events recorded</p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <AlertTriangle className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {event.event_type}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Meter Information */}
        <Card title="Meter Information">
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Serial Number</span>
              <span className="font-medium text-gray-900">{currentMeter.serial_number}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Device Model</span>
              <span className="font-medium text-gray-900">{currentMeter.device_model}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Billing Mode</span>
              <span className="font-medium text-gray-900">{currentMeter.billing_mode}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Energy Rate</span>
              <span className="font-medium text-gray-900">
                KSh {parseFloat(currentMeter.energy_rate).toFixed(2)}/kWh
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Status</span>
              <span className="font-medium text-gray-900">{currentMeter.status}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Installed At</span>
              <span className="font-medium text-gray-900">
                {format(new Date(currentMeter.installed_at), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Load Control Modal */}
      <Modal
        isOpen={showLoadControl}
        onClose={() => setShowLoadControl(false)}
        title="Confirm Load Control"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to {loadAction} the load for meter{' '}
            <strong>{currentMeter.serial_number}</strong>?
          </p>
          <div className="flex space-x-3 justify-end">
            <button
              onClick={() => setShowLoadControl(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLoadControl}
              className={`px-4 py-2 rounded-lg text-white transition-colors ${
                loadAction === 'disconnect'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              Confirm {loadAction === 'disconnect' ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Meter"
      >
        <form onSubmit={handleUpdateMeter} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Billing Mode</label>
            <select
              name="billing_mode"
              value={editForm.billing_mode}
              onChange={handleEditChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="ENERGY">ENERGY</option>
              <option value="TIME">TIME</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Energy Rate</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="energy_rate"
                value={editForm.energy_rate}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Rate</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="time_rate"
                value={editForm.time_rate}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={editForm.status}
              onChange={handleEditChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="DISCONNECTED">DISCONNECTED</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
            <button type="submit" disabled={savingEdit} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {savingEdit ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Meter"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            This action is permanent. Are you sure you want to delete meter{' '}
            <strong>{currentMeter.serial_number}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
            <button onClick={handleDeleteMeter} disabled={deletingMeter} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
              {deletingMeter ? 'Deleting...' : 'Delete Meter'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default MeterDetail
