<script setup lang="ts">
import type { FoodItem } from '~/composables/useFoodItems'
import { ShoppingCart, Star } from 'lucide-vue-next'

const props = defineProps<{
  item: FoodItem
}>()

const emit = defineEmits<{
  'add-to-cart': [item: FoodItem]
}>()

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price)
}
</script>

<template>
  <div
    class="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300"
  >
    <!-- Image -->
    <div class="relative h-44 overflow-hidden bg-muted/40 flex items-center justify-center">
      <img
        v-if="item.image_url"
        :src="item.image_url"
        :alt="item.name"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        @error="(e) => { (e.target as HTMLElement).style.display = 'none'; ((e.target as HTMLElement).nextElementSibling as HTMLElement)?.classList.remove('hidden') }"
      />
      <div
        :class="['flex h-full w-full items-center justify-center text-5xl select-none', item.image_url ? 'hidden' : '']"
      >
        🍔
      </div>
      <!-- Category badge -->
      <div class="absolute top-3 left-3">
        <span class="inline-flex items-center rounded-full bg-background/90 border border-border/80 px-2.5 py-0.5 text-[10px] font-extrabold text-foreground uppercase tracking-wider backdrop-blur-md shadow-xs">
          {{ item.category || 'Food' }}
        </span>
      </div>
      <!-- Popular star -->
      <div class="absolute top-3 right-3">
        <div class="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-amber-950 backdrop-blur-sm shadow-sm">
          <Star class="h-3.5 w-3.5 fill-amber-950 text-amber-950" />
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-1 flex-col gap-1.5 p-4 bg-card">
      <h3 class="font-bold text-base text-foreground leading-tight line-clamp-1">{{ item.name }}</h3>
      <p class="text-xs text-muted-foreground line-clamp-2 flex-1">{{ item.description || 'A delicious item from our kitchen.' }}</p>

      <!-- Price & Button row -->
      <div class="mt-3 flex items-center justify-between gap-3 pt-2 border-t border-border/40">
        <div>
          <span class="text-lg font-extrabold text-orange-500 dark:text-orange-400">{{ formatPrice(item.price) }}</span>
        </div>
        <button
          @click="emit('add-to-cart', item)"
          class="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:shadow-orange-500/30 hover:from-orange-400 hover:to-red-400 active:scale-95 transition-all duration-150"
        >
          <ShoppingCart class="h-3.5 w-3.5" />
          Add
        </button>
      </div>
    </div>
  </div>
</template>
