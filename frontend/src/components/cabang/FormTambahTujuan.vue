<script setup>
import { ref, watch } from 'vue';

// Data Catch
const props = defineProps({
  initialData: {
    type: Object,
    default: null
  },
  branches: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['submit', 'cancel']);

const formData = ref({
  cabang: '',
  divisi: '',
  namaPIC: '',
  jabatan: '',
  email: '',
  phoneNumber: ''
});

watch(
  () => props.initialData,
  (newData) => {
    console.log("DATA DARI TOMBOL EDIT:", newData); 

    if (newData) {
      formData.value.cabang = newData.cabang || '';
      formData.value.divisi = newData.divisi || '';
      formData.value.namaPIC = newData.namaPIC || '';
      formData.value.jabatan = newData.jabatan || '';
      formData.value.email = newData.email || '';
      formData.value.phoneNumber = newData.phoneNumber || '';
    } else {
      formData.value = { cabang: '', divisi: '', namaPIC: '', jabatan: '', email: '', phoneNumber: '' };
    }
  },
  { immediate: true, deep: true } 
);

const submitForm = () => {
  emit('submit', formData.value);
};

const cancelForm = () => {
  emit('cancel');
};
</script>

<template>
  <form id="formTambahTujuan" @submit.prevent="submitForm" class="space-y-5">
    <!-- Cabang -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Cabang<span class="text-red-500">*</span>
      </label>
      <select 
        v-model="formData.cabang"
        required
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               placeholder-gray-400 
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors"
      >
        <option value="" disabled>Pilih Cabang</option>
        <option 
          v-for="branch in branches" 
          :key="branch.id" 
          :value="branch.id"
        >
          {{ branch.name }}
        </option>
      </select>
    </div>
    
    <!-- Divisi -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Divisi/Ruangan<span class="text-red-500">*</span>
      </label>
      <input 
        v-model="formData.divisi"
        type="text"
        required
        placeholder="Contoh: Finance"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               placeholder-gray-400 
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors"
      />
    </div>
    
    <!-- Nama PIC -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Nama PIC<span class="text-red-500">*</span>
      </label>
      <input 
        v-model="formData.namaPIC"
        type="text"
        required
        placeholder="Contoh: Andi Pratama"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               placeholder-gray-400 
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors"
      />
      <p class="mt-1 text-xs text-gray-400">Nama orang yang akan ditemui pengunjung</p>
    </div>
    
    <!-- Jabatan -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Jabatan<span class="text-red-500">*</span>
      </label>
      <input 
        v-model="formData.jabatan"
        type="text"
        required
        placeholder="Contoh: Network Engineer"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               placeholder-gray-400 
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors"
      />
    </div>
    
    <!-- Email -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Email<span class="text-red-500">*</span>
      </label>
      <input 
        v-model="formData.email"
        type="email"
        required
        placeholder="Contoh: andi@perusahaan.com"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               placeholder-gray-400 
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors"
      />
    </div>
    
    <!-- Phone Number -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Phone Number<span class="text-red-500">*</span>
      </label>
      <input 
        v-model="formData.phoneNumber"
        type="tel"
        required
        placeholder="Contoh: 0812 3456 7890"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
               placeholder-gray-400 
               focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]
               transition-colors"
      />
    </div>    
  </form>
</template>
