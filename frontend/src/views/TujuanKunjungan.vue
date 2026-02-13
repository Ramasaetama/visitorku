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

// Import assets (gambar, icon)
import visitorkulogo from '@/assets/visitorku.png';
import patternBg from '@/assets/Frame 7.svg';
import globeIcon from '@/assets/proicons_globe.svg';
import adminprofile from '@/assets/adminprofile.png';
import notfound from '@/assets/notfound.svg';

// Import Vue Composables
import { ref } from 'vue';

/**
 * Reactive Data
 */

// Data untuk pencarian
const searchQuery = ref('');

// Data tujuan kunjungan (kosong untuk empty state)
const tujuanData = ref([]);

// Definisi kolom tabel - BERBEDA dari Cabang
const tableColumns = [
  { key: 'divisi', label: 'Nama Divisi / Ruangan', sortable: true },
  { key: 'pic', label: 'Nama PIC', sortable: true },
  { key: 'jabatan', label: 'Jabatan', sortable: true },
  { key: 'cabang', label: 'Cabang', sortable: true },
  { key: 'aksi', label: 'Aksi', sortable: false },
];

// Status loading
const isLoading = ref(false);

// State untuk Modal
const showModal = ref(false);

// State untuk Toast
const showToast = ref(false);

/**
 * Methods/Functions
 */

// Fungsi ketika tombol "Tambah Tujuan" diklik - BUKA MODAL
const handleTambahTujuan = () => {
  showModal.value = true;
};

// Fungsi untuk menutup modal
const handleCloseModal = () => {
  showModal.value = false;
};

// Fungsi ketika form di-submit
const handleSubmitTujuan = (formData) => {
  console.log('Data tujuan baru:', formData);
  
  // Tambahkan ke array tujuanData (simulasi)
  tujuanData.value.push({
    divisi: formData.divisi,
    pic: formData.namaPIC,
    jabatan: formData.jabatan,
    cabang: formData.cabang
  });
  
  // Tutup modal setelah submit
  showModal.value = false;
  
  // Tampilkan toast notification
  showToast.value = true;
  
  // Nanti bisa ditambahkan API call untuk menyimpan ke backend
  // await api.createTujuan(formData);
};

// Fungsi untuk menutup toast
const handleCloseToast = () => {
  showToast.value = false;
};

// Fungsi untuk sorting tabel
const handleSort = (columnKey) => {
  console.log('Sort by:', columnKey);
};

// Fungsi untuk edit tujuan
const handleEditTujuan = (row) => {
  console.log('Edit tujuan:', row);
  // Nanti bisa buka modal edit dengan data yang sudah terisi
};

// Fungsi untuk hapus tujuan
const handleDeleteTujuan = (row) => {
  console.log('Hapus tujuan:', row);
  // Nanti bisa tampilkan konfirmasi hapus
  const index = tujuanData.value.findIndex(item => item.divisi === row.divisi);
  if (index > -1) {
    tujuanData.value.splice(index, 1);
  }
};
</script>

<template>
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
    <div class="flex flex-1 items-stretch">
      
      <!-- Sidebar -->
      <Sidebar />
      
      <!-- ============ CONTENT AREA ============ -->
      <main class="flex-1 bg-[#F4F6F8] p-4">
        
        <!-- CARD WRAPPER UTAMA -->
        <div class="bg-white rounded-2xl shadow-sm h-full flex flex-col">
          
          <!-- Card Inner Content -->
          <div class="p-6 flex-1 flex flex-col">
            
            <!-- Header Content -->
            <div class="flex items-start justify-between mb-6">
              <div>
                <h1 class="text-2xl font-semibold text-gray-800 mb-1">Tujuan Kunjungan</h1>
                <p class="text-sm text-gray-500">Kelola daftar divisi dan penanggung jawab yang dapat dipilih oleh pengunjung.</p>
              </div>
              
              <!-- Tombol Tambah Tujuan -->
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
            
            <!-- Search Input + Filter Button -->
            <div class="mb-6 flex items-center gap-3">
              <div class="max-w-md flex-1">
                <SearchInput 
                  v-model="searchQuery" 
                  placeholder="Cari berdasarkan nama PIC/Divisi" 
                />
              </div>
              
              <!-- Button Filter Lainnya -->
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
            
            <!-- Data Table -->
            <div class="flex-1 overflow-hidden">
              <DataTable 
                :columns="tableColumns"
                :data="tujuanData"
                :loading="isLoading"
                @sort="handleSort"
                @edit="handleEditTujuan"
                @delete="handleDeleteTujuan"
              >
                <!-- Custom empty state -->
                <template #empty>
                  <EmptyState 
                    :icon="notfound"
                    title="Cabang belum tersedia"
                    description="Tambahkan cabang terlebih dahulu untuk memulai tujuan kunjungan."
                    buttonText="+ Tambah Cabang"
                    @action="handleTambahTujuan"
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
    
    <!-- ============ MODAL TAMBAH TUJUAN ============ -->
    <!-- Modal sementara tanpa form (form belum dibuat) -->
    <Modal 
      :show="showModal"
      title="Tambah Tujuan Kunjungan"
      description="Masukan informasi divisi dan penanggung jawab yang dapat dipilih oleh pengunjung."
      width="half"
      @close="handleCloseModal"
    >
      <!-- Form Tambah Tujuan -->
      <FormTambahTujuan 
        @submit="handleSubmitTujuan"
        @cancel="handleCloseModal"
      />
      
      <!-- Footer -->
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
          >
            Simpan Tujuan
          </button>
        </div>
      </template>
    </Modal>
    
    <!-- Toast Notification -->
    <Toast 
      :show="showToast"
      message="Tujuan Kunjungan berhasil ditambahkan"
      @close="handleCloseToast"
    />
    
  </div>
</template>
