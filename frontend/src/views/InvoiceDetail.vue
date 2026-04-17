<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Topbar from '@/components/Topbar.vue';
import Sidebar from '@/components/Sidebar.vue';
import { getInvoiceById } from '@/services/invoiceService';

const route = useRoute();
const router = useRouter();

const invoiceId = ref('');
const invoiceUrl = ref('');
const isLoading = ref(true);

const fetchDetail = async () => {
  isLoading.value = true;
  try {
    const response = await getInvoiceById(invoiceId.value);
    
    // Mengambil data dari response (sesuai struktur JSON Swagger backend)
    const resData = response.data?.data || response.data;
    
    // Simpan link PDF ke state
    invoiceUrl.value = resData.invoice_url;
  } catch (error) {
    console.error('Gagal mengambil data detail invoice:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  invoiceId.value = route.params.id;
  if (invoiceId.value) {
    fetchDetail();
  }
});

const goBack = () => {
  router.push('/invoice');
};
</script>

<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    <Topbar />

    <div class="flex flex-1 items-stretch">
      <Sidebar />

      <main class="flex-1 bg-[#F4F6F8] p-4">
        <div class="bg-white rounded-2xl shadow-sm h-full flex flex-col p-6">
          
          <div class="flex items-center justify-between mb-6 border-b pb-4">
            <div class="flex items-center gap-4">
              <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 class="text-xl font-semibold text-gray-800">Invoice Detail</h1>
            </div>

            <a 
              v-if="invoiceUrl" 
              :href="invoiceUrl" 
              target="_blank" 
              class="flex items-center gap-2 px-4 py-2 bg-[#F7941D] text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Download PDF
            </a>
          </div>

          <div class="flex-1 flex flex-col">
            <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 text-gray-400">
              <svg class="animate-spin w-8 h-8 mb-4 text-[#F7941D]" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p>Memuat dokumen invoice...</p>
            </div>

          <div v-else-if="invoiceUrl" class="w-full h-[700px] border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <iframe 
                :src="`https://docs.google.com/viewer?url=${invoiceUrl}&embedded=true`" 
                width="100%" 
                height="100%"
                class="w-full h-full border-none"
                title="Invoice Preview"
              ></iframe>
            </div>
            
            <div v-else class="flex flex-col items-center justify-center py-20 text-gray-400">
              <svg class="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p class="text-sm font-medium text-gray-500">Dokumen PDF belum tersedia untuk invoice ini.</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>