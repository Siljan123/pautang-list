<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Receipt,
  History,
  Edit3,
  Trash2,
  Plus,
  ExternalLink,
  MessageSquare,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-vue-next'
import type { CustomerRow } from '@/composables/useCustomers'


const props = defineProps<{
  open: boolean
  customer: CustomerRow | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'edit': [customer: CustomerRow]
  'delete': [customer: CustomerRow]
  'add-transaction': [customerId: string]
  'add-payment': [customerId: string]
}>()

const supabase = useSupabaseClient<Database>()

const activeTab = ref<'transactions' | 'payments'>('transactions')
const loadingDetails = ref(false)
const customerTransactions = ref<any[]>([])
const customerPayments = ref<any[]>([])

function getAvatarInitials(name: string | undefined | null) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? (parts[0]![0]! + parts[parts.length - 1]![0]).toUpperCase()
    : parts[0]!.slice(0, 2).toUpperCase()
}

function formatCurrency(amount: number | null | undefined) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount || 0)
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const cleanedPhone = computed(() => {
  if (!props.customer?.contact_number) return null
  return props.customer.contact_number.replace(/\D/g, '')
})

const smsLink = computed(() => {
  if (!cleanedPhone.value) return null
  return `sms:${cleanedPhone.value}`
})

const totalUtangCalculated = computed(() => {
  return customerTransactions.value.reduce((sum, t) => sum + Number(t.total_amount || 0), 0)
})

const totalPaidCalculated = computed(() => {
  return customerPayments.value.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0)
})

const currentBalanceCalculated = computed(() => {
  return Math.max(0, totalUtangCalculated.value - totalPaidCalculated.value)
})

async function fetchCustomerDetailsData() {
  if (!props.customer?.id) return
  loadingDetails.value = true
  try {
    const [txRes, payRes] = await Promise.all([
      supabase
        .from('utang_transactions')
        .select('*')
        .eq('customer_id', props.customer.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('payments')
        .select('*')
        .eq('customer_id', props.customer.id)
        .order('created_at', { ascending: false }),
    ])

    if (!txRes.error && txRes.data) {
      customerTransactions.value = txRes.data
    }
    if (!payRes.error && payRes.data) {
      customerPayments.value = payRes.data
    }
  } finally {
    loadingDetails.value = false
  }
}

watch(
  () => [props.open, props.customer?.id],
  () => {
    if (props.open && props.customer?.id) {
      fetchCustomerDetailsData()
    }
  },
  { immediate: true }
)

defineExpose({
  refresh: fetchCustomerDetailsData,
})
</script>

<template>
  <Sheet :open="open" @update:open="(val) => emit('update:open', val)">
    <SheetContent class="flex flex-col max-w-lg sm:max-w-xl overflow-y-auto p-0">
      <!-- Header Banner -->
      <div v-if="customer" class="p-5 border-b border-border bg-gradient-to-r from-muted/50 to-muted/20 space-y-4">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3.5">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-base shadow-sm">
              {{ getAvatarInitials(customer.name) }}
            </div>
            <div>
              <h2 class="text-lg font-bold text-foreground leading-tight">{{ customer.name }}</h2>
              <div class="flex items-center gap-2 mt-1 flex-wrap">
                <span v-if="customer.contact_number" class="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone class="h-3 w-3" />
                  {{ customer.contact_number }}
                </span>
                <span v-if="customer.address" class="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin class="h-3 w-3" />
                  {{ customer.address }}
                </span>
              </div>
            </div>
          </div>

          <!-- Account Status Badge -->
          <Badge
            :class="[
              currentBalanceCalculated > 0
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
            ]"
            variant="outline"
            class="text-xs px-2.5 py-1 font-semibold shrink-0"
          >
            {{ currentBalanceCalculated > 0 ? 'Has Balance' : 'Paid Up' }}
          </Badge>
        </div>

        <!-- Quick Contact Actions -->
        <div v-if="cleanedPhone" class="flex items-center gap-2 pt-1">
          <a
            :href="`tel:${cleanedPhone}`"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors"
          >
            <Phone class="h-3.5 w-3.5 text-blue-500" />
            Call
          </a>
          <a
            :href="smsLink || '#'"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors"
          >
            <MessageSquare class="h-3.5 w-3.5 text-emerald-500" />
            SMS Reminder
          </a>
        </div>

        <!-- Financial Summary Cards Grid -->
        <div class="grid grid-cols-3 gap-2.5 pt-1">
          <div class="p-3 rounded-xl border border-border bg-card shadow-2xs">
            <span class="text-[11px] font-medium text-muted-foreground block">Total Utang</span>
            <span class="text-sm font-bold text-foreground mt-0.5 block">
              {{ formatCurrency(totalUtangCalculated) }}
            </span>
          </div>

          <div class="p-3 rounded-xl border border-border bg-card shadow-2xs">
            <span class="text-[11px] font-medium text-muted-foreground block">Total Paid</span>
            <span class="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {{ formatCurrency(totalPaidCalculated) }}
            </span>
          </div>

          <div class="p-3 rounded-xl border border-border bg-card shadow-2xs">
            <span class="text-[11px] font-medium text-muted-foreground block">Remaining</span>
            <span
              :class="[
                'text-sm font-bold mt-0.5 block',
                currentBalanceCalculated > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              ]"
            >
              {{ formatCurrency(currentBalanceCalculated) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Activity History Section -->
      <div class="flex-1 p-5 space-y-4">
        <!-- Tabs Header -->
        <div class="flex items-center justify-between border-b border-border pb-2">
          <div class="flex items-center gap-2">
            <button
              type="button"
              :class="[
                'text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5',
                activeTab === 'transactions'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              ]"
              @click="activeTab = 'transactions'"
            >
              <Receipt class="h-3.5 w-3.5" />
            Utang ({{ customerTransactions.length }})
            </button>

            <button
              type="button"
              :class="[
                'text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5',
                activeTab === 'payments'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              ]"
              @click="activeTab = 'payments'"
            >
              <History class="h-3.5 w-3.5" />
              Payments ({{ customerPayments.length }})
            </button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            class="h-7 text-[11px] text-muted-foreground"
            @click="fetchCustomerDetailsData"
          >
            Refresh
          </Button>
        </div>

        <!-- Loading Spinner -->
        <div v-if="loadingDetails" class="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 class="h-6 w-6 animate-spin text-primary" />
          <span class="text-xs">Loading customer records...</span>
        </div>

        <!-- Transactions Tab Content -->
        <div v-else-if="activeTab === 'transactions'" class="space-y-3">
          <div v-if="!customerTransactions.length" class="text-center py-10 border border-dashed border-border rounded-xl">
            <Receipt class="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p class="text-xs font-semibold text-foreground">No loans or utang recorded yet</p>
            <p class="text-[11px] text-muted-foreground mt-0.5">Click "+ Add Loan" above to create a transaction for this customer.</p>
          </div>

          <div
            v-for="tx in customerTransactions"
            :key="tx.id"
            class="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors flex items-center justify-between gap-3"
          >
            <div class="space-y-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-bold text-foreground">
                  {{ formatCurrency(tx.total_amount) }}
                </span>
                <Badge
                  :variant="tx.is_paid ? 'outline' : 'destructive'"
                  class="text-[10px] px-1.5 py-0 font-medium"
                >
                  {{ tx.is_paid ? 'Paid' : 'Unpaid' }}
                </Badge>
              </div>

              <p v-if="tx.notes" class="text-xs text-muted-foreground truncate">
                {{ tx.notes }}
              </p>

              <span class="text-[10px] text-muted-foreground flex items-center gap-1">
                <Calendar class="h-3 w-3" />
                {{ formatDate(tx.date_utang || tx.created_at) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Payments Tab Content -->
        <div v-else-if="activeTab === 'payments'" class="space-y-3">
          <div v-if="!customerPayments.length" class="text-center py-10 border border-dashed border-border rounded-xl">
            <History class="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p class="text-xs font-semibold text-foreground">No payment history recorded yet</p>
            <p class="text-[11px] text-muted-foreground mt-0.5">Click "Record Pay" above to add a payment for this customer.</p>
          </div>

          <div
            v-for="pay in customerPayments"
            :key="pay.id"
            class="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors flex items-center justify-between gap-3"
          >
            <div class="space-y-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  + {{ formatCurrency(pay.amount_paid) }}
                </span>
              </div>

              <p v-if="pay.note" class="text-xs text-muted-foreground truncate">
                {{ pay.note }}
              </p>

              <span class="text-[10px] text-muted-foreground flex items-center gap-1">
                <Calendar class="h-3 w-3" />
                {{ formatDate(pay.date_paid || pay.created_at) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
