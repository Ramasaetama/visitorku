<script setup>
/**
 * ============================================================
 * STEP-BY-STEP TUTORIAL: Cara Memanggil Komponen Reusable
 * ============================================================
 * 
 * STEP 1: Import komponen yang dibutuhkan
 * - Gunakan path relatif atau alias @ untuk mengimport
 * - @ adalah alias untuk folder 'src'
 */

// Import Layout Components (Sidebar sudah ada)
import Sidebar from '@/components/Sidebar.vue';

// Import Reusable Components yang baru dibuat
import EmptyState from '@/components/common/EmptyState.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import DataTable from '@/components/common/DataTable.vue';
import Modal from '@/components/common/Modal.vue';
import Toast from '@/components/common/Toast.vue';

// Import Form Components
import FormTambahCabang from '@/components/cabang/FormTambahCabang.vue';

// Import assets (gambar, icon)
import visitorkulogo from '@/assets/visitorku.png';
import patternBg from '@/assets/Frame 7.svg';
import globeIcon from '@/assets/proicons_globe.svg';
import adminprofile from '@/assets/adminprofile.png';
import notfound from '@/assets/notfound.svg';


/**
 * STEP 2: Import Vue Composables
 * - ref untuk reactive data
 */
import { ref, onMounted } from 'vue';

// Import Branch Service untuk API calls
import { getAllBranches, createBranch, deleteBranch } from '@/services/branchService';

/**
 * STEP 3: Definisikan reactive data
 * - Data yang bisa berubah (reactive) harus menggunakan ref()
 */

// Data untuk pencarian
const searchQuery = ref('');

// Data cabang (kosong untuk empty state)
const cabangData = ref([]);

// Definisi kolom tabel
const tableColumns = [
  { key: 'nama', label: 'Nama Cabang', sortable: true },
  { key: 'alamat', label: 'Alamat Cabang', sortable: true },
  { key: 'kontak', label: 'Kontak Cabang', sortable: true },
  { key: 'aksi', label: 'Aksi', sortable: false },
];

// Status loading
const isLoading = ref(false);

// Toast message (bisa success atau error)
const toastMessage = ref('Cabang berhasil ditambahkan');

/**
 * Fetch semua cabang dari API
 * Map field API (name, address, contact) ke field DataTable (nama, alamat, kontak)
 */
const fetchBranches = async () => {
  isLoading.value = true;
  try {
    const response = await getAllBranches({ page: 1, size: 100 });
    // Map API response ke format DataTable
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

/**
 * STEP 4: State untuk Modal
 * - showModal: Boolean untuk menampilkan/menyembunyikan modal
 */
const showModal = ref(false);

// State untuk Toast
const showToast = ref(false);

/**
 * STEP 5: Definisikan methods/functions
 * - Fungsi untuk handle events
 */

// Fungsi ketika tombol "Tambah Cabang" diklik - BUKA MODAL
const handleTambahCabang = () => {
  showModal.value = true;
};

// Fungsi untuk menutup modal
const handleCloseModal = () => {
  showModal.value = false;
};

// Fungsi ketika form di-submit
const handleSubmitCabang = async (formData) => {
  try {
    // Map field form ke field API
    await createBranch({
      name: formData.namaCabang,
      address: formData.alamatCabang,
      contact: formData.kontakCabang,
    });

    // Tutup modal setelah submit
    showModal.value = false;

    // Tampilkan toast notification sukses
    toastMessage.value = 'Cabang berhasil ditambahkan';
    showToast.value = true;

    // Refresh data dari API
    await fetchBranches();
  } catch (error) {
    console.error('Gagal menambahkan cabang:', error);
    toastMessage.value = 'Gagal menambahkan cabang';
    showToast.value = true;
  }
};

// Fungsi untuk menutup toast
const handleCloseToast = () => {
  showToast.value = false;
};

// Fungsi untuk sorting tabel
const handleSort = (columnKey) => {
  console.log('Sort by:', columnKey);
};

// Fungsi untuk edit cabang
const handleEditCabang = (row) => {
  console.log('Edit cabang:', row);
  // Nanti bisa buka modal edit dengan data yang sudah terisi
};

// Fungsi untuk hapus cabang
const handleDeleteCabang = async (row) => {
  if (!confirm('Apakah Anda yakin ingin menghapus cabang ini?')) return;

  try {
    await deleteBranch(row.id);

    // Tampilkan toast notification sukses
    toastMessage.value = 'Cabang berhasil dihapus';
    showToast.value = true;

    // Refresh data dari API
    await fetchBranches();
  } catch (error) {
    console.error('Gagal menghapus cabang:', error);
    toastMessage.value = 'Gagal menghapus cabang';
    showToast.value = true;
  }
};
</script>

<template>
  <!--
    STEP 5: Struktur HTML Template
    - Gunakan komponen yang sudah di-import
    - Komponen dipanggil seperti HTML tag biasa: <NamaKomponen />
  -->
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    
    <!-- ============ TOPBAR (Header) ============ -->
    <header class="relative bg-gradient-to-r from-[#F7941D] to-[#F9A825] h-[56px] flex items-center justify-between px-6 overflow-hidden">
      <!-- Background pattern -->
      <div 
        class="absolute inset-0" 
        :style="{ 
          backgroundImage: `url(${patternBg})`, 
          backgroundRepeat: 'repeat-x', 
          backgroundSize: 'auto 100%',
          backgroundPosition: 'center',
          opacity: 0.5
        }"
      ></div>
      
      <!-- Left: Logo -->
      <div class="relative z-10 flex items-center gap-2">
        <img :src="visitorkulogo" alt="Visitorku" class="h-7" />
      </div>
      
      <!-- Right: Admin section -->
      <div class="relative z-10 flex items-center gap-4">
        <button class="p-1.5 rounded-full hover:bg-white/20 transition">
          <img :src="globeIcon" alt="Language" class="w-5 h-5" />
        </button>
        
        <div class="flex items-center gap-2.5 cursor-pointer">
          <span class="text-white text-[14px] font-medium">Admin</span>
          <img 
            :src="adminprofile"
            alt="Admin" 
            class="w-9 h-9 rounded-full object-cover border-2 border-white/50" 
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="text-white">
            <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
    </header>

    <!-- ============ MAIN CONTAINER (Sidebar + Content) ============ -->
    <!-- Menggunakan flex dengan items-stretch agar Sidebar dan Content tinggi sama -->
    <div class="flex flex-1 items-stretch">
      
      <!-- STEP 6: Memanggil Komponen Sidebar -->
      <!-- Cukup tulis <Sidebar /> karena sudah di-import di atas -->
      <Sidebar />
      
      <!-- ============ CONTENT AREA ============ -->
      <!-- Padding p-4 agar card tidak menempel ke navbar dan tepi -->
      <main class="flex-1 bg-[#F4F6F8] p-4">
        
        <!-- CARD WRAPPER UTAMA - Membungkus semua konten -->
        <div class="bg-white rounded-2xl shadow-sm h-full flex flex-col">
          
          <!-- Card Inner Content dengan padding -->
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
            
            <!-- STEP 7: Memanggil Komponen SearchInput dengan v-model -->
            <div class="mb-6 max-w-md">
              <SearchInput 
                v-model="searchQuery" 
                placeholder="Cari Cabang" 
              />
            </div>
            
            <!-- STEP 8: Memanggil Komponen DataTable -->
            <!-- Table wrapper tanpa border -->
            <div class="flex-1 overflow-hidden">
              <DataTable 
                :columns="tableColumns"
                :data="cabangData"
                :loading="isLoading"
                @sort="handleSort"
                @edit="handleEditCabang"
                @delete="handleDeleteCabang"
              >
                <!-- STEP 9: Menggunakan SLOT untuk custom empty state -->
                <template #empty>
                  <!-- STEP 10: Memanggil Komponen EmptyState -->
                  <EmptyState 
                    :icon="notfound"
                    title="Data Cabang Belum Tersedia"
                    description="Tambahkan minimal satu cabang agar sistem dapat digunakan."
                    buttonText="Tambah Cabang"
                    @action="handleTambahCabang"
                  />
                </template>
              </DataTable>
            </div>
            
          </div>
          
          <!-- Pagination - Di dalam card dengan border-top -->
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
    
    <!-- ============ MODAL TAMBAH CABANG ============ -->
    <!-- 
      Modal akan muncul ketika showModal = true
      Props:
      - :show="showModal" mengirim state ke Modal
      - @close="handleCloseModal" menangkap event close dari Modal
    -->
    <Modal 
      :show="showModal"
      title="Tambah Cabang"
      description="Masukan informasi cabang yang akan menerima pengunjung."
      width="half"
      @close="handleCloseModal"
    >
      <!-- Form ditaruh di dalam slot default Modal -->
      <FormTambahCabang 
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
            Simpan Cabang
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

<!--
  ============================================================
  RINGKASAN CARA MEMANGGIL KOMPONEN REUSABLE:
  ============================================================
  
  1. IMPORT komponen di bagian <script setup>:
     import NamaKomponen from '@/components/path/NamaKomponen.vue';
  
  2. GUNAKAN di <template> seperti tag HTML:
     <NamaKomponen />
  
  3. KIRIM DATA ke komponen via PROPS (dengan : atau v-bind):
     <NamaKomponen :propName="dataValue" />
  
  4. TERIMA EVENT dari komponen dengan @ atau v-on:
     <NamaKomponen @eventName="handlerFunction" />
  
  5. GUNAKAN v-model untuk two-way binding:
     <SearchInput v-model="searchQuery" />
  
  6. GUNAKAN SLOT untuk custom content:
     <DataTable>
       <template #slotName>
         Custom content di sini
       </template>
     </DataTable>
-->
