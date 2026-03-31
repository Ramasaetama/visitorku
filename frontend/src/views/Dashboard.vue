<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Topbar from '@/components/Topbar.vue';
import patternBg from '@/assets/Frame 7.svg'; 

// Import fungsi API 
import { getDashboardCounters, getWeeklyData, getMonthlyData, getCategoryData } from '@/services/dashboardService';

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

const chartData = ref({
  titles: [], 
  visits: [], 
  visitors: [], 
});

const isChartLoading = ref(true);

const chartOptions = ref({
  chart: {
    type: 'bar',
    toolbar: { show: false }, 
    fontFamily: 'Poppins, sans-serif',
    selection: {
      enabled: false, 
    },
  },
  colors: ['#2D51FD', '#ED9D0F'], 
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%', 
      endingShape: 'rounded', 
      borderRadius: 4, 
    },
  },
  dataLabels: {
    enabled: false 
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  xaxis: {
    categories: [], 
    labels: {
      style: {
        colors: '#64748B', 
        fontSize: '12px',
      },
    },
    axisBorder: { show: true, color: '#E2E8F0' }, 
    axisTicks: { show: true, color: '#E2E8F0' },  
  },
  yaxis: {
    min: 0,
    max: 2, 
    tickAmount: 5, 
    labels: {
      formatter: (value) => {
        return value.toFixed(1); 
      },
      style: {
        colors: '#64748B',
        fontSize: '12px',
      },
    },
  },
  grid: {
    show: true,
    borderColor: '#E2E8F0', 
    strokeDashArray: 0, 
    xaxis: {
      lines: { show: false } 
    },
    yaxis: {
      lines: { show: true } 
    },
  },
  fill: {
    opacity: 1
  }, 
  tooltip: {
    enabled: false 
  },

  states: {
    normal: {
      filter: {
        type: 'none',
        value: 0,
      }
    },
    hover: {
      filter: {
        type: 'none',
        value: 0,
      }
    },
    active: {
      allowMultipleDataPointsSelection: false,
      filter: {
        type: 'none', 
        value: 0,
      }
    },
  },

  legend: {
    show: false, 
  },
});

const chartSeries = ref([
  {
    name: 'Visitor',
    data: [] 
  }, 
  {
    name: 'Visit',
    data: [] 
  }
]);

const fetchWeeklyData = async () => {
  isChartLoading.value = true;
  try {
    const response = await getWeeklyData();
    const dataAPI = response.data.data;
    
    chartData.value = {
      titles: dataAPI.titles,
      visits: dataAPI.visits,
      visitors: dataAPI.visitors,
    };

    chartOptions.value = {
      ...chartOptions.value,
      xaxis: {
        ...chartOptions.value.xaxis,
        categories: dataAPI.titles 
      }
    };

    chartSeries.value = [
      {
        name: 'Visitor',
        data: dataAPI.visitors 
      }, 
      {
        name: 'Visit',
        data: dataAPI.visits 
      }
    ];

  } catch (error) {
    console.error("Gagal memuat data mingguan:", error);
  } finally {
    isChartLoading.value = false;
  }
};

const isMonthlyChartLoading = ref(true);

const monthlyChartOptions = ref({
  chart: {
    type: 'line',
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
    selection: { enabled: false },
    zoom: {
      enabled: false 
    },
    dropShadow: {
      enabled: true,
      top: 5,
      left: 0,
      blur: 5,
      opacity: 0.2
    }
  },
  colors: ['#2D51FD', '#ED9D0F'], 
  stroke: {
    curve: 'smooth', 
    width: 3
  },
  dataLabels: {
    enabled: true,
    background: {
      enabled: true,
      foreColor: '#fff',
      padding: 4,
      borderRadius: 2,
      borderWidth: 0,
    },
    offsetY: -2
  },
  markers: {
    size: 0, 
    hover: {
      sizeOffset: 4 
    }
  },
  xaxis: {
    categories: [], 
    title: {
      text: 'Month', 
      offsetY: 5,
      style: {
        color: '#111827',
        fontSize: '12px',
        fontWeight: 'bold',
      }
    },
    labels: {
      style: { colors: '#64748B', fontSize: '11px' },
    },
    axisBorder: { show: true, color: '#E2E8F0' }, 
    axisTicks: { show: true, color: '#E2E8F0' },
    tooltip: {
      enabled: true, 
    },
    crosshairs: {
      show: true,
      stroke: {
        color: '#b6b6b6',
        width: 1,
        dashArray: 3, 
      }
    }
  },
  yaxis: {
    min: 0,
    max: 8, 
    tickAmount: 4, 
    labels: {
      formatter: (value) => {
        return Math.round(value); 
      },
      style: { colors: '#64748B', fontSize: '12px' },
    },
  },
  grid: {
    show: true,
    borderColor: '#E2E8F0', 
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  tooltip: { 
    enabled: true,
    shared: true, 
    intersect: false, 
  }, 
  states: {
    hover: { filter: { type: 'none' } },
    active: { filter: { type: 'none' } },
  },
  legend: { show: false }, 
});

const monthlyChartSeries = ref([
  { name: 'Visitor', data: [] }, 
  { name: 'Visit', data: [] }
]);

const fetchMonthlyData = async () => {
  isMonthlyChartLoading.value = true;
  try {
    const response = await getMonthlyData();
    const dataAPI = response.data.data;
    
    monthlyChartOptions.value = {
      ...monthlyChartOptions.value,
      xaxis: {
        ...monthlyChartOptions.value.xaxis,
        categories: dataAPI.titles 
      }
    };

    monthlyChartSeries.value = [
      { name: 'Visitor', data: dataAPI.visitors }, 
      { name: 'Visit', data: dataAPI.visits }
    ];

  } catch (error) {
    console.error("Gagal memuat data monthly:", error);
  } finally {
    isMonthlyChartLoading.value = false;
  }
};

const isCategoryLoading = ref(true);

const categoryChartOptions = ref({
  chart: {
    type: 'donut',
    fontFamily: 'Poppins, sans-serif',
  },
  colors: ['#FF4560', '#008FFB', '#775DD0', '#F7941D', '#00E396'],
  labels: [], 
  legend: {
    position: 'right',
    fontSize: '12px',
    markers: { radius: 2 }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            fontSize: '14px',
            fontWeight: 600,
            color: '#64748B',
            formatter: function (w) {
              return w.globals.seriesTotals.reduce((a, b) => a + b, 0)
            }
          }
        }
      }
    }
  },
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return val.toFixed(1) + "%"
    }
  },
  tooltip: { enabled: true },
  states: {
    hover: { filter: { type: 'none' } },
    active: { filter: { type: 'none' } }
  }
});

const categorySeries = ref([]); 

const fetchCategoryData = async () => {
  isCategoryLoading.value = true;
  try {
    const response = await getCategoryData();
    const dataAPI = response.data.data;
    
    categoryChartOptions.value = {
      ...categoryChartOptions.value,
      labels: dataAPI.titles
    };
    categorySeries.value = dataAPI.values;
  } catch (error) {
    console.error("Gagal memuat data kategori:", error);
  } finally {
    isCategoryLoading.value = false;
  }
};

onMounted(() => {
  fetchCounters();   
  fetchWeeklyData(); 
  fetchMonthlyData();
  fetchCategoryData();
});
</script>

<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    <Topbar />

    <div class="flex flex-1 items-stretch">
      <Sidebar />
      
      <main class="flex-1 bg-[#F4F6F8] p-4 overflow-y-auto">
        <div class="flex flex-col gap-6">

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h1 class="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-white rounded-lg p-5 flex items-center gap-4 border border-gray-200">
                <div class="w-12 h-12 rounded-full bg-[#FEF4E3] flex items-center justify-center shrink-0">
                  
                  <svg class="w-6 h-6 text-[#F7941D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></rect>
                    <circle cx="12" cy="10" r="2.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></circle>
                    <path d="M8 17a4 4 0 0 1 8 0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                  </div>
                <div class="flex items-baseline gap-2">
                  <span class="text-xl font-bold text-gray-900">{{ counters.visitor_total }}</span>
                  <span class="text-[15px] text-gray-700 font-medium">Total Visitor</span>
                </div>
              </div>

              <div class="bg-white rounded-lg p-5 flex items-center gap-4 border border-gray-200">
                <div class="w-12 h-12 rounded-full bg-[#FEF4E3] flex items-center justify-center shrink-0">
                  
                  <svg class="w-6 h-6 text-[#F7941D]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
                    <path d="M11 16l4-4-4-4" />
                    <path d="M3 12h12" />
                  </svg>
                  </div>
                <div class="flex items-baseline gap-2">
                  <span class="text-xl font-bold text-gray-900">{{ counters.visit_total }}</span>
                  <span class="text-[15px] text-gray-700 font-medium">Total Visit</span>
                </div>
              </div>

              <div class="bg-white rounded-lg p-5 flex items-center gap-4 border border-b-0 border-gray-200">
                <div class="w-12 h-12 rounded-full bg-[#FEF4E3] flex items-center justify-center shrink-0">
                  <svg class="w-6 h-6 text-[#F7941D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="text-xl font-bold text-gray-900">{{ counters.user_total }}</span>
                  <span class="text-[15px] text-gray-700 font-medium">Total User</span>
                </div>
              </div>
            
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-[15px] font-bold text-gray-800 mb-4">Satisfaction Index</h2>
            <div class="w-full bg-[#E2E8F0] rounded-full h-8 overflow-hidden">
              <div class="bg-gray-400 h-full rounded-full transition-all duration-500" style="width: 75%;"></div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
              
              <div class="flex justify-between items-center mb-6">
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
                
                <div v-if="isChartLoading" class="absolute inset-0 flex items-center justify-center text-gray-400">
                  Memuat grafik...
                </div>

                <apexchart 
                  v-show="!isChartLoading"
                  class="w-full h-full"
                  type="bar" 
                  height="100%" 
                  width="100%"
                  :options="chartOptions" 
                  :series="chartSeries"
                />
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
              <h2 class="text-[15px] font-bold text-gray-800 mb-4">Percentage Visitor by Purpose</h2>
              
              <div class="flex-1 flex flex-col relative min-h-0">
                <div v-if="isCategoryLoading" class="absolute inset-0 flex items-center justify-center text-gray-400">
                  Memuat data kategori...
                </div>

                <apexchart 
                  v-show="!isCategoryLoading"
                  class="w-full h-full"
                  type="donut" 
                  height="100%" 
                  width="100%"
                  :options="categoryChartOptions" 
                  :series="categorySeries"
                />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[350px] flex flex-col">
            
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-[15px] font-bold text-gray-800">Monthly Visitor</h2>
              <div class="flex items-center gap-4 text-xs font-medium text-gray-600">
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-full bg-[#2D51FD]"></span> Visitor
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-full bg-[#ED9D0F]"></span> Visit
                </div>
              </div>
            </div>

            <div class="flex-1 flex flex-col relative min-h-0">
              <div v-if="isMonthlyChartLoading" class="absolute inset-0 flex items-center justify-center text-gray-400">
                Memuat grafik bulanan...
              </div>

              <apexchart 
                v-show="!isMonthlyChartLoading"
                class="w-full h-full"
                type="line" 
                height="100%" 
                width="100%"
                :options="monthlyChartOptions" 
                :series="monthlyChartSeries"
              />
            </div>
            
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-[15px] font-bold text-gray-800 mb-4">Latest Visitor</h2>
            <div class="w-full overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-y border-gray-200 bg-[#FEF4E3]" :style="{ backgroundImage: patternBg ? `url(${patternBg})` : 'none', backgroundSize: 'cover' }">
                    <th class="py-3 px-4 text-xs font-bold text-gray-900 uppercase tracking-wider">NAME</th>
                    <th class="py-3 px-4 text-xs font-bold text-gray-900 uppercase tracking-wider">PURPOSE</th>
                    <th class="py-3 px-4 text-xs font-bold text-gray-900 uppercase tracking-wider"><div class="flex items-center gap-1">CHECK IN<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg></div></th>
                    <th class="py-3 px-4 text-xs font-bold text-gray-900 uppercase tracking-wider">CHECK OUT</th>
                    <th class="py-3 px-4 text-xs font-bold text-gray-900 uppercase tracking-wider text-center">FACE</th>
                  </tr>
                </thead>
                <tbody><tr><td colspan="5" class="py-10 text-center text-gray-400 text-[15px]">No Records to display</td></tr></tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<style>
.apexcharts-canvas:focus,
.apexcharts-canvas svg:focus,
.vue-apexcharts:focus,
.vue-apexcharts {
  outline: none !important;
  box-shadow: none !important;
}
</style>