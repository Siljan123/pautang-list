<script setup lang="ts">
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Store,
  UtensilsCrossed
} from 'lucide-vue-next'
</script>

<template>
  <section class="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
    <!-- Announcement Pill -->
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300 text-xs font-semibold tracking-wide mb-6 animate-in fade-in slide-in-from-top-3 duration-500">
      <Sparkles class="h-3.5 w-3.5 text-orange-500" />
      <span>Online Food Ordering & Digital Store Listahan</span>
    </div>

    <!-- Main Headline -->
    <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.15]">
      Order Fresh Food Online & <span class="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 bg-clip-text text-transparent">Track Store Credit</span>
    </h1>

    <!-- Subtitle -->
    <p class="mt-6 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
      Browse our delicious food menu and place your order directly, or manage credit records and installment payments with ease.
    </p>

    <!-- Action Buttons -->
    <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
      <a
        href="#menu"
        class="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-base shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
      >
        <UtensilsCrossed class="h-5 w-5" />
        <span>Order Food Now</span>
      </a>
      <NuxtLink
        to="/auth/login"
        class="w-full sm:w-auto px-8 py-4 rounded-xl border border-border bg-card/80 hover:bg-muted text-foreground font-bold text-base shadow-sm hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
      >
        <span>Store Dashboard</span>
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
