<script setup>
import EmptyState from '@/components/common/EmptyState.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import DataTable from '@/components/common/DataTable.vue';
import Modal from '@/components/common/Modal.vue';
import Toast from '@/components/common/Toast.vue';
import FormTambahPengguna from '@/components/pengguna/FormTambahPengguna.vue';
import FormPermissionPengguna from '@/components/pengguna/FormPermissionPengguna.vue'; 
import Pagination from '@/components/common/Pagination.vue'; 
import notfound from '@/assets/notfound.svg';
import { useI18n } from 'vue-i18n';

import { ref, onMounted, computed, watch, nextTick, onUnmounted } from 'vue';
import { confirmDelete, showSuccess, showError } from '@/utils/alertHelper'; 
import { getAllUsers, createUser, updateUser, deleteUser, updateUserPermission } from '@/services/userService';
import { getAllBranches } from '@/services/cabangService';

const { t } = useI18n();

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
  { key: 'phone_number', label: t('userManagement.table.phone'), sortable: true },
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

// ─── State Dropdown Opsi dengan Posisi Dinamis ───
const activeDropdown = ref(null);
const dropdownPosition = ref({ top: '0px', left: '0px' });

const toggleDropdown = async (id, event) => {
  if (activeDropdown.value === id) {
    activeDropdown.value = null;
  } else {
    activeDropdown.value = id;
    
    await nextTick();
    const buttonRect = event.currentTarget.getBoundingClientRect();
    
    // Mekar ke kanan
    dropdownPosition.value = {
      top: `${buttonRect.bottom + window.scrollY + 5}px`,
      left: `${buttonRect.left + window.scrollX}px` 
    };
  }
};

const closeDropdown = () => {
  activeDropdown.value = null;
};

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

onMounted(() => {
  fetchAllData();
  window.addEventListener('scroll', closeDropdown, true);
});

onUnmounted(() => {
  window.removeEventListener('scroll', closeDropdown, true);
});

const showModal = ref(false);
const editingUser = ref(null); 
const showPermissionModal = ref(false);
const editingPermissionUser = ref(null);
const toastMessage = ref('');
const showToast = ref(false);

const handleTambahPengguna = () => {
  closeDropdown();
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
  closeDropdown();
  editingUser.value = {
    id: row.id,
    name: row.name,
    email: row.email,
    phone_number: row.phone_number, // Atau phone, menyesuaikan API
    address: row.address,
    branch_id: row.branch_id, 
  };
  showModal.value = true;
};

const handlePermission = (row) => {
  closeDropdown();
  editingPermissionUser.value = {
    id: row.id,
    name: row.name,
    permissions: row.permissions || []
  };
  showPermissionModal.value = true;
};

const handleSubmitPermission = async (data) => {
  try {
    await updateUserPermission(editingPermissionUser.value.id, { permissions: data });
    showSuccess(t('userManagement.success.permissionSaved'));
    showPermissionModal.value = false;
    await fetchAllData();
  } catch (error) {
    showError(error.response?.data?.message || t('userManagement.error.permissionFailed'));
  }
};

const handleDeletePengguna = async (row) => {
  closeDropdown();
  const isConfirmed = await confirmDelete('Pengguna');
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
  <div class="flex-1 w-full h-full flex flex-col">
    <main class="bg-white rounded-2xl shadow-sm h-full min-h-[calc(100vh-7rem)] flex flex-col relative w-full">
      <div class="p-6 flex-1 flex flex-col min-h-0">
        
        <div class="flex items-start justify-between mb-6 shrink-0">
          <div>
            <h1 class="text-2xl font-semibold text-gray-800 mb-1">{{ t('userManagement.title') }}</h1>
            <p class="text-sm text-gray-500">{{ t('userManagement.subtitle') }}</p>
          </div>
          <button @click="handleTambahPengguna" class="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#F7941D] text-[#F7941D] rounded-sm font-medium text-sm hover:bg-[#F7941D] hover:text-white transition-all focus:outline-none">
            <span class="text-lg leading-none">+</span> {{ t('userManagement.addBtn') }}
          </button>
        </div>
        
        <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-start gap-4 shrink-0">
          <div class="w-full sm:max-w-md flex-1">
            <SearchInput v-model="searchQuery" v-model:perPage="itemsPerPage" :placeholder="t('userManagement.searchPlaceholder')" @keyup.enter="executeSearch" />
          </div>
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
            <template #aksi="{ row }">
              <div class="flex items-center gap-2 relative">
                
                <button 
                  @click.stop="toggleDropdown(row.id, $event)"
                  class="w-[30px] h-[30px] rounded border border-[#F7941D] flex items-center justify-center text-[#F7941D] hover:bg-[#FEF4E3] transition-colors focus:outline-none"
                  title="Opsi"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>

                <Teleport to="body">
                  <div 
                    v-if="activeDropdown === row.id" 
                    @click="closeDropdown" 
                    class="fixed inset-0 z-[9998]"
                  ></div>
                  
                  <div 
                    v-if="activeDropdown === row.id" 
                    class="fixed w-36 bg-white rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 py-1.5 z-[9999]"
                    :style="{ top: dropdownPosition.top, left: dropdownPosition.left }"
                  >
                    <button 
                      v-if="!row.is_owner"
                      @click="handlePermission(row)" 
                      class="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-[#FEF4E3] hover:text-[#F7941D] focus:outline-none transition-colors"
                    >
                      Hak Akses
                    </button>

                    <button 
                      @click="handleEditPengguna(row)" 
                      class="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-[#E6F4FF] hover:text-[#008FFB] focus:outline-none transition-colors"
                    >
                      Edit Data
                    </button>
                  </div>
                </Teleport>

                <button 
                  v-if="!row.is_owner"
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
                title="Data Pengguna Belum Tersedia"
                description="Tambahkan minimal satu pengguna agar sistem dapat digunakan."
                buttonText="Tambah Pengguna"
                @action="handleTambahPengguna"
              />
              <EmptyState 
                v-else
                :icon="notfound"
                title="No Records to display"
                :description="`Tidak ada pengguna yang cocok dengan kata kunci '${appliedSearchQuery}'`"
              />
            </template>
          </DataTable>
        </div>
        
      </div>
      
      <div class="bg-white rounded-b-2xl border-t border-gray-100">
        <Pagination
          v-model:current-page="currentPage"
          :total-data="totalItems"
          :per-page="itemsPerPage"
        />
      </div>

    </main>
  </div>
    
  <Modal 
    :show="showModal"
    :title="editingUser ? t('userManagement.modal.editTitle') : t('userManagement.modal.addTitle')"
    :description="editingUser ? t('userManagement.modal.editDesc') : t('userManagement.modal.addDesc')"
    width="half"
    @close="handleCloseModal"
  >
    <FormTambahPengguna 
      :initialData="editingUser"
      :branches="branchesData" 
      @submit="handleSubmitPengguna"
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