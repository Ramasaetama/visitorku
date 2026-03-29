<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    
    <Topbar />

    <div class="flex flex-1 items-stretch">
      <Sidebar />
      
      <main class="flex-1 bg-[#F4F6F8] p-4">
        <div class="bg-white rounded-2xl shadow-sm h-full flex flex-col">
          <div class="p-6 flex-1 flex flex-col overflow-y-auto">
            
            <div class="mb-6">
              <h1 class="text-2xl font-semibold text-gray-800 mb-1">Profil Perusahaan</h1>
              <p class="text-sm text-gray-500">Kelola informasi profil perusahaan Anda</p>
            </div>

            <div class="max-w-225 mx-auto w-full">
              <div class="flex flex-col lg:flex-row gap-6 lg:gap-12 mb-10">
                <div class="lg:w-55 shrink-0">
                  <h2 class="text-[18px] font-semibold text-gray-900 mb-1">Profil</h2>
                  <p class="text-[13px] text-gray-500 leading-relaxed">Informasi ini digunakan sebagai identitas resmi perusahaan.</p>
                </div>
                <div class="flex-1 space-y-6">
                   <div class="flex items-start gap-4">
                      <div @click="openUploadModal('logo')" class="w-20 h-20 rounded-full bg-linear-to-br from-[#F5A623] to-[#E8920D] shrink-0 relative overflow-hidden cursor-pointer group shadow-md">
                        <img v-if="companyProfile.logoUrl" :src="companyProfile.logoUrl" alt="Logo" class="absolute inset-0 w-full h-full object-cover" />
                        <div v-else class="absolute inset-0 flex items-center justify-center"><span class="text-[30px] font-bold text-white">GM</span></div>
                        <div class="absolute bottom-0 left-0 right-0 h-[20%] bg-white/90 flex items-center justify-center group-hover:bg-white transition"><span class="text-[11px] font-semibold text-[#EE9D0F]">Ubah</span></div>
                      </div>
                      <div class="pt-1 space-y-0.5">
                        <p class="text-[12px] text-gray-500/70 ">• Ukuran gambar yang direkomendasi: lebar 800px, tinggi 400px</p>
                        <p class="text-[12px] text-gray-500/70">• Besar file maks.: 2.0MB</p>
                        <p class="text-[12px] text-gray-500/70">• Format gambar yang diterima : JPG,JPEG,PNG</p>
                      </div>
                   </div>
                   <div>
                    <label class="block text-[13px] font-medium text-gray-700 mb-2">Nama Perusahaan<span class="text-red-400">*</span></label>
                    <input v-model="companyProfile.name" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-xl text-[14px] text-gray-800 focus:outline-none focus:border-primary-500 transition" />
                   </div>
                   <div>
                    <label class="block text-[13px] font-medium text-gray-700 mb-2">Alamat Perusahan<span class="text-red-400">*</span></label>
                    <textarea v-model="companyProfile.address" class="w-full px-4 py-3 border border-gray-300 rounded-xl text-[14px] text-gray-800 focus:outline-none focus:border-primary-500 transition resize-y min-h-20" rows="3"></textarea>
                   </div>
                </div>
              </div>
              <hr class="border-gray-200 mb-10" />

              <div class="flex flex-col lg:flex-row gap-6 lg:gap-12 mb-10">
                <div class="lg:w-55 shrink-0">
                  <h2 class="text-[18px] font-semibold text-gray-900 mb-1">Warna Brand</h2>
                  <p class="text-[13px] text-gray-500 leading-relaxed">Pilih tema warna yang diinginkan</p>
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-3 bg-[#FEF3E2] px-4 py-3 rounded-xl w-fit">
                    <div class="w-10.5 h-10.5 rounded-full border border-gray-200 cursor-pointer relative overflow-hidden shrink-0" :style="{ backgroundColor: companyProfile.primaryColor }" @click="$refs.colorInput.click()">
                      <input ref="colorInput" v-model="companyProfile.primaryColor" type="color" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                    </div>
                    <div><span class="text-[14px] font-mono text-gray-700 tracking-wider">{{ (companyProfile.primaryColor || '#EE9D0F').replace('#', '').toUpperCase() }}</span></div>
                  </div>
                  <p class="text-[12px] text-gray-500 italic">Pastikan warna memiliki kontras yang cukup.</p>
                </div>
              </div>
              <hr class="border-gray-200 mb-10" />

              <div class="flex flex-col lg:flex-row gap-6 lg:gap-12 mb-10">
                <div class="lg:w-55 shrink-0">
                  <h2 class="text-[18px] font-semibold text-gray-900 mb-1">Sesuaikan Header</h2>
                  <p class="text-[13px] text-gray-500 leading-relaxed">Anda dapat menyesuaikan header sesuai identitas.</p>
                </div>
                <div class="flex-1">
                  <div class="w-full rounded-xl overflow-hidden relative cursor-pointer group" @click="openUploadModal('header')">
                    <div class="h-25 w-full bg-linear-to-r from-[#F7941D] to-[#F9A825] flex items-center justify-end px-6 transition-all" :style="companyProfile.headerBg ? { backgroundImage: `url(${companyProfile.headerBg})`, backgroundSize: '100% 100%', backgroundPosition: 'center' } : {}">
                    </div>
                  </div>
                  <p class="text-[12px] text-[#EE9D0F] mt-2 italic">Pastikan file menggunakan format PNG dengan latar transparan</p>
                </div>
              </div>
              <hr class="border-gray-200 mb-10" />

              <div class="flex flex-col lg:flex-row gap-6 lg:gap-12 mb-10">
                <div class="lg:w-55 shrink-0">
                  <h2 class="text-[18px] font-semibold text-gray-900 mb-1">Bahasa &amp; Wilayah</h2>
                  <p class="text-[13px] text-gray-500 leading-relaxed">Atur bahasa &amp; wilayah</p>
                </div>
                <div class="flex-1 space-y-5">
                  <div>                       
                    <label class="block text-[13px] font-medium text-gray-700 mb-2">Bahasa</label>
                    <div class="relative">
                      <select v-model="companyProfile.language" @change="autoSaveLangTz" class="w-full px-4 py-3 border border-gray-300 rounded-xl text-[14px] text-gray-800 bg-white appearance-none focus:outline-none focus:border-primary-500 transition pr-10">
                        <option value="Indonesia">Indonesia</option>
                        <option value="English">English</option>
                      </select>
                      <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </div>
                  </div>
                  <div>
                    <label class="block text-[13px] font-medium text-gray-700 mb-2">Timezone</label>
                    <div class="relative">
                      <select v-model="companyProfile.timezone" @change="autoSaveLangTz" class="w-full px-4 py-3 border border-gray-300 rounded-xl text-[14px] text-gray-800 bg-white appearance-none focus:outline-none focus:border-primary-500 transition pr-10">
                        <option value="Asia/Jakarta">Asia/Jakarta</option>
                        <option value="Asia/Makassar">Asia/Makassar</option>
                        <option value="Asia/Jayapura">Asia/Jayapura</option>
                      </select>
                      <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </div>
                  </div>
                </div>
              </div>
              <hr class="border-gray-200 mb-10" />

              <div class="mb-10">
                <div class="flex items-center justify-between mb-8">
                  <h2 class="text-[18px] font-semibold text-gray-900">API Access Token</h2>
                  <button @click="openTokenForm" class="inline-flex items-center gap-1.5 text-[#EE9D0F] text-[13px] font-medium hover:underline transition">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#EE9D0F" stroke-width="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" stroke-linecap="round" /></svg>
                    Generate API Token
                  </button>
                </div>
                
                <div v-if="existingTokens.length === 0" class="text-center py-12 px-6 bg-linear-to-b from-gray-50 to-white rounded-xl border border-dashed border-gray-200">
                  <div class="flex justify-center mb-4">
                    <img :src="nochathistory" alt="API Icon" class="w-50 h-50 object-contain opacity-80" />
                  </div>
                  <h3 class="text-[15px] font-semibold text-gray-800 mb-1.5">Generate token untuk memberikan akses API</h3>
                  <p class="text-[13px] text-gray-500 mb-6">Token digunakan sebagai akses API untuk kebutuhan integrasi sistem.</p>
                  
                  <button @click="openTokenForm" class="inline-flex items-center gap-2 px-6 py-2.5 border border-[#EE9D0F] text-[#EE9D0F] rounded-lg text-[13px] font-semibold bg-white hover:bg-[#FEF9F0] transition">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#EE9D0F" stroke-width="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" stroke-linecap="round" /></svg>
                    Generate API Token
                  </button>
                </div>

                <div v-else class="mt-4 max-h-112.5 overflow-y-auto pr-2 space-y-6">
                  <div v-for="(token, index) in existingTokens" :key="token.id" class="border border-gray-100 p-6 rounded-2xl bg-white shadow-sm relative">
                    <div class="flex justify-between items-start mb-3">
                      <h3 class="text-[15px] font-bold text-gray-900">{{ token.name }}</h3>
                      
                      <div class="relative">
                        <button @click="toggleTokenMenu(index)" class="text-gray-400 hover:text-gray-600 p-1 border border-transparent hover:border-gray-200 rounded transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                        </button>

                        <div v-if="activeMenuIndex === index" class="absolute right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-10 py-1 overflow-hidden min-w-fit">
                          <button @click="deleteToken(token.id, index)" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors whitespace-nowrap">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Hapus Token
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="bg-[#F4F7FF] rounded-lg px-5 py-4 mb-6 text-[13px] text-gray-700 font-mono break-all leading-relaxed">
                      {{ token.token }}
                    </div>

                    <div class="mb-8">
                      <p class="text-[12px] text-gray-400 mb-1">Scope</p>
                      <div v-if="token.scopes && token.scopes.length > 0">
                         <span class="text-[14px] font-bold text-gray-900">
                           {{ token.scopes.join(', ') }}
                         </span>
                      </div>
                       <p v-else class="text-[14px] font-bold text-gray-900">-</p>
                    </div>

                    <div class="inline-block bg-[#F9FAFB] px-3 py-1.5 rounded-md text-[12px] text-gray-500">
                       Dibuat oleh <span class="font-bold text-gray-800">Admin</span> pada {{ token.createdAt }}
                     </div>
                  </div>
                </div> <div class="flex justify-end pt-8 pb-4 border-t border-gray-100 mt-10">
                  <button 
                    @click="saveProfile" 
                    :disabled="isSaving"
                    class="px-8 py-3.5 bg-[#EE9D0F] hover:bg-[#d6850d] text-white rounded-xl text-[14px] font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg v-if="isSaving" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    
                    {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
                  </button>
                </div>
              </div> 
            </div>
          </div>
        </div>
      </main>
    </div>

    <ImageUploadModal
      :isOpen="showUploadModal"
      :title="modalTitle"
      :description="modalDescription"
      @close="showUploadModal = false"
      @confirm="handleImageConfirm"
    />

    <Modal
      :show="showFormModal"
      title="Generate API Token"
      width="half"
      @close="showFormModal = false"
    >
      <div class="space-y-6 pt-2 pb-6 font-poppins">
        
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Name<span class="text-red-500">*</span>
          </label>
          <input 
            v-model="tokenForm.name"
            type="text" 
            placeholder="Type a name"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F7941D]/20 focus:border-[#F7941D] transition"
          />
        </div>

        <div>
          <h3 class="text-base font-semibold text-gray-900 mb-1">API Scopes</h3>
          <p class="text-xs text-gray-500 mb-4">Lorem Ipsum is simply dummy text</p>

          <div class="space-y-2">
            <div v-for="(scope, index) in availableScopes" :key="scope.id" class="border-b border-gray-100 pb-4 last:border-0">
              
              <div class="flex items-start justify-between">
                <div class="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    v-model="scope.checked" 
                    @change="handleParentCheckbox(index)" 
                    class="mt-1 w-4 h-4 rounded border-gray-300 text-[#3B82F6] focus:ring-[#3B82F6] accent-[#3B82F6] cursor-pointer" 
                  />
                  <div>
                    <span class="block text-sm font-semibold text-gray-700">{{ scope.label }}</span>
                    <span class="block text-xs text-gray-400 mt-0.5">{{ scope.desc }}</span>
                  </div>
                </div>
                
                <button @click="toggleScope(index)" class="text-xs font-semibold text-[#F7941D] hover:text-[#d68516] flex items-center gap-1 transition-colors">
                  {{ scope.isOpen ? 'Tutup' : 'Buka' }}
                  <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': scope.isOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
              </div>

              <div v-if="scope.isOpen" class="mt-3 pl-8 space-y-3">
                <div v-for="perm in scope.permissions" :key="perm.id" class="flex items-start gap-3">
                    <input type="checkbox" v-model="perm.checked" @change="handleChildCheckbox(index)" class="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#3B82F6] focus:ring-[#3B82F6] accent-[#3B82F6] cursor-pointer" />
                    <div>
                       <span class="block text-sm font-semibold text-gray-700">{{ perm.label }}</span>
                       <span class="block text-xs text-gray-400">{{ perm.desc }}</span>
                    </div>
                </div>
                <div v-if="scope.isSensitive" class="mt-4 bg-[#FFF8E6] px-4 py-3 rounded-lg flex items-center gap-2 border border-[#FFEAC2]">
                  <svg class="w-5 h-5 text-[#F7941D] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span class="text-xs text-[#d68516] font-medium">Scope ini mengakses data sensitif perusahaan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3 w-full pt-4">
          <button @click="showFormModal = false" class="px-8 py-3 text-sm font-semibold text-[#F7941D] bg-white border-2 border-[#F7941D] hover:bg-[#FFF9F0] rounded-full transition-colors">
            Cancel
          </button>
          <button @click="processGenerate" class="px-8 py-3 text-sm font-semibold text-white bg-[#F7941D] hover:bg-[#E8850E] rounded-full transition-colors shadow-md">
            Generate Token
          </button>
        </div>
      </template>
    </Modal>

    <div v-if="showLoadingModal" class="fixed inset-0 z-60 flex items-center justify-center p-4 font-['Poppins']">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-175 p-12 flex flex-col items-center text-center"> 
          <div class="mb-8">
            <img :src="nochathistory" alt="Loading Illustration" class="w-35 h-35 object-contain opacity-90 mx-auto" />
          </div>
          <div class="flex items-center gap-4 mb-8">
            <svg class="animate-spin w-8 h-8 text-[#F7941D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h3 class="text-[20px] font-semibold text-gray-800">Generate Token...</h3>
          </div>
          <div class="w-full px-8">
            <div class="h-14 w-full bg-gray-100 rounded-lg animate-pulse mb-6"></div>
              <div class="w-full space-y-3">
                <div class="h-3 w-3/4 bg-gray-100 rounded-full animate-pulse mx-auto"></div>
                <div class="h-3 w-1/2 bg-gray-100 rounded-full animate-pulse mx-auto"></div>
              </div>
            </div>
        </div>
    </div>

    
    <div v-if="showSuccessModal" class="fixed inset-0 z-60 flex items-center justify-center p-4 font-['Poppins']">
      
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showSuccessModal = false"></div>
      
      <div class="relative bg-white rounded-3xl shadow-xl w-full max-w-177.5 p-12 flex flex-col items-center text-center">
        
        <button @click="showSuccessModal = false" class="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 transition">
             <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
             </svg>
        </button>

        <div class="mb-6">
            <img :src="nochathistory" alt="Success Illustration" class="w-35 h-35 object-contain opacity-90 mx-auto" />
        </div>

        <h3 class="text-[24px] font-bold text-gray-900 mb-2">Token Berhasil Dibuat</h3>
        
        <p class="text-[15px] text-gray-500 mb-8">
          Silakan salin token di bawah ini dan simpan dengan aman.
        </p>

        <div class="w-full bg-[#F4F7FF] border border-[#E0E7FF] rounded-xl p-5 flex items-center justify-between gap-4 mb-8">
           <code class="text-[15px] text-gray-800 font-medium font-mono truncate select-all">
             {{ generatedToken }}
           </code>
           
           <button 
             @click="copyToken"
             class="shrink-0 p-2 text-gray-400 hover:text-[#EE9D0F] transition-colors"
             title="Salin Token"
           >
              <svg v-if="!isCopied" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 01-2-2V5a2 2 0 012-2h4.586" />
              </svg>
              <svg v-else class="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
           </button>
        </div>

        <div class="text-left w-full px-2">
            <p class="text-[13px] text-gray-500 leading-relaxed">
                <span class="font-bold text-gray-800">Penting:</span> API Access Token ini tidak akan ditampilkan kembali setelah modal ditutup. Jika Anda kehilangan token ini, Anda perlu membuat token baru.
            </p>
        </div>
      </div>
    </div>   
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import ImageUploadModal from '@/components/ImageUploadModal.vue';
import Modal from '@/components/common/Modal.vue';
import { confirmDelete, showSuccess, showError } from '@/utils/alertHelper'; // Import fungsinya
import { getProfile, updateProfile, uploadCompanyLogo, uploadCompanyBackground, updateLanguageTimezone, generateAPItoken, getCompanyApiKey, deleteApiKey} from '@/services/companyProfileService';
import Topbar from '@/components/Topbar.vue';
import headerbg from '@/assets/Header.svg';
import nochathistory from '@/assets/NoChatHistory.svg';

// Hapus email & phone karena itu milik Admin
const companyProfile = ref({
  id: '', 
  name: '',
  address: '',
  primaryColor: '',
  headerBg: headerbg,
  logoUrl: null, 
  language: localStorage.getItem('app_lang') || 'Indonesia',
  timezone: localStorage.getItem('app_tz') || 'Asia/Jakarta',
  apiToken: null
});

const isLoadingData = ref(true);
const isSaving = ref(false);

const showUploadModal = ref(false);
const uploadType = ref('logo'); 

const showFormModal = ref(false);  
const showLoadingModal = ref(false); 
const showSuccessModal = ref(false);
const generatedToken = ref('');
const isCopied = ref(false);

const existingTokens = ref([]); 
const activeMenuIndex = ref(null);

const toggleTokenMenu = (index) => {
  activeMenuIndex.value = activeMenuIndex.value === index ? null : index;
};

const tokenForm = ref({
  name: '',
  scopes: []
});

const availableScopes = ref([
  { id: 'branch', label: 'Branch', desc: 'Digunakan untuk mengelola data cabang perusahaan', isOpen: false, isSensitive: true, checked: false, permissions: [ { id: 'get', label: 'Get', desc: 'Get all branch', checked: false }, { id: 'post', label: 'Post', desc: 'Add branch', checked: false }, { id: 'put', label: 'Put', desc: 'Update branch', checked: false }, { id: 'delete', label: 'Delete', desc: 'Delete branch', checked: false }, ] },
  { id: 'category', label: 'Category', desc: 'Digunakan untuk membaca kategori kunjungan', isOpen: false, checked: false, permissions: [ { id: 'get', label: 'Get', desc: 'Get all category', checked: false }, { id: 'post', label: 'Post', desc: 'Add category', checked: false }, { id: 'put', label: 'Put', desc: 'Update category', checked: false }, { id: 'delete', label: 'Delete', desc: 'Delete category', checked: false }, ] },
  { id: 'event', label: 'Event', desc: 'Digunakan untuk proses check-in & check-out', isOpen: false, checked: false, permissions: [ { id: 'get', label: 'Get', desc: 'Get all event', checked: false }, { id: 'post', label: 'Post', desc: 'Add event', checked: false }, { id: 'put', label: 'Put', desc: 'Update event', checked: false }, { id: 'delete', label: 'Delete', desc: 'Delete event', checked: false }, ] },
  { id: 'signage', label: 'Signage', desc: 'Digunakan untuk mengelola konten signage', isOpen: false, checked: false, permissions: [ { id: 'get', label: 'Get', desc: 'Get all signage', checked: false }, { id: 'post', label: 'Post', desc: 'Add signage', checked: false }, { id: 'put', label: 'Put', desc: 'Update signage', checked: false }, { id: 'delete', label: 'Delete', desc: 'Delete signage', checked: false }, ] },
  { id: 'visit', label: 'Visit', desc: 'Digunakan untuk mengambil data kunjungan', isOpen: false, checked: false, permissions: [ { id: 'get', label: 'Get', desc: 'Get all visit', checked: false }, { id: 'post', label: 'Post', desc: 'Add visit', checked: false }, { id: 'put', label: 'Put', desc: 'Update visit', checked: false }, { id: 'delete', label: 'Delete', desc: 'Delete visit', checked: false }, ] },
  { id: 'visitor', label: 'Visitor', desc: 'Digunakan untuk mengambil data pengunjung', isOpen: false, checked: false, permissions: [ { id: 'get', label: 'Get', desc: 'Get all visitor', checked: false }, { id: 'post', label: 'Post', desc: 'Add visitor', checked: false }, { id: 'put', label: 'Put', desc: 'Update visitor', checked: false }, { id: 'delete', label: 'Delete', desc: 'Delete visitor', checked: false }, ] }
]);

const modalTitle = computed(() => { return uploadType.value === 'logo' ? 'Ubah Logo' : 'Sesuaikan Header'; });
const modalDescription = computed(() => { return uploadType.value === 'logo' ? 'Format yang diterima: <span class="font-medium text-[#EE9D0F]">JPG</span> • <span class="font-medium text-[#EE9D0F]">JPEG</span> • <span class="font-medium text-[#EE9D0F]">PNG</span> (Maks 2MB)' : 'Dimensi yang disarankan: <span class="font-medium text-[#EE9D0F]">1920 x 240px</span>, format PNG transparan, maksimal 2 MB'; });

const fetchProfileData = async () => {
  isLoadingData.value = true;
  try {
    const response = await getProfile();
    const companyData = response.data || response;

    companyProfile.value.id = companyData.company_id || companyData.id || '';
    companyProfile.value.name = companyData.name || companyData.company_name || '';
    companyProfile.value.address = companyData.address || '';
    companyProfile.value.logoUrl = companyData.picture_url || companyData.logo || null; 
    companyProfile.value.headerBg = companyData.background_url || companyData.background || headerbg;
    companyProfile.value.primaryColor = companyData.brand_color || companyData.primary_color || '';
    
    if (companyData.language) {
      companyProfile.value.language = companyData.language;
      localStorage.setItem('app_lang', companyData.language);
    }
    if (companyData.timezone) {
      companyProfile.value.timezone = companyData.timezone;
      localStorage.setItem('app_tz', companyData.timezone);
    }
    
  } catch (error) {
    console.error('Gagal memuat profil perusahaan:', error);
  } finally {
    isLoadingData.value = false;
  }
};

const parseScopes = (settingDataString) => {
  try {
    if (!settingDataString) return [];
    const parsedData = typeof settingDataString === 'string' ? JSON.parse(settingDataString) : settingDataString;
    return parsedData.map(item => {
      const parts = item.url_point.split('/');
      const scopeName = parts[parts.length - 1]; 
      return scopeName.charAt(0).toUpperCase() + scopeName.slice(1); 
    });
  } catch (error) {
    return [];
  }
};

const fetchApiKeyData = async () => {
  try {
    const response = await getCompanyApiKey();
    const tokenList = response.data;

    if (Array.isArray(tokenList) && tokenList.length > 0) {
      existingTokens.value = tokenList.map(tokenData => ({
        id: tokenData.id,
        name: tokenData.name || 'API Key',
        token: tokenData.key || '********************************',
        scopes: parseScopes(tokenData.setting_data),
        createdAt: tokenData.created_at ? new Date(tokenData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Sudah Dibuat'
      }));
    } else {
      existingTokens.value = []; 
    }
  } catch (error) {
    existingTokens.value = [];
  }
};

onMounted(() => {
  fetchProfileData();
  fetchApiKeyData();
});

const saveProfile = async () => {
  isSaving.value = true;
  try {
    if (!companyProfile.value.id) {
      alert('Gagal menyimpan: ID Perusahaan tidak ditemukan.');
      isSaving.value = false;
      return;
    }

    const payloadProfile = {
      name: companyProfile.value.name,
      address: companyProfile.value.address,
      // Hapus pengiriman email & phone karena ini endpoint company
    };
    
    // TEMBAK KE ENDPOINT COMPANY
    await updateProfile(companyProfile.value.id, payloadProfile);

    const payloadLangTz = {
      language: companyProfile.value.language,
      timezone: companyProfile.value.timezone
    };
    await updateLanguageTimezone(companyProfile.value.id, payloadLangTz);
    
    alert('Seluruh perubahan profil perusahaan berhasil disimpan!');
    
  } catch (error) {
    console.error('Gagal menyimpan profil perusahaan:', error);
    
    const errorData = error.response?.data;
    if (error.response?.status === 422) {
      const pesanValidasi = errorData.errors ? JSON.stringify(errorData.errors, null, 2) : errorData.message;
      alert("Gagal Disimpan! Backend menolak karena:\n\n" + pesanValidasi);
    } else {
      alert(errorData?.message || 'Terjadi kesalahan saat menyimpan perubahan.');
    }
  } finally {
    isSaving.value = false;
  }
};

const openTokenForm = () => {
  tokenForm.value.name = ''; 
  availableScopes.value.forEach(scope => {
    scope.checked = false;
    scope.permissions.forEach(perm => perm.checked = false);
  });
  showFormModal.value = true;
};

const toggleScope = (index) => { availableScopes.value[index].isOpen = !availableScopes.value[index].isOpen; };
const handleParentCheckbox = (index) => { const scope = availableScopes.value[index]; scope.permissions.forEach(perm => perm.checked = scope.checked); };
const handleChildCheckbox = (index) => { const scope = availableScopes.value[index]; const allChecked = scope.permissions.every(perm => perm.checked); scope.checked = allChecked; };

const processGenerate = async () => {
  if (!tokenForm.value.name) { alert('Nama token wajib diisi!'); return; }
  
  showFormModal.value = false;
  showLoadingModal.value = true;

  try {
    const formattedSettingData = [];
    availableScopes.value.forEach(scope => {
      const checkedMethods = scope.permissions.filter(perm => perm.checked).map(perm => perm.label.toUpperCase()); 
      if (checkedMethods.length > 0) {
        formattedSettingData.push({ method: checkedMethods, url_point: `/integration/${scope.id}` });
      }
    });

    const payload = { name: tokenForm.value.name, setting_data: formattedSettingData };
    const response = await generateAPItoken(payload);
    generatedToken.value = response.data.key; 
    
    isCopied.value = false;
    showLoadingModal.value = false;
    showSuccessModal.value = true;
    
    existingTokens.value.unshift({
        id: response.data.id, 
        name: response.data.name,
        token: response.data.key,
        scopes: availableScopes.value.filter(s => s.checked).map(s => s.label),
        createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
    });
  } catch (error) {
    showLoadingModal.value = false;
    alert(error.response?.data?.message || 'Terjadi kesalahan saat membuat API Token');
  }
};

const copyToken = async () => {
  try {
    await navigator.clipboard.writeText(generatedToken.value);
    isCopied.value = true;
    setTimeout(() => { isCopied.value = false; }, 2000);
  } catch (err) {}
};

const openUploadModal = (type) => { uploadType.value = type; showUploadModal.value = true; };

const handleImageConfirm = async (data) => {
  if (uploadType.value === 'logo') {
    companyProfile.value.logoUrl = data.previewUrl;
    if (data.file) {
      try {
        await uploadCompanyLogo(data.file);
        alert('Logo berhasil diperbarui di server!');
      } catch (error) { alert('Terjadi kesalahan saat mengunggah logo.'); }
    }
  } else if (uploadType.value === 'header') {
    companyProfile.value.headerBg = data.previewUrl;
    if (data.file) {
      try {
        await uploadCompanyBackground(data.file);
        alert('Background header berhasil diperbarui di server!');
      } catch (error) { alert('Terjadi kesalahan saat mengunggah background.'); }
    }
  }
};

const autoSaveLangTz = async () => {
  if (!companyProfile.value.id) return;
  try {
    const payloadLangTz = { language: companyProfile.value.language, timezone: companyProfile.value.timezone };
    localStorage.setItem('app_lang', companyProfile.value.language);
    localStorage.setItem('app_tz', companyProfile.value.timezone);
    await updateLanguageTimezone(companyProfile.value.id, payloadLangTz);
  } catch (error) {}
};

const deleteToken = async (id, index) => {
  if (!id) { 
    showError('ID Token tidak valid.'); 
    return; 
  }

  const isConfirmed = await confirmDelete('API Token');

  if (isConfirmed) {
    try {
      await deleteApiKey(id);
      existingTokens.value.splice(index, 1);
      activeMenuIndex.value = null; 
      
      showSuccess('API Token berhasil dihapus dari server!');
      
    } catch (error) {
      showError(error.response?.data?.message || 'Terjadi kesalahan saat mencoba menghapus token.');
    }
  }
};
</script>

<style scoped>
  textarea {resize: vertical;}
</style>