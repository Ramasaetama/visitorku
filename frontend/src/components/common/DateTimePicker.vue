<script setup>
import CalendarIcon from '@/assets/calendar-line.svg';

const props = defineProps({
  modelValue: { type: String, default: '' },
  label:      { type: String, default: '' },
  required:   { type: Boolean, default: false },
  type:       { type: String, default: 'datetime-local' }, // 'date' | 'datetime-local'
  placeholder:{ type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

const onInput = (e) => emit('update:modelValue', e.target.value);
</script>

<template>
  <div class="relative w-full">
    <!-- Label -->
    <label v-if="label" class="block text-sm font-semibold text-gray-700 mb-1">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Input wrapper -->
    <div class="relative">
      <input
        :type="type"
        :value="modelValue"
        @input="onInput"
        class="w-full border-b border-gray-300 py-2 pr-8 text-sm text-gray-700
               placeholder-gray-400 focus:outline-none focus:border-[#F7941D]
               transition-colors bg-transparent date-no-icon"
      />
      <!-- Custom calendar icon — non-interactive overlay -->
      <img
        :src="CalendarIcon"
        alt="calendar"
        class="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50"
      />
    </div>
  </div>
</template>

<style scoped>
/* Hide the native calendar picker indicator across browsers */
.date-no-icon::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 0;
  width: 1.5rem;
  height: 100%;
  cursor: pointer;
}
.date-no-icon::-webkit-inner-spin-button {
  display: none;
}
</style>
