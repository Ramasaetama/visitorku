<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import DataTable from '@/components/common/DataTable.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import Pagination from '@/components/common/Pagination.vue';
import EmptyState from '@/components/common/EmptyState.vue'; // 🌟 FIX: Import EmptyState
import notfound from '@/assets/notfound.svg'; // 🌟 FIX: Import notfound icon
import { showError } from '@/utils/alertHelper';
import {
  getEventById,
  getEventFeedbackList,
  getEventSatisfaction,
  downloadEventFeedbackExcel,
} from '@/services/eventService';

const { t } = useI18n();
const route  = useRoute();
const router = useRouter();
const eventId = computed(() => route.params.id);

// ─── Event Info ───────────────────────────────────────────────────────────────
const eventInfo        = ref(null);
const satisfactionData = ref(null);

// ─── State Dropdown Opsi dengan Posisi Dinamis ────────────────────────────────
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
      left: `${buttonRect.left + window.scrollX }px` // 🌟 FIX: Mekar Kanan
    };
  }
};

const closeDropdown = () => {
  activeDropdown.value = null;
};

// ─── State ───────────────────────────────────────────────────────────────────
const feedbackData  = ref([]);
const isLoading     = ref(false);
const searchQuery   = ref('');
const appliedSearch = ref('');
const perPage       = ref(10);
const currentPage   = ref(1);
const totalRecords  = ref(0);

// ─── Kolom Tabel ─────────────────────────────────────────────────────────────
const tableColumns = computed(() => [
  { key: 'name',         label: t('eventFeedback.table.name'),         sortable: true  },
  { key: 'notes',        label: t('eventFeedback.table.notes'),        sortable: false },
  { key: 'satisfaction', label: t('eventFeedback.table.satisfaction'), sortable: false },
  { key: 'aksi',         label: t('eventFeedback.table.action'),       sortable: false },
]);

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
  currentPage.value = 1;
  fetchFeedback();
};

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

// ─── Search & Pagination Watchers ──────────────────────────────────────────────
const executeSearch = () => {
  appliedSearch.value = searchQuery.value;
  currentPage.value   = 1;
  fetchFeedback();
};
watch(searchQuery, (val) => { if (val === '') executeSearch(); });

watch(perPage, () => {
  if(currentPage.value !== 1) {
    currentPage.value = 1;
  } else {
    fetchFeedback();
  }
});

watch(currentPage, () => {
  fetchFeedback();
});

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
    showError(t('eventFeedback.error.downloadFailed'));
  }
};

// ─── Satisfaction label ───────────────────────────────────────────────────────
const satisfactionLabel = (val) => {
  if (val === 3) return 'Happy';
  if (val === 2) return 'Neutral';
  if (val === 1) return 'Sad';
};

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await fetchEventInfo();
  await fetchSatisfaction();
  await fetchFeedback();
  window.addEventListener('scroll', closeDropdown, true);
});

onUnmounted(() => {
  window.removeEventListener('scroll', closeDropdown, true);
});
</script>

<template>
  <div class="flex-1 w-full h-full flex flex-col">
    <main class="bg-white rounded-2xl shadow-sm h-full min-h-[calc(100vh-7rem)] flex flex-col relative w-full">
      <div class="p-6 flex-1 flex flex-col">

        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <button
              @click="router.push(`/event/${eventId}/visitor`)"
              class="w-8 h-8 rounded-sm bg-[#FEF4E3] flex items-center justify-center text-[#F7941D] hover:bg-[#F7941D] hover:text-white transition-colors focus:outline-none"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 class="text-xl font-semibold text-gray-800">Event Feedback</h1>
          </div>
        </div>

        <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-start gap-4">
          <div class="w-full sm:max-w-md">
            <SearchInput
              v-model="searchQuery"
              v-model:perPage="perPage"
              :placeholder="t('eventFeedback.searchPlaceholder')"
              @keyup.enter="executeSearch"
            />
          </div>
          <div class="flex-1" />

          <button
            @click="handleDownloadExcel"
            class="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#38CA99] text-[#38CA99] rounded-sm font-medium text-sm hover:bg-[#38CA99] hover:text-white transition-all group focus:outline-none"
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

        <div class="flex-1 overflow-hidden">
          <DataTable
            :columns="tableColumns"
            :data="feedbackData"
            :loading="isLoading"
            :sort-key="sortKey"
            :sort-order="sortOrder"
            @sort="handleSort"
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
                </template>
                <template v-else-if="row.satisfaction === 2">
                  <svg class="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke-width="2"/>
                    <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
                    <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
                    <line x1="8" y1="15" x2="16" y2="15" stroke-linecap="round"/>
                  </svg>
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
              <div class="flex items-center gap-2 relative">
                
                <button 
                  @click.stop="toggleDropdown(row.id, $event)"
                  class="w-[30px] h-[30px] rounded border border-[#F7941D] flex items-center justify-center text-[#F7941D] hover:bg-[#FEF4E3] transition-colors focus:outline-none relative z-10"
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
                      @click="router.push(`/event/feedback/${row.id}`); closeDropdown();" 
                      class="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-[#FEF4E3] hover:text-[#F7941D] focus:outline-none transition-colors"
                    >
                      View Detail
                    </button>
                  </div>
                </Teleport>

              </div>
            </template>

            <template #empty>
              <EmptyState 
                v-if="feedbackData.length === 0"
                :icon="notfound"
                title="Feedback Belum Tersedia"
                description="Belum ada feedback yang diberikan untuk event ini."
                :showButton="false"
              />
              <EmptyState 
                v-else
                :icon="notfound"
                title="No Records to display"
                :description="`Tidak ada feedback yang cocok dengan kata kunci '${appliedSearchQuery}'`"
                :showButton="false"
              />
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
  </div>
</template>

<style scoped>
button:focus, select:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>