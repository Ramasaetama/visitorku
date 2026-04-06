<script setup>
/**
 * SearchInput Component
 * Komponen reusable untuk search/pencarian
 * 
 * Props:
 * - placeholder: teks placeholder
 * - modelValue: nilai input (v-model)
 */

defineProps({
  placeholder: {
    type: String,
    default: 'Cari...'
  },
  modelValue: {
    type: String,
    default: ''
  },
  inputClass: {
    type: String,
    default: 'rounded-lg'
  }
});

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="relative">
    <!-- Search Icon -->
    <div class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
    </div>
    
    <!-- Input Field -->
    <input 
      type="text"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :class="[
        'w-full h-9 pl-12 pr-4 bg-white border border-gray-200',
        'text-sm text-gray-700 placeholder-gray-400',
        'focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]',
        'transition-all duration-200',
        inputClass
      ]"
    />
  </div>
</template>
