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
    meta: { guest: true },
  },
  // Dashboard (placeholder)
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  // Login
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { guest: true },
  },
  // Cabang Perusahaan
  {
    path: '/cabang',
    name: 'CabangPerusahaan',
    component: () => import('../views/CabangPerusahaan.vue'),
    meta: { requiresAuth: true },
  },
  // Tujuan Kunjungan
  {
    path: '/tujuan-kunjungan',
    name: 'TujuanKunjungan',
    component: () => import('../views/TujuanKunjungan.vue'),
    meta: { requiresAuth: true },
  },
  // Profil Perusahaan
  {
    path: '/profil-perusahaan',
    name: 'ProfilPerusahaan',
    component: () => import('../views/ProfilPerusahaan.vue'),
    meta: { requiresAuth: true },
  },
  // Pengaturan Form Visitor / Custom Field
  {
    path: '/pengaturan-form',
    name: 'PengaturanFormVisitor',
    component: () => import('../views/PengaturanFormVisitor.vue'),
    meta: { requiresAuth: true },
  },
]


const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authenticated = isAuthenticated()

  // If route requires auth and user is NOT authenticated → redirect to login
  if (to.meta.requiresAuth && !authenticated) {
    next({ name: 'Login' })
    return
  }

  // If route is guest-only (login/register) and user IS authenticated → redirect to dashboard
  if (to.meta.guest && authenticated) {
    next({ name: 'Dashboard' })
    return
  }

  next()
})

export default router

