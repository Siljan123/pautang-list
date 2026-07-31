<script setup lang="ts">
import { X, User, Phone, MessageSquare, CheckCircle2, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  items: CartItem[]
  total: number
  ownerId: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'order-placed': []
}>()

const { placeOrder } = useFoodOrders()

const form = reactive({
  name: '',
  contact: '',
  notes: '',
})

const submitting = ref(false)
const success = ref(false)
const errorMsg = ref('')

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price)
}

async function submitOrder() {
  if (!form.name.trim()) {
    errorMsg.value = 'Please enter your name.'
    return
  }
  submitting.value = true
  errorMsg.value = ''

  const { error } = await placeOrder({
    profile_id: props.ownerId,
    customer_name: form.name.trim(),
    customer_contact: form.contact.trim() || undefined,
    items: props.items,
    total_amount: props.total,
    notes: form.notes.trim() || undefined,
  })

  submitting.value = false

  if (error) {
    errorMsg.value = error.message
    return
  }

  success.value = true
  setTimeout(() => {
    success.value = false
    form.name = ''
    form.contact = ''
    form.notes = ''
    emit('order-placed')
    emit('update:open', false)
  }, 2500)
}
</script>

<template>
  <!-- Backdrop -->
  <Transition name="backdrop">
    <div
      v-if="open"
      class="fixed inset-0 z-[110] bg-black/70 backdrop-blur-md"
      @click="!submitting && emit('update:open', false)"
    />
  </Transition>

  <!-- Modal -->
  <Transition name="modal">
    <div
      v-if="open"
      class="fixed inset-0 z-[120] flex items-center justify-center p-4"
    >
      <div class="relative w-full max-w-md rounded-xl border border-border bg-card text-foreground shadow-2xl overflow-hidden">

        <!-- Success State -->
        <Transition name="fade">
          <div
            v-if="success"
            class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-card text-center p-8"
          >
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 animate-bounce">
              <CheckCircle2 class="h-8 w-8 text-green-500 dark:text-green-400" />
            </div>
            <h3 class="text-xl font-bold text-foreground">Order Placed!</h3>
            <p class="text-sm text-muted-foreground">Your order has been sent to the kitchen. We'll prepare it shortly!</p>
          </div>
        </Transition>

        <!-- Header -->
        <div class="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/20">
          <div>
            <h2 class="font-bold text-foreground text-base">Checkout</h2>
            <p class="text-xs text-muted-foreground">{{ items.length }} item{{ items.length !== 1 ? 's' : '' }} • {{ formatPrice(total) }}</p>
          </div>
          <button
            @click="emit('update:open', false)"
            :disabled="submitting"
            class="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- Order Summary -->
        <div class="px-6 py-4 border-b border-border max-h-36 overflow-y-auto">
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Order Summary</p>
          <div v-for="item in items" :key="item.id" class="flex justify-between items-center py-1">
            <span class="text-xs text-foreground font-medium">{{ item.qty }}× {{ item.name }}</span>
            <span class="text-xs font-bold text-orange-500 dark:text-orange-400">{{ formatPrice(item.price * item.qty) }}</span>
          </div>
          <div class="mt-2 pt-2 border-t border-border flex justify-between">
            <span class="text-sm font-bold text-foreground">Total</span>
            <span class="text-sm font-extrabold text-orange-500 dark:text-orange-400">{{ formatPrice(total) }}</span>
          </div>
        </div>

        <!-- Form -->
        <div class="px-6 py-5 space-y-8">
          <div>
            <label class="text-xs mt-4 font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User class="h-3 w-3" /> Your Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. Juan Dela Cruz"
              class="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-all"
            />
          </div>

          <div>
            <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone class="h-3 w-3" /> Contact Number
            </label>
            <input
              v-model="form.contact"
              type="tel"
              placeholder="e.g. 09xx xxx xxxx"
              class="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-all"
            />
          </div>

          <div>
            <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MessageSquare class="h-3 w-3" /> Special Notes
            </label>
            <textarea
              v-model="form.notes"
              rows="2"
              placeholder="e.g. No onions, extra sauce..."
              class="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-all resize-none"
            />
          </div>

          <p v-if="errorMsg" class="text-xs text-red-500 font-medium">⚠ {{ errorMsg }}</p>

          <button
            @click="submitOrder"
            :disabled="submitting"
            class="w-full flex items-center mb-4 justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 py-3 text-sm font-bold text-white shadow-lg hover:shadow-orange-500/30 hover:from-orange-400 hover:to-red-400 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 transition-all duration-150"
          >
            <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
            <span>{{ submitting ? 'Placing Order...' : 'Place Order' }}</span>
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

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
