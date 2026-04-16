<script setup>
import { ref, computed } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Modal from '@/components/common/Modal.vue'
import Input from '@/components/common/Input.vue'
import Toggle from '@/components/common/Toggle.vue'
import Toast from '@/components/common/Toast.vue'
import Topbar from '@/components/Topbar.vue';
import visitorkulogo from '@/assets/visitorku.png'
import patternBg from '@/assets/Frame 7.svg'
import globeIcon from '@/assets/proicons_globe.svg'
import adminprofile from '@/assets/adminprofile.png'
import deleteIcon from '@/assets/delete.svg'

import { confirmDelete, showSuccess, showError } from '@/utils/alertHelper';
import { getAdditionalData, updateAdditionalData } 
  from '@/services/pengaturanFormService'

import { onMounted } from 'vue'

// ── State ──
const showModal = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const activeKebab = ref(null)

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
  fetchAdditionalData()
})

const toggleKebab = (fieldId) => {
  activeKebab.value = activeKebab.value === fieldId ? null : fieldId
}

const closeKebab = () => {
  activeKebab.value = null
}

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
  formData.value = { fieldName: '', fieldType: 'Text', placeholder: '', required: false };
  editingFieldIndex.value = null; // Pastikan mode Tambah
  showModal.value = true;
};

// 4. Tambahkan fungsi Buka Modal Edit
const handleEditForm = (index) => {
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
    required: formData.value.required
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
      ? `Field berhasil diperbarui` 
      : `Field berhasil ditambahkan`;
    showToast.value = true;
    
  } catch (error) {
    console.error('Gagal menyimpan field:', error);
  }
};

// 6. Perbarui Fungsi Hapus (Delete) dengan SweetAlert
const deleteField = async (index) => {
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
      showError(error.response?.data?.message || 'Gagal menghapus field karena kesalahan sistem.');
    }
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']" @click="closeKebab">
    
    <Topbar />

    <!-- MAIN CONTAINER -->
    <div class="flex flex-1 items-stretch">
      <Sidebar />

      <main class="flex-1 bg-[#F4F6F8] p-4">
        <div class="bg-white rounded-2xl shadow-sm h-full flex flex-col">
          <div class="p-6 flex-1 flex flex-col">
            <!-- Page Header -->
            <div class="flex items-start justify-between mb-6">
              <div>
                <h1 class="text-2xl font-semibold text-gray-800 mb-1">Custom Field</h1>
                <p class="text-sm text-gray-500">
                  Tambahkan field untuk mengumpulkan informasi visitor sesuai kebutuhan Anda.
                </p>
              </div>
              <button
                @click.stop="openModal"
                class="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#F7941D] text-[#F7941D] rounded-lg font-medium text-sm hover:bg-[#F7941D] hover:text-white transition-all"
              >
                <span class="text-lg leading-none">+</span> Create new field
              </button>
            </div>

            <!-- Field Table -->
            <div class="flex-1 overflow-hidden">
              <table class="w-full">
                <thead>
                  <tr class="border-b-2 border-gray-200">
                    <th class="text-left text-sm font-semibold text-gray-700 py-3 px-4 w-1/2">Field Name</th>
                    <th class="text-left text-sm font-semibold text-gray-700 py-3 px-4">Type</th>
                    <th class="py-3 px-4 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Default Fields Section -->
                  <tr>
                    <td colspan="3" class="pt-4 pb-2 px-4">
                      <span class="inline-flex items-center gap-1.5 bg-[#F7941D] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Field default
                      </span>
                    </td>
                  </tr>

                  <tr v-for="field in defaultFields" :key="field.id" class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="py-3.5 px-4 text-sm text-gray-700">{{ field.name }}</td>
                    <td class="py-3.5 px-4 text-sm text-gray-500">{{ field.type }}</td>
                    
                    <td class="py-3.5 px-4">
                      <div class="flex justify-center w-18">
                        <button
                          class="flex items-center justify-center w-8 h-8 rounded border border-[#F7941D] text-[#F7941D] hover:bg-orange-50 transition-colors"
                        >
                          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="12" cy="19" r="1.5" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!-- Custom Fields Section -->
                  <template v-if="customFields.length > 0">
                    <tr>
                      <td colspan="3" class="pt-6 pb-2 px-4">
                        <span class="inline-flex items-center gap-1.5 bg-[#F7941D] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Custom Field
                        </span>
                      </td>
                    </tr>

                    <tr v-for="(field, index) in customFields" :key="'custom-' + index" class="border-b border-gray-100 hover:bg-gray-50">
                      <td class="py-3.5 px-4 text-sm text-gray-700">{{ field.name }}</td>
                      <td class="py-3.5 px-4 text-sm text-gray-500">{{ field.type }}</td>
                      
                      <td class="py-3.5 px-4">
                        <div class="flex items-center gap-2 w-18">
                          
                          <button
                            @click.stop="handleEditForm(index)"
                            class="flex items-center justify-center w-8 h-8 rounded border border-[#F7941D] text-[#F7941D] hover:bg-orange-50 transition-colors"
                          >
                            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="5" r="1.5" />
                              <circle cx="12" cy="12" r="1.5" />
                              <circle cx="12" cy="19" r="1.5" />
                            </svg>
                          </button>

                          <button
                            @click.stop="deleteField(index)"
                            class="flex items-center justify-center w-8 h-8 rounded bg-[#DE5343] text-white hover:bg-[#C94233] transition-colors"
                          >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <!-- Kebab Dropdown -->
                          <div
                            v-if="activeKebab === 'custom-' + index"
                            class="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-30"
                          >
                            <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              Edit
                            </button>
                            <button
                              @click.stop="deleteField(field.id)"
                              class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </template>

                  <!-- Create field link -->
                  <tr>
                    <td colspan="3" class="pt-4 px-4">
                      <button
                        @click.stop="openModal"
                        class="text-[#F7941D] text-sm font-medium hover:underline"
                      >
                        + Create field
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- CREATE FIELD MODAL -->
    <Modal
      :show="showModal"
      :title="editingFieldIndex !== null ? 'Edit Field' : 'Create Field'"  width="half"
      @close="closeModal"
    >
      <!-- General Section -->
      <div class="mb-8">
        <h3 class="text-base font-semibold text-gray-900 mb-4">General</h3>
        <Input
          v-model="formData.fieldName"
          label="Field Name"
          placeholder="Contoh: Nama Lengkap"
          required
        />
      </div>

      <!-- Field Type Section -->
      <div class="mb-8">
        <h3 class="text-base font-semibold text-gray-900 mb-4">Field Type</h3>

        <!-- Field Type Dropdown -->
        <div class="mb-4">
          <label class="text-body-4 font-semibold font-poppins text-gray-900 mb-1 block">
            Field Name<span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <select
              v-model="formData.fieldType"
              class="w-full px-4 py-3 border border-gray-300 rounded-4xl font-poppins text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-white appearance-none pr-10"
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

        <!-- Placeholder Text -->
        <Input
          v-model="formData.placeholder"
          label="Placeholder Text"
          placeholder="Contoh: Masukkan nama lengkap"
          required
        />
      </div>

      <!-- Settings Section -->
      <div>
        <h3 class="text-base font-semibold text-gray-900 mb-4">Settings</h3>
        <div class="flex items-start gap-3">
          <Toggle v-model="formData.required" />
          <div>
            <p class="text-sm font-semibold text-gray-900">Required</p>
            <p class="text-xs text-gray-500 mt-0.5">Aktifkan jika informasi ini harus diisi oleh setiap visitor</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            @click="closeModal"
            class="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            @click="saveField" 
            :disabled="!isFormValid"
            :class="[
              'px-5 py-2.5 text-sm font-medium rounded-lg transition-colors',
              isFormValid
                ? 'text-white bg-[#F7941D] hover:bg-[#E8850E]'
                : 'text-white bg-gray-300 cursor-not-allowed'
            ]"
          >
            {{ editingFieldIndex !== null ? 'Save Changes' : 'Create Field' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Toast Notification -->
    <Toast :show="showToast" :message="toastMessage" @close="handleCloseToast" />
  </div>
</template>