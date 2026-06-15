<script setup>
import Sidebar from '@/components/Sidebar.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import DataTable from '@/components/common/DataTable.vue';
import Modal from '@/components/common/Modal.vue';
import Toast from '@/components/common/Toast.vue';
import FormTambahCabang from '@/components/cabang/FormTambahCabang.vue';
import Pagination from '@/components/common/Pagination.vue'; 
import notfound from '@/assets/notfound.svg';
import Topbar from '@/components/Topbar.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

// 🌟 FIX: Import nextTick ditambahkan di sini
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { confirmDelete, showSuccess, showError } from '@/utils/alertHelper';
import { getAllBranches, createBranch, updateBranch, deleteBranch } from '@/services/cabangService';

const searchQuery = ref('');
const cabangData = ref([]);
const appliedSearchQuery = ref('');

// PAGINATION STATE
const currentPage = ref(1);
const itemsPerPage = ref(10); 

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

// ─── Dropdown State & Logic ───
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

const tableColumns = [
  { key: 'nama', label: t('branch.table.name'), sortable: true },
  { key: 'alamat', label: t('branch.table.address'), sortable: true },
  { key: 'kontak', label: t('branch.table.contact'), sortable: false },
  { key: 'aksi', label: t('branch.table.action'), sortable: false },
];

const filteredCabangData = computed(() => {
  if (!appliedSearchQuery.value) return cabangData.value;
  const keyword = appliedSearchQuery.value.toLowerCase();
  return cabangData.value.filter(cabang => {
    return (
      (cabang.nama && cabang.nama.toLowerCase().includes(keyword)) ||
      (cabang.alamat && cabang.alamat.toLowerCase().includes(keyword)) ||
      (cabang.kontak && cabang.kontak.toLowerCase().includes(keyword))
    );
  });
});

const isLoading = ref(false);
const toastMessage = ref('Cabang berhasil ditambahkan');
const showToast = ref(false);

const fetchBranches = async () => {
  isLoading.value = true;
  try {
    const response = await getAllBranches({ page: 1, size: 100 });
    const items = response.data || response;
    cabangData.value = (Array.isArray(items) ? items : []).map(branch => ({
      id: branch.id,
      nama: branch.name,
      alamat: branch.address,
      kontak: branch.contact,
    }));
  } catch (error) {
    console.error('Gagal memuat data cabang:', error);
    toastMessage.value = t('branch.error.loadFailed');
    showToast.value = true;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchBranches();
  window.addEventListener('scroll', closeDropdown, true);
});

onUnmounted(() => {
  window.removeEventListener('scroll', closeDropdown, true);
});

const showModal = ref(false);
const editingBranch = ref(null); 

const handleTambahCabang = () => {
  closeDropdown();
  editingBranch.value = null;
  showModal.value = true;
};

const handleCloseModal = () => {
  editingBranch.value = null;
  showModal.value = false;
};

const handleSubmitCabang = async (formData) => {
  try {
    if (editingBranch.value) {
      await updateBranch(editingBranch.value.id, {
        name: formData.namaCabang,
        address: formData.alamatCabang,
        contact: formData.kontakCabang,
      });
      toastMessage.value = t('branch.success.updated');
    } else {
      await createBranch({
        name: formData.namaCabang,
        address: formData.alamatCabang,
        contact: formData.kontakCabang,
      });
      toastMessage.value = t('branch.success.added');
    }

    showModal.value = false;
    editingBranch.value = null;
    showToast.value = true;

    await fetchBranches();
  } catch (error) {
    console.error('Gagal menyimpan cabang:', error);
    const backendMessage = error.response?.data?.message || error.response?.data?.error;
    toastMessage.value = backendMessage || (editingBranch.value ? t('branch.error.updateFailed') : t('branch.error.addFailed'));
    showToast.value = true;
  }
};

const handleCloseToast = () => {
  showToast.value = false;
};

const sortKey = ref('');
const sortOrder = ref('asc');

const handleSort = (columnKey) => {
  if (sortKey.value === columnKey) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = columnKey;
    sortOrder.value = 'asc';
  }
};

const sortedData = computed(() => {
  if (!sortKey.value) return filteredCabangData.value; 

  return [...filteredCabangData.value].sort((a, b) => { 
    const valA = a[sortKey.value] ?? '';
    const valB = b[sortKey.value] ?? '';
    const cmp = String(valA).localeCompare(String(valB), 'id', { sensitivity: 'base' });
    return sortOrder.value === 'asc' ? cmp : -cmp;
  });
});

// LOGIKA PAGINATION FRONTEND SLICE
const totalItems = computed(() => filteredCabangData.value.length);
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedData.value.slice(start, end);
});

const handleEditCabang = (row) => {
  closeDropdown();
  editingBranch.value = {
    id: row.id,
    namaCabang: row.nama,
    alamatCabang: row.alamat,
    kontakCabang: row.kontak,
  };
  showModal.value = true;
};

const handleDeleteCabang = async (row) => {
  closeDropdown();
  const isConfirmed = await confirmDelete('Cabang Perusahaan');

  if (isConfirmed) {
    try {
      await deleteBranch(row.id); 
      showSuccess(t('branch.success.deleted'));
      await fetchBranches(); 
    } catch (error) {
      showError(error.response?.data?.message || t('branch.error.deleteFailed'));
    }
  }
};
</script>

<template>
  <div class="flex-1 w-full h-full flex flex-col">
  <div class="bg-white rounded-2xl shadow-sm h-full min-h-[calc(100vh-7rem)] flex flex-col relative w-full">
    
    <div class="p-6 flex-1 flex flex-col">
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 mb-1">{{ t('branch.title') }}</h1>
          <p class="text-sm text-gray-500">{{ t('branch.subtitle') }}</p>
        </div>
        
        <button 
          @click="handleTambahCabang"
          class="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#F7941D] 
                 text-[#F7941D] rounded-sm font-medium text-sm 
                 hover:bg-[#F7941D] hover:text-white transition-all focus:outline-none"
        >
          <span class="text-lg leading-none">+</span>
          {{ t('branch.addBtn') }}
        </button>
      </div>
      
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-start gap-4">
        <div class="w-full sm:max-w-md">
          <SearchInput 
            v-model="searchQuery" 
            v-model:perPage="ItemsPerPage"
            :placeholder="t('branch.searchPlaceholder')" 
            @keyup.enter="executeSearch"  
          />
        </div>
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
                @click.stop="toggleDropdown(row.id, $event)"
                class="w-[30px] h-[30px] rounded border border-[#F7941D] flex items-center justify-center text-[#F7941D] hover:bg-[#FEF4E3] transition-colors focus:outline-none"
                title="Opsi"
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
                    @click="handleEditCabang(row)" 
                    class="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-[#FEF4E3] hover:text-[#F7941D] focus:outline-none transition-colors"
                  >
                    Edit Data
                  </button>
                </div>
              </Teleport>

              <button 
                @click="handleDeleteCabang(row)"
                class="w-[30px] h-[30px] rounded bg-[#E45454] flex items-center justify-center text-white hover:bg-[#D24A4A] transition-colors focus:outline-none relative z-10"
                title="Hapus Cabang"
              >
                <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path>
                </svg>
              </button>
              
            </div>
          </template>

          <template #empty>
            <EmptyState 
              v-if="cabangData.length === 0"
              :icon="notfound"
              :title="t('branch.empty.noData')"
              :description="t('branch.empty.noDataDesc')"
              :buttonText="t('branch.empty.noDataBtn')"
              @action="handleTambahCabang"
            />
            <EmptyState 
              v-else
              :icon="notfound"
              :title="t('branch.empty.notFound')"
              :description="`${t('branch.empty.notFoundDesc')} '${appliedSearchQuery}'`"
            />
          </template>
        </DataTable>
      </div>
    </div>
    
    <div class="mt-auto">
      <Pagination
        v-model:current-page="currentPage"
        :total-data="totalItems"
        :per-page="itemsPerPage"
      />
    </div>

  </div> 

  <Modal 
    :show="showModal"
    :title="editingBranch ? t('branch.modal.editTitle') : t('branch.modal.addTitle')"
    :description="editingBranch ? t('branch.modal.editDesc') : t('branch.modal.addDesc')"
    width="half"
    @close="handleCloseModal"
  >
    <FormTambahCabang 
      :initialData="editingBranch"
      @submit="handleSubmitCabang"
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
          {{ t('branch.modal.cancel') }}
        </button>
        <button 
          type="submit"
          form="formTambahCabang"
          class="px-5 py-2.5 text-sm font-medium text-white 
                 bg-[#F7941D] rounded-sm
                 hover:bg-[#E8850E] transition-colors focus:outline-none"
        >
          {{ editingBranch ? t('branch.modal.update') : t('branch.modal.save') }}
        </button>
      </div>
    </template>
  </Modal>
  
  <Toast 
    :show="showToast"
    :message="toastMessage"
    @close="handleCloseToast"
  />
  </div>
</template>

<style scoped>
button:focus, select:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>