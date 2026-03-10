<script setup>
import Sidebar from '@/components/Sidebar.vue';

import EmptyState from '@/components/common/EmptyState.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import DataTable from '@/components/common/DataTable.vue';
import Modal from '@/components/common/Modal.vue';
import Toast from '@/components/common/Toast.vue';
import FormTambahCabang from '@/components/cabang/FormTambahCabang.vue';
import visitorkulogo from '@/assets/visitorku.png';
import patternBg from '@/assets/Frame 7.svg';
import globeIcon from '@/assets/proicons_globe.svg';
import adminprofile from '@/assets/adminprofile.png';
import notfound from '@/assets/notfound.svg';
import Topbar from '@/components/Topbar.vue';

import { ref, onMounted, computed, watch } from 'vue';
import { confirmDelete, showSuccess, showError } from '@/utils/alertHelper'; // Import fungsinya
import { getAllBranches, createBranch, updateBranch, deleteBranch } from '@/services/cabangService';

// Data untuk pencarian
const searchQuery = ref('');

// Data cabang (kosong untuk empty state)
const cabangData = ref([]);

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
// Definisi kolom tabel
const tableColumns = [
  { key: 'nama', label: 'Nama Cabang', sortable: true },
  { key: 'alamat', label: 'Alamat Cabang', sortable: true },
  { key: 'kontak', label: 'Kontak Cabang', sortable: false },
  { key: 'aksi', label: 'Aksi', sortable: false },
];

const filteredCabangData = computed(() => {
  if (!appliedSearchQuery.value) {
    return cabangData.value;
  }
  
  const keyword = appliedSearchQuery.value.toLowerCase();
  
  return cabangData.value.filter(cabang => {
    return (
      (cabang.nama && cabang.nama.toLowerCase().includes(keyword)) ||
      (cabang.alamat && cabang.alamat.toLowerCase().includes(keyword)) ||
      (cabang.kontak && cabang.kontak.toLowerCase().includes(keyword))
    );
  });
});

// Status loading
const isLoading = ref(false);

// Toast message (bisa success atau error)
const toastMessage = ref('Cabang berhasil ditambahkan');

const fetchBranches = async () => {
  isLoading.value = true;
  try {
    const response = await getAllBranches({ page: 1, size: 100 });
    const items = response.data || response;
    cabangData.value = (Array.isArray(items) ? items : []).map(branch => ({
      id: branch.id,
      nama: branch.name,
      alamat: branch.address,
      kontak: branch.contact,
    }));
  } catch (error) {
    console.error('Gagal memuat data cabang:', error);
    toastMessage.value = 'Gagal memuat data cabang';
    showToast.value = true;
  } finally {
    isLoading.value = false;
  }
};

// Fetch data saat komponen dimount
onMounted(() => {
  fetchBranches();
});

const showModal = ref(false);
const editingBranch = ref(null); // null = mode tambah, object = mode edit

// State untuk Toast
const showToast = ref(false);

// Fungsi ketika tombol "Tambah Cabang" diklik - BUKA MODAL
const handleTambahCabang = () => {
  editingBranch.value = null;
  showModal.value = true;
};

// Fungsi untuk menutup modal
const handleCloseModal = () => {
  editingBranch.value = null;
  showModal.value = false;
};

// Fungsi ketika form di-submit
const handleSubmitCabang = async (formData) => {
  try {
    if (editingBranch.value) {
      // Mode EDIT
      await updateBranch(editingBranch.value.id, {
        name: formData.namaCabang,
        address: formData.alamatCabang,
        contact: formData.kontakCabang,
      });
      toastMessage.value = 'Cabang berhasil diperbarui';
    } else {
      // Mode TAMBAH
      await createBranch({
        name: formData.namaCabang,
        address: formData.alamatCabang,
        contact: formData.kontakCabang,
      });
      toastMessage.value = 'Cabang berhasil ditambahkan';
    }

    showModal.value = false;
    editingBranch.value = null;
    showToast.value = true;

    await fetchBranches();
  } catch (error) {
    console.error('Gagal menyimpan cabang:', error);
    console.error('Detail error dari backend:', error.response?.data);
    
    const backendMessage = error.response?.data?.message || error.response?.data?.error;
    toastMessage.value = backendMessage || (editingBranch.value ? 'Gagal memperbarui cabang' : 'Gagal menambahkan cabang');
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
    // Kolom yang sama → toggle asc/desc
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Kolom baru → mulai dari asc
    sortKey.value = columnKey;
    sortOrder.value = 'asc';
  }
};

// Fungsi untuk edit cabang
const handleEditCabang = (row) => {
  editingBranch.value = {
    id: row.id,
    namaCabang: row.nama,
    alamatCabang: row.alamat,
    kontakCabang: row.kontak,
  };
  showModal.value = true;
};

const filteredData = computed(() => {
  if (!appliedSearchQuery.value) {
    return tujuanData.value;
  }
  
  const keyword = appliedSearchQuery.value.toLowerCase();
  
  return tujuanData.value.filter(item => {
    return (
      (item.nama && item.namaCabang.toLowerCase().includes(keyword)) ||
      (item.alamat && item.alamatCabang.toLowerCase().includes(keyword))
    );
  });
});

const sortedData = computed(() => {
  if (!sortKey.value) return filteredCabangData.value; 

  return [...filteredCabangData.value].sort((a, b) => { 
    const valA = a[sortKey.value] ?? '';
    const valB = b[sortKey.value] ?? '';

    const cmp = String(valA).localeCompare(String(valB), 'id', { sensitivity: 'base' });
    return sortOrder.value === 'asc' ? cmp : -cmp;
  });
});

// Fungsi untuk hapus cabang
const handleDeleteCabang = async (row) => {
  // Panggil helper SweetAlert yang tadi kita buat
  const isConfirmed = await confirmDelete('Cabang Perusahaan');

  if (isConfirmed) {
    try {
      // Panggil API deleteBranch (bukan deleteApiKey)
      await deleteBranch(row.id); 
      
      showSuccess('Cabang berhasil dihapus.');
      
      // Refresh tabel otomatis setelah berhasil dihapus
      await fetchBranches(); 
      
    } catch (error) {
      showError(error.response?.data?.message || 'Gagal menghapus cabang.');
    }
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    
    <!-- TOPBAR -->
    <Topbar />
   
    <div class="flex flex-1 items-stretch">
      <Sidebar />
      <main class="flex-1 bg-[#F4F6F8] p-4">
        <div class="bg-white rounded-2xl shadow-sm h-full flex flex-col">
          <div class="p-6 flex-1 flex flex-col">
            <!-- Header Content -->
            <div class="flex items-start justify-between mb-6">
              <div>
                <h1 class="text-2xl font-semibold text-gray-800 mb-1">Cabang Perusahaan</h1>
                <p class="text-sm text-gray-500">Kelola lokasi atau unit kerja yang menerima pengunjung.</p>
              </div>
              
              <!-- Tombol Tambah Cabang -->
              <button 
                @click="handleTambahCabang"
                class="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#F7941D] 
                       text-[#F7941D] rounded-lg font-medium text-sm 
                       hover:bg-[#F7941D] hover:text-white transition-all"
              >
                <span class="text-lg leading-none">+</span>
                Tambah Cabang
              </button>
            </div>
              <div class="mb-6 max-w-md">
              <SearchInput 
                v-model="searchQuery" 
                placeholder="Cari Cabang" 
                @keyup.enter="executeSearch"  />
            </div>
            
            <!-- Table wrapper tanpa border -->
            <div class="flex-1 overflow-hidden">
              <DataTable 
                :columns="tableColumns"               
                :data="sortedData" 
                :loading="isLoading"
                :sort-key="sortKey"
                :sort-order="sortOrder"
                @sort="handleSort"
                @edit="handleEditCabang"
                @delete="handleDeleteCabang"
              >
                <template #empty>
                  
                  <EmptyState 
                    v-if="cabangData.length === 0"
                    :icon="notfound"
                    title="Data Cabang Belum Tersedia"
                    description="Tambahkan minimal satu cabang agar sistem dapat digunakan."
                    buttonText="Tambah Cabang"
                    @action="handleTambahCabang"
                  />

                  <EmptyState 
                    v-else
                    :icon="notfound"
                    title="No Records to display"
                    :description="`Tidak ada cabang yang cocok dengan kata kunci '${appliedSearchQuery}'`"
                  />
                  </template>
              </DataTable>
            </div>
            
          </div>
          
          <!-- Pagination -->
          <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
            <span>Menampilkan 10 dari 150 data</span>
            <div class="flex items-center gap-2">
              <button class="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">Pertama</button>
              <button class="w-8 h-8 flex items-center justify-center bg-[#F7941D] text-white rounded-lg font-medium">1</button>
              <button class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">2</button>
              <button class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">3</button>
              <span class="px-2">...</span>
              <button class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">98</button>
              <button class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">99</button>
              <button class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">100</button>
              <button class="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">Terakhir</button>
            </div>
          </div>
        </div> 
      </main>
    </div>
    
    <!-- MODAL TAMBAH CABANG -->
    <Modal 
      :show="showModal"
      :title="editingBranch ? 'Edit Cabang' : 'Tambah Cabang'"
      :description="editingBranch ? 'Ubah informasi cabang.' : 'Masukan informasi cabang yang akan menerima pengunjung.'"
      width="half"
      @close="handleCloseModal"
    >

    <FormTambahCabang 
        :initialData="editingBranch"
        @submit="handleSubmitCabang"
        @cancel="handleCloseModal"
      />
      
      <!-- Footer dengan tombol Batal dan Simpan -->
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
            form="formTambahCabang"
            class="px-5 py-2.5 text-sm font-medium text-white 
                   bg-[#F7941D] rounded-lg
                   hover:bg-[#E8850E] transition-colors"
          >
            {{ editingBranch ? 'Perbarui Cabang' : 'Simpan Cabang' }}
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