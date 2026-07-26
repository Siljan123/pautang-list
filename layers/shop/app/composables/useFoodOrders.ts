import { useSupabaseClient, useSupabaseUser } from '#imports'

export type FoodOrder = Database['public']['Tables']['food_orders']['Row']
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'done' | 'cancelled'

export interface CartItem {
  id: string
  name: string
  price: number
  qty: number
  image_url?: string | null
}

export function useFoodOrders() {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const orders = ref<FoodOrder[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchOrders = async () => {
    loading.value = true
    error.value = null

    let query = supabase
      .from('food_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (user.value?.id) {
      query = query.eq('profile_id', user.value.id)
    }

    const { data, error: err } = await query
    if (!err && data) {
      orders.value = data as FoodOrder[]
    } else {
      error.value = err?.message ?? 'Failed to load orders'
    }
    loading.value = false
  }

  const pendingCount = computed(() =>
    orders.value.filter(o => o.status === 'pending').length
  )

  const placeOrder = async (payload: {
    profile_id?: string | null
    customer_name: string
    customer_contact?: string
    items: CartItem[]
    total_amount: number
    notes?: string
  }) => {
    const validProfileId = (payload.profile_id && payload.profile_id.trim() !== '') ? payload.profile_id : null
    const { error: err } = await supabase.from('food_orders').insert({
      profile_id: validProfileId,
      customer_name: payload.customer_name,
      customer_contact: payload.customer_contact ?? null,
      items: payload.items as unknown as Database['public']['Tables']['food_orders']['Insert']['items'],
      total_amount: payload.total_amount,
      notes: payload.notes ?? null,
      status: 'pending',
    })
    return { error: err }
  }

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    const { error: err } = await supabase
      .from('food_orders')
      .update({ status })
      .eq('id', id)

    if (!err) {
      const idx = orders.value.findIndex(o => o.id === id)
      if (idx !== -1) orders.value[idx] = { ...orders.value[idx], status }
    }
    return { error: err }
  }

  // Realtime subscription for new orders (owner side)
  const subscribeToOrders = (profileId: string) => {
    const channel = supabase
      .channel('food_orders_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'food_orders',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => {
          orders.value.unshift(payload.new as FoodOrder)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'food_orders',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => {
          const idx = orders.value.findIndex(o => o.id === (payload.new as FoodOrder).id)
          if (idx !== -1) orders.value[idx] = payload.new as FoodOrder
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  return {
    orders,
    loading,
    error,
    pendingCount,
    fetchOrders,
    placeOrder,
    updateOrderStatus,
    subscribeToOrders,
  }
}
