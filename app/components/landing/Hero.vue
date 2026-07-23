<script setup lang="ts">
import {
  Sparkles,
  ArrowRight,
  Calculator,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Store
} from 'lucide-vue-next'
</script>

<template>
  <section class="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
    <!-- Announcement Pill -->
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold tracking-wide mb-6 animate-in fade-in slide-in-from-top-3 duration-500">
      <Sparkles class="h-3.5 w-3.5 text-emerald-500" />
      <span>Digital Listahan for Small Businesses & Sari-Sari Stores</span>
    </div>

    <!-- Main Headline -->
    <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.15]">
      Track Every <span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">Pautang</span> & Collect Payments With Ease
    </h1>

    <!-- Subtitle -->
    <p class="mt-6 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
      Ditch messy paper notebooks. Effortlessly manage receivables, track installment payments, monitor overdue credits, and keep your business cash flow healthy.
    </p>

    <!-- Action Buttons -->
    <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
      <NuxtLink
        to="/auth/login"
        class="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
      >
        <span>Start Tracking Now</span>
        <ArrowRight class="h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </NuxtLink>
    </div>

    <!-- Trust Badges -->
    <div class="mt-12 pt-8 border-t border-border/40 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-xs sm:text-sm font-medium text-muted-foreground">
      <div class="flex items-center justify-center gap-2">
        <ShieldCheck class="h-4 w-4 text-emerald-500" />
        <span>100% Encrypted & Private</span>
      </div>
      <div class="flex items-center justify-center gap-2">
        <Smartphone class="h-4 w-4 text-emerald-500" />
        <span>Mobile Phone Ready</span>
      </div>
      <div class="flex items-center justify-center gap-2">
        <TrendingUp class="h-4 w-4 text-emerald-500" />
        <span>Real-time Balance Math</span>
      </div>
      <div class="flex items-center justify-center gap-2">
        <Store class="h-4 w-4 text-emerald-500" />
        <span>Sari-Sari Store Friendly</span>
      </div>
    </div>
  </section>
</template>
