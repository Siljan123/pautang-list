<script setup lang="ts">
import LandingHero from '~/components/landing/Hero.vue'
import LandingShowcase from '~/components/landing/Showcase.vue'
import LandingCalculator from '~/components/landing/Calculator.vue'
import LandingFeatures from '~/components/landing/Features.vue'
import LandingHowItWorks from '~/components/landing/HowItWorks.vue'
import LandingFaq from '~/components/landing/Faq.vue'
import LandingCta from '~/components/landing/Cta.vue'
import LandingFooter from '~/components/landing/Footer.vue'

definePageMeta({
  layout: 'landing'
})
</script>

<template>
  <div class="relative overflow-hidden bg-background text-foreground">
    <!-- Decorative background glow blobs -->
    <div class="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-blue-500/5 blur-3xl opacity-70 dark:opacity-40" />

    <LandingHero />
    <LandingShowcase />
    <LandingCalculator />
    <LandingFeatures />
    <LandingHowItWorks />
    <LandingFaq />
    <LandingCta />
    <LandingFooter />
  </div>
</template>