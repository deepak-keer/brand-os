import { create } from 'zustand'
import { authApi } from '../api'

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  isAuthReady: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data } = await authApi.login({ email, password })
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      set({ user: data.user, isAuthenticated: true, isLoading: false })
      return data
    } catch (err) { set({ isLoading: false }); throw err }
  },

  register: async (username, email, password) => {
    set({ isLoading: true })
    try {
      const name = String(username || '').trim()
      const { data } = await authApi.register({ name, username: name, email: String(email || '').trim(), password })
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      set({ user: data.user, isAuthenticated: true, isLoading: false })
      return data
    } catch (err) { set({ isLoading: false }); throw err }
  },

  fetchMe: async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      set({ user: null, isAuthenticated: false, isAuthReady: true })
      return null
    }

    try {
      const { data } = await authApi.getMe()
      set({ user: data.user, isAuthenticated: true, isAuthReady: true })
      return data.user
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      set({ user: null, isAuthenticated: false, isAuthReady: true })
      return null
    }
  },

  updateMe: async (updates) => {
    const { data } = await authApi.updateMe(updates)
    set({ user: data.user })
    return data.user
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    try { await authApi.logout({ refreshToken }) } catch (_) {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({ user: null, isAuthenticated: false })
  },
}))

export default useAuthStore
