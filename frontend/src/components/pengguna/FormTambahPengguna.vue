<script setup>
/**
 * FormTambahPengguna Component
 * Form untuk menambahkan atau mengedit pengguna
 * * Props:
 * - initialData: Object data pengguna untuk mode edit (opsional)
 * * Events:
 * - submit: Dipanggil ketika form di-submit dengan data pengguna
 * - cancel: Dipanggil ketika user membatalkan
 */
import { ref, reactive, watch } from 'vue';

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['submit', 'cancel']);

// Form data menggunakan reactive menyesuaikan payload API
const formData = reactive({
  name: props.initialData?.name || '',
  email: props.initialData?.email || '',
  password: '', // Dikosongkan, biasanya tidak dikirim ulang saat edit kecuali diubah
  phone_number: props.initialData?.phone_number || '',
  address: props.initialData?.address || '',
  level: props.initialData?.level || 0 // Default level 0
});

// Watch initialData untuk mengisi form saat mode edit
watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.name = newData.name || '';
    formData.email = newData.email || '';
    formData.password = ''; // Jangan isi password dari DB
    formData.phone_number = newData.phone_number || '';
    formData.address = newData.address || '';
    formData.level = newData.level || 0;
  } else {
    resetForm();
  }
}, { deep: true });

// Loading state untuk submit button
const isSubmitting = ref(false);

// Reset form
const resetForm = () => {
  formData.name = '';
  formData.email = '';
  formData.password = '';
  formData.phone_number = '';
  formData.address = '';
  formData.level = 0;
};

// Handle submit
const handleSubmit = async () => {
  isSubmitting.value = true;
  
  try {
    // Siapkan payload
    const payload = { ...formData };
    
    // Jika mode edit dan password kosong, hapus password dari payload agar tidak mereset password di backend
    if (props.initialData && !payload.password) {
      delete payload.password;
    }

    // Emit data ke parent component (User.vue)
    emit('submit', payload);
    
    // Reset form setelah submit (biasanya diatur dari parent setelah API sukses)
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
  <form id="formTambahPengguna" @submit.prevent="handleSubmit" class="space-y-5">
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Nama Pengguna<span class="text-red-500">*</span>
      </label>
      <input 
        v-model="formData.name"
        type="text"
        required
        placeholder="Contoh: Budi Santoso"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               placeholder-gray-400 
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Email<span class="text-red-500">*</span>
      </label>
      <input 
        v-model="formData.email"
        type="email"
        required
        placeholder="Contoh: budi@mail.com"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               placeholder-gray-400 
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Password<span v-if="!props.initialData" class="text-red-500">*</span>
      </label>
      <input 
        v-model="formData.password"
        type="password"
        :required="!props.initialData"
        :placeholder="props.initialData ? 'Kosongkan jika tidak ingin mengubah password' : 'Masukkan password baru'"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               placeholder-gray-400 
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors"
      />
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Nomor Telepon<span class="text-red-500">*</span>
      </label>
      <input 
        v-model="formData.phone_number"
        type="tel"
        required
        placeholder="Contoh: 08123456789"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               placeholder-gray-400 
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Level Akses<span class="text-red-500">*</span>
      </label>
      <select 
        v-model="formData.level"
        required
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               text-gray-700 bg-white
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors cursor-pointer appearance-none"
      >
        <option :value="0">Level 0 (Staff / Default)</option>
        <option :value="1">Level 1 (Admin)</option>
        <option :value="2">Level 2 (Super Admin)</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Alamat<span class="text-red-500">*</span>
      </label>
      <textarea 
        v-model="formData.address"
        required
        rows="3"
        placeholder="Masukkan alamat lengkap pengguna"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               placeholder-gray-400 resize-none
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors"
      ></textarea>
    </div>
    
    </form>
</template>

<style scoped>
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
}
</style>