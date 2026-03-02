<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
// IMPORT FUNGSI API GET PROFILE
import { getAdminProfile } from '@/services/profileService'; 

import visitorkulogo from '@/assets/visitorku.png';
import patternBg from '@/assets/Frame 7.svg';
import globeIcon from '@/assets/proicons_globe.svg';
import adminprofile from '@/assets/adminprofile.png';

const router = useRouter();
const isDropdownOpen = ref(false);

const profileData = ref({
  name: 'Loading...',
  email: '-',
  phone: '-',
  logoUrl: null
});

const fetchProfileData = async () => {
  try {
    const response = await getAdminProfile(); 
    
    const data = response.data || response;
    
    console.log("🔥 Data DARI /admin/profile:", data); 

    profileData.value = {
      name: data.name || data.fullname || 'Admin',
      email: data.email || data.user_email || 'Email tidak tersedia',
      phone: data.phone || data.phone_number || 'Nomer Telepon Tidak Tersedia',
      logoUrl: data.avatar || data.profile_picture || null
    };
  } catch (error) {
    console.error('Gagal memuat data profil di Topbar:', error);
  }
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = (e) => {
  if (!e.target.closest('.profile-section')) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
  fetchProfileData();
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});

const handleLogout = () => {
  if(confirm('Apakah Anda yakin ingin keluar?')) {
    localStorage.removeItem('token');
    router.push('/login');
  }
};
</script>

<template>
  <header class="relative bg-linear-to-r from-[#F7941D] to-[#F9A825] h-14 flex items-center justify-between px-6 shadow-sm">
    
    <div 
      class="absolute inset-0 pointer-events-none" 
      :style="{ 
        backgroundImage: `url(${patternBg})`, 
        backgroundRepeat: 'repeat-x', 
        backgroundSize: 'auto 100%',
        backgroundPosition: 'center',
        opacity: 0.5
      }"
    ></div>
    
    <div class="relative z-10 flex items-center gap-2">
      <router-link to="/dashboard" class="cursor-pointer hover:opacity-80 transition-opacity">
        <img :src="visitorkulogo" alt="Visitorku" class="h-6 object-contain" />
      </router-link>
    </div>
    
    <div class="relative z-10 flex items-center gap-4">
      <button class="p-1.5 rounded-full hover:bg-white/20 transition">
        <img :src="globeIcon" alt="Language" class="w-5 h-5" />
      </button>
      
      <div 
        class="profile-section flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        @click="toggleDropdown"
      >
        <span class="text-white text-[14px] font-medium">{{ profileData.name || 'Admin' }}</span>
        
        <img 
          :src="profileData.logoUrl || adminprofile"
          alt="Profile" 
          class="w-8 h-8 rounded-full object-cover border-2 border-white/50" 
        />
        
        <svg 
          width="12" height="12" viewBox="0 0 24 24" fill="none" 
          class="text-white transition-transform duration-200"
          :class="{ 'rotate-180': isDropdownOpen }"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <transition 
        enter-active-class="transition ease-out duration-100" 
        enter-from-class="transform opacity-0 scale-95" 
        enter-to-class="transform opacity-100 scale-100" 
        leave-active-class="transition ease-in duration-75" 
        leave-from-class="transform opacity-100 scale-100" 
        leave-to-class="transform opacity-0 scale-95"
      >
        <div 
          v-if="isDropdownOpen"
          class="absolute right-6 top-15 w-72 bg-white rounded-xl shadow-lg border border-gray-100 p-5 z-50"
        >
          <div class="flex flex-col items-center text-center">
            
            <div class="w-16 h-16 bg-[#FFF4E5] text-[#F7941D] rounded-xl flex items-center justify-center text-3xl font-medium mb-3">
              {{ profileData.name ? profileData.name.charAt(0).toLowerCase() : 't' }}
            </div>
            
            <h3 class="text-gray-800 font-medium text-lg">{{ profileData.name }}</h3>
            
            <div class="flex items-center gap-2 text-gray-400 text-sm mt-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              <span>{{ profileData.email }}</span>
            </div>
            
            <div class="flex items-center gap-2 text-gray-400 text-sm mt-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              <span>{{ profileData.phone }}</span>
            </div>

            <div class="flex items-center gap-3 w-full mt-5">
              <button 
                @click="router.push('/profil-perusahaan')"
                class="flex-1 flex items-center justify-center gap-1.5 py-2 border border-blue-500 text-blue-500 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Edit Profile
              </button>
              
              <button 
                @click="handleLogout"
                class="flex-1 flex items-center justify-center gap-1.5 py-2 border border-red-500 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </header>
</template>