<!-- components/payments/AddPaymentSheet.vue -->
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCustomers } from '@/composables/useCustomers'
import { usePayments } from '@/composables/usePayments'
import { useTransactions, type TransactionRow } from '@/composables/useTransactions'
import { Plus, CheckCircle2, Receipt, Sparkles, Search, UserCheck, Check } from 'lucide-vue-next'

const emit = defineEmits<{ success: [] }>()

const { customers, fetchCustomers } = useCustomers()
const { addPayment } = usePayments()
const { transactions, fetchTransactions } = useTransactions()

const open = ref(false)
const submitting = ref(false)
const errorMsg = ref('')

const selectedTransactionId = ref('')
const customerSearch = ref('')
const isSearchingCustomer = ref(false)

const form = ref({
  customer_id: '',
  amount_paid: '',
  date_paid: new Date().toISOString().split('T')[0] ?? '',
  note: '',
})

// Filter customers by search term
const filteredCustomers = computed(() => {
  if (!customerSearch.value.trim()) return customers.value
  const q = customerSearch.value.toLowerCase().trim()
  return customers.value.filter(c => c.name.toLowerCase().includes(q))
})

const selectedCustomerBalance = computed(() => {
  if (!form.value.customer_id) return 0
  const c = customers.value.find(item => item.id === form.value.customer_id)
  if (c && c.balance !== undefined && c.balance > 0) return c.balance
  return customerUnpaidTransactions.value.reduce((sum, t) => sum + Number(t.total_amount || 0), 0)
})

const displayedOwedAmount = computed(() => {
  if (selectedTransactionId.value) {
    const tx = customerUnpaidTransactions.value.find(t => t.id === selectedTransactionId.value)
    if (tx) return tx.total_amount
  }
  return selectedCustomerBalance.value
})

// Unpaid transactions for the selected customer
const customerUnpaidTransactions = ref<TransactionRow[]>([])

// Auto-fill customer balance or unpaid transaction amount into form.amount_paid
const autoFillCustomerBalance = (newCustomerId: string) => {
  selectedTransactionId.value = ''
  if (!newCustomerId) {
    customerUnpaidTransactions.value = []
    form.value.amount_paid = ''
    return
  }

  // Filter transactions for this customer that are unpaid
  customerUnpaidTransactions.value = transactions.value.filter(
    t => t.customer_id === newCustomerId && !t.is_paid
  )

  const selectedCust = customers.value.find(c => c.id === newCustomerId)
  const custBalance = Number(selectedCust?.balance || 0)
  const unpaidSum = customerUnpaidTransactions.value.reduce(
    (sum, t) => sum + Number(t.total_amount || 0),
    0
  )

  if (customerUnpaidTransactions.value.length === 1 && customerUnpaidTransactions.value[0]) {
    // If exactly 1 unpaid transaction exists, auto-select it (which sets amount, note, and date)
    onSelectTransaction(customerUnpaidTransactions.value[0].id)
  } else if (custBalance > 0) {
    form.value.amount_paid = String(custBalance)
  } else if (unpaidSum > 0) {
    form.value.amount_paid = String(unpaidSum)
  } else {
    form.value.amount_paid = ''
  }
}

// Watch customer selection to load their unpaid transactions and auto-fill amount
watch(() => form.value.customer_id, (newCustomerId) => {
  autoFillCustomerBalance(newCustomerId)
})

// Watch selected transaction ID so that selecting an unpaid item always updates amount paid accurately
watch(selectedTransactionId, (newTxId) => {
  if (!newTxId || newTxId === 'none') return
  const foundTx = customerUnpaidTransactions.value.find(t => t.id === newTxId)
  if (foundTx) {
    form.value.amount_paid = String(foundTx.total_amount)
    if (foundTx.date_utang) {
      form.value.date_paid = foundTx.date_utang
    }
    const noteText = foundTx.notes ? `Payment for: ${foundTx.notes}` : `Full payment for utang transaction`
    form.value.note = noteText
  }
})

const selectCustomer = (id: string) => {
  form.value.customer_id = id
  isSearchingCustomer.value = false
}

// Handle selecting a specific transaction from the dropdown
const onSelectTransaction = (txId: string) => {
  selectedTransactionId.value = txId
  const foundTx = customerUnpaidTransactions.value.find(t => t.id === txId)
  if (foundTx) {
    // Auto-fill amount paid
    form.value.amount_paid = String(foundTx.total_amount)
    
    // Auto-fill date if available
    if (foundTx.date_utang) {
      form.value.date_paid = foundTx.date_utang
    }

    // Auto-fill note
    const noteText = foundTx.notes ? `Payment for: ${foundTx.notes}` : `Full payment for utang transaction`
    form.value.note = noteText
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)
}

const resetForm = () => {
  form.value = {
    customer_id: '',
    amount_paid: '',
    date_paid: new Date().toISOString().split('T')[0] ?? '',
    note: '',
  }
  selectedTransactionId.value = ''
  customerUnpaidTransactions.value = []
  customerSearch.value = ''
  isSearchingCustomer.value = false
  errorMsg.value = ''
}

const onOpenChange = (val: boolean) => {
  open.value = val
  if (val) {
    fetchCustomers()
    fetchTransactions()
  }
  if (!val) resetForm()
}

const handleSubmit = async () => {
  errorMsg.value = ''

  if (!form.value.customer_id) {
    errorMsg.value = 'Please select a paying customer.'
    return
  }
  if (!form.value.amount_paid || Number(form.value.amount_paid) <= 0) {
    errorMsg.value = 'Please enter a valid amount.'
    return
  }

  submitting.value = true

  const { error } = await addPayment({
    customer_id: form.value.customer_id,
    amount_paid: Number(form.value.amount_paid),
    date_paid: form.value.date_paid,
    note: form.value.note || null,
    transaction_id: selectedTransactionId.value || undefined
  })

  submitting.value = false

  if (error) {
    errorMsg.value = error.message
    return
  }

  open.value = false
  resetForm()
  emit('success')
}
</script>

<template>
  <Sheet :open="open" @update:open="onOpenChange">
    <SheetTrigger as-child>
      <Button size="sm" class="text-white font-medium gap-1.5 px-3.5 h-9 rounded-lg shadow-2xs transition-colors">
        <Plus class="h-4 w-4" />
        Record Payment
      </Button>
    </SheetTrigger>

    <SheetContent class="flex flex-col overflow-y-auto justify-center max-w-md">
      <SheetHeader class="w-full items-center justify-center border-b pb-3">
        <SheetTitle class="flex items-center gap-2">
          <CheckCircle2 class="h-5 w-5" />
          Record Customer Payment
        </SheetTitle>
      </SheetHeader>

      <div class="flex-1 space-y-4 px-2 py-4">
        <!-- Searchable Customer Selector -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <Label for="customer">Customer / Borrower</Label>
            <span v-if="selectedCustomerName" class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <UserCheck class="h-3.5 w-3.5" />
              {{ selectedCustomerName }}
            </span>
          </div>

          <!-- Search Filter Input Bar -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              v-model="customerSearch"
              placeholder="Search customer by name..."
              class="pl-9 pr-4 h-9 text-xs bg-background rounded-lg border-border"
              @focus="isSearchingCustomer = true"
            />
          </div>

          <!-- Filtered Customer List Box -->
          <div
            v-if="isSearchingCustomer || (!form.customer_id && customerSearch)"
            class="max-h-40 overflow-y-auto rounded-lg border border-border bg-popover shadow-md p-1 space-y-0.5 z-20 text-xs"
          >
            <div v-if="!filteredCustomers.length" class="p-2 text-center text-muted-foreground text-xs">
              No matching customers found
            </div>
            <button
              v-for="c in filteredCustomers"
              :key="c.id"
              type="button"
              :class="[
                'w-full text-left px-3 py-2 rounded-md hover:bg-emerald-500/10 hover:text-emerald-600 flex items-center justify-between transition-colors',
                form.customer_id === c.id ? 'bg-emerald-500/15 text-emerald-600 font-semibold' : ''
              ]"
              @click="selectCustomer(c.id)"
            >
              <span>{{ c.name }}</span>
              <Check v-if="form.customer_id === c.id" class="h-3.5 w-3.5 text-emerald-600" />
            </button>
          </div>

          <!-- Standard Fallback Select Dropdown -->
          <div v-else-if="!selectedCustomerName" class="mt-1">
            <Select v-model="form.customer_id">
              <SelectTrigger id="customer" class="w-full text-xs">
                <SelectValue placeholder="-- Or choose from list --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="c in customers" :key="c.id" :value="c.id">
                  {{ c.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Customer Unpaid Transaction History Dropdown (Shown when Customer is selected) -->
        <div v-if="form.customer_id" class="space-y-1.5 transition-all">
          <div class="flex items-center justify-between">
            <Label for="tx-history" class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Receipt class="h-3.5 w-3.5" />
              Select Unpaid Utang Transaction
            </Label>
            <span v-if="customerUnpaidTransactions.length" class="text-[10px] text-muted-foreground font-medium">
              {{ customerUnpaidTransactions.length }} unpaid item(s)
            </span>
          </div>

          <Select v-model="selectedTransactionId" @update:model-value="onSelectTransaction">
            <SelectTrigger id="tx-history" class="w-full text-xs">
              <SelectValue placeholder="-- Pick a transaction to auto-fill & mark paid --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-if="!customerUnpaidTransactions.length" value="none" disabled>
                No active unpaid transactions for this customer
              </SelectItem>

              <SelectItem
                v-for="tx in customerUnpaidTransactions"
                :key="tx.id"
                :value="tx.id"
                class="text-xs"
              >
                {{ formatDate(tx.date_utang) }} — {{ formatCurrency(tx.total_amount) }} {{ tx.notes ? `(${tx.notes})` : '' }}
              </SelectItem>
            </SelectContent>
          </Select>

          <!-- Auto-fill confirmation notification -->
          <div
            v-if="selectedTransactionId"
            class="flex items-center gap-2 text-[11px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 p-2 rounded-lg border border-emerald-500/20"
          >
            <Sparkles class="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>
              Auto-filled <strong>{{ formatCurrency(Number(form.amount_paid || 0)) }}</strong> for selected item. Saving will mark this transaction as <strong>PAID</strong>!
            </span>
          </div>
        </div>

        <!-- Amount & Date -->
        <div class="space-y-1.5 flex flex-col sm:flex-row gap-3">
          <div class="flex-1 space-y-1.5"> 
            <div class="flex items-center justify-between">
              <Label for="amount">Amount Paid (₱)</Label>
              <span v-if="form.customer_id && displayedOwedAmount > 0" class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {{ selectedTransactionId ? 'Tx Amount:' : 'Owed:' }} {{ formatCurrency(displayedOwedAmount) }}
              </span>
            </div>
            <Input id="amount" v-model="form.amount_paid" type="number" step="0.01" placeholder="0.00" class="font-mono font-semibold text-sm" />
          </div>
          <div class="flex-1 space-y-1.5">
            <Label for="date">Date Paid</Label>
            <Input id="date" v-model="form.date_paid" type="date" />
          </div>
        </div>

        <!-- Note / Payment Method -->
        <div class="space-y-1.5">
          <Label for="note">Payment Note / Method</Label>
          <Textarea id="note" v-model="form.note" placeholder="e.g. Cash, GCash, Full payment..." class="text-xs" />
        </div>

        <p v-if="errorMsg" class="text-sm text-destructive font-medium">{{ errorMsg }}</p>
      </div>

      <div class="space-y-2 p-4 pt-0">
        <Button class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium" :disabled="submitting" @click="handleSubmit">
          {{ submitting ? 'Processing Payment...' : 'Save Payment Record' }}
        </Button>
        <Button variant="outline" class="w-full" @click="open = false">
          Cancel
        </Button>
      </div>
    </SheetContent>
  </Sheet>
</template>
