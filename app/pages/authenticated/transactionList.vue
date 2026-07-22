<script setup>
import { Receipt } from 'lucide-vue-next'
const refreshKey = ref(0)
</script>

<template>
  <div class="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
    <!-- Top Header -->
    <div class="flex items-center justify-between pb-2 border-b border-border/50">
      <div class="flex items-center gap-2.5">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground">
          <Receipt class="h-4.5 w-4.5" />
        </div>
        <h1 class="text-xl font-bold tracking-tight text-foreground">Transactions</h1>
      </div>
      <TransactionsAddTransactionSheet @success="refreshKey++" />
    </div>
    <!-- Table Component -->
    <TransactionsTransactionTable :key="refreshKey" />
  </div>
</template>