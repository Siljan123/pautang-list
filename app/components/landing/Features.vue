<script setup lang="ts">
import {
  Wallet,
  Receipt,
  Clock,
  ShieldCheck,
  Search,
  Smartphone
} from 'lucide-vue-next'
</script>

<template>
  <section id="features" class="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-3xl mx-auto mb-16">
      <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
        Everything You Need to Manage Pautang
      </h2>
      <p class="mt-4 text-base text-muted-foreground">
        Simple, powerful tools designed specifically for tracking Philippine debt records, installment logs, and customer balances.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      
      <div class="group relative rounded-2xl border border-border bg-card p-6 shadow-2xs hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300">
        <div class="h-12 w-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
          <Receipt class="h-6 w-6" />
        </div>
        <h3 class="text-lg font-bold text-foreground">Partial Payment History</h3>
        <p class="mt-2 text-sm text-muted-foreground leading-relaxed">
          Item by item with clear date logs and automatic balance updates.
        </p>
      </div>
      <div class="group relative rounded-2xl border border-border bg-card p-6 shadow-2xs hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300">
        <div class="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
          <ShieldCheck class="h-6 w-6" />
        </div>
        <h3 class="text-lg font-bold text-foreground">Supabase Cloud Sync</h3>
        <p class="mt-2 text-sm text-muted-foreground leading-relaxed">
          Never worry about losing your paper notebook. All records are safely saved to the cloud instantly.
        </p>
      </div>

      <!-- Feature 5 -->
      <div class="group relative rounded-2xl border border-border bg-card p-6 shadow-2xs hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300">
        <div class="h-12 w-12 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
          <Search class="h-6 w-6" />
        </div>
        <h3 class="text-lg font-bold text-foreground">Instant Search & Filter</h3>
        <p class="mt-2 text-sm text-muted-foreground leading-relaxed">
          Filter transactions by borrower name, payment status (Paid, Unpaid, Partial), or date created.
        </p>
      </div>

      <!-- Feature 6 -->
      <div class="group relative rounded-2xl border border-border bg-card p-6 shadow-2xs hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300">
        <div class="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
          <Smartphone class="h-6 w-6" />
        </div>
        <h3 class="text-lg font-bold text-foreground">Mobile & Tablet Friendly</h3>
        <p class="mt-2 text-sm text-muted-foreground leading-relaxed">
          Designed for quick tap-and-go entry right from your smartphone counter while attending to store customers.
        </p>
      </div>

    </div>
  </section>
</template>
