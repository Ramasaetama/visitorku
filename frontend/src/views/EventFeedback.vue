<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Topbar from '@/components/Topbar.vue';
import Sidebar from '@/components/Sidebar.vue';
import DataTable from '@/components/common/DataTable.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import { showError } from '@/utils/alertHelper';
import {
  getEventById,
  getEventFeedbackList,
  getEventSatisfaction,
  downloadEventFeedbackExcel,
} from '@/services/eventService';

const route  = useRoute();
const router = useRouter();
const eventId = computed(() => route.params.id);

// ─── Event Info ───────────────────────────────────────────────────────────────
const eventInfo        = ref(null);
const satisfactionData = ref(null);

// ─── State ───────────────────────────────────────────────────────────────────
const feedbackData  = ref([]);
const isLoading     = ref(false);
const searchQuery   = ref('');
const appliedSearch = ref('');
const perPage       = ref(10);
const currentPage   = ref(1);
const totalRecords  = ref(0);

// ─── Kolom Tabel ─────────────────────────────────────────────────────────────
const tableColumns = [
  { key: 'name',         label: 'NAME',         sortable: true  },
  { key: 'notes',        label: 'NOTES',        sortable: false },
  { key: 'satisfaction', label: 'SATISFACTION', sortable: false },
  { key: 'aksi',         label: 'ACTION',       sortable: false },
];

// ─── Sorting ─────────────────────────────────────────────────────────────────
const sortKey   = ref('name');
const sortOrder = ref('asc');

// ─── Fetch Event Info ─────────────────────────────────────────────────────────
const fetchEventInfo = async () => {
  try {
    const res = await getEventById(eventId.value);
    eventInfo.value = res.data?.data ?? res.data ?? res;
  } catch (err) {
    console.error('Gagal memuat event info:', err);
  }
};

const fetchSatisfaction = async () => {
  try {
    const res = await getEventSatisfaction(eventId.value);
    satisfactionData.value = res.data?.data ?? res.data ?? res;
  } catch (err) {
    console.error('Gagal memuat satisfaction:', err);
  }
};

// ─── Fetch Feedback ───────────────────────────────────────────────────────────
const fetchFeedback = async () => {
  isLoading.value = true;
  try {
    const params = {
      page:   currentPage.value,
      size:   perPage.value,
      search: appliedSearch.value || undefined,
    };
    const response = await getEventFeedbackList(eventId.value, params);
    const res   = response.data || response;
    const items = Array.isArray(res) ? res : (res.data || res.items || []);
    totalRecords.value = res.total ?? res.totalData ?? items.length;

    feedbackData.value = items.map(f => ({
      id:           f.id,
      name:         f.name ?? f.visitor_name ?? '-',
      notes:        f.notes ?? f.feedback ?? '-',
      satisfaction: f.satisfaction,
      raw:          f,
    }));
  } catch (err) {
    console.error('Gagal memuat data feedback:', err);
    feedbackData.value  = [];
    totalRecords.value  = 0;
  } finally {
    isLoading.value = false;
  }
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const totalPages = computed(() => Math.max(1, Math.ceil(totalRecords.value / perPage.value)));
const startIndex = computed(() => totalRecords.value === 0 ? 0 : ((currentPage.value - 1) * perPage.value) + 1);
const endIndex   = computed(() => Math.min(currentPage.value * perPage.value, totalRecords.value));

const visiblePages = computed(() => {
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - 2);
  let end   = start + maxVisible - 1;
  if (end > totalPages.value) { end = totalPages.value; start = Math.max(1, end - maxVisible + 1); }
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
    fetchFeedback();
  }
};

// ─── Search ───────────────────────────────────────────────────────────────────
const executeSearch = () => {
  appliedSearch.value = searchQuery.value;
  currentPage.value   = 1;
  fetchFeedback();
};
watch(searchQuery, (val) => { if (val === '') executeSearch(); });
watch(perPage, () => { currentPage.value = 1; fetchFeedback(); });

// ─── Download Excel ───────────────────────────────────────────────────────────
const handleDownloadExcel = async () => {
  try {
    const response = await downloadEventFeedbackExcel(eventId.value);
    const url      = window.URL.createObjectURL(new Blob([response.data]));
    const link     = document.createElement('a');
    link.href      = url;
    link.setAttribute('download', `event-feedback-${eventId.value}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    showError('Gagal mengunduh file Excel.');
  }
};

// ─── Satisfaction label ───────────────────────────────────────────────────────
const satisfactionLabel = (val) => {
  if (val === 3) return 'Happy';
  if (val === 2) return 'Neutral';
  if (val === 1) return 'Sad';
  return '-';
};

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await fetchEventInfo();
  await fetchSatisfaction();
  await fetchFeedback();
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

            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <button
                  @click="router.push(`/event/${eventId}/visitor`)"
                  class="w-8 h-8 rounded-lg bg-[#FEF4E3] flex items-center justify-center text-[#F7941D] hover:bg-[#F7941D] hover:text-white transition-colors focus:outline-none"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
                <h1 class="text-xl font-semibold text-gray-800">Event Feedback</h1>
              </div>
              <nav class="flex items-center gap-1.5 text-sm text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                <span>Dashboard</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
                <button @click="router.push('/event')" class="hover:text-[#F7941D] transition-colors">Event</button>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
                <button @click="router.push(`/event/${eventId}/visitor`)" class="hover:text-[#F7941D] transition-colors">Event Visitor</button>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
                <span class="text-[#F7941D] font-medium">Event Feedback</span>
              </nav>
            </div>

            <!-- Toolbar -->
            <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-start gap-4">
              <div class="w-full sm:max-w-md">
                <SearchInput
                  v-model="searchQuery"
                  placeholder="Search Feedback"
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

              <!-- Download Report -->
              <button
                @click="handleDownloadExcel"
                class="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#38CA99] text-[#38CA99] rounded-lg font-medium text-sm hover:bg-[#38CA99] hover:text-white transition-all group focus:outline-none"
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

            <!-- Table -->
            <div class="flex-1 overflow-hidden">
              <DataTable
                :columns="tableColumns"
                :data="feedbackData"
                :loading="isLoading"
                :sort-key="sortKey"
                :sort-order="sortOrder"
              >
                <template #satisfaction="{ row }">
                  <div class="flex items-center gap-2">
                    <template v-if="row.satisfaction === 3">
                      <svg class="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke-width="2"/>
                        <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
                        <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
                        <path d="M8 14.5c1.5 2 4.5 2 6 0" stroke-linecap="round"/>
                      </svg>
                      <span class="text-[13px] text-[#10B981] font-medium">Happy</span>
                    </template>
                    <template v-else-if="row.satisfaction === 2">
                      <svg class="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke-width="2"/>
                        <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
                        <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
                        <line x1="8" y1="15" x2="16" y2="15" stroke-linecap="round"/>
                      </svg>
                      <span class="text-[13px] text-[#F59E0B] font-medium">Neutral</span>
                    </template>
                    <template v-else-if="row.satisfaction === 1">
                      <svg class="w-6 h-6 text-[#EF4444]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke-width="2"/>
                        <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
                        <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
                        <path d="M8 16c1.5-2 4.5-2 6 0" stroke-linecap="round"/>
                      </svg>
                      <span class="text-[13px] text-[#EF4444] font-medium">Sad</span>
                    </template>
                    <span v-else class="text-gray-400 font-bold">-</span>
                  </div>
                </template>

                <template #aksi="{ row }">
                  <button
                    @click="router.push(`/event/feedback/${row.id}`)"
                    class="w-[30px] h-[30px] rounded bg-[#D9E2FF] flex items-center justify-center text-[#4075FF] hover:bg-[#B3C6FF] transition-colors focus:outline-none"
                    title="View Detail"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                      <path d="M2 12c0 0 4-8 10-8s10 8 10 8-4 8-10 8-10-8-10-8z"/>
                      <circle cx="12" cy="12" r="3.5"/>
                    </svg>
                  </button>
                </template>

                <template #empty>
                  <div class="flex flex-col items-center justify-center py-16 text-gray-400">
                    <svg class="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <p class="text-sm font-medium text-gray-500">No Records to display</p>
                  </div>
                </template>
              </DataTable>
            </div>

          </div>

          <!-- Pagination -->
          <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-[13px] text-[#64748B]">
            <span>Showing {{ startIndex }} to {{ endIndex }} from {{ totalRecords }} records</span>

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
  </div>
</template>

<style scoped>
button:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>
