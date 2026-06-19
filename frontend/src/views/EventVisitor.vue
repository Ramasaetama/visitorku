<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import DataTable from '@/components/common/DataTable.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import Pagination from '@/components/common/Pagination.vue'; 
import Modal from '@/components/common/Modal.vue';
import { confirmDelete, showSuccess, showError } from '@/utils/alertHelper';

import {
  getEventSatisfaction,
  getEventById,
  getEventVisitors,
  addEventVisitor,
  updateEventVisitor,
  deleteEventVisitor,
  finishEvent,
  getEventCheckInOutCount,
  downloadEventExcel,
  
} from '@/services/eventService';

const { t } = useI18n();
const route  = useRoute();
const router = useRouter();
const eventId = computed(() => route.params.id);

// ─── Event Info ───────────────────────────────────────────────────────────────
const eventInfo   = ref(null);
const checkInCount  = ref(0);
const checkOutCount = ref(0);
const totalVisitor  = ref(0);
const satisfactionStats = ref({ bad: 0, neutral: 0, good: 0 });

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
      left: `${buttonRect.left + window.scrollX }px`     };
  }
};

const closeDropdown = () => {
  activeDropdown.value = null;
};

// ─── State ───────────────────────────────────────────────────────────────────
const visitorData   = ref([]);
const isLoading     = ref(false);
const searchQuery   = ref('');
const appliedSearch = ref('');
const perPage       = ref(10);
const currentPage   = ref(1);
const totalRecords  = ref(0);

// ─── Sorting ─────────────────────────────────────────────────────────────────
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
    const cmp = String(valA).localeCompare(String(valB), 'id', { sensitivity: 'base' });
    return sortOrder.value === 'asc' ? cmp : -cmp;
  });
});

// ─── Kolom Tabel ─────────────────────────────────────────────────────────────
const tableColumns = computed(() => [
  { key: 'name',         label: t('eventVisitor.table.name'),         sortable: true  },
  { key: 'email',        label: t('eventVisitor.table.email'),        sortable: true  },
  { key: 'phone_number', label: t('eventVisitor.table.phoneNumber'),  sortable: false },
  { key: 'check_in_at',    label: t('eventVisitor.table.checkIn'),      sortable: true  },
  { key: 'check_out_at',   label: t('eventVisitor.table.checkOut'),     sortable: true  },
  { key: 'satisfaction', label: t('eventVisitor.table.satisfaction'), sortable: false },
  { key: 'aksi',        label: t('eventVisitor.table.action'),       sortable: false },
]);

// ─── Fetch Event Info ─────────────────────────────────────────────────────────
const fetchEventInfo = async () => {
  try {
    const res = await getEventById(eventId.value);
    eventInfo.value = res.data?.data ?? res.data ?? res;
  } catch (err) {
    console.error('Gagal memuat event info:', err);
  }
};

const fetchCheckInOutCount = async () => {
  try {
    const res = await getEventCheckInOutCount(eventId.value);
    const data = res.data?.data ?? res.data ?? res;
    checkInCount.value  = data.check_in  ?? data.checkin  ?? 0;
    checkOutCount.value = data.check_out ?? data.checkout ?? 0;
    totalVisitor.value  = data.total     ?? data.total_visitor ?? 0;

  } catch (err) {
    console.error('Gagal memuat check-in/out count:', err);
  }
};
// ─── Fetch Satisfaction ───────────────────────────────────────────────────────
const fetchSatisfaction = async () => {
  try {
    const res = await getEventSatisfaction(eventId.value);
    const data = res.data?.data ?? res.data ?? res;

    const total = data.total ?? 0;
    if (total === 0) {
      satisfactionStats.value = { bad: 0, neutral: 0, good: 0 };
      return;
    }

    // title: [1, 2, 3] → index 0=bad, 1=neutral, 2=good
    const counts = data.data ?? [0, 0, 0]; // [jumlah bad, jumlah neutral, jumlah good]

    satisfactionStats.value = {
      bad:     Math.round((counts[0] / total) * 100),
      neutral: Math.round((counts[1] / total) * 100),
      good:    Math.round((counts[2] / total) * 100),
    };
  } catch (err) {
    console.error('Gagal memuat satisfaction:', err);
  }
};


// ─── Fetch Visitors ───────────────────────────────────────────────────────────
const fetchVisitors = async () => {
  isLoading.value = true;
  try {
    const params = {
      page:   currentPage.value,
      size:   perPage.value,
      search: appliedSearch.value || undefined,
    };
    const response = await getEventVisitors(eventId.value, params);
    const res   = response.data || response;
    const items = Array.isArray(res) ? res : (res.data || res.items || []);
    totalRecords.value = res.total ?? res.totalData ?? items.length;

    visitorData.value = items.map(v => ({
      id:           v.id,
      name:         v.name ?? '-',
      email:        v.email ?? '-',
      phone_number: v.phone_number ?? v.phone ?? '-',
      check_in_at:     formatDateTime(v.check_in_at ?? null),
      check_out_at:    formatDateTime(v.check_out_at ?? null),
      satisfaction: v.satisfaction,
      raw:          v,
    }));
  } catch (err) {
    console.error('Gagal memuat data visitor event:', err);
    visitorData.value  = [];
    totalRecords.value = 0;
  } finally {
    isLoading.value = false;
  }
};

const formatDateTime = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d)) return val;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};


// ─── Search & Pagination Watchers ──────────────────────────────────────────────
const executeSearch = () => {
  appliedSearch.value = searchQuery.value;
  currentPage.value   = 1;
  fetchVisitors();
};
watch(searchQuery, (val) => { if (val === '') executeSearch(); });

watch(perPage, () => {
  if(currentPage.value !== 1) {
    currentPage.value = 1;
  } else {
    fetchVisitors();
  }
});

watch(currentPage, () => {
  fetchVisitors();
});


// ─── Add / Edit Visitor Modal ─────────────────────────────────────────────────
const showModal = ref(false);
const isEdit    = ref(false);
const isSaving  = ref(false);
const editingId = ref(null);

const form = ref({ name: '', email: '', phone_number: '' });

const openAddModal = () => {
  isEdit.value    = false;
  editingId.value = null;
  form.value      = { name: '', email: '', phone_number: '' };
  showModal.value = true;
};

const openEditModal = (row) => {
  closeDropdown();
  isEdit.value    = true;
  editingId.value = row.id;
  form.value = {
    name:         row.name,
    email:        row.email,
    phone_number: row.phone_number,
  };
  showModal.value = true;
};

const closeModal = () => { showModal.value = false; };

const handleSubmit = async () => {
  if (!form.value.name || !form.value.email || !form.value.phone_number) {
    showError(t('eventVisitor.error.requiredFields'));
    return;
  }
  isSaving.value = true;
  try {
    const payload = { ...form.value, event_id: eventId.value };
    if (isEdit.value) {
      await updateEventVisitor(editingId.value, payload);
      showSuccess(t('eventVisitor.success.updated'));
    } else {
      await addEventVisitor(payload);
      showSuccess(t('eventVisitor.success.added'));
    }
    closeModal();
    await fetchVisitors();
    await fetchCheckInOutCount();
  } catch (err) {
    showError(err.response?.data?.message || t('eventVisitor.error.generic'));
  } finally {
    isSaving.value = false;
  }
};

// ─── Delete ───────────────────────────────────────────────────────────────────
const handleDelete = async (row) => {
  closeDropdown();
  const confirmed = await confirmDelete(row.name);
  if (!confirmed) return;
  try {
    await deleteEventVisitor(row.id);
    showSuccess(t('eventVisitor.success.deleted'));
    await fetchVisitors();
    await fetchCheckInOutCount();
  } catch (err) {
    showError(err.response?.data?.message || t('eventVisitor.error.deleteFailed'));
  }
};

// ─── Finish Event ─────────────────────────────────────────────────────────────
const showFinishModal = ref(false);
const isFinishing     = ref(false);

const handleFinish = async () => {
  isFinishing.value = true;
  try {
    await finishEvent(eventId.value);
    showSuccess(t('eventVisitor.success.finished'));
    showFinishModal.value = false;
    await fetchEventInfo();
  } catch (err) {
    showError(err.response?.data?.message || t('eventVisitor.error.finishFailed'));
  } finally {
    isFinishing.value = false;
  }
};

// ─── Download Excel ───────────────────────────────────────────────────────────
const handleDownloadExcel = async () => {
  try {
    const response = await downloadEventExcel(eventId.value);
    const url      = window.URL.createObjectURL(new Blob([response.data]));
    const link     = document.createElement('a');
    link.href      = url;
    link.setAttribute('download', `event-visitor-${eventId.value}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    showError(t('eventVisitor.error.downloadFailed'));
  }
};

// ─── Go to Feedback ───────────────────────────────────────────────────────────
const goToFeedback = () => router.push(`/event/${eventId.value}/feedback`);

// ─── Init ─────────────────────────────────────────────────────────────────────


onMounted(async () => {
  fetchEventInfo();
  fetchCheckInOutCount();
  fetchVisitors();
  fetchSatisfaction(); 
  window.addEventListener('scroll', closeDropdown, true);
});
</script>

<template>
  <div class="flex-1 w-full h-full flex flex-col">
        <div class="bg-white rounded-2xl shadow-sm h-full min-h-[calc(100vh-7rem)] flex flex-col relative w-full">
          <div class="p-6 flex-1 flex flex-col">

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <button
                  @click="router.push('/event')"
                  class="w-8 h-8 rounded-sm bg-[#FEF4E3] flex items-center justify-center text-[#F7941D] hover:bg-[#F7941D] hover:text-white transition-colors focus:outline-none"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
                <h1 class="text-xl font-semibold text-gray-800">{{ eventInfo?.name ?? 'Event Visitor' }}</h1>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4 mb-6">
              <div class="bg-white border border-gray-100 rounded-md p-4 flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-[#FEF4E3] flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 text-[#F7941D]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-800">{{ checkInCount }} <span class="text-base font-semibold">{{ t('eventVisitor.checkIn') }}</span></p>
                </div>
              </div>

              <div class="bg-white border border-gray-100 rounded-md p-4 flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-[#FEF4E3] flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 text-[#F7941D]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-800">{{ checkOutCount }} <span class="text-base font-semibold">{{ t('eventVisitor.checkOut') }}</span></p>
                </div>
              </div>

              <div class="bg-white border border-gray-100 rounded-md p-4 flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-[#FEF4E3] flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 text-[#F7941D]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-800">{{ totalVisitor }} <span class="text-base font-semibold">{{ t('eventVisitor.totalVisitor') }}</span></p>
                </div>
              </div>
            </div>

<!-- Satisfaction Index -->
<div class="mb-6">
  <p class="text-sm font-semibold text-gray-700 mb-2">{{ t('eventVisitor.satisfactionIndex') }}</p>

  <div class="w-full h-10 rounded-sm overflow-hidden flex font-medium text-white text-sm">

    <div v-if="satisfactionStats.bad > 0"
      :style="{ width: satisfactionStats.bad + '%' }"
      class="bg-[#EF4444] h-full flex items-center justify-between px-3 transition-all duration-500">
      <svg class="w-5 h-5 opacity-90" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke-width="2.5"/>
        <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
        <path d="M8 16c1.5-2 4.5-2 6 0" stroke-linecap="round"/>
      </svg>
      <span v-if="satisfactionStats.bad > 5">{{ satisfactionStats.bad }}%</span>
    </div>

    <div v-if="satisfactionStats.neutral > 0"
      :style="{ width: satisfactionStats.neutral + '%' }"
      class="bg-[#F59E0B] h-full flex items-center justify-between px-3 transition-all duration-500">
      <svg class="w-5 h-5 opacity-90" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke-width="2.5"/>
        <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
        <line x1="8" y1="15" x2="16" y2="15" stroke-linecap="round" stroke-width="1.5"/>
      </svg>
      <span v-if="satisfactionStats.neutral > 5">{{ satisfactionStats.neutral }}%</span>
    </div>

    <div v-if="satisfactionStats.good > 0"
      :style="{ width: satisfactionStats.good + '%' }"
      class="bg-[#10B981] h-full flex items-center justify-between px-3 transition-all duration-500">
      <span v-if="satisfactionStats.good > 5">{{ satisfactionStats.good }}%</span>
      <svg class="w-5 h-5 opacity-90" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke-width="2.5"/>
        <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
        <path d="M8 14.5c1.5 2 4.5 2 6 0" stroke-linecap="round"/>
      </svg>
    </div>

    <div v-if="satisfactionStats.bad === 0 && satisfactionStats.neutral === 0 && satisfactionStats.good === 0"
      class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
    </div>

  </div>
</div>
 

            <div class="mb-4 flex flex-col sm:flex-row sm:items-center justify-start gap-4">
              <div class="w-full sm:max-w-md">
                <SearchInput
                  v-model="searchQuery"
                  v-model:perPage="perPage"
                  :placeholder="t('eventVisitor.searchPlaceholder')"
                  @keyup.enter="executeSearch"
                />
              </div>

              <div class="relative shrink-0">
               
              </div>

              <div class="flex-1" />

              <button
                @click="showFinishModal = true"
                class="flex items-center justify-center gap-2 px-5 py-2 bg-[#FFFFFF] border border-[#FF4C4C] text-[#FF4C4C] text-sm font-medium rounded-sm hover:bg-[#FF4C4C] hover:text-white active:scale-95 transition-all focus:outline-none"
              >
                {{ t('eventVisitor.finish') }}
              </button>

              <button
                @click="goToFeedback"
                class="w-[38px] h-[38px] border border-[#4075FF] flex items-center justify-center text-[#4075FF] hover:bg-[#4075FF] hover:text-white transition-colors focus:outline-none"
                style="border-radius: 10px;"
                title="View Feedback"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.45455 19L2 22.5V4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V18C22 18.5523 21.5523 19 21 19H6.45455ZM5.76282 17H20V5H4V18.3851L5.76282 17ZM11 10H13V14H11V10ZM11 7H13V9H11V7Z"/>
                </svg>
              </button>

              <button
                @click="handleDownloadExcel"
                class="w-[38px] h-[38px] border border-[#10B981] flex items-center justify-center text-[#10B981] hover:bg-[#10B981] hover:text-white transition-colors focus:outline-none"
                style="border-radius: 10px;"
                title="Download Excel"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.4142 5H21C21.5523 5 22 5.44772 22 6V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H10.4142L12.4142 5ZM20 7H11.5858L9.58579 5H4V19H20V7ZM13 10H15V16H13V10ZM9 12H11V16H9V12ZM17 13H19V16H17V13Z"/>
                </svg>
              </button>

              <button
                @click="openAddModal"
                class="w-[38px] h-[38px] border border-[#F7941D] flex items-center justify-center text-[#F7941D] hover:bg-[#F7941D] hover:text-white transition-colors focus:outline-none"
                style="border-radius: 10px;"
                title="Add Visitor"
              >
                <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"/>
                </svg>
              </button>
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
                <template #satisfaction="{ row }">
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
                </template>

                <template #aksi="{ row }">
                  <div class="flex items-center gap-2">
                    <!-- View Detail -->
                    <button
                      @click="router.push(`/event/visitor/${row.id}`)"
                      class="w-[30px] h-[30px] rounded bg-[#D9E2FF] flex items-center justify-center text-[#4075FF] hover:bg-[#B3C6FF] transition-colors focus:outline-none"
                      title="View Detail"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <path d="M2 12c0 0 4-8 10-8s10 8 10 8-4 8-10 8-10-8-10-8z"/>
                        <circle cx="12" cy="12" r="3.5"/>
                      </svg>
                    </button>
                    <button
                      @click="openEditModal(row)"
                      class="w-[30px] h-[30px] rounded bg-[#FEF4E3] flex items-center justify-center text-[#F7941D] hover:bg-[#F7941D] hover:text-white transition-colors focus:outline-none"
                      title="Edit"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      @click="handleDelete(row)"
                      class="w-[30px] h-[30px] rounded bg-[#E45454] flex items-center justify-center text-white hover:bg-[#D24A4A] transition-colors focus:outline-none"
                      title="Hapus"
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
                            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    </svg>
                    <p class="text-sm font-medium text-gray-500">{{ t('eventVisitor.noRecords') }}</p>
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

        </div>

<Modal
  :show="showModal"
  :title="isEdit ? t('eventVisitor.modal.editTitle') : t('eventVisitor.modal.addTitle')"
  :description="isEdit ? t('eventVisitor.modal.editDesc') : t('eventVisitor.modal.addDesc')"
  width="md"
  @close="closeModal"
>
  <div class="space-y-5">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1.5">
        Name <span class="text-red-500">*</span>
      </label>
      <input
        v-model="form.name"
        type="text"
        :placeholder="t('eventVisitor.modal.namePlaceholder')"
        class="w-full bg-[#F8FAFC] border border-gray-200 rounded-sm px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]/20 transition-colors"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1.5">
        Email <span class="text-red-500">*</span>
      </label>
      <input
        v-model="form.email"
        type="email"
        :placeholder="t('eventVisitor.modal.emailPlaceholder')"
        class="w-full bg-[#F8FAFC] border border-gray-200 rounded-sm px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]/20 transition-colors"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1.5">
        Phone Number <span class="text-red-500">*</span>
      </label>
      <input
        v-model="form.phone_number"
        type="text"
        :placeholder="t('eventVisitor.modal.phonePlaceholder')"
        class="w-full bg-[#F8FAFC] border border-gray-200 rounded-sm px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]/20 transition-colors"
      />
    </div>
  </div>

  <template #footer>
    <div class="flex items-center justify-end gap-3">
      <button
        @click="closeModal"
        class="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors focus:outline-none"
      >
        {{ t('eventVisitor.modal.cancel') }}
      </button>
      <button
        @click="handleSubmit"
        :disabled="isSaving"
        class="px-5 py-2.5 text-sm font-medium text-white bg-[#F7941D] rounded-sm hover:bg-[#E8850E] transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isSaving ? t('eventVisitor.modal.loading') : t('eventVisitor.modal.submit') }}
      </button>
    </div>
  </template>
</Modal>

    <div v-if="showFinishModal" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-8 text-center animate-fade-in-up">
        <div class="w-16 h-16 rounded-full border-4 border-blue-300 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <path stroke-linecap="round" d="M12 8v4M12 16h.01"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-gray-800 mb-2">{{ t('eventVisitor.finishModal.title') }}</h2>
        <p class="text-sm text-gray-500 mb-6">
          {{ t('eventVisitor.finishModal.desc') }} "<span class="font-semibold">{{ eventInfo?.name }}</span>".
        </p>
        <div class="flex items-center justify-center gap-3">
          <button
            @click="handleFinish"
            :disabled="isFinishing"
            class="px-6 py-2.5 bg-[#F7941D] text-white rounded-lg font-medium text-sm hover:bg-[#E8850E] transition-colors focus:outline-none disabled:opacity-50"
          >
            {{ isFinishing ? t('eventVisitor.finishModal.processing') : t('eventVisitor.finishModal.yes') }}
          </button>
          <button
            @click="showFinishModal = false"
            class="px-6 py-2.5 bg-gray-200 text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-300 transition-colors focus:outline-none"
          >
            {{ t('eventVisitor.finishModal.cancel') }}
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

</style>