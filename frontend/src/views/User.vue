<script setup>
import Sidebar from '@/components/Sidebar.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import DataTable from '@/components/common/DataTable.vue';
import Modal from '@/components/common/Modal.vue';
import Toast from '@/components/common/Toast.vue';
import FormTambahPengguna from '@/components/pengguna/FormTambahPengguna.vue';
import FormPermissionPengguna from '@/components/pengguna/FormPermissionPengguna.vue'; 
import notfound from '@/assets/notfound.svg';
import Topbar from '@/components/Topbar.vue';


import keyline from '@/assets/icons/key-line.svg';
import editIcon from '@/assets/icons/edit-box-line.svg';

import { ref, onMounted, computed, watch } from 'vue';
import { confirmDelete, showSuccess, showError } from '@/utils/alertHelper'; 

import { getAllBranches } from '@/services/cabangService';
import { getAllUsers, createUser, updateUser, deleteUser, updateUserPermission } from '@/services/userService';

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
watch(itemsPerPage, () => {
  currentPage.value = 1;
});

const tableColumns = [
  { key: 'name', label: 'Nama Pengguna', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'phone_number', label: 'No Telepon', sortable: false },
  { key: 'branch_name', label: 'Cabang', sortable: true },
  { key: 'aksi', label: 'Aksi', sortable: false },
];

const filteredData = computed(() => {
  if (!appliedSearchQuery.value) return penggunaData.value;
  const keyword = appliedSearchQuery.value.toLowerCase();
  return penggunaData.value.filter(user => {
    return (
      (user.name && user.name.toLowerCase().includes(keyword)) ||
      (user.email && user.email.toLowerCase().includes(keyword)) ||
      (user.phone_number && user.phone_number.toLowerCase().includes(keyword)) ||
      (user.branch_name && user.branch_name.toLowerCase().includes(keyword))
    );
  });
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
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
const startIndex = computed(() => totalItems.value === 0 ? 0 : ((currentPage.value - 1) * itemsPerPage.value) + 1);
const endIndex = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalItems.value));

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedData.value.slice(start, end);
});

const visiblePages = computed(() => {
  const maxVisible = 5; 
  let start = Math.max(1, currentPage.value - 2);
  let end = start + maxVisible - 1;
  if (end > totalPages.value) {
    end = totalPages.value;
    start = Math.max(1, end - maxVisible + 1);
  }
  let pages = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
  }
};

const fetchAllData = async () => {
  isLoading.value = true;
  try {
    try {
      const branchRes = await getAllBranches({ page: 1, size: 100 });
      branchesData.value = branchRes?.data?.data || branchRes?.data || [];
    } catch (err) {
      console.warn("Gagal memuat data cabang untuk mapping:", err);
    }
    const userRes = await getAllUsers({ page: 1, size: 100 });
    const items = userRes?.data?.data || userRes?.data || [];
    
    penggunaData.value = (Array.isArray(items) ? items : []).map(user => {
      let namaCabang = '-';
      if (user.branch_id) {
        const matchedBranch = branchesData.value.find(b => b.id === user.branch_id);
        if (matchedBranch && matchedBranch.name) namaCabang = matchedBranch.name;
      }
      return {
        id: user.id || '-',
        name: user.name || '-',
        email: user.email || '-',
        phone_number: user.phone_number || '-',
        address: user.address || '', 
        branch_id: user.branch_id || '', 
        branch_name: namaCabang,
        permissions: user.permissions || [],
        is_owner: user.is_owner || false // Mapping atribut is_owner dari API
      };
    });
  } catch (error) {
    console.error('Gagal memuat data pengguna:', error);
  } finally {
    isLoading.value = false;
  }
};

const activeDropdown = ref(null);
const dropdownPos = ref({ top: 0, left: 0 });

const toggleDropdown = (event, id) => {
  if (activeDropdown.value === id) {
    activeDropdown.value = null;
  } else {
    const rect = event.currentTarget.getBoundingClientRect();
    dropdownPos.value = {
      top: rect.bottom + 6,
      left: rect.left 
    };
    activeDropdown.value = id;
  }
};

onMounted(() => {
  fetchAllData();
  window.addEventListener('scroll', () => {
    if (activeDropdown.value) activeDropdown.value = null;
  }, true);
});

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
  editingUser.value = null;
  showModal.value = false;
};

const handleSubmitPengguna = async (formData) => {
  try {
    if (editingUser.value) {
      await updateUser(editingUser.value.id, formData);
      toastMessage.value = 'Pengguna berhasil diperbarui';
    } else {
      await createUser(formData);
      toastMessage.value = 'Pengguna berhasil ditambahkan';
    }
    showModal.value = false;
    editingUser.value = null;
    showToast.value = true;
    await fetchAllData();
  } catch (error) {
    toastMessage.value = error.response?.data?.message || 'Gagal memproses data pengguna';
    showToast.value = true;
  }
};

const handleEditPengguna = (row) => {
  activeDropdown.value = null; 
  editingUser.value = {
    id: row.id,
    name: row.name,
    email: row.email,
    phone_number: row.phone_number,
    address: row.address,
    branch_id: row.branch_id, 
  };
  showModal.value = true;
};

const handlePermission = (row) => {
  activeDropdown.value = null; 
  editingPermissionUser.value = {
    id: row.id,
    name: row.name,
    permissions: row.permissions || []
  };
  showPermissionModal.value = true;
};

const handleSubmitPermission = async (data) => {
  try {
    await updateUserPermission(editingPermissionUser.value.id, { permissions: data.permissions });
    toastMessage.value = 'Hak akses berhasil diperbarui';
    showToast.value = true;
    showPermissionModal.value = false;
    await fetchAllData();
  } catch (error) {
    showError(error.response?.data?.message || 'Gagal menyimpan hak akses.');
  }
};

const handleDeletePengguna = async (row) => {
  activeDropdown.value = null; 
  const isConfirmed = await confirmDelete('Pengguna');
  if (isConfirmed) {
    try {
      await deleteUser(row.id); 
      showSuccess('Pengguna berhasil dihapus.');
      await fetchAllData(); 
    } catch (error) {
      showError(error.response?.data?.message || 'Gagal menghapus pengguna.');
    }
  }
};

const handleCloseToast = () => {
  showToast.value = false;
};
</script>

<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    <Topbar />
   
    <div class="flex flex-1 items-stretch overflow-hidden">
      <Sidebar />
      <main class="flex-1 bg-[#F4F6F8] p-4 flex flex-col overflow-hidden">
        <div class="bg-white rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden relative">
          <div class="p-6 flex-1 flex flex-col min-h-0">
            
            <div class="flex items-start justify-between mb-6 shrink-0">
              <div>
                <h1 class="text-2xl font-semibold text-gray-800 mb-1">Manajemen Pengguna</h1>
                <p class="text-sm text-gray-500">Kelola Informasi Pengguna.</p>
              </div>
              <button @click="handleTambahPengguna" class="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#F7941D] text-[#F7941D] rounded-lg font-medium text-sm hover:bg-[#F7941D] hover:text-white transition-all focus:outline-none">
                <span class="text-lg leading-none">+</span> Tambah Pengguna
              </button>
            </div>
            
            <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-start gap-4 shrink-0">
              <div class="w-full sm:max-w-md flex-1">
                <SearchInput v-model="searchQuery" placeholder="Cari Pengguna" @keyup.enter="executeSearch" />
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
                <!-- SESUDAH -->
<template #aksi="{ row }">
  <div class="flex items-center gap-2">

    <!-- Tombol Permission (hanya tampil jika bukan owner) -->
   <!-- Tombol Permission - icon putih di atas orange -->
<button
  v-if="!row.is_owner"
  @click="handlePermission(row)"
  class="w-[30px] h-[30px] rounded bg-[#F7941D] flex items-center justify-center hover:bg-[#E8850E] transition-colors focus:outline-none"
>
  <img :src="keyline" class="w-[15px] h-[15px] brightness-0 invert" alt="permission" />
</button>

<!-- Tombol Edit - icon putih di atas biru -->
<button
  @click="handleEditPengguna(row)"
  class="w-[30px] h-[30px] rounded bg-[#3B82F6] flex items-center justify-center hover:bg-[#2563EB] transition-colors focus:outline-none"
>
  <img :src="editIcon" class="w-[15px] h-[15px] brightness-0 invert" alt="edit" />
</button>

                    <button 
                      @click="handleDeletePengguna(row)"
                      class="w-[30px] h-[30px] rounded bg-[#E45454] flex items-center justify-center text-white hover:bg-[#D24A4A] transition-colors focus:outline-none"
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
          
          <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-[13px] text-[#64748B] shrink-0 bg-white rounded-b-2xl">
            <span>Showing {{ startIndex }} to {{ endIndex }} from {{ totalItems }} records</span>
            
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
    
    <Modal 
      :show="showModal"
      :title="editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'"
      :description="editingUser ? 'Ubah informasi pengguna.' : 'Masukan informasi pengguna baru ke dalam sistem.'"
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
            Batal
          </button>
          <button 
            type="submit"
            form="formTambahPengguna"
            class="px-5 py-2.5 text-sm font-medium text-white bg-[#F7941D] rounded-lg hover:bg-[#E8850E] transition-colors focus:outline-none"
          >
            {{ editingUser ? 'Perbarui Pengguna' : 'Tambah Pengguna' }}
          </button>
        </div>
      </template>
    </Modal>

    <Modal 
      :show="showPermissionModal"
      :title="'Hak Akses: ' + (editingPermissionUser?.name || 'Pengguna')"
      description="Atur dan kelola level akses menu pengguna di dalam sistem."
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
            Batal
          </button>
          <button 
            type="submit"
            form="formPermissionPengguna"
            class="px-5 py-2.5 text-sm font-medium text-white bg-[#F7941D] rounded-lg hover:bg-[#E8850E] transition-colors focus:outline-none"
          >
            Simpan Hak Akses
          </button>
        </div>
      </template>
    </Modal>
    
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

.animate-fade-in-up {
  animation: fadeInUp 0.15s ease-out forwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>