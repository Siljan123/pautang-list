<script setup lang="ts">
// Self-contained static component for CTA section
</script>

<template>
  <section class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="relative rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 p-8 sm:p-14 text-white shadow-2xl overflow-hidden text-center">
      <!-- Glow accents -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <h2 class="text-3xl sm:text-5xl font-extrabold tracking-tight relative z-10">
        Ready to Modernize Your Pautang Listahan?
      </h2>
      <p class="mt-4 text-emerald-100 text-base sm:text-lg max-w-2xl mx-auto relative z-10">
        Join store owners and individuals tracking receivables smoothly. Free, fast, and simple.
      </p>

      <div class="mt-8 relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <NuxtLink
          to="/auth/login"
          class="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-emerald-900 font-extrabold text-base shadow-lg hover:bg-emerald-50 transition-all hover:scale-105"
        >
          Get Started Now
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
