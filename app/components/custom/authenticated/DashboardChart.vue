<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PropType } from 'vue'
import { TrendingUp, Wallet, ArrowDownLeft } from 'lucide-vue-next'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import type { TransactionRow } from '@/composables/useTransactions'

const props = defineProps({
  transactions: {
    type: Array as PropType<TransactionRow[]>,
    default: () => []
  }
})

interface MonthlyData {
  monthLabel: string
  collected: number
  unpaid: number
}

// Compute dynamic monthly totals from real Supabase transaction history
const chartData = computed<MonthlyData[]>(() => {
  const monthsMap = new Map<string, { monthLabel: string; collected: number; unpaid: number; keyDate: Date }>()
  
  // Generate the last 6 calendar months as default buckets
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = d.toLocaleDateString('en-US', { month: 'short' })
    monthsMap.set(key, { monthLabel, collected: 0, unpaid: 0, keyDate: d })
  }

  // Aggregate real Supabase transactions into month buckets
  if (props.transactions && props.transactions.length) {
    props.transactions.forEach(t => {
      const dateStr = t.date_utang || t.created_at
      if (!dateStr) return
      const tDate = new Date(dateStr)
      if (isNaN(tDate.getTime())) return

      const key = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}`
      const amount = Number(t.total_amount || 0)

      if (monthsMap.has(key)) {
        const bucket = monthsMap.get(key)!
        if (t.is_paid) {
          bucket.collected += amount
        } else {
          bucket.unpaid += amount
        }
      }
    })
  }

  return Array.from(monthsMap.values()).map(({ monthLabel, collected, unpaid }) => ({
    monthLabel,
    collected,
    unpaid
  }))
})

const hoverIndex = ref<number | null>(null)

// Max scale value for Y axis
const maxValue = computed(() => {
  const maxes = chartData.value.map(d => Math.max(d.collected, d.unpaid))
  const max = Math.max(...maxes, 1000)
  return max * 1.25
})

// SVG dimensions
const width = 600
const height = 220
const paddingX = 45
const paddingY = 30

const points = computed(() => {
  const data = chartData.value
  const stepX = (width - paddingX * 2) / (data.length - 1 || 1)
  
  return data.map((d, i) => {
    const x = paddingX + i * stepX
    const yCollected = height - paddingY - (d.collected / maxValue.value) * (height - paddingY * 2)
    const yUnpaid = height - paddingY - (d.unpaid / maxValue.value) * (height - paddingY * 2)
    return { x, yCollected, yUnpaid, raw: d }
  })
})

// SVG path generator for Area Fill (Collected Incomes)
const collectedAreaPath = computed(() => {
  if (!points.value.length) return ''
  const pts = points.value
  let d = `M ${pts[0].x} ${pts[0].yCollected}`
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i].x} ${pts[i].yCollected}`
  }
  d += ` L ${pts[pts.length - 1].x} ${height - paddingY} L ${pts[0].x} ${height - paddingY} Z`
  return d
})

// SVG path generator for Unpaid Area Fill (Borrowed Goods)
const unpaidAreaPath = computed(() => {
  if (!points.value.length) return ''
  const pts = points.value
  let d = `M ${pts[0].x} ${pts[0].yUnpaid}`
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i].x} ${pts[i].yUnpaid}`
  }
  d += ` L ${pts[pts.length - 1].x} ${height - paddingY} L ${pts[0].x} ${height - paddingY} Z`
  return d
})

const collectedLinePath = computed(() => {
  if (!points.value.length) return ''
  const pts = points.value
  let d = `M ${pts[0].x} ${pts[0].yCollected}`
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i].x} ${pts[i].yCollected}`
  }
  return d
})

const unpaidLinePath = computed(() => {
  if (!points.value.length) return ''
  const pts = points.value
  let d = `M ${pts[0].x} ${pts[0].yUnpaid}`
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i].x} ${pts[i].yUnpaid}`
  }
  return d
})

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)
}
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <CardTitle class="text-base">Real Transaction & Payment Analytics</CardTitle>
          <CardDescription>Collected Payment Incomes vs Unpaid Borrowed Goods</CardDescription>
        </div>

        <!-- Legend -->
        <div class="flex items-center gap-4 text-xs font-semibold">
          <span class="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Payment Incomes (Paid)
          </span>
          <span class="flex items-center gap-1.5 text-rose-500">
            <span class="h-2.5 w-2.5 rounded-full bg-rose-500" />
            Borrowed Goods (Unpaid)
          </span>
        </div>
      </div>
    </CardHeader>

    <CardContent class="pt-2">
      <!-- SVG Area Chart -->
      <div class="relative w-full overflow-hidden">
        <svg
          :viewBox="`0 0 ${width} ${height}`"
          class="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#10b981" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
            </linearGradient>

            <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <!-- Grid horizontal lines -->
          <line
            v-for="tick in [0, 0.33, 0.66, 1]"
            :key="tick"
            :x1="paddingX"
            :y1="height - paddingY - tick * (height - paddingY * 2)"
            :x2="width - paddingX"
            :y2="height - paddingY - tick * (height - paddingY * 2)"
            class="stroke-border/50"
            stroke-dasharray="3 3"
            stroke-width="1"
          />

          <!-- Area fill for Unpaid Borrowed Goods -->
          <path :d="unpaidAreaPath" fill="url(#roseGradient)" />

          <!-- Area fill for Collected Incomes -->
          <path :d="collectedAreaPath" fill="url(#emeraldGradient)" />

          <!-- Line for Unpaid Borrowed Goods -->
          <path
            :d="unpaidLinePath"
            fill="none"
            class="stroke-rose-500"
            stroke-width="2"
            stroke-dasharray="4 4"
          />

          <!-- Line for Collected Incomes -->
          <path
            :d="collectedLinePath"
            fill="none"
            class="stroke-emerald-500"
            stroke-width="2.5"
          />

          <!-- Points & Interactive Hover Circles -->
          <g v-for="(pt, idx) in points" :key="idx">
            <!-- Collected point -->
            <circle
              :cx="pt.x"
              :cy="pt.yCollected"
              r="4"
              class="fill-emerald-500 stroke-background stroke-2 cursor-pointer transition-transform hover:scale-150"
              @mouseenter="hoverIndex = idx"
              @mouseleave="hoverIndex = null"
            />

            <!-- Unpaid point -->
            <circle
              :cx="pt.x"
              :cy="pt.yUnpaid"
              r="3.5"
              class="fill-rose-500 stroke-background stroke-2 cursor-pointer transition-transform hover:scale-150"
              @mouseenter="hoverIndex = idx"
              @mouseleave="hoverIndex = null"
            />

            <!-- X-Axis Month Labels -->
            <text
              :x="pt.x"
              :y="height - 8"
              text-anchor="middle"
              class="fill-muted-foreground text-[11px] font-semibold"
            >
              {{ pt.raw.monthLabel }}
            </text>
          </g>
        </svg>

        <!-- Hover Tooltip Box -->
        <div
          v-if="hoverIndex !== null"
          class="absolute top-2 right-4 bg-popover text-popover-foreground border border-border p-3 rounded-xl shadow-lg text-xs space-y-1.5 z-20 pointer-events-none min-w-[170px]"
        >
          <div class="font-bold text-foreground border-b pb-1">
            {{ chartData[hoverIndex].monthLabel }} Monthly Totals
          </div>
          <div class="flex items-center justify-between gap-3 text-emerald-600 dark:text-emerald-400 font-semibold">
            <span class="flex items-center gap-1">
              <span class="h-2 w-2 rounded-full bg-emerald-500" />
              Incomes (Paid):
            </span>
            <span>{{ formatCurrency(chartData[hoverIndex].collected) }}</span>
          </div>
          <div class="flex items-center justify-between gap-3 text-rose-500 font-semibold">
            <span class="flex items-center gap-1">
              <span class="h-2 w-2 rounded-full bg-rose-500" />
              Unpaid Goods:
            </span>
            <span>{{ formatCurrency(chartData[hoverIndex].unpaid) }}</span>
          </div>
        </div>
      </div>
    </CardContent>

    <CardFooter class="border-t pt-3.5">
      <div class="flex w-full items-center justify-between text-xs text-muted-foreground">
        <div class="flex items-center gap-1.5 font-medium text-foreground">
          <TrendingUp class="h-4 w-4 text-emerald-500" />
          <span>Real-time Supabase analytics calculated across 6 months</span>
        </div>
        <div>
          Calculated from {{ transactions.length }} total records
        </div>
      </div>
    </CardFooter>
  </Card>
</template>
