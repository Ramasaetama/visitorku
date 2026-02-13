<script setup>
/**
 * Side-over Modal Component
 * Komponen modal yang muncul dari sisi kanan layar
 * 
 * Props:
 * - show: Boolean untuk menampilkan/menyembunyikan modal
 * - title: Judul modal
 * - description: Deskripsi opsional di bawah judul
 * - width: Lebar modal ('md', 'lg', 'xl', 'half') default: 'lg'
 * 
 * Events:
 * - close: Dipanggil ketika modal ditutup (klik X atau overlay)
 * 
 * Slots:
 * - default: Konten utama modal (scrollable)
 * - footer: Tombol-tombol di bagian bawah (sticky)
 */

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: 'lg',
    validator: (value) => ['md', 'lg', 'xl', 'half'].includes(value)
  }
});

defineEmits(['close']);

// Lebar modal berdasarkan prop width
const widthClasses = {
  md: 'w-full max-w-md',
  lg: 'w-full max-w-lg',
  xl: 'w-full max-w-xl',
  half: 'w-full max-w-[50vw]'
};
</script>

<template>
  <!-- Side-over Container -->
  <Teleport to="body">
    <Transition name="sideover">
      <div 
        v-if="show" 
        class="fixed inset-0 z-50 flex justify-end"
      >
        <!-- Backdrop/Overlay gelap - Klik untuk tutup -->
        <Transition name="backdrop">
          <div 
            v-if="show"
            class="absolute inset-0 bg-black/40 transition-opacity" 
            @click="$emit('close')"
          ></div>
        </Transition>
        
        <!-- Side-over Panel -->
        <Transition name="slide">
          <div 
            v-if="show"
            :class="[
              'relative h-full bg-white shadow-2xl flex flex-col',
              'rounded-l-2xl', /* Rounded hanya di sisi kiri */
              widthClasses[width]
            ]"
            @click.stop
          >
            <!-- Header - Sticky di atas -->
            <div class="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-100 rounded-tl-2xl">
              <div class="flex items-start justify-between">
                <div class="pr-8">
                  <h2 class="text-xl font-semibold text-gray-900">{{ title }}</h2>
                  <p v-if="description" class="mt-1 text-sm text-gray-500">{{ description }}</p>
                </div>
                
                <!-- Close Button (X) -->
                <button 
                  @click="$emit('close')"
                  class="absolute top-6 right-6 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Body Content - Scrollable -->
            <div class="flex-1 overflow-y-auto px-6 py-6">
              <slot></slot>
            </div>
            
            <!-- Footer - Sticky di bawah -->
            <div v-if="$slots.footer" class="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 rounded-bl-2xl">
              <slot name="footer"></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Animasi backdrop */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Animasi sideover container */
.sideover-enter-active,
.sideover-leave-active {
  transition: opacity 0.3s ease;
}

.sideover-enter-from,
.sideover-leave-to {
  opacity: 0;
}

/* Animasi slide panel dari kanan */
.slide-enter-active {
  transition: transform 0.3s ease-out;
}

.slide-leave-active {
  transition: transform 0.25s ease-in;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}
</style>
