<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import DataTable from '@/components/common/DataTable.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import Pagination from '@/components/common/Pagination.vue';
import notfound from '@/assets/notfound.svg';
import { getAllVisits } from '@/services/visitService';

const { t } = useI18n();
const router = useRouter();

// ─── State ───────────────────────────────────────────────────────────────────
const visitData     = ref([]);
const isLoading     = ref(false);
const searchQuery   = ref('');
const appliedSearch = ref('');
const perPage       = ref(10);
const currentPage   = ref(1);
const totalRecords  = ref(0);

// ─── Kolom Tabel ─────────────────────────────────────────────────────────────
const tableColumns = computed(() => [
  { key: 'name',      label: t('visitData.table.name'),      sortable: true  },
  { key: 'purpose',   label: t('visitData.table.purpose'),   sortable: true  },
  { key: 'check_in',  label: t('visitData.table.checkIn'),   sortable: true  },
  { key: 'check_out', label: t('visitData.table.checkOut'),  sortable: false },
  { key: 'face',      label: t('visitData.table.face'),      sortable: false },
]);

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

    const items = Array.isArray(res) ? res : (res.data || res.items || []);
    totalRecords.value = res.total ?? res.totalData ?? items.length;

    visitData.value = items.map(v => ({
      id:            v.id,
      name:          v.name ?? '-',
      purpose:       v.purpose ?? '-',
      check_in:      formatDateTime(v.datetime),
      check_in_pic:  v.picture_url, 
      check_out:     formatDateTime(v.logout_data?.datetime ?? null),
      check_out_pic: v.logout_data?.picture_url ?? null, 
      satisfaction:  v.satisfaction,
      raw:           v,
    }));
  } catch (err) {
    console.error('Gagal memuat data visit:', err);
    visitData.value    = [];
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
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// ─── Search & Watchers ────────────────────────────────────────────────────────
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
  if (currentPage.value !== 1) {
    currentPage.value = 1; 
  } else {
    fetchVisits();
  }
});

watch(currentPage, () => {
  fetchVisits();
});

// ─── Report ───────────────────────────────────────────────────────────────────
const handleReport = () => {
  router.push('/report');
};

onMounted(fetchVisits);
</script>

<template>
  <div class="flex-1 w-full h-full flex flex-col">
    <main class="bg-white rounded-2xl shadow-sm h-full min-h-[calc(100vh-7rem)] flex flex-col relative w-full">
      <div class="p-6 flex-1 flex flex-col">

        <div class="flex items-start justify-between mb-6">
          <div>
            <h1 class="text-2xl font-semibold text-gray-800 mb-1">{{ t('visitData.title') }}</h1>
            <p class="text-sm text-gray-500">{{ t('visitData.subtitle') }}</p>
          </div> 

          <button 
            @click="handleReport"
            class="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#38CA99] 
                  text-[#38CA99] rounded-sm font-medium text-sm 
                  hover:bg-[#38CA99] hover:text-white transition-all group focus:outline-none"
          >
            <svg class="w-5 h-5 text-[#38CA99] group-hover:text-white transition-colors" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
              <line x1="8" y1="15" x2="8" y2="12" />
              <line x1="12" y1="15" x2="12" y2="9" />
              <line x1="16" y1="15" x2="16" y2="13" />
            </svg>
            {{ t('visitData.reportButton') }}
          </button>
        </div>

        <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-start gap-4">
          <div class="w-full sm:max-w-md flex-1">
            <SearchInput 
              v-model="searchQuery" 
              v-model:perPage="perPage"
              :placeholder="t('visitData.searchPlaceholder')" 
              @keyup.enter="executeSearch"  
            />
          </div>
        </div>

        <div class="flex-1 overflow-hidden">
          <DataTable
            :columns="tableColumns"
            :data="visitData"
            :loading="isLoading"
            :sort-key="sortKey"
            :sort-order="sortOrder"
            @sort="handleSort"
          >
            <template #body="{ data }">
              <tr
                v-for="(row, idx) in data"
                :key="row.id ?? idx"
                class="hover:bg-[#FDF9F2]/50 transition-colors"
              >
                <td class="px-5 py-4 text-[13px] text-gray-800 border-b border-[#EDEDED] font-medium">
                  {{ row.name }}
                </td>

                <td class="px-5 py-4 text-[13px] text-gray-800 border-b border-[#EDEDED]">
                  {{ row.purpose }}
                </td>

                <td class="px-5 py-4 text-[13px] text-gray-800 border-b border-[#EDEDED] whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <img 
                      v-if="row.check_in_pic" 
                      :src="row.check_in_pic" 
                      alt="Check In" 
                      class="w-7 h-7 rounded-sm object-cover border border-gray-100 shrink-0 shadow-xs" 
                    />
                    <div 
                      v-else 
                      class="w-7 h-7 rounded-sm bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-bold shrink-0 border border-gray-200 shadow-xs"
                    >
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <span>{{ row.check_in }}</span>
                  </div>
                </td>

                <td class="px-5 py-4 text-[13px] border-b border-[#EDEDED] whitespace-nowrap">
                  <div v-if="row.check_out !== '-'" class="flex items-center gap-3 text-gray-800">
                    <img 
                      v-if="row.check_out_pic" 
                      :src="row.check_out_pic" 
                      alt="Check Out" 
                      class="w-7 h-7 rounded-sm object-cover border border-gray-100 shrink-0 shadow-xs" 
                    />
                    <div 
                      v-else 
                      class="w-7 h-7 rounded-sm bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-bold shrink-0 border border-gray-200 shadow-xs"
                    >
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <span>{{ row.check_out }}</span>
                  </div>
                  <span v-else class="text-gray-400 font-bold">-</span>
                </td>

                <td class="px-5 py-4 text-[13px] border-b border-[#EDEDED] text-center">
                  <div class="flex justify-center">
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
                    </template>
                    <span v-else class="text-gray-400 font-bold">-</span>
                  </div>
                </td>
              </tr>
            </template>

            <template #empty>
              <EmptyState 
                v-if="visitData.length === 0"
                :icon="notfound"
                :title="t('visitData.emptyTitle')"
                :description="t('visitData.emptyDescription')"
                :showButton="false"
              />
              <EmptyState 
                v-else
                :icon="notfound"
                :title="t('visitData.notFoundTitle')"
                :description="t('visitData.notFoundDescription')"
                :showButton="false"
              />
            </template>
          </DataTable>
        </div>

        <Pagination
          v-model:current-page="currentPage"
          :total-data="totalRecords"
          :per-page="perPage"
        />

      </div>
    </main>
  </div>
</template>

<style scoped>
button:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>
