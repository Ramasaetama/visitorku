<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    <!-- Topbar with pattern -->
    <header class="relative bg-gradient-to-r from-[#F7941D] to-[#F9A825] h-[56px] flex items-center justify-between px-6 overflow-hidden">
      <!-- Background pattern using Frame 7.svg -->
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
        <!-- Globe icon -->
        <button class="p-1.5 rounded-full hover:bg-white/20 transition">
          <img :src="globeIcon" alt="Language" class="w-5 h-5" />
        </button>
        
        <!-- Admin profile -->
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

    <div class="flex flex-1">
      <Sidebar />
      <!-- Main content area with light gray background -->
      <main class="flex-1 bg-[#F9FBFE]">
        <!-- Main content area is empty as shown in design -->
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue';
import logoIcon from '@/assets/images/logo.svg';
import globeIcon from '@/assets/proicons_globe.svg';
import visitorkulogo from '@/assets/visitorku.png';
import patternBg from '@/assets/Frame 7.svg';
import adminprofile from '@/assets/adminprofile.png';
</script>
