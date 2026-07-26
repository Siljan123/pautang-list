<script setup lang="ts">
import {
  Plus, Pencil, Trash2, X, Upload, Loader2,
  ToggleLeft, ToggleRight, UtensilsCrossed, ChevronDown, ImagePlus
} from 'lucide-vue-next'
import type { FoodItem } from '~/composables/useFoodItems'

definePageMeta({ layout: 'default' })

useHead({ title: 'Shop Menu Manager | Pautang List' })

const {
  items, loading, fetchFoodItems,
  addFoodItem, updateFoodItem, deleteFoodItem,
  uploadFoodImage, toggleAvailability
} = useFoodItems()

const user = useSupabaseUser()

onMounted(() => fetchFoodItems())

// --- Modal ---
const modalOpen = ref(false)
const editingItem = ref<FoodItem | null>(null)

const form = reactive({
  name: '',
  description: '',
  price: 0,
  category: 'Burgers',
  image_url: '',
})

const categories = ['Burgers', 'Meals', 'Drinks', 'Snacks', 'Desserts', 'Others']

const imageFile = ref<File | null>(null)
const imagePreview = ref<string>('')
const uploading = ref(false)
const saving = ref(false)
const errorMsg = ref('')
const warnMsg = ref('')

function openAdd() {
  editingItem.value = null
  form.name = ''
  form.description = ''
  form.price = 0
  form.category = 'Burgers'
  form.image_url = ''
  imageFile.value = null
  imagePreview.value = ''
  errorMsg.value = ''
  warnMsg.value = ''
  modalOpen.value = true
}

function openEdit(item: FoodItem) {
  editingItem.value = item
  form.name = item.name
  form.description = item.description ?? ''
  form.price = item.price
  form.category = item.category ?? 'Others'
  form.image_url = item.image_url ?? ''
  imageFile.value = null
  imagePreview.value = item.image_url ?? ''
  errorMsg.value = ''
  warnMsg.value = ''
  modalOpen.value = true
}

function handleImagePick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

const autoCropSquare = ref(true)

async function saveItem() {
  if (!form.name.trim()) { errorMsg.value = 'Name is required.'; return }
  if (form.price <= 0) { errorMsg.value = 'Price must be greater than 0.'; return }

  saving.value = true
  errorMsg.value = ''
  warnMsg.value = ''

  let imageUrl = form.image_url

  if (imageFile.value) {
    uploading.value = true
    const { url, error: uploadErr } = await uploadFoodImage(imageFile.value, { cropToSquare: autoCropSquare.value })
    uploading.value = false
    if (uploadErr || !url) {
      warnMsg.value = `⚠ Image upload failed: ${uploadErr || 'Unknown error'}. Make sure the "food-images" bucket exists in Supabase Storage and is set to Public.`
      imageUrl = ''
    } else {
      imageUrl = url
    }
  }

  const payload = {
    name: form.name.trim(),
    description: form.description.trim() || null,
    price: form.price,
    category: form.category,
    image_url: imageUrl || null,
    is_available: true,
  }

  let error = null
  if (editingItem.value) {
    ;({ error } = await updateFoodItem(editingItem.value.id, payload))
  } else {
    ;({ error } = await addFoodItem({ ...payload, profile_id: user.value?.id ?? null }))
  }

  saving.value = false
  if (error) { errorMsg.value = error.message; return }

  modalOpen.value = false
  await fetchFoodItems()
}

const deletingId = ref<string | null>(null)
async function deleteItem(id: string) {
  if (!confirm('Delete this food item? This cannot be undone.')) return
  deletingId.value = id
  await deleteFoodItem(id)
  deletingId.value = null
}

async function toggle(item: FoodItem) {
  await toggleAvailability(item)
  await fetchFoodItems()
}

function formatPrice(p: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(p)
}

const categoryEmoji: Record<string, string> = {
  Burgers: '', Drinks: '', Snacks: '', Meals: '',
  Desserts: '', Others: ''
}
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground">Shop Menu Manager</h1>
        <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Add, edit, and manage your food items. They appear on the public shop page.
        </p>
      </div>
      <div class="flex gap-2">
        <NuxtLink
          to="/shop"
          target="_blank"
          class="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/60 transition-all"
        >
          🛍 View Shop
        </NuxtLink>
        <button
          @click="openAdd"
          class="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-xs font-bold text-white shadow hover:shadow-orange-500/30 hover:from-orange-400 hover:to-red-400 transition-all active:scale-95"
        >
          <Plus class="h-3.5 w-3.5" />
          Add Food Item
        </button>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="i in 6" :key="i" class="h-52 rounded-xl bg-muted/30 animate-pulse" />
    </div>

    <!-- Empty -->
    <div v-else-if="!items.length" class="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground rounded-xl border border-dashed border-border">
      <UtensilsCrossed class="h-12 w-12 opacity-30" />
      <p class="font-semibold">No menu items yet</p>
      <p class="text-sm text-center max-w-xs">Click "Add Food Item" to start building your menu. Add burgers, drinks, snacks and more!</p>
      <button @click="openAdd" class="mt-2 rounded-lg bg-orange-500/10 border border-orange-500/30 px-4 py-2 text-sm font-semibold text-orange-500 hover:bg-orange-500/20 transition-colors">
        + Add First Item
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="item in items"
        :key="item.id"
        class="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all"
      >
        <!-- Image -->
        <div class="relative h-40 overflow-hidden rounded-t-xl bg-muted/40 flex items-center justify-center">
          <img
            v-if="item.image_url"
            :src="item.image_url"
            :alt="item.name"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            @error="(e) => { (e.target as HTMLElement).style.display = 'none'; ((e.target as HTMLElement).nextElementSibling as HTMLElement)?.classList.remove('hidden') }"
          />
          <div :class="['flex h-full w-full items-center justify-center text-4xl select-none', item.image_url ? 'hidden' : '']">
            {{ categoryEmoji[item.category ?? 'Others'] ?? '🍽️' }}
          </div>
          <!-- Availability overlay -->
          <div v-if="!item.is_available" class="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span class="rounded-full bg-muted px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase">Hidden</span>
          </div>
          <!-- Category -->
          <div class="absolute top-2 left-2">
            <span class="rounded-full bg-background/80 border border-border px-2 py-0.5 text-[9px] font-bold text-foreground uppercase backdrop-blur-sm">
              {{ item.category ?? 'Others' }}
            </span>
          </div>
        </div>

        <!-- Info -->
        <div class="flex flex-1 flex-col p-3 gap-1.5">
          <h3 class="font-semibold text-sm text-foreground line-clamp-1">{{ item.name }}</h3>
          <p class="text-xs text-muted-foreground line-clamp-2 flex-1">{{ item.description || '—' }}</p>
          <div class="flex items-center justify-between mt-1">
            <span class="text-base font-extrabold text-orange-500">{{ formatPrice(item.price) }}</span>
            <!-- Actions -->
            <div class="flex items-center gap-1">
              <button @click="toggle(item)" :title="item.is_available ? 'Hide from shop' : 'Show in shop'" class="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors">
                <component :is="item.is_available ? ToggleRight : ToggleLeft" :class="['h-4 w-4', item.is_available ? 'text-emerald-500' : 'text-muted-foreground']" />
              </button>
              <button @click="openEdit(item)" class="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <Pencil class="h-3.5 w-3.5" />
              </button>
              <button
                @click="deleteItem(item.id)"
                :disabled="deletingId === item.id"
                class="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Loader2 v-if="deletingId === item.id" class="h-3.5 w-3.5 animate-spin" />
                <Trash2 v-else class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add / Edit Modal -->
  <Transition name="backdrop">
    <div v-if="modalOpen" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" @click="modalOpen = false" />
  </Transition>
  <Transition name="modal">
    <div v-if="modalOpen" class="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div class="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden" @click.stop>
        <!-- Modal header -->
        <div class="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 class="font-bold text-foreground">{{ editingItem ? 'Edit Food Item' : 'Add Food Item' }}</h2>
          <button @click="modalOpen = false" class="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted transition-colors">
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          <!-- Image Upload Zone (Centered Square Box) -->
          <div class="flex justify-center">
            <div
              class="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all cursor-pointer overflow-hidden h-40 w-40 shrink-0 shadow-xs"
              @dragover.prevent
              @drop.prevent="handleDrop"
              @click="($refs.imgInput as HTMLInputElement)?.click()"
            >
              <img
                v-if="imagePreview"
                :src="imagePreview"
                alt="preview"
                class="absolute inset-0 h-full w-full object-contain p-2 bg-white dark:bg-zinc-900/60"
                @error="imagePreview = ''"
              />
              <div v-if="!imagePreview" class="flex flex-col items-center gap-1.5 p-3 text-center text-muted-foreground">
                <ImagePlus class="h-8 w-8 opacity-50 text-orange-500" />
                <p class="text-[11px] font-semibold leading-tight">Upload Photo</p>
                <p class="text-[9px] text-muted-foreground/60">JPG, PNG, WEBP</p>
              </div>
              <div v-else class="absolute bottom-2 right-2">
                <span class="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur-sm border border-border">Change</span>
              </div>
              <input ref="imgInput" type="file" accept="image/*" class="hidden" @change="handleImagePick" />
            </div>
          </div>

          <!-- Crop / Resizer Option -->
          <div class="flex items-center justify-center gap-2">
            <label class="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer select-none">
              <input type="checkbox" v-model="autoCropSquare" class="rounded accent-orange-500 h-3.5 w-3.5" />
              Auto-crop to 1:1 Square & Compress WebP
            </label>
          </div>

          <!-- Name -->
          <div>
            <label class="text-xs font-semibold text-muted-foreground mb-1.5 block">Item Name *</label>
            <input v-model="form.name" type="text" placeholder="e.g. Classic Cheeseburger" class="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20 transition-all" />
          </div>

          <!-- Description -->
          <div>
            <label class="text-xs font-semibold text-muted-foreground mb-1.5 block">Description</label>
            <textarea v-model="form.description" rows="2" placeholder="What's in it? e.g. Juicy beef patty, cheddar, lettuce, special sauce..." class="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20 transition-all resize-none" />
          </div>

          <!-- Price + Category row -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-muted-foreground mb-1.5 block">Price (₱) *</label>
              <input v-model.number="form.price" type="number" min="0" step="0.01" placeholder="0.00" class="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20 transition-all" />
            </div>
            <div>
              <label class="text-xs font-semibold text-muted-foreground mb-1.5 block">Category</label>
              <div class="relative">
                <select v-model="form.category" class="w-full appearance-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20 transition-all pr-8">
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ categoryEmoji[cat] }} {{ cat }}</option>
                </select>
                <ChevronDown class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          <p v-if="errorMsg" class="text-xs text-red-500 font-medium">⚠ {{ errorMsg }}</p>
          <p v-if="warnMsg" class="text-xs text-amber-500 font-medium leading-relaxed">{{ warnMsg }}</p>
        </div>

        <!-- Footer -->
        <div class="border-t border-border px-6 py-4 flex justify-end gap-3">
          <button @click="modalOpen = false" class="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            Cancel
          </button>
          <button
            @click="saveItem"
            :disabled="saving"
            class="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2 text-sm font-bold text-white shadow hover:from-orange-400 hover:to-red-400 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            <Loader2 v-if="saving" class="h-3.5 w-3.5 animate-spin" />
            {{ uploading ? 'Uploading image...' : saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Item' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.backdrop-enter-active, .backdrop-leave-active { transition: opacity 0.2s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }
.modal-enter-active, .modal-leave-active { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.9) translateY(20px); }
</style>
