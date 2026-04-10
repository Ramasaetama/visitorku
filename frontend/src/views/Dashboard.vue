<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Topbar from '@/components/Topbar.vue';
import patternBg from '@/assets/Frame 7.svg'; 

// Import fungsi API 
import { getDashboardCounters, getWeeklyData, getMonthlyData, getCategoryData, getLatestVisitors, getVisit } from '@/services/dashboardService';

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
  { name: 'Visitor', data: [] }, 
  { name: 'Visit', data: [] }
]);

const fetchWeeklyData = async () => {
  isChartLoading.value = true;
  try {
    const response = await getWeeklyData();
    const dataAPI = response.data.data;
    chartData.value = { titles: dataAPI.titles, visits: dataAPI.visits, visitors: dataAPI.visitors };
    chartOptions.value = { ...chartOptions.value, xaxis: { ...chartOptions.value.xaxis, categories: dataAPI.titles } };
    chartSeries.value = [ { name: 'Visitor', data: dataAPI.visitors }, { name: 'Visit', data: dataAPI.visits } ];
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

const monthlyChartSeries = ref([ { name: 'Visitor', data: [] }, { name: 'Visit', data: [] } ]);

const fetchMonthlyData = async () => {
  isMonthlyChartLoading.value = true;
  try {
    const response = await getMonthlyData();
    const dataAPI = response.data.data;
    monthlyChartOptions.value = { ...monthlyChartOptions.value, xaxis: { ...monthlyChartOptions.value.xaxis, categories: dataAPI.titles } };
    monthlyChartSeries.value = [ { name: 'Visitor', data: dataAPI.visitors }, { name: 'Visit', data: dataAPI.visits } ];
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

const toggleSort = () => {
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
      // Default jika kosong
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
  fetchSatisfactionData(); // Fetch perhitungan satisfaction
});
</script>

<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    <Topbar />

    <div class="flex flex-1 items-stretch">
      <Sidebar />
      
      <main class="flex-1 bg-[#F4F6F8] p-4 overflow-y-auto hide-scrollbar">
        <div class="flex flex-col gap-6">

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h1 class="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-white rounded-lg p-5 flex items-center gap-4 border border-gray-200 shadow-xs">
                <div class="w-12 h-12 rounded-full bg-[#FEF4E3] flex items-center justify-center shrink-0">
                  <svg class="w-6 h-6 text-[#F7941D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></rect>
                    <circle cx="12" cy="10" r="2.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></circle>
                    <path d="M8 17a4 4 0 0 1 8 0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="text-xl font-bold text-gray-900 leading-none">{{ counters.visitor_total }}</span>
                  <span class="text-[14px] text-gray-600 font-medium">Total Visitor</span>
                </div>
              </div>

              <div class="bg-white rounded-lg p-5 flex items-center gap-4 border border-gray-200 shadow-xs">
                <div class="w-12 h-12 rounded-full bg-[#FEF4E3] flex items-center justify-center shrink-0">
                  <svg class="w-6 h-6 text-[#F7941D]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
                    <path d="M11 16l4-4-4-4" />
                    <path d="M3 12h12" />
                  </svg>
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="text-xl font-bold text-gray-900 leading-none">{{ counters.visit_total }}</span>
                  <span class="text-[14px] text-gray-600 font-medium">Total Visit</span>
                </div>
              </div>

              <div class="bg-white rounded-lg p-5 flex items-center gap-4 border border-gray-200 shadow-xs">
                <div class="w-12 h-12 rounded-full bg-[#FEF4E3] flex items-center justify-center shrink-0">
                  <svg class="w-6 h-6 text-[#F7941D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="text-xl font-bold text-gray-900 leading-none">{{ counters.user_total }}</span>
                  <span class="text-[14px] text-gray-600 font-medium">Total User</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-[15px] font-bold text-gray-800 mb-4">Satisfaction Index</h2>
            
            <div v-if="isSatisfactionLoading" class="w-full h-10 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
              <span class="text-xs text-gray-400">Menghitung data...</span>
            </div>

            <div v-else class="w-full h-10 rounded-lg overflow-hidden flex font-medium text-white text-sm shadow-sm">
              
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
                Data Tidak Ditemukan
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
              <div class="flex justify-between items-center mb-6 shrink-0">
                <h2 class="text-[15px] font-bold text-gray-800">Daily Visitor</h2>
                <div class="flex items-center gap-4 text-xs font-medium text-gray-600">
                  <div class="flex items-center gap-1.5">
                    <span class="w-3 h-3 rounded-[2px] bg-[#2D51FD]"></span> Visitor
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="w-3 h-3 rounded-[2px] bg-[#ED9D0F]"></span> Visit
                  </div>
                </div>
              </div>

              <div class="flex-1 flex flex-col relative min-h-0">
                <div v-if="isChartLoading" class="absolute inset-0 flex items-center justify-center text-gray-400">Memuat grafik...</div>
                <apexchart v-show="!isChartLoading" class="w-full h-full" type="bar" height="100%" width="100%" :options="chartOptions" :series="chartSeries" />
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
              <h2 class="text-[15px] font-bold text-gray-800 mb-4 shrink-0">Percentage Visitor by Purpose</h2>
              <div class="flex-1 flex flex-col relative min-h-0">
                <div v-if="isCategoryLoading" class="absolute inset-0 flex items-center justify-center text-gray-400">Memuat data kategori...</div>
                <apexchart v-show="!isCategoryLoading" class="w-full h-full" type="donut" height="100%" width="100%" :options="categoryChartOptions" :series="categorySeries" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[350px] flex flex-col">
            <div class="flex justify-between items-center mb-6 shrink-0">
              <h2 class="text-[15px] font-bold text-gray-800">Monthly Visitor</h2>
              <div class="flex items-center gap-4 text-xs font-medium text-gray-600">
                <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-[#2D51FD]"></span> Visitor</div>
                <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-[#ED9D0F]"></span> Visit</div>
              </div>
            </div>

            <div class="flex-1 flex flex-col relative min-h-0">
              <div v-if="isMonthlyChartLoading" class="absolute inset-0 flex items-center justify-center text-gray-400">Memuat grafik bulanan...</div>
              <apexchart v-show="!isMonthlyChartLoading" class="w-full h-full" type="line" height="100%" width="100%" :options="monthlyChartOptions" :series="monthlyChartSeries" />
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-[15px] font-bold text-gray-800 mb-4 shrink-0">Latest Visitor</h2>
            <div class="w-full overflow-x-auto hide-scrollbar">
              <table class="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr class="border-y border-gray-200 bg-[#FEF4E3]" :style="{ backgroundImage: patternBg ? `url(${patternBg})` : 'none', backgroundSize: 'cover' }">
                    <th class="py-3.5 px-5 text-xs font-bold text-gray-900 uppercase tracking-wider">NAME</th>
                    <th class="py-3.5 px-5 text-xs font-bold text-gray-900 uppercase tracking-wider">PURPOSE</th>
                    <th @click="toggleSort" class="py-3.5 px-5 text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-[#FCECD4] transition-colors select-none">
                      <div class="flex items-center gap-1.5 w-max">
                        CHECK IN
                        <svg class="w-3.5 h-3.5 text-gray-800 transition-transform duration-300" :class="{ 'rotate-180': sortOrder === 'asc' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </th>
                    <th class="py-3.5 px-5 text-xs font-bold text-gray-900 uppercase tracking-wider">CHECK OUT</th>
                    <th class="py-3.5 px-5 text-xs font-bold text-gray-900 uppercase tracking-wider text-center">FACE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="isLoadingLatest">
                    <td colspan="5" class="py-12 text-center text-gray-400 text-[14px]">
                      <div class="flex flex-col items-center gap-3">
                        <svg class="animate-spin h-6 w-6 text-[#F7941D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Memuat data visitor terbaru...
                      </div>
                    </td>
                  </tr>
                  <tr v-else-if="latestVisitors.length === 0">
                    <td colspan="5" class="py-12 text-center text-gray-400 text-[14px]">Tidak Ada Data Untuk Ditampilkan</td>
                  </tr>
                  <tr v-else v-for="visitor in latestVisitors" :key="visitor.id" class="border-b border-gray-100 hover:bg-[#FDF9F2]/50 transition-colors">
                    <td class="py-4 px-5">
                      <div class="flex items-center gap-3.5">
                        <img v-if="visitor.picture_url" :src="visitor.picture_url" alt="" class="w-7 h-7 rounded-sm object-cover border border-gray-100 shrink-0 shadow-xs" />
                        <div v-else class="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-bold shrink-0 border border-gray-200 shadow-xs">
                          {{ visitor.name ? visitor.name.charAt(0).toUpperCase() : '?' }}
                        </div>
                        <span class="text-[13px] text-gray-800">{{ visitor.name }}</span>
                      </div>
                    </td>
                    <td class="py-4 px-5 text-[13px] text-gray-800">{{ visitor.purpose || '-' }}</td>
                    <td class="py-4 px-5 text-[13px] text-gray-800">{{ formatDate(visitor.datetime) }}</td>
                    <td class="py-4 px-5 text-[13px] text-gray-800">{{ visitor.logout_data ? formatDate(visitor.logout_data.datetime) : '-' }}</td>
                    <td class="py-4 px-5">
                      <div class="flex justify-center">
                        <template v-if="visitor.satisfaction === 3">
                          <svg class="w-6.5 h-6.5 text-[#10B981]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/><circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/><path d="M8 14.5c1.5 2 4.5 2 6 0" stroke-linecap="round"/></svg>
                        </template>
                        <template v-else-if="visitor.satisfaction === 2">
                          <svg class="w-6.5 h-6.5 text-[#F59E0B]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/><circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/><line x1="8" y1="15" x2="16" y2="15" stroke-linecap="round"/></svg>
                        </template>
                        <template v-else-if="visitor.satisfaction === 1">
                          <svg class="w-6.5 h-6.5 text-[#EF4444]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/><circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none"/><path d="M8 16c1.5-2 4.5-2 6 0" stroke-linecap="round"/></svg>
                        </template>
                        <span v-else class="text-gray-400 font-bold">-</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.apexcharts-canvas:focus,
.apexcharts-canvas svg:focus,
.vue-apexcharts:focus,
.vue-apexcharts {
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