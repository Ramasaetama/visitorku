import axios from 'axios';

const api = axios.create({
  baseURL: '/api-stg', 
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            sessionStorage.removeItem('auth_token')
            sessionStorage.removeItem('auth_user')

            const currentPath = window.location.pathname
            if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default api;
