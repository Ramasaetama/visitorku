<template>
  <!-- Modal Overlay -->
  <Transition name="modal">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      @click.self="closeModal"
    >
      <!-- Modal Card -->
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <!-- Close Button -->
        <button
          @click="closeModal"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Modal Header -->
        <h3 class="text-[18px] font-semibold text-gray-900 mb-1">{{ title }}</h3>
        <!-- Custom Description -->
        <p v-if="description" class="text-[13px] text-gray-500 mb-6" v-html="description"></p>
        
        <!-- Default Description -->
        <p v-else class="text-[13px] text-gray-500 mb-6">
          Format yang diterima: <span class="font-medium text-[#EE9D0F]">JPG</span> • 
          <span class="font-medium text-[#EE9D0F]">JPEG</span> • 
          <span class="font-medium text-[#EE9D0F]">PNG</span> (Maks 2MB)
        </p>

        <!-- Drag & Drop Area -->
        <div
          @click="triggerFileInput"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          :class="[
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
            isDragging ? 'border-[#EE9D0F] bg-[#FEF9F0]' : 'border-gray-300 hover:border-[#EE9D0F] hover:bg-gray-50'
          ]"
        >
          <!-- Preview Image -->
          <div v-if="previewUrl" class="mb-4">
            <img :src="previewUrl" alt="Preview" class="max-h-[200px] mx-auto rounded-lg shadow-md object-contain" />
          </div>

          <!-- Empty State Icon -->
          <div v-else class="mb-4">
            <svg class="w-12 h-12 mx-auto text-[#EE9D0F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>

          <!-- Text -->
          <p class="text-[14px] text-gray-700 font-medium mb-1">
            {{ previewUrl ? 'Klik untuk mengganti gambar' : 'Seret gambar kesini atau' }}
          </p>
          <p class="text-[13px] text-[#EE9D0F] font-semibold">Telusuri file</p>

          <!-- Hidden File Input -->
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            @change="handleFileSelect"
            class="hidden"
          />
        </div>

        <!-- Error Message -->
        <p v-if="errorMessage" class="text-[12px] text-red-500 mt-3 text-center">
          {{ errorMessage }}
        </p>

        <!-- Action Buttons -->
        <div class="flex gap-3 mt-6">
          <button
            @click="closeModal"
            class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl text-[14px] font-semibold hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            @click="confirmUpload"
            :disabled="!selectedFile"
            :class="[
              'flex-1 px-4 py-3 rounded-xl text-[14px] font-semibold text-white transition',
              selectedFile
                ? 'bg-[#EE9D0F] hover:bg-[#D88C0E] shadow-md hover:shadow-lg'
                : 'bg-gray-300 cursor-not-allowed'
            ]"
          >
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Ubah Gambar'
  },
  description: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'confirm']);

// State
const fileInput = ref(null);
const selectedFile = ref(null);
const previewUrl = ref(null);
const errorMessage = ref('');
const isDragging = ref(false);

// File validation
const validateFile = (file) => {
  errorMessage.value = '';

  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!validTypes.includes(file.type)) {
    errorMessage.value = 'Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.';
    return false;
  }

  // Check file size (2MB = 2 * 1024 * 1024 bytes)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    errorMessage.value = 'Ukuran file terlalu besar. Maksimal 2MB.';
    return false;
  }

  return true;
};

// Handle file selection from input
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file && validateFile(file)) {
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

// Handle drag and drop
const handleDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file && validateFile(file)) {
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

// Trigger hidden file input
const triggerFileInput = () => {
  fileInput.value.click();
};

// Close modal
const closeModal = () => {
  emit('close');
  resetState();
};

// Confirm upload
const confirmUpload = () => {
  if (selectedFile.value) {
    emit('confirm', {
      file: selectedFile.value,
      previewUrl: previewUrl.value
    });
    closeModal();
  }
};

// Reset state when modal closes
const resetState = () => {
  selectedFile.value = null;
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
  errorMessage.value = '';
  isDragging.value = false;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// Watch for modal close to cleanup
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    resetState();
  }
});
</script>

<style scoped>
/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
}
</style>
