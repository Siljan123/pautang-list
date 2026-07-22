<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  AlertTriangle,
  Clock,
  Phone,
  MessageSquare,
  CreditCard,
  Calendar,
  ChevronDown,
  ChevronRight,
  Receipt,
} from "lucide-vue-next"
import { useTransactions, type TransactionRow } from "@/composables/useTransactions"

const emit = defineEmits<{
  openReminder: [transaction: TransactionRow]
  openPayment: [transaction: TransactionRow]
}>()

const { transactions, loading, fetchTransactions } = useTransactions()
const searchQuery = ref("")

type AgeFilter = "all" | "2w-1y" | "2w-1m" | "1m-3m" | "3m-6m" | "6m-1y" | "1y+"

const activeFilter = ref<AgeFilter>("all")

const filterTabs: { label: string; value: AgeFilter }[] = [
  { label: "All Unpaid",       value: "all"   },
  { label: "2 Weeks – 1 Year", value: "2w-1y" },
  { label: "2 Wks – 1 Month",  value: "2w-1m" },
  { label: "1 – 3 Months",     value: "1m-3m" },
  { label: "3 – 6 Months",     value: "3m-6m" },
  { label: "6 Months – 1 Year",value: "6m-1y" },
  { label: "Over 1 Year",      value: "1y+"   },
]

onMounted(() => { fetchTransactions() })

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysOverdue(dateStr: string | null): number {
  if (!dateStr) return 0
  const time = new Date(dateStr).getTime()
  if (isNaN(time)) return 0
  return Math.max(0, Math.floor((Date.now() - time) / 86_400_000))
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
  })
}

function getAvatarInitials(name: string | undefined | null) {
  if (!name) return "?"
  const parts = name.trim().split(" ")
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase()
}

function daysLabel(days: number) {
  if (days <= 0) return "Today"
  if (days === 1) return "1 day"
  if (days < 30)  return `${days} days`
  const months = Math.floor(days / 30)
  const rem    = days % 30
  if (months < 12) return rem > 0 ? `${months}mo ${rem}d` : `${months} month${months > 1 ? "s" : ""}`
  const years     = Math.floor(months / 12)
  const remMonths = months % 12
  return remMonths > 0 ? `${years}yr ${remMonths}mo` : `${years} year${years > 1 ? "s" : ""}`
}

function getRiskLevel(days: number) {
  if (days < 14)   return { label: "Recent",     color: "text-slate-600",  bg: "bg-slate-50",  border: "border-slate-200",  darkColor: "dark:text-slate-400",  darkBg: "dark:bg-slate-900/40",  dot: "bg-slate-400"  }
  if (days <= 30)  return { label: "Moderate",   color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", darkColor: "dark:text-yellow-400", darkBg: "dark:bg-yellow-950/30", dot: "bg-yellow-500" }
  if (days <= 90)  return { label: "High",       color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200",  darkColor: "dark:text-amber-400",  darkBg: "dark:bg-amber-950/30",  dot: "bg-amber-500"  }
  if (days <= 180) return { label: "Critical",   color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", darkColor: "dark:text-orange-400", darkBg: "dark:bg-orange-950/30", dot: "bg-orange-500" }
  if (days <= 365) return { label: "Severe",     color: "text-rose-700",   bg: "bg-rose-50",   border: "border-rose-200",   darkColor: "dark:text-rose-400",   darkBg: "dark:bg-rose-950/30",   dot: "bg-rose-500"   }
  return             { label: "Delinquent", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", darkColor: "dark:text-purple-400", darkBg: "dark:bg-purple-950/30", dot: "bg-purple-500" }
}

function inRange(days: number, filter: AgeFilter): boolean {
  switch (filter) {
    case "all":   return true
    case "2w-1y": return days >= 14  && days <= 365
    case "2w-1m": return days >= 14  && days <= 30
    case "1m-3m": return days >= 31  && days <= 90
    case "3m-6m": return days >= 91  && days <= 180
    case "6m-1y": return days >= 181 && days <= 365
    case "1y+":   return days > 365
    default:      return true
  }
}

// ─── Customer-grouped computed data ────────────────────────────────────────

interface CustomerGroup {
  customerId:    string
  customerName:  string
  contactNumber: string | null | undefined
  address:       string | null | undefined
  transactions:  TransactionRow[]
  totalOwed:     number
  oldestDays:    number
  newestDays:    number
}

const customerGroups = computed<CustomerGroup[]>(() => {
  const unpaid = transactions.value.filter(t => !t.is_paid)
  const map    = new Map<string, CustomerGroup>()

  unpaid.forEach(t => {
    const days = getDaysOverdue(t.date_utang || t.created_at)
    if (!inRange(days, activeFilter.value)) return

    const id = t.customer_id
    if (!map.has(id)) {
      map.set(id, {
        customerId:    id,
        customerName:  t.customer?.name || "Unknown Borrower",
        contactNumber: t.customer?.contact_number,
        address:       t.customer?.address,
        transactions:  [],
        totalOwed:     0,
        oldestDays:    0,
        newestDays:    Infinity,
      })
    }

    const g = map.get(id)!
    g.transactions.push(t)
    g.totalOwed += Number(t.total_amount || 0)
    if (days > g.oldestDays) g.oldestDays = days
    if (days < g.newestDays) g.newestDays = days
  })

  // Sort each customer's transactions oldest first
  map.forEach(g => {
    g.transactions.sort((a, b) =>
      getDaysOverdue(b.date_utang || b.created_at) - getDaysOverdue(a.date_utang || a.created_at)
    )
  })

  let groups = Array.from(map.values())

  // Search
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    groups = groups.filter(g =>
      g.customerName.toLowerCase().includes(q) ||
      (g.contactNumber?.toLowerCase().includes(q) ?? false)
    )
  }

  // Sort customers by most overdue first
  groups.sort((a, b) => b.oldestDays - a.oldestDays)

  return groups
})

// ─── Pagination ─────────────────────────────────────────────────────────────

const currentPage = ref(1)
const pageSize    = 8

const totalPages    = computed(() => Math.ceil(customerGroups.value.length / pageSize) || 1)
const paginatedGroups = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return customerGroups.value.slice(start, start + pageSize)
})

watch(activeFilter, () => { currentPage.value = 1 })
watch(searchQuery,  () => { currentPage.value = 1 })

// ─── Expand / collapse ──────────────────────────────────────────────────────

const expandedIds = ref<Set<string>>(new Set())

function toggleExpand(id: string) {
  const next = new Set(expandedIds.value)
  next.has(id) ? next.delete(id) : next.add(id)
  expandedIds.value = next
}

const isExpanded = (id: string) => expandedIds.value.has(id)

// ─── Tab styling ────────────────────────────────────────────────────────────

function tabClass(value: AgeFilter) {
  const base = "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border"
  return activeFilter.value === value
    ? `${base} bg-rose-600 text-white border-rose-600 shadow-sm`
    : `${base} bg-background text-muted-foreground border-border hover:border-rose-400 hover:text-rose-600`
}
</script>

<template>
  <div class="space-y-4">

    <!-- Age-range filter tabs -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="tab in filterTabs"
        :key="tab.value"
        type="button"
        :class="tabClass(tab.value)"
        @click="activeFilter = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Search & summary -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Search customer name or phone..."
          class="pl-9 h-9 text-xs bg-background rounded-lg border-border"
        />
      </div>
      <div class="flex items-center gap-1.5 text-xs text-muted-foreground px-1">
        <AlertTriangle class="h-3.5 w-3.5 text-rose-500" />
        <span>
          <span class="font-bold text-foreground">{{ customerGroups.length }}</span>
          customer{{ customerGroups.length !== 1 ? "s" : "" }} with overdue balance
        </span>
      </div>
    </div>

    <!-- Main table card -->
    <div class="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
      <Table>
        <TableHeader class="bg-muted/40 border-b border-border/70">
          <TableRow class="hover:bg-transparent">
            <TableHead class="w-10 py-3 pl-3" />
            <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">Customer</TableHead>
            <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">Unpaid Txns</TableHead>
            <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">
              <div class="flex items-center gap-1"><Clock class="h-3.5 w-3.5" /> Oldest Due</div>
            </TableHead>
            <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">Risk Level</TableHead>
            <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">Total Owed</TableHead>
            <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 text-right pr-4">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <!-- Loading -->
          <template v-if="loading">
            <TableRow>
              <TableCell colspan="7" class="h-32 text-center text-xs text-muted-foreground">
                <div class="flex flex-col items-center justify-center gap-2">
                  <div class="h-5 w-5 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                  Loading overdue accounts...
                </div>
              </TableCell>
            </TableRow>
          </template>

          <!-- Empty -->
          <template v-else-if="!paginatedGroups.length">
            <TableRow>
              <TableCell colspan="7" class="h-36 text-center text-xs text-muted-foreground">
                <div class="flex flex-col items-center justify-center gap-2">
                  <div class="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Calendar class="h-6 w-6 text-emerald-600" />
                  </div>
                  <p class="font-medium text-foreground text-sm">No overdue accounts found</p>
                  <p class="text-xs text-muted-foreground">No customers match the selected age range.</p>
                </div>
              </TableCell>
            </TableRow>
          </template>

          <!-- Customer rows -->
          <template v-else>
            <template v-for="group in paginatedGroups" :key="group.customerId">

              <!-- ── Customer summary row (click to expand) ── -->
              <TableRow
                class="hover:bg-muted/30 transition-colors text-xs cursor-pointer group"
                @click="toggleExpand(group.customerId)"
              >
                <!-- Expand icon -->
                <TableCell class="w-10 pl-3 py-3.5">
                  <component
                    :is="isExpanded(group.customerId) ? ChevronDown : ChevronRight"
                    class="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors"
                  />
                </TableCell>

                <!-- Customer info -->
                <TableCell class="py-3.5">
                  <div class="flex items-center gap-3">
                    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-orange-500 text-white font-bold text-[11px] shadow-xs">
                      {{ getAvatarInitials(group.customerName) }}
                    </div>
                    <div class="flex flex-col gap-0.5">
                      <span class="font-semibold text-foreground leading-tight">{{ group.customerName }}</span>
                      <span v-if="group.contactNumber" class="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Phone class="h-3 w-3" />{{ group.contactNumber }}
                      </span>
                      <span v-else class="text-[10px] text-muted-foreground/50 italic">No contact number</span>
                    </div>
                  </div>
                </TableCell>

                <!-- Unpaid transactions count -->
                <TableCell class="py-3.5">
                  <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Receipt class="h-3.5 w-3.5 text-muted-foreground" />
                    {{ group.transactions.length }}
                    <span class="text-muted-foreground font-normal">unpaid</span>
                  </span>
                </TableCell>

                <!-- Oldest due date -->
                <TableCell class="py-3.5">
                  <div class="flex items-center gap-1.5">
                    <Clock class="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    <span class="font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                      {{ daysLabel(group.oldestDays) }}
                    </span>
                  </div>
                </TableCell>

                <!-- Risk badge (based on oldest txn) -->
                <TableCell class="py-3.5">
                  <span
                    :class="[
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border',
                      getRiskLevel(group.oldestDays).bg,
                      getRiskLevel(group.oldestDays).color,
                      getRiskLevel(group.oldestDays).border,
                      getRiskLevel(group.oldestDays).darkBg,
                      getRiskLevel(group.oldestDays).darkColor,
                    ]"
                  >
                    <span :class="['h-1.5 w-1.5 rounded-full', getRiskLevel(group.oldestDays).dot]" />
                    {{ getRiskLevel(group.oldestDays).label }}
                  </span>
                </TableCell>

                <!-- Total owed -->
                <TableCell class="py-3.5">
                  <span class="font-bold text-rose-600 dark:text-rose-400 tabular-nums text-sm">
                    {{ formatCurrency(group.totalOwed) }}
                  </span>
                </TableCell>

                <!-- Actions (stop propagation so row click doesn't fire) -->
                <TableCell class="py-3.5 pr-4" @click.stop>
                  <div class="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      class="h-7 px-2.5 text-[10px] font-semibold gap-1 border-amber-200 bg-amber-50/60 text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-400 rounded-lg"
                      @click="emit('openReminder', group.transactions[0])"
                    >
                      <MessageSquare class="h-3 w-3" />Remind
                    </Button>
                    <Button
                      size="sm"
                      class="h-7 px-2.5 text-[10px] font-semibold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                      @click="emit('openPayment', group.transactions[0])"
                    >
                      <CreditCard class="h-3 w-3" />Pay
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              <!-- ── Expanded: individual unpaid transaction rows ── -->
              <template v-if="isExpanded(group.customerId)">
                <TableRow
                  v-for="tx in group.transactions"
                  :key="tx.id"
                  class="bg-muted/20 dark:bg-muted/10 text-xs border-t border-dashed border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <!-- indent spacer -->
                  <TableCell class="pl-3 py-2.5" />

                  <!-- Transaction info (spans 2 cols: Customer + Unpaid Txns) -->
                  <TableCell class="py-2.5" colspan="2">
                    <div class="flex items-start gap-2 pl-9">
                      <Receipt class="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <div class="flex flex-col gap-0.5">
                        <span class="text-muted-foreground">
                          Loan on
                          <span class="font-semibold text-foreground">{{ formatDate(tx.date_utang) }}</span>
                        </span>
                        <span v-if="tx.notes" class="text-[10px] text-muted-foreground italic truncate max-w-[200px]">
                          {{ tx.notes }}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <!-- Days overdue for this transaction -->
                  <TableCell class="py-2.5">
                    <div class="flex items-center gap-1">
                      <Clock class="h-3 w-3 text-rose-400 shrink-0" />
                      <span class="text-rose-500 dark:text-rose-400 font-semibold tabular-nums">
                        {{ daysLabel(getDaysOverdue(tx.date_utang || tx.created_at)) }}
                      </span>
                    </div>
                  </TableCell>

                  <!-- Risk badge per transaction -->
                  <TableCell class="py-2.5">
                    <span
                      :class="[
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border',
                        getRiskLevel(getDaysOverdue(tx.date_utang || tx.created_at)).bg,
                        getRiskLevel(getDaysOverdue(tx.date_utang || tx.created_at)).color,
                        getRiskLevel(getDaysOverdue(tx.date_utang || tx.created_at)).border,
                        getRiskLevel(getDaysOverdue(tx.date_utang || tx.created_at)).darkBg,
                        getRiskLevel(getDaysOverdue(tx.date_utang || tx.created_at)).darkColor,
                      ]"
                    >
                      <span :class="['h-1.5 w-1.5 rounded-full', getRiskLevel(getDaysOverdue(tx.date_utang || tx.created_at)).dot]" />
                      {{ getRiskLevel(getDaysOverdue(tx.date_utang || tx.created_at)).label }}
                    </span>
                  </TableCell>

                  <!-- Amount per transaction -->
                  <TableCell class="py-2.5">
                    <span class="font-semibold text-foreground tabular-nums">
                      {{ formatCurrency(tx.total_amount) }}
                    </span>
                  </TableCell>

                  <!-- Pay This transaction -->
                  <TableCell class="py-2.5 pr-4">
                    <div class="flex justify-end">
                      <Button
                        size="sm"
                        class="h-6 px-2.5 text-[10px] font-semibold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                        @click.stop="emit('openPayment', tx)"
                      >
                        <CreditCard class="h-3 w-3" />Pay This
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </template>

            </template>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between px-1 text-xs text-muted-foreground">
      <div>
        Showing {{ paginatedGroups.length }} of {{ customerGroups.length }}
        customer{{ customerGroups.length !== 1 ? "s" : "" }}
      </div>
      <div class="flex items-center gap-2">
        <Button
          variant="outline" size="sm"
          :disabled="currentPage <= 1"
          class="h-8 text-xs font-medium rounded-lg"
          @click="currentPage--"
        >Previous</Button>
        <span class="px-2 text-xs font-medium text-foreground">{{ currentPage }} / {{ totalPages }}</span>
        <Button
          variant="outline" size="sm"
          :disabled="currentPage >= totalPages"
          class="h-8 text-xs font-medium rounded-lg"
          @click="currentPage++"
        >Next</Button>
      </div>
    </div>

  </div>
</template>
