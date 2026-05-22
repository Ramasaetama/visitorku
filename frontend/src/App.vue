<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAutoLogout } from '@/router/composables/useAutoLogout'

// 🌟 Import Layout Utama di sini
import Topbar from '@/components/Topbar.vue'
import Sidebar from '@/components/Sidebar.vue'

const route = useRoute()

// 🌟 Logic cerdas: Sembunyikan Topbar & Sidebar HANYA saat di halaman Login
const hideLayout = computed(() => {
  return route.path === '/login' || route.name === 'Login' || route.meta.hideLayout
})

const { initAutoLogout, destroyAutoLogout } = useAutoLogout(15)

onMounted(() => {
  if (localStorage.getItem('token')) {
    initAutoLogout()
  }
})

onUnmounted(() => {
  destroyAutoLogout()
})
</script>

<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    
    <Topbar v-if="!hideLayout" />

    <div class="flex flex-1 items-stretch min-w-0">
      
      <Sidebar v-if="!hideLayout" />

      <main class="flex-1 bg-[#F4F6F8] min-w-0" :class="!hideLayout ? 'p-4' : ''">
        <router-view />
      </main>

    </div>
  </div>
</template>