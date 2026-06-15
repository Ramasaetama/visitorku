<template>
  <div class="space-y-6 max-w-3xl">
    <div v-if="validationErrors.length > 0" class="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
      <ul class="list-disc pl-5">
        <li v-for="(err, index) in validationErrors" :key="index">{{ err.message || err }}</li>
      </ul>
    </div>

    <div>
      <label class="block text-[13px] font-medium text-gray-700 mb-2">Current Password <span class="text-red-500">*</span></label>
      <input v-model="form.current_password" type="password" placeholder="Enter Current Password here..." class="w-full px-4 py-3 border border-gray-300 rounded-sm text-[14px] text-gray-800 focus:outline-none focus:border-[#F7941D] transition" />
    </div>

    <div>
      <label class="block text-[13px] font-medium text-gray-700 mb-2">New Password <span class="text-red-500">*</span></label>
      <input v-model="form.new_password" type="password" placeholder="Enter New Password here..." class="w-full px-4 py-3 border border-gray-300 rounded-sm text-[14px] text-gray-800 focus:outline-none focus:border-[#F7941D] transition" />
    </div>

    <div>
      <label class="block text-[13px] font-medium text-gray-700 mb-2">Confirm New Password <span class="text-red-500">*</span></label>
      <input v-model="form.c_new_password" type="password" placeholder="Enter Confirm New Password here..." class="w-full px-4 py-3 border border-gray-300 rounded-sm text-[14px] text-gray-800 focus:outline-none focus:border-[#F7941D] transition" />
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

<script setup>
import { ref, computed } from 'vue';
import { updateAdminPassword } from '@/services/adminProfileService';
import { showToast, showError } from '@/utils/alertHelper';

const form = ref({ 
  current_password: '', 
  new_password: '', 
  c_new_password: '' 
});
const isSaving = ref(false);
const validationErrors = ref([]);

// 🌟 FIX: Detektor perubahan (tombol nyala kalau ada ketikan)
const hasChanges = computed(() => {
  return form.value.current_password !== '' || 
         form.value.new_password !== '' || 
         form.value.c_new_password !== '';
});

const save = async () => {
  validationErrors.value = [];

  if (form.value.new_password !== form.value.c_new_password) {
    validationErrors.value = [{ message: "New Password dan Confirm Password tidak sama!" }];
    return;
  }

  if (!form.value.current_password || !form.value.new_password) {
    validationErrors.value = [{ message: "Semua kolom password wajib diisi!" }];
    return;
  }

  isSaving.value = true;
  try {
    await updateAdminPassword(form.value);
    showToast('Password berhasil diperbarui!', 'success');
    
    // Reset form setelah sukses (tombol otomatis jadi abu-abu lagi)
    form.value = { current_password: '', new_password: '', c_new_password: '' };
  } catch (error) {
    if (error.response?.status === 422) {
      const errorData = error.response.data;
      validationErrors.value = errorData.errors || [{ message: errorData.message || 'Validasi gagal' }];
    } else {
      showError(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan password.');
    }
  } finally {
    isSaving.value = false;
  }
};
</script>