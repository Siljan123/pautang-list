<script setup lang="ts">
// Self-contained static component for How It Works section
</script>

<template>
  <section id="how-it-works" class="py-20 bg-muted/40 border-y border-border/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          How Pautang List Works
        </h2>
        <p class="mt-3 text-muted-foreground text-sm sm:text-base">
          Start organizing your store or personal credit records in 3 quick steps.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        
        <!-- Step 1 -->
        <div class="rounded-2xl border border-border bg-card p-8 shadow-sm relative flex flex-col items-center text-center">
          <div class="h-14 w-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-6">
            1
          </div>
          <h3 class="text-lg font-bold text-foreground">Add Borrower & Item</h3>
          <p class="mt-3 text-sm text-muted-foreground leading-relaxed">
            Enter customer name, item details or cash amount, and due date when giving credit.
          </p>
        </div>

        <!-- Step 2 -->
        <div class="rounded-2xl border border-border bg-card p-8 shadow-sm relative flex flex-col items-center text-center">
          <div class="h-14 w-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-6">
            2
          </div>
          <h3 class="text-lg font-bold text-foreground">Log Partial Payments</h3>
          <p class="mt-3 text-sm text-muted-foreground leading-relaxed">
            Record payments as customers pay down their balance. System auto-calculates remaining debt.
          </p>
        </div>

        <!-- Step 3 -->
        <div class="rounded-2xl border border-border bg-card p-8 shadow-sm relative flex flex-col items-center text-center">
          <div class="h-14 w-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-6">
            3
          </div>
          <h3 class="text-lg font-bold text-foreground">Achieve Clear Accounts</h3>
          <p class="mt-3 text-sm text-muted-foreground leading-relaxed">
            Mark records fully paid and view comprehensive history reports anytime.
          </p>
        </div>

      </div>
    </div>
  </section>
</template>
