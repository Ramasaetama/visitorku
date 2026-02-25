import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '../services/authService'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  // Onboarding
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/onboarding/Register.vue'),
  },
  // Dashboard (placeholder)
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
  },
  // Login
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  // Cabang Perusahaan
  {
    path: '/cabang',
    name: 'CabangPerusahaan',
    component: () => import('../views/CabangPerusahaan.vue'),
  },
  // Tujuan Kunjungan
  {
    path: '/tujuan-kunjungan',
    name: 'TujuanKunjungan',
    component: () => import('../views/TujuanKunjungan.vue'),
  },
  // Profil Perusahaan
  {
    path: '/profil-perusahaan',
    name: 'ProfilPerusahaan',
    component: () => import('../views/ProfilPerusahaan.vue'),
  },
  // Pengaturan Form Visitor / Custom Field
  {
    path: '/pengaturan-form',
    name: 'PengaturanFormVisitor',
    component: () => import('../views/PengaturanFormVisitor.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authenticated = isAuthenticated()

  if (to.meta.requiresAuth && !authenticated) {
    next({ name: 'Login' })
    return
  }

  if (to.meta.guest && authenticated) {
    next({ name: 'Dashboard' })
    return
  }

  next()
})

export default router