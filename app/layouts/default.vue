<template>
  <SidebarProvider :open="sidebarOpen" @update:open="sidebarOpen = $event">
    <CustomAuthenticatedAppSidebar />
    <SidebarInset>
      <CustomAuthenticatedHeader />
      <main class="flex-1 p-4 sm:p-6">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const sidebarOpen = ref(true)
</script>