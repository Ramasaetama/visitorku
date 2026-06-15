<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import patternBg from '@/assets/Frame 7.svg'; 
import DataTable from '@/components/common/DataTable.vue';

// Import fungsi API 
import { getDashboardCounters, getWeeklyData, getMonthlyData, getCategoryData, getLatestVisitors, getVisit } from '@/services/dashboardService';

const { t } = useI18n();

const counters = ref({
  visitor_total: 0,
  visit_total: 0,
  user_total: 0,
});

const fetchCounters = async () => {
  try {
    const response = await getDashboardCounters();
    const dataAPI = response.data.data; 
    counters.value = {
      visitor_total: dataAPI.visitor_total,
      visit_total: dataAPI.visit_total,
      user_total: dataAPI.user_total,
    };
  } catch (error) {
    console.error("Gagal memuat data counter:", error);
  }
};

// --- CHART DATA & CONFIGS ---
const chartData = ref({ titles: [], visits: [], visitors: [] });
const isChartLoading = ref(true);

const chartOptions = ref({
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Poppins, sans-serif', selection: { enabled: false } },
  colors: ['#2D51FD', '#ED9D0F'], 
  plotOptions: { bar: { horizontal: false, columnWidth: '55%', endingShape: 'rounded', borderRadius: 4 } },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 2, colors: ['transparent'] },
  xaxis: { categories: [], labels: { style: { colors: '#64748B', fontSize: '12px' } }, axisBorder: { show: true, color: '#E2E8F0' }, axisTicks: { show: true, color: '#E2E8F0' } },
  yaxis: { min: 0, max: 2, tickAmount: 5, labels: { formatter: (value) => value.toFixed(1), style: { colors: '#64748B', fontSize: '12px' } } },
  grid: { show: true, borderColor: '#E2E8F0', strokeDashArray: 0, xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
  fill: { opacity: 1 }, 
  tooltip: { enabled: false },
  states: { normal: { filter: { type: 'none', value: 0 } }, hover: { filter: { type: 'none', value: 0 } }, active: { allowMultipleDataPointsSelection: false, filter: { type: 'none', value: 0 } } },
  legend: { show: false },
});

const chartSeries = ref([
  { name: t('dashboard.legend.visitor'), data: [] }, 
  { name: t('dashboard.legend.visit'), data: [] }
]);

const fetchWeeklyData = async () => {
  isChartLoading.value = true;
  try {
    const response = await getWeeklyData();
    const dataAPI = response.data.data;
    chartData.value = { titles: dataAPI.titles, visits: dataAPI.visits, visitors: dataAPI.visitors };
    chartOptions.value = { ...chartOptions.value, xaxis: { ...chartOptions.value.xaxis, categories: dataAPI.titles } };
    chartSeries.value = [ { name: t('dashboard.legend.visitor'), data: dataAPI.visitors }, { name: t('dashboard.legend.visit'), data: dataAPI.visits } ];
  } catch (error) {
    console.error("Gagal memuat data mingguan:", error);
  } finally {
    isChartLoading.value = false;
  }
};

const isMonthlyChartLoading = ref(true);
const monthlyChartOptions = ref({
  chart: { type: 'line', toolbar: { show: false }, fontFamily: 'Poppins, sans-serif', selection: { enabled: false }, zoom: { enabled: false }, dropShadow: { enabled: true, top: 5, left: 0, blur: 5, opacity: 0.2 } },
  colors: ['#2D51FD', '#ED9D0F'], 
  stroke: { curve: 'smooth', width: 3 },
  dataLabels: { enabled: true, background: { enabled: true, foreColor: '#fff', padding: 4, borderRadius: 2, borderWidth: 0 }, offsetY: -2 },
  markers: { size: 0, hover: { sizeOffset: 4 } },
  xaxis: { categories: [], title: { text: 'Month', offsetY: 5, style: { color: '#111827', fontSize: '12px', fontWeight: 'bold' } }, labels: { style: { colors: '#64748B', fontSize: '11px' } }, axisBorder: { show: true, color: '#E2E8F0' }, axisTicks: { show: true, color: '#E2E8F0' }, tooltip: { enabled: true }, crosshairs: { show: true, stroke: { color: '#b6b6b6', width: 1, dashArray: 3 } } },
  yaxis: { min: 0, max: 8, tickAmount: 4, labels: { formatter: (value) => Math.round(value), style: { colors: '#64748B', fontSize: '12px' } } },
  grid: { show: true, borderColor: '#E2E8F0', xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
  tooltip: { enabled: true, shared: true, intersect: false }, 
  states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
  legend: { show: false }, 
});

const monthlyChartSeries = ref([ { name: t('dashboard.legend.visitor'), data: [] }, { name: t('dashboard.legend.visit'), data: [] } ]);

const fetchMonthlyData = async () => {
  isMonthlyChartLoading.value = true;
  try {
    const response = await getMonthlyData();
    const dataAPI = response.data.data;
    monthlyChartOptions.value = { ...monthlyChartOptions.value, xaxis: { ...monthlyChartOptions.value.xaxis, categories: dataAPI.titles } };
    monthlyChartSeries.value = [ { name: t('dashboard.legend.visitor'), data: dataAPI.visitors }, { name: t('dashboard.legend.visit'), data: dataAPI.visits } ];
  } catch (error) {
    console.error("Gagal memuat data monthly:", error);
  } finally {
    isMonthlyChartLoading.value = false;
  }
};

const isCategoryLoading = ref(true);
const categoryChartOptions = ref({
  chart: { type: 'donut', fontFamily: 'Poppins, sans-serif' },
  colors: ['#FF4560', '#008FFB', '#775DD0', '#F7941D', '#00E396'],
  labels: [], 
  legend: { position: 'right', fontSize: '12px', markers: { radius: 2 } },
  plotOptions: { pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label: 'Total', fontSize: '14px', fontWeight: 600, color: '#64748B', formatter: function (w) { return w.globals.seriesTotals.reduce((a, b) => a + b, 0) } } } } } },
  dataLabels: { enabled: true, formatter: function (val) { return val.toFixed(1) + "%" } },
  tooltip: { enabled: true },
  states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } }
});

const categorySeries = ref([]); 

const fetchCategoryData = async () => {
  isCategoryLoading.value = true;
  try {
    const response = await getCategoryData();
    const dataAPI = response.data.data;
    categoryChartOptions.value = { ...categoryChartOptions.value, labels: dataAPI.titles };
    categorySeries.value = dataAPI.values;
  } catch (error) {
    console.error("Gagal memuat data kategori:", error);
  } finally {
    isCategoryLoading.value = false;
  }
};

// --- LATEST VISITOR LOGIC & SORTING ---
const latestVisitors = ref([]);
const isLoadingLatest = ref(true);
const sortOrder = ref('desc');
const sortKeyLatest = ref('datetime');

const latestVisitorColumns = computed(() => [
  { key: 'name', label: t('dashboard.table.name'), sortable: false },
  { key: 'purpose', label: t('dashboard.table.purpose'), sortable: false },
  { key: 'datetime', label: t('dashboard.table.checkIn'), sortable: true },
  { key: 'checkout', label: t('dashboard.table.checkOut'), sortable: false },
  { key: 'face', label: t('dashboard.table.face'), sortable: false },
]);

const fetchLatestVisitors = async () => {
  isLoadingLatest.value = true;
  try {
    const response = await getLatestVisitors();
    let data = response.data.data || [];
    data.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
    latestVisitors.value = data;
  } catch (error) {
    console.error("Gagal memuat Latest Visitor:", error);
  } finally {
    isLoadingLatest.value = false;
  }
};

const handleSortLatest = (columnKey) => {
  if (columnKey !== 'datetime') return; 
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
  latestVisitors.value.sort((a, b) => {
    const dateA = new Date(a.datetime).getTime();
    const dateB = new Date(b.datetime).getTime();
    return sortOrder.value === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

const formatDate = (isoString) => {
  if (!isoString) return '-';
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// --- SATISFACTION INDEX LOGIC ---
const satisfactionStats = ref({ bad: 0, neutral: 0, good: 0 });
const isSatisfactionLoading = ref(true);

const fetchSatisfactionData = async () => {
  isSatisfactionLoading.value = true;
  try {
    const response = await getVisit();
    const visits = response.data.data || [];
    
    let count1 = 0; // Bad
    let count2 = 0; // Neutral
    let count3 = 0; // Good
    let totalValid = 0;

    visits.forEach(v => {
      if (v.satisfaction === 1) { count1++; totalValid++; }
      if (v.satisfaction === 2) { count2++; totalValid++; }
      if (v.satisfaction === 3) { count3++; totalValid++; }
    });

    if (totalValid > 0) {
      satisfactionStats.value = {
        bad: Math.round((count1 / totalValid) * 100),
        neutral: Math.round((count2 / totalValid) * 100),
        good: Math.round((count3 / totalValid) * 100)
      };
    } else {
      satisfactionStats.value = { bad: 0, neutral: 0, good: 0 };
    }
  } catch (error) {
    console.error("Gagal memuat data satisfaction:", error);
  } finally {
    isSatisfactionLoading.value = false;
  }
};

onMounted(() => {
  fetchCounters();   
  fetchWeeklyData(); 
  fetchMonthlyData();
  fetchCategoryData();
  fetchLatestVisitors();
  fetchSatisfactionData();
});
</script>

<template>
  <main class="bg-white rounded-lg h-full min-h-[calc(100vh-7rem)] flex flex-col relative w-full">
    <div class="flex flex-col gap-6">

      <div class="bg-white rounded-md border border-gray-100 p-6">
        <h1 class="text-2xl font-semibold text-gray-800 mb-6">{{ t('dashboard.title') }}</h1>
        <div
          class="grid grid-cols-1 sm:grid-cols-3 gap-6 overflow-visible min-h-[80px]"
          style="transform: translateZ(0); will-change: transform;"
        >
          <div class="bg-white rounded-sm p-5 flex items-center gap-4 border border-gray-200 shadow-xs">
            <div class="w-12 h-12 rounded-full bg-[#FEF4E3] flex items-center justify-center shrink-0">
              <svg class="w-6 h-6 text-[#F7941D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></rect>
                <circle cx="12" cy="10" r="2.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></circle>
                <path d="M8 17a4 4 0 0 1 8 0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            </div>
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-xl font-bold text-gray-900 leading-none shrink-0">{{ counters.visitor_total }}</span>
              <span class="text-[14px] text-gray-600 font-medium whitespace-nowrap">{{ t('dashboard.totalVisitor') }}</span>
            </div>
          </div>

          <div class="bg-white rounded-sm p-5 flex items-center gap-4 border border-gray-200 shadow-xs">
            <div class="w-12 h-12 rounded-full bg-[#FEF4E3] flex items-center justify-center shrink-0">
              <svg class="w-6 h-6 text-[#F7941D]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
                <path d="M11 16l4-4-4-4" />
                <path d="M3 12h12" />
              </svg>
            </div>
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-xl font-bold text-gray-900 leading-none shrink-0">{{ counters.visit_total }}</span>
              <span class="text-[14px] text-gray-600 font-medium whitespace-nowrap">{{ t('dashboard.totalVisit') }}</span>
            </div>
          </div>

          <div class="bg-white rounded-sm p-5 flex items-center gap-4 border border-gray-200 shadow-xs">
            <div class="w-12 h-12 rounded-full bg-[#FEF4E3] flex items-center justify-center shrink-0">
              <svg class="w-6 h-6 text-[#F7941D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-xl font-bold text-gray-900 leading-none shrink-0">{{ counters.user_total }}</span>
              <span class="text-[14px] text-gray-600 font-medium whitespace-nowrap">{{ t('dashboard.totalUser') }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-sm border border-gray-100 p-6">
        <h2 class="text-[15px] font-bold text-gray-800 mb-4">{{ t('dashboard.satisfactionIndex') }}</h2>
        
        <div v-if="isSatisfactionLoading" class="w-full h-10 bg-gray-100 rounded-sm animate-pulse flex items-center justify-center">
          <span class="text-xs text-gray-400">{{ t('dashboard.calculating') }}</span>
        </div>

        <div v-else class="w-full h-10 rounded-sm overflow-hidden flex font-medium text-white text-sm">
          
          <div v-if="satisfactionStats.bad > 0" :style="{ width: satisfactionStats.bad + '%' }" class="bg-[#EF4444] h-full flex items-center justify-between px-3 transition-all duration-500">
            <svg class="w-5 h-5 opacity-90" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke-width="2.5"/>
              <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
              <path d="M8 16c1.5-2 4.5-2 6 0" stroke-linecap="round"/>
            </svg>
            <span v-if="satisfactionStats.bad > 5">{{ satisfactionStats.bad }}%</span>
          </div>

          <div v-if="satisfactionStats.neutral > 0" :style="{ width: satisfactionStats.neutral + '%' }" class="bg-[#F59E0B] h-full flex items-center justify-between px-3 transition-all duration-500">
            <svg class="w-5 h-5 opacity-90" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke-width="2.5"/>
              <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
              <line x1="8" y1="15" x2="16" y2="15" stroke-linecap="round"/>
            </svg>
            <span v-if="satisfactionStats.neutral > 5">{{ satisfactionStats.neutral }}%</span>
          </div>

          <div v-if="satisfactionStats.good > 0" :style="{ width: satisfactionStats.good + '%' }" class="bg-[#10B981] h-full flex items-center justify-between px-3 transition-all duration-500">
            <span v-if="satisfactionStats.good > 5">{{ satisfactionStats.good }}%</span>
            <svg class="w-5 h-5 opacity-90" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke-width="2.5"/>
              <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/>
              <path d="M8 14.5c1.5 2 4.5 2 6 0" stroke-linecap="round"/>
            </svg>
          </div>

            <div v-if="satisfactionStats.bad === 0 && satisfactionStats.neutral === 0 && satisfactionStats.good === 0" class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
            {{ t('dashboard.noData') }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-sm border border-gray-100 p-6 flex flex-col h-[400px]">
          <div class="flex items-start sm:items-center justify-between mb-6 shrink-0">
            <h2 class="text-[15px] font-bold text-gray-800">{{ t('dashboard.dailyVisitor') }}</h2>
            <div class="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 text-xs font-medium text-gray-600">
              <div class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-[2px] bg-[#2D51FD]"></span> {{ t('dashboard.legend.visitor') }}
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-[2px] bg-[#ED9D0F]"></span> {{ t('dashboard.legend.visit') }}
              </div>
            </div>
          </div>

          <div class="flex-1 flex flex-col relative min-h-0">
            <div v-if="isChartLoading" class="absolute inset-0 flex items-center justify-center text-gray-400">{{ t('dashboard.loadingChart') }}</div>
            <apexchart v-show="!isChartLoading" class="w-full h-full" type="bar" height="100%" width="100%" :options="chartOptions" :series="chartSeries" />
          </div>
        </div>

        <div class="bg-white rounded-sm shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
          <h2 class="text-[15px] font-bold text-gray-800 mb-4 shrink-0">{{ t('dashboard.percentageByPurpose') }}</h2>
          <div class="flex-1 flex flex-col relative min-h-0">
            <div v-if="isCategoryLoading" class="absolute inset-0 flex items-center justify-center text-gray-400">{{ t('dashboard.loadingCategory') }}</div>
            <apexchart v-show="!isCategoryLoading" class="w-full h-full" type="donut" height="100%" width="100%" :options="categoryChartOptions" :series="categorySeries" />
          </div>
        </div>
      </div>

      <div class="bg-white border border-gray-100 p-6 min-h-[350px] flex flex-col">
        <div class="flex items-start sm:items-center justify-between mb-6 shrink-0">
          <h2 class="text-[15px] font-bold text-gray-800">{{ t('dashboard.monthlyVisitor') }}</h2>
          <div class="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 text-xs font-medium text-gray-600">
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-[#2D51FD]"></span> {{ t('dashboard.legend.visitor') }}</div>
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-[#ED9D0F]"></span> {{ t('dashboard.legend.visit') }}</div>
          </div>
        </div>

        <div class="flex-1 flex flex-col relative min-h-0">
          <div v-if="isMonthlyChartLoading" class="absolute inset-0 flex items-center justify-center text-gray-400">{{ t('dashboard.loadingMonthlyChart') }}</div>
          <apexchart v-show="!isMonthlyChartLoading" class="w-full h-full" type="line" height="100%" width="100%" :options="monthlyChartOptions" :series="monthlyChartSeries" />
        </div>
      </div>

      <div class="bg-white rounded-sm shadow-sm border border-gray-100 p-6">
        <h2 class="text-[15px] font-bold text-gray-800 mb-4 shrink-0">{{ t('dashboard.latestVisitor') }}</h2>
        <div class="w-full overflow-x-auto hide-scrollbar">
          
          <DataTable
            :columns="latestVisitorColumns"
            :data="latestVisitors"
            :loading="isLoadingLatest"
            :sort-key="sortKeyLatest"
            :sort-order="sortOrder"
            @sort="handleSortLatest"
          >
            <template #name="{ row }">
              <div class="flex items-center gap-3.5">
                <img v-if="row.picture_url" :src="row.picture_url" alt="" class="w-7 h-7 rounded-sm object-cover border border-gray-100 shrink-0" />
                <div v-else class="w-9 h-9 rounded-sm bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-bold shrink-0 border border-gray-200">
                  {{ row.name ? row.name.charAt(0).toUpperCase() : '?' }}
                </div>
                <span class="text-[13px] text-gray-800">{{ row.name }}</span>
              </div>
            </template>

            <template #purpose="{ row }">
              <span class="text-[13px] text-gray-800">{{ row.purpose || '-' }}</span>
            </template>

            <template #datetime="{ row }">
              <span class="text-[13px] text-gray-800">{{ formatDate(row.datetime) }}</span>
            </template>

            <template #checkout="{ row }">
              <span class="text-[13px] text-gray-800">{{ row.logout_data ? formatDate(row.logout_data.datetime) : '-' }}</span>
            </template>

            <template #face="{ row }">
              <div class="flex justify-center">
                <template v-if="row.satisfaction === 3">
                  <svg class="w-6.5 h-6.5 text-[#10B981]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/><circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/><path d="M8 14.5c1.5 2 4.5 2 6 0" stroke-linecap="round"/></svg>
                </template>
                <template v-else-if="row.satisfaction === 2">
                  <svg class="w-6.5 h-6.5 text-[#F59E0B]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/><circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/><line x1="8" y1="15" x2="16" y2="15" stroke-linecap="round"/></svg>
                </template>
                <template v-else-if="row.satisfaction === 1">
                  <svg class="w-6.5 h-6.5 text-[#EF4444]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/><circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/><path d="M8 16c1.5-2 4.5-2 6 0" stroke-linecap="round"/></svg>
                </template>
                <span v-else class="text-gray-400 font-bold">-</span>
              </div>
            </template>

            <template #empty>
              <div class="py-12 text-center text-gray-400 text-[14px]">
                {{ t('dashboard.noLatestData') }}
              </div>
            </template>
          </DataTable>

        </div>
      </div>

    </div>
  </main>
</template>

<style scoped>
.apexcharts-canvas:focus,
.apexcharts-canvas svg:focus,
.vue-apexcharts:focus,
.vue-apexcharts {
  outline: none !important;
  box-shadow: none !important;
}

button:focus, select:focus {
  outline: none !important;
  box-shadow: none !important;
}

.hide-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.hide-scrollbar::-webkit-scrollbar-track {
  background: transparent; 
}
.hide-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0; 
  border-radius: 10px;
}
.hide-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1; 
}
</style>