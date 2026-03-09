<script setup>
/**
 * DataTable Component
 * Komponen reusable untuk tabel data
 * 
 * Props:
 * - columns: array kolom [{key, label, sortable}]
 * - data: array data yang ditampilkan
 * - loading: status loading
 */

// Import icons for actions
import editIcon from '@/assets/edit.svg';
import deleteIcon from '@/assets/delete.svg';

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  sortKey: {
    type: String,
    default: ''
  },
  sortOrder: {
    type: String,
    default: 'asc' // 'asc' | 'desc'
  },
  headerColor: {
    type: String,
    default: '#FFEEE2'
  }
});

defineEmits(['sort', 'edit', 'delete']);

/**
 * Fungsi untuk mendapatkan class styling header berdasarkan posisi kolom
 * LOGIKA DINAMIS (bukan hardcode key):
 * - Kolom pertama: border kanan putih untuk gap
 * - Kolom tengah (bukan pertama/terakhir dan bukan 'aksi'): border kanan putih
 * - Kolom terakhir sebelum 'aksi': border kanan putih untuk gap
 * - Kolom 'aksi': tidak ada border kanan
 */
const getHeaderClass = (key, index) => {
  const classes = [];
  const isLast = index === props.columns.length - 1;
  const isAksi = key === 'aksi';
  
  // Kolom terakhir ('aksi') tidak perlu border
  if (isAksi || isLast) {
    // tidak ada border tambahan
  }
  // Kolom sebelum 'aksi' perlu border kanan untuk gap
  else if (index === props.columns.length - 2) {
    classes.push('border-r-[8px]', 'border-r-white');
  }
  // Kolom pertama perlu border kanan
  else if (index === 0) {
    classes.push('border-r-[8px]', 'border-r-white');
  }
  // Kolom tengah: cek apakah kolom selanjutnya adalah 'aksi'
  else {
    const nextColumn = props.columns[index + 1];
    // Jika kolom selanjutnya bukan aksi, tidak ada border (merge dengan kolom berikutnya)
    // Jika kolom selanjutnya adalah aksi, tambahkan border
    if (nextColumn && nextColumn.key === 'aksi') {
      classes.push('border-r-[8px]', 'border-r-white');
    }
  }
  
  return classes.join(' ');
};

/**
 * Fungsi untuk mendapatkan class styling cell (td) berdasarkan posisi kolom
 * LOGIKA SAMA dengan getHeaderClass untuk konsistensi visual
 */
const getCellClass = (key, index) => {
  const classes = ['px-4', 'py-3', 'text-sm', 'text-gray-600', 'border-b-[3px]', 'border-b-[#EDEDED]'];
  const isLast = index === props.columns.length - 1;
  const isAksi = key === 'aksi';
  
  // Kolom terakhir ('aksi') tidak perlu border
  if (isAksi || isLast) {
    // tidak ada border kanan
  }
  // Kolom sebelum 'aksi' perlu border kanan untuk gap
  else if (index === props.columns.length - 2) {
    classes.push('border-r-[8px]', 'border-r-white');
  }
  // Kolom pertama perlu border kanan
  else if (index === 0) {
    classes.push('border-r-[8px]', 'border-r-white');
  }
  // Kolom tengah: cek apakah kolom selanjutnya adalah 'aksi'
  else {
    const nextColumn = props.columns[index + 1];
    if (nextColumn && nextColumn.key === 'aksi') {
      classes.push('border-r-[8px]', 'border-r-white');
    }
  }
  
  return classes.join(' ');
};

</script>

<template>
  <div class="overflow-x-auto">
    <!-- Table tanpa border-spacing-x agar kolom bisa merge -->
    <table class="w-full border-separate border-spacing-0">
      <!-- Table Header -->
      <thead>
        <tr>
          <th 
            v-for="(column, index) in columns" 
            :key="column.key"
            :class="[
              'px-4 py-3 text-left text-sm font-semibold text-gray-700',
              // Styling untuk merge visual Alamat & Kontak Cabang
              getHeaderClass(column.key, index)
            ]"
            :style="{ backgroundColor: headerColor }"
          >
            <!-- Container dengan justify-between untuk icon sorting rata kanan -->
            <div class="flex w-full items-center justify-between">
              <span>{{ column.label }}</span>
              <!-- Sort Icon - Dinamis berdasarkan sortKey & sortOrder -->
              <button 
                v-if="column.sortable" 
                @click="$emit('sort', column.key)"
                class="ml-2 transition-colors"
                :class="sortKey === column.key ? 'text-[#F7941D]' : 'text-gray-400 hover:text-gray-600'"
              >
                <!-- Icon asc aktif -->
                <svg v-if="sortKey === column.key && sortOrder === 'asc'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                </svg>
                <!-- Icon desc aktif -->
                <svg v-else-if="sortKey === column.key && sortOrder === 'desc'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
                <!-- Icon netral (belum dipilih) -->
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                </svg>
              </button>
            </div>
          </th>
        </tr>
      </thead>
      
      <!-- Table Body -->
      <tbody>
        <!-- Border line after header (always visible) -->
        <tr class="border-row">
          <td :colspan="columns.length" class="h-0 border-b-2 border-[#EDEDED] p-0"></td>
        </tr>
        
        <!-- Loading State -->
        <tr v-if="loading">
          <td :colspan="columns.length" class="px-4 py-8 text-center text-gray-500">
            <div class="flex items-center justify-center gap-2">
              <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Memuat data...
            </div>
          </td>
        </tr>
        
        <!-- Data Rows - Menggunakan slot untuk custom row content -->
        <template v-else-if="data.length > 0">
          <slot name="body" :data="data">
            <tr 
              v-for="(row, index) in data" 
              :key="index" 
              class="hover:bg-gray-50"
            >
              <td 
                v-for="column in columns" 
                :key="column.key" 
                :class="getCellClass(column.key, columns.findIndex(c => c.key === column.key))"
              >
                <!-- Kolom Aksi dengan Icon -->
                <template v-if="column.key === 'aksi'">
                  <div class="flex items-center gap-3">
                    <button 
                      @click="$emit('edit', row)"
                      class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Edit"
                    >
                      <img :src="editIcon" alt="Edit" class="w-5 h-5" />
                    </button>
                    <button 
                      @click="$emit('delete', row)"
                      class="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Hapus"
                    >
                      <img :src="deleteIcon" alt="Hapus" class="w-5 h-5" />
                    </button>
                  </div>
                </template>
                <!-- Kolom data biasa -->
                <template v-else>
                  {{ row[column.key] }}
                </template>
              </td>
            </tr>
          </slot>
        </template>
        
        <!-- Empty State - Menggunakan slot agar bisa dikustomisasi -->
        <tr v-else>
          <td :colspan="columns.length" class="px-4 py-4">
            <slot name="empty">
              <div class="text-center text-gray-500 py-8">
                Tidak ada data
              </div>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

