<script setup>
import Sidebar from '@/components/Sidebar.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import DataTable from '@/components/common/DataTable.vue';
import Modal from '@/components/common/Modal.vue';
import Toast from '@/components/common/Toast.vue';
import FormTambahPengguna from '@/components/pengguna/FormTambahPengguna.vue';
import FormPermissionPengguna from '@/components/pengguna/FormPermissionPengguna.vue'; 
import Pagination from '@/components/common/Pagination.vue';
import notfound from '@/assets/notfound.svg';
import Topbar from '@/components/Topbar.vue';
import { useI18n } from 'vue-i18n';
import keyline from '@/assets/icons/key-line.svg';
import editIcon from '@/assets/icons/edit-box-line.svg';
import { ref, onMounted, computed, watch } from 'vue';
import { getAllUsers, createUser, updateUser, deleteUser } from '@/services/userService';
import { getAllBranches } from '@/services/cabangService';
import { useConfirmDelete } from '@/composables/useConfirmDelete';
import { useToastNotification } from '@/composables/useToastNotification';

const { t } = useI18n();
const { confirmDelete } = useConfirmDelete();
const { showSuccess, showError } = useToastNotification();

const searchQuery = ref('');
const appliedSearchQuery = ref('');
const isLoading = ref(false);

const penggunaData = ref([]);
const branchesData = ref([]);

const currentPage = ref(1);
const itemsPerPage = ref(10); 

const executeSearch = () => {
  appliedSearchQuery.value = searchQuery.value;
  currentPage.value = 1;
};

watch(searchQuery, (nilaiBaru) => {
  if (nilaiBaru === '') executeSearch(); 
});

const tableColumns = computed(() => [
  { key: 'name', label: t('userManagement.table.name'), sortable: true },
  { key: 'email', label: t('userManagement.table.email'), sortable: true },
  { key: 'phone', label: t('userManagement.table.phone'), sortable: true },
  { key: 'branch_name', label: t('userManagement.table.branch'), sortable: true },
  { key: 'aksi', label: t('userManagement.table.action'), sortable: false },
]);

const filteredData = computed(() => {
  if (!appliedSearchQuery.value) return penggunaData.value;
  const keyword = appliedSearchQuery.value.toLowerCase();
  return penggunaData.value.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(keyword)
    )
  );
});

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
  if (!sortKey.value) return filteredData.value;
  return [...filteredData.value].sort((a, b) => {
    const valA = a[sortKey.value] ?? '';
    const valB = b[sortKey.value] ?? '';
    const cmp = String(valA).localeCompare(String(valB), 'id', { sensitivity: 'base' });
    return sortOrder.value === 'asc' ? cmp : -cmp;
  });
});

const totalItems = computed(() => filteredData.value.length);
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedData.value.slice(start, end);
});

const fetchAllData = async () => {
  isLoading.value = true;
  try {
    const branchRes = await getAllBranches({ page: 1, size: 100 });
    branchesData.value = branchRes?.data?.data || branchRes?.data || [];

    const userRes = await getAllUsers({ page: 1, size: 100 });
    const items = userRes?.data?.data || userRes?.data || [];

    penggunaData.value = items.map(user => {
      const matchedBranch = branchesData.value.find(b => b.id === user.branch_id);
      return {
        ...user,
        branch_name: matchedBranch?.name || '-',
      };
    });
  } catch (error) {
    console.error('Gagal memuat data pengguna:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchAllData);

const activeDropdown = ref(null);

const showModal = ref(false);
const editingUser = ref(null); 
const showPermissionModal = ref(false);
const editingPermissionUser = ref(null);
const toastMessage = ref('');
const showToast = ref(false);

const handleTambahPengguna = () => {
  editingUser.value = null;
  showModal.value = true;
};

const handleCloseModal = () => {
  showModal.value = false;
  editingUser.value = null;
};

const handleSubmitPengguna = async (formData) => {
  try {
    if (editingUser.value) {
      await updateUser(editingUser.value.id, formData);
    } else {
      await createUser(formData);
    }
    showSuccess(t('userManagement.success.saved'));
    handleCloseModal();
    await fetchAllData();
  } catch (error) {
    showError(error.response?.data?.message || t('userManagement.error.generic'));
  }
};

const handleEditPengguna = (row) => {
  editingUser.value = { ...row };
  showModal.value = true;
};

const handlePermission = (row) => {
  editingPermissionUser.value = { ...row };
  showPermissionModal.value = true;
};

const handleSubmitPermission = async (data) => {
  try {
    await updateUser(editingPermissionUser.value.id, { permissions: data });
    showSuccess(t('userManagement.success.permissionSaved'));
    showPermissionModal.value = false;
    await fetchAllData();
  } catch (error) {
    showError(error.response?.data?.message || t('userManagement.error.permissionFailed'));
  }
};

const handleDeletePengguna = async (row) => {
  activeDropdown.value = null; 
  const isConfirmed = await confirmDelete(t('userManagement.confirm.deleteLabel'));
  if (isConfirmed) {
    try {
      await deleteUser(row.id); 
      showSuccess(t('userManagement.success.deleted'));
      await fetchAllData(); 
    } catch (error) {
      showError(error.response?.data?.message || t('userManagement.error.deleteFailed'));
    }
  }
};

const handleCloseToast = () => {
  showToast.value = false;
};
</script>

<template>
  <main class="bg-white rounded-2xl shadow-sm h-full min-h-[calc(100vh-7rem)] flex flex-col relative w-full">
    <div class="bg-white rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden relative">
      <div class="p-6 flex-1 flex flex-col min-h-0">
        
        <div class="flex items-start justify-between mb-6 shrink-0">
          <div>
            <h1 class="text-2xl font-semibold text-gray-800 mb-1">{{ t('userManagement.title') }}</h1>
            <p class="text-sm text-gray-500">{{ t('userManagement.subtitle') }}</p>
          </div>
          <button @click="handleTambahPengguna" class="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#F7941D] text-[#F7941D] rounded-lg font-medium text-sm hover:bg-[#F7941D] hover:text-white transition-all focus:outline-none">
            <span class="text-lg leading-none">+</span> {{ t('userManagement.addBtn') }}
          </button>
        </div>
        
        <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-start gap-4 shrink-0">
          <div class="w-full sm:max-w-md flex-1">
            <SearchInput v-model="searchQuery" :placeholder="t('userManagement.searchPlaceholder')" @keyup.enter="executeSearch" />
          </div>
          <div class="relative shrink-0">
            <select v-model="itemsPerPage" class="appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-9 py-2 text-[13px] text-gray-400 font-medium focus:outline-none focus:border-gray-300 cursor-pointer w-[70px]">
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
        
        <div class="flex-1 overflow-auto">
          <DataTable 
            :columns="tableColumns"               
            :data="paginatedData" 
            :loading="isLoading"
            :sort-key="sortKey"
            :sort-order="sortOrder"
            @sort="handleSort"
          >
            <template #aksi="{ row }">
              <div class="flex items-center gap-2">
                <button
                  v-if="!row.is_owner"
                  @click="handlePermission(row)"
                  class="w-[30px] h-[30px] rounded bg-[#F7941D] flex items-center justify-center hover:bg-[#E8850E] transition-colors focus:outline-none"
                  title="Hak Akses"
                >
                  <img :src="keyline" class="w-[15px] h-[15px] brightness-0 invert" alt="permission" />
                </button>

                <button
                  @click="handleEditPengguna(row)"
                  class="w-[30px] h-[30px] rounded bg-[#3B82F6] flex items-center justify-center hover:bg-[#2563EB] transition-colors focus:outline-none"
                  title="Edit Data"
                >
                  <img :src="editIcon" class="w-[15px] h-[15px] brightness-0 invert" alt="edit" />
                </button>

                <button 
                  @click="handleDeletePengguna(row)"
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
              <EmptyState 
                v-if="penggunaData.length === 0"
                :icon="notfound"
                :title="t('userManagement.empty.noData')"
                :description="t('userManagement.empty.noDataDesc')"
                :buttonText="t('userManagement.empty.noDataBtn')"
                @action="handleTambahPengguna"
              />
              <EmptyState 
                v-else
                :icon="notfound"
                :title="t('userManagement.empty.notFound')"
                :description="`${t('userManagement.empty.notFoundDesc')} '${appliedSearchQuery}'`"
              />
            </template>
          </DataTable>
        </div>
        
      </div>
      
      <div class="bg-white rounded-b-2xl">
        <Pagination
          v-model:current-page="currentPage"
          :total-data="totalItems"
          :per-page="itemsPerPage"
        />
      </div>

    </div> 
  </main>

  <Modal 
    :show="showModal"
    :title="editingUser ? t('userManagement.modal.editTitle') : t('userManagement.modal.addTitle')"
    :description="editingUser ? t('userManagement.modal.editDesc') : t('userManagement.modal.addDesc')"
    width="half"
    @close="handleCloseModal"
  >
    <FormTambahPengguna 
      :initialData="editingUser"
      :branches="branchesData" @submit="handleSubmitPengguna"
      @cancel="handleCloseModal"
    />
    
    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button 
          type="button"
          @click="handleCloseModal"
          class="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
        >
          {{ t('userManagement.modal.cancel') }}
        </button>
        <button 
          type="submit"
          form="formTambahPengguna"
          class="px-5 py-2.5 text-sm font-medium text-white bg-[#F7941D] rounded-lg hover:bg-[#E8850E] transition-colors focus:outline-none"
        >
          {{ editingUser ? t('userManagement.modal.update') : t('userManagement.modal.save') }}
        </button>
      </div>
    </template>
  </Modal>

  <Modal 
    :show="showPermissionModal"
    :title="`${t('userManagement.permission.title')}: ${editingPermissionUser?.name || ''}`"
    :description="t('userManagement.permission.desc')"
    width="half"
    @close="showPermissionModal = false"
  >
    <FormPermissionPengguna 
      v-if="showPermissionModal"
      :initialPermissions="editingPermissionUser?.permissions"
      @submit="handleSubmitPermission"
    />
    
    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button 
          type="button"
          @click="showPermissionModal = false"
          class="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
        >
          {{ t('userManagement.permission.cancel') }}
        </button>
        <button 
          type="submit"
          form="formPermissionPengguna"
          class="px-5 py-2.5 text-sm font-medium text-white bg-[#F7941D] rounded-lg hover:bg-[#E8850E] transition-colors focus:outline-none"
        >
          {{ t('userManagement.permission.save') }}
        </button>
      </div>
    </template>
  </Modal>
  
  <Toast 
    :show="showToast"
    :message="toastMessage"
    @close="handleCloseToast"
  />
</template>

<style scoped>
button:focus, select:focus {
  outline: none !important;
  box-shadow: none !important;
}

.animate-fade-in-up {
  animation: fadeInUp 0.15s ease-out forwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
