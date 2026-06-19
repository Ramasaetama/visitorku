<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getEventVisitorById, getEventFeedbackList } from '@/services/eventService';

const route    = useRoute();
const router   = useRouter();
const visitorId = route.params.id;

// ─── State ────────────────────────────────────────────────────────────────────
const visitorInfo  = ref(null);
const feedbackInfo = ref(null);
const isLoading    = ref(true);

// ─── Fetch ────────────────────────────────────────────────────────────────────
const fetchDetail = async () => {
  try {
    const res  = await getEventVisitorById(visitorId);
    const data = res?.data?.data ?? res?.data ?? res;
    visitorInfo.value = data;

    // Jika visitor punya feedback, fetch dari list lalu filter by event_visitor_id
    if (data.feedback && data.event_id) {
      try {
        const fbRes  = await getEventFeedbackList(data.event_id);
        const list   = fbRes?.data?.data ?? fbRes?.data ?? [];
        feedbackInfo.value = list.find(f => f.event_visitor_id === visitorId) ?? null;
      } catch {
        feedbackInfo.value = null;
      }
    }
  } catch (err) {
    console.error('Gagal mengambil detail event visitor:', err);
  } finally {
    isLoading.value = false;
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (val) => {
  if (!val) return '-';
  const d   = new Date(val);
  if (isNaN(d)) return val;
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const satisfactionLabel = (val) => {
  if (val === 3) return { label: 'Happy',   color: '#10B981' };
  if (val === 2) return { label: 'Neutral', color: '#F59E0B' };
  if (val === 1) return { label: 'Sad',     color: '#EF4444' };
  return null;
};

const goBack = () => router.back();

onMounted(fetchDetail);
</script>

<template>
  <div class="flex-1 w-full h-full flex flex-col">
    <main class="bg-white rounded-2xl shadow-sm h-full min-h-[calc(100vh-7rem)] flex flex-col relative w-full">
      <div class="p-6 flex-1 flex flex-col overflow-y-auto">
        
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <button
              @click="goBack"
              class="w-8 h-8 flex items-center justify-center bg-[#FEF4E3] text-[#F7941D] rounded-sm hover:bg-[#F7941D] hover:text-white transition-colors focus:outline-none"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 class="text-2xl font-semibold text-gray-800">Visitor Detail</h1>
          </div>
        </div>

        <div v-if="isLoading" class="animate-pulse space-y-8">
          <div class="grid grid-cols-2 gap-8">
            <div class="space-y-4">
              <div class="h-3 bg-gray-200 rounded w-1/4"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              <div class="h-3 bg-gray-200 rounded w-1/4 mt-4"></div>
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/4 mt-4"></div>
              <div class="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div class="space-y-4">
              <div class="h-3 bg-gray-200 rounded w-1/4"></div>
              <div class="h-4 bg-gray-200 rounded w-1/3"></div>
              <div class="h-3 bg-gray-200 rounded w-1/4 mt-4"></div>
              <div class="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>

        <div v-else-if="visitorInfo" class="space-y-8">

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">

            <div class="space-y-5">
              <div>
                <p class="text-[13px] font-semibold text-gray-400 mb-1">Full Name</p>
                <p class="text-[15px] font-medium text-gray-800">{{ visitorInfo.name || '-' }}</p>
              </div>
              <div>
                <p class="text-[13px] font-semibold text-gray-400 mb-1">Email</p>
                <p class="text-[15px] font-medium text-gray-800">{{ visitorInfo.email || '-' }}</p>
              </div>
              <div>
                <p class="text-[13px] font-semibold text-gray-400 mb-1">Phone Number</p>
                <p class="text-[15px] font-medium text-gray-800">{{ visitorInfo.phone_number || '-' }}</p>
              </div>
            </div>

            <div class="space-y-5">
              <div>
                <p class="text-[13px] font-semibold text-gray-400 mb-1">Check In</p>
                <div class="flex items-center gap-2.5">
                  <img
                    v-if="visitorInfo.check_in_picture"
                    :src="visitorInfo.check_in_picture"
                    class="w-8 h-8 rounded object-cover bg-gray-100"
                    alt="Check In Photo"
                  />
                  <p class="text-[15px] font-medium text-gray-800">
                    {{ formatDate(visitorInfo.check_in_at) }}
                  </p>
                </div>
              </div>
              <div>
                <p class="text-[13px] font-semibold text-gray-400 mb-1">Check Out</p>
                <div class="flex items-center gap-2.5">
                  <img
                    v-if="visitorInfo.check_out_picture"
                    :src="visitorInfo.check_out_picture"
                    class="w-8 h-8 rounded object-cover bg-gray-100"
                    alt="Check Out Photo"
                  />
                  <p class="text-[15px] font-medium text-gray-800">
                    {{ formatDate(visitorInfo.check_out_at) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <hr class="border-gray-100" />

          <div>
            <h2 class="text-[17px] font-bold text-gray-900 mb-4">Feedback</h2>

            <div v-if="feedbackInfo || visitorInfo.satisfaction" class="space-y-4">

              <div v-if="visitorInfo.satisfaction" class="flex items-center gap-3">
                <p class="text-[13px] font-semibold text-gray-400 w-28">Satisfaction</p>
                <div class="flex items-center gap-2">
                  <template v-if="visitorInfo.satisfaction === 3">
                    <svg class="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke-width="2"/>
                      <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
                      <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
                      <path d="M8 14.5c1.5 2 4.5 2 6 0" stroke-linecap="round"/>
                    </svg>
                    <span class="text-[13px] font-medium text-[#10B981]">Happy</span>
                  </template>
                  <template v-else-if="visitorInfo.satisfaction === 2">
                    <svg class="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke-width="2"/>
                      <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
                      <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
                      <line x1="8" y1="15" x2="16" y2="15" stroke-linecap="round"/>
                    </svg>
                    <span class="text-[13px] font-medium text-[#F59E0B]">Neutral</span>
                  </template>
                  <template v-else-if="visitorInfo.satisfaction === 1">
                    <svg class="w-6 h-6 text-[#EF4444]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke-width="2"/>
                      <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
                      <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
                      <path d="M8 16c1.5-2 4.5-2 6 0" stroke-linecap="round"/>
                    </svg>
                    <span class="text-[13px] font-medium text-[#EF4444]">Sad</span>
                  </template>
                </div>
              </div>

              <div v-if="feedbackInfo?.notes">
                <p class="text-[13px] font-semibold text-gray-400 mb-1">Note</p>
                <p class="text-[14px] text-gray-700 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">{{ feedbackInfo.notes }}</p>
              </div>

              <div v-if="feedbackInfo?.additional_data && Object.keys(feedbackInfo.additional_data).length">
                <p class="text-[13px] font-semibold text-gray-400 mb-2">Detail Feedback</p>
                <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div
                    v-for="(value, key) in feedbackInfo.additional_data"
                    :key="key"
                    class="flex gap-2"
                  >
                    <span class="text-[13px] font-semibold text-gray-500 capitalize min-w-[120px]">{{ key.replace(/_/g, ' ') }}</span>
                    <span class="text-[13px] text-gray-700">: {{ value }}</span>
                  </div>
                </div>
              </div>
              
            </div>

            <div v-else class="flex flex-col items-center justify-center py-10 text-gray-400">
              <svg class="w-10 h-10 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p class="text-sm font-medium text-gray-400">Tidak ada feedback</p>
            </div>
          </div>

        </div>

        <div v-else class="flex flex-col items-center justify-center py-20 text-gray-400">
          <svg class="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
          <p class="text-sm font-medium text-gray-500">Data tidak ditemukan</p>
          <button @click="goBack" class="mt-4 text-sm text-[#F7941D] hover:underline focus:outline-none">Kembali</button>
        </div>

      </div>
    </main>
  </div> 
</template>

<style scoped>
button:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>