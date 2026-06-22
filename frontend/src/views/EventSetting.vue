<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router'; 
import { showSuccess, showError, confirmDelete, parseApiError } from '@/utils/alertHelper';
import { getEventById,updateEventForm, updateEventFormFeedback } from '@/services/eventService';

import EmptyState from '@/components/common/EmptyState.vue'; 
import notfound from '@/assets/notfound.svg';
import api from '@/services/api';

const { t } = useI18n();

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
const fieldTypeOptions = ['text', 'select', 'radio'];

// ─── Register Fields ──────────────────────────────────────────────────────────
const registerFields = ref([]);
const isLoadingRegister = ref(false);
const isSavingRegister  = ref(false);

const fetchRegisterFields = async () => {
  isLoadingRegister.value = true;
  try {
    const res = await getEventById(eventId.value);
    const data = res.data?.data ?? res.data;
    registerFields.value = (data.forms ?? []).map(f => ({
      name:     f.name ?? '',
      type:     f.type ?? 'text',
      required: !!f.required,
      options:  f.options ?? [],
    }));
  } catch (err) {
    registerFields.value = [];
  } finally {
    isLoadingRegister.value = false;
  }
};

// ─── Feedback Fields ──────────────────────────────────────────────────────────
const feedbackFields    = ref([]);
const isLoadingFeedback = ref(false);
const isSavingFeedback  = ref(false);

const fetchFeedbackFields = async () => {
  isLoadingFeedback.value = true;
  try {
    const res = await getEventById(eventId.value);
    const data = res.data?.data ?? res.data;
    feedbackFields.value = (data.form_feedback ?? []).map(f => ({
      name:     f.name ?? '',
      type:     f.type ?? 'text',
      required: !!f.required,
      options:  f.options ?? [],
    }));
  } catch (err) {
    feedbackFields.value = [];
  } finally {
    isLoadingFeedback.value = false;
  }
};


const generateSlug = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');

// ─── Add Field Row ─────────────────────────────────────────────────────────────
const addRegisterField = () => {
  registerFields.value.push({ name: '', type: 'text', required: false, options: [] });
};

const addFeedbackField = () => {
  feedbackFields.value.push({ name: '', type: 'text', required: false, options: [] });
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
  if (invalid) { showError(t('eventSetting.error.emptyName')); return; }
  isSavingRegister.value = true;
  try {
    await updateEventForm(eventId.value, {
      forms: registerFields.value.map(f => ({
        field:    generateSlug(f.name),
        name:     f.name,
        type:     f.type,
        required: f.required,
        ...(f.options?.length ? { options: f.options } : {}),
      })),
    });
    showSuccess(t('eventSetting.success.register'));
    await fetchRegisterFields();
  } catch (err) {
    showError(parseApiError(err, t('eventSetting.error.saveFailed')));
  } finally {
    isSavingRegister.value = false;
  }
};

// ─── Save Feedback ─────────────────────────────────────────────────────────────
const saveFeedback = async () => {
  const invalid = feedbackFields.value.find(f => !f.name.trim());
  if (invalid) { showError(t('eventSetting.error.emptyName')); return; }
  isSavingFeedback.value = true;
  try {
    await updateEventFormFeedback(eventId.value, {
      form_feedback: feedbackFields.value.map(f => ({
        field:    generateSlug(f.name),
        name:     f.name,
        type:     f.type,
        required: f.required,
        ...(f.options?.length ? { options: f.options } : {}),
      })),
    });
    showSuccess(t('eventSetting.success.feedback'));
    await fetchFeedbackFields();
  } catch (err) {
    showError(parseApiError(err, t('eventSetting.error.saveFailed')));
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
  <div class="flex-1 w-full h-full flex flex-col">
        <div class="bg-white rounded-2xl shadow-sm h-full min-h-[calc(100vh-7rem)] flex flex-col relative w-full">
          <div class="p-6 flex-1 flex flex-col">

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
                <h1 class="text-xl font-semibold text-gray-800">{{ t('eventSetting.title') }}</h1>
              </div>
              
            </div>

            <div class="flex gap-0 mb-6 border-b border-gray-200">
              <button
                @click="activeTab = 'register'"
                class="px-6 py-2.5 text-sm font-semibold transition-all focus:outline-none"
                :class="activeTab === 'register'
                  ? 'bg-[#FEF3E2] text-[#F7941D] border border-b-0 border-[#F7941D]/40 rounded-t-sm'
                      : 'text-gray-500 hover:bg-gray-50 border border-transparent'"
              >
                {{ t('eventSetting.tabs.register') }}
              </button>
              <button
                @click="activeTab = 'feedback'"
                class="px-6 py-2.5 text-sm font-semibold transition-all focus:outline-none"
                :class="activeTab === 'feedback'
                      ? 'bg-[#FEF3E2] text-[#F7941D] border border-b-0 border-[#F7941D]/40 rounded-t-sm'
                      : 'text-gray-500 hover:bg-gray-50 border border-transparent'"
              >
                {{ t('eventSetting.tabs.feedback') }}
              </button>
            </div>

            <div v-if="isLoading" class="flex items-center justify-center py-20">
              <div class="w-8 h-8 border-2 border-[#F7941D] border-t-transparent rounded-full animate-spin"></div>
            </div>

            <div v-else class="flex-1 flex flex-col gap-3">

              <EmptyState 
                v-if="activeFields.length === 0"
                :icon="notfound"
                :title="t('eventSetting.emptyHint')"
                description="Silakan tambahkan field baru menggunakan tombol di bawah."
                :showButton="false"
              />

              <div
                v-for="(field, index) in activeFields"
                :key="activeTab + '-' + index"
                class="border border-gray-200 rounded-sm overflow-hidden"
              >
                <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div class="flex items-center gap-3">
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
                    <span class="text-sm font-medium text-gray-600">{{ t('eventSetting.required') }}</span>
                  </div>

                  <button
                    @click="handleRemove(index)"
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors focus:outline-none"
                    style="border-radius: 8px;"
                    :title="t('eventSetting.deleteTitle')"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                    </svg>
                  </button>
                </div>

                <div class="flex items-center gap-3 px-4 py-3 bg-white">
                  <input
                    v-model="field.name"
                    type="text"
                    :placeholder="t('eventSetting.fieldPlaceholder')"
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

              <div class="sticky bottom-0 z-10 mt-auto bg-white flex items-center justify-between py-4 border-t border-gray-100">
    
                <button
                  @click="handleAddField"
                  class="flex items-center gap-2 px-4 py-2 border-2 border-[#F7941D] text-[#F7941D] text-sm font-medium hover:bg-[#FFF9F0] active:scale-95 transition-all focus:outline-none"
                  style="border-radius: 8px;"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  {{ t('eventSetting.addForm') }}
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
                  {{ isSaving ? t('eventSetting.saving') : t('eventSetting.saveChanges') }}
                </button>
                
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
</style>