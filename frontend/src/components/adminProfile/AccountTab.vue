<script setup>
import { ref, watch, computed } from 'vue';
import { updateAdminProfile } from '@/services/adminProfileService';
import { showToast, showError } from '@/utils/alertHelper';

const props = defineProps({
  profileData: { type: Object, required: true }
});
const emit = defineEmits(['refresh']);

const form = ref({ name: '', email: '', phone_number: '', address: '' });
const originalForm = ref({ name: '', email: '', phone_number: '', address: '' });

const isSaving = ref(false);
const validationErrors = ref([]);

const hasChanges = computed(() => {
  return form.value.name !== originalForm.value.name ||
         form.value.email !== originalForm.value.email ||
         form.value.phone_number !== originalForm.value.phone_number ||
         form.value.address !== originalForm.value.address;
});

// Pantau jika data dari parent sudah masuk, langsung isi formnya
watch(() => props.profileData, (newData) => {
  if(newData) {
    form.value.name = newData.name || newData.fullname || '';
    form.value.email = newData.email || '';
    form.value.phone_number = newData.phone || newData.phone_number || '';
    form.value.address = newData.address || '';

    originalForm.value = { ...form.value };
  }
}, { immediate: true, deep: true });

const save = async () => {
  isSaving.value = true;
  validationErrors.value = [];
  try {
    await updateAdminProfile(form.value);
    showToast('Data akun berhasil diperbarui!', 'success');
    
    originalForm.value = { ...form.value };
    
    emit('refresh'); // Suruh parent ambil data terbaru
  } catch (error) {
    if (error.response?.status === 422) {
      // Tangkap array error dari backend seperti di screenshot Anda
      validationErrors.value = error.response.data || [{ message: 'Data tidak valid' }];
    } else {
      showError(error.response?.data?.message || 'Gagal menyimpan perubahan.');
    }
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="space-y-6 max-w-3xl">
    <div v-if="validationErrors.length > 0" class="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
      <ul class="list-disc pl-5">
        <li v-for="(err, index) in validationErrors" :key="index">{{ err.message }}</li>
      </ul>
    </div>

    <div>
      <label class="block text-[13px] font-medium text-gray-700 mb-2">Name <span class="text-red-500">*</span></label>
      <input v-model="form.name" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-sm text-[14px] text-gray-800 focus:outline-none focus:border-[#F7941D] transition" />
    </div>

    <div>
      <label class="block text-[13px] font-medium text-gray-700 mb-2">Email <span class="text-red-500">*</span></label>
      <input v-model="form.email" type="email" class="w-full px-4 py-3 border border-gray-300 rounded-sm text-[14px] text-gray-800 focus:outline-none focus:border-[#F7941D] transition" />
    </div>

    <div>
      <label class="block text-[13px] font-medium text-gray-700 mb-2">Phone Number <span class="text-red-500">*</span></label>
      <input v-model="form.phone_number" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-sm text-[14px] text-gray-800 focus:outline-none focus:border-[#F7941D] transition" />
    </div>

    <div>
      <label class="block text-[13px] font-medium text-gray-700 mb-2">Address <span class="text-red-500">*</span></label>
      <textarea v-model="form.address" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-sm text-[14px] text-gray-800 focus:outline-none focus:border-[#F7941D] transition resize-y"></textarea>
    </div>

    <button 
      @click="save" 
      :disabled="isSaving || !hasChanges" 
      :class="[
        'px-6 py-2.5 font-medium rounded-sm text-sm transition-all duration-200 flex items-center justify-center gap-2 w-fit',
        (!hasChanges || isSaving) 
          ? 'bg-[#ACACAC] text-white cursor-not-allowed' 
          : 'bg-[#F7941D] hover:bg-[#E8850E] text-white cursor-pointer shadow-sm hover:shadow'
      ]"
    >
      <svg v-if="isSaving" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {{ isSaving ? 'Saving...' : 'Save Changes' }}
    </button>
  </div>
</template>
