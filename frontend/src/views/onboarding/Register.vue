<template>
  <!-- Step 3: Success - Full Width Layout -->
  <div v-if="currentStep === 3" class="min-h-screen flex items-center justify-center relative">
    <!-- Top Background Pattern - Orange -->
    <div class="absolute top-0 left-0 right-0 h-[45%] bg-[#EE9D0F] overflow-hidden">
      <img 
        src="../../assets/images/background.svg" 
        alt="background pattern" 
        class="w-full h-full object-cover"
      />
    </div>
    
    <!-- Bottom Background - Light Gray -->
    <div class="absolute bottom-0 left-0 right-0 h-[55%] bg-gray-100"></div>

    <!-- Card Content - Centered and Floating -->
    <div class="relative z-10 px-4">
      <div class="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center">
        <!-- Success Icon -->
        <div class="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <img :src="mailIcon" alt="Mail Icon" class="w-20 h-20" />
        </div>

        <h2 class="text-3xl font-bold text-gray-900 mb-4 font-poppins">
          Pendaftaran Berhasil!
        </h2>
        <p class="text-base text-gray-600 mb-8 font-poppins">
          Akun perusahaan Anda telah berhasil dibuat. Silakan cek email untuk langkah selanjutnya.
        </p>

        <button
          @click="goToDashboard"
          class="px-8 py-3 text-body-3 rounded-4xl font-poppins font-semibold bg-[#EE9D0F] text-white hover:bg-[#d68d0e] transition-colors duration-200 w-full"
        >
          Masuk ke Dashboard
        </button>
      </div>
    </div>
  </div>

  <!-- Step 1 & 2: Onboarding Layout -->
  <OnboardingLayout v-else :current-step="currentStep" :total-steps="2">
    <!-- Step 1: Company Info -->
    <div v-if="currentStep === 1">
      <h2 class="text-h2 font-bold text-gray-900 mb-2 font-poppins">
        Beritahu Kami Tentang Perusahaan Anda
      </h2>
      <p class="text-body-2 text-gray-600 mb-8 font-poppins">
        Mulai dengan mengisi data perusahaan untuk membuat akun VisitorKu.
      </p>

      <form @submit.prevent="nextStep" class="space-y-6" @focusin="isFormFocused = true" @focusout="isFormFocused = false">
        <Input
          v-model="form.companyName"
          label="Nama Perusahaan"
          placeholder="Contoh: PT Media Sarana Data"
          required
        />

        <Textarea
          v-model="form.companyAddress"
          label="Alamat Perusahaan"
          placeholder="Masukkan alamat lengkap perusahaan"
          :rows="4"
          required
        />

        <div class="flex items-center justify-between pt-2">
          <button
            v-if="isFormFocused"
            type="button"
            class="flex items-center gap-2 text-primary-500 font-semibold font-poppins hover:underline"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"  >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </button>
          <div v-else></div>
          <button
            type="submit"
            :disabled="!step1IsValid"
            :class="[
              'px-6 py-3 text-body-3 rounded-4xl font-poppins font-semibold transition-colors duration-200',
              step1IsValid ? 'bg-[#EE9D0F] text-white hover:bg-[#d68d0e] cursor-pointer' : 'bg-[#ACACAC] text-white cursor-not-allowed'
            ]"
          >
            Selanjutnya
          </button>
        </div>
      </form>

      <p class="text-center text-body-3 text-gray-600 mt-8 font-poppins">
        Sudah punya akun? 
        <router-link to="/login" class="text-primary-500 font-semibold hover:underline">
          Masuk Dashboard
        </router-link>
      </p>
    </div>

    <!-- Step 2: Admin Info -->
    <div v-if="currentStep === 2">
      <h2 class="text-h2 font-bold text-gray-900 mb-2 font-poppins">
        Informasi Penanggung Jawab
      </h2>
      <p class="text-body-2 text-gray-600 mb-8 font-poppins">
        Data ini akan digunakan sebagai akun utama (admin) untuk mengelola VisitorKu.
      </p>

      <!-- Error Message -->
        <div v-if="errorMessage" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <svg class="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-red-600 font-poppins">{{ errorMessage }}</p>
        </div>

      <form @submit.prevent="nextStep" class="space-y-5">
        <Input
          v-model="form.adminName"
          label="Nama Lengkap"
          placeholder="Contoh: Andi Pratama"
          required
        />

        <Input
          v-model="form.adminEmail"
          label="Alamat Email"
          type="email"
          placeholder="Contoh: andi@perusahaan.com"
          required
        />

        <Input
          v-model="form.adminPhone"
          label="Nomor Telepon"
          type="tel"
          placeholder="Contoh: 0812 3456 7890"
          required
        />

        <Textarea
          v-model="form.adminAddress"
          label="Alamat Domisili"
          placeholder="Masukkan alamat domisili penanggung jawab"
          :rows="3"
          required
        />

        <Toggle
          v-model="form.sameAddress"
          label="Alamat domisili sama dengan alamat perusahaan"
        />

        <PasswordInput
          v-model="form.password"
          label="Buat Password"
          placeholder="Enter your password"
          required
        />

        <PasswordInput
          v-model="form.confirmPassword"
          label="Re-enter Password"
          placeholder="Re-enter your password"
          required
          :error="passwordError"
        />

        <div class="flex items-start gap-3 pt-2">
          <Checkbox v-model="form.agreeTerms" />
          <span class="text-sm text-gray-600 font-poppins">
            I agree to the 
            <a href="#" class="text-primary-500 hover:underline">Terms and Conditions</a>
          </span>
        </div>

        <div class="flex items-center justify-between pt-2">
          <button
            type="button"
            class="flex items-center gap-2 text-primary-500 font-semibold font-poppins hover:underline"
            @click="prevStep"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" back />
            </svg>
            Kembali
          </button>
          <button
            type="submit"
            :disabled="!form.agreeTerms || isSubmitting"
            :class="[
              'px-6 py-3 text-body-3 rounded-4xl font-poppins font-semibold transition-colors duration-200 flex items-center gap-2',
              (form.agreeTerms && !isSubmitting) ? 'bg-[#EE9D0F] text-white hover:bg-[#d68d0e] cursor-pointer' : 'bg-[#ACACAC] text-white cursor-not-allowed'
            ]"
          >
            <svg v-if="isSubmitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Akun Perusahaan' }}
          </button>
        </div>
      </form>

      <p class="text-center text-body-3 text-gray-600 mt-8 font-poppins">
        Sudah punya akun? 
        <router-link to="/login" class="text-primary-500 font-semibold hover:underline">
          Masuk Dashboard
        </router-link>
      </p>
    </div>
  </OnboardingLayout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { OnboardingLayout } from '../../components/layout'
import { Button, Input, Textarea, Toggle, Checkbox, PasswordInput } from '../../components/common'
import authService from '../../services/authService'
import mailIcon from '../../assets/images/mail-icon.png'

const router = useRouter()

const currentStep = ref(1)
const isFormFocused = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const form = ref({
  // Step 1
  companyName: '',
  companyAddress: '',
  // Step 2
  adminName: '',
  adminEmail: '',
  adminPhone: '',
  adminAddress: '',
  sameAddress: false,
  password: '',
  confirmPassword: '',
  agreeTerms: false,
})

const step1IsValid = computed(() => {
  return form.value.companyName.trim() !== '' && form.value.companyAddress.trim() !== ''
})

// Watch for same address toggle
watch(() => form.value.sameAddress, (val) => {
  if (val) {
    form.value.adminAddress = form.value.companyAddress
  }
})

const passwordError = computed(() => {
  if (form.value.confirmPassword && form.value.password !== form.value.confirmPassword) {
    return 'Password tidak cocok'
  }
  return ''
})

const nextStep = async () => {
  if (currentStep.value === 1) {
    // Step 1 → Step 2: just advance
    currentStep.value = 2
    return
  }

  if (currentStep.value === 2) {
    // Step 2 → call register API
    if (!form.value.agreeTerms) return
    if (form.value.password !== form.value.confirmPassword) return

    isSubmitting.value = true
    errorMessage.value = ''

    try {
      const payload = {
        by_event: '',
        company_name: form.value.companyName,
        company_address: form.value.companyAddress,
        name: form.value.adminName,
        email: form.value.adminEmail,
        phone_number: form.value.adminPhone.replace(/[\s\-()]/g, ''),
        address: form.value.adminAddress,
        password: form.value.password,
        c_password: form.value.confirmPassword,
      }

      const response = await authService.register(payload)

      // API returns { data: { ...user, token }, message }
      if (response.data && response.data.token) {
        authService.saveToken(response.data.token)
        authService.saveUser(response.data)
      }

      // Advance to success step
      currentStep.value = 3
    } catch (error) {
      if (error.response) {
        const data = error.response.data
        // Handle { item_name, message } format
        if (data.message) {
          errorMessage.value = data.message
        } else if (data.errors) {
          const firstError = Object.values(data.errors)[0]
          errorMessage.value = Array.isArray(firstError) ? firstError[0] : firstError
        } else {
          errorMessage.value = 'Registrasi gagal. Silakan coba lagi.'
        }
      } else {
        errorMessage.value = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
      }
    } finally {
      isSubmitting.value = false
    }
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    errorMessage.value = ''
    currentStep.value--
  }
}

const goToDashboard = () => {
  router.push('/login')
}
</script>
