<script setup>
import Sidebar from '@/components/Sidebar.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import DataTable from '@/components/common/DataTable.vue';
import Modal from '@/components/common/Modal.vue';
import Toast from '@/components/common/Toast.vue';
import FormTambahCabang from '@/components/cabang/FormTambahCabang.vue';
import notfound from '@/assets/notfound.svg';
import Topbar from '@/components/Topbar.vue';

import { ref, onMounted, computed, watch } from 'vue';
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
  currentPage.value = 1; // Reset halaman saat mencari
};

watch(searchQuery, (nilaiBaru) => {
  if (nilaiBaru === '') {
    executeSearch(); 
  }
});

watch(itemsPerPage, () => {
  currentPage.value = 1;
});

const tableColumns = [
  { key: 'nama', label: 'Nama Cabang', sortable: true },
  { key: 'alamat', label: 'Alamat Cabang', sortable: true },
  { key: 'kontak', label: 'Kontak Cabang', sortable: false },
  { key: 'aksi', label: 'Aksi', sortable: false },
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
    toastMessage.value = 'Gagal memuat data cabang';
    showToast.value = true;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchBranches();
});

const showModal = ref(false);
const editingBranch = ref(null); 

const handleTambahCabang = () => {
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
      toastMessage.value = 'Cabang berhasil diperbarui';
    } else {
      await createBranch({
        name: formData.namaCabang,
        address: formData.alamatCabang,
        contact: formData.kontakCabang,
      });
      toastMessage.value = 'Cabang berhasil ditambahkan';
    }

    showModal.value = false;
    editingBranch.value = null;
    showToast.value = true;

    await fetchBranches();
  } catch (error) {
    console.error('Gagal menyimpan cabang:', error);
    const backendMessage = error.response?.data?.message || error.response?.data?.error;
    toastMessage.value = backendMessage || (editingBranch.value ? 'Gagal memperbarui cabang' : 'Gagal menambahkan cabang');
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

// LOGIKA PAGINATION DINAMIS
const totalItems = computed(() => filteredCabangData.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
const startIndex = computed(() => totalItems.value === 0 ? 0 : ((currentPage.value - 1) * itemsPerPage.value) + 1);
const endIndex = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalItems.value));

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedData.value.slice(start, end);
});

const visiblePages = computed(() => {
  const maxVisible = 5; 
  let start = Math.max(1, currentPage.value - 2);
  let end = start + maxVisible - 1;

  if (end > totalPages.value) {
    end = totalPages.value;
    start = Math.max(1, end - maxVisible + 1);
  }

  let pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
  }
};

const handleEditCabang = (row) => {
  editingBranch.value = {
    id: row.id,
    namaCabang: row.nama,
    alamatCabang: row.alamat,
    kontakCabang: row.kontak,
  };
  showModal.value = true;
};

const handleDeleteCabang = async (row) => {
  const isConfirmed = await confirmDelete('Cabang Perusahaan');

  if (isConfirmed) {
    try {
      await deleteBranch(row.id); 
      showSuccess('Cabang berhasil dihapus.');
      await fetchBranches(); 
    } catch (error) {
      showError(error.response?.data?.message || 'Gagal menghapus cabang.');
    }
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    <Topbar />
   
    <div class="flex flex-1 items-stretch">
      <Sidebar />
      <main class="flex-1 bg-[#F4F6F8] p-4">
        <div class="bg-white rounded-2xl shadow-sm h-full flex flex-col">
          <div class="p-6 flex-1 flex flex-col">
            <div class="flex items-start justify-between mb-6">
              <div>
                <h1 class="text-2xl font-semibold text-gray-800 mb-1">Cabang Perusahaan</h1>
                <p class="text-sm text-gray-500">Kelola lokasi atau unit kerja yang menerima pengunjung.</p>
              </div>
              
              <button 
                @click="handleTambahCabang"
                class="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#F7941D] 
                       text-[#F7941D] rounded-lg font-medium text-sm 
                       hover:bg-[#F7941D] hover:text-white transition-all"
              >
                <span class="text-lg leading-none">+</span>
                Tambah Cabang
              </button>
            </div>
            
            <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-start gap-4">
              <div class="w-full sm:max-w-md">
                <SearchInput 
                  v-model="searchQuery" 
                  placeholder="Cari Cabang" 
                  @keyup.enter="executeSearch"  
                />
              </div>

              <div class="relative shrink-0">
                <select 
                  v-model="itemsPerPage" 
                  class="appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-9 py-2 text-[13px] text-gray-400 font-medium focus:outline-none focus:border-gray-300 cursor-pointer w-[70px]"
                >
                  <option :value="5">5</option>
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
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
                      @click="handleEditCabang(row)"
                      class="w-[30px] h-[30px] rounded border border-[#F7941D] flex items-center justify-center text-[#F7941D] hover:bg-[#FEF4E3] transition-colors focus:outline-none relative z-10"
                      title="Edit Cabang"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>

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
                    title="Data Cabang Belum Tersedia"
                    description="Tambahkan minimal satu cabang agar sistem dapat digunakan."
                    buttonText="Tambah Cabang"
                    @action="handleTambahCabang"
                  />
                  <EmptyState 
                    v-else
                    :icon="notfound"
                    title="No Records to display"
                    :description="`Tidak ada cabang yang cocok dengan kata kunci '${appliedSearchQuery}'`"
                  />
                </template>
              </DataTable>
            </div>
            
          </div>
          
          <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-[13px] text-[#64748B]">
            <span>Showing {{ startIndex }} to {{ endIndex }} from {{ totalItems }} records</span>
            
            <div v-if="totalPages > 0" class="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
              <button 
                @click="goToPage(currentPage - 1)" 
                :disabled="currentPage === 1"
                class="px-3 py-1.5 border-r border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-500 focus:outline-none"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              
              <button 
                v-for="page in visiblePages" 
                :key="page"
                @click="goToPage(page)"
                class="px-3.5 py-1.5 border-r border-gray-300 transition-colors focus:outline-none"
                :class="currentPage === page ? 'bg-[#FEF4E3] text-[#F7941D] font-medium' : 'text-[#64748B] hover:bg-gray-50'"
              >
                {{ page }}
              </button>

              <button 
                @click="goToPage(currentPage + 1)" 
                :disabled="currentPage === totalPages"
                class="px-3 py-1.5 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-500 focus:outline-none"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>

        </div> 
      </main>
    </div>
    
    <Modal 
      :show="showModal"
      :title="editingBranch ? 'Edit Cabang' : 'Tambah Cabang'"
      :description="editingBranch ? 'Ubah informasi cabang.' : 'Masukan informasi cabang yang akan menerima pengunjung.'"
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
                   border border-gray-300 rounded-lg
                   hover:bg-gray-50 transition-colors focus:outline-none"
          >
            Batal
          </button>
          <button 
            type="submit"
            form="formTambahCabang"
            class="px-5 py-2.5 text-sm font-medium text-white 
                   bg-[#F7941D] rounded-lg
                   hover:bg-[#E8850E] transition-colors focus:outline-none"
          >
            {{ editingBranch ? 'Perbarui Cabang' : 'Simpan Cabang' }}
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