<script setup lang="ts">
import { ShoppingCart, Search, Flame, ChevronDown, Store } from 'lucide-vue-next'


definePageMeta({ layout: false })

useHead({
  title: 'Online Food Shop ',
  meta: [{ name: 'description', content: 'Browse our delicious menu and order online. Fresh burgers, meals, drinks and more!' }]
})

// --- Data ---
const { items, loading, fetchFoodItems } = useFoodItems()

// Fetch the first owner's profile_id for order placement
// In production, you'd pass this via config or route param; for now we grab from first food item
const ownerId = ref<string>('')

onMounted(async () => {
  await fetchFoodItems(true) // publicMode = true
  if (items.value.length) {
    const itemWithProfile = items.value.find(i => i.profile_id && i.profile_id.trim() !== '')
    ownerId.value = itemWithProfile?.profile_id ?? ''
  }
})

// --- Categories ---
const allCategories = computed(() => {
  const cats = [...new Set(items.value.map(i => i.category ?? 'Others'))]
  return ['All', ...cats]
})

const selectedCategory = ref('All')
const searchQuery = ref('')

const filteredItems = computed(() => {
  let list = items.value
  if (selectedCategory.value !== 'All') {
    list = list.filter(i => (i.category ?? 'Others') === selectedCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.description ?? '').toLowerCase().includes(q)
    )
  }
  return list
})

// --- Cart ---
const cart = ref<CartItem[]>([])
const cartOpen = ref(false)
const checkoutOpen = ref(false)

const cartTotal = computed(() => cart.value.reduce((s, i) => s + i.price * i.qty, 0))
const cartCount = computed(() => cart.value.reduce((s, i) => s + i.qty, 0))

function addToCart(item: FoodItem) {
  const existing = cart.value.find(c => c.id === item.id)
  if (existing) {
    existing.qty++
  } else {
    cart.value.push({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: 1,
      image_url: item.image_url,
    })
  }
  // Brief bounce animation
  const el = document.getElementById('cart-fab')
  el?.classList.add('scale-125')
  setTimeout(() => el?.classList.remove('scale-125'), 200)
}

function updateQty(id: string, delta: number) {
  const item = cart.value.find(c => c.id === id)
  if (!item) return
  item.qty += delta
  if (item.qty <= 0) {
    cart.value = cart.value.filter(c => c.id !== id)
  }
}

function removeFromCart(id: string) {
  cart.value = cart.value.filter(c => c.id !== id)
}

function clearCart() {
  cart.value = []
}

function onOrderPlaced() {
  clearCart()
}

const categoryEmoji: Record<string, string> = {
  Burgers: '🍔', Drinks: '🥤', Snacks: '🍟', Meals: '🍱',
  Desserts: '🍨', Others: '🍽️', All: '✨'
}
</script>

<template>
  <div class="min-h-screen bg-[#080a0f] text-white" style="font-family: 'Inter', system-ui, sans-serif;">
    <!-- Background blobs -->
    <div class="pointer-events-none fixed inset-0 overflow-hidden z-0">
      <div class="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
      <div class="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-red-500/8 blur-3xl" />
      <div class="absolute bottom-0 right-1/3 h-64 w-64 rounded-full bg-amber-500/8 blur-3xl" />
    </div>

    <!-- Navbar -->
    <nav class="sticky top-0 z-30 border-b border-white/8 bg-[#080a0f]/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30">
            <Store class="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 class="font-extrabold text-base text-white leading-tight">Food Shop</h1>
            <p class="text-[10px] text-white/40">Order online, we'll prepare it fresh!</p>
          </div>
        </div>
        <!-- Cart FAB -->
        <button
          id="cart-fab"
          @click="cartOpen = true"
          class="relative flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3.5 py-2 text-sm font-semibold text-orange-400 hover:bg-orange-500/20 transition-all duration-200"
        >
          <ShoppingCart class="h-4 w-4" />
          <span class="hidden sm:inline">Cart</span>
          <Transition name="badge">
            <span
              v-if="cartCount > 0"
              class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-[10px] font-bold text-white shadow"
            >{{ cartCount }}</span>
          </Transition>
        </button>
      </div>
    </nav>

    <!-- Hero -->
    <div class="relative z-10 mx-auto max-w-6xl px-4 pt-10 sm:pt-14 pb-6 text-center">
      <div class="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-400 mb-4">
        <Flame class="h-3.5 w-3.5" />
        Fresh & Hot, Made to Order
      </div>
      <h2 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-snug">
        Order Your Favorite
        <span class="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Food & Treats</span>
      </h2>
      <p class="mt-3 text-base text-white/50 max-w-lg mx-auto">Browse our menu, add to cart, and checkout. We'll have it ready for you!</p>

      <!-- Search -->
      <div class="mt-6 relative max-w-md mx-auto">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search burgers, drinks, snacks..."
          class="w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all backdrop-blur-sm"
        />
      </div>
    </div>

    <!-- Category Pills -->
    <div class="relative z-10 mx-auto max-w-6xl px-4 pb-6">
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          v-for="cat in allCategories"
          :key="cat"
          @click="selectedCategory = cat"
          :class="[
            'flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all',
            selectedCategory === cat
              ? 'border-orange-500/50 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20'
              : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
          ]"
        >
          <span>{{ categoryEmoji[cat] ?? '🍽️' }}</span>
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- Menu Grid -->
    <div class="relative z-10 mx-auto max-w-6xl px-4 pb-24">
      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="i in 8"
          :key="i"
          class="h-64 rounded-2xl bg-white/5 animate-pulse"
        />
      </div>

      <!-- Empty -->
      <div v-else-if="!filteredItems.length" class="flex flex-col items-center justify-center py-24 gap-4 text-white/30">
        <span class="text-5xl">🍽️</span>
        <p class="text-base font-semibold">No items found</p>
        <p class="text-sm">Try a different category or search term</p>
      </div>

      <!-- Food cards -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <CustomShopFoodCard
          v-for="item in filteredItems"
          :key="item.id"
          :item="item"
          @add-to-cart="addToCart"
        />
      </div>
    </div>

    <!-- Floating Cart Button (mobile) -->
    <Transition name="fab">
      <button
        v-if="cartCount > 0 && !cartOpen"
        @click="cartOpen = true"
        class="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 sm:hidden flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-orange-500/40"
      >
        <ShoppingCart class="h-4 w-4" />
        View Cart ({{ cartCount }})
      </button>
    </Transition>

    <!-- Cart Drawer -->
    <CustomShopCartDrawer
      v-model:open="cartOpen"
      :items="cart"
      @update-qty="updateQty"
      @remove="removeFromCart"
      @clear="clearCart"
      @checkout="() => { cartOpen = false; checkoutOpen = true }"
    />

    <!-- Checkout Modal -->
    <CustomShopCheckoutModal
      v-model:open="checkoutOpen"
      :items="cart"
      :total="cartTotal"
      :owner-id="ownerId"
      @order-placed="onOrderPlaced"
    />
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.badge-enter-active, .badge-leave-active { transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
.badge-enter-from, .badge-leave-to { opacity: 0; transform: scale(0); }

.fab-enter-active, .fab-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.fab-enter-from, .fab-leave-to { opacity: 0; transform: translateX(-50%) translateY(30px); }
</style>
