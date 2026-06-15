<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import DataTable from '@/components/common/DataTable.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import Pagination from '@/components/common/Pagination.vue'; 
import { useRouter } from 'vue-router';
import { getAllInvoices, confirmInvoice } from '@/services/InvoiceService';

const { t } = useI18n();

// ─── State ───────────────────────────────────────────────────────────────────
const invoiceData   = ref([]);
const isLoading     = ref(false);
const searchQuery   = ref('');
const appliedSearch = ref('');
const perPage       = ref(10);
const currentPage   = ref(1);
const totalRecords  = ref(0);
const router        = useRouter();

// 🌟 State untuk Modal Receipt
const isReceiptModalOpen = ref(false);
const selectedReceiptUrl = ref('');

// ─── Dropdown State dengan Posisi Dinamis ────────────────────────────────────
const activeDropdown = ref(null);
const dropdownPosition = ref({ top: '0px', left: '0px' });

const toggleDropdown = async (id, event) => {
  if (activeDropdown.value === id) {
    activeDropdown.value = null;
  } else {
    activeDropdown.value = id;
    
    // Tunggu DOM update, lalu hitung posisi tombol yang diklik
    await nextTick();
    const buttonRect = event.currentTarget.getBoundingClientRect();
    
    // 144px adalah lebar dropdown (w-36)
    dropdownPosition.value = {
      top: `${buttonRect.bottom + window.scrollY + 5}px`,
      left: `${buttonRect.left + window.scrollX }px` 
    };
  }
};

const closeDropdown = () => {
  activeDropdown.value = null;
};

// ─── Kolom Tabel ─────────────────────────────────────────────────────────────
const tableColumns = computed(() => [
  { key: 'evidence_url', label: t('invoice.table.receipt'),  sortable: false },
  { key: 'number',       label: t('invoice.table.number'),   sortable: false },
  { key: 'price',        label: t('invoice.table.package'),  sortable: false },
  { key: 'payment_total',label: t('invoice.table.amount'),   sortable: false },
  { key: 'due_date',     label: t('invoice.table.dueDate'),  sortable: false },
  { key: 'status',       label: t('invoice.table.status'),   sortable: false },
  { key: 'action',       label: t('invoice.table.action'),   sortable: false },
]);

const goToDetail = (row) => {
  closeDropdown();
  router.push(`/master/invoice/detail/${row.id}`);
};

// 🌟 Fungsi Buka/Tutup Modal Receipt
const openReceiptModal = (url) => {
  selectedReceiptUrl.value = url;
  isReceiptModalOpen.value = true;
};

const closeReceiptModal = () => {
  isReceiptModalOpen.value = false;
  setTimeout(() => {
    selectedReceiptUrl.value = '';
  }, 200); 
};

// ─── Fetch Data ───────────────────────────────────────────────────────────────
const fetchInvoices = async () => {
  isLoading.value = true;
  try {
    const params = {
      page:   currentPage.value,
      size:   perPage.value,
      search: appliedSearch.value || undefined,
    };
    const response = await getAllInvoices(params);
    const res = response.data || response;

    const items = Array.isArray(res) ? res : (res.data || res.items || []);
    totalRecords.value = res.total ?? res.totalData ?? res.total_data ?? items.length;

    invoiceData.value = items.map(v => ({
      id:       v.id,
      evidence_url:  v.evidence_url_number ?? v.evidence_url ?? '-',
      number:   v.invoice_number ?? v.number  ?? '-',
      price:  v.price_name   ?? v.price ?? '-',
      payment_total:   formatCurrency(v.payment_total ?? v.total ?? 0),
      due_date: formatDate(v.due_date ?? v.dueDate ?? null),
      status:   v.status ?? '-',
      billing:  v.billing_type ?? v.billing ?? '-',
      raw:      v,
    }));
  } catch (err) {
    console.error('Gagal memuat data invoice:', err);
    invoiceData.value = [];
    totalRecords.value = 0;
  } finally {
    isLoading.value = false;
  }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (val) => {
  if (!val) return 'Invalid Date';
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .replace(/\//g, '-');
};

const formatCurrency = (val) => {
  if (val == null || val === '') return '0';
  return Number(val).toLocaleString('id-ID');
};

// ─── Confirm Invoice ──────────────────────────────────────────────────────────
const handleConfirm = async (row) => {
  closeDropdown();
  try {
    await confirmInvoice({ id: row.id });
    await fetchInvoices();
  } catch (err) {
    console.error('Gagal konfirmasi invoice:', err);
  }
};

// ─── Search & Watchers ────────────────────────────────────────────────────────
const executeSearch = () => {
  appliedSearch.value = searchQuery.value;
  currentPage.value = 1;
  fetchInvoices();
};

watch(searchQuery, (val) => {
  if (val === '') {
    appliedSearch.value = '';
    currentPage.value   = 1;
    fetchInvoices();
  }
});

watch(perPage, () => {
  if(currentPage.value !== 1) {
    currentPage.value = 1;
  } else {
    fetchInvoices();
  }
});

watch(currentPage, () => {
  fetchInvoices();
});

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(() => {
  fetchInvoices();
  window.addEventListener('scroll', closeDropdown, true);
});

onUnmounted(() => {
  window.removeEventListener('scroll', closeDropdown, true);
});
</script>

<template>
  <div class="flex-1 w-full h-full flex flex-col">
  <div class="bg-white rounded-2xl shadow-sm h-full min-h-[calc(100vh-7rem)] flex flex-col relative w-full">
    <div class="p-6 flex-1 flex flex-col">

      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 mb-1">{{ t('invoice.title') }}</h1>
          <p class="text-sm text-gray-500">{{ t('invoice.subtitle') }}</p>
        </div>                
      </div>

      <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-start gap-4">
        <div class="w-full sm:max-w-md">
          <SearchInput 
            v-model="searchQuery" 
            v-model:perPage="perPage"
            :placeholder="t('invoice.searchPlaceholder')" 
            @keyup.enter="executeSearch"  
          />
        </div>
      </div>

      <div class="flex-1 overflow-hidden">
        <DataTable
          :columns="tableColumns"
          :data="invoiceData"
          :loading="isLoading"
        >
          <template #body="{ data }">
            <tr
              v-for="(row, idx) in data"
              :key="row.id ?? idx"
              class="hover:bg-orange-50/40 transition-colors"
            >
              <td class="px-4 py-3 text-sm text-gray-600 border-b border-[#EDEDED]">
                <template v-if="row.evidence_url && row.evidence_url !== '-'">
                  <button 
                    @click="openReceiptModal(row.evidence_url)"
                    :title="t('invoice.receiptModal.viewTooltip')"
                    class="inline-block hover:opacity-80 transition-opacity focus:outline-none"
                  >
                    <img 
                      :src="row.evidence_url" 
                      alt="Receipt Thumbnail" 
                      class="w-8 h-8 object-cover rounded shadow-sm border border-gray-200"
                    />
                  </button>
                </template>
                
                <template v-else>
                  {{ row.evidence_url }}
                </template>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 border-b border-[#EDEDED]">
                {{ row.number }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 border-b border-[#EDEDED]">
                {{ row.price }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 border-b border-[#EDEDED]">
                {{ row.payment_total }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 border-b border-[#EDEDED]">
                {{ row.due_date }}
              </td>
              <td class="px-4 py-3 text-sm border-b border-[#EDEDED]">
                <div class="flex items-center gap-1.5">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="row.status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : row.status === 'unpaid'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-500'"
                  >
                    {{ row.status }}
                  </span>
                  <span
                    v-if="row.billing && row.billing !== '-'"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-600"
                  >
                    {{ row.billing }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-sm border-b border-[#EDEDED]">
                
                <div class="flex items-center gap-2 relative">
                  <button 
                    @click.stop="toggleDropdown(row.id, $event)"
                    class="w-[30px] h-[30px] rounded border border-[#F7941D] flex items-center justify-center text-[#F7941D] hover:bg-[#FEF4E3] transition-colors focus:outline-none"
                    title="Opsi"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>

                  <Teleport to="body">
                    <div v-if="activeDropdown === row.id" @click="closeDropdown" class="fixed inset-0 z-[9998]"></div>
                    
                    <div 
                      v-if="activeDropdown === row.id" 
                      class="fixed w-36 bg-white rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 py-1.5 z-[9999]"
                      :style="{ top: dropdownPosition.top, left: dropdownPosition.left }"
                    >
                      <button 
                        @click="goToDetail(row)" 
                        class="w-full text-left px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-[#D9E2FF] hover:text-[#4075FF] focus:outline-none transition-colors"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </Teleport>
                </div>

              </td>
            </tr>
          </template>

          <template #empty>
            <div class="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg class="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <p class="text-sm font-medium text-gray-500">{{ t('invoice.noRecords') }}</p>
            </div>
          </template>
        </DataTable>
      </div>

    </div>
    
    <Pagination
      v-model:current-page="currentPage"
      :total-data="totalRecords"
      :per-page="perPage"
    />

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="isReceiptModalOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeReceiptModal"></div>

          <div class="relative bg-white rounded-sm shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden z-10 hover:shadow-lg transition-shadow duration-300">
            
            <div class="flex items-center justify-between px-6 pt-6 pb-2">
              <h3 class="text-lg font-bold text-gray-800">{{ t('invoice.receiptModal.title') }}</h3>
              <button @click="closeReceiptModal" class="text-gray-400 hover:text-gray-800 transition-colors focus:outline-none p-1 rounded-full hover:bg-gray-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div class="p-6 flex justify-center bg-white">
              <img 
                :src="selectedReceiptUrl" 
                alt="Receipt Full Preview" 
                class="max-w-full max-h-[70vh] object-contain rounded shadow-sm border border-gray-100" 
              />
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
  </div>
</template>