<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Topbar from '@/components/Topbar.vue';
import Sidebar from '@/components/Sidebar.vue';
import DataTable from '@/components/common/DataTable.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import DateTimePicker from '@/components/common/DateTimePicker.vue';
import Modal from '@/components/common/Modal.vue';
import Toast from '@/components/common/Toast.vue';
import Pagination from '@/components/common/Pagination.vue'; // 🌟 Import Pagination
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
  { key: 'name',             label: 'Name',             sortable: true,  width: 'w-[20%]' },
  { key: 'start_at',         label: 'Event Start',      sortable: true,  width: 'w-[16%]' },
  { key: 'finish_at',        label: 'Event Finish',     sortable: true,  width: 'w-[16%]' },
  { key: 'url_registration', label: 'URL Registration', sortable: false, width: 'w-[16%]' },
  { key: 'location_url',     label: 'URL Location',     sortable: false, width: 'w-[16%]' },
  { key: 'aksi',             label: 'Action',           sortable: false, width: 'w-[16%]' },
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
      id:                 e.id,
      name:               e.name ?? '-',
      description:        e.description ?? '',
      location:           e.location ?? '',
      location_url:       e.location_url ?? '',
      start_at:           formatDateTime(e.start_at),
      finish_at:          formatDateTime(e.finish_at),
      registration_start_at:     e.registration_start_at ?? '',
      registration_finish_at:    e.registration_finish_at ?? '',
      url_registration: e.url_registration ?? e.registration_url ?? '-',
      raw:                e,
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

// ─── Search & Watchers ────────────────────────────────────────────────────────
const executeSearch = () => {
  appliedSearch.value = searchQuery.value;
  currentPage.value   = 1;
  fetchEvents();
};

watch(searchQuery, (val) => { if (val === '') executeSearch(); });
watch(perPage, () => { 
  if(currentPage.value !== 1) {
    currentPage.value = 1;
  } else {
    fetchEvents(); 
  }
});
watch(currentPage, () => {
  fetchEvents();
});


// ─── Modal Add/Edit ───────────────────────────────────────────────────────────
const showModal    = ref(false);
const isEdit       = ref(false);
const isSaving     = ref(false);
const editingId    = ref(null);
const showToast    = ref(false);
const toastMessage = ref('');

// ─── Form & Validasi Tanggal ──────────────────────────────────────────────────
const dateErrors = ref({
  event_finish_at:        '',
  registration_finish_at: '',
  registration_start_at:  '',
});

const form = ref({
  name:                  '',
  description:           '',
  location:              '',
  location_url:          '',
  start_at:        '',
  finish_at:       '',
  registration_start_at: '',
  registration_finish_at:'',
});

const validateDates = () => {
  dateErrors.value.event_finish_at = '';
  dateErrors.value.registration_finish_at = '';
  dateErrors.value.registration_start_at = '';

  const eventStart  = form.value.start_at  ? new Date(form.value.start_at)  : null;
  const eventFinish = form.value.finish_at  ? new Date(form.value.finish_at) : null;
  const regStart    = form.value.registration_start_at  ? new Date(form.value.registration_start_at)  : null;
  const regFinish   = form.value.registration_finish_at ? new Date(form.value.registration_finish_at) : null;

  if (eventStart && eventFinish && eventFinish <= eventStart) {
    dateErrors.value.event_finish_at = 'Waktu selesai event harus setelah waktu mulai event.';
  }
  if (regStart && regFinish && regFinish <= regStart) {
    dateErrors.value.registration_finish_at = 'Waktu selesai registrasi harus setelah waktu mulai registrasi.';
  }
  if (regStart && eventStart && regStart >= eventStart) {
    dateErrors.value.registration_start_at = 'Waktu mulai registrasi harus sebelum waktu mulai event.';
  }
};

watch(
  () => [
    form.value.start_at,
    form.value.finish_at,
    form.value.registration_start_at,
    form.value.registration_finish_at,
  ],
  validateDates,
  { deep: true }
);

const hasDateErrors = computed(() =>
  Object.values(dateErrors.value).some(msg => msg !== '')
);

const openAddModal = () => {
  isEdit.value    = false;
  editingId.value = null;
  form.value = {
    name: '', description: '', location: '', location_url: '',
    start_at: '', finish_at: '',
    registration_start_at: '', registration_finish_at: '',
  };
  dateErrors.value = { event_finish_at: '', registration_finish_at: '', registration_start_at: '' };
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
    start_at:         toInputDatetime(r.start_at),
    finish_at:        toInputDatetime(r.finish_at),
    registration_start_at:  toInputDatetime(r.registration_start_at),
    registration_finish_at: toInputDatetime(r.registration_finish_at),
  };
  dateErrors.value = { event_finish_at: '', registration_finish_at: '', registration_start_at: '' };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleSubmit = async () => {
  if (!form.value.name || !form.value.description || !form.value.start_at || !form.value.finish_at || !form.value.registration_start_at || !form.value.registration_finish_at) {
    showError('Harap lengkapi semua field yang wajib diisi.');
    return;
  }

  validateDates();
  if (hasDateErrors.value) {
    showError('urutan tanggal yang dimasukkan salah.');
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

// ─── Navigation & Copy ─────────────────────────────────────────────────────────
const goToEventVisitor  = (row) => router.push(`/event/${row.id}/visitor`);
const goToEventSetting  = (row) => router.push(`/event/${row.id}/setting`);

const copyUrl = (url) => {
  if (url && url !== '-') {
    navigator.clipboard.writeText(url).then(() => showSuccess('URL berhasil disalin!'));
  }
};

onMounted(fetchEvents);
</script>

<template>
  <main class="bg-white rounded-2xl shadow-sm h-full min-h-[calc(100vh-7rem)] flex flex-col relative w-full">
    <div class="p-6 flex-1 flex flex-col">

      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 mb-1">Event</h1>
          <p class="text-sm text-gray-500">Kelola dan pantau seluruh data event yang ada.</p>
        </div>  
        <button
          @click="openAddModal"
          class="flex items-center gap-2 px-5 py-2 bg-white border-2 border-[#F7941D]
                 text-[#F7941D] text-sm font-medium rounded-sm
                 hover:bg-[#F7941D] hover:text-white active:scale-95 transition-all"
        >
          <span class="text-lg leading-none">+</span>
          Create New Event
        </button>              
      </div>

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
            class="appearance-none bg-white border border-gray-200 rounded-sm pl-4 pr-9 py-2 text-[13px] text-gray-400 font-medium focus:outline-none focus:border-gray-300 cursor-pointer w-17.5"
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
          :data="eventData"
          :loading="isLoading"
          :sort-key="sortKey"
          :sort-order="sortOrder"
          @sort="handleSort"
        >
          <template #url_location="{ row }">
            <div v-if="row.location_url && row.location_url !== ''" class="flex items-center gap-2">
              <a
                :href="row.location_url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-[13px] text-blue-500 truncate max-w-[150px] hover:underline"
                :title="row.location_url"
              >{{ row.location_url }}</a>
              <button
                @click="copyUrl(row.location_url)"
                class="shrink-0 w-[26px] h-[26px] rounded bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#FEF4E3] hover:text-[#F7941D] transition-colors focus:outline-none"
                title="Copy URL Lokasi"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
            <span v-else class="text-gray-400">-</span>
          </template>

          <template #url_registration="{ row }">
            <div v-if="row.url_registration && row.url_registration !== '-'" class="flex items-center gap-2">
              <a 
                :href="row.url_registration" 
                target="_blank" 
                class="text-[13px] text-gray-800 truncate max-w-40"
              >
                {{ row.url_registration }}
              </a>
              <button
                @click="copyUrl(row.url_registration)"
                class="shrink-0 w-6.5 h-6.5 rounded bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#FEF4E3] hover:text-[#F7941D] transition-colors focus:outline-none"
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

          <template #location_url="{ row }">
            <div v-if="row.location_url && row.location_url !== '-'" class="flex items-center gap-2">
              <a 
                :href="row.location_url" 
                target="_blank" 
                class="text-[13px] text-gray-800 truncate max-w-40"
              >
                {{ row.location_url }}
              </a>
              <button
                @click="copyUrl(row.location_url)"
                class="shrink-0 w-6.5 h-6.5 rounded bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#FEF4E3] hover:text-[#F7941D] transition-colors focus:outline-none"
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
              <button
                @click="goToEventVisitor(row)"
                class="w-9.5 h-9.5 flex items-center justify-center rounded-lg hover:opacity-80 transition-all focus:outline-none"
                style="background: #EEF2FF;"
                title="Event Visitor"
              >
                <svg class="w-4.5 h-4.5 text-[#4075FF]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>

              <button
                @click="goToEventSetting(row)"
                class="w-9.5 h-9.5 flex items-center justify-center rounded-lg hover:opacity-80 transition-all focus:outline-none"
                style="background: #FFF7E6;"
                title="Event Setting"
              >
                <svg class="w-4.5 h-4.5 text-[#F7941D]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>

              <button
                @click="openEditModal(row)"
                class="w-9.5 h-9.5 flex items-center justify-center rounded-lg hover:opacity-80 transition-all focus:outline-none"
                style="background: #E6F4FF;"
                title="Edit Event"
              >
                <img :src="EditIcon" alt="Edit" class="w-4.5 h-4.5" />
              </button>

              <button
                @click="handleDelete(row)"
                class="w-9.5 h-9.5 flex items-center justify-center rounded-lg hover:opacity-80 transition-all focus:outline-none"
                style="background: #FFEEEE;"
                title="Delete Event"
              >
                <img :src="DeleteIcon" alt="Delete" class="w-4.5 h-4.5" />
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

    <Pagination
      v-model:current-page="currentPage"
      :total-data="totalRecords"
      :per-page="perPage"
    />

  </main>

  <Modal
    :show="showModal"
    :title="isEdit ? 'Edit Event' : 'Tambah Event'"
    :description="isEdit ? 'Ubah informasi event yang sudah ada.' : 'Masukan informasi event baru ke dalam sistem.'"
    width="half"
    @close="closeModal"
  >
    <div class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Nama Event <span class="text-red-500">*</span></label>
        <input
          v-model="form.name"
          type="text"
          placeholder="Masukkan nama event..."
          class="w-full bg-[#FFFFFF] border border-gray-200 rounded-sm px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]/20 transition-colors"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi <span class="text-red-500">*</span></label>
        <textarea
          v-model="form.description"
          rows="3"
          placeholder="Masukkan deskripsi event..."
          class="w-full bg-[#FFFFFF] border border-gray-200 rounded-sm px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]/20 transition-colors resize-none"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Lokasi</label>
        <textarea
          v-model="form.location"
          rows="2"
          placeholder="Masukkan lokasi event..."
          class="w-full bg-[#FFFFFF] border border-gray-200 rounded-sm px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]/20 transition-colors resize-none"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">URL Lokasi</label>
        <input
          v-model="form.location_url"
          type="text"
          placeholder="Masukkan URL lokasi..."
          class="w-full bg-[#FFFFFF] border border-gray-200 rounded-sm px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]/20 transition-colors"
        />
      </div>

      <DateTimePicker
        v-model="form.start_at"
        label="Waktu Mulai Event"
        :required="true"
      />

      <div>
        <DateTimePicker
          v-model="form.finish_at"
          label="Waktu Selesai Event"
          :required="true"
          :class="{ 'ring-1 ring-red-400 rounded-sm': dateErrors.event_finish_at }"
        />
        <Transition name="err-fade">
          <p v-if="dateErrors.event_finish_at" class="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            {{ dateErrors.event_finish_at }}
          </p>
        </Transition>
      </div>

      <div>
        <DateTimePicker
          v-model="form.registration_start_at"
          label="Waktu Mulai Registrasi"
          :required="true"
          :class="{ 'ring-1 ring-red-400 rounded-sm': dateErrors.registration_start_at }"
        />
        <Transition name="err-fade">
          <p v-if="dateErrors.registration_start_at" class="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            {{ dateErrors.registration_start_at }}
          </p>
        </Transition>
      </div>

      <div>
        <DateTimePicker
          v-model="form.registration_finish_at"
          label="Waktu Selesai Registrasi"
          :required="true"
          :class="{ 'ring-1 ring-red-400 rounded-sm': dateErrors.registration_finish_at }"
        />
        <Transition name="err-fade">
          <p v-if="dateErrors.registration_finish_at" class="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            {{ dateErrors.registration_finish_at }}
          </p>
        </Transition>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button
          type="button"
          @click="closeModal"
          class="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors focus:outline-none"
        >
          Batal
        </button>
        <button
          type="button"
          @click="handleSubmit"
          :disabled="isSaving || hasDateErrors"
          :title="hasDateErrors ? 'Periksa kembali urutan tanggal' : ''"
          class="px-5 py-2.5 text-sm font-medium text-white rounded-sm transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          :class="hasDateErrors ? 'bg-gray-400' : 'bg-[#F7941D] hover:bg-[#E8850E]'"
        >
          {{ isSaving ? 'Menyimpan...' : (isEdit ? 'Perbarui Event' : 'Tambah Event') }}
        </button>
      </div>
    </template>
  </Modal>

  <Toast
    :show="showToast"
    :message="toastMessage"
    @close="showToast = false"
  />
</template>

<style scoped>
button:focus {
  outline: none !important;
  box-shadow: none !important;
}

.err-fade-enter-active { transition: all 0.2s ease-out; }
.err-fade-leave-active { transition: all 0.15s ease-in; }
.err-fade-enter-from  { opacity: 0; transform: translateY(-4px); }
.err-fade-leave-to    { opacity: 0; transform: translateY(-4px); }
</style>