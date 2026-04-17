import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '../services/authService'
import SignageDisplay from '../views/SignageDisplay.vue'

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
  // Edit Profile
  {
    path: '/edit-profile',
    name: 'EditProfile',
    component: () => import('../views/EditProfile.vue'),
    meta: { requiresAuth: true }, // Wajib login
  },
  // Pengaturan Form Visitor / Custom Field
  {
    path: '/pengaturan-form',
    name: 'PengaturanFormVisitor',
    component: () => import('../views/PengaturanFormVisitor.vue'),
    meta: { requiresAuth: true },
  },
  // Data Kunjungan / Visit
  {
    path: '/data-kunjungan',
    name: 'Visit',
    component: () => import('../views/Visit.vue'),
    meta: { requiresAuth: true },
  },
  // Signage - Create (multi-step)
  {
    path: '/layar-informasi/create',
    name: 'SignageCreate',
    component: () => import('../views/SignageCreate.vue'),
    meta: { requiresAuth: true },
  },
  // Signage (Layar Informasi)
  {
    path: '/layar-informasi',
    name: 'Signage',
    component: () => import('../views/Signage.vue'),
    meta: { requiresAuth: true },
  },
  // Signage Display (Public)
  {
    path: '/signage/:slug',
    name: 'SignageDisplay',
    component: () => import('../views/SignageDisplay.vue'),
  },
  // Data Visitor
  {
    path: '/data-visitor',
    name: 'DataVisitor',
    component: () => import('../views/Visitor.vue'), // TODO: buat halaman DataVisitor
    meta: { requiresAuth: true },
  },
  // Manajemen Pengguna
  {
    path: '/manajemen-pengguna',
    name: 'User',
    component: () => import('../views/User.vue'), // TODO: buat halaman DataVisitor
    meta: { requiresAuth: true },
  },

  // Invoice
  {
    path: '/invoice',
    name: 'Invoice',
    component: () => import('../views/Invoice.vue'), // TODO: buat halaman Invoice
    meta: { requiresAuth: true },
  },

  {
    path: '/visitor/:id',
    name: 'VisitorDetail',
    component: () => import('../views/VisitorDetail.vue'),
    meta: { requiresAuth: true },
  },

  // Invoice Detail
  {
    path: '/master/invoice/detail/:id',
    name: 'InvoiceDetail',
    component: () => import('../views/InvoiceDetail.vue'),
    meta: { requiresAuth: true },
  },


  // Laporan Visitor
  {
    path: '/report',
    name: 'Report',
    component: () => import('../views/Report.vue'),
    meta: { requiresAuth: true },
  },

  {
    // 2. Definisikan path dengan parameter dinamis ':slug'
    path: '/signage/:slug',
    name: 'SignageDisplay',
    component: SignageDisplay,
    // Jika halaman ini ingin bisa diakses siapa saja tanpa login (public)
    meta: { requiresAuth: false }
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
