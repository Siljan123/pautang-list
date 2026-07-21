<!-- components/AddTransactionSheet.vue -->
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
import { useTransactions } from '@/composables/useTransactions'
import { Plus, Calculator, Delete, RotateCcw, Check, Sparkles, UserPlus, UserCheck, Search, X } from 'lucide-vue-next'

const emit = defineEmits<{ success: [] }>()

const { customers, fetchCustomers, addCustomer } = useCustomers()
const { addTransaction } = useTransactions()

const open = ref(false)
const submitting = ref(false)
const errorMsg = ref('')

const showCalculator = ref(false)
const calcExpression = ref('')
const calcResult = ref<number | null>(null)

// Searchable customer state
const customerSearch = ref('')
const isSearchingCustomer = ref(false)

// Quick Add Customer State
const showQuickAddCustomer = ref(false)
const addingCustomer = ref(false)
const quickCustomerForm = ref({
  name: '',
  contact_number: '',
  address: ''
})
const customerSuccessMsg = ref('')

const form = ref({
  customer_id: '',
  total_amount: '',
  date_utang: new Date().toISOString().split('T')[0] ?? '',
  is_paid: false,
  notes: '',
})

// Filter customers by search term
const filteredCustomers = computed(() => {
  if (!customerSearch.value.trim()) return customers.value
  const q = customerSearch.value.toLowerCase().trim()
  return customers.value.filter(c => c.name.toLowerCase().includes(q))
})

const selectedCustomer = computed(() => {
  return customers.value.find(c => c.id === form.value.customer_id)
})

const selectCustomer = (id: string) => {
  form.value.customer_id = id
  isSearchingCustomer.value = false
}

const clearCustomerSelection = () => {
  form.value.customer_id = ''
  customerSearch.value = ''
}

const openQuickAddCustomerWithSearch = () => {
  showQuickAddCustomer.value = !showQuickAddCustomer.value
  if (showQuickAddCustomer.value && customerSearch.value.trim()) {
    quickCustomerForm.value.name = customerSearch.value.trim()
  }
  isSearchingCustomer.value = false
}

// Watch Borrower Select value change
watch(() => form.value.customer_id, (val) => {
  if (val === '__add_new__') {
    showQuickAddCustomer.value = true
    form.value.customer_id = ''
  }
})

// Quick Add Customer Handler
const handleSaveQuickCustomer = async () => {
  if (!quickCustomerForm.value.name.trim()) return

  addingCustomer.value = true
  const { data, error } = await addCustomer({
    name: quickCustomerForm.value.name.trim(),
    contact_number: quickCustomerForm.value.contact_number || null,
    address: quickCustomerForm.value.address || null
  })
  addingCustomer.value = false

  if (!error && data) {
    form.value.customer_id = data.id
    customerSuccessMsg.value = `Created & selected ${data.name}!`
    quickCustomerForm.value = { name: '', contact_number: '', address: '' }
    showQuickAddCustomer.value = false
    customerSearch.value = ''
    setTimeout(() => { customerSuccessMsg.value = '' }, 4000)
  }
}

// Calculator logic
function appendCalc(val: string) {
  calcExpression.value += val
  evaluateCalc()
}

function clearCalc() {
  calcExpression.value = ''
  calcResult.value = null
}

function deleteCalcLast() {
  calcExpression.value = calcExpression.value.slice(0, -1)
  evaluateCalc()
}

function evaluateCalc() {
  if (!calcExpression.value.trim()) {
    calcResult.value = null
    return
  }
  try {
    const sanitized = calcExpression.value.replace(/[^0-9+\-*/.]/g, '')
    if (sanitized) {
      const res = Function(`"use strict"; return (${sanitized})`)()
      if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
        calcResult.value = Math.max(0, Math.round(res * 100) / 100)
        form.value.total_amount = String(calcResult.value)
      }
    }
  } catch {
    // Incomplete expression while typing
  }
}

function applyCalcResult() {
  if (calcResult.value !== null) {
    form.value.total_amount = String(calcResult.value)
  }
  showCalculator.value = false
}

const resetForm = () => {
  form.value = {
    customer_id: '',
    total_amount: '',
    date_utang: new Date().toISOString().split('T')[0] ?? '',
    is_paid: false,
    notes: '',
  }
  customerSearch.value = ''
  isSearchingCustomer.value = false
  errorMsg.value = ''
  clearCalc()
  showCalculator.value = false
  showQuickAddCustomer.value = false
  quickCustomerForm.value = { name: '', contact_number: '', address: '' }
  customerSuccessMsg.value = ''
}

const onOpenChange = (val: boolean) => {
  open.value = val
  if (val) fetchCustomers()
  if (!val) resetForm()
}

const handleSubmit = async () => {
  errorMsg.value = ''

  if (!form.value.customer_id) {
    errorMsg.value = 'Please select or add a borrower.'
    return
  }
  if (!form.value.total_amount || Number(form.value.total_amount) <= 0) {
    errorMsg.value = 'Enter a valid amount.'
    return
  }

  submitting.value = true

  const { error } = await addTransaction({
    customer_id: form.value.customer_id,
    total_amount: Number(form.value.total_amount),
    date_utang: form.value.date_utang,
    is_paid: form.value.is_paid,
    notes: form.value.notes || null,
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
      <Button size="sm" class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1.5 px-3.5 h-9 rounded-lg shadow-2xs transition-colors">
        <Plus class="h-4 w-4" />
        New transaction
      </Button>
    </SheetTrigger>

    <SheetContent class="flex flex-col overflow-y-auto justify-center max-w-md">
      <SheetHeader class="w-full items-center justify-center border-b pb-3">
        <SheetTitle class="flex items-center gap-2">
          <Sparkles class="h-5 w-5 text-emerald-600" />
          New Transaction
        </SheetTitle>
      </SheetHeader>

      <div class="flex-1 space-y-4 px-2 py-4">
        <!-- Borrower Searchable & Select Field -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <Label for="customer">Borrower / Customer</Label>
            <button
              type="button"
              class="text-xs text-emerald-600 hover:underline font-semibold flex items-center gap-1 transition-colors"
              @click="openQuickAddCustomerWithSearch"
            >
              <UserPlus class="h-3.5 w-3.5" />
              {{ showQuickAddCustomer ? 'Cancel' : '+ Add New Customer' }}
            </button>
          </div>

          <!-- Selected Customer Badge view -->
          <div
            v-if="selectedCustomer"
            class="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
          >
            <div class="flex items-center gap-2">
              <UserCheck class="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{{ selectedCustomer.name }}</span>
            </div>
            <button
              type="button"
              class="text-muted-foreground hover:text-destructive p-0.5 rounded transition-colors"
              title="Change Customer"
              @click="clearCustomerSelection"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <!-- Searchable Input & Dropdown -->
          <div v-else class="space-y-1.5">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                v-model="customerSearch"
                placeholder="Search borrower by name..."
                class="pl-9 pr-8 h-9 text-xs bg-background rounded-lg border-border"
                @focus="isSearchingCustomer = true"
              />
              <button
                v-if="customerSearch"
                type="button"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                @click="customerSearch = ''"
              >
                <X class="h-3.5 w-3.5" />
              </button>
            </div>

            <!-- Filtered Search Results Dropdown -->
            <div
              v-if="isSearchingCustomer || customerSearch"
              class="max-h-48 overflow-y-auto rounded-lg border border-border bg-popover shadow-md p-1 space-y-0.5 text-xs z-30 relative"
            >
              <!-- Add New Option at Top of list -->
              <button
                type="button"
                class="w-full text-left px-3 py-2 rounded-md font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center justify-between transition-colors mb-1"
                @click="openQuickAddCustomerWithSearch"
              >
                <span class="flex items-center gap-1.5">
                  <UserPlus class="h-3.5 w-3.5" />
                  {{ customerSearch.trim() ? `+ Add "${customerSearch.trim()}" as new customer` : '+ Add New Customer...' }}
                </span>
              </button>

              <div v-if="!filteredCustomers.length" class="p-2 text-center text-muted-foreground text-xs">
                No customer found matching "{{ customerSearch }}"
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

            <!-- Fallback Standard Select Dropdown if not searching -->
            <div v-if="!isSearchingCustomer && !customerSearch">
              <Select v-model="form.customer_id">
                <SelectTrigger id="customer" class="w-full text-xs">
                  <SelectValue placeholder="Or choose from customer list" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__add_new__" class="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 mb-1 cursor-pointer">
                    + Add New Customer...
                  </SelectItem>
                  <SelectItem v-for="c in customers" :key="c.id" :value="c.id">
                    {{ c.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Success Badge when New Customer Created -->
          <div
            v-if="customerSuccessMsg"
            class="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 p-2 rounded-lg border border-emerald-200"
          >
            <UserCheck class="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{{ customerSuccessMsg }}</span>
          </div>
        </div>

        <!-- Quick Add Customer Form Card (Expandable) -->
        <div
          v-if="showQuickAddCustomer"
          class="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-3 animate-in fade-in zoom-in-95"
        >
          <div class="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <span class="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <UserPlus class="h-4 w-4" />
              Quick Add Customer
            </span>
            <button
              type="button"
              class="text-xs text-muted-foreground hover:text-foreground"
              @click="showQuickAddCustomer = false"
            >
              ✕
            </button>
          </div>

          <div class="space-y-2">
            <div>
              <Label class="text-xs">Customer Name *</Label>
              <Input v-model="quickCustomerForm.name" placeholder="Full name (e.g. Maria Clara)" class="h-8 text-xs bg-background" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <Label class="text-xs">Contact Number</Label>
                <Input v-model="quickCustomerForm.contact_number" placeholder="0917..." class="h-8 text-xs bg-background" />
              </div>
              <div>
                <Label class="text-xs">Address</Label>
                <Input v-model="quickCustomerForm.address" placeholder="Address..." class="h-8 text-xs bg-background" />
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8"
              :disabled="addingCustomer || !quickCustomerForm.name.trim()"
              @click="handleSaveQuickCustomer"
            >
              {{ addingCustomer ? 'Saving Customer...' : 'Save & Select Customer' }}
            </Button>
          </div>
        </div>

        <!-- Amount Field with Calculator Toggle -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <Label for="amount">Amount (₱)</Label>
            <button
              type="button"
              class="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 transition-colors"
              @click="showCalculator = !showCalculator"
            >
              <Calculator class="h-3.5 w-3.5" />
              {{ showCalculator ? 'Close Calculator' : 'Mini Calculator' }}
            </button>
          </div>

          <div class="relative flex items-center">
            <Input
              id="amount"
              v-model="form.total_amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              class="pr-10 font-mono text-sm font-semibold"
            />
            <button
              type="button"
              class="absolute right-2 text-muted-foreground hover:text-emerald-600 p-1 transition-colors"
              title="Toggle Calculator"
              @click="showCalculator = !showCalculator"
            >
              <Calculator class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Embedded Mini Calculator Panel -->
        <div
          v-if="showCalculator"
          class="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-3 transition-all animate-in fade-in zoom-in-95"
        >
          <!-- Calculator Display -->
          <div class="bg-background rounded-lg border border-border p-2.5 space-y-1 text-right shadow-2xs">
            <div class="text-[11px] font-mono text-muted-foreground min-h-4 truncate">
              {{ calcExpression || 'Tap numbers (e.g. 50+120+35)' }}
            </div>
            <div class="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ₱{{ calcResult !== null ? calcResult.toFixed(2) : '0.00' }}
            </div>
          </div>

          <!-- Calculator Keypad Grid -->
          <div class="grid grid-cols-4 gap-1.5 text-xs font-semibold">
            <!-- Row 1 -->
            <button
              type="button"
              class="p-2 rounded-md bg-muted/80 hover:bg-muted font-bold text-destructive flex items-center justify-center"
              @click="clearCalc"
            >
              <RotateCcw class="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              class="p-2 rounded-md bg-muted/80 hover:bg-muted font-bold flex items-center justify-center"
              @click="deleteCalcLast"
            >
              <Delete class="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              class="p-2 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold"
              @click="appendCalc('/')"
            >
              /
            </button>
            <button
              type="button"
              class="p-2 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold"
              @click="appendCalc('*')"
            >
              *
            </button>

            <!-- Row 2 -->
            <button type="button" class="p-2 rounded-md bg-background border hover:bg-muted" @click="appendCalc('7')">7</button>
            <button type="button" class="p-2 rounded-md bg-background border hover:bg-muted" @click="appendCalc('8')">8</button>
            <button type="button" class="p-2 rounded-md bg-background border hover:bg-muted" @click="appendCalc('9')">9</button>
            <button
              type="button"
              class="p-2 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold"
              @click="appendCalc('-')"
            >
              -
            </button>

            <!-- Row 3 -->
            <button type="button" class="p-2 rounded-md bg-background border hover:bg-muted" @click="appendCalc('4')">4</button>
            <button type="button" class="p-2 rounded-md bg-background border hover:bg-muted" @click="appendCalc('5')">5</button>
            <button type="button" class="p-2 rounded-md bg-background border hover:bg-muted" @click="appendCalc('6')">6</button>
            <button
              type="button"
              class="p-2 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold"
              @click="appendCalc('+')"
            >
              +
            </button>

            <!-- Row 4 -->
            <button type="button" class="p-2 rounded-md bg-background border hover:bg-muted" @click="appendCalc('1')">1</button>
            <button type="button" class="p-2 rounded-md bg-background border hover:bg-muted" @click="appendCalc('2')">2</button>
            <button type="button" class="p-2 rounded-md bg-background border hover:bg-muted" @click="appendCalc('3')">3</button>
            <button
              type="button"
              class="row-span-2 p-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center"
              @click="applyCalcResult"
            >
              <Check class="h-4 w-4" />
            </button>

            <!-- Row 5 -->
            <button type="button" class="col-span-2 p-2 rounded-md bg-background border hover:bg-muted" @click="appendCalc('0')">0</button>
            <button type="button" class="p-2 rounded-md bg-background border hover:bg-muted" @click="appendCalc('.')">.</button>
          </div>
        </div>

        <!-- Date Field -->
        <div class="space-y-1.5">
          <Label for="date">Date</Label>
          <Input id="date" v-model="form.date_utang" type="date" />
        </div>

        <!-- Notes Field -->
        <div class="space-y-1.5">
          <Label for="notes">Notes / Items Purchased</Label>
          <Textarea id="notes" v-model="form.notes" placeholder="Optional notes or list of items (e.g. 2x Sardines, 1x Rice)" />
        </div>

        <p v-if="errorMsg" class="text-sm text-destructive font-medium">{{ errorMsg }}</p>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-2 p-4 pt-2">
        <Button class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium" :disabled="submitting" @click="handleSubmit">
          {{ submitting ? 'Saving...' : 'Save Transaction' }}
        </Button>
        <Button variant="outline" class="w-full" @click="open = false">
          Close
        </Button>
      </div>
    </SheetContent>
  </Sheet>
</template>