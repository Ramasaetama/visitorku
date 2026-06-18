<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '@/components/common/DataTable.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import Toast from '@/components/common/Toast.vue';
import Pagination from '@/components/common/Pagination.vue'; 
import notfound from '@/assets/notfound.svg';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
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

// ─── Dropdown State dengan Posisi Dinamis (Mekar ke Kanan) ───────────────────
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
  { key: 'name',  label: t('signage.table.name'),   sortable: true },
  { key: 'url',   label: t('signage.table.url'),    sortable: true },
  { key: 'aksi',  label: t('signage.table.action'), sortable: false },
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

// ─── Paginated Data (Frontend slice) ──────────────────────────────────────────
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return sortedData.value.slice(start, start + perPage.value);
});

watch(filteredData, (newVal) => {
  totalRecords.value = newVal.length;
  const maxPage = Math.max(1, Math.ceil(newVal.length / perPage.value));
  if (currentPage.value > maxPage) {
    currentPage.value = 1;
  }
});


// ─── Fetch Data ───────────────────────────────────────────────────────────────
const fetchSignages = async () => {
  isLoading.value = true;
  try {
    const response = await getAllSignages({ page: 1, size: 1000 }); 
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
  closeDropdown();
  router.push(`/layar-informasi/create?edit=${row.id}`);
};

// ─── Delete ───────────────────────────────────────────────────────────────────
const handleDelete = async (row) => {
  closeDropdown();
  const confirmed = await confirmDelete('Signage');
  if (!confirmed) return;
  try {
    await deleteSignage(row.id);
    showSuccess(t('signage.success.deleted'));
    await fetchSignages();
  } catch (err) {
    showError(err.response?.data?.message || t('signage.error.deleteFailed'));
  }
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const showToast    = ref(false);
const toastMessage = ref('');
const handleCloseToast = () => { showToast.value = false; };

onMounted(() => {
  fetchSignages();
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
          <h1 class="text-2xl font-semibold text-gray-800 mb-1">{{ t('signage.title') }}</h1>
          <p class="text-sm text-gray-500">{{ t('signage.subtitle') }}</p>
        </div>  
        <button
          @click="handleCreateNew"
          class="flex items-center gap-2 px-5 py-2 bg-white border-2 border-[#F7941D]
                 text-[#F7941D] text-sm font-medium rounded-sm
                 hover:bg-[#F7941D] hover:text-white active:scale-95 transition-all"
        >
          <span class="text-lg leading-none">+</span>
          {{ t('signage.createBtn') }}
        </button>              
      </div>

      <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-start gap-4">
        <div class="w-full sm:max-w-md">
          <SearchInput 
            v-model="searchQuery" 
            v-model:perPage="perPage"
            :placeholder="t('signage.searchPlaceholder')" 
            @keyup.enter="executeSearch"  
          />
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
                @click.stop="toggleDropdown(row.id, $event)"
                class="w-[30px] h-[30px] rounded-sm border border-[#F7941D] flex items-center justify-center text-[#F7941D] hover:bg-[#FEF4E3] transition-colors focus:outline-none relative z-10"
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
                  <button @click="handleEdit(row)" class="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-[#FEF4E3] hover:text-[#F7941D] focus:outline-none transition-colors">
                    {{ t('signage.editData') }}
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
              v-if="signageData.length === 0"
              :icon="notfound"
              :title="t('signage.empty.noData')"
              :description="t('signage.empty.noDataDesc')"
              :buttonText="t('signage.empty.noDataBtn')"
              @action="handleCreateNew"
            />
            <EmptyState 
              v-else
              :icon="notfound"
              :title="t('signage.empty.notFound')"
              :description="`${t('signage.empty.notFoundDesc')} '${appliedSearch}'`"
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

  <Toast
    :show="showToast"
    :message="toastMessage"
    @close="handleCloseToast"
  />
  </div>
</template>

<style scoped>
button:focus, select:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>