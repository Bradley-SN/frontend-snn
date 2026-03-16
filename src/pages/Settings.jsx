import { useState } from 'react'
import { Lock, Bell, Shield, Save } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../api'
import Card from '../components/Card'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, updateProfile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [notifications, setNotifications] = useState({
    email: user?.enable_email_notifications || false,
    sms: user?.enable_sms_notifications || false,
  })

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await authAPI.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
        new_password_confirm: passwordData.confirm_password,
      })
      toast.success('Password changed successfully')
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' })
    } catch (error) {
      toast.error('Failed to change password. Please check your current password.')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationChange = async (type) => {
    const newNotifications = { ...notifications, [type]: !notifications[type] }
    setNotifications(newNotifications)

    try {
      await updateProfile({
        enable_email_notifications: newNotifications.email,
        enable_sms_notifications: newNotifications.sms,
      })
    } catch (error) {
      toast.error('Failed to update notification settings')
      setNotifications(notifications) // Revert
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences and security</p>
      </div>

      {/* Change Password */}
      <Card
        title={
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-gray-600" />
            <span>Change Password</span>
          </div>
        }
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.old_password}
              onChange={(e) =>
                setPasswordData({ ...passwordData, old_password: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.new_password}
              onChange={(e) =>
                setPasswordData({ ...passwordData, new_password: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirm_password}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirm_password: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader size="sm" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Card>

      {/* Notification Settings */}
      <Card
        title={
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <span>Notification Preferences</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">
                Receive alerts and updates via email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={() => handleNotificationChange('email')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">SMS Notifications</h4>
              <p className="text-sm text-gray-600">
                Receive alerts and updates via SMS
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.sms}
                onChange={() => handleNotificationChange('sms')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Security Information */}
      <Card
        title={
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-gray-600" />
            <span>Security Information</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="text-gray-700">Account Status</span>
            <span className="font-medium text-green-600">
              {user?.is_verified ? '✓ Verified' : 'Not Verified'}
            </span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="text-gray-700">Account Created</span>
            <span className="font-medium text-gray-900">
              {user?.date_joined
                ? new Date(user.date_joined).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-gray-700">Last Login</span>
            <span className="font-medium text-gray-900">
              {user?.last_login
                ? new Date(user.last_login).toLocaleDateString()
                : 'Never'}
            </span>
          </div>
        </div>
      </Card>

    </div>
  )
}

export default Settings
