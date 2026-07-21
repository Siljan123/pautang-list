<!-- components/TransactionTable.vue -->
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Trash2,
  ArrowUpDown,
  MoreVertical,
  Check,
  Receipt
} from 'lucide-vue-next'
import { useTransactions } from '@/composables/useTransactions'

const { transactions, loading, fetchTransactions, deleteTransactions } = useTransactions()

const searchQuery = ref('')
const statusFilter = ref('all')
const selectedRowIds = ref<string[]>([])
const sortAscending = ref(false)

onMounted(() => {
  fetchTransactions()
})

// Filter and sort transactions
const filteredTransactions = computed(() => {
  let list = [...transactions.value]

  // Filter by status
  if (statusFilter.value === 'paid') {
    list = list.filter(t => t.is_paid)
  } else if (statusFilter.value === 'unpaid') {
    list = list.filter(t => !t.is_paid)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(t => {
      const borrowerName = t.customer?.name?.toLowerCase() || ''
      const notes = t.notes?.toLowerCase() || ''
      const amount = String(t.total_amount)
      return borrowerName.includes(q) || notes.includes(q) || amount.includes(q)
    })
  }

  // Sort by amount or date
  list.sort((a, b) => {
    const valA = Number(a.total_amount)
    const valB = Number(b.total_amount)
    return sortAscending.value ? valA - valB : valB - valA
  })

  return list
})

// Row selection helpers
const isAllSelected = computed(() => {
  return filteredTransactions.value.length > 0 && 
    filteredTransactions.value.every(t => selectedRowIds.value.includes(t.id))
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedRowIds.value = []
  } else {
    selectedRowIds.value = filteredTransactions.value.map(t => t.id)
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
  if (!confirm(`Are you sure you want to delete ${selectedRowIds.value.length} selected transaction(s)?`)) return

  deleting.value = true
  await deleteTransactions(selectedRowIds.value)
  selectedRowIds.value = []
  deleting.value = false
}

// Pagination state
const currentPage = ref(1)
const pageSize = 8

const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / pageSize) || 1)

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredTransactions.value.slice(start, start + pageSize)
})

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)
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
          placeholder="Filter borrowers or notes..."
          class="pl-9 h-9 text-xs bg-background rounded-lg border-border focus:ring-1"
        />
      </div>

      <!-- Action & Filter Controls (Right) -->
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

        <!-- Status Filter Dropdown -->
        <Select v-model="statusFilter">
          <SelectTrigger class="h-9 w-[110px] text-xs font-medium bg-background border-border rounded-lg">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>

      </div>
    </div>

    <!-- Table Card Container -->
    <div class="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
      <Table>
        <TableHeader class="bg-muted/40 border-b border-border/70">
          <TableRow class="hover:bg-transparent">
            <!-- Checkbox Column -->
            <TableHead class="w-12 text-center  py-3">
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

            <!-- Borrower / Name Column -->
            <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">
              Borrower
            </TableHead>

            <!-- Amount Column (Sortable) -->
            <TableHead
              class="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 cursor-pointer hover:text-foreground transition-colors"
              @click="sortAscending = !sortAscending"
            >
              <div class="flex items-center gap-1">
                <ArrowUpDown class="h-3.5 w-3.5" />
                Amount
              </div>
            </TableHead>

            <!-- Date Column -->
            <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">
              Date
            </TableHead>

            <!-- Status Column -->
            <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">
              Status
            </TableHead>

            <!-- Actions Column -->
            <TableHead class="w-12 py-3 text-black text-right pr-4">
              <span class="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody class="divide-y divide-border/50">
          <!-- Loading State -->
          <template v-if="loading">
            <TableRow>
              <TableCell colspan="7" class="h-32 text-center text-xs text-muted-foreground">
                <div class="flex flex-col items-center justify-center gap-2">
                  <div class="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                  Loading transactions...
                </div>
              </TableCell>
            </TableRow>
          </template>

          <!-- Empty State -->
          <template v-else-if="!paginatedTransactions.length">
            <TableRow>
              <TableCell colspan="7" class="h-32 text-center text-xs text-muted-foreground">
                <div class="flex flex-col items-center justify-center gap-1.5">
                  <Receipt class="h-6 w-6 text-muted-foreground/60" />
                  No transactions found matching your filter.
                </div>
              </TableCell>
            </TableRow>
          </template>

          <!-- Rows -->
          <template v-else>
            <TableRow
              v-for="(row) in paginatedTransactions"
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

              <!-- Borrower Avatar & Details -->
              <TableCell class="py-3.5">
                <div class="flex items-center gap-3">
                  <!-- Avatar circle -->
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] shadow-xs">
                    {{ getAvatarInitials(row.customer?.name) }}
                  </div>
                  <div class="flex flex-col">
                    <span class="font-semibold text-foreground leading-tight">
                      {{ row.customer?.name || 'Unknown Borrower' }}
                    </span>
                  </div>
                </div>
              </TableCell>

              <!-- Amount -->
              <TableCell class="font-semibold text-foreground py-3.5">
                {{ formatCurrency(row.total_amount) }}
              </TableCell>

              <!-- Date -->
              <TableCell class="text-muted-foreground py-3.5">
                {{ formatDate(row.date_utang) }}
              </TableCell>

              <!-- Status Pill Badge -->
              <TableCell class="py-3.5">
                <span
                  v-if="row.is_paid"
                  class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Paid
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  Unpaid
                </span>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Bottom Pagination Footer -->
    <div class="flex items-center justify-between px-1 text-xs text-muted-foreground">
      <div>
        Showing {{ paginatedTransactions.length }} of {{ filteredTransactions.length }} transactions
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