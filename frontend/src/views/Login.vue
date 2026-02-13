<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center relative">
    <!-- Top Background Pattern - Orange -->
    <div class="absolute top-0 left-0 right-0 h-[45%] bg-[#EE9D0F] overflow-hidden">
      <img 
        src="../assets/images/background.svg" 
        alt="background pattern" 
        class="w-full h-full object-cover"
      />
    </div>
    
    <!-- Bottom Background - Light Gray -->
    <div class="absolute bottom-0 left-0 right-0 h-[55%] bg-gray-100"></div>

    <!-- Loading Card -->
    <div class="relative z-10 px-4">
      <div class="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center">
        <!-- Spinner -->
        <div class="w-16 h-16 mx-auto mb-6">
          <svg class="animate-spin w-16 h-16 text-[#EE9D0F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <p class="text-base text-gray-600 font-poppins">
          Memverifikasi akun anda
        </p>
      </div>
    </div>
  </div>

  <!-- Login Form -->
  <OnboardingLayout v-else :current-step="0" :total-steps="0" :show-progress="false">
    <div class="w-full">
      <h2 class="text-h2 font-bold text-gray-900 mb-2 font-poppins">
        Masuk ke Dashboard Visitorku
      </h2>
      <p class="text-body-2 text-gray-600 mb-8 font-poppins">
        Kelola data pengunjung, pantau aktivitas kunjungan, dan akses laporan perusahaan Anda secara terpusat.
      </p>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <Input
          v-model="form.email"
          label="Alamat Email"
          type="email"
          placeholder="Contoh: andi@perusahaan.com"
          required
        />

        <PasswordInput
          v-model="form.password"
          label="Buat Password"
          placeholder="Enter your password"
          required
        />

        <div class="flex justify-end">
          <a href="#" class="text-body-3 text-primary-500 hover:underline font-medium">
            Lupa password
          </a>
        </div>

        <button
          type="submit"
          :disabled="!formIsValid"
          :class="[
            'w-full px-6 py-4 text-body-2 rounded-4xl font-poppins font-semibold transition-colors duration-200',
            formIsValid ? 'bg-[#EE9D0F] text-white hover:bg-[#d68d0e] cursor-pointer' : 'bg-[#ACACAC] text-white cursor-not-allowed'
          ]"
        >
          Masuk Ke Dashboard
        </button>
      </form>

      <p class="text-center text-body-3 text-gray-600 mt-8 font-poppins">
        Belum punya akun? 
        <router-link to="/register" class="text-primary-500 font-semibold hover:underline">
          Daftarkan Perusahaan Anda
        </router-link>
      </p>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex items-center justify-between text-sm text-gray-500 font-poppins px-8 py-4 border-t border-gray-100">
        <span>Visitorku Member of GMEDIA © 2025</span>
        <a href="#" class="flex items-center gap-2 text-primary-500 hover:underline">
          <span>Butuh Bantuan?</span>
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span class="font-semibold">Hubungi Support</span>
        </a>
      </div>
    </template>
  </OnboardingLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { OnboardingLayout } from '../components/layout'
import { Input, PasswordInput } from '../components/common'

const router = useRouter()

const isLoading = ref(false)

const form = ref({
  email: '',
  password: '',
})

const formIsValid = computed(() => {
  return form.value.email.trim() !== '' && form.value.password.trim() !== ''
})

const handleLogin = () => {
  isLoading.value = true
  
  // Simulate login process
  setTimeout(() => {
    isLoading.value = false
    router.push('/dashboard')
  }, 2000)
}
</script>
