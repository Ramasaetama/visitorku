<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalData: {
    type: Number,
    required: true,
  },
  perPage: {
    type: Number,
    default: 10,
  },
})

const emit = defineEmits(['update:currentPage'])

const totalPages = computed(() => Math.ceil(props.totalData / props.perPage) || 1)

// 🌟 FIX: Logika baru! Murni cuma nampilin 5 angka sejajar tanpa titik-titik (Ellipsis)
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = props.currentPage
  const maxVisible = 5

  let start = current - Math.floor(maxVisible / 2)
  let end = current + Math.floor(maxVisible / 2)

  if (start < 1) {
    start = 1
    end = Math.min(total, maxVisible)
  }

  if (end > total) {
    end = total
    start = Math.max(1, total - maxVisible + 1)
  }

  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const showingCount = computed(() => {
  if (props.totalData === 0) return 0
  const end = Math.min(props.currentPage * props.perPage, props.totalData)
  const start = (props.currentPage - 1) * props.perPage + 1
  return end - start + 1
})

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('update:currentPage', page)
  }
}
</script>

<template>
  <div class="flex flex-col md:flex-row items-center justify-between gap-4 p-5 md:p-6 border-t border-gray-100 font-['Poppins']">
    
    <div class="text-[13px] text-gray-500 font-medium text-center md:text-left">
      {{ t('pagination.showing', { count: showingCount, total: totalData }) }}
    </div>

    <div class="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
      
      <button
        type="button"
        @click.prevent="changePage(1)"
        :disabled="currentPage === 1"
        class="px-3.5 py-1.5 border border-[#F7941D] rounded-sm text-[13px] font-medium text-[#F7941D] bg-white hover:bg-[#FFF9F0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none"
      >
        {{ t('pagination.first') }}
      </button>

      <button
        v-for="page in visiblePages"
        :key="page"
        type="button"
        @click.prevent="changePage(page)"
        class="w-8 h-8 flex items-center justify-center rounded-sm text-[13px] font-medium transition-colors focus:outline-none"
        :class="
          currentPage === page
            ? 'bg-[#F7941D] text-white border border-[#F7941D]'
            : 'border border-gray-200 text-[#F7941D] bg-white hover:bg-[#FFF9F0]'
        "
      >
        {{ page }}
      </button>

      <button
        type="button"
        @click.prevent="changePage(totalPages)"
        :disabled="currentPage === totalPages"
        class="px-3.5 py-1.5 border border-[#F7941D] rounded-sm text-[13px] font-medium text-[#F7941D] bg-white hover:bg-[#FFF9F0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none"
      >
        {{ t('pagination.last') }}
      </button>

    </div>
  </div>
</template>

<style scoped>
button:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>