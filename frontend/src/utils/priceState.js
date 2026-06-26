import { reactive } from 'vue';

/**
 * Shared reactive state for the active price plan.
 * Updated by ProfilPerusahaan on mount and after upgrade.
 * Consumed by Sidebar to render the package widget.
 */
export const priceState = reactive({
  // Current plan info
  planName: '',       // e.g. "Visitorku Free"
  planType: 'free',  // "free" | "paid"
  price: 0,
  priceLabel: 'Rp 0 /month',

  // Usage counters
  visitUsed: 0,
  visitLimit: 0,      // 0 = unlimited
  storageUsedMB: 0,
  storageLimitMB: 0,  // 0 = unlimited
  userUsed: 0,
  userLimit: 0,
  branchUsed: 0,
  branchLimit: 0,

  // All available plans for the upgrade modal
  allPlans: [],

  // loading flag
  isLoaded: false,
});
