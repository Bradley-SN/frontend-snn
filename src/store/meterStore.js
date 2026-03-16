import { create } from 'zustand'
import { meterAPI } from '../api'
import toast from 'react-hot-toast'

export const useMeterStore = create((set, get) => ({
  meters: [],
  currentMeter: null,
  isLoading: false,
  stats: null,
  events: [],
  alerts: [],

  fetchMeters: async (params) => {
    set({ isLoading: true })
    try {
      const response = await meterAPI.list(params)
      set({ meters: response.data.results || response.data })
      return response.data
    } catch (error) {
      toast.error('Failed to fetch meters')
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  fetchMeter: async (id) => {
    set({ isLoading: true })
    try {
      const response = await meterAPI.get(id)
      set({ currentMeter: response.data })
      return response.data
    } catch (error) {
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  fetchStats: async (id) => {
    try {
      const response = await meterAPI.getStats(id)
      set({ stats: response.data })
      return response.data
    } catch (error) {
      throw error
    }
  },

  fetchEvents: async (id, params) => {
    try {
      const response = await meterAPI.getEvents(id, params)
      set({ events: response.data.results || response.data })
      return response.data
    } catch (error) {
      throw error
    }
  },

  controlLoad: async (id, action) => {
    try {
      const response = await meterAPI.controlLoad(id, action)
      toast.success(`Load ${action === 'connect' ? 'connected' : 'disconnected'} successfully`)
      // Refresh current meter
      await get().fetchMeter(id)
      return response.data
    } catch (error) {
      toast.error('Failed to control load')
      throw error
    }
  },

  fetchAlerts: async (params) => {
    try {
      const response = await meterAPI.getAlerts(params)
      set({ alerts: response.data.results || response.data })
      return response.data
    } catch (error) {
      toast.error('Failed to fetch alerts')
      throw error
    }
  },

  acknowledgeAlert: async (id) => {
    try {
      await meterAPI.acknowledgeAlert(id)
      toast.success('Alert acknowledged')
      await get().fetchAlerts()
    } catch (error) {
      toast.error('Failed to acknowledge alert')
      throw error
    }
  },

  resolveAlert: async (id) => {
    try {
      await meterAPI.resolveAlert(id)
      toast.success('Alert resolved')
      await get().fetchAlerts()
    } catch (error) {
      toast.error('Failed to resolve alert')
      throw error
    }
  },
}))
