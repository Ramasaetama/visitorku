<template>
  <footer class="bg-white border-t border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col md:flex-row items-center justify-between">
        <slot>
          <p class="text-gray-500 text-sm">
            © {{ currentYear }} Visitorku. All rights reserved.
          </p>
        </slot>
      </div>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>
