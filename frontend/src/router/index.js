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
  // Login
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { guest: true },
  },

  // ── Admin Routes ──
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/admin/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/cabang',
    name: 'CabangPerusahaan',
    component: () => import('../views/admin/CabangPerusahaan.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tujuan-kunjungan',
    name: 'TujuanKunjungan',
    component: () => import('../views/admin/TujuanKunjungan.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profil-perusahaan',
    name: 'ProfilPerusahaan',
    component: () => import('../views/admin/ProfilPerusahaan.vue'),
    meta: { requiresAuth: true },
  },
  // Edit Profile
  {
    path: '/edit-profile',
    name: 'EditProfile',
    component: () => import('../views/EditProfile.vue'),
    meta: { requiresAuth: true },
  },
  // Pengaturan Form Visitor / Custom Field
  {
    path: '/pengaturan-form',
    name: 'PengaturanFormVisitor',
    component: () => import('../views/admin/PengaturanFormVisitor.vue'),
    meta: { requiresAuth: true },
  },

  // ── SuperAdmin Routes ── (akan ditambahkan besok)
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
