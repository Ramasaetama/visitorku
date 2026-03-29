<script setup>
import Sidebar from '@/components/Sidebar.vue';
import Topbar from '@/components/Topbar.vue';
</script>

<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    <Topbar />

    <div class="flex flex-1">
      <Sidebar />
      
      <main class="flex-1 bg-[#F4F6F8] p-4">
        <div class="flex flex-col gap-6">

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h1 class="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-white rounded-lg p-5 flex items-center gap-4 border border-gray-200">
                <div class="w-12 h-12 rounded-full bg-[#FEF4E3] flex items-center justify-center shrink-0">
                  <svg class="w-6 h-6 text-[#F7941D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="text-xl font-bold text-gray-900">0</span>
                  <span class="text-[15px] text-gray-700 font-medium">Total Visitor</span>
                </div>
              </div>

              <div class="bg-white rounded-lg p-5 flex items-center gap-4 border border-gray-200">
                <div class="w-12 h-12 rounded-full bg-[#FEF4E3] flex items-center justify-center shrink-0">
                  <svg class="w-6 h-6 text-[#F7941D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="text-xl font-bold text-gray-900">0</span>
                  <span class="text-[15px] text-gray-700 font-medium">Total Visit</span>
                </div>
              </div>

              <div class="bg-white rounded-lg p-5 flex items-center gap-4 border border-gray-200">
                <div class="w-12 h-12 rounded-full bg-[#FEF4E3] flex items-center justify-center shrink-0">
                  <svg class="w-6 h-6 text-[#F7941D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="text-xl font-bold text-gray-900">1</span>
                  <span class="text-[15px] text-gray-700 font-medium">Total User</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-[15px] font-bold text-gray-800 mb-4">Satisfaction Index</h2>
            <div class="w-full bg-[#E2E8F0] rounded-full h-8 overflow-hidden">
              <div class="bg-gray-400 h-full rounded-full transition-all duration-500" style="width: 0%;"></div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[300px] flex flex-col">
              <h2 class="text-[15px] font-bold text-gray-800 mb-4">Daily Visitor</h2>
              <div class="flex-1 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[300px] flex flex-col">
              <h2 class="text-[15px] font-bold text-gray-800 mb-4">Percentage Visitor by Purpose</h2>
              <div class="flex-1 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[350px] flex flex-col">
            
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-[15px] font-bold text-gray-800">Monthly Visitor</h2>
              <div class="flex items-center gap-4 text-sm font-medium text-gray-600">
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-full bg-blue-500"></span> Visitor
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-full bg-orange-500"></span> Visit
                </div>
              </div>
            </div>

            <div class="flex-1 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
              
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-[15px] font-bold text-gray-800 mb-4">Latest Visitor</h2>
            
            <div class="w-full overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr 
                    class="border-y border-gray-200 bg-[#FEF4E3]" 
                    :style="{ backgroundImage: patternBg ? `url(${patternBg})` : 'none', backgroundSize: 'cover' }"
                  >
                    <th class="py-3 px-4 text-xs font-bold text-gray-900 uppercase tracking-wider">NAME</th>
                    <th class="py-3 px-4 text-xs font-bold text-gray-900 uppercase tracking-wider">PURPOSE</th>
                    <th class="py-3 px-4 text-xs font-bold text-gray-900 uppercase tracking-wider">
                      <div class="flex items-center gap-1">
                        CHECK IN
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                      </div>
                    </th>
                    <th class="py-3 px-4 text-xs font-bold text-gray-900 uppercase tracking-wider">CHECK OUT</th>
                    <th class="py-3 px-4 text-xs font-bold text-gray-900 uppercase tracking-wider text-center">FACE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="5" class="py-10 text-center text-gray-400 text-[15px]">
                      No Records to display
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