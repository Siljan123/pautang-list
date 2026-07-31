<script setup lang="ts">
import { ShoppingCart } from 'lucide-vue-next'
import type { FoodItem } from '@/composables/useFoodItems'
import type { CartItem } from '@/composables/useFoodOrders'

definePageMeta({
  layout: 'landing'
})

useSeoMeta({
  title: 'Order Fresh Meals & Snacks Online',
  ogTitle: 'Online Food Shop - Order Fresh Meals & Snacks',
  description: 'Order your favorite burgers, meals, snacks, and drinks online. Freshly prepared and delivered fast!',
  ogDescription: 'Order your favorite burgers, meals, snacks, and drinks online. Freshly prepared and delivered fast!',
  ogType: 'website',
  ogUrl: 'https://inventoryitem.shop',
  twitterCard: 'summary_large_image'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://inventoryitem.shop' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Online Food Shop',
        'url': 'https://inventoryitem.shop',
        'description': 'Order your favorite burgers, meals, snacks, and drinks online.'
      })
    }
  ]
})

// --- Food Menu Data ---
const { items, loading, fetchFoodItems } = useFoodItems()
const ownerId = ref<string>('')

onMounted(async () => {
  await fetchFoodItems(true) // publicMode = true
  if (items.value.length) {
    ownerId.value = items.value[0]?.profile_id ?? ''
  }
})

// --- Cart State ---
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
  const el = document.getElementById('landing-cart-fab')
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
</script>

<template>
  <div class="relative overflow-hidden bg-background text-foreground">
    <!-- Decorative background glow blobs -->
    <div class="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-emerald-500/15 via-orange-500/10 to-amber-500/5 blur-3xl opacity-70 dark:opacity-40" />

    <LandingFoodMenu
      :items="items"
      :loading="loading"
      :cart-count="cartCount"
      @add-to-cart="addToCart"
      @open-cart="cartOpen = true"
    />

    <LandingFeatures />
    <LandingHowItWorks />
    <LandingFaq />
    <LandingFooter />

    <!-- Floating Cart Button -->
    <Transition name="fab">
  <button
    v-if="cartCount > 0 && !cartOpen"
    id="landing-cart-fab"
        @click="cartOpen = true"
        class="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <ShoppingCart class="h-5 w-5" />
        <span>View Cart ({{ cartCount }})</span>
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
.fab-enter-active, .fab-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.fab-enter-from, .fab-leave-to { opacity: 0; transform: translateY(30px) scale(0.8); }
</style>