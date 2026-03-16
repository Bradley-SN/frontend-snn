import { useEffect, useState } from 'react'
import { Check, CheckCheck, AlertTriangle } from 'lucide-react'
import { meterAPI } from '../../api'
import { useAuthStore } from '../../store/authStore'
import Card from '../../components/Card'
import Loader from '../../components/Loader'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const MeterAlerts = () => {
  const { user } = useAuthStore()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [resolvedFilter, setResolvedFilter] = useState('false')

  const canResolve = user?.role === 'ADMIN'

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const response = await meterAPI.getAlerts({ resolved: resolvedFilter })
      setAlerts(response.data?.results || response.data || [])
    } catch (error) {
      toast.error('Failed to load meter alerts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [resolvedFilter])

  const handleAcknowledge = async (id) => {
    try {
      await meterAPI.acknowledgeAlert(id)
      toast.success('Alert acknowledged')
      loadAlerts()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to acknowledge alert')
    }
  }

  const handleResolve = async (id) => {
    try {
      await meterAPI.resolveAlert(id)
      toast.success('Alert resolved')
      loadAlerts()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to resolve alert')
    }
  }

  const severityColor = (severity) => {
    const map = {
      CRITICAL: 'bg-red-100 text-red-800',
      WARNING: 'bg-yellow-100 text-yellow-800',
      INFO: 'bg-blue-100 text-blue-800',
    }
    return map[severity] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meter Alerts</h1>
          <p className="text-gray-600 mt-1">Review and manage system alerts</p>
        </div>
        <select
          value={resolvedFilter}
          onChange={(e) => setResolvedFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="false">Active Alerts</option>
          <option value="true">Resolved Alerts</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader size="lg" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            No alerts found.
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{alert.alert_type}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${severityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Meter: {alert.meter_serial || 'N/A'} • Created:{' '}
                      {format(new Date(alert.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>

                  {!alert.is_resolved && (
                    <div className="flex gap-2">
                      {!alert.is_acknowledged && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <Check className="w-4 h-4" />
                          Acknowledge
                        </button>
                      )}
                      {canResolve && (
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                          <CheckCheck className="w-4 h-4" />
                          Resolve
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default MeterAlerts
