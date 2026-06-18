<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DataTable from '@/components/common/DataTable.vue';
import { getVisitorDetail } from '@/services/visitorService';

const route = useRoute();
const router = useRouter();
const visitorId = route.params.id; 

// State Data
const visitorInfo = ref({});
const histories = ref([]);
const isLoading = ref(true);

// Definisi Kolom untuk DataTable
const historyColumns = [
  { key: 'category', label: 'Tujuan', sortable: false },
  { key: 'location', label: 'Lokasi', sortable: false },
  { key: 'check_in_at', label: 'Check In', sortable: false },
  { key: 'check_out_at', label: 'Check Out', sortable: false },
];

const fetchDetail = async () => {
  try {
    const response = await getVisitorDetail(visitorId);
    const data = response?.data?.data || response?.data;
    
    if (data) {
      visitorInfo.value = data;
      histories.value = data.histories || [];
    }
  } catch (error) {
    console.error('Gagal mengambil detail visitor:', error);
  } finally {
    isLoading.value = false;
  }
};

// Fungsi memformat tanggal ke DD-MM-YYYY HH:mm:ss
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  fetchDetail();
});
</script>

<template>
  <div class="flex-1 w-full h-full flex flex-col">
    <main class="bg-white rounded-2xl shadow-sm h-full min-h-[calc(100vh-7rem)] flex flex-col relative w-full">
      <div class="p-6 flex-1 flex flex-col overflow-y-auto">
        
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <button @click="goBack" class="w-8 h-8 flex items-center justify-center bg-[#FEF4E3] text-[#F7941D] rounded-sm hover:bg-[#F7941D] hover:text-white transition-colors focus:outline-none">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <h1 class="text-2xl font-semibold text-gray-800">Visitor Detail</h1>
          </div>
        </div>

        <div v-if="!isLoading" class="flex flex-col md:flex-row gap-6 mb-10">
          <div class="w-37.5 h-45 shrink-0 rounded-sm overflow-hidden bg-[#F4F6F8] border border-gray-100">
            <img v-if="visitorInfo.photo_profile" :src="visitorInfo.photo_profile" class="w-full h-full object-cover" alt="Profile" />
            <div v-else class="w-full h-full flex items-center justify-center text-sm font-medium text-gray-500">
              Profile
            </div>
          </div>

          <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            <div class="flex flex-col gap-5">
              <div>
                <p class="text-[13px] text-[#64748B] font-semibold">Nama Lengkap</p>
                <p class="text-[14px] font-medium text-[#1E293B] mt-0.5">{{ visitorInfo.name || '-' }}</p>
              </div>
              <div>
                <p class="text-[13px] text-[#64748B] font-semibold">Email</p>
                <p class="text-[14px] font-medium text-[#1E293B] mt-0.5">{{ visitorInfo.email || '-' }}</p>
              </div>
              <div>
                <p class="text-[13px] text-[#64748B] font-semibold">No Telepon</p>
                <p class="text-[14px] font-medium text-[#1E293B] mt-0.5">{{ visitorInfo.phone_number || '-' }}</p>
              </div>
            </div>

            <div>
              <p class="text-[13px] text-[#64748B] font-semibold">Catatan</p>
              <p class="text-[14px] font-medium text-[#1E293B] mt-0.5 whitespace-pre-wrap">{{ visitorInfo.notes || '-' }}</p>
            </div>

          </div>
        </div>

        <div v-else class="flex gap-8 mb-10 animate-pulse">
          <div class="w-48 h-56 bg-gray-200 rounded-xl"></div>
          <div class="flex-1 grid grid-cols-2 gap-8">
            <div class="space-y-6"><div class="h-4 bg-gray-200 rounded w-1/4"></div><div class="h-4 bg-gray-200 rounded w-3/4"></div></div>
            <div class="space-y-6"><div class="h-4 bg-gray-200 rounded w-1/4"></div><div class="h-4 bg-gray-200 rounded w-full"></div></div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-[17px] font-bold text-gray-900">Check-in History</h2>
            
            <button class="flex items-center gap-2 px-4 py-2 bg-white border border-[#38CA99] text-[#38CA99] rounded-sm font-medium text-sm hover:bg-[#38CA99] hover:text-white transition-colors focus:outline-none">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-3 3m0 0l-3-3m3 3V4"></path></svg>
              Excel
            </button>
          </div>

          <div class="border border-gray-100 rounded-lg overflow-hidden">
            <DataTable 
              :columns="historyColumns" 
              :data="histories" 
              :loading="isLoading"
            >
              <template #category="{ row }">
                <span class="font-medium">{{ row.category || '-' }}</span>
              </template>
              
              <template #location="{ row }">
                <span class="text-gray-600">{{ row.company || '-' }}</span>
              </template>

              <template #check_in_at="{ row }">
                <div class="flex items-center gap-2.5">
                  <img v-if="row.picture_url" :src="row.picture_url" class="w-7 h-7 rounded-sm object-cover bg-gray-100" />
                  <div v-else class="w-7 h-7 rounded-md bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">?</div>
                  <span class="text-sm font-medium">{{ formatDate(row.datetime) }}</span>
                </div>
              </template>

              <template #check_out_at="{ row }">
                <div class="flex items-center gap-2.5" v-if="row.logout_data">
                  <img v-if="row.logout_data.picture_url" :src="row.logout_data.picture_url" class="w-7 h-7 rounded-sm object-cover bg-gray-100" />
                  <div v-else class="w-7 h-7 rounded-md bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">?</div>
                  <span class="text-sm font-medium">{{ formatDate(row.logout_data.datetime) }}</span>
                </div>
                <span v-else class="text-gray-400 font-medium">-</span>
              </template>
              
            </DataTable>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>