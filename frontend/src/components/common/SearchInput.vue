<script setup>
defineProps({
  placeholder: {
    type: String,
    default: 'Cari...'
  },
  modelValue: {
    type: String,
    default: ''
  },
  perPage: {
    type: [Number, String],
    default: 10
  }
});

defineEmits(['update:modelValue', 'update:perPage', 'search']);
</script>

<template>
  <div class="w-full flex flex-col sm:flex-row sm:items-center justify-start gap-4">
    
    <div class="relative w-full sm:max-w-md flex-1">
      <div class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      
      <input 
        type="text"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @keyup.enter="$emit('search')"
        :placeholder="placeholder"
        class="w-full h-9 pl-12 pr-4 bg-white border border-gray-200 rounded-sm text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D] transition-all duration-200"
      />
    </div>

    <div class="relative shrink-0">
      <select
        :value="perPage"
        @change="$emit('update:perPage', Number($event.target.value))"
        class="appearance-none w-[70px] h-9 pl-4 pr-9 bg-white border border-gray-200 rounded-sm text-sm text-gray-700 font-thin focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D] transition-all duration-200 cursor-pointer"
      >
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="25">25</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>

  </div>
</template>