<script setup>
import EmptyState from '@/components/common/EmptyState.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import DataTable from '@/components/common/DataTable.vue';
import Modal from '@/components/common/Modal.vue';
import Toast from '@/components/common/Toast.vue';
import FormTambahTujuan from '@/components/cabang/FormTambahTujuan.vue';
import Pagination from '@/components/common/Pagination.vue';
import notfound from '@/assets/notfound.svg';

import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { confirmDelete, showSuccess, showError, parseApiError } from '@/utils/alertHelper'; 
import { getCategories, getBranches, createCategory, updateCategory, deleteCategory } from '@/services/tujuanService';

const { t } = useI18n();

const searchQuery = ref('');
const tujuanData = ref([]);
const branchesData = ref([]); 
const rawDataTujuan = ref([]); 
const isEditMode = ref(false); 
const editId = ref(null);      
const selectedData = ref(null); 

// PAGINATION STATE
const currentPage = ref(1);
const itemsPerPage = ref(10);

const appliedSearchQuery = ref('');
const executeSearch = () => {
  appliedSearchQuery.value = searchQuery.value;
  currentPage.value = 1; 
};

watch(searchQuery, (nilaiBaru) => {
  if (nilaiBaru === '') {
    executeSearch(); 
  }
});

watch(itemsPerPage, () => {
  currentPage.value = 1;
});

const tableColumns = computed(() => [
  { key: 'divisi', label: t('purpose.table.division'), sortable: true },
  { key: 'pic', label: t('purpose.table.pic'), sortable: true },
  { key: 'jabatan', label: t('purpose.table.position'), sortable: true },
  { key: 'cabang', label: t('purpose.table.branch'), sortable: true },
  { key: 'aksi', label: t('purpose.table.action'), sortable: false },
]);

const isLoading = ref(false);
const showModal = ref(false);
const showToast = ref(false);
const toastMessage = ref(''); 
const activeDropdown = ref(null);
const dropdownPosition = ref({ top: '0px', left: '0px' });

const toggleDropdown = async (id, event) => {
  if (activeDropdown.value === id) {
    activeDropdown.value = null;
  } else {
    activeDropdown.value = id;
    
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

const fetchDataTujuan = async () => {
  isLoading.value = true;
  try {
    const [resCategory, resBranch] = await Promise.all([
      getCategories(),
      getBranches() 
    ]);

    const categories = resCategory.data?.results || resCategory.data?.data || resCategory.data || [];
    const branches = resBranch.data?.results || resBranch.data?.data || resBranch.data || [];

    rawDataTujuan.value = categories; 
    branchesData.value = branches; 

    if (Array.isArray(categories)) {
      tujuanData.value = categories.map(cat => {
        const matchedBranch = branches.find(b => b.id === cat.branch_id);
        return {
          id: cat.id, 
          divisi: cat.division || '-',
          pic: cat.category || '-', 
          jabatan: cat.position || '-',
          cabang: matchedBranch ? matchedBranch.name : (cat.branch_id || '-') 
        };
      });
    }
  } catch (error) {
    console.error('Gagal memuat data tabel:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchDataTujuan();
});

const sortKey = ref('');
const sortOrder = ref('asc');

const handleCloseModal = () => {
  showModal.value = false;
};

const handleCloseToast = () => {
  showToast.value = false;
};

const handleSort = (columnKey) => {
  if (sortKey.value === columnKey) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = columnKey;
    sortOrder.value = 'asc';
  }
};

const filteredData = computed(() => {
  if (!appliedSearchQuery.value) {
    return tujuanData.value;
  }
  
  const keyword = appliedSearchQuery.value.toLowerCase();
  
  return tujuanData.value.filter(item => {
    return (
      (item.divisi && item.divisi.toLowerCase().includes(keyword)) ||
      (item.pic && item.pic.toLowerCase().includes(keyword)) ||
      (item.jabatan && item.jabatan.toLowerCase().includes(keyword)) ||
      (item.cabang && item.cabang.toLowerCase().includes(keyword))
    );
  });
});

const sortedData = computed(() => {
  if (!sortKey.value) return filteredData.value; 

  return [...filteredData.value].sort((a, b) => { 
    const valA = a[sortKey.value] ?? '';
    const valB = b[sortKey.value] ?? '';
    const cmp = String(valA).localeCompare(String(valB), 'id', { sensitivity: 'base' });
    return sortOrder.value === 'asc' ? cmp : -cmp;
  });
});

// LOGIKA PAGINATION FRONTEND SLICE
const totalItems = computed(() => filteredData.value.length);
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedData.value.slice(start, end);
});

const handleTambahTujuan = () => {
  isEditMode.value = false;
  editId.value = null;
  selectedData.value = null; 
  showModal.value = true;
};

const handleEditTujuan = (row) => {
  closeDropdown();
  const rawData = rawDataTujuan.value.find(item => item.id === row.id);
  
  if (rawData) {
    isEditMode.value = true;
    editId.value = row.id;

    selectedData.value = {
      cabang: rawData.branch_id,
      divisi: rawData.division,
      namaPIC: rawData.category, 
      jabatan: rawData.position,
      email: rawData.email_notification,
      phoneNumber: rawData.phone_number_notification
    };

    showModal.value = true;
  }
};

const handleDeleteTujuan = async (row) => {
  const isConfirmed = await confirmDelete(`${t('purpose.confirm.deleteLabel')}: ${row.pic}`);

  if (isConfirmed) {
    try {
      isLoading.value = true;
      await deleteCategory(row.id);
      showSuccess(t('purpose.success.deleted'));
      fetchDataTujuan();
    } catch (error) {
      console.error('Gagal menghapus data:', error);
      showError(parseApiError(error, t('purpose.error.deleteFailed')));
    } finally {
      isLoading.value = false;
    }
  }
};

const handleSubmitTujuan = async (formData) => {
  try {
    isLoading.value = true; 

    const payloadCategory = {
      category: formData.namaPIC, 
      branch_id: formData.cabang, 
      send_notification: true, 
      email_notification: formData.email,
      phone_number_notification: formData.phoneNumber,
      division: formData.divisi,
      position: formData.jabatan
    };

    if (isEditMode.value) {
      await updateCategory(editId.value, payloadCategory);
      toastMessage.value = t('purpose.success.updated');
    } else {
      await createCategory(payloadCategory);
      toastMessage.value = t('purpose.success.added');
    }

    showModal.value = false;
    showToast.value = true; 
    
    fetchDataTujuan(); 

  } catch (error) {
    console.log('Detail Penolakan Backend:', error.response?.data);
    toastMessage.value = parseApiError(error, 'Terjadi kesalahan saat menyimpan data.');
    showToast.value = true;
  } finally {
    isLoading.value = false; 
  } 
};
</script>

<template>   
  <div class="flex-1 w-full h-full flex flex-col"> 
    <main class="bg-white rounded-2xl shadow-sm h-full min-h-[calc(100vh-7rem)] flex flex-col relative w-full">
      <div class="p-6 flex-1 flex flex-col">
        
        <div class="flex items-start justify-between mb-6">
          <div>
            <h1 class="text-2xl font-semibold text-gray-800 mb-1">{{ t('purpose.title') }}</h1>
            <p class="text-sm text-gray-500">{{ t('purpose.subtitle') }}</p>
          </div>
          
          <button 
            @click="handleTambahTujuan"
            class="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#F7941D] 
                   text-[#F7941D] rounded-sm font-medium text-sm 
                   hover:bg-[#F7941D] hover:text-white transition-all focus:outline-none"
          >
            <span class="text-lg leading-none">+</span>
            {{ t('purpose.addBtn') }}
          </button>
        </div>
        
        <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-start gap-4">
          <div class="w-full sm:max-w-md flex-1">
            <SearchInput 
              v-model="searchQuery" 
              v-model:perPage="itemsPerPage"
              :placeholder="t('purpose.searchPlaceholder')" 
              @keyup.enter="executeSearch" />
          </div>          
          <button 
            class="group flex items-center justify-center gap-2 h-9 px-4 bg-white border border-gray-200 rounded-sm text-sm text-gray-700 font-medium focus:outline-none focus:border-[#F7941D] focus:text-[#F7941D] focus:ring-[30px] focus:ring-[#F7941D] transition-all duration-200"
          >
            <svg class="w-4 h-4 text-gray-400 group-focus:text-[#F7941D] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            {{ t('purpose.filterBtn') }}
          </button>
        </div>
        
        <div class="flex-1 overflow-hidden">
          <DataTable 
            :columns="tableColumns"               
            :data="paginatedData" 
            :loading="isLoading"
            :sort-key="sortKey"
            :sort-order="sortOrder"
            @sort="handleSort"
          >
            <template #aksi="{ row }">
              <div class="flex items-center gap-2 relative">
                
                <button 
                  @click="toggleDropdown(row.id, $event)"
                  class="w-[30px] h-[30px] rounded border border-[#F7941D] flex items-center justify-center text-[#F7941D] hover:bg-[#FEF4E3] transition-colors focus:outline-none relative z-10"
                  title="Edit Data"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>

                <Teleport to="body">
                <div v-if="activeDropdown === row.id" @click="closeDropdown" class="fixed inset-0 z-[9998]"></div>
                
                <div 
                  v-if="activeDropdown === row.id" 
                  class="fixed w-36 bg-white rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 py-1.5 z-[9999]"
                  :style="{ top: dropdownPosition.top, left: dropdownPosition.left }"
                >
                  <button 
                    @click="handleEditTujuan(row)" 
                    class="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-[#FEF4E3] hover:text-[#F7941D] focus:outline-none transition-colors"
                  >
                    Edit Data
                  </button>
                </div>
              </Teleport>

                <button 
                  @click="handleDeleteTujuan(row)"
                  class="w-[30px] h-[30px] rounded bg-[#E45454] flex items-center justify-center text-white hover:bg-[#D24A4A] transition-colors focus:outline-none relative z-10"
                  title="Hapus"
                >
                  <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path>
                  </svg>
                </button>

              </div>
            </template>

            <template #empty>
              <EmptyState 
                v-if="tujuanData.length === 0"
                :icon="notfound"
                :title="t('purpose.empty.noData')"
                :description="t('purpose.empty.description')"
                :buttonText="t('purpose.empty.buttonText')"
                @action="handleTambahTujuan"
              />
              <EmptyState 
                v-else
                :icon="notfound"
                :title="t('purpose.empty.notFound')"
                :description="`${t('purpose.empty.notFoundDesc')} '${appliedSearchQuery}'`"
              />
            </template>
          </DataTable>
        </div>
        
      </div>
      
      <Pagination
        v-model:current-page="currentPage"
        :total-data="totalItems"
        :per-page="itemsPerPage"
      />
      
    </main>
  </div>  
  <Modal 
    :show="showModal"
    :title="isEditMode ? t('purpose.modal.editTitle') : t('purpose.modal.addTitle')"
    :description="isEditMode ? t('purpose.modal.editDesc') : t('purpose.modal.addDesc')"
    width="half"
    @close="handleCloseModal"
  >
    <FormTambahTujuan 
      v-if="showModal"
      :initial-data="selectedData"
      :branches="branchesData" 
      @submit="handleSubmitTujuan"
      @cancel="handleCloseModal"
    />
    
    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button 
          type="button"
          @click="handleCloseModal"
          class="px-5 py-2.5 text-sm font-medium text-gray-600 
                 border border-gray-300 rounded-sm
                 hover:bg-gray-50 transition-colors focus:outline-none"
        >
          {{ t('purpose.modal.cancel') }}
        </button>
        <button 
          type="submit"
          form="formTambahTujuan"
          class="px-5 py-2.5 text-sm font-medium text-white 
                 bg-[#F7941D] rounded-sm
                 hover:bg-[#E8850E] transition-colors focus:outline-none"
          :disabled="isLoading"
        >
          {{ isLoading ? t('purpose.modal.saving') : t('purpose.modal.save') }}
        </button>
      </div>
    </template>
  </Modal>
  
  <Toast 
    :show="showToast"
    :message="toastMessage"
    @close="handleCloseToast"
  />
</template>

<style scoped>
button:focus, select:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>