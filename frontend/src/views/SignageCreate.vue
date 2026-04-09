<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Topbar from '@/components/Topbar.vue';
import Sidebar from '@/components/Sidebar.vue';
import { createSignage, uploadSignageFile } from '@/services/signageService';
import { showSuccess, showError } from '@/utils/alertHelper';

const router = useRouter();

// ─── Step Management ──────────────────────────────────────────────────────────
const currentStep = ref(1); // 1 = Select Layout, 2 = Form

// ─── Layout Options ───────────────────────────────────────────────────────────
const layoutOptions = [
  {
    id: 'fullscreen',
    name: 'Fullscreen',
    panels: [{ flex: 1, color: '#E0E0E0' }],
    splitLabel: 'Layout fullscreen',
  },
  {
    id: '1-1',
    name: '1:1',
    panels: [
      { flex: 1, color: '#F7941D' },
      { flex: 1, color: '#E0E0E0' },
    ],
    splitLabel: 'Layout split-1-1',
  },
  {
    id: '1-2',
    name: '1:2',
    panels: [
      { flex: 1, color: '#F7941D' },
      { flex: 2, color: '#E0E0E0' },
    ],
    splitLabel: 'Layout split-1-2',
  },
  {
    id: '2-1',
    name: '2:1',
    panels: [
      { flex: 2, color: '#E0E0E0' },
      { flex: 1, color: '#F7941D' },
    ],
    splitLabel: 'Layout split-2-1',
  },
  {
    id: '1-1-1',
    name: '1:1:1',
    panels: [
      { flex: 1, color: '#F7941D' },
      { flex: 1, color: '#E0E0E0' },
      { flex: 1, color: '#F7941D' },
    ],
    splitLabel: 'Layout split-1-1-1',
  },
  {
    id: 'fullscreen-header',
    name: 'Fullscreen & Header',
    panels: [
      { flex: 2, color: '#E0E0E0' },
      { flex: 1, color: '#E0E0E0', hasHeader: true },
    ],
    splitLabel: 'Layout fullscreen-header',
  },
];

const selectedLayout = ref(null);

const selectedLayoutObj = computed(() =>
  layoutOptions.find((l) => l.id === selectedLayout.value)
);

const selectLayout = (layoutId) => {
  selectedLayout.value = layoutId;
  currentStep.value = 2;
  // Reset active panel tab
  activePanel.value = 0;
  // Reset uploads for all panels
  panelFiles.value = {};
  panelPreviews.value = {};
};

const changeLayout = () => {
  currentStep.value = 1;
};

// ─── Form State ───────────────────────────────────────────────────────────────
const formName = ref('');
const formRunningText = ref('');
const isSubmitting = ref(false);

// ─── Panel / Tab Management ───────────────────────────────────────────────────
const activePanel = ref(0); // index of active panel (Layout 1, Layout 2, etc.)
const panelFiles = ref({}); // { panelIndex: File }
const panelPreviews = ref({}); // { panelIndex: dataURL }

const panelCount = computed(() => {
  if (!selectedLayoutObj.value) return 1;
  return selectedLayoutObj.value.panels.length;
});

const setActivePanel = (index) => {
  activePanel.value = index;
};

// ─── File Upload ──────────────────────────────────────────────────────────────
const fileInputRef = ref(null);
const isDragging = ref(false);

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = (event) => {
  const file = event.target.files?.[0];
  if (file) processFile(file);
  // Reset input so same file can be re-selected
  event.target.value = '';
};

const handleDragOver = (e) => {
  e.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (e) => {
  e.preventDefault();
  isDragging.value = false;
  const file = e.dataTransfer.files?.[0];
  if (file) processFile(file);
};

const processFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4'];
  if (!validTypes.includes(file.type)) {
    showError('Format file tidak didukung. Gunakan jpg, png, jpeg, atau mp4.');
    return;
  }
  panelFiles.value = { ...panelFiles.value, [activePanel.value]: file };
  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    panelPreviews.value = {
      ...panelPreviews.value,
      [activePanel.value]: { url: e.target.result, type: file.type },
    };
  };
  reader.readAsDataURL(file);
};

const removeFile = (panelIndex) => {
  const newFiles = { ...panelFiles.value };
  const newPreviews = { ...panelPreviews.value };
  delete newFiles[panelIndex];
  delete newPreviews[panelIndex];
  panelFiles.value = newFiles;
  panelPreviews.value = newPreviews;
};

// ─── Submit ───────────────────────────────────────────────────────────────────
const handleSubmit = async () => {
  if (!formName.value.trim()) {
    showError('Nama signage wajib diisi.');
    return;
  }
  isSubmitting.value = true;
  try {
    // 1. Upload files for each panel
    const uploadedFiles = {};
    for (const [panelIndex, file] of Object.entries(panelFiles.value)) {
      const res = await uploadSignageFile(file);
      const data = res.data?.data || res.data;
      uploadedFiles[panelIndex] = data.url || data.path || data.filename || data;
    }

    // 2. Create signage
    const payload = {
      name: formName.value.trim(),
      running_text: formRunningText.value.trim(),
      layout: selectedLayout.value,
      files: uploadedFiles,
    };

    await createSignage(payload);
    showSuccess('Signage berhasil dibuat.');
    router.push('/layar-informasi');
  } catch (err) {
    console.error('Gagal membuat signage:', err);
    showError(err.response?.data?.message || 'Gagal membuat signage.');
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  router.push('/layar-informasi');
};
</script>

<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    <Topbar />

    <div class="flex flex-1 items-stretch">
      <Sidebar />

      <main class="flex-1 bg-[#F4F6F8] p-4">
        <div class="bg-white rounded-2xl shadow-sm h-full flex flex-col">
          <div class="p-6 flex-1 flex flex-col">

            <!-- ── Header ── -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <button
                  @click="currentStep === 1 ? goBack() : changeLayout()"
                  class="w-8 h-8 flex items-center justify-center bg-[#FEF3E2] rounded-full hover:bg-[#FDDCB5] transition-colors"
                >
                  <svg class="w-4 h-4 text-[#F7941D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <h1 class="text-xl font-semibold text-gray-800">
                  {{ currentStep === 1 ? 'Select Layout' : 'Create Signage' }}
                </h1>
              </div>

              <!-- Breadcrumb -->
              <nav class="flex items-center gap-1.5 text-sm text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                <span>Dashboard</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
                <router-link to="/layar-informasi" class="hover:text-[#F7941D] transition-colors">Signage</router-link>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
                <span class="text-[#F7941D] font-medium">Create</span>
              </nav>
            </div>

            <!-- ══════════════════════════════════════════════════════════ -->
            <!-- STEP 1: Select Layout                                     -->
            <!-- ══════════════════════════════════════════════════════════ -->
            <div v-if="currentStep === 1" class="flex-1">
              <div class="grid grid-cols-3 gap-5">
            <button
  v-for="layout in layoutOptions"
  :key="layout.id"
  @click="selectLayout(layout.id)"
  class="group relative border-2 rounded-lg overflow-hidden transition-all duration-200 hover:border-[#F7941D] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#F7941D]/30"
  :class="selectedLayout === layout.id ? 'border-[#F7941D] shadow-md' : 'border-gray-200'"
>
  <!-- Layout Visual Preview -->
  <div class="flex h-56">
    <template v-if="layout.id === 'fullscreen-header'">
      <div class="flex flex-col w-full h-full">
        <div class="bg-[#F7941D]" style="height: 28%"></div>
        <div class="bg-[#E0E0E0] flex-1"></div>
      </div>
    </template>
    <template v-else>
      <div
        v-for="(panel, pIdx) in layout.panels"
        :key="pIdx"
        :style="{ flex: panel.flex, backgroundColor: panel.color }"
      ></div>
    </template>
  </div>

  <!-- Label Overlay -->
  <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
    <span class="text-base font-bold text-gray-800">{{ layout.name }}</span>
  </div>
</button>
              </div>
            </div>

            <!-- ══════════════════════════════════════════════════════════ -->
            <!-- STEP 2: Create Signage Form                               -->
            <!-- ══════════════════════════════════════════════════════════ -->
            <div v-else class="flex-1 flex flex-col">
              <!-- Name -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formName"
                  type="text"
                  placeholder="Enter name here..."
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#F7941D]/30 focus:border-[#F7941D]
                         transition-colors"
                />
              </div>

              <!-- Running Text -->
              <div class="mb-5">
                <label class="block text-sm font-medium text-gray-700 mb-1">Running Text</label>
                <textarea
                  v-model="formRunningText"
                  rows="3"
                  placeholder="Enter Running Text Here..."
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-y
                         focus:outline-none focus:ring-2 focus:ring-[#F7941D]/30 focus:border-[#F7941D]
                         transition-colors"
                ></textarea>
              </div>

              <!-- Layout Preview (mini) -->
              <div class="mb-4">
                <div class="flex h-28 gap-0.5 max-w-[280px]">
                  <div
                    v-for="(panel, pIdx) in selectedLayoutObj?.panels || []"
                    :key="pIdx"
                    class="flex items-center justify-center text-white font-semibold text-lg cursor-pointer transition-all"
                    :style="{
                      flex: panel.flex,
                      backgroundColor: activePanel === pIdx ? '#F7941D' : '#D4D4D4',
                    }"
                    @click="setActivePanel(pIdx)"
                  >
                    {{ pIdx + 1 }}
                  </div>
                </div>
              </div>

              <!-- Panel Tabs + Layout Info -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-1">
                  <button
                    v-for="(panel, pIdx) in selectedLayoutObj?.panels || []"
                    :key="pIdx"
                    @click="setActivePanel(pIdx)"
                    class="px-4 py-1.5 text-sm font-medium rounded-lg transition-all"
                    :class="activePanel === pIdx
                      ? 'bg-[#FEF3E2] text-[#F7941D] border border-[#F7941D]'
                      : 'text-gray-500 hover:bg-gray-50'"
                  >
                    Layout {{ pIdx + 1 }}
                  </button>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-gray-500">{{ selectedLayoutObj?.splitLabel }}</span>
                  <button
                    @click="changeLayout"
                    class="text-[#F7941D] font-medium hover:underline"
                  >
                    change
                  </button>
                </div>
              </div>

              <!-- File Upload Area -->
              <div class="mb-6">
                <!-- Show preview if file uploaded for this panel -->
                <div v-if="panelPreviews[activePanel]" class="relative">
                  <div class="border-2 border-dashed border-[#F7941D] rounded-lg overflow-hidden bg-gray-50">
                    <!-- Image preview -->
                    <img
                      v-if="panelPreviews[activePanel].type.startsWith('image/')"
                      :src="panelPreviews[activePanel].url"
                      alt="Preview"
                      class="w-full max-h-[200px] object-contain"
                    />
                    <!-- Video preview -->
                    <video
                      v-else
                      :src="panelPreviews[activePanel].url"
                      class="w-full max-h-[200px]"
                      controls
                    ></video>
                  </div>
                  <!-- Remove button -->
                  <button
                    @click="removeFile(activePanel)"
                    class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-full
                           hover:bg-red-600 transition-colors shadow-md"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                <!-- Upload area (no file yet) -->
                <div
                  v-else
                  @click="triggerFileInput"
                  @dragover="handleDragOver"
                  @dragleave="handleDragLeave"
                  @drop="handleDrop"
                  class="border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all flex flex-col items-center justify-center max-w-[200px] min-h-[160px]"

                  :class="isDragging
                    ? 'border-[#F7941D] bg-[#FEF3E2]'
                    : 'border-[#F7941D]/50 bg-[#FFFAF5] hover:border-[#F7941D] hover:bg-[#FEF3E2]'"
                >
                  <!-- Camera Icon -->
                  <div class="w-14 h-14 flex items-center justify-center bg-white rounded-xl shadow-sm mb-3">
                    <svg class="w-8 h-8 text-[#F7941D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <p class="text-sm font-medium text-[#F7941D]">Upload a file</p>
                  <p class="text-xs text-[#F7941D]/60 mt-1">File type: (jpg, png, jpeg, mp4)</p>
                </div>

                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,video/mp4"
                  class="hidden"
                  @change="handleFileSelect"
                />
              </div>

              <!-- Spacer -->
              <div class="flex-1"></div>

              <!-- Submit Button -->
              <div class="flex justify-end pt-4">
                <button
                  @click="handleSubmit"
                  :disabled="isSubmitting || !formName.trim()"
                  class="px-8 py-2.5 text-sm font-semibold text-white bg-[#F7941D] rounded-lg
                         hover:bg-[#E8850E] transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         active:scale-95"
                >
                  <span v-if="isSubmitting" class="flex items-center gap-2">
                    <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Creating...
                  </span>
                  <span v-else>Create</span>
                </button>
              </div>
            </div>

          </div><!-- /p-6 -->
        </div><!-- /bg-white card -->
      </main>
    </div>
  </div>
</template>
