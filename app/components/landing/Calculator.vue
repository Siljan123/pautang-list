<script setup lang="ts">
import { ref, computed } from 'vue'
import { Calculator, RotateCcw } from 'lucide-vue-next'

// Calculator State
const calcPrincipal = ref<number>(2500)
const calcPartialPayment = ref<number>(500)
const calcInterestRate = ref<number>(0)
const calcInstallmentWeeks = ref<number>(4)

const calcTotalInterest = computed(() => {
  return (calcPrincipal.value * (calcInterestRate.value / 100))
})

const calcTotalAmount = computed(() => {
  return calcPrincipal.value + calcTotalInterest.value
})

const calcRemainingBalance = computed(() => {
  const balance = calcTotalAmount.value - calcPartialPayment.value
  return balance > 0 ? balance : 0
})

const calcWeeklyPayment = computed(() => {
  if (!calcInstallmentWeeks.value || calcInstallmentWeeks.value <= 0) return 0
  return calcRemainingBalance.value / calcInstallmentWeeks.value
})

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(val)
}

function resetCalculator() {
  calcPrincipal.value = 2500
  calcPartialPayment.value = 500
  calcInterestRate.value = 0
  calcInstallmentWeeks.value = 4
}
</script>

<template>
  <section id="calculator" class="py-16 sm:py-24 bg-muted/30 border-y border-border/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center max-w-3xl mx-auto mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold mb-3">
          <Calculator class="h-3.5 w-3.5" />
          <span>Interactive Tool</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Pautang & Installment Calculator
        </h2>
        <p class="mt-3 text-muted-foreground text-sm sm:text-base">
          Test how instant balance and weekly payment schedule calculations work in real time.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Controls Panel -->
        <div class="lg:col-span-7 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <div class="flex items-center justify-between border-b border-border pb-4">
            <h3 class="font-bold text-lg text-foreground flex items-center gap-2">
              <span>Calculation Inputs</span>
            </h3>
            <button
              @click="resetCalculator"
              type="button"
              class="text-xs font-medium text-muted-foreground hover:text-emerald-600 flex items-center gap-1 transition-colors"
            >
              <RotateCcw class="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <!-- Input: Principal Amount -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-semibold">
              <label for="calc-principal" class="text-muted-foreground">Credit / Loan Amount (₱)</label>
              <span class="text-emerald-600 dark:text-emerald-400 font-bold">₱{{ calcPrincipal.toLocaleString() }}</span>
            </div>
            <input
              id="calc-principal"
              v-model.number="calcPrincipal"
              type="range"
              min="100"
              max="50000"
              step="100"
              class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div class="flex justify-between text-[10px] text-muted-foreground">
              <span>₱100</span>
              <span>₱25,000</span>
              <span>₱50,000</span>
            </div>
          </div>

          <!-- Input: Partial Payment -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-semibold">
              <label for="calc-partial" class="text-muted-foreground">Down Payment / Paid Amount (₱)</label>
              <span class="text-blue-600 dark:text-blue-400 font-bold">₱{{ calcPartialPayment.toLocaleString() }}</span>
            </div>
            <input
              id="calc-partial"
              v-model.number="calcPartialPayment"
              type="range"
              min="0"
              :max="calcTotalAmount"
              step="50"
              class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div class="flex justify-between text-[10px] text-muted-foreground">
              <span>₱0</span>
              <span>₱{{ Math.round(calcTotalAmount / 2).toLocaleString() }}</span>
              <span>₱{{ calcTotalAmount.toLocaleString() }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Input: Interest / Service Fee % -->
            <div class="space-y-2">
              <label for="calc-interest" class="block text-xs font-semibold text-muted-foreground">Interest / Service Fee (%)</label>
              <div class="relative">
                <input
                  id="calc-interest"
                  v-model.number="calcInterestRate"
                  type="number"
                  min="0"
                  max="100"
                  class="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span class="absolute right-3 top-2.5 text-xs text-muted-foreground">%</span>
              </div>
            </div>

            <!-- Input: Installment Duration (Weeks) -->
            <div class="space-y-2">
              <label for="calc-duration" class="block text-xs font-semibold text-muted-foreground">Installment Terms (Weeks)</label>
              <select
                id="calc-duration"
                v-model.number="calcInstallmentWeeks"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option :value="1">1 Week</option>
                <option :value="2">2 Weeks</option>
                <option :value="4">4 Weeks (1 Month)</option>
                <option :value="8">8 Weeks (2 Months)</option>
                <option :value="12">12 Weeks (3 Months)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Calculation Summary Output Card -->
        <div class="lg:col-span-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 via-card to-card p-6 sm:p-8 shadow-xl space-y-6">
          <h3 class="font-bold text-lg text-foreground border-b border-border pb-4 flex items-center justify-between">
            <span>Live Output Summary</span>
            <span class="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 font-medium">Real-Time</span>
          </h3>

          <div class="space-y-4">
            <div class="flex justify-between items-center text-sm">
              <span class="text-muted-foreground">Initial Credit Amount:</span>
              <span class="font-semibold text-foreground">{{ formatCurrency(calcPrincipal) }}</span>
            </div>

            <div v-if="calcInterestRate > 0" class="flex justify-between items-center text-sm">
              <span class="text-muted-foreground">Service / Interest Fee ({{ calcInterestRate }}%):</span>
              <span class="font-semibold text-amber-500">+{{ formatCurrency(calcTotalInterest) }}</span>
            </div>

            <div class="flex justify-between items-center text-sm border-t border-border/50 pt-2">
              <span class="text-muted-foreground">Total Payable Amount:</span>
              <span class="font-bold text-foreground">{{ formatCurrency(calcTotalAmount) }}</span>
            </div>

            <div class="flex justify-between items-center text-sm">
              <span class="text-muted-foreground">Payments Made So Far:</span>
              <span class="font-semibold text-emerald-500">-{{ formatCurrency(calcPartialPayment) }}</span>
            </div>

            <!-- Remaining Collectible Callout -->
            <div class="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg">
              <div class="text-xs font-semibold uppercase tracking-wider text-emerald-100">Remaining Balance Owed</div>
              <div class="text-3xl font-extrabold mt-1">{{ formatCurrency(calcRemainingBalance) }}</div>
              <div class="text-xs text-emerald-100/80 mt-1">
                Est. {{ formatCurrency(calcWeeklyPayment) }} / week over {{ calcInstallmentWeeks }} weeks
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </section>
</template>
