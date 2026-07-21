import { useSupabaseClient } from "#imports"
export const useTransactionCount =() =>{
    const supabase = useSupabaseClient()
    const count = ref(0)

  async function fetchCount  (){
        const {count:total, error} = await supabase
        .from('utang_transactions').select('*', {count:'exact', head:true})
        if (!error && total !==null){
            count.value= total
        }   
    }
    return {count, fetchCount}
}