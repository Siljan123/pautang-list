// composables/usePayments.ts
import { useSupabaseClient, useSupabaseUser } from '#imports'
export type PaymentRow = Database['public']['Tables']['payments']['Row'] & {
  customer: { name: string } | null
}

export function usePayments() {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const payments = ref<PaymentRow[]>([])
  const loading = ref(false)

  const fetchPayments = async () => {
    loading.value = true
    let query = supabase
      .from('payments')
      .select('*, customer:customers(name)')
      .order('created_at', { ascending: false })

    if (user.value?.id) {
      query = query.eq('profile_id', user.value.id)
    }

    const { data, error } = await query

    if (!error && data) {
      payments.value = data as PaymentRow[]
    }
    loading.value = false
  }

  const addPayment = async (payload: {
    customer_id: string
    amount_paid: number
    date_paid: string
    note: string | null
    transaction_id?: string
  }) => {
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        customer_id: payload.customer_id,
        amount_paid: payload.amount_paid,
        date_paid: payload.date_paid,
        note: payload.note,
        profile_id: user.value?.id || null
      })

    if (paymentError) return { error: paymentError }

    // If a specific transaction was selected, mark it as paid in Supabase
    if (payload.transaction_id) {
      const { error: txError } = await supabase
        .from('utang_transactions')
        .update({ is_paid: true })
        .eq('id', payload.transaction_id)

      if (txError) {
        console.warn('Could not mark transaction as paid:', txError.message)
      }
    }

    return { error: null }
  }

  const deletePayments = async (ids: string[]) => {
    if (!ids.length) return { error: null }
    const { error } = await supabase
      .from('payments')
      .delete()
      .in('id', ids)

    if (!error) {
      payments.value = payments.value.filter(p => !ids.includes(p.id))
    }
    return { error }
  }

  return {
    payments,
    loading,
    fetchPayments,
    addPayment,
    deletePayments
  }
}
