<script setup lang="ts">
import { useRoute } from 'vue-router'
import {
  LayoutDashboard,
  Users,
  Receipt,
  History,
  Calendar,
  Settings,
  Wallet,
  ShoppingBag,
  UtensilsCrossed,
  Bell
} from 'lucide-vue-next'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
const {count:transactionCount, fetchCount} = useTransactionCount()
const { pendingCount, fetchOrders } = useFoodOrders()

onMounted(() => {
  fetchCount()
  fetchOrders()
})
const route = useRoute()
const { user } = useAuth()

const mainItems = computed(() => [
  {
    title: 'Dashboard',
    url: '/authenticated/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Customers',
    url: '/authenticated/customers',
    icon: Users,
    badge: transactionCount.value > 0 ? String(transactionCount.value) : undefined
  },
  {
    title: 'Transaction List',
    url: '/authenticated/transactionList',
    icon: Receipt,
    badge: transactionCount.value > 0 ? String(transactionCount.value) : undefined
  },
  {
    title: 'Payments & History',
    url: '/authenticated/paymentHistory',
    icon: History,
  },
  {
    title: 'Due Dates',
    url: '/authenticated/dueDates',
    icon: Calendar,
  },
])

const shopItems = computed(() => [
  {
    title: 'Shop Menu',
    url: '/authenticated/shopMenu',
    icon: UtensilsCrossed,
  },
  {
    title: 'Shop Orders',
    url: '/authenticated/shopOrders',
    icon: ShoppingBag,
    badge: pendingCount.value > 0 ? String(pendingCount.value) : undefined,
    badgeColor: 'bg-orange-500/15 text-orange-500',
  },
])

const systemItems = [
  {
    title: 'Appearance & Settings',
    url: '/authenticated/settings',
    icon: Settings,
  },
]
</script>

<template>
  <Sidebar collapsible="icon">
    <!-- Header with Branding -->
    <SidebarHeader class="border-b border-sidebar-border px-3 py-3.5">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg  font-bold">
          <Wallet class="h-5 w-5 text-gray-900 " />
        </div>
        <div class="flex flex-col truncate group-data-[collapsible=icon]:hidden">
          <span class="font-bold text-sm leading-tight tracking-tight text-sidebar-foreground">Pautang List</span>
        </div>
      </div>
    </SidebarHeader>

    <SidebarContent class="px-2 py-2">
      <!-- Main Navigation Group -->
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in mainItems" :key="item.title">
              <SidebarMenuButton
                :tooltip="item.title"
                as-child
                :is-active="route.path === item.url"
              >
                <NuxtLink :to="item.url" class="flex items-center gap-2.5">
                  <component :is="item.icon" class="h-4 w-4 shrink-0" />
                  <span class="truncate">{{ item.title }}</span>
                  <span v-if="item.badge" class="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-semibold px-1.5 group-data-[collapsible=icon]:hidden">
                    {{ item.badge }}
                  </span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator class="my-2" />

      <!-- Shop Group -->
      <SidebarGroup>
        <SidebarGroupLabel>Food Shop</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in shopItems" :key="item.title">
              <SidebarMenuButton
                :tooltip="item.title"
                as-child
                :is-active="route.path === item.url"
              >
                <NuxtLink :to="item.url" class="flex items-center gap-2.5">
                  <component :is="item.icon" class="h-4 w-4 shrink-0" />
                  <span class="truncate">{{ item.title }}</span>
                  <span
                    v-if="item.badge"
                    :class="['ml-auto flex h-4 min-w-4 items-center justify-center rounded-full text-[10px] font-semibold px-1.5 group-data-[collapsible=icon]:hidden', item.badgeColor ?? 'bg-primary/15 text-primary']"
                  >
                    {{ item.badge }}
                  </span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator class="my-2" />

      <!-- System / Secondary Group -->
      <SidebarGroup>
        <SidebarGroupLabel>System</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in systemItems" :key="item.title">
              <SidebarMenuButton
                :tooltip="item.title"
                as-child
                :is-active="route.path === item.url"
              >
                <NuxtLink :to="item.url" class="flex items-center gap-2.5">
                  <component :is="item.icon" class="h-4 w-4 shrink-0" />
                  <span class="truncate">{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <!-- Footer with User Info -->
    <SidebarFooter class="border-t border-sidebar-border p-2">
      <div class="flex items-center gap-3 p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer group-data-[collapsible=icon]:justify-center">
        <div class="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs shadow-xs">
          {{ user?.email ? user.email.charAt(0).toUpperCase() : 'JD' }}
          <span class="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
        </div>
        <div class="flex flex-col truncate group-data-[collapsible=icon]:hidden">
          <span class="text-xs font-semibold leading-tight text-sidebar-foreground truncate">
            {{ user?.email ? user.email.split('@')[0] : 'Juan Dela Cruz' }}
          </span>
          <span class="text-[10px] text-muted-foreground truncate">
            {{ user?.email || 'juan@example.com' }}
          </span>
        </div>
      </div>
    </SidebarFooter>
  </Sidebar>
</template>
