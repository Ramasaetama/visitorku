import { createRouter, createWebHistory } from 'vue-router'
import pipeline from './middleware/pipeline'
import auth from './middleware/auth'
import guest from './middleware/guest'

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
    meta: { middleware: [guest] },
  },
  // Dashboard
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { middleware: [auth] },
  },
  // Login
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { middleware: [guest] },
  },
  // Cabang Perusahaan
  {
    path: '/cabang',
    name: 'CabangPerusahaan',
    component: () => import('../views/CabangPerusahaan.vue'),
    meta: { middleware: [auth] },
  },
  // Tujuan Kunjungan
  {
    path: '/tujuan-kunjungan',
    name: 'TujuanKunjungan',
    component: () => import('../views/TujuanKunjungan.vue'),
    meta: { middleware: [auth] },
  },
  // Profil Perusahaan
  {
    path: '/profil-perusahaan',
    name: 'ProfilPerusahaan',
    component: () => import('../views/ProfilPerusahaan.vue'),
    meta: { middleware: [auth] },
  },
  // Edit Profile
  {
    path: '/edit-profile',
    name: 'EditProfile',
    component: () => import('../views/EditProfile.vue'),
    meta: { middleware: [auth] }, // Wajib login
  },
  // Pengaturan Form Visitor / Custom Field
  {
    path: '/pengaturan-form',
    name: 'PengaturanFormVisitor',
    component: () => import('../views/PengaturanFormVisitor.vue'),
    meta: { middleware: [auth] },
  },
  // Data Kunjungan / Visit
  {
    path: '/data-kunjungan',
    name: 'Visit',
    component: () => import('../views/Visit.vue'),
    meta: { middleware: [auth] },
  },
  // Event
  {
    path: '/event',
    name: 'Event',
    component: () => import('../views/Event.vue'),
    meta: { middleware: [auth] },
  },
  {
    path: '/event/:id/visitor',
    name: 'EventVisitor',
    component: () => import('../views/EventVisitor.vue'),
    meta: { middleware: [auth] },
  },
  {
    path: '/event/:id/feedback',
    name: 'EventFeedback',
    component: () => import('../views/EventFeedback.vue'),
    meta: { middleware: [auth] },
  },
  {
    path: '/event/:id/setting',
    name: 'EventSetting',
    component: () => import('../views/EventSetting.vue'),
    meta: { middleware: [auth] },
  },

  // Signage - Create (multi-step)
  {
    path: '/layar-informasi/create',
    name: 'SignageCreate',
    component: () => import('../views/SignageCreate.vue'),
    meta: { middleware: [auth] },
  },
  // Signage (Layar Informasi)
  {
    path: '/layar-informasi',
    name: 'Signage',
    component: () => import('../views/Signage.vue'),
    meta: { middleware: [auth] },
  },
  // Signage Display (Public)
  {
    path: '/signage/:slug',
    name: 'SignageDisplay',
    component: () => import('../views/SignageDisplay.vue'),
    meta: {},
  },
  // Data Visitor
  {
    path: '/data-visitor',
    name: 'DataVisitor',
    component: () => import('../views/Visitor.vue'),
    meta: { middleware: [auth] },
  },
  // Manajemen Pengguna
  {
    path: '/manajemen-pengguna',
    name: 'User',
    component: () => import('../views/User.vue'),
    meta: { middleware: [auth] },
  },

  // Invoice
  {
    path: '/invoice',
    name: 'Invoice',
    component: () => import('../views/Invoice.vue'),
    meta: { middleware: [auth] },
  },

  {
    path: '/visitor/:id',
    name: 'VisitorDetail',
    component: () => import('../views/VisitorDetail.vue'),
    meta: { middleware: [auth] },
  },

  // Invoice Detail
  {
    path: '/master/invoice/detail/:id',
    name: 'InvoiceDetail',
    component: () => import('../views/InvoiceDetail.vue'),
    meta: { middleware: [auth] },
  },

  // Laporan Visitor
  {
    path: '/report',
    name: 'Report',
    component: () => import('../views/Report.vue'),
    meta: { middleware: [auth] },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation guard — menjalankan middleware pipeline
router.beforeEach((to, from, next) => {
  // Jika route tidak mendefinisikan middleware, langsung lanjut
  if (!to.meta.middleware || to.meta.middleware.length === 0) {
    return next()
  }

  const context = { to, from, next }

  // Jalankan semua middleware secara berantai melalui pipeline
  return pipeline(context, to.meta.middleware, next)
})

export default router
