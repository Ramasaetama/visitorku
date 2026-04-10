<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Topbar from '@/components/Topbar.vue';
import Sidebar from '@/components/Sidebar.vue';

import EmptyState from '@/components/common/EmptyState.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import DataTable from '@/components/common/DataTable.vue';
import notfound from '@/assets/notfound.svg';

import { getVisitor, updateVisitorNotes } from '@/services/visitorService';

const router = useRouter();

// STATE & SEARCH
const visitorData = ref([]); 
const searchQuery = ref('');
const appliedSearchQuery = ref('');
const isLoading = ref(false);

const executeSearch = () => {
  appliedSearchQuery.value = searchQuery.value;
  currentPage.value = 1; 
  fetchVisitors(); 
};

watch(searchQuery, (nilaiBaru) => {
  if (nilaiBaru === '') {
    executeSearch(); 
  }
});

// DEFINISI KOLOM TABEL VISITOR
const tableColumns = [
  { key: 'nama', label: 'Nama', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'telepon', label: 'No Telepon', sortable: false },
  { key: 'total_kunjungan', label: 'Total Kunjungan', sortable: true },
  { key: 'kunjungan_terakhir', label: 'Kunjungan Terakhir', sortable: true },
  { key: 'aksi', label: 'Aksi', sortable: false },
];

// PAGINATION
const currentPage = ref(1);
const itemsPerPage = ref(10); 
const totalItems = ref(0); 

watch(itemsPerPage, () => {
  currentPage.value = 1;
  fetchVisitors();
});

// FETCHING DATA API
const fetchVisitors = async () => {
  isLoading.value = true;
  try {
    const response = await getVisitor({ 
      page: currentPage.value, 
      size: itemsPerPage.value,
      search: appliedSearchQuery.value 
    }); 
    
    const respData = response?.data || response;
    
    if (respData.data && Array.isArray(respData.data)) {
      visitorData.value = respData.data.map((visitor) => ({
        id: visitor.id || '-',
        nama: visitor.name || '-', 
        email: visitor.email || '-',
        telepon: visitor.phone_number || '-', 
        total_kunjungan: parseInt(visitor.total_visit) || 0,
        kunjungan_terakhir: visitor.last_visit ? visitor.last_visit.split('T')[0] : '-',
        notes: visitor.notes || '' 
      }));
      
      totalItems.value = respData.total || 0; 
    } else {
      visitorData.value = [];
      totalItems.value = 0;
    }
  } catch (error) {
    console.error("Gagal memuat data pengunjung:", error);
    visitorData.value = [];
    totalItems.value = 0;
  } finally {
    isLoading.value = false;
  }
};

// SORTING LOGIC
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
  if (!sortKey.value) return visitorData.value; 

  return [...visitorData.value].sort((a, b) => { 
    const valA = a[sortKey.value] ?? '';
    const valB = b[sortKey.value] ?? '';
    
    if (sortKey.value === 'total_kunjungan') {
       return sortOrder.value === 'asc' ? valA - valB : valB - valA;
    }

    const cmp = String(valA).localeCompare(String(valB), 'id', { sensitivity: 'base' });
    return sortOrder.value === 'asc' ? cmp : -cmp;
  });
});

// PAGINATION UI 
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
const startIndex = computed(() => totalItems.value === 0 ? 0 : ((currentPage.value - 1) * itemsPerPage.value) + 1);
const endIndex = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalItems.value));

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
    fetchVisitors(); 
  }
};

// MODAL NOTES LOGIC

const showNotesModal = ref(false);
const selectedVisitor = ref(null);
const notesText = ref('');
const isSavingNotes = ref(false);

const openNotesModal = (row) => {
  selectedVisitor.value = row;
  notesText.value = row.notes || ''; 
  showNotesModal.value = true;
};

const closeNotesModal = () => {
  showNotesModal.value = false;
  setTimeout(() => {
    selectedVisitor.value = null;
    notesText.value = '';
  }, 200);
};

const saveNotes = async () => {
  if (!selectedVisitor.value) return;
  
  isSavingNotes.value = true;
  try {
    console.log("Mengirim ke ID:", selectedVisitor.value.id);
    console.log("Isi payload:", { notes: notesText.value });
    await updateVisitorNotes(selectedVisitor.value.id, { notes: notesText.value });
    
    const index = visitorData.value.findIndex(v => v.id === selectedVisitor.value.id);
    if (index !== -1) {
      visitorData.value[index].notes = notesText.value;
    }
    
    closeNotesModal();
  } catch (error) {
    console.error("Gagal menyimpan notes:", error);
    alert("Terjadi kesalahan saat menyimpan catatan.");
  } finally {
    isSavingNotes.value = false;
  }
};

// ACTIONS
const handleReport = () => {
  router.push('/report');
};

onMounted(() => {
  fetchVisitors();
});

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
                <h1 class="text-2xl font-semibold text-gray-800 mb-1">Daftar Visitor</h1>
                <p class="text-sm text-gray-500">Kelola dan pantau seluruh data pengunjung yang terdaftar.</p>
              </div>
              
              <button 
                @click="handleReport"
                class="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#38CA99] 
                       text-[#38CA99] rounded-lg font-medium text-sm 
                       hover:bg-[#38CA99] hover:text-white transition-all group focus:outline-none"
              >
                <svg class="w-5 h-5 text-[#38CA99] group-hover:text-white transition-colors" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                  <line x1="8" y1="15" x2="8" y2="12" />
                  <line x1="12" y1="15" x2="12" y2="9" />
                  <line x1="16" y1="15" x2="16" y2="13" />
                </svg>
                Report
              </button>
            </div>
            
            <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-start gap-4">
              <div class="w-full sm:max-w-md">
                <SearchInput 
                  v-model="searchQuery" 
                  placeholder="Cari Visitor" 
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
                :data="sortedData" 
                :loading="isLoading"
                :sort-key="sortKey"
                :sort-order="sortOrder"
                @sort="handleSort"
              >
                <template #aksi="{ row }">
                  <div class="flex items-center gap-2">
                    <button 
                      @click="$router.push(`/visitor/${row.id}`)"
                      class="w-[34px] h-[34px] rounded-[10px] bg-[#D9E2FF] flex items-center justify-center text-[#4075FF] hover:bg-[#B3C6FF] transition-colors"
                      style="outline: none !important; box-shadow: none !important; -webkit-tap-highlight-color: transparent;"
                      title="Lihat Detail"
                    >
                      <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <path d="M2 12c0 0 4-8 10-8s10 8 10 8-4 8-10 8-10-8-10-8z"></path>
                        <circle cx="12" cy="12" r="3.5"></circle>
                      </svg>
                    </button>

                    <button 
                      @click="openNotesModal(row)"
                      class="w-[34px] h-[34px] rounded-[10px] bg-[#FEF4E3] flex items-center justify-center text-[#F7941D] hover:bg-[#F7941D] hover:text-white transition-colors"
                      style="outline: none !important; box-shadow: none !important; -webkit-tap-highlight-color: transparent;"
                      title="Catatan"
                    >
                      <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <path d="M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"></path>
                        <path d="M20 4L12 12"></path>
                      </svg>
                    </button>
                  </div>
                </template>
                
                <template #empty>
                  <EmptyState 
                    v-if="visitorData.length === 0"
                    :icon="notfound"
                    title="Data Visitor Belum Tersedia"
                    description="Belum ada data visitor yang terekam di sistem."
                    :showButton="false"
                  />

                  <EmptyState 
                    v-else
                    :icon="notfound"
                    title="Pencarian Tidak Ditemukan"
                    :description="`Tidak ada visitor yang cocok dengan kata kunci '${appliedSearchQuery}'`"
                    :showButton="false"
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

    <div v-if="showNotesModal" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-[550px] p-6 mx-4 relative animate-fade-in-up">
        
        <button @click="closeNotesModal" class="absolute top-5 right-5 text-gray-800 hover:text-gray-500 transition-colors focus:outline-none">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <h2 class="text-xl font-bold text-gray-900 mb-6">Notes, {{ selectedVisitor?.nama }}</h2>

        <textarea
          v-model="notesText"
          rows="6"
          placeholder="Enter Address Here..."
          class="w-full border border-gray-300 rounded-lg p-3 text-gray-700 text-sm focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D] resize-none"
        ></textarea>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="closeNotesModal"
            class="px-6 py-2 border border-gray-300 rounded-lg text-gray-500 font-medium text-sm hover:bg-gray-50 transition-colors focus:outline-none"
          >
            Cancel
          </button>
          <button
            @click="saveNotes"
            :disabled="isSavingNotes"
            class="px-6 py-2 bg-[#F7941D] text-white rounded-lg font-medium text-sm hover:bg-[#E8850E] transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSavingNotes ? 'Loading...' : 'Submit' }}
          </button>
        </div>
        
      </div>
    </div>
    </div>
</template>

<style scoped>
button:focus {
  outline: none !important;
  box-shadow: none !important;
}

.animate-fade-in-up {
  animation: fadeInUp 0.2s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>