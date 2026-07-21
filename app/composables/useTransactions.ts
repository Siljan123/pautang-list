// composables/useTransactions.ts
import { useSupabaseClient, useSupabaseUser } from '#imports'


export type TransactionRow = Database['public']['Tables']['utang_transactions']['Row'] & {
  customer: { name: string } | null
}

export function useTransactions() {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const transactions = ref<TransactionRow[]>([])
  const loading = ref(false)

  const fetchTransactions = async () => {
    loading.value = true
    let query = supabase
      .from('utang_transactions')
      .select('*, customer:customers(name)')
      .order('created_at', { ascending: false })

    if (user.value?.id) {
      query = query.eq('profile_id', user.value.id)
    }

    const { data, error } = await query

    if (!error && data) {
      transactions.value = data as TransactionRow[]
    }
    loading.value = false
  }

  const addTransaction = async (payload: {
    customer_id: string
    total_amount: number
    date_utang: string
    is_paid: boolean
    notes: string | null
  }) => {
    const insertPayload = {
      ...payload,
      profile_id: user.value?.id || null
    }

    const { error } = await supabase
      .from('utang_transactions')
      .insert(insertPayload)

    return { error }
  }

  const deleteTransactions = async (ids: string[]) => {
    if (!ids.length) return { error: null }
    const { error } = await supabase
      .from('utang_transactions')
      .delete()
      .in('id', ids)
    if (!error) {
      transactions.value = transactions.value.filter(t => !ids.includes(t.id))
    }
    return { error }
  }

  return {
    transactions,
    loading,
    fetchTransactions,
    addTransaction,
    deleteTransactions
  }
}