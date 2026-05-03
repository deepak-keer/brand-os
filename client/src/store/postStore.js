import { create } from 'zustand'
import { postsApi } from '../api'

const toFormData = (data) => {
  const fd = new FormData()
  Object.entries(data).forEach(([k, v]) => {
    if (k === 'tags') (Array.isArray(v) ? v : (v||'').split(',').map(t=>t.trim()).filter(Boolean)).forEach(t => fd.append('tags', t))
    else if (k === 'metrics' && typeof v === 'object') Object.entries(v).forEach(([mk,mv]) => fd.append(`metrics[${mk}]`, mv))
    else if (k === 'thumbnail' && v instanceof File) fd.append('thumbnail', v)
    else if (v !== undefined && v !== null) fd.append(k, v)
  })
  return fd
}

const usePostStore = create((set, get) => ({
  posts: [],
  isLoading: false,
  total: 0,

  fetchPosts: async (params) => {
    set({ isLoading: true })
    try {
      const { data } = await postsApi.getAll(params)
      set({ posts: data.posts, total: data.total, isLoading: false })
    } catch { set({ isLoading: false }) }
  },

  createPost: async (postData) => {
    const { data } = await postsApi.create(toFormData(postData))
    set({ posts: [data.post, ...get().posts], total: get().total + 1 })
    return data.post
  },

  updatePost: async (id, postData) => {
    const { data } = await postsApi.update(id, toFormData(postData))
    set({ posts: get().posts.map(p => p._id === id ? data.post : p) })
    return data.post
  },

  deletePost: async (id) => {
    await postsApi.delete(id)
    set({ posts: get().posts.filter(p => p._id !== id), total: get().total - 1 })
  },

  updateStatus: async (id, status) => {
    const prev = get().posts
    set({ posts: prev.map(p => p._id === id ? { ...p, status } : p) })
    try {
      const { data } = await postsApi.updateStatus(id, status)
      set({ posts: get().posts.map(p => p._id === id ? data.post : p) })
    } catch { set({ posts: prev }) }
  },
}))

export default usePostStore
