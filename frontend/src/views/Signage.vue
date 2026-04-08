<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import Topbar from '@/components/Topbar.vue';
import Sidebar from '@/components/Sidebar.vue';
import DataTable from '@/components/common/DataTable.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import Modal from '@/components/common/Modal.vue';
import Toast from '@/components/common/Toast.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import notfound from '@/assets/notfound.svg';
import editIcon from '@/assets/edit.svg';
import deleteIcon from '@/assets/delete.svg';
import { confirmDelete, showSuccess, showError } from '@/utils/alertHelper';
import {
  getAllSignages,
  createSignage,
  updateSignage,
  deleteSignage,
} from '@/services/signageService';

// ─── State ───────────────────────────────────────────────────────────────────
const signageData    = ref([]);
const isLoading      = ref(false);
const searchQuery    = ref('');
const appliedSearch  = ref('');
const perPage        = ref(10);
const currentPage    = ref(1);
const totalRecords   = ref(0);

// ─── Kolom Tabel ─────────────────────────────────────────────────────────────
const tableColumns = [
  { key: 'name',  label: 'NAME',   sortable: true },
  { key: 'url',   label: 'URL',    sortable: true },
  { key: 'aksi',  label: 'ACTION', sortable: false },
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

// ─── Fetch Data ───────────────────────────────────────────────────────────────
const fetchSignages = async () => {
  isLoading.value = true;
  try {
    const response = await getAllSignages({ page: 1, size: 100 });
    const res   = response.data || response;
    const items = Array.isArray(res) ? res : (res.data || res.items || []);
    totalRecords.value = items.length;

    signageData.value = items.map(s => ({
      id:   s.id,
      name: s.name ?? '-',
      url:  s.url  ?? s.link ?? '-',
      raw:  s,
    }));
  } catch (err) {
    console.error('Gagal memuat data signage:', err);
    signageData.value  = [];
    totalRecords.value = 0;
  } finally {
    isLoading.value = false;
  }
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredData.value.length / perPage.value))
);
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return sortedData.value.slice(start, start + perPage.value);
});
const showingFrom = computed(() => {
  if (filteredData.value.length === 0) return 0;
  return (currentPage.value - 1) * perPage.value + 1;
});
const showingTo = computed(() =>
  Math.min(currentPage.value * perPage.value, filteredData.value.length)
);
const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

// ─── Search ───────────────────────────────────────────────────────────────────
const executeSearch = () => {
  appliedSearch.value = searchQuery.value;
  currentPage.value   = 1;
};
watch(searchQuery, (val) => {
  if (val === '') executeSearch();
});
watch(perPage, () => { currentPage.value = 1; });

// ─── Modal (Create / Edit) ───────────────────────────────────────────────────
const showModal      = ref(false);
const editingSignage = ref(null);
const formName       = ref('');
const formUrl        = ref('');
const isSubmitting   = ref(false);

const handleCreateNew = () => {
  editingSignage.value = null;
  formName.value = '';
  formUrl.value  = '';
  showModal.value = true;
};

const handleEdit = (row) => {
  editingSignage.value = row;
  formName.value = row.name;
  formUrl.value  = row.url;
  showModal.value = true;
};

const handleCloseModal = () => {
  showModal.value      = false;
  editingSignage.value = null;
  formName.value       = '';
  formUrl.value        = '';
};

const handleSubmit = async () => {
  if (!formName.value.trim()) return;
  isSubmitting.value = true;
  try {
    const payload = {
      name: formName.value.trim(),
      url:  formUrl.value.trim(),
    };
    if (editingSignage.value) {
      await updateSignage(editingSignage.value.id, payload);
      showSuccess('Signage berhasil diperbarui.');
    } else {
      await createSignage(payload);
      showSuccess('Signage berhasil ditambahkan.');
    }
    handleCloseModal();
    await fetchSignages();
  } catch (err) {
    console.error('Gagal menyimpan signage:', err);
    showError(err.response?.data?.message || 'Gagal menyimpan signage.');
  } finally {
    isSubmitting.value = false;
  }
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

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(fetchSignages);
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
              <h1 class="text-xl font-semibold text-gray-800">Signage</h1>

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
                <span class="text-[#F7941D] font-medium">Signage</span>
              </nav>
            </div>

            <!-- ── Toolbar: Search + Per-Page + Create Button ── -->
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
                class="h-9 px-3 border border-gray-300 rounded-sm text-sm text-gray-600
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

              <!-- Tombol Create New Signage -->
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

            <!-- ── DataTable ── -->
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
                  <div class="flex items-center gap-2 relative">
                    
                    <button 
                      @click="toggleDropdown(row.id)"
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
                      <button @click="handleEditPengguna(row)" class="w-full text-left px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-[#FEF4E3] hover:text-[#F7941D] focus:outline-none">
                        Edit Data
                      </button>
                      <button @click="handlePermission(row)" class="w-full text-left px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-[#FEF4E3] hover:text-[#F7941D] focus:outline-none">
                        Permission
                      </button>
                    </div>

                    <button 
                      @click="handleDeletePengguna(row)"
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

          </div><!-- /p-6 -->

          <!-- ── Pagination Footer ── -->
          <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing {{ showingFrom }} to {{ showingTo }} from {{ filteredData.length }} records
            </span>

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

    <!-- ── Modal Create / Edit Signage ── -->
    <Modal
      :show="showModal"
      :title="editingSignage ? 'Edit Signage' : 'Create New Signage'"
      :description="editingSignage ? 'Ubah informasi signage.' : 'Masukkan informasi signage baru.'"
      width="half"
      @close="handleCloseModal"
    >
      <form id="formSignage" @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Nama -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Signage</label>
          <input
            v-model="formName"
            type="text"
            required
            placeholder="Masukkan nama signage"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-[#F7941D]/30 focus:border-[#F7941D]
                   transition-colors"
          />
        </div>
        <!-- URL -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">URL</label>
          <input
            v-model="formUrl"
            type="url"
            placeholder="https://example.com"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-[#F7941D]/30 focus:border-[#F7941D]
                   transition-colors"
          />
        </div>
      </form>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            @click="handleCloseModal"
            class="px-5 py-2.5 text-sm font-medium text-gray-600
                   border border-gray-300 rounded-lg
                   hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="formSignage"
            :disabled="isSubmitting"
            class="px-5 py-2.5 text-sm font-medium text-white
                   bg-[#F7941D] rounded-lg
                   hover:bg-[#E8850E] transition-colors
                   disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ editingSignage ? 'Perbarui' : 'Simpan' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Toast Notification -->
    <Toast
      :show="showToast"
      :message="toastMessage"
      @close="handleCloseToast"
    />
  </div>
</template>