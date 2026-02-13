<script setup>
// 1. Import pattern yang sudah kamu simpan tadi
import headerPattern from '@/assets/header-pattern.svg'

// Import icon dari library (jika sudah install remixicon)
// import { RiGlobalLine, RiArrowDownSLine } from '@remixicon/vue'
</script>

<template>
  <header class="relative w-full h-[80px] bg-[#F39200] flex items-center px-8 shadow-sm overflow-hidden">
    
    <div 
      class="absolute inset-0 z-0 opacity-30 pointer-events-none"
      :style="{ 
        backgroundImage: `url(${headerPattern})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }"
    ></div>

    <div class="relative z-10 flex items-center justify-between w-full text-white">
      
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div class="w-8 h-8 bg-white/20 rounded flex items-center justify-center">V</div>
          Visitorku.id
        </div>
      </div>

      <div class="flex items-center gap-5">
        
        <button class="p-2 rounded-full hover:bg-white/20 transition duration-200">
          <span class="text-xl">🌐</span> 
        </button>

        <div class="h-6 w-[1px] bg-white/30"></div>

        <button class="flex items-center gap-3 focus:outline-none">
          <div class="text-right hidden md:block">
            <p class="text-sm font-semibold leading-none">Admin</p>
            <p class="text-[11px] text-white/80 mt-1">Super Admin</p>
          </div>
          
          <div class="w-10 h-10 rounded-full border-2 border-white/30 overflow-hidden bg-white/10">
            <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="User" />
          </div>

          <span class="text-white/80">▼</span>
        </button>

      </div>
    </div>

  </header>
</template>