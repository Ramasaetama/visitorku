<template>
  <label class="inline-flex items-start cursor-pointer gap-3">
    <div class="relative flex-shrink-0 mt-0.5">
      <input
        type="checkbox"
        :checked="modelValue"
        class="sr-only peer"
        @change="$emit('update:modelValue', $event.target.checked)"
      />
      <div
        :class="[
          'w-5 h-5 rounded border-2 transition-colors duration-200 flex items-center justify-center',
          modelValue 
            ? 'bg-[#4070FF] border-[#4070FF]' 
            : 'bg-white border-gray-300'
        ]"
      >
        <svg
          v-if="modelValue"
          class="w-3 h-3 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    </div>
    <span v-if="label" class="text-body-4 text-gray-700 font-poppins">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])
</script>
