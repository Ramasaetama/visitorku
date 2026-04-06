<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import Topbar from '@/components/Topbar.vue';
import Sidebar from '@/components/Sidebar.vue';

import EmptyState from '@/components/common/EmptyState.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import DataTable from '@/components/common/DataTable.vue';
import notfound from '@/assets/notfound.svg';

import { getVisitor } from '@/services/visitorService'; // Hanya panggil getVisitor untuk list utama

// ==========================================
// 1. STATE & SEARCH
// ==========================================
const visitorData = ref([]); // State utama penyimpan data API
const searchQuery = ref('');
const appliedSearchQuery = ref('');
const isLoading = ref(false);

const executeSearch = () => {
  appliedSearchQuery.value = searchQuery.value;
};

watch(searchQuery, (nilaiBaru) => {
  if (nilaiBaru === '') {
    executeSearch(); 
  }
});

// ==========================================
// 2. DEFINISI KOLOM TABEL VISITOR
// ==========================================
const tableColumns = [
  { key: 'nama', label: 'Nama', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'telepon', label: 'No Telepon', sortable: false },
  { key: 'total_kunjungan', label: 'Total Kunjungan', sortable: true },
  { key: 'kunjungan_terakhir', label: 'Kunjungan Terakhir', sortable: true },
  { key: 'aksi', label: 'Aksi', sortable: false },
];

// ==========================================
// 3. FETCHING DATA DARI API
// ==========================================
const fetchVisitors = async () => {
  isLoading.value = true;
  try {
    const response = await getVisitor(); 
    
    // Asumsi: Struktur API Anda mengembalikan data di dalam response.data.data atau response.data
    const items = response?.data?.data || response?.data || response;
    
    // Pemetaan (Mapping) Data API ke kolom tabel
    // Sesuaikan keys (name, email, phone, dll) dengan struktur JSON Swagger Anda
    if (Array.isArray(items)) {
      visitorData.value = items.map((visitor) => ({
        id: visitor.id || '-',
        nama: visitor.name || visitor.nama || '-', // Coba 'name' lalu 'nama'
        email: visitor.email || '-',
        telepon: visitor.phone_number || visitor.phone_number || '-',
        total_kunjungan: visitor.total_visit || visitor.total_kunjungan || 0,
        kunjungan_terakhir: visitor.last_visit || visitor.kunjungan_terakhir || '-',
      }));
    } else {
      console.warn("Format data dari API tidak sesuai ekspektasi (bukan Array).");
      visitorData.value = [];
    }

  } catch (error) {
    console.error("Gagal memuat data pengunjung:", error);
    visitorData.value = [];
  } finally {
    isLoading.value = false;
  }
};

// FILTERING & SORTING LOGIC
const filteredData = computed(() => {
  if (!appliedSearchQuery.value) {
    return visitorData.value;
  }
  const keyword = appliedSearchQuery.value.toLowerCase();
  return visitorData.value.filter(item => {
    return (
      (item.nama && item.nama.toLowerCase().includes(keyword)) ||
      (item.email && item.email.toLowerCase().includes(keyword)) ||
      (item.telepon && item.telepon.toLowerCase().includes(keyword))
    );
  });
});

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
  if (!sortKey.value) return filteredData.value; 

  return [...filteredData.value].sort((a, b) => { 
    const valA = a[sortKey.value] ?? '';
    const valB = b[sortKey.value] ?? '';
    
    // Logika sorting khusus angka (Total Kunjungan)
    if (sortKey.value === 'total_kunjungan') {
       return sortOrder.value === 'asc' ? valA - valB : valB - valA;
    }

    // Default sorting untuk teks (String)
    const cmp = String(valA).localeCompare(String(valB), 'id', { sensitivity: 'base' });
    return sortOrder.value === 'asc' ? cmp : -cmp;
  });
});

const handleReport = () => {
  console.log("Tombol Report diklik!");
};

// Panggil fungsi API saat halaman dimuat
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
                <svg class="w-5 h-5 text-[#38CA99] group-hover:text-white transition-colors" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                  <line x1="8" y1="15" x2="8" y2="12" />
                  <line x1="12" y1="15" x2="12" y2="9" />
                  <line x1="16" y1="15" x2="16" y2="13" />
                </svg>
                Report
              </button>
              </div>
            
            <div class="mb-6 max-w-md">
              <SearchInput 
                v-model="searchQuery" 
                placeholder="Cari Visitor" 
                @keyup.enter="executeSearch"  />
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
                      @click="console.log('Lihat Detail', row)"
                      class="w-[34px] h-[34px] rounded-[10px] bg-[#D9E2FF] flex items-center justify-center text-[#4075FF] hover:bg-[#B3C6FF] transition-colors focus:outline-none"
                      title="Lihat Detail"
                    >
                      <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <path d="M2 12c0 0 4-8 10-8s10 8 10 8-4 8-10 8-10-8-10-8z"></path>
                        <circle cx="12" cy="12" r="3.5"></circle>
                      </svg>
                    </button>

                    <button 
                      @click="console.log('Edit Data', row)"
                      class="w-[34px] h-[34px] rounded-[10px] bg-[#FEF4E3] flex items-center justify-center text-[#F7941D] hover:bg-[#F7941D] hover:text-white transition-colors focus:outline-none"
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
          
          <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
            <span>Menampilkan data visitor</span>
            </div>
        </div> 
      </main>
    </div>
  </div>
</template>

<style scoped>
button:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>