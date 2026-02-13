<template>
  <div :class="[
    'bg-white rounded-4xl shadow-md overflow-hidden font-poppins',
    hoverable ? 'transition-shadow duration-300 hover:shadow-lg cursor-pointer' : ''
  ]">
    <div v-if="$slots.header" class="px-6 py-4 border-b border-divider">
      <slot name="header" />
    </div>
    <div class="px-6 py-4">
      <slot />
    </div>
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-divider bg-gray-50">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  hoverable: {
    type: Boolean,
    default: false,
  },
})
</script>
