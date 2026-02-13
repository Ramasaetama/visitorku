<script setup>
/**
 * EmptyState Component
 * Komponen reusable untuk menampilkan state kosong (empty state)
 * 
 * Props:
 * - icon: path ke gambar ilustrasi (opsional)
 * - title: judul pesan empty state
 * - description: deskripsi tambahan
 * - buttonText: teks tombol action
 * - showButton: tampilkan tombol atau tidak (default: true)
 */

defineProps({
  icon: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  buttonText: {
    type: String,
    default: 'Tambah Data'
  },
  showButton: {
    type: Boolean,
    default: true
  }
});

// Emit event ketika button diklik
defineEmits(['action']);
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4">
    <!-- Ilustrasi/Icon -->
    <div v-if="icon" class="mb-6">
      <img :src="icon" alt="Empty state" class="w-32 h-32 object-contain opacity-80" />
    </div>
    
    <!-- Default placeholder jika tidak ada icon -->
    <div v-else class="mb-6 w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
      <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke-width="1.5"/>
        <path d="M12 8v4M12 16h.01" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </div>
    
    <!-- Title -->
    <h3 class="text-lg font-semibold text-gray-800 mb-2 text-center">
      {{ title }}
    </h3>
    
    <!-- Description -->
    <p v-if="description" class="text-sm text-gray-500 text-center max-w-sm mb-6">
      {{ description }}
    </p>
    
    <!-- Action Button -->
    <button 
      v-if="showButton"
      @click="$emit('action')"
      class="flex items-center gap-2 px-6 py-2.5 border-2 border-[#F7941D] text-[#F7941D] 
             rounded-lg font-medium text-sm hover:bg-[#F7941D] hover:text-white 
             transition-all duration-200"
    >
      <span class="text-lg leading-none">+</span>
      {{ buttonText }}
    </button>
  </div>
</template>
