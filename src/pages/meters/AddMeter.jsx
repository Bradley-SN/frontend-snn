import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { meterAPI } from '../../api'
import { useAuthStore } from '../../store/authStore'
import Card from '../../components/Card'
import toast from 'react-hot-toast'

const AddMeter = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    serial_number: '',
    user: '',
    billing_mode: 'ENERGY',
    energy_rate: '20.00',
    time_rate: '10.00',
    device_model: 'Smart-DC-Logger-v1',
    gps_latitude: '',
    gps_longitude: '',
  })

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (user?.role !== 'ADMIN') {
      toast.error('Only administrators can create meters')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...formData,
        energy_rate: parseFloat(formData.energy_rate),
        time_rate: parseFloat(formData.time_rate),
      }

      if (!payload.gps_latitude) delete payload.gps_latitude
      if (!payload.gps_longitude) delete payload.gps_longitude

      const response = await meterAPI.create(payload)
      toast.success('Meter created successfully')
      navigate(`/meters/${response.data.id}`)
    } catch (error) {
      const errorData = error.response?.data
      const errorMessage =
        errorData?.serial_number?.[0] ||
        errorData?.user?.[0] ||
        errorData?.detail ||
        'Failed to create meter'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/meters')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Meter</h1>
          <p className="text-gray-600 mt-1">Create a new meter linked to a user</p>
        </div>
      </div>

      <Card>
        {user?.role !== 'ADMIN' ? (
          <p className="text-sm text-red-600">Access denied. Only administrators can create meters.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
              <input
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. MTR-000123"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID (UUID)</label>
              <input
                name="user"
                value={formData.user}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Paste target user UUID"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Billing Mode</label>
                <select
                  name="billing_mode"
                  value={formData.billing_mode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ENERGY">Energy-Based</option>
                  <option value="TIME">Time-Based</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Energy Rate</label>
                <input
                  type="number"
                  step="0.01"
                  name="energy_rate"
                  value={formData.energy_rate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Rate</label>
                <input
                  type="number"
                  step="0.01"
                  name="time_rate"
                  value={formData.time_rate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Device Model</label>
              <input
                name="device_model"
                value={formData.device_model}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GPS Latitude (optional)</label>
                <input
                  type="number"
                  step="0.000001"
                  name="gps_latitude"
                  value={formData.gps_latitude}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GPS Longitude (optional)</label>
                <input
                  type="number"
                  step="0.000001"
                  name="gps_longitude"
                  value={formData.gps_longitude}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Create Meter'}</span>
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}

export default AddMeter
