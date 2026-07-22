// composables/useCustomers.ts
import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { Database } from '~/shared/types/database.types'

export interface CustomerRow {
  id: string
  name: string
  contact_number?: string | null
  address?: string | null
  profile_id?: string | null
  created_at?: string | null
  total_utang?: number
  total_paid?: number
  balance?: number
}

export function useCustomers() {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const customers = ref<CustomerRow[]>([])
  const loading = ref(false)

  const fetchCustomers = async () => {
    loading.value = true
    try {
      let query = supabase
        .from('customers')
        .select('id, name, contact_number, address, profile_id, created_at')
        .order('name')

      if (user.value?.id) {
        query = query.eq('profile_id', user.value.id)
      }

      const { data, error } = await query

      if (!error && data) {
        // Also fetch customer balances from customer_balance view
        const { data: balanceData } = await supabase
          .from('customer_balance')
          .select('*')

        const balanceMap = new Map<string, { total_utang: number; total_paid: number; balance: number }>()
        if (balanceData) {
          balanceData.forEach((b: any) => {
            if (b.customer_id) {
              balanceMap.set(b.customer_id, {
                total_utang: Number(b.total_utang || 0),
                total_paid: Number(b.total_paid || 0),
                balance: Number(b.balance || 0),
              })
            }
          })
        }

        customers.value = (data as CustomerRow[]).map(c => {
          const stats = balanceMap.get(c.id)
          return {
            ...c,
            total_utang: stats?.total_utang ?? 0,
            total_paid: stats?.total_paid ?? 0,
            balance: stats?.balance ?? 0,
          }
        })
      }
    } finally {
      loading.value = false
    }
  }

  const addCustomer = async (payload: { name: string; contact_number?: string | null; address?: string | null }) => {
    const insertPayload = {
      ...payload,
      profile_id: user.value?.id || null
    }

    const { data, error } = await supabase
      .from('customers')
      .insert(insertPayload)
      .select('id, name, contact_number, address, profile_id, created_at')
      .single()

    if (!error && data) {
      const newCust: CustomerRow = {
        ...(data as CustomerRow),
        total_utang: 0,
        total_paid: 0,
        balance: 0,
      }
      customers.value.push(newCust)
      customers.value.sort((a, b) => a.name.localeCompare(b.name))
    }

    return { data: data as CustomerRow | null, error }
  }

  const updateCustomer = async (
    id: string,
    payload: { name: string; contact_number?: string | null; address?: string | null }
  ) => {
    const { data, error } = await supabase
      .from('customers')
      .update(payload)
      .eq('id', id)
      .select('id, name, contact_number, address, profile_id, created_at')
      .single()

    if (!error && data) {
      const idx = customers.value.findIndex(c => c.id === id)
      if (idx !== -1) {
        customers.value[idx] = {
          ...customers.value[idx],
          ...data,
        }
      }
    }

    return { data: data as CustomerRow | null, error }
  }

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    if (!error) {
      customers.value = customers.value.filter(c => c.id !== id)
    }

    return { error }
  }

  return {
    customers,
    loading,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  }
}