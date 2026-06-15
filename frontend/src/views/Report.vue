<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ExcelIcon from '@/assets/icon/file-excel-line.svg';

import {
  downloadVisitorExcel,
  downloadVisitExcel,
  parseBlobError,
} from '@/services/ReportService';

// ─── Error State ─────────────────────────────────────────────────────────────
const visitorError = ref('');
const visitError   = ref('');

const router = useRouter();

// ─── State Visitor Report ─────────────────────────────────────────────────────
const visitorDateFrom      = ref('');
const visitorDateTo        = ref('');
const isDownloadingVisitor = ref(false);

// ─── State Visit Report ───────────────────────────────────────────────────────
const visitDateFrom      = ref('');
const visitDateTo        = ref('');
const isDownloadingVisit = ref(false);

// ─── Helper: Download via window.location ─────────────────────────────────────
const openFileUrl = (url) => {
  window.location.href = url;
};

// ─── Download Visitor ─────────────────────────────────────────────────────────
const handleDownloadVisitor = async () => {
  if (!visitorDateFrom.value || !visitorDateTo.value) {
    visitorError.value = 'Harap isi From Date dan To Date.';
    return;
  }
  visitorError.value         = '';
  isDownloadingVisitor.value = true;
  try {
    const response = await downloadVisitorExcel({
      from_date: visitorDateFrom.value,
      to_date:   visitorDateTo.value,
    });
    const fileUrl = response.data?.data;
    if (fileUrl) {
      openFileUrl(fileUrl);
    } else {
      visitorError.value = 'URL file tidak ditemukan.';
    }
  } catch (err) {
    const parsed = await parseBlobError(err);
    let msg = '';
    if (Array.isArray(parsed?.errors)) {
      msg = parsed.errors.map(e => e.message).join(' | ');
    } else if (parsed?.errors && typeof parsed.errors === 'object') {
      msg = Object.entries(parsed.errors)
        .map(([f, m]) => `[${f}]: ${Array.isArray(m) ? m.join(', ') : m}`)
        .join(' | ');
    } else {
      msg = parsed?.message ?? `Error ${err?.response?.status}`;
    }
    visitorError.value = msg;
  } finally {
    isDownloadingVisitor.value = false;
  }
};

// ─── Download Visit ───────────────────────────────────────────────────────────
const handleDownloadVisit = async () => {
  if (!visitDateFrom.value || !visitDateTo.value) {
    visitError.value = 'Harap isi From Date dan To Date.';
    return;
  }
  visitError.value         = '';
  isDownloadingVisit.value = true;
  try {
    const response = await downloadVisitExcel({
      from_date: visitDateFrom.value,
      to_date:   visitDateTo.value,
    });
    const fileUrl = response.data?.data;
    if (fileUrl) {
      openFileUrl(fileUrl);
    } else {
      visitError.value = 'URL file tidak ditemukan.';
    }
  } catch (err) {
    const parsed = await parseBlobError(err);
    let msg = '';
    if (Array.isArray(parsed?.errors)) {
      msg = parsed.errors.map(e => e.message).join(' | ');
    } else if (parsed?.errors && typeof parsed.errors === 'object') {
      msg = Object.entries(parsed.errors)
        .map(([f, m]) => `[${f}]: ${Array.isArray(m) ? m.join(', ') : m}`)
        .join(' | ');
    } else {
      msg = parsed?.message ?? `Error ${err?.response?.status}`;
    }
    visitError.value = msg;
  } finally {
    isDownloadingVisit.value = false;
  }
};
</script>

<template>
  <div class="flex-1 w-full h-full flex flex-col">
        <!-- ── Page Header ──────────────────────────────────────────────── -->
        <div class="bg-white rounded-2xl shadow-sm px-6 py-4 flex items-center justify-between mb-5">

          <!-- Back + Title -->
          <div class="flex items-center gap-3">
            <button
              @click="router.back()"
              class="w-8 h-8 flex items-center justify-center rounded-sm
                     bg-[#FFF1E6] text-[#F7941D]
                     hover:bg-[#F7941D] hover:text-white transition-all focus:outline-none"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 class="text-[17px] font-bold text-gray-800">Visitor Report</h1>
          </div>
        </div>

        <!-- ── Two Report Cards ─────────────────────────────────────────── -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

          <!-- ── Card 1: Visitor Report ──────────────────────────────────── -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

            <!-- Card Header -->
            <div class="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
              <h2 class="text-[15px] font-bold text-gray-800">Visitor Report</h2>
              <div class="w-8 h-8 rounded-sm bg-[#E4FAF3] flex items-center justify-center text-[#38CA99]">
                <img :src="ExcelIcon" alt="Excel Icon" class="w-4 h-4" />
              </div>
            </div>

            <!-- Fields -->
            <div class="space-y-4">

              <!-- From Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  From Date <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="visitorDateFrom"
                  type="date"
                  class="w-full h-11 px-4 border border-gray-200 rounded-sm text-sm text-gray-600
                         focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]/20
                         transition-colors"
                />
              </div>

              <!-- To Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  To Date <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="visitorDateTo"
                  type="date"
                  class="w-full h-11 px-4 border border-gray-200 rounded-sm text-sm text-gray-600
                         focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]/20
                         transition-colors"
                />
              </div>

              <!-- Download Button -->
              <button
                @click="handleDownloadVisitor"
                :disabled="isDownloadingVisitor"
                class="flex items-center gap-2 px-5 py-2.5 bg-[#F7941D] text-white
                       rounded-sm text-sm font-semibold hover:bg-[#E8850E] transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none mt-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5"
                     stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {{ isDownloadingVisitor ? 'Downloading...' : 'Download' }}
              </button>

              <!-- Error Banner Visitor -->
              <div
                v-if="visitorError"
                class="flex items-start gap-2 bg-red-50 border border-red-200 rounded-sm px-4 py-3 text-sm text-red-600"
              >
                <svg class="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{{ visitorError }}</span>
              </div>

            </div>
          </div>

          <!-- ── Card 2: Visit Report ─────────────────────────────────────── -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

            <!-- Card Header -->
            <div class="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
              <h2 class="text-[15px] font-bold text-gray-800">Visit Report</h2>
              <div class="w-8 h-8 rounded-sm bg-[#E4FAF3] flex items-center justify-center text-[#38CA99]">
                <img :src="ExcelIcon" alt="Excel Icon" class="w-4 h-4" />
              </div>
            </div>

            <!-- Fields -->
            <div class="space-y-4">

              <!-- From Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  From Date <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="visitDateFrom"
                  type="date"
                  class="w-full h-11 px-4 border border-gray-200 rounded-sm text-sm text-gray-600
                         focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]/20
                         transition-colors"
                />
              </div>

              <!-- To Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  To Date <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="visitDateTo"
                  type="date"
                  class="w-full h-11 px-4 border border-gray-200 rounded-sm text-sm text-gray-600
                         focus:outline-none focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D]/20
                         transition-colors"
                />
              </div>

              <!-- Download Button -->
              <button
                @click="handleDownloadVisit"
                :disabled="isDownloadingVisit"
                class="flex items-center gap-2 px-5 py-2.5 bg-[#F7941D] text-white
                       rounded-sm text-sm font-semibold hover:bg-[#E8850E] transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none mt-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5"
                     stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {{ isDownloadingVisit ? 'Downloading...' : 'Download' }}
              </button>
              <!-- Error Banner Visit -->
              <div
                v-if="visitError"
                class="flex items-start gap-2 bg-red-50 border border-red-200 rounded-sm px-4 py-3 text-sm text-red-600"
              >
                <svg class="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{{ visitError }}</span>
              </div>

            </div>
          </div>

        </div>
      </div>
</template>

<style scoped>
button:focus {
  outline: none !important;
  box-shadow: none !important;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  transition: opacity 0.2s;
}

input[type="date"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}
</style>