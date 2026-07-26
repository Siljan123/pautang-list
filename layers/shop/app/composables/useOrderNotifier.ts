import { useSupabaseClient, useSupabaseUser } from '#imports'

export function useOrderNotifier() {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const unreadCount = ref(0)
  const soundEnabled = ref(true)

  // Request browser desktop notification permission
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission()
      }
    }
  }

  // Play pleasant chime sound using Web Audio API (no external audio file required)
  const playChimeSound = () => {
    if (typeof window === 'undefined' || !soundEnabled.value) return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()

      // High note
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime) // E5
      gain1.gain.setValueAtTime(0.3, ctx.currentTime)
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(ctx.currentTime)
      osc1.stop(ctx.currentTime + 0.35)

      // Pleasant resolving note
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.12) // B5
      gain2.gain.setValueAtTime(0.4, ctx.currentTime + 0.12)
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(ctx.currentTime + 0.12)
      osc2.stop(ctx.currentTime + 0.6)
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Trigger sound + desktop push notification + document title update
  const notifyNewOrder = (customerName: string, totalAmount: number) => {
    unreadCount.value++
    playChimeSound()

    // Update browser tab title
    if (typeof document !== 'undefined') {
      document.title = `(${unreadCount.value}) 🍔 NEW ORDER! | Pautang List`
    }

    // Trigger Desktop Push Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const formattedTotal = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(totalAmount)
      new Notification('🍔 New Food Order Received!', {
        body: `${customerName} just placed an order worth ${formattedTotal}! Click to view.`,
        tag: 'new-food-order',
        requireInteraction: true,
      })
    }
  }

  // Global Realtime listener for owner
  const initGlobalOrderListener = () => {
    if (!user.value?.id) return () => {}

    const channel = supabase
      .channel('global_food_orders_notifier')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'food_orders',
        },
        (payload) => {
          const newOrder = payload.new as any
          notifyNewOrder(newOrder.customer_name || 'Customer', Number(newOrder.total_amount || 0))
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  const clearNotifications = () => {
    unreadCount.value = 0
    if (typeof document !== 'undefined') {
      document.title = 'Pautang List'
    }
  }

  return {
    unreadCount,
    soundEnabled,
    requestNotificationPermission,
    playChimeSound,
    notifyNewOrder,
    initGlobalOrderListener,
    clearNotifications,
  }
}
