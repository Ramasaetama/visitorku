<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import Topbar from '@/components/Topbar.vue';
import Sidebar from '@/components/Sidebar.vue';
import DataTable from '@/components/common/DataTable.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import { getAllInvoices, confirmInvoice } from '@/services/invoiceService';

// ─── State ───────────────────────────────────────────────────────────────────
const invoiceData   = ref([]);
const isLoading     = ref(false);
const searchQuery   = ref('');
const appliedSearch = ref('');
const perPage       = ref(10);
const currentPage   = ref(1);
const totalRecords  = ref(0);

// ─── Kolom Tabel ─────────────────────────────────────────────────────────────
const tableColumns = [
  { key: 'receipt',  label: 'RECEIPT',     sortable: false },
  { key: 'number',   label: 'NUMBER',      sortable: false },
  { key: 'package',  label: 'PACKAGE',     sortable: false },
  { key: 'amount',   label: 'AMOUNT (RP)', sortable: false },
  { key: 'due_date', label: 'DUE DATE',    sortable: false },
  { key: 'status',   label: 'STATUS',      sortable: false },
  { key: 'action',   label: 'ACTION',      sortable: false },
];

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
      receipt:  v.receipt_number ?? v.receipt ?? '-',
      number:   v.invoice_number ?? v.number  ?? '-',
      package:  v.package_name   ?? v.package ?? '-',
      amount:   formatCurrency(v.amount ?? v.total ?? 0),
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
  if (!val) return '-';
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
  try {
    await confirmInvoice({ id: row.id });
    await fetchInvoices();
  } catch (err) {
    console.error('Gagal konfirmasi invoice:', err);
  }
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalRecords.value / perPage.value))
);

const showingFrom = computed(() => {
  if (totalRecords.value === 0) return 0;
  return (currentPage.value - 1) * perPage.value + 1;
});

const showingTo = computed(() =>
  Math.min(currentPage.value * perPage.value, totalRecords.value)
);

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchInvoices();
};

// ─── Search ───────────────────────────────────────────────────────────────────
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
  currentPage.value = 1;
  fetchInvoices();
});

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(fetchInvoices);
</script>

<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    <Topbar />

    <div class="flex flex-1 items-stretch">
      <Sidebar />

      <main class="flex-1 bg-[#F4F6F8] p-4">
        <div class="bg-white rounded-2xl shadow-sm h-full flex flex-col">
          <div class="p-6 flex-1 flex flex-col">

            <!-- ── Header ── -->
            <div class="flex items-center justify-between mb-4">
              <!-- Judul -->
              <h1 class="text-xl font-semibold text-gray-800">Invoice</h1>

              <!-- Breadcrumb -->
              <nav class="flex items-center gap-1.5 text-sm text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                <span>Dashboard</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
                <span class="text-[#F7941D] font-medium">Invoice</span>
              </nav>
            </div>

            <!-- ── Toolbar: Search + Per-Page ── -->
            <div class="flex items-center gap-3 mb-4">
              <!-- Search -->
              <SearchInput
                v-model="searchQuery"
                placeholder="Search"
                class="w-80"
                input-class="rounded-sm"
                @keyup.enter="executeSearch"
              />

              <!-- Per-page selector -->
              <select
                v-model="perPage"
                class="h-9 px-3 border border-gray-300 rounded text-sm text-gray-600
                       bg-white focus:outline-none focus:ring-2 focus:ring-[#F7941D]/30
                       focus:border-[#F7941D] cursor-pointer"
              >
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>

            <!-- ── DataTable ── -->
            <div class="flex-1 overflow-hidden">
              <DataTable
                :columns="tableColumns"
                :data="invoiceData"
                :loading="isLoading"
              >
                <!-- Custom body slot -->
                <template #body="{ data }">
                  <tr
                    v-for="(row, idx) in data"
                    :key="row.id ?? idx"
                    class="hover:bg-orange-50/40 transition-colors"
                  >
                    <!-- RECEIPT -->
                    <td class="px-4 py-3 text-sm text-gray-700 border-b border-[#EDEDED] font-medium">
                      {{ row.receipt }}
                    </td>
                    <!-- NUMBER -->
                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-[#EDEDED]">
                      {{ row.number }}
                    </td>
                    <!-- PACKAGE -->
                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-[#EDEDED]">
                      {{ row.package }}
                    </td>
                    <!-- AMOUNT -->
                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-[#EDEDED]">
                      {{ row.amount }}
                    </td>
                    <!-- DUE DATE -->
                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-[#EDEDED]">
                      {{ row.due_date }}
                    </td>
                    <!-- STATUS -->
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
                    <!-- ACTION -->
                    <td class="px-4 py-3 text-sm border-b border-[#EDEDED]">
                      <button
                        @click="handleConfirm(row)"
                        title="Konfirmasi Invoice"
                        class="w-8 h-8 flex items-center justify-center rounded-full
                               bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
                                   -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                </template>

                <!-- Empty State -->
                <template #empty>
                  <div class="flex flex-col items-center justify-center py-16 text-gray-400">
                    <svg class="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <p class="text-sm font-medium text-gray-500">No Records to display</p>
                  </div>
                </template>
              </DataTable>
            </div>

          </div><!-- /p-6 -->

          <!-- ── Pagination Footer ── -->
          <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <!-- Info -->
            <span>
              Showing {{ showingFrom }} to {{ showingTo }} from {{ totalRecords }} records
            </span>

            <!-- Prev / Next -->
            <div class="flex items-center gap-1">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg
                       text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                       transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage >= totalPages"
                class="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg
                       text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                       transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>

        </div><!-- /bg-white card -->
      </main>
    </div>
  </div>
</template>
