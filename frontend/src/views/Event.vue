<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Topbar from '@/components/Topbar.vue';
import Sidebar from '@/components/Sidebar.vue';
import DataTable from '@/components/common/DataTable.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import DateTimePicker from '@/components/common/DateTimePicker.vue';
import SettingIcon from '@/assets/settings-3-line.svg';
import DeleteIcon from '@/assets/delete.svg';
import EditIcon from '@/assets/edit-box-line.svg';
import { confirmDelete, showSuccess, showError } from '@/utils/alertHelper';
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '@/services/eventService';

const router = useRouter();

// ─── State ───────────────────────────────────────────────────────────────────
const eventData    = ref([]);
const isLoading    = ref(false);
const searchQuery  = ref('');
const appliedSearch = ref('');
const perPage      = ref(10);
const currentPage  = ref(1);
const totalRecords = ref(0);

// ─── Kolom Tabel ─────────────────────────────────────────────────────────────
const tableColumns = [
  { key: 'name',             label: 'NAME',             sortable: true  },
  { key: 'event_start_at',   label: 'EVENT START',      sortable: true  },
  { key: 'event_finish_at',  label: 'EVENT FINISH',     sortable: true  },
  { key: 'url_registration', label: 'URL REGISTRATION', sortable: false },
  { key: 'aksi',             label: 'ACTION',           sortable: false },
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
  currentPage.value = 1;
  fetchEvents();
};

// ─── Fetch Data ───────────────────────────────────────────────────────────────
const fetchEvents = async () => {
  isLoading.value = true;
  try {
    const params = {
      page:   currentPage.value,
      size:   perPage.value,
      search: appliedSearch.value || undefined,
    };
    const response = await getAllEvents(params);
    const res   = response.data || response;
    const items = Array.isArray(res) ? res : (res.data || res.items || []);
    totalRecords.value = res.total ?? res.totalData ?? items.length;

    eventData.value = items.map(e => ({
      id:               e.id,
      name:             e.name ?? '-',
      description:      e.description ?? '',
      location:         e.location ?? '',
      location_url:     e.location_url ?? '',
      event_start_at:   formatDateTime(e.event_start_at),
      event_finish_at:  formatDateTime(e.event_finish_at),
      reg_start_at:     e.registration_start_at ?? '',
      reg_finish_at:    e.registration_finish_at ?? '',
      url_registration: e.url_registration ?? e.registration_url ?? '-',
      raw:              e,
    }));
  } catch (err) {
    console.error('Gagal memuat data event:', err);
    eventData.value  = [];
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
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toInputDatetime = (val) => {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d)) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const totalPages  = computed(() => Math.max(1, Math.ceil(totalRecords.value / perPage.value)));
const startIndex  = computed(() => totalRecords.value === 0 ? 0 : ((currentPage.value - 1) * perPage.value) + 1);
const endIndex    = computed(() => Math.min(currentPage.value * perPage.value, totalRecords.value));

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
    fetchEvents();
  }
};

// ─── Search ───────────────────────────────────────────────────────────────────
const executeSearch = () => {
  appliedSearch.value = searchQuery.value;
  currentPage.value   = 1;
  fetchEvents();
};
watch(searchQuery, (val) => { if (val === '') executeSearch(); });
watch(perPage, () => { currentPage.value = 1; fetchEvents(); });

// ─── Modal Add/Edit ───────────────────────────────────────────────────────────
const showModal   = ref(false);
const isEdit      = ref(false);
const isSaving    = ref(false);
const editingId   = ref(null);

const form = ref({
  name:                  '',
  description:           '',
  location:              '',
  location_url:          '',
  event_start_at:        '',
  event_finish_at:       '',
  registration_start_at: '',
  registration_finish_at:'',
});

const openAddModal = () => {
  isEdit.value    = false;
  editingId.value = null;
  form.value = {
    name: '', description: '', location: '', location_url: '',
    event_start_at: '', event_finish_at: '',
    registration_start_at: '', registration_finish_at: '',
  };
  showModal.value = true;
};

const openEditModal = (row) => {
  isEdit.value    = true;
  editingId.value = row.id;
  const r = row.raw;
  form.value = {
    name:                   r.name ?? '',
    description:            r.description ?? '',
    location:               r.location ?? '',
    location_url:           r.location_url ?? '',
    event_start_at:         toInputDatetime(r.event_start_at),
    event_finish_at:        toInputDatetime(r.event_finish_at),
    registration_start_at:  toInputDatetime(r.registration_start_at),
    registration_finish_at: toInputDatetime(r.registration_finish_at),
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleSubmit = async () => {
  if (!form.value.name || !form.value.description || !form.value.event_start_at || !form.value.event_finish_at || !form.value.registration_start_at || !form.value.registration_finish_at) {
    showError('Harap lengkapi semua field yang wajib diisi.');
    return;
  }
  isSaving.value = true;
  try {
    const payload = { ...form.value };
    if (isEdit.value) {
      await updateEvent(editingId.value, payload);
      showSuccess('Event berhasil diperbarui.');
    } else {
      await createEvent(payload);
      showSuccess('Event berhasil ditambahkan.');
    }
    closeModal();
    await fetchEvents();
  } catch (err) {
    showError(err.response?.data?.message || 'Terjadi kesalahan.');
  } finally {
    isSaving.value = false;
  }
};

// ─── Delete ───────────────────────────────────────────────────────────────────
const handleDelete = async (row) => {
  const confirmed = await confirmDelete(row.name);
  if (!confirmed) return;
  try {
    await deleteEvent(row.id);
    showSuccess('Event berhasil dihapus.');
    await fetchEvents();
  } catch (err) {
    showError(err.response?.data?.message || 'Gagal menghapus event.');
  }
};

// ─── Navigation to sub-pages ──────────────────────────────────────────────────
const goToEventVisitor  = (row) => router.push(`/event/${row.id}/visitor`);
const goToEventFeedback = (row) => router.push(`/event/${row.id}/feedback`);
const goToEventSetting  = (row) => router.push(`/event/${row.id}/setting`);

// ─── Copy URL to clipboard ────────────────────────────────────────────────────
const copyUrl = (url) => {
  if (url && url !== '-') {
    navigator.clipboard.writeText(url).then(() => showSuccess('URL berhasil disalin!'));
  }
};



// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(fetchEvents);
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
            <div class="flex items-center justify-between mb-4">
              <h1 class="text-xl font-semibold text-gray-800">Event</h1>
              <nav class="flex items-center gap-1.5 text-sm text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                <span>Dashboard</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
                <span class="text-[#F7941D] font-medium">Event</span>
              </nav>
            </div>

            <!-- Toolbar -->
            <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-start gap-4">
              <div class="w-full sm:max-w-md">
                <SearchInput
                  v-model="searchQuery"
                  placeholder="Search Event"
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

              <button
                @click="openAddModal"
                class="flex items-center gap-2 px-5 py-2 bg-white border-2 border-[#F7941D]
                       text-[#F7941D] text-sm font-medium rounded-lg
                       hover:bg-[#F7941D] hover:text-white active:scale-95 transition-all"
              >
                <span class="text-lg leading-none">+</span>
                Create New Event
              </button>
            </div>

            <!-- Table -->
            <div class="flex-1 overflow-hidden">
              <DataTable
                :columns="tableColumns"
                :data="eventData"
                :loading="isLoading"
                :sort-key="sortKey"
                :sort-order="sortOrder"
                @sort="handleSort"
              >
                <template #url_registration="{ row }">
                  <div v-if="row.url_registration && row.url_registration !== '-'" class="flex items-center gap-2">
                    <span class="text-[13px] text-blue-500 truncate max-w-[160px]">{{ row.url_registration }}</span>
                    <button
                      @click="copyUrl(row.url_registration)"
                      class="shrink-0 w-[26px] h-[26px] rounded bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#FEF4E3] hover:text-[#F7941D] transition-colors focus:outline-none"
                      title="Copy URL"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    </button>
                  </div>
                  <span v-else class="text-gray-400">-</span>
                </template>

              <template #aksi="{ row }">
  <div class="flex items-center gap-2">

    <!-- Visitor -->
    <button
      @click="goToEventVisitor(row)"
      class="w-[38px] h-[38px] flex items-center justify-center rounded-lg hover:opacity-80 transition-all focus:outline-none"
      style="background: #EEF2FF;"
      title="Event Visitor"
    >
      <svg class="w-[18px] h-[18px] text-[#4075FF]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </button>

    <!-- Setting -->
    <button
      @click="goToEventSetting(row)"
      class="w-[38px] h-[38px] flex items-center justify-center rounded-lg hover:opacity-80 transition-all focus:outline-none"
      style="background: #FFF7E6;"
      title="Event Setting"
    >
      <svg class="w-[18px] h-[18px] text-[#F7941D]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    </button>

    <!-- Edit -->
    <button
      @click="openEditModal(row)"
      class="w-[38px] h-[38px] flex items-center justify-center rounded-lg hover:opacity-80 transition-all focus:outline-none"
      style="background: #E6F4FF;"
      title="Edit Event"
    >
      <img :src="EditIcon" alt="Edit" class="w-[18px] h-[18px]" />
    </button>

    <!-- Delete -->
    <button
      @click="handleDelete(row)"
      class="w-[38px] h-[38px] flex items-center justify-center rounded-lg hover:opacity-80 transition-all focus:outline-none"
      style="background: #FFEEEE;"
      title="Delete Event"
    >
      <img :src="DeleteIcon" alt="Delete" class="w-[18px] h-[18px]" />
    </button>

  </div>
</template>

                <template #empty>
                  <div class="flex flex-col items-center justify-center py-16 text-gray-400">
                    <svg class="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
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

    <!-- ─── Add / Edit Event Modal ─── -->
    <div v-if="showModal" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 relative animate-fade-in-up max-h-[90vh] flex flex-col">

        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">{{ isEdit ? 'Edit Event' : 'Add Event' }}</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Name <span class="text-red-500">*</span></label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Enter name here..."
              class="w-full border-b border-gray-300 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#F7941D] transition-colors bg-transparent"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Description <span class="text-red-500">*</span></label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Enter description here..."
              class="w-full border-b border-gray-300 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#F7941D] transition-colors bg-transparent resize-none"
            ></textarea>
          </div>

          <!-- Location -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Location</label>
            <textarea
              v-model="form.location"
              rows="2"
              placeholder="Enter location here..."
              class="w-full border-b border-gray-300 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#F7941D] transition-colors bg-transparent resize-none"
            ></textarea>
          </div>

          <!-- Location URL -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Location Url</label>
            <input
              v-model="form.location_url"
              type="text"
              placeholder="Enter location url here..."
              class="w-full border-b border-gray-300 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#F7941D] transition-colors bg-transparent"
            />
          </div>

          <!-- Event Start At -->
          <DateTimePicker
            v-model="form.event_start_at"
            label="Event Start At"
            :required="true"
          />

          <!-- Event Finish At -->
          <DateTimePicker
            v-model="form.event_finish_at"
            label="Event Finish At"
            :required="true"
          />

          <!-- Registration Start At -->
          <DateTimePicker
            v-model="form.registration_start_at"
            label="Registration Start At"
            :required="true"
          />

          <!-- Registration Finish At -->
          <DateTimePicker
            v-model="form.registration_finish_at"
            label="Registration Finish At"
            :required="true"
          />
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            @click="closeModal"
            class="px-6 py-2 border border-gray-300 rounded-lg text-gray-500 font-medium text-sm hover:bg-gray-50 transition-colors focus:outline-none"
          >
            Cancel
          </button>
          <button
            @click="handleSubmit"
            :disabled="isSaving"
            class="px-6 py-2 bg-[#F7941D] text-white rounded-lg font-medium text-sm hover:bg-[#E8850E] transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSaving ? 'Loading...' : 'Submit' }}
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
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
</style>
