<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

// Import icons directly
import layoutMasonryIcon from '@/assets/layout-masonry-line.svg';
import groupLineIcon from '@/assets/group-line.svg';
import logoutBoxIcon from '@/assets/logout-box-r-line.svg';
import listIndefiniteIcon from '@/assets/list-indefinite.svg';
import buildingIcon from '@/assets/building-4-line.svg';
import gitMergeIcon from '@/assets/git-merge-line.svg';
import settingsIcon from '@/assets/settings-3-line.svg';
import fileTextIcon from '@/assets/file-text-line.svg';
import checkOnIcon from '@/assets/icon-park-solid_check-one-on.svg';
import checkOffIcon from '@/assets/icon-park-solid_check-one.svg';
import starIcon from '@/assets/solar_star-shine-broken.svg';
import calendarIcon from '@/assets/calendar-line.svg';

const { t } = useI18n();
const route = useRoute();

const showQuickGuide = ref(true);

const shouldShowQuickGuide = computed(() => {
  const pagesWithQuickGuide = ['/dashboard'];
  const isOnAllowedPage = pagesWithQuickGuide.some(page =>
    route.path === page || route.path.startsWith(page + '/')
  );
  return isOnAllowedPage && showQuickGuide.value;
});

const mainMenuItems = computed(() => [
  { key: 'menu.dashboard', icon: layoutMasonryIcon, path: '/dashboard' },
  { key: 'menu.dataVisitor', icon: groupLineIcon, path: '/data-visitor' },
  { key: 'menu.dataKunjungan', icon: logoutBoxIcon, path: '/data-kunjungan' },
  { key: 'menu.event', icon: calendarIcon, path: '/event' },
  { key: 'menu.layarInformasi', icon: listIndefiniteIcon, path: '/layar-informasi' },
]);

const masterDataItems = computed(() => [
  { key: 'menu.profilPerusahaan', icon: buildingIcon, path: '/profil-perusahaan' },
  { key: 'menu.cabang', icon: gitMergeIcon, path: '/cabang' },
  { key: 'menu.tujuanDivisi', icon: listIndefiniteIcon, path: '/tujuan-kunjungan' },
  { key: 'menu.pengaturanForm', icon: settingsIcon, path: '/pengaturan-form' },
  { key: 'menu.manajemenPengguna', icon: groupLineIcon, path: '/manajemen-pengguna' },
  { key: 'menu.invoice', icon: fileTextIcon, path: '/invoice' },
]);

const isActive = (path) => {
  if (path === '/event') {
    return route.path === '/event' || route.path.startsWith('/event/');
  }
  return route.path === path;
};

const quickGuideItems = computed(() => [
  { nameKey: 'quickGuideItems.profilPerusahaan', completed: false },
  { nameKey: 'quickGuideItems.cabang', completed: false },
  { nameKey: 'quickGuideItems.tujuanDivisi', completed: false },
]);

const completedCount = computed(() => quickGuideItems.value.filter(item => item.completed).length);
const progressPercent = computed(() => Math.round((completedCount.value / quickGuideItems.value.length) * 100));
</script>

<template>
  <aside class="hidden md:flex w-65 bg-[#F4F6F8] flex-col mr-4 mb-4 ml-4 gap-4 font-['Poppins'] h-[calc(100%-1rem)] overflow-y-auto hide-scrollbar shrink-0 overscroll-contain">
      <div class="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4">
      <div class="mb-6">
        <h3 class="text-[16px] font-semibold text-[#1E293B] mb-5 tracking-wide">{{ t('sidebar.mainMenu') }}</h3>
        <div class="space-y-1">
          <router-link
            v-for="item in mainMenuItems"
            :key="item.key"
            :to="item.path"
            :class="[
              'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-[13px] no-underline',
              isActive(item.path)
                ? 'bg-[#FEF3E2] text-[#F7941D] font-medium'
                : 'text-[#64748B] hover:bg-gray-50 font-normal'
            ]"
          >
            <img :src="item.icon" alt="" class="w-4.5 h-4.5 shrink-0" :class="{ 'filter-orange': isActive(item.path) }" />
            <span>{{ t('sidebar.' + item.key) }}</span>
          </router-link>
        </div>
      </div>

      <div>
        <h3 class="text-[16px] font-semibold text-[#1E293B] mb-5 tracking-wide">{{ t('sidebar.masterData') }}</h3>
        <div class="space-y-1">
          <router-link
            v-for="item in masterDataItems"
            :key="item.key"
            :to="item.path"
            :class="[
              'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-[13px] no-underline',
              isActive(item.path)
                ? 'bg-[#FEF3E2] text-[#F7941D] font-medium'
                : 'text-[#64748B] hover:bg-gray-50 font-normal'
            ]"
          >
            <img :src="item.icon" alt="" class="w-4.5 h-4.5 shrink-0" :class="{ 'filter-orange': isActive(item.path) }" />
            <span>{{ t('sidebar.' + item.key) }}</span>
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="shouldShowQuickGuide" class="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[#F7941D] text-[12px] font-semibold">{{ t('sidebar.quickGuide') }}</span>
        <button @click="showQuickGuide = false" class="text-gray-400 hover:text-gray-600 p-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <p class="text-[12px] text-[#1E293B] font-medium mb-2">{{ t('sidebar.setupAccount') }}</p>
      <div class="flex items-center gap-2 mb-4">
        <div class="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full bg-[#F7941D] rounded-full transition-all" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <span class="text-[10px] text-gray-400 whitespace-nowrap">{{ progressPercent }}% {{ t('sidebar.complete') }}</span>
      </div>
      <div class="space-y-2.5">
        <div v-for="(item, index) in quickGuideItems" :key="index" class="flex items-center gap-2.5">
          <img :src="item.completed ? checkOnIcon : checkOffIcon" alt="" class="w-4.5 h-4.5" />
          <span :class="['text-[12px]', item.completed ? 'text-[#22C55E] font-medium' : 'text-gray-400']">{{ t('sidebar.' + item.nameKey) }}</span>
        </div>
      </div>
    </div>

    <div class="bg-linear-to-br from-[#FFF8F0] to-[#FFEDD5] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4 border border-[#FFE4C4]">
      <div class="flex items-center justify-between mb-4">
        <span class="text-[13px] font-semibold text-[#1E293B]">{{ t('sidebar.visitorPackage') }}</span>
        <div class="flex items-center gap-1 bg-[#F7941D] rounded-full px-2.5 py-1">
          <img :src="starIcon" alt="" class="w-3.5 h-3.5 filter brightness-0 invert" />
          <span class="text-[10px] font-semibold text-white">Free</span>
        </div>
      </div>
      <div class="mb-3">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[11px] text-[#64748B] font-medium">{{ t('sidebar.visitLimit') }}</span>
          <span class="text-[11px] text-[#64748B]">{{ t('sidebar.unlimited') }}</span>
        </div>
        <div class="h-1 bg-[#FFD9B3] rounded-full overflow-hidden">
          <div class="h-full bg-[#F7941D] rounded-full w-1/4"></div>
        </div>
      </div>
      <div class="mb-4">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[11px] text-[#64748B] font-medium">{{ t('sidebar.storageCapacity') }}</span>
          <span class="text-[11px] text-[#64748B]">{{ t('sidebar.unlimited') }}</span>
        </div>
        <div class="h-1 bg-[#FFD9B3] rounded-full overflow-hidden">
          <div class="h-full bg-[#F7941D] rounded-full w-1/6"></div>
        </div>
      </div>
      <button class="w-full border-2 border-[#F7941D] text-[#F7941D] text-[12px] font-semibold py-2.5 rounded-xl hover:bg-[#F7941D] hover:text-white transition-all">
        {{ t('sidebar.upgradePackage') }}
      </button>
    </div>
  </aside>

  <aside class="flex md:hidden w-14 bg-[#F4F6F8] flex-col items-center py-3 gap-1 font-['Poppins'] h-full overflow-y-auto hide-scrollbar shrink-0 overscroll-contain">
        <div class="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-2 w-full flex flex-col items-center gap-1">
      <router-link
        v-for="item in mainMenuItems"
        :key="'m-' + item.key"
        :to="item.path"
        :title="t('sidebar.' + item.key)"
        :class="[
          'flex items-center justify-center w-9 h-9 rounded-lg transition-all',
          isActive(item.path)
            ? 'bg-[#FEF3E2]'
            : 'hover:bg-gray-100'
        ]"
      >
        <img
          :src="item.icon"
          :alt="t('sidebar.' + item.key)"
          class="w-5 h-5"
          :class="{ 'filter-orange': isActive(item.path) }"
        />
      </router-link>

      <div class="w-8 h-px bg-gray-200 my-1"></div>

      <router-link
        v-for="item in masterDataItems"
        :key="'d-' + item.key"
        :to="item.path"
        :title="t('sidebar.' + item.key)"
        :class="[
          'flex items-center justify-center w-9 h-9 rounded-lg transition-all',
          isActive(item.path)
            ? 'bg-[#FEF3E2]'
            : 'hover:bg-gray-100'
        ]"
      >
        <img
          :src="item.icon"
          :alt="t('sidebar.' + item.key)"
          class="w-5 h-5"
          :class="{ 'filter-orange': isActive(item.path) }"
        />
      </router-link>
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