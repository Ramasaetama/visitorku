<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getEventFeedbackDetail, getEventVisitorById } from '@/services/eventService';

const route      = useRoute();
const router     = useRouter();
const feedbackId = route.params.id;

// ─── State ────────────────────────────────────────────────────────────────────
const detail    = ref(null);
const isLoading = ref(true);

// ─── Fetch ────────────────────────────────────────────────────────────────────
const fetchDetail = async () => {
  try {
    // 1. Ambil data row dari list (dikirim via router state)
    let stateData = null;
    try {
      const raw = window.history.state?.feedbackRow;
      if (raw) stateData = JSON.parse(raw);
    } catch {}
    console.log('[EventFeedbackDetail] stateData:', JSON.stringify(stateData));

    // 2. Fetch feedback detail dari API
    const res     = await getEventFeedbackDetail(feedbackId);
    const apiData = res?.data?.data ?? res?.data ?? res;
    console.log('[EventFeedbackDetail] apiData:', JSON.stringify(apiData));

    // 3. Gabungkan base data (API + state)
    let merged = { ...apiData };
    if (stateData) {
      // Ambil field yang mungkin ada di state tapi tidak di API
      merged = { ...merged, _state: stateData };
    }

    // 4. Coba fetch visitor data jika ada event_visitor_id / visitor_id
    const visitorId =
      apiData?.event_visitor_id ??
      apiData?.visitor_id ??
      stateData?.event_visitor_id ??
      stateData?.visitor_id ??
      null;

    console.log('[EventFeedbackDetail] visitorId:', visitorId);

    if (visitorId) {
      try {
        const vRes     = await getEventVisitorById(visitorId);
        const vData    = vRes?.data?.data ?? vRes?.data ?? vRes;
        console.log('[EventFeedbackDetail] visitorData:', JSON.stringify(vData));
        // Gabungkan visitor data — visitor data lebih lengkap (email, phone, checkin, checkout)
        merged = { ...merged, _visitor: vData };
      } catch (e) {
        console.warn('Gagal fetch visitor:', e);
      }
    }

    detail.value = merged;
  } catch (err) {
    console.error('Gagal mengambil detail feedback:', err);
  } finally {
    isLoading.value = false;
  }
};

// ─── Helper: baca nilai dari berbagai sumber (API, visitor, state) ─────────────
const get = (keys) => {
  const d = detail.value;
  if (!d) return null;
  // Cari di root (API response)
  for (const k of keys) {
    if (d[k] !== undefined && d[k] !== null && d[k] !== '') return d[k];
  }
  // Cari di _visitor (data dari getEventVisitorById)
  if (d._visitor) {
    for (const k of keys) {
      if (d._visitor[k] !== undefined && d._visitor[k] !== null && d._visitor[k] !== '') return d._visitor[k];
    }
  }
  // Cari di _state (data raw dari list)
  if (d._state) {
    for (const k of keys) {
      if (d._state[k] !== undefined && d._state[k] !== null && d._state[k] !== '') return d._state[k];
    }
  }
  return null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d)) return val;
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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
            <h1 class="text-xl font-bold text-gray-800">Visitor Detail</h1>
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

        <div v-else-if="detail" class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">

            <div class="space-y-5">
              <div>
                <p class="text-[15px] font-medium text-gray-400 mb-1">Full Name</p>
                <p class="text-[15px] font-medium text-gray-800">
                  {{ get(['name','visitor_name','full_name','visitor?.name']) ?? '-' }}
                </p>
              </div>
              <div>
                <p class="text-[15px] font-medium text-gray-400 mb-1">Email</p>
                <p class="text-[15px] font-medium text-gray-800">
                  {{ get(['email','visitor_email','visitor?.email']) ?? '-' }}
                </p>
              </div>
              <div>
                <p class="text-[15px] font-medium text-gray-400 mb-1">Phone Number</p>
                <p class="text-[15px] font-medium text-gray-800">
                  {{ get(['phone_number','phone','visitor_phone','no_hp','telp']) ?? '-' }}
                </p>
              </div>
            </div>

            <div class="space-y-5">
              <div>
                <p class="text-[15px] font-medium text-gray-400 mb-1">Check In</p>
                <p class="text-[15px] font-medium text-gray-800">
                  {{ formatDate(get(['check_in_at','check_in','checkin_at','check_in_time','checkin','checked_in_at'])) }}
                </p>
              </div>
              <div>
                <p class="text-[15px] font-medium text-gray-400 mb-1">Check Out</p>
                <p class="text-[15px] font-medium text-gray-800">
                  {{ formatDate(get(['check_out_at','check_out','checkout_at','check_out_time','checkout','checked_out_at'])) }}
                </p>
              </div>
            </div>
          </div>

          <hr class="border-gray-100" />

          <div>
            <h2 class="text-[17px] font-bold text-gray-900 mb-5">Feedback</h2>

            <div v-if="get(['satisfaction']) || get(['notes','feedback'])" class="flex items-center gap-6">

              <div
                class="w-[100px] h-[100px] rounded-lg border-2 flex items-center justify-center flex-shrink-0"
                :class="{
                  'border-[#10B981] text-[#10B981]': get(['satisfaction']) === 3,
                  'border-[#F59E0B] text-[#F59E0B]': get(['satisfaction']) === 2,
                  'border-[#EF4444] text-[#EF4444]': get(['satisfaction']) === 1,
                  'border-gray-200 text-gray-400':   !get(['satisfaction']),
                }"
              >
                <template v-if="get(['satisfaction']) === 3">
                  <svg class="w-14 h-14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke-width="1.5"/>
                    <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
                    <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
                    <path d="M8 14.5c1.5 2 4.5 2 6 0" stroke-linecap="round" stroke-width="1.5"/>
                  </svg>
                </template>
                <template v-else-if="get(['satisfaction']) === 2">
                  <svg class="w-14 h-14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke-width="1.5"/>
                    <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
                    <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
                    <line x1="8" y1="15" x2="16" y2="15" stroke-linecap="round" stroke-width="1.5"/>
                  </svg>
                </template>
                <template v-else-if="get(['satisfaction']) === 1">
                  <svg class="w-14 h-14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke-width="1.5"/>
                    <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
                    <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
                    <path d="M8 16c1.5-2 4.5-2 6 0" stroke-linecap="round" stroke-width="1.5"/>
                  </svg>
                </template>
                <template v-else>
                  <svg class="w-14 h-14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke-width="1.5"/>
                    <line x1="8" y1="12" x2="16" y2="12" stroke-linecap="round" stroke-width="1.5"/>
                  </svg>
                </template>
              </div>

              <div>
                <p class="text-[15px] font-medium text-gray-400 mb-1">Notes</p>
                <p class="text-[15px] font-medium text-gray-800">
                  {{ get(['notes','feedback']) ?? '-' }}
                </p>
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