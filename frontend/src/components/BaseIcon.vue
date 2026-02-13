<script setup>
import * as Icons from '@remixicon/vue';
import { computed } from 'vue';

const props = defineProps({
  name: { type: String, required: true }, // Nama ikon, misal: 'RiHomeLine'
  size: { type: String, default: '20' },  // Ukuran dalam pixel
  className: { type: String, default: '' } // Untuk custom class Tailwind
});

// Mengambil komponen ikon secara dinamis berdasarkan prop 'name'
const iconComponent = computed(() => Icons[props.name]);
</script>

<template>
  <component 
    :is="iconComponent" 
    :size="props.size" 
    :class="props.className"
  />
</template>