import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'
import { authAPI } from '../api'
import toast from 'react-hot-toast'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (accessToken, refreshToken, user) => {
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        })
      },

      clearAuth: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await authAPI.login(credentials)
          const access = response.data?.access || response.data?.tokens?.access
          const refresh = response.data?.refresh || response.data?.tokens?.refresh
          const user = response.data?.user

          if (!access || !refresh || !user) {
            throw new Error('Unexpected login response format')
          }

          get().setAuth(access, refresh, user)
          toast.success('Login successful!')
          return response.data
        } catch (error) {
          const errorData = error.response?.data
          const errorMessage =
            errorData?.detail ||
            errorData?.non_field_errors?.[0] ||
            (typeof errorData === 'string' ? errorData : null) ||
            'Login failed'
          toast.error(errorMessage)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          const response = await authAPI.register(data)
          toast.success('Registration successful! Please check your email to verify your account.')
          return response.data
        } catch (error) {
          const errorData = error.response?.data
          const errorMessage =
            errorData?.email?.[0] ||
            errorData?.phone_number?.[0] ||
            errorData?.password?.[0] ||
            errorData?.password_confirm?.[0] ||
            errorData?.non_field_errors?.[0] ||
            (typeof errorData === 'string' ? errorData : null) ||
            'Registration failed'
          toast.error(errorMessage)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try {
          const refreshToken = localStorage.getItem('refresh_token')
          await authAPI.logout(refreshToken)
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          get().clearAuth()
          toast.success('Logged out successfully')
        }
      },

      fetchProfile: async () => {
        try {
          const response = await authAPI.getProfile()
          set({ user: response.data })
          return response.data
        } catch (error) {
          console.error('Failed to fetch profile:', error)
          throw error
        }
      },

      updateProfile: async (data) => {
        try {
          const response = await authAPI.updateProfile(data)
          set({ user: response.data })
          toast.success('Profile updated successfully')
          return response.data
        } catch (error) {
          toast.error('Failed to update profile')
          throw error
        }
      },

      checkAuth: () => {
        const token = localStorage.getItem('access_token')
        if (token) {
          try {
            const decoded = jwtDecode(token)
            const isExpired = decoded.exp * 1000 < Date.now()
            if (isExpired) {
              get().clearAuth()
              return false
            }
            return true
          } catch (error) {
            get().clearAuth()
            return false
          }
        }
        return false
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
