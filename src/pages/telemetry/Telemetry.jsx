import { useEffect, useState } from 'react'
import { Activity, Download } from 'lucide-react'
import { useMeterStore } from '../../store/meterStore'
import { telemetryAPI } from '../../api'
import Card from '../../components/Card'
import Loader from '../../components/Loader'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const Telemetry = () => {
  const { meters, fetchMeters } = useMeterStore()
  const [selectedMeter, setSelectedMeter] = useState('')
  const [telemetryData, setTelemetryData] = useState([])
  const [stats, setStats] = useState(null)
  const [diagnostics, setDiagnostics] = useState([])
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState('daily')

  useEffect(() => {
    fetchMeters()
  }, [])

  useEffect(() => {
    if (selectedMeter) {
      loadTelemetryData()
    }
  }, [selectedMeter, period])

  const loadTelemetryData = async () => {
    setLoading(true)
    try {
      const response = await telemetryAPI.list(selectedMeter, { limit: 50 })
      setTelemetryData(response.data.results || [])

      const statsResponse = await telemetryAPI.getStats(selectedMeter, { period })
      const rawStats = statsResponse.data
      if (Array.isArray(rawStats)) {
        const first = rawStats[0]
        setStats(
          first
            ? {
                avg_power: first.avg_power,
                total_energy: first.total_energy,
                avg_voltage: first.avg_voltage,
                max_power: first.max_power,
              }
            : {
                avg_power: 0,
                total_energy: 0,
                avg_voltage: 0,
                max_power: 0,
              }
        )
      } else {
        setStats(rawStats)
      }

      const diagnosticsResponse = await telemetryAPI.getDiagnostics(selectedMeter, { limit: 5 })
      setDiagnostics(diagnosticsResponse.data.results || diagnosticsResponse.data || [])
    } catch (error) {
      console.error('Failed to load telemetry data:', error)
      toast.error('Failed to load telemetry data')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!selectedMeter) return
    try {
      const response = await telemetryAPI.export(selectedMeter)
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `telemetry_${selectedMeter}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Telemetry exported')
    } catch (error) {
      toast.error('Failed to export telemetry')
    }
  }

  const chartData = telemetryData
    .slice()
    .reverse()
    .map((item) => ({
      time: format(new Date(item.server_timestamp), 'HH:mm'),
      power: parseFloat(item.power),
      voltage: parseFloat(item.voltage),
      current: parseFloat(item.current),
      energy: parseFloat(item.energy),
    }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Telemetry Data</h1>
        <p className="text-gray-600 mt-1">Monitor your energy consumption in real-time</p>
      </div>

      {/* Meter Selection */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Meter
            </label>
            <select
              value={selectedMeter}
              onChange={(e) => setSelectedMeter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose a meter...</option>
              {meters.map((meter) => (
                <option key={meter.id} value={meter.id}>
                  {meter.serial_number} - {meter.device_model}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </Card>

      {!selectedMeter ? (
        <Card>
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a meter to view telemetry
            </h3>
            <p className="text-gray-500">
              Choose a meter from the dropdown above to see real-time data
            </p>
          </div>
        </Card>
      ) : loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <p className="text-sm text-gray-600 mb-1">Avg Power</p>
                <p className="text-2xl font-bold text-gray-900">
                  {parseFloat(stats.avg_power || 0).toFixed(2)} W
                </p>
              </Card>
              <Card>
                <p className="text-sm text-gray-600 mb-1">Total Energy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {parseFloat(stats.total_energy || 0).toFixed(2)} kWh
                </p>
              </Card>
              <Card>
                <p className="text-sm text-gray-600 mb-1">Avg Voltage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {parseFloat(stats.avg_voltage || 0).toFixed(2)} V
                </p>
              </Card>
              <Card>
                <p className="text-sm text-gray-600 mb-1">Max Power</p>
                <p className="text-2xl font-bold text-gray-900">
                  {parseFloat(stats.max_power || 0).toFixed(2)} W
                </p>
              </Card>
            </div>
          )}

          {/* Charts */}
          <Card
            title="Power Consumption"
            action={
              <button onClick={handleExport} className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="power"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  name="Power (W)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Voltage & Current">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="voltage" stroke="#10b981" name="Voltage (V)" />
                  <Line type="monotone" dataKey="current" stroke="#f59e0b" name="Current (A)" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Energy Consumption">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="energy" fill="#8b5cf6" name="Energy (kWh)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Raw Data Table */}
          <Card title="Raw Telemetry Data">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Voltage (V)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Current (A)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Power (W)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Energy (kWh)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Temperature
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {telemetryData.slice(0, 20).map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(item.server_timestamp), 'MMM dd, HH:mm:ss')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parseFloat(item.voltage).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parseFloat(item.current).toFixed(3)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parseFloat(item.power).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parseFloat(item.energy).toFixed(3)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.temperature ? `${parseFloat(item.temperature).toFixed(1)} °C` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Latest Diagnostics">
            {diagnostics.length === 0 ? (
              <p className="text-sm text-gray-500">No diagnostics available.</p>
            ) : (
              <div className="space-y-3">
                {diagnostics.map((diag) => (
                  <div key={diag.id} className="p-3 border border-gray-200 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900">
                      {format(new Date(diag.timestamp), 'MMM dd, yyyy HH:mm')}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      CPU: {diag.cpu_usage ?? 'N/A'}% • Free Mem: {diag.free_memory ?? 'N/A'} • Error: {diag.error_code || 'None'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Sensors: V {diag.voltage_sensor_ok ? 'OK' : 'ERR'} • I {diag.current_sensor_ok ? 'OK' : 'ERR'} • T {diag.temp_sensor_ok ? 'OK' : 'ERR'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </>
      )}
    </div>
  )
}

export default Telemetry
