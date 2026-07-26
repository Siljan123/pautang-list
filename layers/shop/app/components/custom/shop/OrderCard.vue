<script setup lang="ts">
import { Clock, Phone, User, CheckCircle2, ChefHat, PackageCheck, XCircle, MessageSquare } from 'lucide-vue-next'
import type { FoodOrder, OrderStatus } from '~/composables/useFoodOrders'

const props = defineProps<{
  order: FoodOrder
}>()

const emit = defineEmits<{
  'update-status': [id: string, status: OrderStatus]
}>()

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return 'Just now'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-PH', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    month: 'short',
    day: 'numeric',
  }).format(date)
}

const parsedItems = computed(() => {
  if (!props.order.items) return []
  if (typeof props.order.items === 'string') {
    try {
      return JSON.parse(props.order.items)
    } catch {
      return []
    }
  }
  return Array.isArray(props.order.items) ? props.order.items : []
})

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  pending: {
    label: 'Pending',
    class: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    icon: Clock,
  },
  preparing: {
    label: 'Preparing',
    class: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    icon: ChefHat,
  },
  ready: {
    label: 'Ready',
    class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    icon: CheckCircle2,
  },
  done: {
    label: 'Completed',
    class: 'bg-muted text-muted-foreground border-border',
    icon: PackageCheck,
  },
  cancelled: {
    label: 'Cancelled',
    class: 'bg-red-500/10 text-red-500 border-red-500/30',
    icon: XCircle,
  },
}
</script>

<template>
  <div class="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all">
    <!-- Top Header -->
    <div class="space-y-3">
      <div class="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-foreground text-base leading-tight">
              {{ order.customer_name || 'Customer' }}
            </h3>
          </div>
          <p v-if="order.customer_contact" class="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <Phone class="h-3 w-3 text-orange-500" />
            {{ order.customer_contact }}
          </p>
        </div>

        <!-- Status Badge -->
        <span
          :class="[
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold shrink-0',
            statusConfig[order.status]?.class ?? 'bg-muted text-muted-foreground border-border'
          ]"
        >
          <component :is="statusConfig[order.status]?.icon" class="h-3.5 w-3.5" />
          {{ statusConfig[order.status]?.label ?? order.status }}
        </span>
      </div>

      <!-- Items List -->
      <div class="space-y-2 py-1">
        <div
          v-for="(item, idx) in parsedItems"
          :key="idx"
          class="flex items-center justify-between text-xs py-1"
        >
          <div class="flex items-center gap-2 min-w-0">
            <div class="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-muted border border-border flex items-center justify-center">
              <img
                v-if="item.image_url"
                :src="item.image_url"
                :alt="item.name"
                class="h-full w-full object-cover"
                @error="(e) => { (e.target as HTMLElement).style.display = 'none'; ((e.target as HTMLElement).nextElementSibling as HTMLElement)?.classList.remove('hidden') }"
              />
              <span :class="['text-sm select-none', item.image_url ? 'hidden' : '']">🍔</span>
            </div>
            <span class="font-medium text-foreground truncate">
              <span class="font-extrabold text-orange-500 mr-1">{{ item.qty }}x</span>
              {{ item.name }}
            </span>
          </div>
          <span class="font-bold text-foreground shrink-0 ml-2">
            {{ formatCurrency(Number(item.price || 0) * Number(item.qty || 1)) }}
          </span>
        </div>
      </div>

      <!-- Special Notes -->
      <div v-if="order.notes" class="rounded-xl border border-amber-500/30 bg-amber-500/5 p-2.5 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
        <MessageSquare class="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
        <p class="leading-snug flex-1"><strong>Note:</strong> {{ order.notes }}</p>
      </div>
    </div>

    <!-- Bottom Footer & Actions -->
    <div class="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-3">
      <div>
        <span class="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Total</span>
        <span class="text-lg font-extrabold text-orange-500 dark:text-orange-400">
          {{ formatCurrency(Number(order.total_amount || 0)) }}
        </span>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-1.5">
        <!-- Pending Actions -->
        <template v-if="order.status === 'pending'">
          <button
            @click="emit('update-status', order.id, 'preparing')"
            class="flex items-center gap-1.5 rounded-xl bg-orange-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-orange-600 active:scale-95 transition-all"
          >
            <ChefHat class="h-3.5 w-3.5" />
            Prepare
          </button>
          <button
            @click="emit('update-status', order.id, 'cancelled')"
            class="rounded-xl border border-border px-2.5 py-2 text-xs font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
            title="Cancel order"
          >
            Cancel
          </button>
        </template>

        <!-- Preparing Actions -->
        <template v-else-if="order.status === 'preparing'">
          <button
            @click="emit('update-status', order.id, 'ready')"
            class="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-600 active:scale-95 transition-all"
          >
            <CheckCircle2 class="h-3.5 w-3.5" />
            Mark Ready
          </button>
        </template>

        <!-- Ready Actions -->
        <template v-else-if="order.status === 'ready'">
          <button
            @click="emit('update-status', order.id, 'done')"
            class="flex items-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3.5 py-2 text-xs font-bold shadow-xs hover:opacity-90 active:scale-95 transition-all"
          >
            <PackageCheck class="h-3.5 w-3.5" />
            Complete
          </button>
        </template>

        <template v-else>
          <span class="text-[11px] text-muted-foreground font-semibold">
            {{ formatDate(order.created_at) }}
          </span>
        </template>
      </div>
    </div>
  </div>
</template>
