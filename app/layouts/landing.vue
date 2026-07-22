<script setup lang="ts">
import { ref } from 'vue'
import { Wallet, Menu, X, ArrowRight } from 'lucide-vue-next'

const mobileMenuOpen = ref(false)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-emerald-500/20 selection:text-emerald-600 dark:selection:text-emerald-400">
    <!-- Sticky Glassmorphic Header Nav -->
    <header class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-all">
      <div class="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <!-- Brand Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5 group">
          <div class="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
            <Wallet class="h-5 w-5" />
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-lg tracking-tight text-foreground flex items-center gap-1.5">
              Pautang <span class="text-emerald-600 dark:text-emerald-400">List</span>
            </span>
          </div>
        </NuxtLink>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" class="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" class="hover:text-foreground transition-colors">How It Works</a>
          <a href="#faq" class="hover:text-foreground transition-colors">FAQ</a>
        </nav>

        <!-- Desktop Action Buttons -->
        <div class="hidden md:flex items-center gap-3">
          <NuxtLink
            to="/auth/login"
            class="text-sm font-medium px-4 py-2 rounded-lg text-foreground hover:bg-muted/80 transition-colors"
          >
            Log In
          </NuxtLink>
        </div>

        <!-- Mobile Menu Toggle Button -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          type="button"
          class="md:hidden p-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu v-if="!mobileMenuOpen" class="h-5 w-5" />
          <X v-else class="h-5 w-5" />
        </button>
      </div>

      <!-- Mobile Dropdown Menu -->
      <div
        v-if="mobileMenuOpen"
        class="md:hidden border-b border-border bg-card/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200"
      >
        <div class="flex flex-col space-y-3 font-medium text-sm">
          <a
            href="#features"
            @click="mobileMenuOpen = false"
            class="px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            @click="mobileMenuOpen = false"
            class="px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            How It Works
          </a>
          <a
            href="#faq"
            @click="mobileMenuOpen = false"
            class="px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            FAQ
          </a>
        </div>
        <div class="pt-2 border-t border-border flex flex-col gap-2">
          <NuxtLink
            to="/auth/login"
            @click="mobileMenuOpen = false"
            class="w-full text-center py-2.5 rounded-lg border border-border font-medium text-sm hover:bg-muted transition-colors"
          >
            Log In
          </NuxtLink>
          <NuxtLink
            to="/auth/login"
            @click="mobileMenuOpen = false"
            class="w-full text-center py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-sm shadow-md transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Open Tracker</span>
            <ArrowRight class="h-4 w-4" />
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Page Content Slot -->
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>