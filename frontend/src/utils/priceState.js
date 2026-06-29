import { reactive } from 'vue';

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
