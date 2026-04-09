<script setup>
import Sidebar from '@/components/Sidebar.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import DataTable from '@/components/common/DataTable.vue';
import Modal from '@/components/common/Modal.vue';
import Toast from '@/components/common/Toast.vue';
import FormTambahTujuan from '@/components/cabang/FormTambahTujuan.vue';
import notfound from '@/assets/notfound.svg';
import Topbar from '@/components/Topbar.vue';

import { ref, onMounted, computed, watch } from 'vue';
import { confirmDelete, showSuccess, showError } from '@/utils/alertHelper'; 
import { getCategories, getBranches, createCategory, updateCategory, deleteCategory } from '@/services/tujuanService';

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
  { key: 'divisi', label: 'Nama Divisi / Ruangan', sortable: true },
  { key: 'pic', label: 'Nama PIC', sortable: true },
  { key: 'jabatan', label: 'Jabatan', sortable: true },
  { key: 'cabang', label: 'Cabang', sortable: true },
  { key: 'aksi', label: 'Aksi', sortable: false },
];

const isLoading = ref(false);
const showModal = ref(false);
const showToast = ref(false);
const toastMessage = ref(''); 

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

// LOGIKA PAGINATION DINAMIS
const totalItems = computed(() => filteredData.value.length);
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

const handleTambahTujuan = () => {
  isEditMode.value = false;
  editId.value = null;
  selectedData.value = null; 
  showModal.value = true;
};

const handleEditTujuan = (row) => {
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
  const isConfirmed = await confirmDelete(`Tujuan Kunjungan untuk PIC: ${row.pic}`);

  if (isConfirmed) {
    try {
      isLoading.value = true;
      await deleteCategory(row.id);
      showSuccess('Tujuan Kunjungan berhasil dihapus!');
      fetchDataTujuan();
    } catch (error) {
      console.error('Gagal menghapus data:', error);
      showError(error.response?.data?.message || 'Terjadi kesalahan saat menghapus data.');
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
      toastMessage.value = 'Tujuan Kunjungan berhasil diperbarui!';
    } else {
      await createCategory(payloadCategory);
      toastMessage.value = 'Tujuan Kunjungan berhasil ditambahkan!';
    }

    showModal.value = false;
    showToast.value = true; 
    
    fetchDataTujuan(); 

  } catch (error) {
    console.log('Detail Penolakan Backend:', error.response?.data);
    toastMessage.value = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.';
    showToast.value = true;
  } finally {
    isLoading.value = false; 
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
                <h1 class="text-2xl font-semibold text-gray-800 mb-1">Tujuan Kunjungan</h1>
                <p class="text-sm text-gray-500">Kelola daftar divisi dan penanggung jawab yang dapat dipilih oleh pengunjung.</p>
              </div>
              
              <button 
                @click="handleTambahTujuan"
                class="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#F7941D] 
                       text-[#F7941D] rounded-lg font-medium text-sm 
                       hover:bg-[#F7941D] hover:text-white transition-all focus:outline-none"
              >
                <span class="text-lg leading-none">+</span>
                Tambah Tujuan
              </button>
            </div>
            
            <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-start gap-4">
              <div class="w-full sm:max-w-md flex-1">
                <SearchInput 
                  v-model="searchQuery" 
                  placeholder="Cari berdasarkan nama PIC/Divisi" 
                  @keyup.enter="executeSearch" />
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
              
              <button 
                class="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-300 
                       text-gray-600 rounded-lg font-medium text-[13px] 
                       hover:bg-gray-50 transition-all focus:outline-none"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                </svg>
                Filter lainnya
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
                      @click="handleEditTujuan(row)"
                      class="w-[30px] h-[30px] rounded border border-[#F7941D] flex items-center justify-center text-[#F7941D] hover:bg-[#FEF4E3] transition-colors focus:outline-none relative z-10"
                      title="Edit Data"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>

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
                    title="Tujuan Belum Tersedia"
                    description="Tambahkan tujuan terlebih dahulu untuk memulai tujuan kunjungan."
                    buttonText="Tambah Tujuan"
                    @action="handleTambahTujuan"
                  />
                  <EmptyState 
                    v-else
                    :icon="notfound"
                    title="No Records to display"
                    :description="`Tidak ada tujuan kunjungan yang cocok dengan kata kunci '${appliedSearchQuery}'`"
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
      :title="isEditMode ? 'Edit Tujuan Kunjungan' : 'Tambah Tujuan Kunjungan'"
      :description="isEditMode ? 'Ubah informasi divisi dan penanggung jawab.' : 'Masukan informasi divisi dan penanggung jawab yang dapat dipilih oleh pengunjung.'"
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
                   border border-gray-300 rounded-lg
                   hover:bg-gray-50 transition-colors focus:outline-none"
          >
            Batal
          </button>
          <button 
            type="submit"
            form="formTambahTujuan"
            class="px-5 py-2.5 text-sm font-medium text-white 
                   bg-[#F7941D] rounded-lg
                   hover:bg-[#E8850E] transition-colors focus:outline-none"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Menyimpan...' : 'Simpan Tujuan' }}
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