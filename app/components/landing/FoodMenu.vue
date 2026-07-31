<script setup lang="ts">
import { Search, Flame, ShoppingCart } from 'lucide-vue-next'

const props = defineProps<{
  items: FoodItem[]
  loading: boolean
  cartCount: number
}>()

const emit = defineEmits<{
  'add-to-cart': [item: FoodItem]
  'open-cart': []
}>()

const selectedCategory = ref('All')
const searchQuery = ref('')

const allCategories = computed(() => {
  const cats = [...new Set(props.items.map(i => i.category ?? 'Others'))]
  return ['All', ...cats]
})

const filteredItems = computed(() => {
  let list = props.items
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

const categoryEmoji: Record<string, string> = {
  Burgers: '', Drinks: '', Snacks: '', Meals: '',
  Desserts: '', Others: '', All: ''
}
</script>

<template>
  <section id="menu" class="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/40">
    <!-- Header -->
    <div class="text-center max-w-3xl mx-auto mb-10">
      <h2 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
        Order Your Favorite <span class="bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 bg-clip-text text-transparent">Food & Treats</span>
      </h2>
      <p class="mt-4 text-base sm:text-lg text-muted-foreground">
        Browse our delicious menu, add items to your cart, and place an order instantly right here!
      </p>
      <!-- Search Input -->
      <div class="mt-8 relative max-w-md mx-auto">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search burgers, drinks, meals..."
          class="w-full rounded-2xl border border-border bg-card/80 backdrop-blur-md pl-11 pr-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
        />
      </div>
    </div>
    <div class="flex gap-2 overflow-x-auto pb-4 mb-8 justify-start sm:justify-center scrollbar-hide">
      <button
        v-for="cat in allCategories"
        :key="cat"
        @click="selectedCategory = cat"
        :class="[
          'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200',
          selectedCategory === cat
            ? 'border-orange-500 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/20'
            : 'border-border bg-card text-muted-foreground hover:border-orange-500/40 hover:text-foreground'
        ]"
      >
        <span>{{ categoryEmoji[cat] ?? '🍽️' }}</span>
        <span>{{ cat }}</span>
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="i in 8"
        :key="i"
        class="h-72 rounded-2xl bg-muted/40 animate-pulse border border-border/50"
      />
    </div>

    <!-- Empty State -->
    <div v-else-if="!filteredItems.length" class="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
      <span class="text-6xl">🍽️</span>
      <p class="text-lg font-bold text-foreground">No menu items found</p>
      <p class="text-sm">Try searching for something else or pick a different category.</p>
    </div>

    <!-- Food Cards Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <CustomShopFoodCard
        v-for="item in filteredItems"
        :key="item.id"
        :item="item"
        @add-to-cart="emit('add-to-cart', item)"
      />
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
