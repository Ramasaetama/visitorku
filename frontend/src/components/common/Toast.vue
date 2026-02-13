<script setup>
/**
 * Toast Component
 * Komponen reusable untuk menampilkan notifikasi sukses
 * 
 * Props:
 * - show: Boolean - mengontrol visibility toast
 * - message: String - pesan yang ditampilkan
 * - duration: Number - durasi sebelum auto-dismiss (default 4000ms)
 * 
 * Events:
 * - close: Dipanggil ketika toast di-close (manual atau auto)
 */
import { watch } from 'vue';
import checkIcon from '@/assets/check-circle-svgrepo-com.svg';
import closeIcon from '@/assets/close-line.svg';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 4000
  }
});

const emit = defineEmits(['close']);

// Auto-dismiss timer
let timer = null;

watch(() => props.show, (newVal) => {
  if (newVal) {
    // Clear existing timer if any
    if (timer) {
      clearTimeout(timer);
    }
    
    // Set new timer untuk auto-dismiss
    timer = setTimeout(() => {
      emit('close');
    }, props.duration);
  } else {
    // Clear timer jika toast di-close manual
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }
});

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Transition name="slide-up">
    <div 
      v-if="show" 
      class="toast-container"
    >
      <!-- Success Icon -->
      <img 
        :src="checkIcon" 
        alt="Success" 
        class="toast-icon"
      />
      
      <!-- Message Text -->
      <span class="toast-message">{{ message }}</span>
      
      <!-- Close Button -->
      <button 
        @click="handleClose"
        class="toast-close-btn"
        type="button"
      >
        <img 
          :src="closeIcon" 
          alt="Close" 
          class="w-5 h-5"
        />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 9999;
  
  display: flex;
  align-items: center;
  gap: 12px;
  
  background: white;
  padding: 14px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  max-width: 400px;
  min-width: 300px;
}

.toast-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
}

.toast-close-btn {
  flex-shrink: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.toast-close-btn:hover {
  opacity: 0.7;
}

/* Slide-up animation */
.slide-up-enter-active {
  transition: all 0.3s ease-out;
}

.slide-up-leave-active {
  transition: all 0.3s ease-in;
}

.slide-up-enter-from {
  transform: translateY(100px);
  opacity: 0;
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
