<script setup>
/**
 * FormTambahTujuan Component
 * Form untuk menambahkan tujuan kunjungan baru (divisi & PIC)
 * 
 * Events:
 * - submit: Dipanggil ketika form di-submit dengan data tujuan
 * - cancel: Dipanggil ketika user membatalkan
 */
import { ref, reactive } from 'vue';

const emit = defineEmits(['submit', 'cancel']);

// Form data menggunakan reactive
const formData = reactive({
  cabang: '',
  divisi: '',
  namaPIC: '',
  jabatan: '',
  email: '',
  phone: ''
});

// Loading state untuk submit button
const isSubmitting = ref(false);

// Dummy data cabang untuk dropdown (nanti bisa dari API)
const cabangOptions = ref([
  { value: '', label: 'Pilih Cabang' },
  { value: 'jakarta', label: 'Kantor Pusat Jakarta' },
  { value: 'bandung', label: 'Kantor Cabang Bandung' },
  { value: 'surabaya', label: 'Kantor Cabang Surabaya' },
]);

// Reset form
const resetForm = () => {
  formData.cabang = '';
  formData.divisi = '';
  formData.namaPIC = '';
  formData.jabatan = '';
  formData.email = '';
  formData.phone = '';
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
  <form id="formTambahTujuan" @submit.prevent="handleSubmit" class="space-y-5">
    
    <!-- Cabang -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Cabang<span class="text-red-500">*</span>
      </label>
      <select 
        v-model="formData.cabang"
        required
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               placeholder-gray-400 
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors"
      >
        <option value="" disabled>Pilih Cabang</option>
        <option value="jakarta">Kantor Pusat Jakarta</option>
        <option value="bandung">Kantor Cabang Bandung</option>
        <option value="surabaya">Kantor Cabang Surabaya</option>
      </select>
    </div>
    
    <!-- Divisi/Ruangan -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Divisi/Ruangan<span class="text-red-500">*</span>
      </label>
      <input 
        v-model="formData.divisi"
        type="text"
        required
        placeholder="Contoh: Finance"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               placeholder-gray-400 
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors"
      />
    </div>
    
    <!-- Nama PIC -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Nama PIC<span class="text-red-500">*</span>
      </label>
      <input 
        v-model="formData.namaPIC"
        type="text"
        required
        placeholder="Contoh: Andi Pratama"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               placeholder-gray-400 
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors"
      />
      <p class="mt-1 text-xs text-gray-400">Nama orang yang akan ditemui pengunjung</p>
    </div>
    
    <!-- Jabatan -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Jabatan<span class="text-red-500">*</span>
      </label>
      <input 
        v-model="formData.jabatan"
        type="text"
        required
        placeholder="Contoh: Network Engineer"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               placeholder-gray-400 
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors"
      />
    </div>
    
    <!-- Email -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Email<span class="text-red-500">*</span>
      </label>
      <input 
        v-model="formData.email"
        type="email"
        required
        placeholder="Contoh: andi@perusahaan.com"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               placeholder-gray-400 
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors"
      />
    </div>
    
    <!-- Phone Number -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Phone Number<span class="text-red-500">*</span>
      </label>
      <input 
        v-model="formData.phone"
        type="tel"
        required
        placeholder="Contoh: 0812 3456 7890"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               placeholder-gray-400 
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors"
      />
    </div>
    
    <!-- TOMBOL DIPINDAH KE FOOTER SLOT MODAL -->
    
  </form>
</template>
