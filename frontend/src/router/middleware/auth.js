import { isAuthenticated } from '../../services/authService'

/**
 * Middleware Auth
 * Memproteksi route yang memerlukan login.
 * Jika user belum terautentikasi, redirect ke halaman Login.
 *
 * Middleware ini hanya dipanggil jika route mendaftarkan:
 * meta: { middleware: [auth] }
 */
export default function auth({ next }) {
  if (!isAuthenticated()) {
    return next({ name: 'Login' })
  }

  return next()
}
