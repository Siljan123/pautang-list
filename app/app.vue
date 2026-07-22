<script setup lang="ts">
import { useAppearance } from '@/composables/useAppearance'

useAppearance()
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

