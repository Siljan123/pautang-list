// composables/useCustomers.ts
import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { Database } from '~/shared/types/database.types'

export interface CustomerRow {
  id: string
  name: string
  contact_number?: string | null
  address?: string | null
  profile_id?: string | null
}

export function useCustomers() {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const customers = ref<CustomerRow[]>([])

  const fetchCustomers = async () => {
    let query = supabase
      .from('customers')
      .select('id, name, contact_number, address, profile_id')
      .order('name')

    if (user.value?.id) {
      query = query.eq('profile_id', user.value.id)
    }

    const { data, error } = await query

    if (!error && data) {
      customers.value = data as CustomerRow[]
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
      .select('id, name, contact_number, address, profile_id')
      .single()

    if (!error && data) {
      customers.value.push(data as CustomerRow)
      customers.value.sort((a, b) => a.name.localeCompare(b.name))
    }

    return { data: data as CustomerRow | null, error }
  }

  return { customers, fetchCustomers, addCustomer }
}