<script setup>
/**
 * ============================================================
 * Halaman Tujuan Kunjungan
 * ============================================================
 * Kelola data divisi dan penanggung jawab yang dapat dipilih oleh pengunjung
 */

// Import Layout Components
import Sidebar from '@/components/Sidebar.vue';

// Import Reusable Components
import EmptyState from '@/components/common/EmptyState.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import DataTable from '@/components/common/DataTable.vue';
import Modal from '@/components/common/Modal.vue';
import Toast from '@/components/common/Toast.vue';
import FormTambahTujuan from '@/components/cabang/FormTambahTujuan.vue';

// Import Vue Composables & API Services
import { ref, onMounted } from 'vue';

// Import API Services (Sesuaikan dengan path service Anda jika ada yang diubah)
import { 
  getCategories, 
  getBranches, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '@/services/tujuanService';

// Import assets (gambar, icon)
import visitorkulogo from '@/assets/visitorku.png';
import patternBg from '@/assets/Frame 7.svg';
import globeIcon from '@/assets/proicons_globe.svg';
import adminprofile from '@/assets/adminprofile.png';
import notfound from '@/assets/notfound.svg';
import Topbar from '@/components/Topbar.vue';

/**
 * ==========================================
 * STATE & VARIABEL
 * ==========================================
 */
const searchQuery = ref('');
const tujuanData = ref([]);
const branchesData = ref([]); // Menyimpan data cabang untuk dikirim ke Form
const rawDataTujuan = ref([]); // Menyimpan data mentah untuk fitur Edit
const isEditMode = ref(false); // Penanda Edit atau Tambah
const editId = ref(null);      // ID data yang sedang diedit
const selectedData = ref(null); // Data yang dikirim ke form untuk pre-fill

const tableColumns = [
  { key: 'divisi', label: 'Nama Divisi / Ruangan', sortable: true },
  { key: 'pic', label: 'Nama PIC', sortable: true },
  { key: 'jabatan', label: 'Jabatan', sortable: true },
  { key: 'cabang', label: 'Cabang', sortable: true },
  { key: 'aksi', label: 'Aksi', sortable: false },
];

const isLoading = ref(false);
const showModal = ref(false);
const showToast = ref(false);
const toastMessage = ref(''); // Wadah untuk pesan notifikasi dinamis

// Dummy profile sementara untuk mencegah error blank page
const companyProfile = ref({
  name: '',
  logoUrl: ''
});

/**
 * ==========================================
 * FUNGSI TARIK DATA (GET & JOIN)
 * ==========================================
 */
const fetchDataTujuan = async () => {
  isLoading.value = true;
  try {
    const [resCategory, resBranch] = await Promise.all([
      getCategories(),
      getBranches() 
    ]);

    const categories = resCategory.data?.results || resCategory.data?.data || resCategory.data || [];
    const branches = resBranch.data?.results || resBranch.data?.data || resBranch.data || [];

    rawDataTujuan.value = categories; 
    branchesData.value = branches; // Simpan daftar cabang untuk Dropdown Form

    if (Array.isArray(categories)) {
      tujuanData.value = categories.map(cat => {
        const matchedBranch = branches.find(b => b.id === cat.branch_id);
        return {
          id: cat.id, 
          divisi: cat.division || '-',
          pic: cat.category || '-', 
          jabatan: cat.position || '-',
          cabang: matchedBranch ? matchedBranch.name : (cat.branch_id || '-') 
        };
      });
    }
  } catch (error) {
    console.error('Gagal memuat data tabel:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchDataTujuan();
});

/**
 * ==========================================
 * FUNGSI UI (TUTUP MODAL & TOAST & SORT)
 * ==========================================
 */
const handleCloseModal = () => {
  showModal.value = false;
};

const handleCloseToast = () => {
  showToast.value = false;
};

const handleSort = (columnKey) => {
  console.log('Sort by:', columnKey);
};

/**
 * ==========================================
 * FUNGSI AKSI (TAMBAH, EDIT, HAPUS, SUBMIT)
 * ==========================================
 */

// 1. Klik Tombol Tambah
const handleTambahTujuan = () => {
  isEditMode.value = false;
  editId.value = null;
  selectedData.value = null; // Pastikan form kosong
  showModal.value = true;
};

// 2. Klik Tombol Edit
const handleEditTujuan = (row) => {
  const rawData = rawDataTujuan.value.find(item => item.id === row.id);
  
  if (rawData) {
    isEditMode.value = true;
    editId.value = row.id;

    selectedData.value = {
      cabang: rawData.branch_id,
      divisi: rawData.division,
      namaPIC: rawData.category, 
      jabatan: rawData.position,
      email: rawData.email_notification,
      phoneNumber: rawData.phone_number_notification
    };

    showModal.value = true;
  }
};

// 3. Klik Tombol Hapus
// 3. Klik Tombol Hapus
// 3. Klik Tombol Hapus
const handleDeleteTujuan = async (row) => {
  const isConfirmed = confirm(`Apakah Anda yakin ingin menghapus Tujuan Kunjungan untuk PIC: ${row.pic}?`);

  if (isConfirmed) {
    try {
      isLoading.value = true;
      await deleteCategory(row.id);
      
      // MUNCULKAN TOAST SUKSES HAPUS
      toastMessage.value = 'Tujuan Kunjungan berhasil dihapus!';
      showToast.value = true;
      
      fetchDataTujuan(); // Refresh tabel
    } catch (error) {
      console.error('Gagal menghapus data:', error);
      // MUNCULKAN TOAST GAGAL HAPUS
      toastMessage.value = error.response?.data?.message || 'Terjadi kesalahan saat menghapus data.';
      showToast.value = true;
    } finally {
      isLoading.value = false;
    }
  }
};

// 4. Proses Submit (POST / PUT)
const handleSubmitTujuan = async (formData) => {
  try {
    isLoading.value = true; 

    const payloadCategory = {
      category: formData.namaPIC, 
      branch_id: formData.cabang, 
      send_notification: true, 
      email_notification: formData.email,
      phone_number_notification: formData.phoneNumber,
      division: formData.divisi,
      position: formData.jabatan
    };

    if (isEditMode.value) {
      // Edit 
      await updateCategory(editId.value, payloadCategory);
      toastMessage.value = 'Tujuan Kunjungan berhasil diperbarui!';
    } else {
      // Tambah 
      await createCategory(payloadCategory);
      toastMessage.value = 'Tujuan Kunjungan berhasil ditambahkan!';
    }

    showModal.value = false;
    showToast.value = true; // Munculkan toast setelah proses berhasil
    
    fetchDataTujuan(); // Refresh tabel

  } catch (error) {
    console.log('Detail Penolakan Backend:', error.response?.data);
    toastMessage.value = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.';
    showToast.value = true;
  } finally {
    isLoading.value = false; 
  } 
};
</script>

<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    
    <Topbar />

    <div class="flex flex-1 items-stretch">
      <Sidebar />
      
      <main class="flex-1 bg-[#F4F6F8] p-4">
        <div class="bg-white rounded-2xl shadow-sm h-full flex flex-col">
          <div class="p-6 flex-1 flex flex-col">
            
            <div class="flex items-start justify-between mb-6">
              <div>
                <h1 class="text-2xl font-semibold text-gray-800 mb-1">Tujuan Kunjungan</h1>
                <p class="text-sm text-gray-500">Kelola daftar divisi dan penanggung jawab yang dapat dipilih oleh pengunjung.</p>
              </div>
              
              <button 
                @click="handleTambahTujuan"
                class="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#F7941D] 
                       text-[#F7941D] rounded-lg font-medium text-sm 
                       hover:bg-[#F7941D] hover:text-white transition-all"
              >
                <span class="text-lg leading-none">+</span>
                Tambah Tujuan
              </button>
            </div>
            
            <div class="mb-6 flex items-center gap-3">
              <div class="max-w-md flex-1">
                <SearchInput 
                  v-model="searchQuery" 
                  placeholder="Cari berdasarkan nama PIC/Divisi" 
                />
              </div>
              
              <button 
                class="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-300 
                       text-gray-600 rounded-lg font-medium text-sm 
                       hover:bg-gray-50 transition-all"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                </svg>
                Filter lainnya
              </button>
            </div>
            
            <div class="flex-1 overflow-hidden">
              <DataTable 
                :columns="tableColumns"
                :data="tujuanData"
                :loading="isLoading"
                @sort="handleSort"
                @edit="handleEditTujuan"
                @delete="handleDeleteTujuan"
              >
                <template #empty>
                  <EmptyState 
                    :icon="notfound"
                    title="Tujuan belum tersedia"
                    description="Tambahkan tujuan terlebih dahulu untuk memulai tujuan kunjungan."
                    buttonText="+ Tambah Tujuan"
                    @action="handleTambahTujuan"
                  />
                </template>
              </DataTable>
            </div>
            
          </div>
          
          <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
            <span>Menampilkan data</span>
            <div class="flex items-center gap-2">
              <button class="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">Pertama</button>
              <button class="w-8 h-8 flex items-center justify-center bg-[#F7941D] text-white rounded-lg font-medium">1</button>
              <button class="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">Terakhir</button>
            </div>
          </div>
          
        </div>
      </main>
    </div>
    
    <Modal 
      :show="showModal"
      :title="isEditMode ? 'Edit Tujuan Kunjungan' : 'Tambah Tujuan Kunjungan'"
      :description="isEditMode ? 'Ubah informasi divisi dan penanggung jawab.' : 'Masukan informasi divisi dan penanggung jawab yang dapat dipilih oleh pengunjung.'"
      width="half"
      @close="handleCloseModal"
    >
      <FormTambahTujuan 
        v-if="showModal"
        :initial-data="selectedData"
        :branches="branchesData" 
        @submit="handleSubmitTujuan"
        @cancel="handleCloseModal"
      />
      
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
            form="formTambahTujuan"
            class="px-5 py-2.5 text-sm font-medium text-white 
                   bg-[#F7941D] rounded-lg
                   hover:bg-[#E8850E] transition-colors"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Menyimpan...' : 'Simpan Tujuan' }}
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