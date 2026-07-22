<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { Calendar, AlertTriangle, Clock, TrendingUp, Users, CreditCard } from "lucide-vue-next"
import { useTransactions, type TransactionRow } from "@/composables/useTransactions"
import PaymentsAddPaymentSheet from "@/components/payments/AddPaymentSheet.vue"

definePageMeta({
  layout: "default"
})

const { transactions, loading, fetchTransactions } = useTransactions()
const refreshKey = ref(0)

onMounted(() => {
  fetchTransactions()
})

// ----- Helpers -----
function getDaysOverdue(dateStr: string | null): number {
  if (!dateStr) return 0
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount)
}

// ----- Computed KPI Stats -----
const unpaidList = computed(() => transactions.value.filter(t => !t.is_paid))

const allUnpaidCustomerCount = computed(() => new Set(unpaidList.value.map(t => t.customer_id)).size)
const totalUnpaidAmount = computed(() => unpaidList.value.reduce((sum, t) => sum + Number(t.total_amount || 0), 0))

const overdueList = computed(() =>
  unpaidList.value.filter(t => {
    const d = getDaysOverdue(t.date_utang || t.created_at)
    return d >= 14 && d <= 365
  })
)

const criticalList = computed(() =>
  unpaidList.value.filter(t => getDaysOverdue(t.date_utang || t.created_at) > 90)
)

const overdueCustomerIds = computed(() => new Set(overdueList.value.map(t => t.customer_id)))
const overdueCustomerCount = computed(() => overdueCustomerIds.value.size)

const criticalCustomerCount = computed(() =>
  new Set(criticalList.value.map(t => t.customer_id)).size
)

const totalOverdueAmount = computed(() =>
  overdueList.value.reduce((sum, t) => sum + Number(t.total_amount || 0), 0)
)

const avgDaysOverdue = computed(() => {
  const targetIds = overdueCustomerIds.value.size ? overdueCustomerIds.value : new Set(unpaidList.value.map(t => t.customer_id))
  if (!targetIds.size) return 0
  const perCustomerOldest = new Map<string, number>()
  unpaidList.value.forEach(t => {
    const days = getDaysOverdue(t.date_utang || t.created_at)
    const prev = perCustomerOldest.get(t.customer_id) ?? 0
    if (days > prev) perCustomerOldest.set(t.customer_id, days)
  })
  const total = Array.from(perCustomerOldest.values()).reduce((s, d) => s + d, 0)
  return Math.round(total / perCustomerOldest.size)
})

// ----- Reminder Modal -----
const reminderOpen = ref(false)
const selectedTransaction = ref<TransactionRow | null>(null)

function openReminder(tx: TransactionRow) {
  selectedTransaction.value = tx
  reminderOpen.value = true
}

const payOpen = ref(false)
const payTransaction = ref<TransactionRow | null>(null)

function openPayment(tx: TransactionRow) {
  payTransaction.value = tx
  payOpen.value = true
}

function onPaySuccess() {
  refreshKey.value++
  payOpen.value = false
  fetchTransactions()
}

const stats = computed(() => [
  {
    label: "Total Unpaid Balance",
    value: formatCurrency(totalUnpaidAmount.value),
    sub: `Across ${allUnpaidCustomerCount.value} customer${allUnpaidCustomerCount.value !== 1 ? "s" : ""}`,
    icon: CreditCard,
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
    valueColor: "text-rose-600 dark:text-rose-400",
  },
  {
    label: "Unpaid Customers",
    value: String(allUnpaidCustomerCount.value),
    sub: `(${overdueCustomerCount.value} 2wk–1yr overdue)`,
    icon: Users,
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-600 dark:text-orange-400",
    valueColor: "text-orange-600 dark:text-orange-400",
  },
  {
    label: "Critical Accounts (>90 Days)",
    value: String(criticalCustomerCount.value),
    sub: "Customers needing immediate action",
    icon: AlertTriangle,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    valueColor: "text-amber-600 dark:text-amber-400",
  },
  {
    label: "Avg Days Unpaid",
    value: `${avgDaysOverdue.value}d`,
    sub: "Based on each customer's oldest loan",
    icon: Clock,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    valueColor: "text-violet-600 dark:text-violet-400",
  },
])
</script>

<template>
  <div class="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
      <div class="flex items-center gap-2.5">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <Calendar class="h-5 w-5" />
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground">Due Dates & Overdue Accounts</h1>
          <p class="text-xs text-muted-foreground mt-0.5">Track and collect unpaid loans from 2 weeks to over 1 year overdue</p>
        </div>
      </div>

      <!-- Record Payment Button (reuse existing component) -->
      <PaymentsAddPaymentSheet @success="refreshKey++; fetchTransactions()" />
    </div>

    <!-- KPI Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-2xs hover:shadow-xs transition-all"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">{{ stat.label }}</span>
          <div :class="['flex h-8 w-8 items-center justify-center rounded-lg', stat.iconBg, stat.iconColor]">
            <component :is="stat.icon" class="h-4 w-4" />
          </div>
        </div>
        <div :class="['mt-3 text-xl font-bold', stat.valueColor]">{{ stat.value }}</div>
        <div class="mt-1 text-[11px] text-muted-foreground">{{ stat.sub }}</div>
      </div>
    </div>

    <!-- Overdue Warning Banner (shown if critical accounts exist) -->
    <div
      v-if="criticalCustomerCount > 0"
      class="flex items-start gap-3 rounded-xl border border-rose-200/80 bg-rose-50/60 dark:bg-rose-950/20 dark:border-rose-800/60 p-4"
    >
      <AlertTriangle class="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
      <div>
        <p class="text-sm font-semibold text-rose-700 dark:text-rose-400">
          {{ criticalCustomerCount }} customer{{ criticalCustomerCount !== 1 ? "s" : "" }} with unpaid balances older than 90 days require immediate attention
        </p>
        <p class="text-xs text-rose-600/80 dark:text-rose-500 mt-0.5">
          Click on a customer row to expand and view their individual overdue transactions. Send reminders or record payments now.
        </p>
      </div>
    </div>

    <!-- Due Date Table Component -->
    <DueDatesDueDateTable
      :key="refreshKey"
      @openReminder="openReminder"
      @openPayment="openPayment"
    />

    <!-- Send Reminder Modal -->
    <DueDatesSendReminderModal
      :open="reminderOpen"
      :transaction="selectedTransaction"
      @update:open="reminderOpen = $event"
    />
  </div>
</template>
