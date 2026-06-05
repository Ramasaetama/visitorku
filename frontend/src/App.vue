<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue' 
import { useRoute } from 'vue-router'
import { useAutoLogout } from '@/router/composables/useAutoLogout'

import Topbar from '@/components/Topbar.vue'
import Sidebar from '@/components/Sidebar.vue'

const route = useRoute()

const hideLayout = computed(() => {
  return route.path === '/login' || route.name === 'Login' || route.meta.hideLayout
})

const { initAutoLogout, destroyAutoLogout } = useAutoLogout(15)

const mainScrollContainer = ref(null)

onMounted(() => {
  if (localStorage.getItem('token')) {
    initAutoLogout()
  }
})

onUnmounted(() => {
  destroyAutoLogout()
})

watch(
  () => route.path,
  () => {
    if (mainScrollContainer.value) {
      mainScrollContainer.value.scrollTop = 0
    }
  }
)
</script>

<template>
  <div class="h-screen bg-[#F4F6F8] flex flex-col font-['Poppins'] overflow-hidden">
    <Topbar v-if="!hideLayout" class="mb-0 shrink-0" />

    <div class="flex flex-1 min-w-0 overflow-hidden"> 
      
      <Sidebar v-if="!hideLayout" />

      <main class="flex-1 min-w-0 overflow-y-auto hide-scrollbar overscroll-contain pr-4 pb-4"> 
        <div class="min-h-full flex flex-col">
          <router-view class="flex-1" />
        </div>
      </main>

    </div>
  </div>
</template>

