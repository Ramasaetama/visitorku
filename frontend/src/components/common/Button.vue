<template>
  <button 
    :class="buttonClasses"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // primary, secondary, outline, ghost
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click'])

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-poppins font-semibold rounded-4xl transition-colors duration-200 cursor-pointer'
  
  const sizes = {
    sm: 'px-4 py-2 text-body-4',
    md: 'px-6 py-3 text-body-3',
    lg: 'px-8 py-4 text-body-2',
  }
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
    ghost: 'text-primary-500 hover:bg-primary-50',
  }
  
  const disabledClass = props.disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  return `${base} ${sizes[props.size]} ${variants[props.variant]} ${disabledClass}`
})
</script>
