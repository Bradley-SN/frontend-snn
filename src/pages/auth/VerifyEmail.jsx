import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MailCheck, MailX, Loader2 } from 'lucide-react'
import { authAPI } from '../../api'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [state, setState] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setState('error')
        setMessage('Verification token is missing.')
        return
      }

      try {
        const response = await authAPI.verifyEmail(token)
        setState('success')
        setMessage(response.data?.message || 'Email verified successfully.')
      } catch (error) {
        setState('error')
        setMessage(
          error.response?.data?.error ||
            error.response?.data?.detail ||
            'Verification failed. The token may be invalid or expired.'
        )
      }
    }

    verify()
  }, [token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 text-center">
        {state === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-primary-600 mx-auto animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mt-4">Verifying Email</h1>
            <p className="text-gray-600 mt-2">Please wait while we verify your account.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <MailCheck className="w-12 h-12 text-green-600 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900 mt-4">Verification Successful</h1>
            <p className="text-gray-600 mt-2">{message}</p>
            <Link
              to="/login"
              className="inline-block mt-6 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Continue to Login
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <MailX className="w-12 h-12 text-red-600 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900 mt-4">Verification Failed</h1>
            <p className="text-gray-600 mt-2">{message}</p>
            <Link
              to="/login"
              className="inline-block mt-6 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail
