<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Topbar from '@/components/Topbar.vue';
import Sidebar from '@/components/Sidebar.vue';
import { showSuccess, showError, confirmDelete } from '@/utils/alertHelper';
import { getEventById } from '@/services/eventService';
import api from '@/services/api';

const route   = useRoute();
const router  = useRouter();
const eventId = computed(() => route.params.id);

// ─── Event Info ───────────────────────────────────────────────────────────────
const eventInfo = ref(null);

const fetchEventInfo = async () => {
  try {
    const res = await getEventById(eventId.value);
    eventInfo.value = res.data?.data ?? res.data ?? res;
  } catch (err) {
    console.error('Gagal memuat event info:', err);
  }
};

// ─── Tabs ───────────────────────────────────────────────────────────────────
const activeTab = ref('register'); // 'register' | 'feedback'

// ─── Field Type Options ───────────────────────────────────────────────────────
const fieldTypeOptions = ['Text', 'Number', 'Email', 'Phone', 'Textarea', 'Date'];

// ─── Register Fields ──────────────────────────────────────────────────────────
const registerFields = ref([]);
const registerSettingId = ref(null);
const isLoadingRegister = ref(false);
const isSavingRegister  = ref(false);

const fetchRegisterFields = async () => {
  isLoadingRegister.value = true;
  try {
    const res = await api.get(`/admin/event/${eventId.value}/form`);
    const data = res.data?.data ?? res.data ?? res;
    registerSettingId.value = data.id ?? null;
    const raw = Array.isArray(data) ? data : (data.forms ?? data.fields ?? []);
    registerFields.value = raw.map(f => ({
      name:     f.name ?? f.field ?? '',
      type:     capitalize(f.type ?? 'Text'),
      required: !!f.required,
      _isNew:   false,
    }));
  } catch (err) {
    // jika endpoint belum ada, mulai dengan field kosong
    registerFields.value = [];
  } finally {
    isLoadingRegister.value = false;
  }
};

// ─── Feedback Fields ──────────────────────────────────────────────────────────
const feedbackFields    = ref([]);
const feedbackSettingId = ref(null);
const isLoadingFeedback = ref(false);
const isSavingFeedback  = ref(false);

const fetchFeedbackFields = async () => {
  isLoadingFeedback.value = true;
  try {
    const res = await api.get(`/admin/event/${eventId.value}/feedback-form`);
    const data = res.data?.data ?? res.data ?? res;
    feedbackSettingId.value = data.id ?? null;
    const raw = Array.isArray(data) ? data : (data.forms ?? data.fields ?? []);
    feedbackFields.value = raw.map(f => ({
      name:     f.name ?? f.field ?? '',
      type:     capitalize(f.type ?? 'Text'),
      required: !!f.required,
      _isNew:   false,
    }));
  } catch (err) {
    feedbackFields.value = [];
  } finally {
    isLoadingFeedback.value = false;
  }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const generateSlug = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');

// ─── Add Field Row ─────────────────────────────────────────────────────────────
const addRegisterField = () => {
  registerFields.value.push({ name: '', type: 'Text', required: false, _isNew: true });
};

const addFeedbackField = () => {
  feedbackFields.value.push({ name: '', type: 'Text', required: false, _isNew: true });
};

// ─── Delete Field Row ──────────────────────────────────────────────────────────
const removeRegisterField = async (index) => {
  const confirmed = await confirmDelete('field ini');
  if (!confirmed) return;
  registerFields.value.splice(index, 1);
};

const removeFeedbackField = async (index) => {
  const confirmed = await confirmDelete('field ini');
  if (!confirmed) return;
  feedbackFields.value.splice(index, 1);
};

// ─── Save Register ────────────────────────────────────────────────────────────
const saveRegister = async () => {
  const invalid = registerFields.value.find(f => !f.name.trim());
  if (invalid) {
    showError('Semua nama field harus diisi.');
    return;
  }
  isSavingRegister.value = true;
  try {
    const payload = {
      forms: registerFields.value.map(f => ({
        field:    generateSlug(f.name),
        name:     f.name,
        type:     f.type.toLowerCase(),
        required: f.required,
      })),
    };
    if (registerSettingId.value) {
      await api.put(`/admin/event/${eventId.value}/form`, payload);
    } else {
      await api.post(`/admin/event/${eventId.value}/form`, payload);
    }
    showSuccess('Form Register berhasil disimpan.');
    await fetchRegisterFields();
  } catch (err) {
    showError(err.response?.data?.message || 'Gagal menyimpan Form Register.');
  } finally {
    isSavingRegister.value = false;
  }
};

// ─── Save Feedback ─────────────────────────────────────────────────────────────
const saveFeedback = async () => {
  const invalid = feedbackFields.value.find(f => !f.name.trim());
  if (invalid) {
    showError('Semua nama field harus diisi.');
    return;
  }
  isSavingFeedback.value = true;
  try {
    const payload = {
      forms: feedbackFields.value.map(f => ({
        field:    generateSlug(f.name),
        name:     f.name,
        type:     f.type.toLowerCase(),
        required: f.required,
      })),
    };
    if (feedbackSettingId.value) {
      await api.put(`/admin/event/${eventId.value}/feedback-form`, payload);
    } else {
      await api.post(`/admin/event/${eventId.value}/feedback-form`, payload);
    }
    showSuccess('Form Feedback berhasil disimpan.');
    await fetchFeedbackFields();
  } catch (err) {
    showError(err.response?.data?.message || 'Gagal menyimpan Form Feedback.');
  } finally {
    isSavingFeedback.value = false;
  }
};

// ─── Active fields & handlers (computed based on tab) ─────────────────────────
const activeFields   = computed(() => activeTab.value === 'register' ? registerFields.value : feedbackFields.value);
const isLoading      = computed(() => activeTab.value === 'register' ? isLoadingRegister.value : isLoadingFeedback.value);
const isSaving       = computed(() => activeTab.value === 'register' ? isSavingRegister.value : isSavingFeedback.value);
const handleAddField = () => activeTab.value === 'register' ? addRegisterField() : addFeedbackField();
const handleRemove   = (i) => activeTab.value === 'register' ? removeRegisterField(i) : removeFeedbackField(i);
const handleSave     = () => activeTab.value === 'register' ? saveRegister() : saveFeedback();

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await fetchEventInfo();
  await fetchRegisterFields();
  await fetchFeedbackFields();
});
</script>

<template>
  <div class="min-h-screen bg-[#F4F6F8] flex flex-col font-['Poppins']">
    <Topbar />

    <div class="flex flex-1 items-stretch">
      <Sidebar />

      <main class="flex-1 bg-[#F4F6F8] p-4">
        <div class="bg-white rounded-2xl shadow-sm h-full flex flex-col">
          <div class="p-6 flex-1 flex flex-col">

            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <button
                  @click="router.push('/event')"
                  class="w-8 h-8 rounded-lg bg-[#FEF4E3] flex items-center justify-center text-[#F7941D] hover:bg-[#F7941D] hover:text-white transition-colors focus:outline-none"
                  style="border-radius: 8px;"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
                <h1 class="text-xl font-semibold text-gray-800">Form Setting</h1>
              </div>
              <nav class="flex items-center gap-1.5 text-sm text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                <span>Dashboard</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
                <button @click="router.push('/event')" class="hover:text-[#F7941D] transition-colors">Event</button>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
                <span class="text-[#F7941D] font-medium">Setting</span>
              </nav>
            </div>

            <!-- Tabs -->
            <div class="flex gap-0 mb-6 border-b border-gray-200">
              <button
                @click="activeTab = 'register'"
                class="px-6 py-2.5 text-sm font-semibold transition-all focus:outline-none"
                :class="activeTab === 'register'
                  ? 'text-gray-800 border-b-2 border-gray-800 -mb-px bg-[#FEF4E3] rounded-t-lg'
                  : 'text-gray-400 hover:text-gray-600'"
              >
                Register
              </button>
              <button
                @click="activeTab = 'feedback'"
                class="px-6 py-2.5 text-sm font-semibold transition-all focus:outline-none"
                :class="activeTab === 'feedback'
                  ? 'text-gray-800 border-b-2 border-gray-800 -mb-px bg-[#FEF4E3] rounded-t-lg'
                  : 'text-gray-400 hover:text-gray-600'"
              >
                Feedback
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="flex items-center justify-center py-20">
              <div class="w-8 h-8 border-2 border-[#F7941D] border-t-transparent rounded-full animate-spin"></div>
            </div>

            <!-- Field List -->
            <div v-else class="flex-1 flex flex-col gap-3">

              <!-- Empty hint -->
              <div v-if="activeFields.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400">
                <svg class="w-12 h-12 mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <p class="text-sm font-medium text-gray-400">Belum ada field. Klik "Add Form" untuk menambahkan.</p>
              </div>

              <!-- Field Row -->
              <div
                v-for="(field, index) in activeFields"
                :key="activeTab + '-' + index"
                class="border border-gray-200 rounded-xl overflow-hidden"
              >
                <!-- Required Toggle Row -->
                <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div class="flex items-center gap-3">
                    <!-- Toggle Switch -->
                    <button
                      type="button"
                      @click="field.required = !field.required"
                      class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none flex-shrink-0"
                      :class="field.required ? 'bg-[#4075FF]' : 'bg-gray-300'"
                    >
                      <span
                        class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                        :class="field.required ? 'translate-x-6' : 'translate-x-1'"
                      />
                    </button>
                    <span class="text-sm font-medium text-gray-600">Required</span>
                  </div>

                  <!-- Delete Button -->
                  <button
                    @click="handleRemove(index)"
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors focus:outline-none"
                    style="border-radius: 8px;"
                    title="Hapus Field"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                    </svg>
                  </button>
                </div>

                <!-- Field Name & Type Row -->
                <div class="flex items-center gap-3 px-4 py-3 bg-white">
                  <input
                    v-model="field.name"
                    type="text"
                    placeholder="Enter the column name"
                    class="flex-1 text-sm text-gray-700 placeholder-gray-300 border-none outline-none bg-transparent"
                  />
                  <div class="shrink-0 relative">
                    <select
                      v-model="field.type"
                      class="appearance-none text-sm text-gray-600 border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-[#F7941D] bg-white cursor-pointer"
                      style="border-radius: 8px;"
                    >
                      <option v-for="opt in fieldTypeOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bottom Actions -->
              <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <button
                  @click="handleAddField"
                  class="flex items-center gap-2 px-4 py-2 bg-[#4075FF] text-white text-sm font-medium hover:bg-[#3060EE] active:scale-95 transition-all focus:outline-none"
                  style="border-radius: 8px;"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Add Form
                </button>

                <button
                  @click="handleSave"
                  :disabled="isSaving"
                  class="flex items-center gap-2 px-6 py-2 bg-[#F7941D] text-white text-sm font-semibold hover:bg-[#E8850E] active:scale-95 transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style="border-radius: 8px;"
                >
                  <svg v-if="isSaving" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
button:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>
