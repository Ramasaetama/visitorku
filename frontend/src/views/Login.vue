<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center relative">
    <div class="absolute top-0 left-0 right-0 h-[45%] bg-[#EE9D0F] overflow-hidden">
      <img 
        src="../assets/images/background.svg" 
        alt="background pattern" 
        class="w-full h-full object-cover"
      />
    </div>
    
    <div class="absolute bottom-0 left-0 right-0 h-[55%] bg-gray-100"></div>

    <div class="relative z-10 px-4">
      <div class="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center">
        <div class="w-16 h-16 mx-auto mb-6">
          <svg class="animate-spin w-16 h-16 text-[#EE9D0F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <p class="text-base text-gray-600 font-poppins">
          Memverifikasi akun anda...
        </p>
      </div>
    </div>
  </div>

  <OnboardingLayout v-else :current-step="0" :total-steps="0" :show-progress="false">
    <div class="w-full">
      <h2 class="text-h2 font-bold text-gray-900 mb-2 font-poppins">
        Masuk ke Dashboard Visitorku
      </h2>
      <p class="text-body-2 text-gray-600 mb-8 font-poppins">
        Kelola data pengunjung, pantau aktivitas kunjungan, dan akses laporan perusahaan Anda secara terpusat.
      </p>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
        <svg class="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-red-600 font-poppins">{{ errorMessage }}</p>
      </div>

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
          <button 
            type="button" 
            @click="showForgotPassword = true" 
            class="text-body-3 text-primary-500 hover:underline font-medium cursor-pointer bg-transparent border-none"
          >
            Lupa password
          </button>
        </div>

        <button
          type="submit"
          :disabled="!formIsValid || isSubmitting"
          :class="[
            'w-full px-6 py-4 text-body-2 rounded-4xl font-poppins font-semibold transition-colors duration-200 flex items-center justify-center gap-2',
            (formIsValid && !isSubmitting) ? 'bg-[#EE9D0F] text-white hover:bg-[#d68d0e] cursor-pointer' : 'bg-[#ACACAC] text-white cursor-not-allowed'
          ]"
        >
          <svg v-if="isSubmitting" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          {{ isSubmitting ? 'Memproses...' : 'Masuk Ke Dashboard' }}
        </button>
      </form>

      <p class="text-center text-body-3 text-gray-600 mt-8 font-poppins">
        Belum punya akun? 
        <router-link to="/register" class="text-primary-500 font-semibold hover:underline">
          Daftarkan Perusahaan Anda
        </router-link>
      </p>
    </div>

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

  <!-- Forgot Password Modal -->
  <Teleport to="body">
    <div v-if="showForgotPassword" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50" @click="closeForgotPassword"></div>
      
      <!-- Modal Content -->
      <div class="relative bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 z-10">
        <!-- Close button -->
        <button 
          @click="closeForgotPassword" 
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Success State -->
        <div v-if="forgotPasswordSuccess" class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2 font-poppins">Email Terkirim!</h3>
          <p class="text-sm text-gray-600 mb-6 font-poppins">
            Kami telah mengirimkan instruksi reset password ke email Anda. Silakan periksa inbox atau folder spam.
          </p>
          <button 
            @click="closeForgotPassword" 
            class="w-full px-6 py-3 bg-[#EE9D0F] text-white rounded-4xl font-poppins font-semibold hover:bg-[#d68d0e] transition-colors cursor-pointer border-none"
          >
            Kembali ke Login
          </button>
        </div>

        <!-- Form State -->
        <div v-else>
          <h3 class="text-lg font-bold text-gray-900 mb-2 font-poppins">Lupa Password?</h3>
          <p class="text-sm text-gray-600 mb-6 font-poppins">
            Masukkan alamat email yang terdaftar dan kami akan mengirimkan instruksi untuk mereset password Anda.
          </p>

          <!-- Error -->
          <div v-if="forgotPasswordError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p class="text-sm text-red-600 font-poppins">{{ forgotPasswordError }}</p>
          </div>

          <form @submit.prevent="handleForgotPassword" class="space-y-4">
            <Input
              v-model="forgotPasswordEmail"
              label="Alamat Email"
              type="email"
              placeholder="Contoh: andi@perusahaan.com"
              required
            />

            <button
              type="submit"
              :disabled="!forgotPasswordEmail.trim() || isSendingReset"
              :class="[
                'w-full px-6 py-3 text-body-2 rounded-4xl font-poppins font-semibold transition-colors duration-200 flex items-center justify-center gap-2 border-none',
                (forgotPasswordEmail.trim() && !isSendingReset) ? 'bg-[#EE9D0F] text-white hover:bg-[#d68d0e] cursor-pointer' : 'bg-[#ACACAC] text-white cursor-not-allowed'
              ]"
            >
              <svg v-if="isSendingReset" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {{ isSendingReset ? 'Mengirim...' : 'Kirim Reset Password' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { OnboardingLayout } from '../components/layout'
import { Input, PasswordInput } from '../components/common'
import authService from '../services/authService'

// Import fungsi login-nya dari service yang sudah dibuat
import { loginUser } from '../services/authService' 

const router = useRouter()

const isLoading = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

// Forgot password state
const showForgotPassword = ref(false)
const forgotPasswordEmail = ref('')
const forgotPasswordError = ref('')
const forgotPasswordSuccess = ref(false)
const isSendingReset = ref(false)

const form = ref({
  email: '',
  password: '',
})

const formIsValid = computed(() => {
  return form.value.email.trim() !== '' && form.value.password.trim() !== ''
})

// Fungsi handleLogin
const handleLogin = async () => {
  isLoading.value = true
  
  try {
    const response = await loginUser(form.value.email, form.value.password)
    
    // PERBAIKAN: Ambil token dari response.data
    const token = response.data?.token;

    if (token) {
      // Simpan token ke Local Storage
      localStorage.setItem('token', token);
      console.log('Login Sukses:', response);

      // Arahkan ke dashboard
      router.push('/dashboard');
    } else {
      alert('Login berhasil, tetapi token tidak ditemukan dari server.');
    }

  } catch (error) {
    console.error('Login Gagal:', error)

    const pesanDariBackend = error.response?.data?.message;
    const pesanTampil = pesanDariBackend || 'Login gagal. Silakan periksa jaringan Anda.';
    
    alert(pesanTampil);
  } finally {
    isLoading.value = false
  }
}
</script>
