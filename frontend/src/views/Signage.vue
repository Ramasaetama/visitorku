<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Topbar from '@/components/Topbar.vue';
import Sidebar from '@/components/Sidebar.vue';
import DataTable from '@/components/common/DataTable.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import Toast from '@/components/common/Toast.vue';
import Pagination from '@/components/common/Pagination.vue'; // 🌟 Import Pagination
import { confirmDelete, showSuccess, showError } from '@/utils/alertHelper';
import {
  getAllSignages,
  deleteSignage,
} from '@/services/signageService';

const router = useRouter();

// ─── State ───────────────────────────────────────────────────────────────────
const signageData    = ref([]);
const isLoading      = ref(false);
const searchQuery    = ref('');
const appliedSearch  = ref('');
const perPage        = ref(10);
const currentPage    = ref(1);
const totalRecords   = ref(0);

// ─── Dropdown State ──────────────────────────────────────────────────────────
const activeDropdown = ref(null);

const toggleDropdown = (id) => {
  if (activeDropdown.value === id) {
    activeDropdown.value = null;
  } else {
    activeDropdown.value = id;
  }
};

// ─── Kolom Tabel ─────────────────────────────────────────────────────────────
const tableColumns = [
  { key: 'name',  label: 'Name',   sortable: true },
  { key: 'url',   label: 'URL',    sortable: true },
  { key: 'aksi',  label: 'Action', sortable: false },
];

// ─── Sorting ─────────────────────────────────────────────────────────────────
const sortKey   = ref('name');
const sortOrder = ref('asc');

const handleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value   = key;
    sortOrder.value = 'asc';
  }
};

// ─── Filtered & Sorted Data ──────────────────────────────────────────────────
// Catatan: Signage API sepertinya mengembalikan semua data tanpa backend pagination, 
// jadi filter dan sort dilakukan di Frontend.
const filteredData = computed(() => {
  if (!appliedSearch.value) return signageData.value;
  const keyword = appliedSearch.value.toLowerCase();
  return signageData.value.filter(s =>
    (s.name && s.name.toLowerCase().includes(keyword)) ||
    (s.url  && s.url.toLowerCase().includes(keyword))
  );
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

// ─── Paginated Data (Frontend slice) ──────────────────────────────────────────
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return sortedData.value.slice(start, start + perPage.value);
});

// Update total record setiap kali filter berubah
watch(filteredData, (newVal) => {
  totalRecords.value = newVal.length;
  // Jika page saat ini melebih batas page setelah filter, kembalikan ke page 1
  const maxPage = Math.max(1, Math.ceil(newVal.length / perPage.value));
  if (currentPage.value > maxPage) {
    currentPage.value = 1;
  }
});


// ─── Fetch Data ───────────────────────────────────────────────────────────────
const fetchSignages = async () => {
  isLoading.value = true;
  try {
    const response = await getAllSignages({ page: 1, size: 1000 }); // Ambil semua
    const res   = response.data || response;
    const items = Array.isArray(res) ? res : (res.data || res.items || []);
    
    signageData.value = items.map(s => ({
      id:   s.id,
      name: s.name ?? '-',
      url:  s.url  ?? s.link ?? '-',
      raw:  s,
    }));
    
    totalRecords.value = signageData.value.length;
  } catch (err) {
    console.error('Gagal memuat data signage:', err);
    signageData.value  = [];
    totalRecords.value = 0;
  } finally {
    isLoading.value = false;
  }
};

// ─── Search & Watchers ────────────────────────────────────────────────────────
const executeSearch = () => {
  appliedSearch.value = searchQuery.value;
  currentPage.value   = 1;
};

watch(searchQuery, (val) => {
  if (val === '') executeSearch();
});

watch(perPage, () => { 
  currentPage.value = 1; 
});

// ─── Create / Edit ───────────────────────────────────────────────────────────
const handleCreateNew = () => {
  router.push('/layar-informasi/create');
};

const handleEdit = (row) => {
  router.push(`/layar-informasi/create?edit=${row.id}`);
  activeDropdown.value = null;
};

// ─── Delete ───────────────────────────────────────────────────────────────────
const handleDelete = async (row) => {
  const confirmed = await confirmDelete('Signage');
  if (!confirmed) return;
  try {
    await deleteSignage(row.id);
    showSuccess('Signage berhasil dihapus.');
    await fetchSignages();
  } catch (err) {
    showError(err.response?.data?.message || 'Gagal menghapus signage.');
  }
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const showToast    = ref(false);
const toastMessage = ref('');
const handleCloseToast = () => { showToast.value = false; };

onMounted(fetchSignages);
</script>

<template>
  <main class="bg-white rounded-2xl shadow-sm h-full min-h-[calc(100vh-7rem)] flex flex-col relative w-full">
    <div class="p-6 flex-1 flex flex-col">

      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 mb-1">Signage</h1>
          <p class="text-sm text-gray-500">Kelola dan pantau seluruh data signage yang ada.</p>
        </div>  
        <button
          @click="handleCreateNew"
          class="flex items-center gap-2 px-5 py-2 bg-white border-2 border-[#F7941D]
                 text-[#F7941D] text-sm font-medium rounded-lg
                 hover:bg-[#F7941D] hover:text-white active:scale-95 transition-all"
        >
          <span class="text-lg leading-none">+</span>
          Create New Signage
        </button>              
      </div>

      <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-start gap-4">
        <div class="w-full sm:max-w-md">
          <SearchInput 
            v-model="searchQuery" 
            placeholder="Cari Signage" 
            @keyup.enter="executeSearch"  
          />
        </div>

        <div class="relative shrink-0">
          <select 
            v-model="perPage" 
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

        <div class="flex-1" />
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
          <template #url="{ row }">
            <a 
              :href="row.url" 
              target="_blank" 
              class="text-black hover:underline"
            >
              {{ row.url }}
            </a>
          </template>

          <template #aksi="{ row }">
            <div class="flex items-center gap-2 relative">
              
              <button 
                @click.stop="toggleDropdown(row.id)"
                class="w-[30px] h-[30px] rounded border border-[#F7941D] flex items-center justify-center text-[#F7941D] hover:bg-[#FEF4E3] transition-colors focus:outline-none relative z-10"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>

              <div v-if="activeDropdown === row.id" @click="activeDropdown = null" class="fixed inset-0 z-40"></div>
              
              <div 
                v-if="activeDropdown === row.id" 
                class="absolute top-[110%] left-0 w-36 bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100 py-1.5 z-50"
              >
                <button @click="handleEdit(row)" class="w-full text-left px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-[#FEF4E3] hover:text-[#F7941D] focus:outline-none">
                  Edit Data
                </button>
              </div>

              <button 
                @click="handleDelete(row)"
                class="w-[30px] h-[30px] rounded bg-[#E45454] flex items-center justify-center text-white hover:bg-[#D24A4A] transition-colors focus:outline-none relative z-10"
              >
                <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path>
                </svg>
              </button>

            </div>
          </template>

          <template #empty>
            <div class="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg class="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <p class="text-sm font-medium text-gray-500">No Records to display</p>
            </div>
          </template>
        </DataTable>
      </div>

    </div>

    <Pagination
      v-model:current-page="currentPage"
      :total-data="totalRecords"
      :per-page="perPage"
    />

  </main>

  <Toast
    :show="showToast"
    :message="toastMessage"
    @close="handleCloseToast"
  />
</template>