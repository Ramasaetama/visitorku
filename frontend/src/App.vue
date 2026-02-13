<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Button } from './components/common'
import { Navbar, Footer } from './components/layout'
import Topbar from './components/Topbar.vue'

const route = useRoute()

// Hide the default navbar/footer on all pages since this is an admin application
const hideLayout = computed(() => {
  return true
})
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col font-poppins">
    <Topbar v-if="!hideLayout" />
    <Navbar v-if="!hideLayout">
      <template #menu>
        <router-link to="/" class="text-gray-600 hover:text-primary-500 transition-colors font-medium">Home</router-link>
        <router-link to="/about" class="text-gray-600 hover:text-primary-500 transition-colors font-medium">About</router-link>
        <router-link to="/contact" class="text-gray-600 hover:text-primary-500 transition-colors font-medium">Contact</router-link>
      </template>
      <template #actions>
        <Button variant="outline" size="sm">Login</Button>
        <Button size="sm">Sign Up</Button>
      </template>
    </Navbar>

    <main :class="hideLayout ? 'flex-1' : 'flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full'">
      <router-view />
    </main>

    <Footer v-if="!hideLayout" />
  </div>
</template>

<style scoped>
/* Add custom styles here if needed */
</style>
