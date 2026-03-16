import { Database, ShieldCheck } from 'lucide-react'

import Card from '../components/Card'
import AdminResourceCard from '../components/admin/AdminResourceCard'

const AdminConsole = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-primary-700" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Operations Console</h1>
          <p className="text-gray-600 mt-1">Centralized admin-only control center for all system resources.</p>
        </div>
      </div>

      <Card>
        <div className="flex items-start gap-3 text-sm text-gray-700">
          <Database className="w-5 h-5 mt-0.5 text-gray-500" />
          <p>
            Use this dedicated console for create, update, and delete operations across users,
            meters, payments, telemetry, tokens, and token blacklist data.
          </p>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Authentication and Users</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <AdminResourceCard
            title="Users"
            resourceKey="users"
            idField="id"
            samplePayload={{
              email: 'new.user@example.com',
              first_name: 'New',
              last_name: 'User',
              role: 'CUSTOMER',
              is_active: true,
              is_verified: true,
              password: 'StrongPass123!'
            }}
          />
          <AdminResourceCard
            title="Groups"
            resourceKey="groups"
            idField="id"
            samplePayload={{ name: 'Support Team' }}
          />
          <AdminResourceCard
            title="Email Verification Tokens"
            resourceKey="email-verification-tokens"
            idField="id"
            samplePayload={{ user: 1, token: 'email-token' }}
          />
          <AdminResourceCard
            title="Password Reset Tokens"
            resourceKey="password-reset-tokens"
            idField="id"
            samplePayload={{ user: 1, token: 'reset-token' }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Meters and Payments</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <AdminResourceCard
            title="Meters"
            resourceKey="meters"
            idField="id"
            samplePayload={{ serial_number: 'MTR123456', owner: 1 }}
          />
          <AdminResourceCard
            title="Meter Alerts"
            resourceKey="meter-alerts"
            idField="id"
            samplePayload={{
              meter: 1,
              alert_type: 'LOW_CREDIT',
              severity: 'MEDIUM',
              message: 'Low credit detected',
              status: 'ACTIVE'
            }}
          />
          <AdminResourceCard
            title="Meter Events"
            resourceKey="meter-events"
            idField="id"
            samplePayload={{
              meter: 1,
              event_type: 'LOAD_CONTROL',
              event_data: { action: 'OFF', reason: 'test' }
            }}
          />
          <AdminResourceCard
            title="Payments"
            resourceKey="payments"
            idField="id"
            samplePayload={{
              user: 1,
              meter: 1,
              amount: '100.00',
              payment_method: 'MPESA',
              status: 'PENDING'
            }}
          />
          <AdminResourceCard
            title="Credit Transactions"
            resourceKey="credit-transactions"
            idField="id"
            samplePayload={{
              user: 1,
              meter: 1,
              transaction_type: 'CREDIT',
              amount: '100.00',
              balance_after: '150.00',
              description: 'Manual adjustment'
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Telemetry and Tokens</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <AdminResourceCard
            title="Telemetry Data"
            resourceKey="telemetry-datas"
            idField="id"
            samplePayload={{
              meter: 1,
              voltage: '230.00',
              current: '1.20',
              power: '276.00',
              energy: '0.50'
            }}
          />
          <AdminResourceCard
            title="Telemetry Aggregates"
            resourceKey="telemetry-aggregates"
            idField="id"
            samplePayload={{
              meter: 1,
              period_type: 'daily',
              average_voltage: '228.10',
              total_energy: '12.20'
            }}
          />
          <AdminResourceCard
            title="Device Diagnostics"
            resourceKey="device-diagnostics"
            idField="id"
            samplePayload={{
              meter: 1,
              cpu_usage: 12,
              free_memory: 2048,
              error_code: null
            }}
          />
          <AdminResourceCard
            title="Energy Tokens"
            resourceKey="energy-tokens"
            idField="id"
            samplePayload={{ meter: 1, user: 1, units: '5.00', amount_paid: '100.00' }}
          />
          <AdminResourceCard
            title="Outstanding Tokens"
            resourceKey="outstanding-tokens"
            idField="jti"
            samplePayload={{ jti: 'new-jti', token: 'jwt-token-value', user: 1 }}
          />
          <AdminResourceCard
            title="Blacklisted Tokens"
            resourceKey="blacklisted-tokens"
            idField="id"
            samplePayload={{ token: 1 }}
          />
        </div>
      </div>
    </div>
  )
}

export default AdminConsole
