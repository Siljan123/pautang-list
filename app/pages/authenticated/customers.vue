<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Edit3,
  Trash2,
  Phone,
  MapPin,
  CreditCard,
  Receipt,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-vue-next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useCustomers, type CustomerRow } from '@/composables/useCustomers'

import AddEditCustomerSheet from '@/components/customers/AddEditCustomerSheet.vue'
import CustomerDetailsSheet from '@/components/customers/CustomerDetailsSheet.vue'
import DeleteCustomerModal from '@/components/customers/DeleteCustomerModal.vue'
import AddTransactionSheet from '@/components/transactions/AddTransactionSheet.vue'
import AddPaymentSheet from '@/components/payments/AddPaymentSheet.vue'

definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'Customer Management',
  robots: 'noindex, nofollow'
})

const { customers, loading, fetchCustomers } = useCustomers()

const searchQuery = ref('')
type BalanceFilter = 'all' | 'unpaid' | 'paid'
const activeFilter = ref<BalanceFilter>('all')

// Pagination State
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Dialog / Sheet States
const addEditOpen = ref(false)
const selectedCustomerForEdit = ref<CustomerRow | null>(null)

const detailsOpen = ref(false)
const selectedCustomerForDetails = ref<CustomerRow | null>(null)

const deleteOpen = ref(false)
const selectedCustomerForDelete = ref<CustomerRow | null>(null)

const addTransactionOpen = ref(false)
const preselectedCustomerIdForTx = ref<string | undefined>(undefined)

const addPaymentOpen = ref(false)

onMounted(() => {
  fetchCustomers()
})

// Reset to page 1 on search or filter change
watch([searchQuery, activeFilter, itemsPerPage], () => {
  currentPage.value = 1
})

// ----- Helpers -----
function formatCurrency(amount: number | undefined | null) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount || 0)
}

function getAvatarInitials(name: string | undefined | null) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? (parts[0]![0]! + parts[parts.length - 1]![0]).toUpperCase()
    : parts[0]?.slice(0, 2).toUpperCase()
}

// ----- Filtering & Stats -----
const filteredCustomers = computed(() => {
  let list = customers.value

  // Search filter
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.contact_number && c.contact_number.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q))
    )
  }

  // Balance status filter
  if (activeFilter.value === 'unpaid') {
    list = list.filter(c => (c.balance || 0) > 0)
  } else if (activeFilter.value === 'paid') {
    list = list.filter(c => (c.balance || 0) <= 0)
  }

  return list
})

// ----- Pagination Computeds -----
const totalPages = computed(() => {
  return Math.ceil(filteredCustomers.value.length / itemsPerPage.value) || 1
})

const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredCustomers.value.slice(start, start + itemsPerPage.value)
})

const showingStart = computed(() => {
  if (filteredCustomers.value.length === 0) return 0
  return (currentPage.value - 1) * itemsPerPage.value + 1
})

const showingEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage.value, filteredCustomers.value.length)
})

const totalCustomersCount = computed(() => customers.value.length)
const activeDebtorsCount = computed(() => customers.value.filter(c => (c.balance || 0) > 0).length)
const clearCustomersCount = computed(() => customers.value.filter(c => (c.balance || 0) <= 0).length)
const totalOutstandingDebt = computed(() =>
  customers.value.reduce((sum, c) => sum + (c.balance || 0), 0)
)

// ----- Actions -----
function openAddModal() {
  selectedCustomerForEdit.value = null
  addEditOpen.value = true
}

function openEditModal(customer: CustomerRow) {
  selectedCustomerForEdit.value = customer
  addEditOpen.value = true
}

function openDetailsModal(customer: CustomerRow) {
  selectedCustomerForDetails.value = customer
  detailsOpen.value = true
}

function openDeleteModal(customer: CustomerRow) {
  selectedCustomerForDelete.value = customer
  deleteOpen.value = true
}

function handleAddTransactionFromDetails(customerId: string) {
  preselectedCustomerIdForTx.value = customerId
  addTransactionOpen.value = true
}

function handleAddPaymentFromDetails(customerId: string) {
  addPaymentOpen.value = true
}

function onCustomerSaved() {
  fetchCustomers()
  if (selectedCustomerForDetails.value) {
    const updated = customers.value.find(c => c.id === selectedCustomerForDetails.value?.id)
    if (updated) selectedCustomerForDetails.value = updated
  }
}

function onCustomerDeleted() {
  fetchCustomers()
  detailsOpen.value = false
}


</script>

<template>
  <div class="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
    <!-- Header Row -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
      <div class="flex items-center gap-2.5">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-primary/10 text-primary">
          <Users class="h-5 w-5" />
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground">Customer Management</h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Add, view details, edit contact info, and manage customer loan accounts.
          </p>
        </div>
      </div>

      <!-- Add New Customer Button -->
      <Button @click="openAddModal" class="font-semibold shadow-xs">
        <UserPlus class="h-4 w-4 mr-2" />
        Add Customer
      </Button>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Search customer by name, contact, or address..."
          class="pl-9 h-9 text-xs"
        />
      </div>

      <!-- Balance Status Tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <button
          type="button"
          :class="[
            'text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap',
            activeFilter === 'all'
              ? 'bg-primary text-primary-foreground shadow-2xs font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          ]"
          @click="activeFilter = 'all'"
        >
          All ({{ totalCustomersCount }})
        </button>

        <button
          type="button"
          :class="[
            'text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap',
            activeFilter === 'unpaid'
              ? 'bg-rose-600 text-white shadow-2xs font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          ]"
          @click="activeFilter = 'unpaid'"
        >
          Has Balance ({{ activeDebtorsCount }})
        </button>

        <button
          type="button"
          :class="[
            'text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap',
            activeFilter === 'paid'
              ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          ]"
          @click="activeFilter = 'paid'"
        >
          Zero Balance ({{ clearCustomersCount }})
        </button>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="rounded-xl border border-border bg-card overflow-hidden shadow-2xs flex flex-col">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 class="h-7 w-7 animate-spin text-primary" />
        <span class="text-xs">Fetching customers...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!filteredCustomers.length" class="text-center py-16 px-4 space-y-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto text-muted-foreground">
          <Users class="h-6 w-6 opacity-60" />
        </div>
        <h3 class="text-sm font-bold text-foreground">No customers found</h3>
        <p class="text-xs text-muted-foreground max-w-sm mx-auto">
          {{ searchQuery ? 'No customer matches your search criteria. Try a different query.' : 'Click "Add Customer" above to register your first customer.' }}
        </p>
        <Button v-if="!searchQuery" size="sm" @click="openAddModal">
          <UserPlus class="h-4 w-4 mr-1.5" />
          Add First Customer
        </Button>
      </div>

      <!-- Customer Data Table -->
      <div v-else class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow class="hover:bg-transparent">
              <TableHead class="text-xs font-bold text-muted-foreground">Customer Name</TableHead>
              <TableHead class="text-xs font-bold text-muted-foreground">Contact Number</TableHead>
              <TableHead class="text-xs font-bold text-muted-foreground">Address</TableHead>
              <TableHead class="text-xs font-bold text-muted-foreground text-right">Total Utang</TableHead>
              <TableHead class="text-xs font-bold text-muted-foreground text-right">Total Paid</TableHead>
              <TableHead class="text-xs font-bold text-muted-foreground text-right">Net Balance</TableHead>
              <TableHead class="text-xs font-bold text-muted-foreground text-center">Status</TableHead>
              <TableHead class="text-xs font-bold text-muted-foreground text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="customer in paginatedCustomers"
              :key="customer.id"
              class="hover:bg-muted/40 transition-colors group cursor-pointer"
              @click="openDetailsModal(customer)"
            >
              <!-- Name & Avatar -->
              <TableCell class="py-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs shadow-2xs">
                    {{ getAvatarInitials(customer.name) }}
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                      {{ customer.name }}
                    </span>
                    <span class="text-[10px] text-muted-foreground">
                      ID: {{ customer.id.slice(0, 8) }}
                    </span>
                  </div>
                </div>
              </TableCell>

              <!-- Phone -->
              <TableCell class="text-xs text-foreground py-3">
                <div v-if="customer.contact_number" class="flex items-center gap-1.5 text-xs">
                  <Phone class="h-3 w-3 text-muted-foreground shrink-0" />
                  <span>{{ customer.contact_number }}</span>
                </div>
                <span v-else class="text-muted-foreground text-xs">—</span>
              </TableCell>

              <!-- Address -->
              <TableCell class="text-xs text-foreground max-w-[200px] truncate py-3">
                <div v-if="customer.address" class="flex items-center gap-1.5 text-xs truncate">
                  <MapPin class="h-3 w-3 text-muted-foreground shrink-0" />
                  <span class="truncate">{{ customer.address }}</span>
                </div>
                <span v-else class="text-muted-foreground text-xs">—</span>
              </TableCell>

              <!-- Total Utang -->
              <TableCell class="text-xs font-semibold text-right py-3 text-foreground">
                {{ formatCurrency(customer.total_utang) }}
              </TableCell>

              <!-- Total Paid -->
              <TableCell class="text-xs font-semibold text-right py-3 text-emerald-600 dark:text-emerald-400">
                {{ formatCurrency(customer.total_paid) }}
              </TableCell>

              <!-- Net Balance -->
              <TableCell
                :class="[
                  'text-xs font-bold text-right py-3',
                  (customer.balance || 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                ]"
              >
                {{ formatCurrency(customer.balance) }}
              </TableCell>

              <!-- Status Badge -->
              <TableCell class="text-center py-3">
                <Badge
                  :class="[
                    (customer.balance || 0) > 0
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  ]"
                  variant="outline"
                  class="text-[10px] px-2 py-0.5 font-semibold"
                >
                  {{ (customer.balance || 0) > 0 ? 'Has Balance' : 'Zero Balance' }}
                </Badge>
              </TableCell>

              <!-- Action Buttons -->
              <TableCell class="text-right py-3 pr-4" @click.stop>
                <div class="flex items-center justify-end gap-1">
                  <!-- See Details -->
                  <Button
                    size="sm"
                    variant="ghost"
                    class="h-7 text-xs px-2 text-foreground hover:bg-muted"
                    title="See Details"
                    @click.stop="openDetailsModal(customer)"
                  >
                    <Eye class="h-3.5 w-3.5 mr-1" />
                    Details
                  </Button>

                  <!-- Edit -->
                  <Button
                    size="sm"
                    variant="ghost"
                    class="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    title="Edit Customer"
                    @click.stop="openEditModal(customer)"
                  >
                    <Edit3 class="h-3.5 w-3.5" />
                  </Button>

                  <!-- Delete -->
                  <Button
                    size="sm"
                    variant="ghost"
                    class="h-7 w-7 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    title="Delete Customer"
                    @click.stop="openDeleteModal(customer)"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Pagination Footer -->
      <div
        v-if="filteredCustomers.length > 0"
        class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20 text-xs"
      >
        <!-- Showing Counter Info -->
        <div class="text-muted-foreground text-xs">
          Showing <span class="font-bold text-foreground">{{ showingStart }}</span> to
          <span class="font-bold text-foreground">{{ showingEnd }}</span> of
          <span class="font-bold text-foreground">{{ filteredCustomers.length }}</span> customers
        </div>

        <!-- Controls Group -->
        <div class="flex items-center gap-4 flex-wrap">
          <!-- Rows per page selector -->
          <div class="flex items-center gap-2">
            <span class="text-muted-foreground text-xs">Rows per page:</span>
            <select
              v-model="itemsPerPage"
              class="h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>

          <!-- Page Navigation Buttons -->
          <div class="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              class="h-8 w-8 p-0"
              :disabled="currentPage <= 1"
              title="First Page"
              @click="currentPage = 1"
            >
              <ChevronsLeft class="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              class="h-8 w-8 p-0"
              :disabled="currentPage <= 1"
              title="Previous Page"
              @click="currentPage--"
            >
              <ChevronLeft class="h-4 w-4" />
            </Button>

            <span class="px-2 text-xs font-semibold text-foreground">
              Page {{ currentPage }} of {{ totalPages }}
            </span>

            <Button
              size="sm"
              variant="outline"
              class="h-8 w-8 p-0"
              :disabled="currentPage >= totalPages"
              title="Next Page"
              @click="currentPage++"
            >
              <ChevronRight class="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              class="h-8 w-8 p-0"
              :disabled="currentPage >= totalPages"
              title="Last Page"
              @click="currentPage = totalPages"
            >
              <ChevronsRight class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals & Sheets -->
    <AddEditCustomerSheet
      v-model:open="addEditOpen"
      :customer="selectedCustomerForEdit"
      @success="onCustomerSaved"
    />

    <CustomerDetailsSheet
      v-model:open="detailsOpen"
      :customer="selectedCustomerForDetails"
      @edit="openEditModal"
      @delete="openDeleteModal"
      @add-transaction="handleAddTransactionFromDetails"
      @add-payment="handleAddPaymentFromDetails"
    />

    <DeleteCustomerModal
      v-model:open="deleteOpen"
      :customer="selectedCustomerForDelete"
      @deleted="onCustomerDeleted"
    />

  </div>
</template>