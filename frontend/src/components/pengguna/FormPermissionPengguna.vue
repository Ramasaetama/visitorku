<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  initialPermissions: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['submit', 'cancel']);

const selectedPermissions = ref([...props.initialPermissions]);

const availableScopes = ref([
  { 
    id: 'access', 
    label: 'Access', 
    desc: 'Memberikan hak akses untuk melihat menu terkait', 
    isOpen: false, 
    isSensitive: false,
    checked: false, 
    permissions: [ 
      { id: 'dashboard', label: 'Dashboard', desc: 'Akses halaman utama dashboard analitik', value: 'dashboard', checked: false },
      { id: 'visitor', label: 'Visitor', desc: 'Akses dan kelola data list pengunjung', value: 'visitor', checked: false },
      { id: 'visit', label: 'Visit', desc: 'Akses data riwayat kunjungan', value: 'visit', checked: false },
      { id: 'signage', label: 'Signage', desc: 'Kelola media konten signage', value: 'signage', checked: false },
      { id: 'event', label: 'Event', desc: 'Kelola data event dan buku tamu', value: 'event', checked: false },
      { id: 'event_visitor', label: 'Event Visitor', desc: 'Akses menu event visitor', value: 'event_visitor', checked: false },
      { id: 'master_category', label: 'Master Category', desc: 'Akses data master category', value: 'master_category', checked: false },
      { id: 'master_form_setting', label: 'Master Form Setting', desc: 'Akses form setting', value: 'master_form_setting', checked: false },
      { id: 'master_user', label: 'Master User', desc: 'Akses data master user', value: 'master_user', checked: false },
      { id: 'master_company', label: 'Master Company', desc: 'Akses data master company', value: 'master_company', checked: false },
      { id: 'master_branch', label: 'Master Branch', desc: 'Akses data master branch', value: 'master_branch', checked: false },
      { id: 'master_invoice', label: 'Master Invoice', desc: 'Akses data master invoice', value: 'master_invoice', checked: false }
    ] 
  },
  { 
    id: 'add', 
    label: 'Add', 
    desc: 'Memberikan hak untuk menambahkan data baru', 
    isOpen: false, 
    isSensitive: false,
    checked: false, 
    permissions: [ 
      { id: 'signage_create', label: 'Signage', desc: 'Tambah data signage baru', value: 'signage_create', checked: false },
      { id: 'event_create', label: 'Event', desc: 'Tambah data event baru', value: 'event_create', checked: false },
      { id: 'event_visitor_create', label: 'Event Visitor', desc: 'Tambah data event visitor baru', value: 'event_visitor_create', checked: false },
      { id: 'master_category_create', label: 'Master Category', desc: 'Tambah master category baru', value: 'master_category_create', checked: false },
      { id: 'master_user_create', label: 'Master User', desc: 'Tambah master user baru', value: 'master_user_create', checked: false },
      { id: 'master_branch_create', label: 'Master Branch', desc: 'Tambah master branch baru', value: 'master_branch_create', checked: false }
    ] 
  },
  { 
    id: 'edit', 
    label: 'Edit', 
    desc: 'Memberikan hak untuk mengubah data yang ada', 
    isOpen: false, 
    isSensitive: false,
    checked: false, 
    permissions: [ 
      { id: 'signage_update', label: 'Signage', desc: 'Update data signage', value: 'signage_update', checked: false },
      { id: 'event_update', label: 'Event', desc: 'Update data event', value: 'event_update', checked: false },
      { id: 'event_visitor_update', label: 'Event Visitor', desc: 'Update data event visitor', value: 'event_visitor_update', checked: false },
      { id: 'master_category_update', label: 'Master Category', desc: 'Update master category', value: 'master_category_update', checked: false },
      { id: 'master_user_update', label: 'Master User', desc: 'Update master user', value: 'master_user_update', checked: false },
      { id: 'master_branch_update', label: 'Master Branch', desc: 'Update master branch', value: 'master_branch_update', checked: false }
    ] 
  },
  { 
    id: 'delete', 
    label: 'Delete', 
    desc: 'Memberikan hak untuk menghapus data', 
    isOpen: false, 
    isSensitive: true,
    checked: false, 
    permissions: [ 
      { id: 'signage_delete', label: 'Signage', desc: 'Hapus data signage', value: 'signage_delete', checked: false },
      { id: 'event_delete', label: 'Event', desc: 'Hapus data event', value: 'event_delete', checked: false },
      { id: 'event_visitor_delete', label: 'Event Visitor', desc: 'Hapus data event visitor', value: 'event_visitor_delete', checked: false },
      { id: 'master_category_delete', label: 'Master Category', desc: 'Hapus master category', value: 'master_category_delete', checked: false },
      { id: 'master_user_delete', label: 'Master User', desc: 'Hapus master user', value: 'master_user_delete', checked: false },
      { id: 'master_branch_delete', label: 'Master Branch', desc: 'Hapus master branch', value: 'master_branch_delete', checked: false }
    ] 
  },
  { 
    id: 'other', 
    label: 'Other', 
    desc: 'Hak akses fitur spesifik lainnya', 
    isOpen: false, 
    isSensitive: true,
    checked: false, 
    permissions: [ 
      { id: 'visitor_detail', label: 'Visitor Detail', desc: 'Melihat detail data visitor', value: 'visitor_detail', checked: false },
      { id: 'event_setting', label: 'Event Setting', desc: 'Mengakses pengaturan event', value: 'event_setting', checked: false },
      { id: 'master_category_setting', label: 'Master Category Setting', desc: 'Mengakses pengaturan category', value: 'master_category_setting', checked: false },
      { id: 'master_user_permission', label: 'Master User Permission', desc: 'Mengelola hak akses user', value: 'master_user_permission', checked: false },
      { id: 'master_branch_setting', label: 'Master Branch Setting', desc: 'Mengakses pengaturan branch', value: 'master_branch_setting', checked: false }
    ] 
  }
]);

onMounted(() => {
  availableScopes.value.forEach(scope => {
    let allChecked = true;
    let anyChecked = false;
    
    scope.permissions.forEach(perm => {
      if (selectedPermissions.value.includes(perm.value)) {
        perm.checked = true;
        anyChecked = true;
      } else {
        perm.checked = false;
        allChecked = false;
      }
    });

    scope.checked = scope.permissions.length > 0 ? (allChecked && anyChecked) : false;
  });
});

const toggleScope = (index) => { 
  availableScopes.value[index].isOpen = !availableScopes.value[index].isOpen; 
};

const handleParentCheckbox = (index) => { 
  const scope = availableScopes.value[index]; 
  scope.permissions.forEach(perm => {
    perm.checked = scope.checked;
    
    if (scope.checked && !selectedPermissions.value.includes(perm.value)) {
      selectedPermissions.value.push(perm.value);
    } else if (!scope.checked) {
      selectedPermissions.value = selectedPermissions.value.filter(v => v !== perm.value);
    }
  }); 
};

const handleChildCheckbox = (index, permValue) => { 
  const scope = availableScopes.value[index]; 
  const allChecked = scope.permissions.every(perm => perm.checked); 
  scope.checked = allChecked; 

  const perm = scope.permissions.find(p => p.value === permValue);
  if (perm.checked && !selectedPermissions.value.includes(perm.value)) {
    selectedPermissions.value.push(perm.value);
  } else if (!perm.checked) {
    selectedPermissions.value = selectedPermissions.value.filter(v => v !== perm.value);
  }
};

const handleSubmit = () => {
  emit('submit', { permissions: selectedPermissions.value });
};
</script>

<template>
  <form id="formPermissionPengguna" @submit.prevent="handleSubmit" class="flex flex-col h-full font-poppins pt-2 pb-6">
    
    <div class="mb-4 shrink-0">
      <h3 class="text-base font-semibold text-gray-900 mb-1">Akses Menu</h3>
      <p class="text-xs text-gray-500">Centang fitur yang dapat diakses oleh pengguna ini.</p>
    </div>

    <div class="flex-1 overflow-y-auto pr-2 space-y-2 min-h-0">
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
          
          <button type="button" @click="toggleScope(index)" class="text-xs font-semibold text-[#F7941D] hover:text-[#d68516] flex items-center gap-1 transition-colors focus:outline-none">
            {{ scope.isOpen ? 'Tutup' : 'Buka' }}
            <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': scope.isOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
        </div>

        <div v-if="scope.isOpen" class="mt-3 pl-8 space-y-3">
          <div v-for="perm in scope.permissions" :key="perm.id" class="flex items-start gap-3">
              <input 
                type="checkbox" 
                v-model="perm.checked" 
                @change="handleChildCheckbox(index, perm.value)" 
                class="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#3B82F6] focus:ring-[#3B82F6] accent-[#3B82F6] cursor-pointer" 
              />
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
    
  </form>
</template>

<style scoped>
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

button:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>