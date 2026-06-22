<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import DataTable from '@/components/common/DataTable.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import DateTimePicker from '@/components/common/DateTimePicker.vue';
import Modal from '@/components/common/Modal.vue';
import Toast from '@/components/common/Toast.vue';
import Pagination from '@/components/common/Pagination.vue';
import SettingIcon from '@/assets/settings-3-line.svg';
import DeleteIcon from '@/assets/delete.svg';
import EditIcon from '@/assets/edit-box-line.svg';
import EmptyState from '@/components/common/EmptyState.vue';
import notfound from '@/assets/notfound.svg';

import { confirmDelete, showSuccess, showError, parseApiError } from '@/utils/alertHelper';
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '@/services/eventService';

const { t } = useI18n();
const router = useRouter();

// ─── State ───────────────────────────────────────────────────────────────────
const eventData    = ref([]);
const isLoading    = ref(false);
const searchQuery  = ref('');
const appliedSearch = ref('');
const perPage      = ref(10);
const currentPage  = ref(1);
const totalRecords = ref(0);

// ─── Dropdown State dengan Posisi Dinamis ────────────────────────────────────
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
      left: `${buttonRect.left + window.scrollX}px` 
    };
  }
};

const closeDropdown = () => {
  activeDropdown.value = null;
};

// ─── Kolom Tabel ─────────────────────────────────────────────────────────────
const tableColumns = computed(() => [
  { key: 'name',             label: t('event.table.name'),            sortable: true,  width: 'w-[20%]' },
  { key: 'start_at',         label: t('event.table.eventStart'),      sortable: true,  width: 'w-[16%]' },
  { key: 'finish_at',        label: t('event.table.eventFinish'),     sortable: true,  width: 'w-[16%]' },
  { key: 'url_registration', label: t('event.table.urlRegistration'), sortable: false, width: 'w-[16%]' },
  { key: 'location_url',     label: t('event.table.urlLocation'),     sortable: false, width: 'w-[16%]' },
  { key: 'aksi',             label: t('event.table.action'),          sortable: false, width: 'w-[16%]' },
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
};

const sortedData = computed(() => {
  if (!sortKey.value) return eventData.value; 

  return [...eventData.value].sort((a, b) => { 
    const valA = a[sortKey.value] ?? '';
    const valB = b[sortKey.value] ?? '';
    const cmp = String(valA).localeCompare(String(valB), 'id', { sensitivity: 'base' });
    return sortOrder.value === 'asc' ? cmp : -cmp;
  });
});

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

const urlError = ref('');
const urlTouched = ref(false);

const isValidUrl = (urlString) => {
  if (!urlString) return false;
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
};

// ─── Form & Validasi Tanggal ──────────────────────────────────────────────────
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

const dateErrors = ref({
  event_finish_at:        '',
  registration_finish_at: '',
  registration_start_at:  '',
});

// watch URL — harus setelah form di-declare
watch(
  () => form.value.location_url,
  (newVal) => {
    if (!urlTouched.value) return; // hanya validasi setelah field disentuh
    if (!newVal) {
      urlError.value = 'URL Lokasi wajib diisi.';
    } else if (!isValidUrl(newVal)) {
      urlError.value = 'Format URL tidak valid (harus menyertakan http:// atau https://).';
    } else {
      urlError.value = '';
    }
  }
);


const validateDates = () => {
  dateErrors.value.event_finish_at = '';
  dateErrors.value.registration_finish_at = '';
  dateErrors.value.registration_start_at = '';

  const eventStart  = form.value.start_at  ? new Date(form.value.start_at)  : null;
  const eventFinish = form.value.finish_at  ? new Date(form.value.finish_at) : null;
  const regStart    = form.value.registration_start_at  ? new Date(form.value.registration_start_at)  : null;
  const regFinish   = form.value.registration_finish_at ? new Date(form.value.registration_finish_at) : null;

  if (eventStart && eventFinish && eventFinish <= eventStart) {
    dateErrors.value.event_finish_at = t('event.validation.finishAfterStart');
  }
  if (regStart && regFinish && regFinish <= regStart) {
    dateErrors.value.registration_finish_at = t('event.validation.regFinishAfterStart');
  }
  if (regStart && eventStart && regStart >= eventStart) {
    dateErrors.value.registration_start_at = t('event.validation.regStartBeforeEvent');
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
  urlError.value   = '';
  urlTouched.value = false;
  showModal.value  = true;
};

const openEditModal = (row) => {
  closeDropdown();
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
  urlError.value   = '';
  urlTouched.value = false;
  showModal.value  = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleSubmit = async () => {
  // Tandai field URL sudah disentuh agar error muncul
  urlTouched.value = true;

  if (
    !form.value.name || 
    !form.value.description || 
    !form.value.start_at || 
    !form.value.finish_at || 
    !form.value.registration_start_at || 
    !form.value.registration_finish_at ||
    !form.value.location_url 
  ) {
    if (!form.value.location_url) {
      urlError.value = 'URL Lokasi wajib diisi.';
    }
    showError(t('event.validation.requiredFields'));
    return;
  }

  if (!isValidUrl(form.value.location_url)) {
    urlError.value = 'Format URL tidak valid (harus menyertakan http:// atau https://).';
    showError('Terdapat input URL yang tidak valid.');
    return;
  }
  
  validateDates();
  if (hasDateErrors.value) {
    showError(t('event.validation.invalidDates'));
    return;
  }

  isSaving.value = true;
  try {
    const payload = { ...form.value };
    if (isEdit.value) {
      await updateEvent(editingId.value, payload);
      showSuccess(t('event.success.updated'));
    } else {
      await createEvent(payload);
      showSuccess(t('event.success.added'));
    }
    closeModal();
    await fetchEvents();
  } catch (err) {
    showError(parseApiError(err, t('event.error.generic')));
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
    await deleteEvent(row.id);
    showSuccess(t('event.success.deleted'));
    await fetchEvents();
  } catch (err) {
    showError(parseApiError(err, t('event.error.deleteFailed')));
  }
};

// ─── Navigation & Copy ─────────────────────────────────────────────────────────
const goToEventVisitor  = (row) => {
  closeDropdown();
  router.push(`/event/${row.id}/visitor`);
};
const goToEventSetting  = (row) => {
  closeDropdown();
  router.push(`/event/${row.id}/setting`);
};

const copyUrl = (url) => {
  if (url && url !== '-') {
    navigator.clipboard.writeText(url).then(() => showSuccess(t('event.success.urlCopied')));
  }
};

onMounted(() => {
  fetchEvents();
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

      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 mb-1">{{ t('event.title') }}</h1>
          <p class="text-sm text-gray-500">{{ t('event.subtitle') }}</p>
        </div>  
        <button
          @click="openAddModal"
          class="flex items-center gap-2 px-5 py-2 bg-white border-2 border-[#F7941D]
                 text-[#F7941D] text-sm font-medium rounded-sm
                 hover:bg-[#F7941D] hover:text-white active:scale-95 transition-all"
        >
          <span class="text-lg leading-none">+</span>
          {{ t('event.createButton') }}
        </button>              
      </div>

      <div class="mb-6">
        <div class="w-full sm:max-w-md">
          <SearchInput 
            v-model="searchQuery" 
            v-model:perPage="perPage"
            :placeholder="t('branch.searchPlaceholder')" 
            @search="executeSearch"  
          />
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
            <div v-if="row.location_url && row.location_url !== '-' && row.location_url !== ''" class="flex items-center gap-2">
              <!-- Jika valid URL (http/https), tampilkan sebagai link -->
              <a
                v-if="isValidUrl(row.location_url)"
                :href="row.location_url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-[13px] text-gray-800 truncate max-w-[130px] hover:underline"
                :title="row.location_url"
              >{{ row.location_url }}</a>
              <!-- Jika bukan URL valid, tampilkan sebagai teks biasa -->
              <span
                v-else
                class="text-[13px] text-gray-800 truncate max-w-[130px]"
                :title="row.location_url"
              >{{ row.location_url }}</span>
              <button
                @click="copyUrl(row.location_url)"
                class="shrink-0 w-6.5 h-6.5 rounded bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#FEF4E3] hover:text-[#F7941D] transition-colors focus:outline-none"
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

          <template #aksi="{ row }">
            <div class="flex items-center gap-2 relative">
              
              <button 
                @click.stop="toggleDropdown(row.id, $event)"
                class="w-[30px] h-[30px] rounded border border-[#F7941D] flex items-center justify-center text-[#F7941D] hover:bg-[#FEF4E3] transition-colors focus:outline-none relative"
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
                    @click="goToEventVisitor(row)" 
                    class="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-[#FEF4E3] hover:text-[#F7941D] focus:outline-none transition-colors"
                  >
                    Event Visitor
                  </button>
                  
                  <button 
                    @click="goToEventSetting(row)" 
                    class="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-[#FEF4E3] hover:text-[#F7941D] focus:outline-none transition-colors"
                  >
                    Event Setting
                  </button>

                  <button 
                    @click="openEditModal(row)" 
                    class="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-[#FEF4E3] hover:text-[#F7941D] focus:outline-none transition-colors"
                  >
                    Edit Data
                  </button>
                </div>
              </Teleport>

              <button 
                @click="handleDelete(row)"
                class="w-[30px] h-[30px] rounded bg-[#E45454] flex items-center justify-center text-white hover:bg-[#D24A4A] transition-colors focus:outline-none relative z-10"
                title="Hapus"
              >
                <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path>
                </svg>
              </button>

            </div>
          </template>

          <template #empty>
            <EmptyState 
              v-if="eventData.length === 0"
              :icon="notfound"
              title="Event Belum Tersedia"
              description="Tambahkan event terlebih dahulu agar dapat dikelola dan dipantau."
              buttonText="Tambah Event"
              @action="openAddModal"
            />
            <EmptyState 
              v-else
              :icon="notfound"
              title="No Records to display"
              :description="`Tidak ada event yang cocok dengan kata kunci '${appliedSearchQuery}'`"
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

  <Modal
    :show="showModal"
    :title="isEdit ? t('event.modal.editTitle') : t('event.modal.addTitle')"
    :description="isEdit ? t('event.modal.editDesc') : t('event.modal.addDesc')"
    width="half"
    @close="closeModal"
  >
    <div class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('event.modal.eventName') }} <span class="text-red-500">*</span></label>
        <input
          v-model="form.name"
          type="text"
          :placeholder="t('event.modal.eventNamePlaceholder')"
          class="w-full bg-[#F8FAFC] border border-gray-200 rounded-sm px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]/20 transition-colors"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('event.modal.description') }} <span class="text-red-500">*</span></label>
        <textarea
          v-model="form.description"
          rows="3"
          :placeholder="t('event.modal.descriptionPlaceholder')"
          class="w-full bg-[#F8FAFC] border border-gray-200 rounded-sm px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]/20 transition-colors resize-none"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('event.modal.location') }}</label>
        <textarea
          v-model="form.location"
          rows="2"
          :placeholder="t('event.modal.locationPlaceholder')"
          class="w-full bg-[#F8FAFC] border border-gray-200 rounded-sm px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]/20 transition-colors resize-none"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">
          {{ t('event.modal.locationUrl') }} <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.location_url"
          type="text"
          :placeholder="t('event.modal.locationUrlPlaceholder')"
          class="w-full bg-[#F8FAFC] border rounded-sm px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors"
          :class="urlError && urlTouched ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-gray-200 focus:border-[#F7941D] focus:ring-[#F7941D]/20'"
          @blur="urlTouched = true"
          @input="urlTouched = true"
        />
        <Transition name="err-fade">
          <p v-if="urlError && urlTouched" class="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            {{ urlError }}
          </p>
        </Transition>
      </div>

      <DateTimePicker
        v-model="form.start_at"
        :label="t('event.modal.startAt')"
        :required="true"
      />

      <div>
        <DateTimePicker
          v-model="form.finish_at"
          :label="t('event.modal.finishAt')"
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
          :label="t('event.modal.regStartAt')"
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
          :label="t('event.modal.regFinishAt')"
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
          {{ t('event.modal.cancel') }}
        </button>
        <button
          type="button"
          @click="handleSubmit"
          :disabled="isSaving || hasDateErrors"
          :title="hasDateErrors ? t('event.modal.checkDates') : ''"
          class="px-5 py-2.5 text-sm font-medium text-white rounded-sm transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          :class="hasDateErrors ? 'bg-gray-400' : 'bg-[#F7941D] hover:bg-[#E8850E]'"
        >
          {{ isSaving ? t('event.modal.saving') : (isEdit ? t('event.modal.update') : t('event.modal.add')) }}
        </button>
      </div>
    </template>
  </Modal>

  <Toast
    :show="showToast"
    :message="toastMessage"
    @close="showToast = false"
  />
  </div>
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