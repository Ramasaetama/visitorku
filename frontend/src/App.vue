<script setup>
import { computed, ref, watch } from 'vue' 
import { useRoute } from 'vue-router'

import Topbar from '@/components/Topbar.vue'
import Sidebar from '@/components/Sidebar.vue'

const route = useRoute()

const hideLayout = computed(() => {
  return route.path === '/login' || route.name === 'Login' || route.path === '/register' || route.name === 'Register' || route.meta.hideLayout
})

const mainScrollContainer = ref(null)

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
  <div class="h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    <Topbar v-if="!hideLayout" class="mb-0 shrink-0" />

    <div class="flex flex-1 min-w-0 min-h-0">
      
      <Sidebar v-if="!hideLayout" />

      <main
        ref="mainScrollContainer"
        class="flex-1 min-w-0 overflow-y-auto hide-scrollbar overscroll-contain pr-4 pb-4"
        style="will-change: scroll-position;"
      >
        <div class="min-h-full flex flex-col">
          <router-view class="flex-1" />
        </div>
      </main>

    </div>
  </div>
</template>