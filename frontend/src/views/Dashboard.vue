<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    <!-- Topbar with pattern -->
    <Topbar />

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
import Topbar from '@/components/Topbar.vue';
</script>
