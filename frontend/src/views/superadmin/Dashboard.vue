<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    <SuperAdminTopbar />

    <div class="flex flex-1">
      <SuperAdminSidebar />
      <main class="flex-1 bg-[#F4F6F8] p-4">
        <div class="bg-white rounded-2xl shadow-sm p-6">
          <h1 class="text-2xl font-semibold text-gray-800 mb-2"></h1>
          <p class="text-sm text-gray-500"></p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import SuperAdminSidebar from '@/components/superadmin/SuperAdminSidebar.vue';
import SuperAdminTopbar from '@/components/superadmin/SuperAdminTopbar.vue';
</script>
