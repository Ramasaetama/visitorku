<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    <!-- Topbar with pattern -->
    <Topbar />

    <div class="flex flex-1">
      <Sidebar />
        <main class="flex-1 bg-[#F4F6F8] p-4">
          <div class="bg-white rounded-2xl shadow-sm h-full flex flex-col">
            <div class="p-6 flex-1 flex flex-col overflow-y-auto">
              
              <div class="mb-6">
                <h1 class="text-2xl font-semibold text-gray-800 mb-1">Profil Perusahaan</h1>
              </div>

              <div class="border-b border-gray-200 mb-8">
                <nav class="-mb-px flex gap-8">
                  <button 
                    v-for="tab in tabs" :key="tab.id"
                    @click="activeTab = tab.id"
                    class="outline-none focus:outline-none focus:ring-0 focus-visible:outline-none whitespace-nowrap py-4 border-b-[2.5px] font-medium text-sm transition-colors"
                    :class="activeTab === tab.id ? 'border-[#3B82F6] text-[#3B82F6]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                  >
                    {{ tab.label }}
                  </button>
                </nav>
              </div>

              <div v-if="isLoading" class="text-center py-10 text-gray-500">Loading data...</div>
              
              <div v-else>
                <AccountTab 
                  v-if="activeTab === 'account'" 
                  :profileData="profileData" 
                  @refresh="onDataSaved" 
                />
                
                <ProfilePictureTab 
                  v-if="activeTab === 'picture'" 
                  :profileData="profileData" 
                  @refresh="onDataSaved" 
                />
                
                <PasswordTab 
                  v-if="activeTab === 'password'" 
                />
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 💡 HAPUS import Topbar dan Sidebar agar tidak dobel dengan App.vue
import AccountTab from '@/components/adminProfile/AccountTab.vue';
import ProfilePictureTab from '@/components/adminProfile/ProfilePictureTab.vue';
import PasswordTab from '@/components/adminProfile/PasswordTab.vue';
import { getAdminProfile } from '@/services/adminProfileService';
import Topbar from '@/components/Topbar.vue';
import Sidebar from '@/components/Sidebar.vue';

const activeTab = ref('account');
const isLoading = ref(true);
const profileData = ref({});

const tabs = [
  { id: 'account', label: 'Account', icon: 'svg' }, 
  { id: 'picture', label: 'Profile picture', icon: 'svg' },
  { id: 'password', label: 'Password', icon: 'svg' },
];

const fetchData = async () => {
  isLoading.value = true;
  try {
    const response = await getAdminProfile();
    profileData.value = response.data?.data || response.data || response;
  } catch (error) {
    console.error("Gagal memuat profil admin:", error);
  } finally {
    isLoading.value = false;
  }
};

const onDataSaved = async () => {
  await fetchData(); 
  window.dispatchEvent(new Event('profile-updated')); 
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
button, 
button:focus, 
button:active, 
button:focus-visible {
  outline: none !important;
  box-shadow: none !important;
  -webkit-tap-highlight-color: transparent !important;
}
</style>