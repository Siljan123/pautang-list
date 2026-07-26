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
import { ref, onMounted, onUnmounted } from 'vue'

const sidebarOpen = ref(true)
const { initGlobalOrderListener, requestNotificationPermission } = useOrderNotifier()

let cleanup: (() => void) | null = null

onMounted(() => {
  requestNotificationPermission()
  cleanup = initGlobalOrderListener()
})

onUnmounted(() => {
  cleanup?.()
})
</script>