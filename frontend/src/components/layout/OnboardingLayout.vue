<template>
  <div class="min-h-screen flex relative">
    <!-- Left Side - Hero/Branding -->
    <div class="hidden lg:flex lg:w-1/2 relative overflow-visible bg-[#EE9D0F]">
      <!-- Background Pattern - Using SVG -->
      <div class="absolute inset-0 w-full h-full overflow-hidden">
        <img 
          :src="bgPattern" 
          alt="background pattern" 
          class="w-full h-full object-cover"
        />
      </div>
      
      <!-- Content -->
      <div class="relative z-10 flex flex-col justify-center items-start px-12 xl:px-16 py-12 w-full">
        <h1 class="text-3xl xl:text-[32px] font-bold text-white mb-4 font-poppins leading-tight text-left">
          Mulai gunakan VisitorKu
        </h1>
        <p class="text-base text-white/90 font-poppins leading-relaxed max-w-md text-left">
          Kelola data pengunjung, laporan kunjungan, dan operasional 
          penerimaan tamu perusahaan Anda dalam satu sistem terpusat.
        </p>
        
        <!-- Dashboard Preview - Aligned left with heading, extends right -->
        <div class="mt-8 rounded-2xl overflow-hidden shadow-2xl w-[calc(100%+4rem)] xl:w-[calc(100%+6rem)]" v-if="dashboardPreview">
          <img 
            :src="dashboardPreview" 
            alt="Dashboard Preview" 
            class="w-full h-auto"
          />
        </div>
        <!-- Placeholder if no preview -->
        <div v-else class="mt-8 rounded-2xl overflow-hidden shadow-2xl bg-white p-6 min-h-[300px] flex items-center justify-center w-[calc(100%+4rem)] xl:w-[calc(100%+6rem)]">
          <div class="text-center text-gray-400">
            <svg class="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <p class="text-body-3">Dashboard Preview</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side - Form -->
    <div class="w-full lg:w-1/2 bg-white flex flex-col relative z-20">
      <!-- Logo Header -->
      <div class="px-8 py-6 lg:px-12">
        <div class="flex items-center gap-2">
          <img :src="logo" alt="VisitorKu" class="h-8" />
        </div>
      </div>

      <!-- Form Content -->
      <div class="flex-1 flex flex-col justify-center px-8 lg:px-12 xl:px-20 pb-8">
        <slot />
      </div>

      <!-- Step Indicator -->
      <div class="pb-8 w-full flex justify-center" v-if="showProgress && totalSteps > 1">
        <div class="flex gap-2 max-w-sm w-full mx-auto px-8 lg:px-12">
          <div
            v-for="step in totalSteps"
            :key="step"
            :class="[
              'h-1 flex-1 rounded-full transition-colors',
              step <= currentStep ? 'bg-gray-200' : 'bg-gray-200'
            ]"
            :style="step <= currentStep ? { backgroundColor: '#EE9D0F' } : {}"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentStep: {
    type: Number,
    default: 1,
  },
  totalSteps: {
    type: Number,
    default: 3,
  },
  showProgress: {
    type: Boolean,
    default: true,
  },
})

// Import assets
import bgPattern from '../../assets/images/background.svg'
import logo from '../../assets/images/logo.svg'
import dashboardPreview from '../../assets/images/dashboard-preview.png'
</script>
