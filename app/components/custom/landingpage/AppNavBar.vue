<script setup lang="ts">
const { user, logout } = useAuth()
const showMenu = ref(false)
</script>

<template>
  <header class="h-16 border-b bg-background flex items-center justify-between px-4 sm:px-6">
    <NuxtLink to="/">
      <AppTitle size="md" />
    </NuxtLink>

    <div class="flex items-center gap-3">
      <span class="text-sm text-muted-foreground hidden sm:inline">
        {{ user?.email }}
      </span>

      <div class="relative">
        <button
          class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium"
          @click="showMenu = !showMenu"
        >
          {{ user?.email?.charAt(0).toUpperCase() }}
        </button>

        <div
          v-if="showMenu"
          class="absolute right-0 mt-2 w-44 bg-background border rounded-md shadow-lg py-1 z-50"
          @click="showMenu = false"
        >
          <div class="px-3 py-2 text-xs text-muted-foreground border-b truncate">
            {{ user?.email }}
          </div>
          <button
            class="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
            @click="logout"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
