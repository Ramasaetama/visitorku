<script setup>
import { ref, reactive, watch } from 'vue';

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['submit', 'cancel']);

const formData = reactive({
  name: props.initialData?.name || '',
  email: props.initialData?.email || '',
  phone_number: props.initialData?.phone_number || '',
  address: props.initialData?.address || '',
  branch_id: props.initialData?.branch_id || '', 
  password: '', 
  confirm_password: '', 
});

watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.name = newData.name || '';
    formData.email = newData.email || '';
    formData.phone_number = newData.phone_number || '';
    formData.address = newData.address || '';
    formData.branch_id = newData.branch_id || '';
    formData.password = ''; 
    formData.confirm_password = '';
  } else {
    resetForm();
  }
}, { deep: true });

const isSubmitting = ref(false);
const passwordError = ref(''); 

const resetForm = () => {
  formData.name = '';
  formData.email = '';
  formData.phone_number = '';
  formData.address = '';
  formData.branch_id = '';
  formData.password = '';
  formData.confirm_password = '';
  passwordError.value = '';
};

const handleSubmit = async () => {
  passwordError.value = '';

  if (!props.initialData && !formData.password) {
    passwordError.value = "Password wajib diisi untuk pengguna baru.";
    return;
  }

  if (formData.password !== formData.confirm_password) {
    passwordError.value = "Password dan Konfirmasi Password tidak cocok!";
    return;
  }

  isSubmitting.value = true;
  
  try {
    const payload = {
      name: formData.name,
      email: formData.email,
      phone_number: formData.phone_number,
      address: formData.address,
      level: 0,
      branch_id: formData.branch_id === '' ? null : formData.branch_id 
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    emit('submit', payload);
    
  } finally {
    isSubmitting.value = false;
  }
};
const handleCancel = () => {
  resetForm();
  emit('cancel');
};

defineExpose({ resetForm });
</script>

<template>
  <form id="formTambahPengguna" @submit.prevent="handleSubmit" class="space-y-4">
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1.5">Nama Pengguna<span class="text-red-500">*</span></label>
      <input 
        v-model="formData.name"
        type="text" required
        placeholder="Contoh: Budi Santoso"
        class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D] transition-colors"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Email<span class="text-red-500">*</span></label>
        <input 
          v-model="formData.email"
          type="email" required
          placeholder="Contoh: budi@mail.com"
          class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D] transition-colors"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Nomor Telepon<span class="text-red-500">*</span></label>
        <input 
          v-model="formData.phone_number"
          type="tel" required
          placeholder="Contoh: 08123456789"
          class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D] transition-colors"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1.5">Cabang Penempatan<span class="text-red-500">*</span></label>
      <select 
        v-model="formData.branch_id"
        required
        class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D] transition-colors cursor-pointer appearance-none"
      >
        <option value="" disabled>Pilih Cabang</option>
        <option value="566a1869-35d7-4d50-8aa7-8d38bb0f69dc">KANTOR GMEDIA PRIME BUILDING</option>
        <option value="branch-jakarta">Gmedia Cabang Jakarta</option>
        <option value="branch-bali">Gmedia Cabang Bali</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1.5">Alamat<span class="text-red-500">*</span></label>
      <textarea 
        v-model="formData.address"
        required rows="2"
        placeholder="Masukkan alamat lengkap pengguna"
        class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm placeholder-gray-400 resize-none focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D] transition-colors"
      ></textarea>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Password<span v-if="!props.initialData" class="text-red-500">*</span></label>
        <input 
          v-model="formData.password"
          type="password"
          :placeholder="props.initialData ? 'Kosongkan jika tak diubah' : 'Masukkan password'"
          class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D] transition-colors"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password<span v-if="!props.initialData" class="text-red-500">*</span></label>
        <input 
          v-model="formData.confirm_password"
          type="password"
          :placeholder="props.initialData ? 'Ulangi jika mengubah password' : 'Ulangi password'"
          class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D] transition-colors"
        />
      </div>
    </div>
    
    <p v-if="passwordError" class="text-red-500 text-sm font-medium mt-1">{{ passwordError }}</p>
    
  </form>
</template>

<style scoped>
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
}
</style>