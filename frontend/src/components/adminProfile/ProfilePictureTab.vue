<script setup>
import { ref, computed } from 'vue';
import { uploadAdminProfilePicture } from '@/services/adminProfileService';
import { showToast, showError } from '@/utils/alertHelper';

const props = defineProps({
  profileData: { type: Object, required: true }
});
const emit = defineEmits(['refresh']);

const fileInput = ref(null);
const selectedFile = ref(null);
const previewUrl = ref(props.profileData?.picture_url || props.profileData?.avatar || null);
const isSaving = ref(false);

const hasChanges = computed(() => {
  return selectedFile.value !== null;
});

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

const save = async () => {
  if (!selectedFile.value) return;
  isSaving.value = true;
  try {
    await uploadAdminProfilePicture(selectedFile.value);
    showToast('Foto profil berhasil diperbarui!', 'success');
    
    // Reset file setelah sukses agar tombol mati/abu-abu lagi
    selectedFile.value = null; 
    
    emit('refresh');
  } catch (error) {
    showError('Gagal mengunggah foto profil.');
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="space-y-6 max-w-md">
    <div 
      @click="$refs.fileInput.click()"
      class="w-full h-48 bg-[#FFF9F0] border-2 border-dashed border-[#F7941D]/30 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:bg-[#FFF4E5] transition overflow-hidden relative"
    >
      <input type="file" ref="fileInput" class="hidden" accept="image/png, image/jpeg, image/jpg" @change="handleFileChange" />
      
      <img v-if="previewUrl" :src="previewUrl" class="absolute inset-0 w-full h-full object-cover" />
      
      <span v-if="!previewUrl" class="text-[#F7941D] font-medium text-sm">Upload image here</span>
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
      {{ isSaving ? 'Uploading...' : 'Save Changes' }}
    </button>
  </div>
</template>
