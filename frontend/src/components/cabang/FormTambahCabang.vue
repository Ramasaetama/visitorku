<script setup>
/**
 * FormTambahCabang Component
 * Form untuk menambahkan cabang baru
 * 
 * Events:
 * - submit: Dipanggil ketika form di-submit dengan data cabang
 * - cancel: Dipanggil ketika user membatalkan
 */
import { ref, reactive } from 'vue';

const emit = defineEmits(['submit', 'cancel']);

// Form data menggunakan reactive
const formData = reactive({
  namaCabang: '',
  alamatCabang: '',
  kontakCabang: ''
});

// Loading state untuk submit button
const isSubmitting = ref(false);

// Reset form
const resetForm = () => {
  formData.namaCabang = '';
  formData.alamatCabang = '';
  formData.kontakCabang = '';
};

// Handle submit
const handleSubmit = async () => {
  isSubmitting.value = true;
  
  try {
    // Emit data ke parent component
    emit('submit', { ...formData });
    
    // Reset form setelah submit
    resetForm();
  } finally {
    isSubmitting.value = false;
  }
};

// Handle cancel
const handleCancel = () => {
  resetForm();
  emit('cancel');
};

// Expose resetForm untuk dipanggil dari parent jika diperlukan
defineExpose({ resetForm });
</script>

<template>
  <form id="formTambahCabang" @submit.prevent="handleSubmit" class="space-y-5">
    
    <!-- Nama Cabang -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Nama Cabang<span class="text-red-500">*</span>
      </label>
      <input 
        v-model="formData.namaCabang"
        type="text"
        required
        placeholder="Contoh: Kantor Pusat Jakarta"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               placeholder-gray-400 
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors"
      />
    </div>
    
    <!-- Alamat Cabang -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Alamat Cabang<span class="text-red-500">*</span>
      </label>
      <textarea 
        v-model="formData.alamatCabang"
        required
        rows="4"
        placeholder="Masukkan alamat lengkap cabang"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               placeholder-gray-400 resize-none
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors"
      ></textarea>
    </div>
    
    <!-- Kontak Cabang -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Kontak Cabang
      </label>
      <input 
        v-model="formData.kontakCabang"
        type="text"
        placeholder="Contoh: 021-123456 / Nama PIC"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               placeholder-gray-400 
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors"
      />
    </div>
    
    <!-- TOMBOL DIPINDAH KE FOOTER SLOT MODAL -->
    
  </form>
</template>
