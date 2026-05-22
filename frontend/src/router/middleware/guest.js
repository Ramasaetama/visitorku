import { isAuthenticated } from '../../services/authService'

/**
 * Middleware Guest
 * Mencegah user yang sudah login mengakses halaman guest (login, register).
 * Jika user sudah terautentikasi, redirect ke Dashboard.
 */
export default function guest({ next }) {
  if (isAuthenticated()) {
    return next({ name: 'Dashboard' })
  }

  return next()
}
