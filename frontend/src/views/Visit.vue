<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import Topbar from '@/components/Topbar.vue';
import Sidebar from '@/components/Sidebar.vue';
import DataTable from '@/components/common/DataTable.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import { getAllVisits, exportVisitReport } from '@/services/visitService';

// ─── State ───────────────────────────────────────────────────────────────────
const visitData     = ref([]);
const isLoading     = ref(false);
const searchQuery   = ref('');
const appliedSearch = ref('');
const perPage       = ref(10);
const currentPage   = ref(1);
const totalRecords  = ref(0);

// ─── Kolom Tabel ─────────────────────────────────────────────────────────────
const tableColumns = [
  { key: 'name',      label: 'NAME',      sortable: true  },
  { key: 'purpose',   label: 'PURPOSE',   sortable: true  },
  { key: 'check_in',  label: 'CHECK IN',  sortable: true  },
  { key: 'check_out', label: 'CHECK OUT', sortable: false },
  { key: 'face',      label: 'FACE',      sortable: false },
];

// ─── Sorting ─────────────────────────────────────────────────────────────────
const sortKey   = ref('check_in');
const sortOrder = ref('desc');

const handleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value   = key;
    sortOrder.value = 'asc';
  }
  currentPage.value = 1;
  fetchVisits();
};

// ─── Fetch Data ───────────────────────────────────────────────────────────────
const fetchVisits = async () => {
  isLoading.value = true;
  try {
    const params = {
      page:    currentPage.value,
      size:    perPage.value,
      search:  appliedSearch.value || undefined,
      sort:    sortKey.value || undefined,
      order:   sortOrder.value,
    };
    const response = await getAllVisits(params);
    const res = response.data || response;

    // Normalisasi data dari API
    const items = Array.isArray(res) ? res : (res.data || res.items || []);
    totalRecords.value = res.total ?? res.totalData ?? items.length;

    visitData.value = items.map(v => ({
      id:        v.id,
      name:      v.visitor_name  ?? v.name       ?? '-',
      purpose:   v.purpose_name  ?? v.purpose     ?? '-',
      check_in:  formatDateTime(v.check_in  ?? v.checkin  ?? v.created_at),
      check_out: formatDateTime(v.check_out ?? v.checkout ?? null),
      face:      v.face_image    ?? v.photo       ?? null,
      raw:       v,
    }));
  } catch (err) {
    console.error('Gagal memuat data visit:', err);
    visitData.value  = [];
    totalRecords.value = 0;
  } finally {
    isLoading.value = false;
  }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDateTime = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalRecords.value / perPage.value))
);

const showingFrom = computed(() => {
  if (totalRecords.value === 0) return 0;
  return (currentPage.value - 1) * perPage.value + 1;
});

const showingTo = computed(() =>
  Math.min(currentPage.value * perPage.value, totalRecords.value)
);

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchVisits();
};

// ─── Search ───────────────────────────────────────────────────────────────────
const executeSearch = () => {
  appliedSearch.value = searchQuery.value;
  currentPage.value = 1;
  fetchVisits();
};

watch(searchQuery, (val) => {
  if (val === '') {
    appliedSearch.value = '';
    currentPage.value   = 1;
    fetchVisits();
  }
});

watch(perPage, () => {
  currentPage.value = 1;
  fetchVisits();
});

// ─── Report Export ────────────────────────────────────────────────────────────
const isExporting = ref(false);
const handleReport = async () => {
  isExporting.value = true;
  try {
    const response = await exportVisitReport({ search: appliedSearch.value || undefined });
    const url  = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href  = url;
    link.setAttribute('download', `visit-report-${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Gagal mengunduh laporan:', err);
  } finally {
    isExporting.value = false;
  }
};

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(fetchVisits);
</script>

<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    <Topbar />

    <div class="flex flex-1 items-stretch">
      <Sidebar />

      <main class="flex-1 bg-[#F4F6F8] p-4">
        <div class="bg-white rounded-2xl shadow-sm h-full flex flex-col">
          <div class="p-6 flex-1 flex flex-col">

            <!-- ── Header ── -->
            <div class="flex items-center justify-between mb-4">
              <!-- Judul -->
              <h1 class="text-xl font-semibold text-gray-800">Visit</h1>

              <!-- Breadcrumb -->
              <nav class="flex items-center gap-1.5 text-sm text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                <span>Dashboard</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
                <span class="text-[#F7941D] font-medium">Visit</span>
              </nav>
            </div>

            <!-- ── Toolbar: Search + Per-Page + Report ── -->
            <div class="flex items-center gap-3 mb-4">
              <!-- Search -->
              <SearchInput
                v-model="searchQuery"
                placeholder="Search"
                class="w-80"
                input-class="rounded-sm"
                @keyup.enter="executeSearch"
              />

              <!-- Per-page selector -->
              <select
                v-model="perPage"
                class="h-9 px-3 border border-gray-300 rounded- text-sm text-gray-600 
                       bg-white focus:outline-none focus:ring-2 focus:ring-[#F7941D]/30 
                       focus:border-[#F7941D] cursor-pointer"
              >
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>

              <!-- Spacer -->
              <div class="flex-1" />

              <!-- Tombol Report -->
              <button
                @click="handleReport"
                :disabled="isExporting"
                class="flex items-center gap-2 px-4 py-2 bg-white border border-[#36d41aff] 
                       text-[#36d41aff] text-sm font-medium rounded-lg 
                       hover:bg-[#FFF4E8] active:scale-95 transition-all
                       disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <!-- Ikon dokumen/laporan -->
                <svg v-if="!isExporting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <!-- Spinner saat loading -->
                <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Report
              </button>
            </div>

            <!-- ── DataTable ── -->
            <div class="flex-1 overflow-hidden">
              <DataTable
                :columns="tableColumns"
                :data="visitData"
                :loading="isLoading"
                :sort-key="sortKey"
                :sort-order="sortOrder"
                @sort="handleSort"
              >
                <!-- Custom body slot agar kolom FACE bisa render gambar -->
                <template #body="{ data }">
                  <tr
                    v-for="(row, idx) in data"
                    :key="row.id ?? idx"
                    class="hover:bg-orange-50/40 transition-colors"
                  >
                    <!-- NAME -->
                    <td class="px-4 py-3 text-sm text-gray-700 border-b border-[#EDEDED] font-medium">
                      {{ row.name }}
                    </td>
                    <!-- PURPOSE -->
                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-[#EDEDED]">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                               bg-orange-100 text-orange-700"
                      >
                        {{ row.purpose }}
                      </span>
                    </td>
                    <!-- CHECK IN -->
                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-[#EDEDED]">
                      {{ row.check_in }}
                    </td>
                    <!-- CHECK OUT -->
                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-[#EDEDED]">
                      <span v-if="row.check_out !== '-'" class="text-gray-600">{{ row.check_out }}</span>
                      <span v-else class="text-gray-300 italic text-xs">—</span>
                    </td>
                    <!-- FACE -->
                    <td class="px-4 py-3 text-sm border-b border-[#EDEDED]">
                      <img
                        v-if="row.face"
                        :src="row.face"
                        :alt="row.name"
                        class="w-9 h-9 rounded-full object-cover ring-2 ring-orange-200"
                      />
                      <div
                        v-else
                        class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
                        title="Tidak ada foto"
                      >
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                      </div>
                    </td>
                  </tr>
                </template>

                <!-- Empty State -->
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

          </div><!-- /p-6 -->

          <!-- ── Pagination Footer ── -->
          <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <!-- Info -->
            <span>
              Showing {{ showingFrom }} to {{ showingTo }} from {{ totalRecords }} records
            </span>

            <!-- Prev / Next -->
            <div class="flex items-center gap-1">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg
                       text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed 
                       transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage >= totalPages"
                class="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg
                       text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed 
                       transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>

        </div><!-- /bg-white card -->
      </main>
    </div>
  </div>
</template>
