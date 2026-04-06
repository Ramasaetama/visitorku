<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

// Import icons directly
import layoutMasonryIcon from '@/assets/layout-masonry-line.svg';
import groupLineIcon from '@/assets/group-line.svg';
import logoutBoxIcon from '@/assets/logout-box-r-line.svg';
import listIndefiniteIcon from '@/assets/list-indefinite.svg';
import buildingIcon from '@/assets/building-4-line.svg';
import gitMergeIcon from '@/assets/git-merge-line.svg';
import frame7Icon from '@/assets/Frame 7.svg';
import settingsIcon from '@/assets/settings-3-line.svg';
import fileTextIcon from '@/assets/file-text-line.svg';
import checkOnIcon from '@/assets/icon-park-solid_check-one-on.svg';
import checkOffIcon from '@/assets/icon-park-solid_check-one.svg';
import starIcon from '@/assets/solar_star-shine-broken.svg';
import starOrangeIcon from '@/assets/solar_star-shine-broken.svg';

// Get current route untuk deteksi halaman aktif
const route = useRoute();

// State untuk toggle Panduan Cepat secara manual (tombol X)
const showQuickGuide = ref(true);

const shouldShowQuickGuide = computed(() => {
  // Daftar halaman yang menampilkan Panduan Cepat
  const pagesWithQuickGuide = ['/dashboard'];
  
  // Cek apakah halaman saat ini ada di daftar
  const isOnAllowedPage = pagesWithQuickGuide.some(page => 
    route.path === page || route.path.startsWith(page + '/')
  );
  
  // Tampilkan jika: di halaman yang diizinkan DAN user belum menutupnya
  return isOnAllowedPage && showQuickGuide.value;
});

// Tambahkan property 'path' untuk setiap menu item
const mainMenuItems = [
  { name: 'Ringkasan', icon: layoutMasonryIcon, path: '/dashboard' },
  { name: 'Data Visitor', icon: groupLineIcon, path: '/data-visitor' },
  { name: 'Data Kunjungan', icon: logoutBoxIcon, path: '/data-kunjungan' },
  { name: 'Layar Informasi', icon: listIndefiniteIcon, path: '/layar-informasi' },
];

const masterDataItems = [
  { name: 'Profil Perusahaan', icon: buildingIcon, path: '/profil-perusahaan' },
  { name: 'Cabang', icon: gitMergeIcon, path: '/cabang' },
  { name: 'Tujuan & Divisi', icon: listIndefiniteIcon, path: '/tujuan-kunjungan' },
  { name: 'Pengaturan Form Visitor', icon: settingsIcon, path: '/pengaturan-form' },
  { name: 'Manajemen Pengguna', icon: groupLineIcon, path: '/manajemen-pengguna' },
  { name: 'Invoice', icon: fileTextIcon, path: '/invoice' },
];


const isActive = (path) => {
  // Exact match: hanya aktif jika path sama persis dengan route saat ini
  return route.path === path;
};

const quickGuideItems = [
  { name: 'Profil Perusahaan', completed: false },
  { name: 'Cabang', completed: false },
  { name: 'Tujuan & Divisi', completed: false },
];

const completedCount = quickGuideItems.filter(item => item.completed).length;
const progressPercent = Math.round((completedCount / quickGuideItems.length) * 100);
</script>

<template>
  <!-- Sidebar Container with gray background -->
<aside class="w-[260px] bg-[#F4F6F8] flex flex-col p-4 gap-4 font-['Poppins'] sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto hide-scrollbar">    <!-- Card 1: Main Menu + Master Data -->
    <div class="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4">
      <!-- Main Menu Section -->
      <div class="mb-6">
        <h3 class="text-[11px] font-semibold text-[#1E293B] mb-3 tracking-wide">Main Menu</h3>
        <div class="space-y-1">
          <!-- Menggunakan router-link untuk navigasi -->
          <router-link 
            v-for="item in mainMenuItems" 
            :key="item.name"
            :to="item.path"
            :class="[
              'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-[13px] no-underline',
              isActive(item.path) 
                ? 'bg-[#FEF3E2] text-[#F7941D] font-medium' 
                : 'text-[#64748B] hover:bg-gray-50 font-normal'
            ]"
          >
            <img :src="item.icon" alt="" class="w-[18px] h-[18px] flex-shrink-0" :class="{ 'filter-orange': isActive(item.path) }" />
            <span>{{ item.name }}</span>
          </router-link>
        </div>
      </div>

      <!-- Master Data Section -->
      <div>
        <h3 class="text-[11px] font-semibold text-[#1E293B] mb-3 tracking-wide">Master Data</h3>
        <div class="space-y-1">
          <!-- Menggunakan router-link untuk navigasi -->
          <router-link 
            v-for="item in masterDataItems" 
            :key="item.name"
            :to="item.path"
            :class="[
              'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-[13px] no-underline',
              isActive(item.path) 
                ? 'bg-[#FEF3E2] text-[#F7941D] font-medium' 
                : 'text-[#64748B] hover:bg-gray-50 font-normal'
            ]"
          >
            <img :src="item.icon" alt="" class="w-[18px] h-[18px] flex-shrink-0" :class="{ 'filter-orange': isActive(item.path) }" />
            <span>{{ item.name }}</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Card 2: Panduan Cepat - Hanya tampil di halaman yang diizinkan -->
    <div v-if="shouldShowQuickGuide" class="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-2">
        <span class="text-[#F7941D] text-[12px] font-semibold">Panduan Cepat</span>
        <button @click="showQuickGuide = false" class="text-gray-400 hover:text-gray-600 p-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      
      <!-- Content -->
      <p class="text-[12px] text-[#1E293B] font-medium mb-2">Atur akun VisitorKu</p>
      
      <!-- Progress bar - thinner and elegant -->
      <div class="flex items-center gap-2 mb-4">
        <div class="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full bg-[#F7941D] rounded-full transition-all" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <span class="text-[10px] text-gray-400 whitespace-nowrap">{{ progressPercent }}% Complete</span>
      </div>
      
      <!-- Checklist -->
      <div class="space-y-2.5">
        <div v-for="(item, index) in quickGuideItems" :key="index" class="flex items-center gap-2.5">
          <img 
            :src="item.completed ? checkOnIcon : checkOffIcon" 
            alt="" 
            class="w-[18px] h-[18px]" 
          />
          <span :class="['text-[12px]', item.completed ? 'text-[#22C55E] font-medium' : 'text-gray-400']">{{ item.name }}</span>
        </div>
      </div>
    </div>

    <!-- Card 3: Paket VisitorKu - Cream/Orange background -->
    <div class="bg-gradient-to-br from-[#FFF8F0] to-[#FFEDD5] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4 border border-[#FFE4C4]">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <span class="text-[13px] font-semibold text-[#1E293B]">Paket VisitorKu</span>
        <div class="flex items-center gap-1 bg-[#F7941D] rounded-full px-2.5 py-1">
          <img :src="starIcon" alt="" class="w-3.5 h-3.5 filter brightness-0 invert" />
          <span class="text-[10px] font-semibold text-white">Free</span>
        </div>
      </div>
      
      <!-- Batas Kunjungan -->
      <div class="mb-3">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[11px] text-[#64748B] font-medium">Batas Kunjungan</span>
          <span class="text-[11px] text-[#64748B]">Tak terbatas</span>
        </div>
        <div class="h-1 bg-[#FFD9B3] rounded-full overflow-hidden">
          <div class="h-full bg-[#F7941D] rounded-full w-1/4"></div>
        </div>
      </div>
      
      <!-- Kapasitas Penyimpanan -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[11px] text-[#64748B] font-medium">Kapasitas Penyimpanan</span>
          <span class="text-[11px] text-[#64748B]">Unlimited</span>
        </div>
        <div class="h-1 bg-[#FFD9B3] rounded-full overflow-hidden">
          <div class="h-full bg-[#F7941D] rounded-full w-1/6"></div>
        </div>
      </div>
      
      <button class="w-full border-2 border-[#F7941D] text-[#F7941D] text-[12px] font-semibold py-2.5 rounded-xl hover:bg-[#F7941D] hover:text-white transition-all">
        Upgrade Paket
      </button>
    </div>
  </aside>
</template>

<style scoped>
  .filter-orange {
    filter: invert(56%) sepia(89%) saturate(1095%) hue-rotate(360deg) brightness(101%) contrast(96%);
  }

  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>