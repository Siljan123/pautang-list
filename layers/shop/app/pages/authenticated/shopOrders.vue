<script setup lang="ts">
import { Bell, RefreshCw, Filter, ChefHat, Clock } from 'lucide-vue-next'
import type { OrderStatus } from '~/composables/useFoodOrders'

definePageMeta({ layout: 'default' })

useHead({ title: 'Shop Orders | Pautang List' })

const { orders, loading, pendingCount, fetchOrders, updateOrderStatus, subscribeToOrders } = useFoodOrders()
const user = useSupabaseUser()

let unsubscribe: (() => void) | null = null

onMounted(async () => {
  await fetchOrders()
  if (user.value?.id) {
    unsubscribe = subscribeToOrders(user.value.id)
  }
})

onUnmounted(() => {
  unsubscribe?.()
})

// Filter
const statusFilter = ref<string>('all')
const statusOptions = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: '⏳ Pending' },
  { value: 'preparing', label: '🍳 Preparing' },
  { value: 'ready', label: '✅ Ready' },
  { value: 'done', label: '🏁 Done' },
  { value: 'cancelled', label: '✕ Cancelled' },
]

const filteredOrders = computed(() => {
  if (statusFilter.value === 'all') return orders.value
  return orders.value.filter(o => o.status === statusFilter.value)
})

const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending'))
const preparingOrders = computed(() => orders.value.filter(o => o.status === 'preparing'))

async function handleStatusUpdate(id: string, status: OrderStatus) {
  await updateOrderStatus(id, status)
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)
}
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="relative">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20">
            <Bell class="h-5 w-5 text-orange-500" />
          </div>
          <span
            v-if="pendingCount > 0"
            class="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow"
          >{{ pendingCount }}</span>
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground">Shop Orders</h1>
          <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Live feed of customer orders. Updates in real-time.
          </p>
        </div>
      </div>
      <button
        @click="fetchOrders"
        :disabled="loading"
        class="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/60 transition-all disabled:opacity-50"
      >
        <RefreshCw :class="['h-3.5 w-3.5', loading && 'animate-spin']" />
        Refresh
      </button>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div v-for="{ value: s, label: l } in statusOptions.slice(1)" :key="s"
        class="rounded-xl border border-border bg-card p-3 text-center hover:border-orange-500/30 transition-all cursor-pointer"
        @click="statusFilter = s"
        :class="statusFilter === s ? 'border-orange-500/40 bg-orange-500/5' : ''"
      >
        <div class="text-xl font-extrabold text-foreground">
          {{ orders.filter(o => o.status === s).length }}
        </div>
        <div class="text-[11px] text-muted-foreground mt-0.5">{{ l }}</div>
      </div>
    </div>

    <!-- Urgent Alert -->
    <div
      v-if="pendingOrders.length > 0"
      class="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"
    >
      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
        <Clock class="h-4 w-4 text-amber-500" />
      </div>
      <div class="flex-1">
        <p class="text-sm font-bold text-foreground">
          {{ pendingOrders.length }} new order{{ pendingOrders.length !== 1 ? 's' : '' }} waiting!
        </p>
        <p class="text-xs text-muted-foreground">Start preparing to keep customers happy.</p>
      </div>
      <button
        @click="statusFilter = 'pending'"
        class="rounded-lg bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/30 transition-colors"
      >
        View →
      </button>
    </div>

    <!-- Filter tabs -->
    <div class="flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="opt in statusOptions"
        :key="opt.value"
        @click="statusFilter = opt.value"
        :class="[
          'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
          statusFilter === opt.value
            ? 'border-orange-500/50 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow'
            : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80 hover:text-foreground'
        ]"
      >
        {{ opt.label }}
        <span v-if="opt.value !== 'all'" class="ml-1 opacity-70">({{ orders.filter(o => o.status === opt.value).length }})</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="h-48 rounded-2xl bg-muted/30 animate-pulse" />
    </div>

    <!-- Empty -->
    <div v-else-if="!filteredOrders.length" class="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
      <ChefHat class="h-12 w-12 opacity-30" />
      <p class="font-semibold">{{ statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter} orders` }}</p>
      <p class="text-sm text-center max-w-xs">
        {{ statusFilter === 'all' ? 'Share your shop link with customers to start receiving orders!' : 'No orders with this status right now.' }}
      </p>
    </div>

    <!-- Orders Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <TransitionGroup name="order-card">
        <CustomShopOrderCard
          v-for="order in filteredOrders"
          :key="order.id"
          :order="order"
          @update-status="handleStatusUpdate"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.order-card-enter-active, .order-card-leave-active { transition: all 0.3s ease; }
.order-card-enter-from { opacity: 0; transform: translateY(-16px); }
.order-card-leave-to { opacity: 0; transform: scale(0.95); }
</style>
