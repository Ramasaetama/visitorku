import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 15000,
})

// Request interceptor — attach auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor — handle 401 (unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid — clear and redirect to login
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')

            // Only redirect if not already on login/register page
            const currentPath = window.location.pathname
            if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default api
