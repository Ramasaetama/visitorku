import { isAuthenticated } from '../../services/authService'

/**
 * Middleware Guest
 * Mencegah user yang sudah login mengakses halaman guest (login, register).
 * Jika user sudah terautentikasi, redirect ke Dashboard.
 *
 * Middleware ini hanya dipanggil jika route mendaftarkan:
 * meta: { middleware: [guest] }
 */
export default function guest({ next }) {
  if (isAuthenticated()) {
    return next({ name: 'Dashboard' })
  }

  return next()
}
