import axios from 'axios'

const API_BASE_URL = 'https://brand-os-lkr0.onrender.com/api'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token))
  failedQueue = []
}

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then(token => { original.headers.Authorization = `Bearer ${token}`; return axiosClient(original) })
          .catch(err => Promise.reject(err))
      }
      original._retry = true
      isRefreshing = true
      const refreshToken = localStorage.getItem('refreshToken')
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        processQueue(null, data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return axiosClient(original)
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(err)
      } finally { isRefreshing = false }
    }
    return Promise.reject(error)
  }
)

export default axiosClient
