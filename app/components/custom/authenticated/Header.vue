<script setup lang="ts">
import { ref } from 'vue'
import {
  Search,
  Plus,
  Bell,
  User,
  LogOut,
  Settings,
  Wallet,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Sparkles,
  TrendingUp
} from 'lucide-vue-next'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useAuth } from '@/composables/useAuth'

const { user, logout } = useAuth()

// Search input model
const searchQuery = ref('')

// Notification dropdown state
const showNotifications = ref(false)
const showUserMenu = ref(false)

// Sample notifications
const notifications = ref([
  {
    id: 1,
    title: 'Payment Received',
    desc: 'Juan Dela Cruz paid ₱1,500 for Loan #104',
    time: '10 mins ago',
    type: 'success',
    unread: true
  },
  {
    id: 2,
    title: 'Overdue Reminder',
    desc: 'Maria Santos has a pending balance due today',
    time: '2 hours ago',
    type: 'warning',
    unread: true
  },
  {
    id: 3,
    title: 'New Borrower Added',
    desc: 'Pedro Penduko was added to borrowers list',
    time: '1 day ago',
    type: 'info',
    unread: false
  }
])

const unreadCount = computed(() => notifications.value.filter(n => n.unread).length)

function markAllAsRead() {
  notifications.value.forEach(n => (n.unread = false))
}
</script>

<template>
  <header class="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/80 px-4 sm:px-6 backdrop-blur-md transition-all">
    <!-- Left Section: Sidebar Trigger & Section Info / Search -->
    <div class="flex items-center gap-3 sm:gap-4">
      <SidebarTrigger class="h-9 w-9 rounded-lg hover:bg-accent transition-colors" />

      <div class="hidden md:flex h-4 w-px bg-border/60" />

      <!-- Quick Search Input -->
      <div class="relative ml-2 hidden lg:block w-64 xl:w-80">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search borrowers, debts..."
          class="w-full h-9 rounded-lg border border-input bg-muted/40 pl-9 pr-12 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        <kbd class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 text-[10px] font-medium text-muted-foreground shadow-xs">
          <span class="text-[10px]">⌘</span>K
        </kbd>
      </div>
    </div>

    <!-- Profile -->
    <div class="flex items-center gap-2 sm:gap-3">
      <div class="h-4 w-px bg-border/60 mx-1 hidden sm:block" />

      <!-- User Profile Menu -->
      <div class="relative">
        <button
          @click="showUserMenu = !showUserMenu; showNotifications = false"
          class="flex items-center gap-2 rounded-lg p-1 hover:bg-accent transition-colors"
        >
          <div class="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white text-xs shadow-xs">
            {{ user?.email ? user.email.charAt(0).toUpperCase() : 'JD' }}
            <span class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
          </div>
          <div class="hidden md:flex flex-col text-left">
            <span class="text-xs font-semibold leading-tight text-foreground truncate max-w-[100px]">
              {{ user?.email ? user.email.split('@')[0] : 'Juan Dela Cruz' }}
            </span>
            <span class="text-[10px] text-muted-foreground">Lender Admin</span>
          </div>
          <ChevronDown class="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
        </button>

        <!-- Profile Dropdown -->
        <div
          v-if="showUserMenu"
          class="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-popover p-1.5 shadow-xl z-50 text-popover-foreground animate-in fade-in zoom-in-95 duration-150"
        >
          <div class="px-3 py-2 border-b border-border mb-1">
            <p class="text-xs font-semibold text-foreground">
              {{ user?.email || 'Juan Dela Cruz' }}
            </p>
            <p class="text-[10px] text-muted-foreground truncate">
              {{ user?.email ? 'Logged in' : 'juan@example.com' }}
            </p>
          </div>

          <NuxtLink
            to="/authenticated/settings"
            @click="showUserMenu = false"
            class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-popover-foreground hover:bg-accent transition-colors"
          >
            <Settings class="h-4 w-4 text-muted-foreground" />
            Pautang Settings
          </NuxtLink>

          <div class="my-1 border-t border-border" />

          <button
            @click="logout"
            class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut class="h-4 w-4 text-destructive" />
            Log out
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
