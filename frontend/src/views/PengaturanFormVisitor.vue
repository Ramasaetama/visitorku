<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import Modal from '@/components/common/Modal.vue'
import Input from '@/components/common/Input.vue'
import Toggle from '@/components/common/Toggle.vue'
import Toast from '@/components/common/Toast.vue'
import defaultFieldIcon from '@/assets/icons/defaultField.svg';
import customFieldIcon from '@/assets/icons/customField.svg';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { confirmDelete, showSuccess, showError, parseApiError } from '@/utils/alertHelper';
import { getAdditionalData, updateAdditionalData } 
  from '@/services/pengaturanFormService'

// ── State ──
const showModal = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const activeKebab = ref(null)

// ── Dropdown State dengan Posisi Dinamis ──
const activeDropdown = ref(null);
const dropdownPosition = ref({ top: '0px', left: '0px' });

const toggleDropdown = async (index, event) => {
  if (activeDropdown.value === index) {
    activeDropdown.value = null;
  } else {
    activeDropdown.value = index;
    
    await nextTick();
    const buttonRect = event.currentTarget.getBoundingClientRect();
    
    dropdownPosition.value = {
      top: `${buttonRect.bottom + window.scrollY + 5}px`,
      left: `${buttonRect.left + window.scrollX }px`     };
  }
};

const closeDropdown = () => {
  activeDropdown.value = null;
};

// ── Default Fields (non-deletable) ──
const defaultFields = ref([
  { id: 1, name: 'Name', type: 'Text', isDefault: true },
  { id: 2, name: 'Email', type: 'Text', isDefault: true },
  { id: 3, name: 'Phone Number', type: 'Number', isDefault: true },
])

// ── Custom Fields ──
const customFields = ref([])
const additionalDataId = ref(null)

// ── Form Data ──
const formData = ref({
  fieldName: '',
  fieldType: 'Text',
  placeholder: '',
  required: false,
})

const fieldTypeOptions = [
  { value: 'Text', label: 'Text', icon: 'Tr' },
  { value: 'Number', label: 'Number', icon: '#' },
  { value: 'Email', label: 'Email', icon: '@' },
  { value: 'Phone', label: 'Phone', icon: '📞' },
  { value: 'Textarea', label: 'Textarea', icon: '¶' },
]

// ── Computed ──
const isFormValid = computed(() => {
  return formData.value.fieldName.trim() !== '' && formData.value.placeholder.trim() !== ''
})

const closeModal = () => {
  showModal.value = false
}


const fetchAdditionalData = async () => {
  try {
    const response = await getAdditionalData()

    const data = response.data.data || response.data

    if (Array.isArray(data)) {
      customFields.value = data
      if (data.length > 0) {
        additionalDataId.value = data[0].id
      }
    } else {
      additionalDataId.value = data.id
      customFields.value = data.forms || []
    }

  } catch (error) {
    console.error('Gagal ambil data:', error)
  }
}

onMounted(() => {
  fetchAdditionalData();
  window.addEventListener('scroll', closeDropdown, true);
})

onUnmounted(() => {
  window.removeEventListener('scroll', closeDropdown, true);
})

const handleCloseToast = () => {
  showToast.value = false
}

// 1. Tambahkan state penanda index yang sedang diedit
const editingFieldIndex = ref(null);

// 2. Fungsi bantuan untuk mengubah "Nama Depan" menjadi "nama_depan" (sesuai req backend)
const generateFieldSlug = (text) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
};

// 3. Perbarui fungsi Buka Modal Tambah
const openModal = () => {
  closeDropdown();
  formData.value = { fieldName: '', fieldType: 'Text', placeholder: '', required: false };
  editingFieldIndex.value = null; // Pastikan mode Tambah
  showModal.value = true;
};

// 4. Tambahkan fungsi Buka Modal Edit
const handleEditForm = (index) => {
  closeDropdown();
  const fieldToEdit = customFields.value[index];
  
  formData.value = {
    fieldName: fieldToEdit.name,
    // Kembalikan huruf kapital pertama agar select option Vue tidak error
    fieldType: fieldToEdit.type.charAt(0).toUpperCase() + fieldToEdit.type.slice(1), 
    required: fieldToEdit.required || false,
    placeholder: fieldToEdit.placeholder || ''
  };
  
  editingFieldIndex.value = index; // Tandai bahwa ini mode Edit
  showModal.value = true;
};

// 5. Fungsi Gabungan Simpan (Tambah & Edit)
const saveField = async () => {
  if (!isFormValid.value) return;

  // Format data persis seperti yang diminta Backend
  const newFieldData = {
    field: generateFieldSlug(formData.value.fieldName), 
    name: formData.value.fieldName,
    type: formData.value.fieldType.toLowerCase(), // Backend minta huruf kecil (text, number, dll)
    required: formData.value.required,
    placeholder: formData.value.placeholder // Tambahkan placeholder ke payload jika diperlukan
  };

  try {
    let updatedFields = [...customFields.value];

    // Jika Edit, timpa datanya. Jika Tambah, taruh di paling bawah.
    if (editingFieldIndex.value !== null) {
      updatedFields[editingFieldIndex.value] = newFieldData;
    } else {
      updatedFields.push(newFieldData);
    }

    // Tembak API (PUT)
    await updateAdditionalData(additionalDataId.value, { forms: updatedFields });

    // Update tabel & tutup modal
    customFields.value = updatedFields;
    showModal.value = false;
    
    toastMessage.value = editingFieldIndex.value !== null 
      ? t('visitorForm.success.updated') 
      : t('visitorForm.success.added');

    showToast.value = true;
    
  } catch (error) {
    console.error('Gagal menyimpan field:', error);
  }
};

// 6. Perbarui Fungsi Hapus (Delete) dengan SweetAlert
const deleteField = async (index) => {
  closeDropdown();
  // Panggil pop-up konfirmasi khas aplikasi Anda
  const isConfirmed = await confirmDelete('Custom Field');
  
  if (isConfirmed) {
    try {
      // 1. Copy array lama
      let updatedFields = [...customFields.value];
      
      // 2. Buang field di posisi index tersebut
      updatedFields.splice(index, 1);

      // 3. Tembak ke API (pastikan ID-nya tidak null)
      if (!additionalDataId.value) {
        throw new Error("ID Pengaturan Form belum tersedia.");
      }

      await updateAdditionalData(additionalDataId.value, { forms: updatedFields });

      // 4. Update tabel di layar
      customFields.value = updatedFields;
      
      // 5. Munculkan notifikasi sukses
      showSuccess('Field berhasil dihapus!');

    } catch (error) {
      console.error('Gagal menghapus field:', error);
      showError(parseApiError(error, 'Gagal menghapus field karena kesalahan sistem.'));
    }
  }
};
</script>

<template>
  <div class="flex-1 w-full h-full flex flex-col">
    <main class="bg-white rounded-2xl shadow-sm h-full min-h-[calc(100vh-7rem)] flex flex-col relative w-full">
          <div class="p-6 flex-1 flex flex-col">
            <div class="flex items-start justify-between mb-6">
              <div>
                <h1 class="text-2xl font-semibold text-gray-800 mb-1">{{ t('visitorForm.title') }}</h1>
                <p class="text-sm text-gray-500">
                  {{ t('visitorForm.subtitle') }}
                </p>
              </div>
              <button
                @click.stop="openModal"
                class="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#F7941D] text-[#F7941D] rounded-sm font-medium text-sm hover:bg-[#F7941D] hover:text-white transition-all focus:outline-none"
              >
                <span class="text-lg leading-none">+</span>  {{ t('visitorForm.createBtn') }}
              </button>
            </div>

            <div class="flex-1 overflow-hidden">
              <table class="w-full">
                <thead>
                  <tr class="border-b-2 border-gray-200">
                    <th class="text-left text-sm font-semibold text-gray-700 py-3 px-4 w-1/2">{{ t('visitorForm.table.fieldName') }}</th>
                    <th class="text-left text-sm font-semibold text-gray-700 py-3 px-4">{{ t('visitorForm.table.type') }}</th>
                    <th class="text-left text-sm font-semibold text-gray-700 py-3 px-4 w-12">{{ t('visitorForm.table.action') }}</th>
                    <th class="py-3 px-4 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="3" class="pt-4 pb-2 px-4">
                      <span class="inline-flex items-center gap-1.5 bg-[#F7941D] text-white text-xs font-semibold px-3 py-1.5 rounded-sm">
                        <img :src="defaultFieldIcon" alt="Default Field" class="w-3.5 h-3.5 brightness-0 invert" />
                        {{ t('visitorForm.badge.default') }}
                      </span>
                    </td>
                  </tr>

                  <tr v-for="field in defaultFields" :key="field.id" class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="py-3.5 px-4 text-sm text-gray-700">{{ field.name }}</td>
                    <td class="py-3.5 px-4 text-sm text-gray-500">{{ field.type }}</td>
                    
                    <td class="py-3.5 px-4">
                      <div class="flex justify-center w-full">
                        <span class="text-gray-300">-</span>
                      </div>
                    </td>
                  </tr>

                  <template v-if="customFields.length > 0">
                    <tr>
                      <td colspan="3" class="pt-6 pb-2 px-4">
                        <span class="inline-flex items-center gap-1.5 bg-[#F7941D] text-white text-xs font-semibold px-3 py-1.5 rounded-sm">
                          <img :src="customFieldIcon" alt="Custom Field" class="w-3.5 h-3.5 brightness-0 invert" />
                          {{ t('visitorForm.badge.custom') }}
                        </span>
                      </td>
                    </tr>

                    <tr v-for="(field, index) in customFields" :key="'custom-' + index" class="border-b border-gray-100 hover:bg-gray-50">
                      <td class="py-3.5 px-4 text-sm text-gray-700">{{ field.name }}</td>
                      <td class="py-3.5 px-4 text-sm text-gray-500">{{ field.type }}</td>
                      
                      <td class="py-3.5 px-4">
                        <div class="flex justify-center items-center gap-2 relative">
                          
                          <button
                            @click.stop="toggleDropdown(index, $event)"
                            class="w-[30px] h-[30px] rounded border border-[#F7941D] flex items-center justify-center text-[#F7941D] hover:bg-[#FEF4E3] transition-colors focus:outline-none relative z-10"
                            title="Opsi"
                          >
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                          </button>

                          <Teleport to="body">
                            <div v-if="activeDropdown === index" @click="closeDropdown" class="fixed inset-0 z-[9998]"></div>
                            
                            <div 
                              v-if="activeDropdown === index" 
                              class="fixed w-36 bg-white rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 py-1.5 z-[9999]"
                              :style="{ top: dropdownPosition.top, left: dropdownPosition.left }"
                            >
                              <button 
                                @click="handleEditForm(index)" 
                                class="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-[#FEF4E3] hover:text-[#F7941D] focus:outline-none transition-colors"
                              >
                                Edit Field
                              </button>
                            </div>
                          </Teleport>

                          <button
                            @click.stop="deleteField(index)"
                            class="w-[30px] h-[30px] rounded bg-[#E45454] flex items-center justify-center text-white hover:bg-[#D24A4A] transition-colors focus:outline-none relative z-10"
                            title="Hapus Field"
                          >
                            <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path>
                            </svg>
                          </button>

                        </div>
                      </td>
                    </tr>
                  </template>

                  <tr>
                    <td colspan="3" class="pt-4 px-4">
                      <button
                        @click.stop="openModal"
                        class="text-[#F7941D] text-sm font-medium hover:underline"
                      >
                        {{ t('visitorForm.createLink') }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
      </main>

    <Modal
      :show="showModal"
      :title="editingFieldIndex !== null ? t('visitorForm.modal.editTitle') : t('visitorForm.modal.addTitle')"  width="half"
      @close="closeModal"
    >
      <div class="mb-8">
        <h3 class="text-base font-medium text-gray-900 mb-4">{{ t('visitorForm.modal.sectionGeneral') }}</h3>
        <Input
          class="custom-medium-label" 
          v-model="formData.fieldName"
          :label="t('visitorForm.modal.fieldNameLabel')"
          :placeholder="t('visitorForm.modal.fieldNamePlaceholder')"
          required
        />
      </div>

      <div class="mb-8">
        <h3 class="text-base font-medium text-gray-900 mb-4">{{ t('visitorForm.modal.sectionType') }}</h3>

        <div class="mb-4">
          <label class="text-body font-weight: 400 font-poppins text-gray-900 mb-1 block">
            {{ t('visitorForm.modal.fieldTypeLabel') }}<span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <select
              v-model="formData.fieldType"
              class="w-full px-4 py-3 border border-gray-300 rounded-sm font-poppins text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-white appearance-none pr-10"
            >
              <option v-for="opt in fieldTypeOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
              <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <Input
          class="custom-medium-label"
          v-model="formData.placeholder"
          :label="t('visitorForm.modal.placeholderLabel')"
          :placeholder="t('visitorForm.modal.placeholderPlaceholder')"
          required
        />
      </div>

      <div>
        <h3 class="text-base font-medium text-gray-900 mb-4">{{ t('visitorForm.modal.sectionSettings') }}</h3>
        <div class="flex items-start gap-3">
          <Toggle v-model="formData.required" />
          <div>
            <p class="text-body font-weight: 400 text-gray-900">{{ t('visitorForm.modal.requiredLabel') }}</p>
            <p class="text-sm text-gray-500 mt-0.5">{{ t('visitorForm.modal.requiredDesc') }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            @click="closeModal"
            class="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-sm  hover:bg-gray-50 transition-colors focus:outline-none"
          >
            {{ t('visitorForm.modal.cancel') }}
          </button>
          
          <button
            type="button"
            @click="saveField" 
            :disabled="!isFormValid"
            :class="[
              'px-5 py-2.5 text-sm font-medium rounded-sm transition-colors focus:outline-none',
              isFormValid
                ? 'text-white bg-[#F7941D] hover:bg-[#E8850E]'
                : 'text-white bg-gray-300 cursor-not-allowed'
            ]"
          >
            {{ editingFieldIndex !== null ? t('visitorForm.modal.save') : t('visitorForm.modal.create') }}
          </button>
        </div>
      </template>
    </Modal>

    <Toast :show="showToast" :message="toastMessage" @close="handleCloseToast" />
  </div>
</template>

<style scoped>
button:focus, select:focus {
  outline: none !important;
  box-shadow: none !important;
}

/* Memaksa label di dalam Input menjadi font-normal (400) agar tidak terlihat semi-bold */
.custom-medium-label :deep(label) {
  font-weight: 400 !important;
}
</style>