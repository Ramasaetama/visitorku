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
          
          <!-- Card Inner Content dengan padding -->
          <div class="p-6 flex-1 flex flex-col overflow-y-auto">
            
            <!-- Header Content -->
            <div class="mb-6">
              <h1 class="text-2xl font-semibold text-gray-800 mb-1">Profil Perusahaan</h1>
              <p class="text-sm text-gray-500">Kelola informasi profil perusahaan Anda</p>
            </div>

            <div class="max-w-[900px] mx-auto w-full">

              <!-- ================================================ -->
              <!-- Section: Profil (2-column layout matching Figma) -->
              <!-- ================================================ -->
              <div class="flex flex-col lg:flex-row gap-6 lg:gap-12 mb-10">
                <!-- Left Column: Title & Description -->
                <div class="lg:w-[220px] flex-shrink-0">
                  <h2 class="text-[18px] font-semibold text-gray-900 mb-1">Profil</h2>
                  <p class="text-[13px] text-gray-500 leading-relaxed">Informasi ini digunakan sebagai identitas resmi perusahaan.</p>
                </div>

                <!-- Right Column: Form Fields -->
                <div class="flex-1 space-y-6">
                  <!-- Logo Perusahaan -->
                  <div>
                    <label class="block text-[13px] font-medium text-gray-600 mb-3">Logo Perusahaan</label>
                    <div class="flex items-start gap-4">
                      <!-- Logo Circle with "Ubah" overlay inside -->
                      <div @click="openUploadModal('logo')" class="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-[#F5A623] to-[#E8920D] flex-shrink-0 relative overflow-hidden cursor-pointer group shadow-md">
                        <!-- Display uploaded logo or default GM -->
                        <img v-if="companyProfile.logoUrl" :src="companyProfile.logoUrl" alt="Logo" class="absolute inset-0 w-full h-full object-cover" />
                        <div v-else class="absolute inset-0 flex items-center justify-center">
                          <span class="text-[30px] font-bold text-white">GM</span>
                        </div>
                        <!-- "Ubah" overlay at bottom half -->
                        <div class="absolute bottom-0 left-0 right-0 h-[20%] bg-white/40 flex items-center justify-center group-hover:bg-white/55 transition">
                          <span class="text-[11px] font-semibold text-[#EE9D0F]">Ubah</span>
                        </div>
                      </div>
                      <!-- Requirements -->
                      <div class="pt-1 space-y-0.5">
                        <p class="text-[12px] text-gray-500">• Ukuran gambar yang direkomendasi: lebar 800px, tinggi 400px</p>
                        <p class="text-[12px] text-gray-500">• Besar file maks.: 2.0MB</p>
                        <p class="text-[12px] text-gray-500">• Format gambar yang diterima : JPG,JPEG,PNG</p>
                      </div>
                    </div>
                  </div>

                  <!-- Nama Perusahaan -->
                  <div>
                    <label class="block text-[13px] font-medium text-gray-700 mb-2">Nama Perusahaan<span class="text-red-400">*</span></label>
                    <input 
                      v-model="companyProfile.name" 
                      type="text" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-xl text-[14px] text-gray-800 bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition"
                      placeholder="PT Media Sarana Data"
                    />
                  </div>

                  <!-- Alamat Perusahaan -->
                  <div>
                    <label class="block text-[13px] font-medium text-gray-700 mb-2">Alamat Perusahan<span class="text-red-400">*</span></label>
                    <textarea 
                      v-model="companyProfile.address" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-xl text-[14px] text-gray-800 bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition resize-y min-h-[80px]"
                      rows="3"
                      placeholder="Masukkan alamat lengkap perusahaan"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Divider -->
              <hr class="border-gray-200 mb-10" />

              <!-- ================================================ -->
              <!-- Section: Warna Brand (2-column layout)           -->
              <!-- ================================================ -->
              <div class="flex flex-col lg:flex-row gap-6 lg:gap-12 mb-10">
                <!-- Left Column -->
                <div class="lg:w-[220px] flex-shrink-0">
                  <h2 class="text-[18px] font-semibold text-gray-900 mb-1">Warna Brand</h2>
                  <p class="text-[13px] text-gray-500 leading-relaxed">Pilih tema warna yang diinginkan</p>
                </div>

                <!-- Right Column: Color Display -->
                <div class="flex-1">
                  <!-- Color Box + Hex Code in one row -->
                  <div class="flex items-center gap-3 mb-3 bg-[#FEF3E2] px-4 py-3 rounded-xl w-fit">
                    <div 
                      class="w-[42px] h-[42px] rounded-full border border-gray-200 cursor-pointer relative overflow-hidden flex-shrink-0"
                      :style="{ backgroundColor: companyProfile.brandColor }"
                      @click="$refs.colorInput.click()"
                    >
                      <input 
                        ref="colorInput"
                        v-model="companyProfile.brandColor" 
                        type="color" 
                        class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                    </div>
                    <div>
                      <span class="text-[14px] font-mono text-gray-700 tracking-wider">{{ companyProfile.brandColor.replace('#', '').toUpperCase() }}</span>
                    </div>
                  </div>
                  <p class="text-[12px] text-gray-500 italic">Pastikan warna memiliki kontras yang cukup.</p>
                </div>
              </div>

              <!-- Divider -->
              <hr class="border-gray-200 mb-10" />

              <!-- ================================================ -->
              <!-- Section: Sesuaikan Header (2-column + full preview) -->
              <!-- ================================================ -->
              <div class="flex flex-col lg:flex-row gap-6 lg:gap-12 mb-10">
                <!-- Left Column -->
                <div class="lg:w-[220px] flex-shrink-0">
                  <h2 class="text-[18px] font-semibold text-gray-900 mb-1">Sesuaikan Header</h2>
                  <p class="text-[13px] text-gray-500 leading-relaxed">Anda dapat menyesuaikan header sesuai identitas.</p>
                </div>

                <!-- Right Column: Header Preview -->
                <div class="flex-1">
                  <!-- Full-width header preview -->
                  <div class="w-full rounded-xl overflow-hidden relative cursor-pointer group" @click="openUploadModal('header')">
                    <div 
                      class="h-[100px] w-full bg-gradient-to-r from-[#F7941D] to-[#F9A825] flex items-center justify-end px-6 transition-all"
                      :style="companyProfile.headerBg ? { backgroundImage: `url(${companyProfile.headerBg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}"
                    >
                      <button class="bg-white/25 hover:bg-white/40 text-white px-4 py-1.5 rounded-lg text-[12px] font-medium backdrop-blur-sm transition shadow-sm">
                        Ubah
                      </button>
                    </div>
                  </div>
                  <!-- Note -->
                  <p class="text-[12px] text-[#EE9D0F] mt-2 italic">Pastikan file menggunakan format PNG dengan latar transparan</p>
                </div>
              </div>

              <!-- Divider -->
              <hr class="border-gray-200 mb-10" />

              <!-- ================================================ -->
              <!-- Section: Bahasa & Wilayah (2-column layout)      -->
              <!-- ================================================ -->
              <div class="flex flex-col lg:flex-row gap-6 lg:gap-12 mb-10">
                <!-- Left Column -->
                <div class="lg:w-[220px] flex-shrink-0">
                  <h2 class="text-[18px] font-semibold text-gray-900 mb-1">Bahasa &amp; Wilayah</h2>
                  <p class="text-[13px] text-gray-500 leading-relaxed">Atur bahasa &amp; wilayah</p>
                </div>

                <!-- Right Column: Dropdowns -->
                <div class="flex-1 space-y-5">
                  <!-- Bahasa -->
                  <div>
                    <label class="block text-[13px] font-medium text-gray-700 mb-2">Bahasa</label>
                    <div class="relative">
                      <select 
                        v-model="companyProfile.language" 
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl text-[14px] text-gray-800 bg-white appearance-none focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition pr-10"
                      >
                        <option value="Indonesia">Indonesia</option>
                        <option value="English">English</option>
                      </select>
                      <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  <!-- Timezone -->
                  <div>
                    <label class="block text-[13px] font-medium text-gray-700 mb-2">Timezone</label>
                    <div class="relative">
                      <select 
                        v-model="companyProfile.timezone" 
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl text-[14px] text-gray-800 bg-white appearance-none focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition pr-10"
                      >
                        <option value="Asia/Jakarta">Asia/Jakarta</option>
                        <option value="Asia/Makassar">Asia/Makassar</option>
                        <option value="Asia/Jayapura">Asia/Jayapura</option>
                      </select>
                      <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Divider -->
              <hr class="border-gray-200 mb-10" />

              <!-- ================================================ -->
              <!-- Section: API Access Token                        -->
              <!-- ================================================ -->
              <div class="mb-10">
                <!-- Section Header with Generate button top-right -->
                <div class="flex items-start justify-between mb-6">
                  <h2 class="text-[18px] font-semibold text-gray-900">API Access Token</h2>
                  <button @click="generateToken" class="inline-flex items-center gap-1.5 text-[#EE9D0F] text-[13px] font-medium hover:underline transition">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#EE9D0F" stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v8M8 12h8" stroke-linecap="round" />
                    </svg>
                    Generate API Token
                  </button>
                </div>
                
                <!-- Empty State Card -->
                <div class="text-center py-12 px-6 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-dashed border-gray-200">
                  <div class="flex justify-center mb-4">
                    <img :src="nochathistory" alt="API Icon" class="w-[200px] h-[200px] object-contain opacity-80" />
                  </div>
                  <h3 class="text-[15px] font-semibold text-gray-800 mb-1.5">Generate token untuk memberikan akses API</h3>
                  <p class="text-[13px] text-gray-500 mb-6">Token digunakan sebagai akses API untuk kebutuhan integrasi sistem.</p>
                  <button @click="generateToken" class="inline-flex items-center gap-2 px-6 py-2.5 border border-[#EE9D0F] text-[#EE9D0F] rounded-lg text-[13px] font-semibold bg-white hover:bg-[#FEF9F0] transition">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#EE9D0F" stroke-width="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v8M8 12h8" stroke-linecap="round" />
                    </svg>
                    Generate API Token
                  </button>
                </div>
              </div>

              <!-- Divider -->
              <hr class="border-gray-200 mb-6" />

              <!-- ================================================ -->
              <!-- Action Footer: Simpan Perubahan                  -->
              <!-- ================================================ -->
              <div class="flex justify-end pb-4">
                <button 
                  @click="saveProfile" 
                  class="px-8 py-3 bg-[#D8D5D3] hover:bg-[#c5c2c0] text-[#B3ADA9] rounded-xl text-[14px] font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>

            </div>
            <!-- End max-w container -->
            
          </div>
          <!-- End card inner content -->
          
        </div>
        <!-- End card wrapper -->
        
      </main>
    </div>

    <!-- Image Upload Modal -->
    <ImageUploadModal
      :isOpen="showUploadModal"
      :title="modalTitle"
      :description="modalDescription"
      @close="showUploadModal = false"
      @confirm="handleImageConfirm"
    />
    
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import ImageUploadModal from '@/components/ImageUploadModal.vue';

// Import assets for topbar
import visitorkulogo from '@/assets/visitorku.png';
import patternBg from '@/assets/Frame 7.svg';
import globeIcon from '@/assets/proicons_globe.svg';
import adminprofile from '@/assets/adminprofile.png';
import nochathistory from '@/assets/NoChatHistory.svg';
import headerbg from '@/assets/Header.svg';

const companyProfile = ref({
  name: 'PT Media Sarana Data',
  address: 'Jl. Siliwangi No.320, Area Sawah, Nogotirto, Kec. Gamping, Kabupaten Sleman, Daerah Istimewa Yogyakarta',
  brandColor: '#EE9D0F',
  headerBg: headerbg,
  logoUrl: null, // Will store uploaded logo preview URL
  language: 'Indonesia',
  timezone: 'Asia/Jakarta',
  apiToken: null
});

// Modal state
const showUploadModal = ref(false);
const uploadType = ref('logo'); // 'logo' or 'header'

// Modal content based on type
import { computed } from 'vue';

const modalTitle = computed(() => {
  return uploadType.value === 'logo' ? 'Ubah Logo' : 'Customize Header';
});

const modalDescription = computed(() => {
  if (uploadType.value === 'logo') {
    return 'Format yang diterima: <span class="font-medium text-[#EE9D0F]">JPG</span> • <span class="font-medium text-[#EE9D0F]">JPEG</span> • <span class="font-medium text-[#EE9D0F]">PNG</span> (Maks 2MB)';
  } else {
    return 'Dimensi yang disarankan: <span class="font-medium text-[#EE9D0F]">1920 x 240px</span>, format PNG transparan, maksimal 2 MB';
  }
});

const generateToken = () => {
  console.log('💡 Generate API Token clicked!');
  alert('Fitur Generate Token akan segera diimplementasikan');
};

const saveProfile = () => {
  console.log('💾 Save Profile clicked!', companyProfile.value);
  alert('Data profil akan disimpan ke backend');
};

// Open upload modal
const openUploadModal = (type) => {
  uploadType.value = type;
  showUploadModal.value = true;
};

// Handle image confirmation from modal
const handleImageConfirm = (data) => {
  console.log('🔥 handleImageConfirm DIPANGGIL!');
  console.log('📸 Data yang diterima:', data);
  console.log('🎯 Upload type:', uploadType.value);
  console.log('🖼️ Preview URL:', data.previewUrl);
  
  if (uploadType.value === 'logo') {
    console.log('✅ Mengupdate LOGO...');
    companyProfile.value.logoUrl = data.previewUrl;
    console.log('✅ Logo URL sekarang:', companyProfile.value.logoUrl);
  } else if (uploadType.value === 'header') {
    console.log('✅ Mengupdate HEADER...');
    companyProfile.value.headerBg = data.previewUrl;
    console.log('✅ Header URL sekarang:', companyProfile.value.headerBg);
  }
  
  // Debugging: tampilkan seluruh state
  console.log('📊 State lengkap companyProfile:', companyProfile.value);
  
  // Visual confirmation
  alert(`✅ ${uploadType.value} berhasil diupload!\nURL: ${data.previewUrl.substring(0, 50)}...`);
  
  // In real app, you would upload data.file to backend here
  console.log('File ready for upload:', data.file);
};
</script>

<style scoped>
/* Minimal custom styles — only for things Tailwind can't handle inline */
textarea {
  resize: vertical;
}
</style>
