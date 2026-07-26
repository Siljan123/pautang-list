<script setup lang="ts">
import { onMounted, computed } from 'vue'
import {
  Users,
  Wallet,
  ArrowDownLeft,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
  ShoppingBag
} from 'lucide-vue-next'
import { useTransactions } from '@/composables/useTransactions'

definePageMeta({
  layout: 'default'
})

const { transactions, loading, fetchTransactions } = useTransactions()
const { orders, pendingCount, fetchOrders } = useFoodOrders()

onMounted(() => {
  fetchTransactions()
  fetchOrders()
})

// Calculate live stats from Supabase transactions
const totalCollectible = computed(() => {
  return transactions.value
    .filter(t => !t.is_paid)
    .reduce((sum, t) => sum + Number(t.total_amount || 0), 0)
})

const totalCollected = computed(() => {
  return transactions.value
    .filter(t => t.is_paid)
    .reduce((sum, t) => sum + Number(t.total_amount || 0), 0)
})

const unpaidCount = computed(() => {
  return transactions.value.filter(t => !t.is_paid).length
})

const paidCount = computed(() => {
  return transactions.value.filter(t => t.is_paid).length
})

// Recent 5 transactions for history table
const recentTransactions = computed(() => {
  return transactions.value.slice(0, 6)
})

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}


</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Welcome Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
        <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Here is what's happening with your loan receivables and transaction history.
        </p>
      </div>
    </div>

    <!-- Live Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Collectible -->
      <div class="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-2xs hover:shadow-xs transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">Total Unpaid (Collectible)</span>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Wallet class="h-4 w-4" />
          </div>
        </div>
        <div class="mt-3">
          <div class="text-xl font-bold text-foreground">{{ formatCurrency(totalCollectible) }}</div>
          <div class="mt-1 text-[11px] text-muted-foreground">
            <span class="text-rose-600 font-semibold">{{ unpaidCount }} active unpaid</span> transactions
          </div>
        </div>
      </div>

      <!-- Total Collected -->
      <div class="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-2xs hover:shadow-xs transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">Total Collected</span>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <ArrowDownLeft class="h-4 w-4" />
          </div>
        </div>
        <div class="mt-3">
          <div class="text-xl font-bold text-foreground">{{ formatCurrency(totalCollected) }}</div>
          <div class="mt-1 text-[11px] text-muted-foreground">
            <span class="text-emerald-600 font-semibold">{{ paidCount }} paid</span> transactions
          </div>
        </div>
      </div>

      <!-- Total Transactions -->
      <div class="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-2xs hover:shadow-xs transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">Total Transactions</span>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Receipt class="h-4 w-4" />
          </div>
        </div>
        <div class="mt-3">
          <div class="text-xl font-bold text-foreground">{{ transactions.length }}</div>
          <div class="mt-1 text-[11px] text-muted-foreground">
            Recorded in database
          </div>
        </div>
      </div>

      <!-- Pending Items -->
      <div class="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-2xs hover:shadow-xs transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">Pending Items</span>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle class="h-4 w-4" />
          </div>
        </div>
        <div class="mt-3">
          <div class="text-xl font-bold text-foreground">{{ unpaidCount }}</div>
          <div class="mt-1 text-[11px] text-muted-foreground">
            Awaiting payment
          </div>
        </div>
      </div>
      <!-- Pending Orders (new) -->
      <div class="relative overflow-hidden rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-red-500/5 p-4 shadow-2xs hover:shadow-xs transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">Pending Orders</span>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
            <ShoppingBag class="h-4 w-4" />
          </div>
        </div>
        <div class="mt-3">
          <div class="text-xl font-bold text-foreground">{{ pendingCount }}</div>
          <div class="mt-1 text-[11px] text-muted-foreground">
            <span class="text-orange-500 font-semibold">{{ orders.length }} total</span> food orders
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Area Chart & Transaction History -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Area Chart Graph (Real Supabase Data) -->
        <CustomAuthenticatedDashboardChart :transactions="transactions" />

        <!-- Recent Transaction History Table -->
        <div class="rounded-xl border border-border bg-card p-5 shadow-2xs">
          <div class="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h2 class="text-base font-semibold text-foreground">Transaction History</h2>
              <p class="text-xs text-muted-foreground">Real-time recent transactions from Supabase</p>
            </div>
            <NuxtLink
              to="/authenticated/transactionList"
              class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1"
            >
              View all
              <ArrowUpRight class="h-3.5 w-3.5" />
            </NuxtLink>
          </div>

          <div class="mt-4 overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  <th class="pb-3 pl-1">Borrower</th>
                  <th class="pb-3">Amount</th>
                  <th class="pb-3">Date</th>
                  <th class="pb-3">Notes</th>
                  <th class="pb-3 text-right pr-1">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border/40">
                <tr v-if="loading">
                  <td colspan="5" class="py-8 text-center text-muted-foreground">
                    Loading recent transactions...
                  </td>
                </tr>

                <tr v-else-if="!recentTransactions.length">
                  <td colspan="5" class="py-8 text-center text-muted-foreground">
                    No transaction history recorded yet.
                  </td>
                </tr>

                <tr
                  v-for="t in recentTransactions"
                  :key="t.id"
                  class="hover:bg-muted/40 transition-colors"
                >
                  <td class="py-3 pl-1">
                    <div class="flex items-center gap-2.5">
                      <div class="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[10px]">
                        {{ (t.customer?.name) }}
                      </div>
                      <span class="font-semibold text-foreground">
                        {{ t.customer?.name || 'Unknown Borrower' }}
                      </span>
                    </div>
                  </td>
                  <td class="py-3 font-bold text-foreground">
                    {{ formatCurrency(t.total_amount) }}
                  </td>
                  <td class="py-3 text-muted-foreground">
                    {{ formatDate(t.date_utang) }}
                  </td>
                  <td class="py-3 text-muted-foreground max-w-[150px] truncate">
                    {{ t.notes || '—' }}
                  </td>
                  <td class="py-3 text-right pr-1">
                    <span
                      v-if="t.is_paid"
                      class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60"
                    >
                      <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Paid
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60"
                    >
                      <span class="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      Unpaid
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Side Quick Actions Card -->
      <div class="space-y-6">
        <div class="rounded-xl border border-border bg-card p-5 shadow-2xs space-y-4">
          <h2 class="text-base font-semibold text-foreground pb-3 border-b border-border">Quick Actions</h2>
          
          <div class="space-y-2.5">
            <NuxtLink
              to="/authenticated/shopMenu"
              class="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-orange-500/5 hover:border-orange-500/30 transition-all text-xs font-medium text-foreground group"
            >
              <span class="flex items-center gap-2.5">
                <ShoppingBag class="h-4 w-4 text-orange-500" />
                Manage Food Shop
              </span>
              <ArrowUpRight class="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
            </NuxtLink>

            <NuxtLink
              to="/authenticated/paymentHistory"
              class="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all text-xs font-medium text-foreground group"
            >
              <span class="flex items-center gap-2.5">
                <ArrowDownLeft class="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Record Payment Received
              </span>
              <ArrowUpRight class="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
            </NuxtLink>

            <NuxtLink
              to="/authenticated/transactionList"
              class="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all text-xs font-medium text-foreground group"
            >
              <span class="flex items-center gap-2.5">
                <Receipt class="h-4 w-4 text-blue-500" />
                Manage All Transactions
              </span>
              <ArrowUpRight class="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
            </NuxtLink>

            <NuxtLink
              to="/authenticated/transactionList"
              class="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-blue-500/5 hover:border-blue-500/30 transition-all text-xs font-medium text-foreground group"
            >
              <span class="flex items-center gap-2.5">
                <Users class="h-4 w-4 text-blue-500" />
                Add & View Borrowers
              </span>
              <ArrowUpRight class="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>