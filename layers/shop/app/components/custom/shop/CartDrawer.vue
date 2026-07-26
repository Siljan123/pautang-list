<script setup lang="ts">
import type { CartItem } from '~/composables/useFoodOrders'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  items: CartItem[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update-qty': [id: string, delta: number]
  'remove': [id: string]
  'checkout': []
  'clear': []
}>()

const total = computed(() =>
  props.items.reduce((sum, i) => sum + i.price * i.qty, 0)
)

const totalItems = computed(() =>
  props.items.reduce((sum, i) => sum + i.qty, 0)
)

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price)
}
</script>

<template>
  <!-- Backdrop -->
  <Transition name="backdrop">
    <div
      v-if="open"
      class="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
      @click="emit('update:open', false)"
    />
  </Transition>

  <!-- Drawer -->
  <Transition name="slide">
    <div
      v-if="open"
      class="fixed right-0 top-0 z-[100] flex h-full w-full max-w-md flex-col bg-card border-l border-border text-foreground shadow-2xl"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-border px-5 py-4 bg-muted/20">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/30">
            <ShoppingBag class="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h2 class="font-bold text-foreground text-base">Your Cart</h2>
            <p class="text-xs text-muted-foreground">{{ totalItems }} item{{ totalItems !== 1 ? 's' : '' }} selected</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="items.length"
            @click="emit('clear')"
            class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-semibold transition-colors"
            title="Clear all items"
          >
            <Trash2 class="h-3.5 w-3.5" />
            <span class="hidden sm:inline">Clear</span>
          </button>
          <button
            @click="emit('update:open', false)"
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Close cart"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Items List -->
      <div class="flex-1 overflow-y-auto p-5 space-y-3">
        <div v-if="!items.length" class="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground/60 py-16">
          <ShoppingBag class="h-16 w-16 opacity-30" />
          <p class="text-base font-bold text-foreground">Your cart is empty</p>
          <p class="text-xs text-center max-w-xs">Explore our menu and add your favorite burgers, meals & treats!</p>
        </div>

        <TransitionGroup name="cart-item" tag="div" class="space-y-3">
          <div
            v-for="item in items"
            :key="item.id"
            class="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-3 shadow-xs hover:border-orange-500/30 transition-all"
          >
            <!-- Thumb -->
            <div class="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted border border-border flex items-center justify-center">
              <img
                v-if="item.image_url"
                :src="item.image_url"
                :alt="item.name"
                class="h-full w-full object-cover"
                @error="(e) => { (e.target as HTMLElement).style.display = 'none'; ((e.target as HTMLElement).nextElementSibling as HTMLElement)?.classList.remove('hidden') }"
              />
              <div :class="['flex h-full w-full items-center justify-center text-2xl select-none', item.image_url ? 'hidden' : '']">🍔</div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="font-bold text-foreground text-sm truncate">{{ item.name }}</p>
              <p class="text-xs text-orange-500 dark:text-orange-400 font-extrabold mt-0.5">{{ formatPrice(item.price) }}</p>
            </div>

            <!-- Qty controls -->
            <div class="flex items-center gap-1.5">
              <button
                @click="emit('update-qty', item.id, -1)"
                class="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-muted active:scale-95 transition-all"
              >
                <Minus class="h-3.5 w-3.5" />
              </button>
              <span class="w-6 text-center text-xs font-extrabold text-foreground">{{ item.qty }}</span>
              <button
                @click="emit('update-qty', item.id, 1)"
                class="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white hover:bg-orange-600 active:scale-95 transition-all shadow-xs"
              >
                <Plus class="h-3.5 w-3.5" />
              </button>
              <button
                @click="emit('remove', item.id)"
                class="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Remove item"
              >
                <X class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Footer -->
      <div v-if="items.length" class="border-t border-border p-5 space-y-4 bg-muted/20">
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold text-muted-foreground">Subtotal</span>
          <span class="text-xl font-extrabold text-orange-500 dark:text-orange-400">{{ formatPrice(total) }}</span>
        </div>
        <button
          @click="emit('checkout')"
          class="w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-500 py-3.5 text-sm font-bold text-white shadow-lg hover:shadow-orange-500/30 hover:from-orange-400 hover:to-red-400 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
        >
          <span>Proceed to Checkout</span>
          <span>→</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.cart-item-enter-active,
.cart-item-leave-active {
  transition: all 0.2s ease;
}
.cart-item-enter-from,
.cart-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
