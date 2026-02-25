<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    
    <header class="relative bg-linear-to-r from-[#F7941D] to-[#F9A825] h-14 flex items-center justify-between px-6 overflow-hidden">
      <div 
        
        class="absolute inset-0" 
        :style="{ 
          backgroundImage: `url(${patternBg})`, 
          backgroundRepeat: 'repeat-x', 
          backgroundSize: 'auto 100%',
          backgroundPosition: 'center',
          opacity: 0.5
        }"
      ></div>
      <div class="relative z-10 flex items-center gap-2">
        <router-link to="/dashboard" class="cursor-pointer hover:opacity-80 transition-opacity">
          <img :src="visitorkulogo" alt="Visitorku" class="h-7" />
        </router-link>
      </div>
      <div class="relative z-10 flex items-center gap-4">
        <button class="p-1.5 rounded-full hover:bg-white/20 transition">
          <img :src="globeIcon" alt="Language" class="w-5 h-5" />
        </button>
        <div class="flex items-center gap-2.5 cursor-pointer">
          <span class="text-white text-[14px] font-medium">{{'Admin' }}</span>
          
          <img 
            :src="companyProfile.logoUrl || adminprofile"
            alt="Profile" 
            class="w-9 h-9 rounded-full object-cover border-2 border-white/50" 
          />
          
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="text-white">
            <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
    </header>

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
                        <div class="absolute bottom-0 left-0 right-0 h-[20%] bg-white/40 flex items-center justify-center group-hover:bg-white/55 transition"><span class="text-[11px] font-semibold text-[#EE9D0F]">Ubah</span></div>
                      </div>
                      <div class="pt-1 space-y-0.5">
                        <p class="text-[12px] text-gray-500">• Ukuran gambar yang direkomendasi: lebar 800px, tinggi 400px</p>
                        <p class="text-[12px] text-gray-500">• Format gambar yang diterima : JPG,JPEG,PNG</p>
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
                    <div class="w-10.5 h-10.5 rounded-full border border-gray-200 cursor-pointer relative overflow-hidden shrink-0" :style="{ backgroundColor: companyProfile.brandColor }" @click="$refs.colorInput.click()">
                      <input ref="colorInput" v-model="companyProfile.brandColor" type="color" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                    </div>
                    <div><span class="text-[14px] font-mono text-gray-700 tracking-wider">{{ (companyProfile.brandColor || '#EE9D0F').replace('#', '').toUpperCase() }}</span></div>
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
                
                <div v-if="!existingToken" class="text-center py-12 px-6 bg-linear-to-b from-gray-50 to-white rounded-xl border border-dashed border-gray-200">
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

                <div v-else class="mt-4">
                  <div class="flex justify-between items-start mb-3">
                    <h3 class="text-[15px] font-bold text-gray-900">{{ existingToken.name }}</h3>
                    <div class="relative">
                      <button @click="showTokenMenu = !showTokenMenu" class="text-gray-400 hover:text-gray-600 p-1 border border-transparent hover:border-gray-200 rounded transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                      </button>

                      <div v-if="showTokenMenu" class="absolute right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-10 py-1 overflow-hidden min-w-fit">
                        <button @click="deleteToken" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors whitespace-nowrap">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Hapus Token
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="bg-[#F4F7FF] rounded-lg px-5 py-4 mb-6 text-[13px] text-gray-700 font-mono break-all leading-relaxed">
                    {{ existingToken.token }}
                  </div>

                  <div class="mb-8">
                    <p class="text-[12px] text-gray-400 mb-1">Scope</p>
                    <div v-if="existingToken.scopes.length > 0">
                       <span class="text-[14px] font-bold text-gray-900">
                         {{ existingToken.scopes.join(', ') }}
                       </span>
                    </div>
                     <p v-else class="text-[14px] font-bold text-gray-900">-</p>
                  </div>

                  <div class="inline-block bg-[#F9FAFB] px-3 py-1.5 rounded-md text-[12px] text-gray-500">
                     Dibuat oleh <span class="font-bold text-gray-800">Admin</span> {{ existingToken.createdAt }}
                   </div>
                   
                   <hr class="border-gray-100 mt-8" />
                </div>

              </div>
              <div class="flex justify-end pb-4">
                <button @click="saveProfile" class="px-8 py-3 bg-[#D8D5D3] hover:bg-[#c5c2c0] text-[#B3ADA9] rounded-xl text-[14px] font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
                  Simpan Perubahan
                </button>
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
import { ref, computed, onMounted } from 'vue'; // Tambahkan onMounted
import Sidebar from '@/components/Sidebar.vue';
import ImageUploadModal from '@/components/ImageUploadModal.vue';
import Modal from '@/components/common/Modal.vue';
import { getProfile, updateProfile, uploadCompanyLogo, uploadCompanyBackground, updateLanguageTimezone,generateAPItoken, getCompanyApiKey, deleteApiKey} from '@/services/profileService';

import visitorkulogo from '@/assets/visitorku.png';
import patternBg from '@/assets/Frame 7.svg';
import globeIcon from '@/assets/proicons_globe.svg';
import adminprofile from '@/assets/adminprofile.png';
import nochathistory from '@/assets/NoChatHistory.svg';
import headerbg from '@/assets/Header.svg';

const companyProfile = ref({
  id: '', 
  name: '',
  address: '',
  brandColor: '#EE9D0F',
  headerBg: headerbg,
  logoUrl: null, 
  language: localStorage.getItem('app_lang') || 'Indonesia',
  timezone: localStorage.getItem('app_tz') || 'Asia/Jakarta',
  apiToken: null
});

const isLoadingData = ref(true); // State loading untuk mengambil data
const isSaving = ref(false); // State loading saat klik simpan

const showUploadModal = ref(false);
const uploadType = ref('logo'); 

const showFormModal = ref(false);  
const showLoadingModal = ref(false); 
const showSuccessModal = ref(false);
const generatedToken = ref('');
const isCopied = ref(false);
const existingToken = ref(null);

const tokenForm = ref({
  name: '',
  scopes: []
});

const availableScopes = ref([
  {
    id: 'branch',
    label: 'Branch',
    desc: 'Digunakan untuk mengelola data cabang perusahaan',
    isOpen: false,
    isSensitive: true, 
    checked: false,
    permissions: [
      { id: 'get', label: 'Get', desc: 'Get all branch', checked: false },
      { id: 'post', label: 'Post', desc: 'Add branch', checked: false },
      { id: 'put', label: 'Put', desc: 'Update branch', checked: false },
      { id: 'delete', label: 'Delete', desc: 'Delete branch', checked: false },
    ]
  },
  {
    id: 'category',
    label: 'Category',
    desc: 'Digunakan untuk membaca kategori kunjungan',
    isOpen: false,
    checked: false,
    permissions: [
      { id: 'get', label: 'Get', desc: 'Get all category', checked: false },
      { id: 'post', label: 'Post', desc: 'Add category', checked: false },
      { id: 'put', label: 'Put', desc: 'Update category', checked: false },
      { id: 'delete', label: 'Delete', desc: 'Delete category', checked: false },
    ]
  },
  {
    id: 'event',
    label: 'Event',
    desc: 'Digunakan untuk proses check-in & check-out',
    isOpen: false,
    checked: false,
    permissions: [
      { id: 'get', label: 'Get', desc: 'Get all event', checked: false },
      { id: 'post', label: 'Post', desc: 'Add event', checked: false },
      { id: 'put', label: 'Put', desc: 'Update event', checked: false },
      { id: 'delete', label: 'Delete', desc: 'Delete event', checked: false },
    ]
  },
  {
    id: 'signage',
    label: 'Signage',
    desc: 'Digunakan untuk mengelola konten signage',
    isOpen: false,
    checked: false,
    permissions: [
      { id: 'get', label: 'Get', desc: 'Get all signage', checked: false },
      { id: 'post', label: 'Post', desc: 'Add signage', checked: false },
      { id: 'put', label: 'Put', desc: 'Update signage', checked: false },
      { id: 'delete', label: 'Delete', desc: 'Delete signage', checked: false },
    ]
  },
  {
    id: 'visit',
    label: 'Visit',
    desc: 'Digunakan untuk mengambil data kunjungan',
    isOpen: false,
    checked: false,
    permissions: [
      { id: 'get', label: 'Get', desc: 'Get all visit', checked: false },
      { id: 'post', label: 'Post', desc: 'Add visit', checked: false },
      { id: 'put', label: 'Put', desc: 'Update visit', checked: false },
      { id: 'delete', label: 'Delete', desc: 'Delete visit', checked: false },
    ]
  },
  {
    id: 'visitor',
    label: 'Visitor',
    desc: 'Digunakan untuk mengambil data pengunjung',
    isOpen: false,
    checked: false,
    permissions: [
      { id: 'get', label: 'Get', desc: 'Get all visitor', checked: false },
      { id: 'post', label: 'Post', desc: 'Add visitor', checked: false },
      { id: 'put', label: 'Put', desc: 'Update visitor', checked: false },
      { id: 'delete', label: 'Delete', desc: 'Delete visitor', checked: false },
    ]
  }
]);

const modalTitle = computed(() => {
  return uploadType.value === 'logo' ? 'Ubah Logo' : 'Sesuaikan Header';
});

const modalDescription = computed(() => {
  if (uploadType.value === 'logo') {
    return 'Format yang diterima: <span class="font-medium text-[#EE9D0F]">JPG</span> • <span class="font-medium text-[#EE9D0F]">JPEG</span> • <span class="font-medium text-[#EE9D0F]">PNG</span> (Maks 2MB)';
  } else {
    return 'Dimensi yang disarankan: <span class="font-medium text-[#EE9D0F]">1920 x 240px</span>, format PNG transparan, maksimal 2 MB';
  }
});

// ==========================================
// 1. FUNGSI UNTUK MENGAMBIL DATA (GET API)
// ==========================================

const fetchProfileData = async () => {
  isLoadingData.value = true;
  try {
    const response = await getProfile();
    const dataDariServer = response.data;

    // TANGKAP ID PERUSAHAAN (Sangat penting untuk endpoint update bahasa)
    companyProfile.value.id = dataDariServer.company_id || dataDariServer.id || '';

    // Tangkap data lainnya seperti biasa
    companyProfile.value.name = dataDariServer.name || dataDariServer.company_name || '';
    companyProfile.value.address = dataDariServer.address || '';
    companyProfile.value.logoUrl = dataDariServer.picture_url || dataDariServer.logo || null; 
    companyProfile.value.headerBg = dataDariServer.background_url || dataDariServer.background || headerbg;
    companyProfile.value.brandColor = dataDariServer.brand_color || '#EE9D0F';
    
    // TANGKAP BAHASA & TIMEZONE
    if (dataDariServer.language) {
      companyProfile.value.language = dataDariServer.language;
      localStorage.setItem('app_lang', dataDariServer.language); // Sinkronkan
    }
    if (dataDariServer.timezone) {
      companyProfile.value.timezone = dataDariServer.timezone;
      localStorage.setItem('app_tz', dataDariServer.timezone); // Sinkronkan
    }
    
  } catch (error) {
    console.error('Gagal memuat profil:', error);
  } finally {
    isLoadingData.value = false;
  }
};

// ==========================================
// 1. FUNGSI PEMBANTU (Taruh di atas)
// ==========================================
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
    console.error('Gagal membaca scope:', error);
    return [];
  }
};

// ==========================================
// 2. FUNGSI UTAMA (Taruh di bawah fungsi pembantu)
// ==========================================
const fetchApiKeyData = async () => {
  try {
    const response = await getCompanyApiKey();
    const tokenList = response.data.results;

    if (Array.isArray(tokenList) && tokenList.length > 0) {
      const tokenData = tokenList[0];

      existingToken.value = {
        id: tokenData.id,
        name: tokenData.name || 'API Key',
        token: tokenData.key || '********************************',
        scopes: parseScopes(tokenData.setting_data), // <--- Sekarang Vue sudah kenal siapa parseScopes
        createdAt: tokenData.created_at 
            ? new Date(tokenData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
            : 'Sudah Dibuat'
      };
      
    } else {
      existingToken.value = null; 
    }

  } catch (error) {
    console.error('Gagal memuat token saat refresh:', error);
    existingToken.value = null;
  }
};

// JALANKAN OTOMATIS SAAT HALAMAN DIBUKA
onMounted(() => {
  fetchProfileData();
  fetchApiKeyData();
});

// ==========================================
// FUNGSI UNTUK MENYIMPAN DATA (PUT API)
// ==========================================
const saveProfile = async () => {
  isSaving.value = true;
  try {
    // 1. Payload untuk API Update Profil Utama (Nama & Alamat)
    const payloadProfile = {
      name: companyProfile.value.name,
      address: companyProfile.value.address,
      // brand_color: companyProfile.value.brandColor,
    };
    
    // Tembak API Update Profil Utama
    await updateProfile(payloadProfile);

    // 2. Payload untuk API Update Bahasa & Timezone
    // (Hanya dijalankan jika ID perusahaan berhasil didapatkan)
    if (companyProfile.value.id) {
      const payloadLangTz = {
        language: companyProfile.value.language,
        timezone: companyProfile.value.timezone
      };
      
      // Tembak API Update Bahasa menggunakan ID
      await updateLanguageTimezone(companyProfile.value.id, payloadLangTz);
    }
    
    alert('Seluruh perubahan profil berhasil disimpan!');
    
  } catch (error) {
    console.error('Gagal menyimpan profil:', error);
    const pesanError = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan perubahan.';
    alert(pesanError);
  } finally {
    isSaving.value = false;
  }
};


// ==========================================
// FUNGSI TOKEN & LAINNYA (TETAP SAMA)
// ==========================================
const openTokenForm = () => {
  tokenForm.value.name = ''; 
  availableScopes.value.forEach(scope => {
    scope.checked = false;
    scope.permissions.forEach(perm => perm.checked = false);
  });
  showFormModal.value = true;
};

const toggleScope = (index) => {
  availableScopes.value[index].isOpen = !availableScopes.value[index].isOpen;
};

const handleParentCheckbox = (index) => {
  const scope = availableScopes.value[index];
  scope.permissions.forEach(perm => perm.checked = scope.checked);
};

const handleChildCheckbox = (index) => {
  const scope = availableScopes.value[index];
  const allChecked = scope.permissions.every(perm => perm.checked);
  scope.checked = allChecked;
};

const processGenerate = async () => {
  if (!tokenForm.value.name) {
    alert('Nama token wajib diisi!');
    return;
  }
  
  showFormModal.value = false;
  showLoadingModal.value = true;

  try {
    // 1. Siapkan wadah untuk setting_data
    const formattedSettingData = [];

    // 2. Looping data scopes (Branch, Category, dll) dari checkbox Anda
    availableScopes.value.forEach(scope => {
      // Cari permission apa saja yang dicentang (Get, Post, Put, Delete)
      const checkedMethods = scope.permissions
        .filter(perm => perm.checked)
        .map(perm => perm.label.toUpperCase()); // Ubah jadi huruf besar (GET, POST, dll)

      // Jika ada minimal 1 method yang dicentang, masukkan ke array
      if (checkedMethods.length > 0) {
        formattedSettingData.push({
          method: checkedMethods,
          // Asumsi url_point disesuaikan dengan id scope. 
          // (Tanyakan ke Backend untuk URL pastinya, misalnya /integration/branch)
          url_point: `/integration/${scope.id}` 
        });
      }
    });

    // 3. Gabungkan menjadi payload utuh sesuai permintaan Swagger
    const payload = {
      name: tokenForm.value.name,
      setting_data: formattedSettingData
    };

    // 4. Tembak API-nya
    const response = await generateAPItoken(payload);

    console.log('Isi balasan dari server:', response.data);

    // 5. Tangkap Token yang dikembalikan server dari properti 'key'
      generatedToken.value = response.data.key; 
    
    // Reset state & tampilkan modal sukses
    isCopied.value = false;
    showLoadingModal.value = false;
    showSuccessModal.value = true;
    
    // Simpan ke tampilan existing token di layar
    existingToken.value = {
        id: response.data.id, // <--- SANGAT PENTING: Kita simpan ID-nya untuk fitur Delete nanti!
        name: response.data.name,
        token: response.data.key, // Tampilkan token dari 'key'
        scopes: availableScopes.value.filter(s => s.checked).map(s => s.label),
        createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
    };

    // Fungsi untuk menerjemahkan setting_data dari server menjadi array scope
    const parseScopes = (settingDataString) => {
      try {
        if (!settingDataString) return [];
        
        // Ubah teks string dari server menjadi format JSON (Array/Object)
        const parsedData = typeof settingDataString === 'string' ? JSON.parse(settingDataString) : settingDataString;
        
        // Ambil bagian belakang dari URL (misal: "/integration/branch" -> "Branch")
        return parsedData.map(item => {
          const parts = item.url_point.split('/');
          const scopeName = parts[parts.length - 1]; 
          return scopeName.charAt(0).toUpperCase() + scopeName.slice(1); // Kapital huruf pertama
        });
      } catch (error) {
        console.error('Gagal membaca scope:', error);
        return [];
      }
    };

  } catch (error) {
    showLoadingModal.value = false;
    console.error('Gagal generate token:', error);
    alert(error.response?.data?.message || 'Terjadi kesalahan saat membuat API Token');
  }
};

const copyToken = async () => {
  try {
    await navigator.clipboard.writeText(generatedToken.value);
    isCopied.value = true;
    setTimeout(() => { isCopied.value = false; }, 2000);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};

const openUploadModal = (type) => {
  uploadType.value = type;
  showUploadModal.value = true;
};

const handleImageConfirm = async (data) => {
  // 1. JIKA YANG DI-UPLOAD ADALAH LOGO
  if (uploadType.value === 'logo') {
    companyProfile.value.logoUrl = data.previewUrl;
    
    if (data.file) {
      try {
        await uploadCompanyLogo(data.file);
        alert('Logo berhasil diperbarui di server!');
      } catch (error) {
        console.error('Gagal mengunggah logo:', error);
        alert('Terjadi kesalahan saat mengunggah logo.');
      }
    }
  } 
  
  // 2. JIKA YANG DI-UPLOAD ADALAH HEADER/BACKGROUND
  else if (uploadType.value === 'header') {
    // Tampilkan gambar langsung di layar (preview)
    companyProfile.value.headerBg = data.previewUrl;
    
    // Proses upload file aslinya ke server
    if (data.file) {
      try {
        console.log('Sedang mengunggah background header...');
        await uploadCompanyBackground(data.file);
        
        alert('Background header berhasil diperbarui di server!');
        
      } catch (error) {
        console.error('Gagal mengunggah background:', error);
        alert('Terjadi kesalahan saat mengunggah background.');
      }
    } else {
      console.warn("File gambar asli tidak ditemukan dari modal upload.");
    }
  }
};

// ==========================================
// FUNGSI AUTO-SAVE BAHASA & TIMEZONE
// ==========================================
const autoSaveLangTz = async () => {
  if (!companyProfile.value.id) return;

  try {
    const payloadLangTz = {
      language: companyProfile.value.language,
      timezone: companyProfile.value.timezone
    };
    
    // 1. SIMPAN KE LOCAL STORAGE (Agar langsung ingat saat di-refresh)
    localStorage.setItem('app_lang', companyProfile.value.language);
    localStorage.setItem('app_tz', companyProfile.value.timezone);
    
    // 2. TEMBAK KE DATABASE BACKEND
    await updateLanguageTimezone(companyProfile.value.id, payloadLangTz);
    
    console.log('Bahasa & Timezone berhasil disimpan ke DB & Local Storage!');
    
  } catch (error) {
    console.error('Gagal menyimpan bahasa/timezone:', error);
  }
};

// Tambahkan variabel untuk membuka/tutup menu
const showTokenMenu = ref(false);

// Fungsi untuk menghapus token
const deleteToken = async () => {
  const isConfirmed = confirm('Apakah Anda yakin ingin menghapus API Token ini? Token yang dihapus tidak dapat dipulihkan.');
  
  if (isConfirmed) {
    try {
      // Pastikan kita memiliki ID tokennya (yang sudah kita simpan dari proses GET/POST)
      if (!existingToken.value || !existingToken.value.id) {
        alert('ID Token tidak valid atau tidak ditemukan.');
        return;
      }

      // 1. Tembak API Delete ke server menggunakan ID tersebut
      await deleteApiKey(existingToken.value.id);

      // 2. Jika berhasil, kosongkan tampilan di layar (kembali ke ilustrasi awal)
      existingToken.value = null;
      showTokenMenu.value = false; // Tutup menu dropdown
      
      alert('API Token berhasil dihapus dari server!');
      
    } catch (error) {
      console.error('Gagal menghapus token:', error);
      alert(error.response?.data?.message || 'Terjadi kesalahan saat mencoba menghapus token.');
    }
  }
};
</script>

<style scoped>

textarea {
  resize: vertical;
}
</style>