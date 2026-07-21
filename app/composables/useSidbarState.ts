// composables/useSidebarState.ts
export const useSidebarPersisted = () => useCookie<boolean>('sidebar-open', { default: () => true })