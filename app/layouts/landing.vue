<template>
  <div class="min-h-screen flex flex-col bg-background">
    <!-- Simple top nav for landing page -->
    <header class="h-16 border-b flex items-center justify-between px-4 sm:px-8">
      <nav class="flex items-center gap-3">
        <NuxtLink
          to="/auth/login"
          class="text-sm px-4 py-2 rounded-md border hover:bg-muted transition-colors"
        >
          Login
        </NuxtLink>
      </nav>
    </header>

    <!-- Page content -->
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>