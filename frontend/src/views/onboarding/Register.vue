<template>
  <div v-if="currentStep === 3" class="min-h-screen flex items-center justify-center relative">
    <div class="absolute top-0 left-0 right-0 h-[45%] bg-[#EE9D0F] overflow-hidden">
      <img 
        src="../../assets/images/background.svg" 
        alt="background pattern" 
        class="w-full h-full object-cover"
      />
    </div>
    
    <div class="absolute bottom-0 left-0 right-0 h-[55%] bg-gray-100"></div>

    <div class="relative z-10 px-4">
      <div class="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center">
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
          class="px-8 py-3 text-body-3 rounded-sm font-poppins font-semibold bg-[#EE9D0F] text-white hover:bg-[#d68d0e] transition-colors duration-200 w-full"
        >
          Masuk ke Dashboard
        </button>
      </div>
    </div>
  </div>

  <OnboardingLayout v-else :current-step="currentStep" :total-steps="2">
    <div v-if="currentStep === 1" class="mt-39">
      <h2 class="text-2xl lg:text-xl font-medium text-gray-900 mb-0 font-poppins">
        Beritahu Kami Tentang Perusahaan Anda
      </h2>
      <p class="text-body-2 text-gray-600 mb-8 font-poppins">
        Mulai dengan mengisi data perusahaan untuk membuat akun VisitorKu.
      </p>

      <form @submit.prevent="nextStep" class="space-y-6 form-custom-label" autocomplete="off" @focusin="isFormFocused = true" @focusout="isFormFocused = false">
        <Input
          v-model="form.companyName"
          label="Nama Perusahaan"
          placeholder="Contoh: PT Media Sarana Data"
          autocomplete="off"
          name="company-name"
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
            class="flex items-center gap-2 text-primary-500 font-semibold font-poppins text-[#EE9D0F] hover:underline"
          >
            
          </button>
          <div v-else></div>
          <button
            type="submit"
            :disabled="!step1IsValid"
            :class="[
              'px-6 py-3 text-body-3 rounded-sm font-poppins font-semibold transition-colors duration-200',
              step1IsValid ? 'bg-[#EE9D0F] text-white hover:bg-[#d68d0e] cursor-pointer' : 'bg-[#ACACAC] text-white cursor-not-allowed'
            ]"
          >
            Selanjutnya
          </button>
        </div>
      </form>

      <p class="text-center text-body-3 text-gray-600 mt-8 font-poppins">
        Sudah punya akun? 
        <router-link to="/login" class="text-[#EE9D0F] font-semibold hover:underline">
          Masuk Dashboard
        </router-link>
      </p>
    </div>

    <div v-if="currentStep === 2" class="">
      <h2 class="text-2xl lg:text-xl font-medium text-gray-900 mt-5mb-0 font-poppins">
        Informasi Penanggung Jawab
      </h2>
      <p class="text-body-2 text-gray-600 mb-8 font-poppins">
        Data ini akan digunakan sebagai akun utama (admin) untuk mengelola VisitorKu.
      </p>

      <form @submit.prevent="submitRegister" class="space-y-5 form-custom-label" autocomplete="off">
        <!-- Dummy inputs untuk menyerap autofill kredensial browser -->
        <input type="text" name="username" autocomplete="username" style="display:none;" aria-hidden="true" tabindex="-1" />
        <input type="password" name="password" autocomplete="current-password" style="display:none;" aria-hidden="true" tabindex="-1" />

        <Input
          v-model="form.adminName"
          label="Nama Lengkap"
          placeholder="Contoh: Andi Pratama"
          autocomplete="off"
          name="display-name"
          required
        />

        <Input
          v-model="form.adminEmail"
          label="Alamat Email"
          type="email"
          placeholder="Contoh: andi@perusahaan.com"
          autocomplete="off"
          name="admin-email"
          required
        />

        <Input
          v-model="form.adminPhone"
          label="Nomor Telepon"
          type="tel"
          inputmode="numeric"
          placeholder="Contoh: 0812 3456 7890"
          autocomplete="off"
          required
          @keydown="(e) => { if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight|Tab|Home|End/.test(e.key)) e.preventDefault(); }"
          @input="(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); form.adminPhone = e.target.value; }"
        />

        <Textarea
          v-model="form.adminAddress"
          label="Alamat Domisili"
          placeholder="Masukkan alamat domisili penanggung jawab"
          :rows="3"
          required
        />

        <div class="toggle-wrapper text-stone-950">
          <Toggle
            v-model="form.sameAddress"
            label="Alamat domisili sama dengan alamat perusahaan"
          />
        </div>

        <PasswordInput
          v-model="form.password"
          label="Buat Password"
          placeholder="Enter your password"
          autocomplete="new-password"
          name="new-password"
          required
        />

        <PasswordInput
          v-model="form.confirmPassword"
          label="Re-enter Password"
          placeholder="Re-enter your password"
          autocomplete="new-password"
          name="confirm-password"
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
            class="flex text-[#EE9D0F] items-center gap-2 text-primary-500 font-semibold font-poppins hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            @click="prevStep"
            :disabled="isLoading"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </button>
          
          <button
            type="submit"
            :disabled="!form.agreeTerms || isLoading || !!passwordError"
            :class="[
              'px-6 py-3 text-body-3 rounded-sm font-poppins font-semibold transition-colors duration-200 flex items-center gap-2',
              (form.agreeTerms && !isLoading && !passwordError) ? 'bg-[#EE9D0F] text-white hover:bg-[#d68d0e] cursor-pointer' : 'bg-[#ACACAC] text-white cursor-not-allowed'
            ]"
          >
            <svg v-if="isLoading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoading ? 'Memproses...' : 'Daftarkan Akun Perusahaan' }}
          </button>
        </div>
      </form>

      <p class="text-center text-body-3 text-gray-600 mt-8 font-poppins">
        Sudah punya akun? 
        <router-link to="/login" class="text-[#EE9D0F] font-semibold hover:underline">
          Masuk Dashboard
        </router-link>
      </p>
    </div>
  </OnboardingLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { showError } from '@/utils/alertHelper'
import { useRouter } from 'vue-router'
import { OnboardingLayout } from '../../components/layout'
import { Button, Input, Textarea, Toggle, Checkbox, PasswordInput } from '../../components/common'
import authService from '../../services/authService'
import mailIcon from '../../assets/images/mail-icon.png'

// IMPORT DARI AUTH SERVICE, BUKAN API LAGI
import { registerUser } from '../../services/authService.js' 

const router = useRouter()

const currentStep = ref(1)
const isFormFocused = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const isLoading = ref(false)

const form = ref({
  companyName: '',
  companyAddress: '',
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

// Cegah browser autofill mengisi field nama/email/password secara otomatis
onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      form.value.companyName = ''
      form.value.adminName = ''
      form.value.adminEmail = ''
      form.value.password = ''
      form.value.confirmPassword = ''
    }, 50)
  })
})

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

const nextStep = () => {
  if (currentStep.value === 1 && step1IsValid.value) {
    currentStep.value++
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

const submitRegister = async () => {
  if (!form.value.agreeTerms) return;
  if (form.value.password !== form.value.confirmPassword) return;

  isLoading.value = true;

  try {
    const regis = {
      by_event: "website",
      company_name: form.value.companyName,
      company_address: form.value.companyAddress,
      name: form.value.adminName,
      email: form.value.adminEmail,
      password: form.value.password,
      c_password: form.value.confirmPassword,
      phone_number: form.value.adminPhone,
      address: form.value.adminAddress
    };

    // PANGGIL FUNGSI DARI AUTHSERVICE.JS
    await registerUser(regis);

    // Jika sukses
    currentStep.value = 3;

  } catch (error) {
    console.error("Error Registrasi:", error);

    if (error.response) {
      const msg = error.response.data?.message || error.response.data?.error || '';
      const msgLower = msg.toLowerCase();

      if (
        msgLower.includes('email') &&
        (msgLower.includes('already') || msgLower.includes('exist') || msgLower.includes('taken') || msgLower.includes('terdaftar'))
      ) {
        showError('Email Sudah Digunakan', 'Email yang Anda masukkan sudah terdaftar. Gunakan email lain atau masuk dengan akun yang ada.');
      } else if (error.response.status === 422 && error.response.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        showError('Data Tidak Valid', Array.isArray(firstError) ? firstError[0] : firstError);
      } else if (error.response.status === 401) {
        showError('Tidak Diizinkan', '401 Unauthorized: Cek konfigurasi backend Anda.');
      } else if (msg) {
        showError('Email sudah digunakan', msg);
      } else {
        showError('Email sudah digunakan', `Terjadi kesalahan (Status: ${error.response.status})`);
      }
    } else if (error.request) {
      showError('Koneksi Gagal', 'Gagal terhubung ke server. Pastikan Backend Server sudah menyala.');
    } else {
      showError('Kesalahan Sistem', 'Terjadi kesalahan yang tidak diketahui.');
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* Animasi banner error */
.error-banner-enter-active {
  transition: all 0.3s ease-out;
}
.error-banner-leave-active {
  transition: all 0.2s ease-in;
}
.error-banner-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.error-banner-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* CSS Khusus untuk memanipulasi label di dalam form agar TIDAK BOLD */
.form-custom-label :deep(label) {
  font-weight: 400 !important; /* Hilangkan bold */
  color: #374151; /* Warna abu-abu gelap */
}

/* Mengubah warna bintang (*) jadi merah */
/* Hanya memunculkan bintang merah di elemen yang kita suruh */
.required-asterisk :deep(label::after) {
  content: " *";
  color: #ef4444 !important; /* Warna merah */
}

.toggle-wrapper :deep(label),
.toggle-wrapper :deep(span) {
  color: #374151 !important; 
}
</style>