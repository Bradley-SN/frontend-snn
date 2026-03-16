import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap,
  Activity,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Battery,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useMeterStore } from '../store/meterStore'
import { meterAPI, paymentAPI, telemetryAPI } from '../api'
import Card from '../components/Card'
import Loader from '../components/Loader'
import { format } from 'date-fns'

const Dashboard = () => {
  const { user } = useAuthStore()
  const { meters, fetchMeters } = useMeterStore()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentPayments, setRecentPayments] = useState([])
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      await fetchMeters()
      
      // Fetch stats based on user role
      if (user?.role === 'CUSTOMER') {
        const paymentResponse = await paymentAPI.list({ limit: 5 })
        setRecentPayments(paymentResponse.data.results || [])
      }

      // Fetch alerts
      const alertResponse = await meterAPI.getAlerts({ status: 'ACTIVE', limit: 5 })
      setAlerts(alertResponse.data.results || [])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      DISCONNECTED: 'bg-red-100 text-red-800',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your energy monitoring system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-0">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Meters</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{meters.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-0">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Meters</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {meters.filter((m) => m.status === 'ACTIVE').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-0">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Credit</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  KSh{' '}
                  {meters
                    .reduce((sum, m) => sum + parseFloat(m.credit_balance || 0), 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-0">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{alerts.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meters Overview */}
        <Card title="Your Meters">
          {meters.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No meters found</p>
              <Link
                to="/meters"
                className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Add your first meter
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {meters.slice(0, 5).map((meter) => (
                <Link
                  key={meter.id}
                  to={`/meters/${meter.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {meter.serial_number}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {meter.device_model}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        KSh {parseFloat(meter.credit_balance).toFixed(2)}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          meter.status
                        )}`}
                      >
                        {meter.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              {meters.length > 5 && (
                <Link
                  to="/meters"
                  className="block text-center py-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all meters
                </Link>
              )}
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity">
          {alerts.length === 0 && recentPayments.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg"
                >
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {alert.alert_type}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                  </div>
                </div>
              ))}

              {recentPayments.slice(0, 3).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg"
                >
                  <CreditCard className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Payment Received
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      KSh {parseFloat(payment.amount).toFixed(2)} via{' '}
                      {payment.payment_method}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
