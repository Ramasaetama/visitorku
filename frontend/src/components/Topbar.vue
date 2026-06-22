<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getAdminProfile } from '@/services/adminProfileService';
import { getProfile } from '@/services/companyProfileService';
import { confirmAction } from '@/utils/alertHelper';
import { themeState } from '@/utils/ThemeState';
import visitorkulogo from '@/assets/visitorku.png';
import globeIcon from '@/assets/proicons_globe.svg';


const router = useRouter();
const { t, locale } = useI18n();

const isDropdownOpen = ref(false);
const isLangDropdownOpen = ref(false);

const languages = [
  { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

const currentLang = ref(languages.find(l => l.code === locale.value) || languages[0]);

watch(locale, (newLocale) => {
  currentLang.value = languages.find(l => l.code === newLocale) || languages[0];
});

const switchLanguage = (lang) => {
  locale.value = lang.code;
  currentLang.value = lang;
  localStorage.setItem('locale', lang.code);
  isLangDropdownOpen.value = false;
};

const toggleLangDropdown = (e) => {
  e.stopPropagation();
  isLangDropdownOpen.value = !isLangDropdownOpen.value;
  if (isLangDropdownOpen.value) isDropdownOpen.value = false;
};

const profileData = ref({
  name: 'Loading...',
  email: '-',
  phone: '-',
  profilePict: null
});

const fetchCompanyTheme = async () => {
  const token = sessionStorage.getItem('token');
  if (!token) return;
  try {
    const response = await getProfile();
    const companyData = response.data || response;
    
    if (companyData.primary_color) {
      themeState.primaryColor = companyData.primary_color;
    }
    if (companyData.background_url || companyData.background) {
      themeState.headerBg = companyData.background_url || companyData.background;
    }
  } catch (error) {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('auth_user');
      router.push('/login');
    } else {
      console.error('Gagal memuat tema perusahaan:', error);
    }
  }
};

const fetchProfileData = async () => {
  const token = sessionStorage.getItem('token');
  if (!token) return;
  try {
    const response = await getAdminProfile();
    const adminData = response.data || response;

    profileData.value = {
      name: adminData.name || adminData.fullname || 'Admin',
      email: adminData.email || adminData.user_email || t('common.emailUnavailable'),
      phone: adminData.phone || adminData.phone_number || t('common.phoneUnavailable'),
      profilePict: adminData.profile_picture || adminData.avatar || adminData.picture || null
    };
  } catch (error) {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('auth_user');
      router.push('/login');
    } else {
      console.error('Gagal memuat data di Topbar:', error);
    }
  }
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
  if (isDropdownOpen.value) isLangDropdownOpen.value = false;
};

const closeDropdown = (e) => {
  if (!e.target.closest('.profile-section')) {
    isDropdownOpen.value = false;
  }
  if (!e.target.closest('.lang-section')) {
    isLangDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
  fetchProfileData(); 
  fetchCompanyTheme(); 
  window.addEventListener('profile-updated', fetchProfileData);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
  window.removeEventListener('profile-updated', fetchProfileData);
});

const handleLogout = async () => {
  const confirmed = await confirmAction(t('common.logoutTitle'), t('common.logoutConfirm'));
  if (confirmed) {
    sessionStorage.removeItem('token'); 
    router.push('/login');
  }
};
</script>

<template>
  <div class="relative z-50 flex flex-col shrink-0">
    
    <header 
      class="relative h-19 flex items-center justify-between px-9 shadow-sm transition-colors duration-300"
      :style="{ backgroundColor: themeState.primaryColor }"
    >    
      
      <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          class="w-full h-full transition-all duration-300 scale-105" 
          :style="themeState.headerBg ? { 
            backgroundImage: `url(${themeState.headerBg})`, 
            backgroundRepeat: 'no-repeat', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            opacity: 0.5
          } : {}"
        ></div>
      </div>
      
      <div class="relative z-10 flex items-center gap-2">
        <router-link to="/dashboard" class="cursor-pointer hover:opacity-80 transition-opacity">
          <img :src="visitorkulogo" alt="Visitorku" class="h-8.5 object-contain" />
        </router-link>
      </div>
      
      <div class="relative z-10 flex items-center gap-4">

        <div class="lang-section relative border-none">
          <button
            @click="toggleLangDropdown"
            class="p-1.5 rounded-sm transition flex items-center gap-1.5"
            :title="t('topbar.selectLanguage')"
          >
            <img :src="globeIcon" alt="Language" class="w-5 h-5" />
            <span class="text-white text-xs font-semibold uppercase hidden sm:inline">{{ currentLang.code }}</span>
          </button>

          <transition
            enter-active-class="transition ease-out duration-150"
            enter-from-class="transform opacity-0 scale-95 translate-y-1"
            enter-to-class="transform opacity-100 scale-100 translate-y-0"
            leave-active-class="transition ease-in duration-100"
            leave-from-class="transform opacity-100 scale-100 translate-y-0"
            leave-to-class="transform opacity-0 scale-95 translate-y-1"
          >
            <div
              v-if="isLangDropdownOpen"
              class="absolute right-0 top-10 w-44 bg-white rounded-sm overflow-hidden border-none z-50"
              @click.stop
            >
              <div class="px-3 py-2 bg-linear-to-r from-[#FFF8F0] to-[#FFEDD5]">
                <p class="text-[13px] font-semibold text-[#F7941D] uppercase tracking-wider">{{ t('topbar.selectLanguage') }}</p>
              </div>
              <div class="py-1">
                <button
                  v-for="lang in languages"
                  :key="lang.code"
                  @click="switchLanguage(lang)"
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all border-none"
                  :class="locale === lang.code
                    ? 'text-[#F7941D] font-medium bg-[#FEF3E2]'
                    : 'text-gray-600 font-normal'"
                >
                  <span class="text-base leading-none">{{ lang.flag }}</span>
                  <span>{{ lang.label }}</span>
                  <span v-if="locale === lang.code" class="ml-auto">
                    <svg class="w-4 h-4 text-[#F7941D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </transition>
        </div>
        
        <div 
          class="profile-section flex items-center gap-2.5 cursor-pointer"
          @click="toggleDropdown"
        >
          <span class="text-white text-[16px] font-medium">{{ profileData.name }}</span>
          
          <img 
            v-if="profileData.profilePict"
            :src="profileData.profilePict"
            alt="Profile" 
            class="w-10 h-10 rounded-full object-cover border-2 border-white/50" 
          />
          <div 
            v-else 
            class="w-8 h-8 bg-white/20 text-white rounded-full flex items-center justify-center text-sm font-medium border border-white/50"
          >
            {{ profileData.name !== 'Loading...' ? profileData.name.charAt(0).toUpperCase() : 'A' }}
          </div>
          
          <svg 
            width="12" height="12" viewBox="0 0 24 24" fill="none" 
            class="text-white transition-transform duration-200"
            :class="{ 'rotate-180': isDropdownOpen }"
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>

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
              class="absolute right-0 top-11.25 w-72 bg-white rounded-sm shadow-lg border border-gray-100 p-5 z-500 cursor-default"
              @click.stop
            >
              <div class="flex flex-col items-center text-center">
                
                <img 
                  v-if="profileData.profilePict"
                  :src="profileData.profilePict"
                  alt="Profile Large" 
                  class="w-16 h-16 rounded-full object-cover mb-3 border border-white" 
                />
                <div 
                  v-else 
                  class="w-16 h-16 bg-[#FFF4E5] text-[#F7941D] rounded-sm flex items-center justify-center text-3xl font-medium mb-3"
                >
                  {{ profileData.name !== 'Loading...' ? profileData.name.charAt(0).toLowerCase() : 'a' }}
                </div>
                
                <h3 class="text-gray-800 font-medium text-lg">{{ profileData.name }}</h3>
                
                <div class="flex items-center gap-2 text-gray-400 text-sm mt-1">
                  <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  <span class="truncate">{{ profileData.email }}</span>
                </div>
                
                <div class="flex items-center gap-2 text-gray-400 text-sm mt-1">
                  <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  <span>{{ profileData.phone }}</span>
                </div>

                <div class="flex items-center gap-3 w-full mt-5">
                  <button 
                    @click="router.push('/edit-profile'); isDropdownOpen = false;"
                    class="flex-1 flex items-center justify-center gap-1.5 py-2 border border-blue-500 text-blue-500 rounded-sm text-sm font-medium hover:bg-blue-50 transition"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    {{ t('topbar.editProfile') }}
                  </button>
                  
                  <button 
                    @click="handleLogout"
                    class="flex-1 flex items-center justify-center gap-1.5 py-2 border border-red-500 text-red-500 rounded-sm text-sm font-medium hover:bg-red-50 transition"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    {{ t('topbar.logout') }}
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </header>

    <div class="h-5 w-full bg-[#F4F6F8]"></div>
  </div>
</template>

<style scoped>
button:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>