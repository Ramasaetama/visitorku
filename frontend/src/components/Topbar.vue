<script setup>
import { ref, onMounted } from 'vue'

// 1. Import pattern background
import headerPattern from '@/assets/header-pattern.svg'

// 2. Import fungsi API GET Profile
import { getProfile } from '@/services/profileService'

// 3. Buat variabel reaktif penampung data
const companyName = ref('Admin') // Nilai awal sebelum data datang
const logoUrl = ref(null)

// 4. Fungsi untuk mengambil data profil
const fetchHeaderData = async () => {
  try {
    const response = await getProfile()
    const dataDariServer = response.data
    
    // Tangkap Nama dan Foto (Sesuaikan nama propertinya dengan backend)
    companyName.value = dataDariServer.name || dataDariServer.company_name || 'Admin'
    logoUrl.value = dataDariServer.picture_url || dataDariServer.logo || null
    
  } catch (error) {
    console.error('Gagal memuat data header:', error)
  }
}

// 5. Jalankan otomatis saat topbar dimuat
onMounted(() => {
  fetchHeaderData()
})
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
      
      <router-link to="/dashboard" class="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
        <div class="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div class="w-8 h-8 bg-white/20 rounded flex items-center justify-center">V</div>
        </div>
      </router-link>

      <div class="flex items-center gap-5">
        
        <button class="p-2 rounded-full hover:bg-white/20 transition duration-200">
          <span class="text-xl">🌐</span> 
        </button>

        <div class="h-6 w-px bg-white/30"></div>

        <button class="flex items-center gap-3 focus:outline-none">
          <div class="text-right hidden md:block">
            <p class="text-sm font-semibold leading-none">{{ companyName }}</p>
            <p class="text-[11px] text-white/80 mt-1">Super Admin</p>
          </div>
          
          <div class="w-10 h-10 rounded-full border-2 border-white/30 overflow-hidden bg-white/10 flex items-center justify-center">
            <img 
              :src="logoUrl || 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff'" 
              alt="User" 
              class="w-full h-full object-cover"
            />
          </div>

          <span class="text-white/80">▼</span>
        </button>

      </div>
    </div>

  </header>
</template>