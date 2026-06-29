import { isAuthenticated } from '../../services/authService'

export default function guest({ next }) {
  if (isAuthenticated()) {
    return next({ name: 'Dashboard' })
  }

  return next()
}
