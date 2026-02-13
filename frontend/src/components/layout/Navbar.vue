<template>
  <nav class="bg-white shadow-sm sticky top-0 z-50 font-poppins">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex-shrink-0">
        <slot name="logo">
          <span class="text-title-2 font-bold text-primary-500">Visitorku</span>
        </slot>
      </div>

      <!-- Navigation Links -->
      <div class="hidden md:flex items-center space-x-8">
        <slot name="menu" />
      </div>

      <!-- Right Actions -->
      <div class="hidden md:flex items-center space-x-4">
        <slot name="actions" />
      </div>

      <!-- Mobile Menu Button -->
      <button class="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100" @click="isOpen = !isOpen">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path v-if="!isOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div v-show="isOpen" class="md:hidden px-4 py-3 border-t border-divider">
      <slot name="mobile-menu" />
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)
</script>
