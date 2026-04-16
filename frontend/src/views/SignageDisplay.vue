<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getSignageBySlug, getSignageById } from '@/services/signageService';

const route = useRoute();

// ─── State ────────────────────────────────────────────────────────────────────
const signage = ref(null);
const isLoading = ref(true);
const error = ref(null);
const currentTime = ref('');
let timeInterval = null;

// ─── Layout panels computed ───────────────────────────────────────────────────
const layoutPanels = computed(() => {
  if (!signage.value) return [{ flex: 1 }];
  const layout = signage.value.layout || 'fullscreen';

  const layouts = {
    'fullscreen': [{ flex: 1 }],
    '1-1': [{ flex: 1 }, { flex: 1 }],
    '1-2': [{ flex: 1 }, { flex: 2 }],
    '2-1': [{ flex: 2 }, { flex: 1 }],
    '1-1-1': [{ flex: 1 }, { flex: 1 }, { flex: 1 }],
    'fullscreen-header': [{ flex: 2 }, { flex: 1, hasHeader: true }],
  };

  return layouts[layout] || [{ flex: 1 }];
});

const panelFiles = computed(() => {
  if (!signage.value) return {};
  let fls = signage.value.files || signage.value.file || signage.value.media;
  if (typeof fls === 'string') {
    try {
      fls = JSON.parse(fls);
    } catch {
      fls = {};
    }
  }
  return fls || {}; 
});

const getFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  // Try to fix relative storage URLs if they are not absolute
  if (url.startsWith('storage/')) {
    return `https://visitorku.io/${url}`;
  }
  return `https://visitorku.io/storage/${url.replace(/^\/+/, '')}`;
};

const runningText = computed(() => signage.value?.running_text || signage.value?.runningText || '');

// ─── Clock ────────────────────────────────────────────────────────────────────
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

// ─── Fetch Signage ────────────────────────────────────────────────────────────
const fetchSignage = async () => {
  isLoading.value = true;
  try {
    const slug = route.params.slug;
    const res = await getSignageBySlug(slug);
    const data = res.data?.data || res.data;
    signage.value = data;
  } catch (err) {
    console.error('Gagal memuat signage:', err);
    error.value = 'Signage tidak ditemukan.';
  } finally {
    isLoading.value = false;
  }
};

// ─── Determine if a URL is a video ───────────────────────────────────────────
const isVideo = (url) => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.ogg');
};

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  fetchSignage();
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
});
</script>

<template>
  <div class="signage-display">
    <!-- Loading -->
    <div v-if="isLoading" class="loading-container">
      <div class="loader"></div>
      <p>Memuat signage...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-container">
      <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p class="text-lg text-gray-500">{{ error }}</p>
    </div>

    <!-- Signage Content -->
    <template v-else>
      <!-- Logo top right -->
      <div class="logo-badge">
        <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z"/>
        </svg>
        <span class="text-white text-xs font-semibold">visitorku</span>
      </div>

      <!-- Main content area -->
      <div class="content-area">
        <div
          v-for="(panel, pIdx) in layoutPanels"
          :key="pIdx"
          class="panel"
          :style="{ flex: panel.flex }"
        >
          <!-- If has uploaded file -->
         <template v-if="panelFiles[pIdx] && panelFiles[pIdx][0] && panelFiles[pIdx][0].url">
  <video
    v-if="isVideo(panelFiles[pIdx][0].url)"
    :src="getFileUrl(panelFiles[pIdx][0].url)" 
    class="panel-media"
    autoplay
    loop
    muted
  ></video>
  
  <img
    v-else
    :src="getFileUrl(panelFiles[pIdx][0].url)" 
    alt="Signage content"
    class="panel-media"
  />
</template>
          <!-- No image placeholder -->
          <template v-else>
            <div class="no-image">
              <svg class="w-10 h-10 text-white/60 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span class="text-white/60 text-sm">No Image</span>
            </div>
          </template>
        </div>
      </div>

      <!-- Footer Bar -->
      <div class="footer-bar">
        <div class="footer-time">
          {{ currentTime }}
        </div>
        <div class="footer-running-text">
          <div class="ticker-wrapper" v-if="runningText">
            <span class="ticker-text">{{ runningText }}</span>
          </div>
          <span v-else class="text-gray-400 text-sm">{{ signage?.name || '' }}</span>
        </div>
        <div class="footer-logo">
          <svg class="w-4 h-4 text-[#F7941D]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z"/>
          </svg>
          <span class="text-[#F7941D] text-xs font-semibold">visitorku</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.signage-display {
  position: fixed;
  inset: 0;
  background: #000;
  display: flex;
  flex-direction: column;
  font-family: 'Poppins', sans-serif;
  overflow: hidden;
}

/* Loading */
.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  gap: 16px;
}

.loader {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #F7941D;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error */
.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Logo Badge */
.logo-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: #F7941D;
  padding: 6px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Content Area */
.content-area {
  flex: 1;
  display: flex;
  gap: 0;
  overflow: hidden;
}

.panel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #D4A017;
  overflow: hidden;
}

.panel-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Footer */
.footer-bar {
  display: flex;
  align-items: center;
  height: 42px;
  background: #fff;
  border-top: 2px solid #E5E7EB;
  flex-shrink: 0;
}

.footer-time {
  padding: 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: #1E293B;
  white-space: nowrap;
  border-right: 1px solid #E5E7EB;
}

.footer-running-text {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
}

.ticker-wrapper {
  display: inline-block;
  white-space: nowrap;
  animation: ticker 15s linear infinite;
}

.ticker-text {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

@keyframes ticker {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

.footer-logo {
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-left: 1px solid #E5E7EB;
}
</style>
