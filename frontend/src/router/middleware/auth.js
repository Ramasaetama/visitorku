import { isAuthenticated } from '../../services/authService'

/**
 * Middleware Auth
 * Memproteksi route yang memerlukan login.
 * Jika user belum terautentikasi, redirect ke halaman Login.
 */
export default function auth({ next }) {
  if (!isAuthenticated()) {
    return next({ name: 'Login' })
  }

  return next()
}
