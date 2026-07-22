<script setup lang="ts">
const mockRecords = [
  { id: 1, borrower: 'Juan Dela Cruz', items: 'Sari-sari grocery items', amount: 1500, paid: 500, status: 'Partial', due: 'Tomorrow' },
  { id: 2, borrower: 'Maria Santos', items: 'Emergency cash loan', amount: 3000, paid: 0, status: 'Unpaid', due: 'Overdue (2 days)' },
  { id: 3, borrower: 'Pedro Penduko', items: 'Rice bag (25kg)', amount: 1250, paid: 1250, status: 'Paid', due: 'Completed' }
]
</script>

<template>
  <section class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
    <div class="relative rounded-2xl border border-border bg-card/90 shadow-2xl p-4 sm:p-8 backdrop-blur-xl overflow-hidden">
      
      <!-- Header bar of mock app -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border gap-4">
        <div class="flex items-center gap-3">
          <div class="h-3 w-3 rounded-full bg-rose-500" />
          <div class="h-3 w-3 rounded-full bg-amber-500" />
          <div class="h-3 w-3 rounded-full bg-emerald-500" />
          <span class="text-xs font-mono text-muted-foreground ml-2">pautang-list.app/dashboard</span>
        </div>

        <div class="flex items-center gap-2 text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Sync Active</span>
        </div>
      </div>

      <!-- Mock Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div class="rounded-xl border border-border bg-background p-4 shadow-2xs">
          <div class="text-xs font-medium text-muted-foreground">Total Collectible (Unpaid)</div>
          <div class="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">₱38,450.00</div>
          <div class="text-[11px] text-muted-foreground mt-1">8 customers with balance</div>
        </div>
        <div class="rounded-xl border border-border bg-background p-4 shadow-2xs">
          <div class="text-xs font-medium text-muted-foreground">Total Collected (Paid)</div>
          <div class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">₱92,100.00</div>
          <div class="text-[11px] text-muted-foreground mt-1">42 completed records</div>
        </div>
        <div class="rounded-xl border border-border bg-background p-4 shadow-2xs">
          <div class="text-xs font-medium text-muted-foreground">Collection Rate</div>
          <div class="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">70.5%</div>
          <div class="text-[11px] text-muted-foreground mt-1">+12% from last month</div>
        </div>
      </div>

      <!-- Mock Transaction Table -->
      <div class="mt-6 border border-border rounded-xl overflow-x-auto bg-background">
        <table class="w-full text-left text-xs sm:text-sm">
          <thead class="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th class="p-3.5">Borrower</th>
              <th class="p-3.5">Items / Description</th>
              <th class="p-3.5">Amount</th>
              <th class="p-3.5">Paid</th>
              <th class="p-3.5">Status</th>
              <th class="p-3.5">Due Info</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="rec in mockRecords" :key="rec.id" class="hover:bg-muted/30 transition-colors">
              <td class="p-3.5 font-bold text-foreground">{{ rec.borrower }}</td>
              <td class="p-3.5 text-muted-foreground">{{ rec.items }}</td>
              <td class="p-3.5 font-semibold text-foreground">₱{{ rec.amount.toLocaleString() }}</td>
              <td class="p-3.5 text-emerald-600 dark:text-emerald-400 font-semibold">₱{{ rec.paid.toLocaleString() }}</td>
              <td class="p-3.5">
                <span
                  :class="[
                    'px-2.5 py-1 rounded-full text-[11px] font-semibold border',
                    rec.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                    rec.status === 'Partial' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                    'bg-rose-500/10 text-rose-600 border-rose-500/20'
                  ]"
                >
                  {{ rec.status }}
                </span>
              </td>
              <td class="p-3.5 text-muted-foreground text-xs">{{ rec.due }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
