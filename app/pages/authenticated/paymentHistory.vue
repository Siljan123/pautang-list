<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { History, ArrowDownLeft, Receipt, CheckCircle2 } from 'lucide-vue-next'
import { usePayments } from '@/composables/usePayments'

definePageMeta({
  layout: 'default'
})

const refreshKey = ref(0)
const { payments, fetchPayments } = usePayments()

onMounted(() => {
  fetchPayments()
})

const totalCollected = computed(() => {
  return payments.value.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0)
})

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)
}
</script>

<template>
  <div class="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
      <div class="flex items-center gap-2.5">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <History class="h-5 w-5" />
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground">Payments & Income History</h1>
          <p class="text-xs text-muted-foreground mt-0.5">Record customer payments and view collected income history</p>
        </div>
      </div>

      <PaymentsAddPaymentSheet @success="refreshKey++; fetchPayments()" />
    </div>

    <!-- Summary Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="rounded-xl border border-border bg-card p-4 shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">Total Income Collected</span>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
            <ArrowDownLeft class="h-4 w-4" />
          </div>
        </div>
        <div class="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
          {{ formatCurrency(totalCollected) }}
        </div>
      </div>

      <div class="rounded-xl border border-border bg-card p-4 shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">Total Payment Entries</span>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
            <Receipt class="h-4 w-4" />
          </div>
        </div>
        <div class="mt-2 text-xl font-bold text-foreground">
          {{ payments.length }}
        </div>
      </div>

      <div class="rounded-xl border border-border bg-card p-4 shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">Status</span>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
            <CheckCircle2 class="h-4 w-4" />
          </div>
        </div>
        <div class="mt-2 text-xl font-bold text-foreground flex items-center gap-1.5 text-xs text-emerald-600">
          <span>Synced with Supabase</span>
        </div>
      </div>
    </div>

    <!-- Payment History Table -->
    <PaymentsPaymentTable :key="refreshKey" />
  </div>
</template>
