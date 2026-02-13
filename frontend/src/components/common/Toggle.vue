<template>
  <label class="inline-flex items-center cursor-pointer gap-3">
    <div class="relative">
      <input
        type="checkbox"
        :checked="modelValue"
        class="sr-only peer"
        @change="$emit('update:modelValue', $event.target.checked)"
      />
      <div
        :class="[
          'w-11 h-6 rounded-full transition-colors duration-200',
          modelValue ? 'bg-[#2563EB]' : 'bg-gray-300'
        ]"
      ></div>
      <div
        :class="[
          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
          modelValue ? 'translate-x-5' : 'translate-x-0'
        ]"
      ></div>
    </div>
    <span v-if="label" class="text-body-4 text-gray-700 font-poppins">{{ label }}</span>
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
