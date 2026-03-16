import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Plus, Search, Filter } from 'lucide-react'
import { useMeterStore } from '../../store/meterStore'
import { useAuthStore } from '../../store/authStore'
import { meterAPI } from '../../api'
import Card from '../../components/Card'
import Loader from '../../components/Loader'

const Meters = () => {
  const { meters, fetchMeters, isLoading } = useMeterStore()
  const { user } = useAuthStore()
  const [searchedMeters, setSearchedMeters] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const canCreateMeter = user?.role === 'ADMIN'

  useEffect(() => {
    fetchMeters()
  }, [])

  useEffect(() => {
    const runSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchedMeters([])
        return
      }

      try {
        const response = await meterAPI.search(searchQuery.trim())
        setSearchedMeters(response.data || [])
      } catch (error) {
        setSearchedMeters([])
      }
    }

    const timer = setTimeout(runSearch, 350)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      DISCONNECTED: 'bg-red-100 text-red-800',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const sourceMeters = searchQuery.trim() ? searchedMeters : meters

  const filteredMeters = sourceMeters
    .filter((meter) => {
      if (statusFilter !== 'ALL' && meter.status !== statusFilter) return false
      return true
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meters</h1>
          <p className="text-gray-600 mt-1">Manage your energy meters</p>
        </div>
        {canCreateMeter && (
          <Link
            to="/meters/add"
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Meter</span>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by serial number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DISCONNECTED">Disconnected</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Meters Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      ) : filteredMeters.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meters found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first meter'}
            </p>
            {!searchQuery && statusFilter === 'ALL' && canCreateMeter && (
              <Link
                to="/meters/add"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Your First Meter</span>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeters.map((meter) => (
            <Link
              key={meter.id}
              to={`/meters/${meter.id}`}
              className="block"
            >
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {meter.serial_number}
                        </h3>
                        <p className="text-sm text-gray-500">{meter.device_model}</p>
                        {canCreateMeter && meter.user_email && (
                          <p className="text-xs text-gray-500 mt-1">Owner: {meter.user_email}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        meter.status
                      )}`}
                    >
                      {meter.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Credit Balance</p>
                      <p className="text-lg font-semibold text-gray-900">
                        KSh {parseFloat(meter.credit_balance).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Energy Consumed</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {parseFloat(meter.total_energy_consumed).toFixed(2)} kWh
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-sm">
                    <span className="text-gray-600">
                      Load: {meter.load_connected ? '✓ Connected' : '✗ Disconnected'}
                    </span>
                    <span
                      className={`${
                        meter.is_connected ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {meter.is_connected ? '● Online' : '● Offline'}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

    </div>
  )
}

export default Meters
