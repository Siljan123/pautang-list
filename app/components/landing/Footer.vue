<script setup lang="ts">
import { Wallet } from 'lucide-vue-next'
</script>

<template>
  <footer class="border-t border-border py-12 bg-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
      
      <div class="flex items-center gap-2.5">
        <div class="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
          <Wallet class="h-4 w-4" />
        </div>
        <span class="font-bold text-foreground tracking-tight text-base">Pautang List</span>
      </div>

      <p class="text-xs text-muted-foreground">
        © 2026 Pautang List. Built with Nuxt 4, Vue 3, Tailwind CSS & Supabase.
      </p>

      <div class="flex items-center gap-6 text-xs text-muted-foreground font-medium">
        <a href="#features" class="hover:text-foreground">Features</a>
        <a href="#calculator" class="hover:text-foreground font-medium text-emerald-600">Calculator</a>
        <a href="#faq" class="hover:text-foreground">FAQ</a>
        <NuxtLink to="/auth/login" class="hover:text-foreground">Login</NuxtLink>
      </div>

    </div>
  </footer>
</template>
