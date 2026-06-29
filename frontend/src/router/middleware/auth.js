import { isAuthenticated } from '../../services/authService'

export default function auth({ next }) {
  if (!isAuthenticated()) {
    return next({ name: 'Login' })
  }

  return next()
}
