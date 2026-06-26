<template>
  <div class="w-full h-full flex flex-col">
    <main class="bg-white rounded-2xl shadow-sm h-full min-h-[calc(100vh-7rem)] flex flex-col relative w-full">
      <div class="p-6 flex-1 flex flex-col overflow-y-auto">

        <!-- Header -->
        <div class="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
          <button
            @click="router.push('/profil-perusahaan')"
            class="w-8 h-8 flex items-center justify-center bg-[#FEF4E3] text-[#F7941D] rounded-sm hover:bg-[#F7941D] hover:text-white transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <div>
            <h1 class="text-xl font-semibold text-gray-800">Upgrade Paket</h1>
            <p class="text-sm text-gray-500 mt-0.5">Pilih paket yang sesuai dengan kebutuhan perusahaan Anda</p>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="flex justify-center py-16">
          <svg class="animate-spin w-8 h-8 text-[#F7941D]" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <template v-else>
          <!-- Current plan info card -->
          <div class="max-w-3xl mx-auto w-full space-y-4">

            <!-- Active plan highlight -->
            <div class="bg-[#FFF8F0] border border-[#F7941D]/30 rounded-sm p-5 flex items-center justify-between mb-6">
              <div>
                <p class="text-[12px] text-gray-400 mb-0.5">Paket Aktif</p>
                <p class="text-[16px] font-bold text-gray-900">{{ priceData.planName || 'Visitorku Free' }}</p>
              </div>
              <span class="text-[15px] font-bold text-[#F7941D]">
                {{ priceData.price === 0 ? 'Rp 0' : 'Rp ' + priceData.price.toLocaleString('id-ID') }}
                <span class="text-[12px] font-normal text-gray-500"> /month</span>
              </span>
            </div>

            <!-- Plan cards -->
            <div
              v-for="plan in allPlans"
              :key="plan.id"
              class="border rounded-sm bg-white overflow-hidden transition-all"
              :class="plan.name === priceData.planName
                ? 'border-[#F7941D] shadow-sm'
                : 'border-gray-200 hover:border-gray-300'"
            >
              <!-- Plan header (accordion toggle) -->
              <button
                @click="togglePlan(plan.id)"
                class="w-full flex items-center justify-between px-6 py-5 text-left transition"
                :class="plan.name === priceData.planName ? 'bg-[#FFF8F0]' : 'hover:bg-gray-50'"
              >
                <div class="flex items-center gap-3">
                  <span class="text-[15px] font-bold text-gray-900">{{ plan.name }}</span>
                  <span
                    v-if="plan.name === priceData.planName"
                    class="text-[10px] font-semibold px-2 py-0.5 bg-[#F7941D] text-white rounded-sm"
                  >Aktif</span>
                </div>
                <div class="flex items-center gap-4">
                  <span v-if="plan.price > 0" class="text-[15px] font-bold text-gray-900">
                    Rp {{ plan.price.toLocaleString('id-ID') }}
                    <span class="text-[12px] font-normal text-gray-500"> /month</span>
                  </span>
                  <span v-else class="text-[13px] text-gray-400 italic">Contact Admin</span>
                  <svg
                    class="w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0"
                    :class="{ 'rotate-180': openPlanId === plan.id }"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </button>

              <!-- Accordion content -->
              <div v-if="openPlanId === plan.id" class="px-6 pb-6 border-t border-gray-100">
                <p class="text-[12px] text-gray-400 mt-4 mb-4">Features</p>

                <!-- CTA button -->
                <div class="mt-4">
                  <span
                    v-if="plan.name === priceData.planName"
                    class="inline-flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-400 text-[13px] font-semibold rounded-sm cursor-default"
                  >
                    <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Paket Anda Saat Ini
                  </span>
                  <button
                    v-else-if="plan.price > 0"
                    @click="handleChoosePlan(plan)"
                    :disabled="isUpgrading"
                    class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F7941D] text-white text-[13px] font-semibold rounded-sm hover:bg-[#e0860f] transition disabled:opacity-50"
                  >
                    <svg v-if="isUpgrading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Choose This Plan
                  </button>
                </div>
              </div>
            </div>

            <!-- Custom plan row -->
            <div class="border border-gray-200 rounded-sm bg-white px-6 py-5 flex items-center justify-between">
              <span class="text-[15px] font-bold text-gray-900">Custom</span>
              <span class="text-[13px] text-gray-400 italic">Contact Admin For More Information</span>
            </div>

          </div>
        </template>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { priceState } from '@/utils/priceState';
import { getPriceAll, getPriceMe, upgradePricePlan } from '@/services/companyProfileService';
import { confirmDelete, showToast, showError, parseApiError } from '@/utils/alertHelper';

const router = useRouter();
const priceData = priceState;

const isLoading = ref(false);
const isUpgrading = ref(false);
const openPlanId = ref(null);
const allPlans = ref([]);

const togglePlan = (id) => {
  openPlanId.value = openPlanId.value === id ? null : id;
};

const fetchPlans = async () => {
  isLoading.value = true;
  try {
    const [meRes, allRes] = await Promise.allSettled([getPriceMe(), getPriceAll()]);

    if (meRes.status === 'fulfilled') {
      const me = meRes.value?.data || meRes.value || {};
      priceData.planName    = me.name || me.package_name || 'Visitorku Free';
      priceData.planType    = me.type || (me.price === 0 ? 'free' : 'paid');
      priceData.price       = me.price ?? 0;
      priceData.visitUsed   = me.visit_used ?? me.used_visit ?? 0;
      priceData.visitLimit  = me.visit_limit ?? me.max_visit ?? 0;
      priceData.storageUsedMB  = (me.storage_used ?? me.used_storage ?? 0) / (1024 * 1024);
      priceData.storageLimitMB = (me.storage_limit ?? me.max_storage ?? 0) / (1024 * 1024);
      priceData.userUsed    = me.user_used ?? me.used_user ?? 0;
      priceData.userLimit   = me.user_limit ?? me.max_user ?? 0;
      priceData.branchUsed  = me.branch_used ?? me.used_branch ?? 0;
      priceData.branchLimit = me.branch_limit ?? me.max_branch ?? 0;
    }

    if (allRes.status === 'fulfilled') {
      const raw = allRes.value?.data || allRes.value || [];
      allPlans.value = Array.isArray(raw) ? raw.map(p => ({
        id:       p.id,
        name:     p.name || p.package_name || 'Plan',
        price:    p.price ?? 0,
        features: p.features || [],
      })) : [];
      priceData.allPlans = allPlans.value;
    }

    priceData.isLoaded = true;
  } catch (err) {
    console.warn('Gagal memuat data harga:', err);
  } finally {
    isLoading.value = false;
  }
};

const handleChoosePlan = async (plan) => {
  const confirmed = await confirmDelete(`Upgrade ke paket ${plan.name}?`);
  if (!confirmed) return;
  isUpgrading.value = true;
  try {
    await upgradePricePlan({ price_id: plan.id });
    showToast(`Berhasil upgrade ke paket ${plan.name}!`, 'success');
    await fetchPlans();
    openPlanId.value = null;
  } catch (error) {
    showError(parseApiError(error, 'Terjadi kesalahan saat upgrade paket.'));
  } finally {
    isUpgrading.value = false;
  }
};

onMounted(() => {
  // If priceState is already loaded (came from ProfilPerusahaan), still refresh
  fetchPlans();
});
</script>

<style scoped>
button:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>
