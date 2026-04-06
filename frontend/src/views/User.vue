<script setup>
import Sidebar from '@/components/Sidebar.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import DataTable from '@/components/common/DataTable.vue';
import Modal from '@/components/common/Modal.vue';
import Toast from '@/components/common/Toast.vue';
import FormTambahPengguna from '@/components/pengguna/FormTambahPengguna.vue'; 
import notfound from '@/assets/notfound.svg';
import Topbar from '@/components/Topbar.vue';

import { ref, onMounted, computed, watch } from 'vue';
import { confirmDelete, showSuccess, showError } from '@/utils/alertHelper'; 
import { getAllUsers, createUser, updateUser, deleteUser } from '@/services/userService';

// Data untuk pencarian
const searchQuery = ref('');

// Data pengguna (kosong untuk empty state)
const penggunaData = ref([]);

const appliedSearchQuery = ref('');

const executeSearch = () => {
  appliedSearchQuery.value = searchQuery.value;
};

watch(searchQuery, (nilaiBaru) => {
  // Jika isi search bar dihapus sampai kosong string ('')
  if (nilaiBaru === '') {
    // Langsung jalankan pencarian (yang mana akan me-reset tabel)
    executeSearch(); 
  }
});

// Definisi kolom tabel sesuai format User
const tableColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'phone_number', label: 'No Telepon', sortable: false },
  { key: 'branch_id', label: 'Cabang', sortable: true },
  { key: 'aksi', label: 'Aksi', sortable: false },
];

const filteredPenggunaData = computed(() => {
  if (!appliedSearchQuery.value) {
    return penggunaData.value;
  }
  
  const keyword = appliedSearchQuery.value.toLowerCase();
  
  return penggunaData.value.filter(user => {
    return (
      (user.name && user.name.toLowerCase().includes(keyword)) ||
      (user.email && user.email.toLowerCase().includes(keyword)) ||
      (user.phone_number && user.phone_number.toLowerCase().includes(keyword)) ||
      (user.branch_id && user.branch_id.toLowerCase().includes(keyword))
    );
  });
});

// Status loading
const isLoading = ref(false);

// Toast message
const toastMessage = ref('Pengguna berhasil ditambahkan');
const showToast = ref(false);

const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const response = await getAllUsers({ page: 1, size: 100 });
    
    // Menyesuaikan dengan response body /admin/user
    const items = response?.data?.data || response?.data || [];
    
    penggunaData.value = (Array.isArray(items) ? items : []).map(user => ({
      id: user.id,
      name: user.name || '-',
      email: user.email || '-',
      phone_number: user.phone_number || '-',
      branch_id: user.branch_id || '-', // Kosongkan/sesuaikan jika ada relasi nama cabang
    }));
  } catch (error) {
    console.error('Gagal memuat data pengguna:', error);
    toastMessage.value = 'Gagal memuat data pengguna';
    showToast.value = true;
  } finally {
    isLoading.value = false;
  }
};

// Fetch data saat komponen dimount
onMounted(() => {
  fetchUsers();
});

const showModal = ref(false);
const editingUser = ref(null); // null = mode tambah, object = mode edit

// State untuk Kebab Menu (Titik Tiga)
const activeDropdown = ref(null);

const toggleDropdown = (id) => {
  activeDropdown.value = activeDropdown.value === id ? null : id;
};

// Fungsi ketika tombol "Tambah Pengguna" diklik - BUKA MODAL
const handleTambahPengguna = () => {
  editingUser.value = null;
  showModal.value = true;
};

// Fungsi untuk menutup modal
const handleCloseModal = () => {
  editingUser.value = null;
  showModal.value = false;
};

// Fungsi ketika form di-submit
const handleSubmitPengguna = async (formData) => {
  try {
    if (editingUser.value) {
      // Mode EDIT
      await updateUser(editingUser.value.id, formData);
      toastMessage.value = 'Pengguna berhasil diperbarui';
    } else {
      // Mode TAMBAH
      await createUser(formData);
      toastMessage.value = 'Pengguna berhasil ditambahkan';
    }

    showModal.value = false;
    editingUser.value = null;
    showToast.value = true;

    await fetchUsers();
  } catch (error) {
    console.error('Gagal menyimpan pengguna:', error);
    const backendMessage = error.response?.data?.message || error.response?.data?.error;
    toastMessage.value = backendMessage || (editingUser.value ? 'Gagal memperbarui pengguna' : 'Gagal menambahkan pengguna');
    showToast.value = true;
  }
};

// Fungsi untuk menutup toast
const handleCloseToast = () => {
  showToast.value = false;
};

// Fungsi untuk sorting tabel
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
  if (!sortKey.value) return filteredPenggunaData.value; 

  return [...filteredPenggunaData.value].sort((a, b) => { 
    const valA = a[sortKey.value] ?? '';
    const valB = b[sortKey.value] ?? '';

    const cmp = String(valA).localeCompare(String(valB), 'id', { sensitivity: 'base' });
    return sortOrder.value === 'asc' ? cmp : -cmp;
  });
});

// Fungsi untuk edit pengguna
const handleEditPengguna = (row) => {
  activeDropdown.value = null; // Tutup dropdown
  editingUser.value = {
    id: row.id,
    name: row.name,
    email: row.email,
    phone_number: row.phone_number,
    branch_id: row.branch_id,
  };
  showModal.value = true;
};

// Fungsi untuk permission pengguna
const handlePermission = (row) => {
  activeDropdown.value = null; // Tutup dropdown
  console.log("Buka permission untuk:", row.name);
  // Tambahkan logika buka modal permission di sini nanti
};

// Fungsi untuk hapus pengguna
const handleDeletePengguna = async (row) => {
  activeDropdown.value = null; // Tutup dropdown
  const isConfirmed = await confirmDelete('Pengguna');

  if (isConfirmed) {
    try {
      await deleteUser(row.id); 
      
      showSuccess('Pengguna berhasil dihapus.');
      
      // Refresh tabel otomatis setelah berhasil dihapus
      await fetchUsers(); 
      
    } catch (error) {
      showError(error.response?.data?.message || 'Gagal menghapus pengguna.');
    }
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    <Topbar />
   
    <div class="flex flex-1 items-stretch">
      <Sidebar />
      <main class="flex-1 bg-[#F4F6F8] p-4">
        <div class="bg-white rounded-2xl shadow-sm h-full flex flex-col relative">
          <div class="p-6 flex-1 flex flex-col">
            <div class="flex items-start justify-between mb-6">
              <div>
                <h1 class="text-2xl font-semibold text-gray-800 mb-1">Manajemen Pengguna</h1>
                <p class="text-sm text-gray-500">Kelola Informasi Pengguna.</p>
              </div>
              
              <button 
                @click="handleTambahPengguna"
                class="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#F7941D] 
                       text-[#F7941D] rounded-lg font-medium text-sm 
                       hover:bg-[#F7941D] hover:text-white transition-all focus:outline-none"
              >
                <span class="text-lg leading-none">+</span>
                Tambah Pengguna
              </button>
            </div>
            
            <div class="mb-6 max-w-md">
              <SearchInput 
                v-model="searchQuery" 
                placeholder="Cari Pengguna" 
                @keyup.enter="executeSearch"  />
            </div>
            
            <div class="flex-1 overflow-visible">
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
                      class="w-[34px] h-[34px] rounded-[10px] bg-[#FEF4E3] flex items-center justify-center text-[#F7941D] hover:bg-[#F7941D] hover:text-white transition-colors focus:outline-none relative z-10"
                    >
                      <svg class="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </button>

                    <div v-if="activeDropdown === row.id" @click="activeDropdown = null" class="fixed inset-0 z-40"></div>

                    <div 
                      v-if="activeDropdown === row.id" 
                      class="absolute top-[110%] left-0 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1.5 z-50"
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
                      class="w-[34px] h-[34px] rounded-[10px] bg-[#FEE2E2] flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-colors focus:outline-none relative z-10"
                    >
                      <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
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
          
          <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
            <span>Menampilkan 10 dari 150 data</span>
            <div class="flex items-center gap-2">
              <button class="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 focus:outline-none">Pertama</button>
              <button class="w-8 h-8 flex items-center justify-center bg-[#F7941D] text-white rounded-lg font-medium focus:outline-none">1</button>
              <button class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 focus:outline-none">2</button>
              <button class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 focus:outline-none">3</button>
              <span class="px-2">...</span>
              <button class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 focus:outline-none">98</button>
              <button class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 focus:outline-none">99</button>
              <button class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 focus:outline-none">100</button>
              <button class="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 focus:outline-none">Terakhir</button>
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
            Batal
          </button>
          <button 
            type="submit"
            form="formTambahPengguna"
            class="px-5 py-2.5 text-sm font-medium text-white bg-[#F7941D] rounded-lg hover:bg-[#E8850E] transition-colors focus:outline-none"
          >
            {{ editingUser ? 'Perbarui Pengguna' : 'Simpan Pengguna' }}
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