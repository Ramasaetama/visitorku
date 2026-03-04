<template>
  <div class="space-y-6 max-w-md">
    <div 
      @click="$refs.fileInput.click()"
      class="w-full h-48 bg-[#FFF9F0] border-2 border-dashed border-[#F7941D]/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#FFF4E5] transition overflow-hidden relative"
    >
      <input type="file" ref="fileInput" class="hidden" accept="image/png, image/jpeg, image/jpg" @change="handleFileChange" />
      
      <img v-if="previewUrl" :src="previewUrl" class="absolute inset-0 w-full h-full object-cover" />
      
      <span v-if="!previewUrl" class="text-[#F7941D] font-medium text-sm">Upload image here</span>
    </div>

    <button @click="save" :disabled="!selectedFile || isSaving" class="px-6 py-2.5 bg-[#F7941D] hover:bg-[#E8850E] text-white font-medium rounded-lg text-sm transition disabled:opacity-70 disabled:cursor-not-allowed">
      {{ isSaving ? 'Uploading...' : 'Save Changes' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { uploadAdminProfilePicture } from '@/services/adminProfileService';

const props = defineProps({
  profileData: { type: Object, required: true }
});
const emit = defineEmits(['refresh']);

const fileInput = ref(null);
const selectedFile = ref(null);
const previewUrl = ref(props.profileData?.picture_url || props.profileData?.avatar || null);
const isSaving = ref(false);

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
    alert('Profile picture updated successfully!');
    selectedFile.value = null; // Reset setelah sukses
    emit('refresh');
  } catch (error) {
    alert('Failed to upload profile picture.');
  } finally {
    isSaving.value = false;
  }
};
</script>