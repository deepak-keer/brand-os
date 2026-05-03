import { create } from 'zustand'
import { ideasApi, notificationsApi } from '../api'

// ─── IDEA STORE ──────────────────────────────────────────────────────────────
export const useIdeaStore = create((set, get) => ({
  ideas: [],
  isLoading: false,

  fetchIdeas: async () => {
    set({ isLoading: true })
    try {
      const { data } = await ideasApi.getAll()
      set({ ideas: data.ideas, isLoading: false })
    } catch { set({ isLoading: false }) }
  },

  createIdea: async (ideaData) => {
    const { data } = await ideasApi.create(ideaData)
    set({ ideas: [...get().ideas, data.idea] })
    return data.idea
  },

  updateIdea: async (id, ideaData) => {
    const { data } = await ideasApi.update(id, ideaData)
    set({ ideas: get().ideas.map(i => i._id === id ? data.idea : i) })
    return data.idea
  },

  deleteIdea: async (id) => {
    await ideasApi.delete(id)
    set({ ideas: get().ideas.filter(i => i._id !== id) })
  },

  moveIdea: async (id, column, order) => {
    const prev = get().ideas
    set({ ideas: prev.map(i => i._id === id ? { ...i, column, order } : i) })
    try { await ideasApi.move(id, { column, order }) }
    catch { set({ ideas: prev }) }
  },
}))

// ─── NOTIFICATION STORE ───────────────────────────────────────────────────────
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      const { data } = await notificationsApi.getAll()
      set({ notifications: data.notifications, unreadCount: data.unreadCount })
    } catch (_) {}
  },

  markRead: async (id) => {
    await notificationsApi.markRead(id)
    set({
      notifications: get().notifications.map(n => n._id === id ? { ...n, read: true } : n),
      unreadCount: Math.max(0, get().unreadCount - 1),
    })
  },

  markAllRead: async () => {
    await notificationsApi.markAllRead()
    set({ notifications: get().notifications.map(n => ({ ...n, read: true })), unreadCount: 0 })
  },

  deleteNotification: async (id) => {
    const notif = get().notifications.find(n => n._id === id)
    await notificationsApi.delete(id)
    set({
      notifications: get().notifications.filter(n => n._id !== id),
      unreadCount: notif && !notif.read ? Math.max(0, get().unreadCount - 1) : get().unreadCount,
    })
  },
}))
