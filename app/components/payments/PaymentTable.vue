<!-- components/payments/PaymentTable.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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
import {
  Search,
  Trash2,
  SlidersHorizontal,
  ArrowUpDown,
  MoreVertical,
  Check,
  CheckCircle2,
  History
} from 'lucide-vue-next'
import { usePayments, type PaymentRow } from '@/composables/usePayments'

const { payments, loading, fetchPayments, deletePayments } = usePayments()

const searchQuery = ref('')
const selectedRowIds = ref<string[]>([])
const sortAscending = ref(false)

onMounted(() => {
  fetchPayments()
})

// Filter and sort payments
const filteredPayments = computed(() => {
  let list = [...payments.value]

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(p => {
      const customerName = p.customer?.name?.toLowerCase() || ''
      const note = p.note?.toLowerCase() || ''
      const amount = String(p.amount_paid)
      return customerName.includes(q) || note.includes(q) || amount.includes(q)
    })
  }

  // Sort by amount or date
  list.sort((a, b) => {
    const valA = Number(a.amount_paid)
    const valB = Number(b.amount_paid)
    return sortAscending.value ? valA - valB : valB - valA
  })

  return list
})

// Row selection helpers
const isAllSelected = computed(() => {
  return filteredPayments.value.length > 0 && 
    filteredPayments.value.every(p => selectedRowIds.value.includes(p.id))
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedRowIds.value = []
  } else {
    selectedRowIds.value = filteredPayments.value.map(p => p.id)
  }
}

const toggleSelectRow = (id: string) => {
  if (selectedRowIds.value.includes(id)) {
    selectedRowIds.value = selectedRowIds.value.filter(item => item !== id)
  } else {
    selectedRowIds.value.push(id)
  }
}

const isRowSelected = (id: string) => selectedRowIds.value.includes(id)

// Bulk delete action
const deleting = ref(false)
const handleBulkDelete = async () => {
  if (!selectedRowIds.value.length) return
  if (!confirm(`Are you sure you want to delete ${selectedRowIds.value.length} selected payment record(s)?`)) return

  deleting.value = true
  await deletePayments(selectedRowIds.value)
  selectedRowIds.value = []
  deleting.value = false
}

// Pagination state
const currentPage = ref(1)
const pageSize = 8

const totalPages = computed(() => Math.ceil(filteredPayments.value.length / pageSize) || 1)

const paginatedPayments = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredPayments.value.slice(start, start + pageSize)
})

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function getAvatarInitials(name?: string) {
  if (!name) return '?'
  const parts = name.split(' ').filter(p => p.length > 0)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}
</script>

<template>
  <div class="space-y-4">
    <!-- Top Filter Controls Bar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Filter by customer or payment note..."
          class="pl-9 h-9 text-xs bg-background rounded-lg border-border focus:ring-1"
        />
      </div>

      <!-- Action Controls (Right) -->
      <div class="flex items-center gap-2 self-end sm:self-auto">
        <!-- Bulk Delete Button -->
        <Button
          v-if="selectedRowIds.length > 0"
          variant="outline"
          size="sm"
          :disabled="deleting"
          class="h-9 border-rose-200 bg-rose-50/60 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400 font-medium text-xs gap-1.5 rounded-lg transition-colors"
          @click="handleBulkDelete"
        >
          <Trash2 class="h-3.5 w-3.5" />
          Delete
          <span class="ml-0.5 rounded-md bg-rose-200/70 dark:bg-rose-900/60 px-1.5 py-0.2 text-[10px] font-bold">
            {{ selectedRowIds.length }}
          </span>
        </Button>

        <!-- Display / Sort Button -->
        <Button
          variant="outline"
          size="sm"
          class="h-9 text-xs font-medium gap-1.5 bg-background border-border rounded-lg"
          @click="sortAscending = !sortAscending"
        >
          <SlidersHorizontal class="h-3.5 w-3.5 text-muted-foreground" />
          Display
        </Button>
      </div>
    </div>

    <!-- Table Card Container -->
    <div class="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
      <Table>
        <TableHeader class="bg-muted/40 border-b border-border/70">
          <TableRow class="hover:bg-transparent">
            <!-- Checkbox Column -->
            <TableHead class="w-12 text-center pl-4 py-3">
              <button
                type="button"
                :class="[
                  'h-4 w-4 rounded flex items-center justify-center transition-colors border',
                  isAllSelected
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-muted-foreground/40 bg-background hover:border-emerald-500'
                ]"
                @click="toggleSelectAll"
              >
                <Check v-if="isAllSelected" class="h-3 w-3 stroke-[3]" />
              </button>
            </TableHead>

            <!-- ID Column -->
            <TableHead class="w-16 text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">
              ID
            </TableHead>

            <!-- Customer Name Column -->
            <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">
              Customer / Borrower
            </TableHead>

            <!-- Amount Paid Column (Sortable) -->
            <TableHead
              class="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 cursor-pointer hover:text-foreground transition-colors"
              @click="sortAscending = !sortAscending"
            >
              <div class="flex items-center gap-1">
                <ArrowUpDown class="h-3.5 w-3.5" />
                Amount Paid
              </div>
            </TableHead>

            <!-- Date Paid Column -->
            <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">
              Date Paid
            </TableHead>

            <!-- Payment Note Column -->
            <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">
              Method / Note
            </TableHead>

            <!-- Status Column -->
            <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">
              Status
            </TableHead>

            <!-- Actions Column -->
            <TableHead class="w-12 py-3 text-right pr-4">
              <span class="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody class="divide-y divide-border/50">
          <!-- Loading State -->
          <template v-if="loading">
            <TableRow>
              <TableCell colspan="8" class="h-32 text-center text-xs text-muted-foreground">
                <div class="flex flex-col items-center justify-center gap-2">
                  <div class="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                  Loading payment history...
                </div>
              </TableCell>
            </TableRow>
          </template>

          <!-- Empty State -->
          <template v-else-if="!paginatedPayments.length">
            <TableRow>
              <TableCell colspan="8" class="h-32 text-center text-xs text-muted-foreground">
                <div class="flex flex-col items-center justify-center gap-1.5">
                  <History class="h-6 w-6 text-muted-foreground/60" />
                  No payment history recorded yet.
                </div>
              </TableCell>
            </TableRow>
          </template>

          <!-- Rows -->
          <template v-else>
            <TableRow
              v-for="(row, index) in paginatedPayments"
              :key="row.id"
              :class="[
                'hover:bg-muted/30 transition-colors text-xs',
                isRowSelected(row.id) ? 'bg-emerald-500/5 dark:bg-emerald-950/20' : ''
              ]"
            >
              <!-- Row Checkbox -->
              <TableCell class="w-12 text-center pl-4 py-3.5">
                <button
                  type="button"
                  :class="[
                    'h-4 w-4 rounded flex items-center justify-center transition-colors border',
                    isRowSelected(row.id)
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-muted-foreground/40 bg-background hover:border-emerald-500'
                  ]"
                  @click="toggleSelectRow(row.id)"
                >
                  <Check v-if="isRowSelected(row.id)" class="h-3 w-3 stroke-[3]" />
                </button>
              </TableCell>

              <!-- Row ID -->
              <TableCell class="font-mono text-muted-foreground py-3.5">
                {{ index + 1 + (currentPage - 1) * pageSize }}
              </TableCell>

              <!-- Customer Avatar & Details -->
              <TableCell class="py-3.5">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-2xs">
                    {{ getAvatarInitials(row.customer?.name) }}
                  </div>
                  <div class="flex flex-col">
                    <span class="font-semibold text-foreground leading-tight">
                      {{ row.customer?.name || 'Unknown Customer' }}
                    </span>
                  </div>
                </div>
              </TableCell>

              <!-- Amount Paid -->
              <TableCell class="font-bold text-emerald-600 dark:text-emerald-400 py-3.5 text-sm">
                +{{ formatCurrency(row.amount_paid) }}
              </TableCell>

              <!-- Date Paid -->
              <TableCell class="text-muted-foreground py-3.5">
                {{ formatDate(row.date_paid) }}
              </TableCell>

              <!-- Method / Note -->
              <TableCell class="text-muted-foreground py-3.5 max-w-[200px] truncate">
                {{ row.note || 'Cash Payment' }}
              </TableCell>

              <!-- Status Pill Badge -->
              <TableCell class="py-3.5">
                <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60">
                  <CheckCircle2 class="h-3 w-3 text-emerald-500" />
                  Received
                </span>
              </TableCell>

              <!-- Row Actions -->
              <TableCell class="py-3.5 text-right pr-4">
                <button class="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <MoreVertical class="h-4 w-4" />
                </button>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Bottom Pagination Footer -->
    <div class="flex items-center justify-between px-1 text-xs text-muted-foreground">
      <div>
        Showing {{ paginatedPayments.length }} of {{ filteredPayments.length }} payment records
      </div>

      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage <= 1"
          class="h-8 text-xs font-medium rounded-lg"
          @click="currentPage--"
        >
          Previous
        </Button>
        <span class="px-2 text-xs font-medium text-foreground">
          {{ currentPage }} / {{ totalPages }}
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage >= totalPages"
          class="h-8 text-xs font-medium rounded-lg"
          @click="currentPage++"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>
