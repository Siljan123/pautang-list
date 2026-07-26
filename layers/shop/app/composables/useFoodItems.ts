import { useSupabaseClient, useSupabaseUser } from '#imports'

export type FoodItem = Database['public']['Tables']['food_items']['Row']

export function useFoodItems() {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const items = ref<FoodItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchFoodItems = async (publicMode = false) => {
    loading.value = true
    error.value = null
    let query = supabase
      .from('food_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (!publicMode && user.value?.id) {
      query = query.eq('profile_id', user.value.id)
    }

    if (publicMode) {
      query = query.eq('is_available', true)
    }

    const { data, error: err } = await query
    if (!err && data) {
      items.value = data as FoodItem[]
    } else {
      error.value = err?.message ?? 'Failed to load menu'
    }
    loading.value = false
  }

  const uploadFoodImage = async (
    file: File,
    options: { cropToSquare?: boolean; maxWidth?: number; maxHeight?: number } = {}
  ): Promise<{ url: string | null; error: string | null }> => {
    let processedFile = file
    try {
      processedFile = await resizeImageFile(file, {
        maxWidth: options.maxWidth ?? 800,
        maxHeight: options.maxHeight ?? 800,
        cropToSquare: options.cropToSquare ?? false,
        quality: 0.85,
        outputFormat: 'image/webp'
      })
    } catch {
      // Fallback to original file if resizing fails
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`
    const { error: upErr } = await supabase.storage
      .from('food-images')
      .upload(filename, processedFile, { upsert: true, contentType: 'image/webp' })

    if (upErr) {
      error.value = upErr.message
      return { url: null, error: upErr.message }
    }

    const { data } = supabase.storage.from('food-images').getPublicUrl(filename)
    return { url: data.publicUrl, error: null }
  }

  const addFoodItem = async (payload: Database['public']['Tables']['food_items']['Insert']) => {
    const { error: err } = await supabase.from('food_items').insert({
      ...payload,
      profile_id: user.value?.id ?? null,
    })
    return { error: err }
  }

  const updateFoodItem = async (id: string, payload: Database['public']['Tables']['food_items']['Update']) => {
    const { error: err } = await supabase
      .from('food_items')
      .update(payload)
      .eq('id', id)
    return { error: err }
  }

  const deleteFoodItem = async (id: string) => {
    const { error: err } = await supabase.from('food_items').delete().eq('id', id)
    if (!err) {
      items.value = items.value.filter(i => i.id !== id)
    }
    return { error: err }
  }

  const toggleAvailability = async (item: FoodItem) => {
    return updateFoodItem(item.id, { is_available: !item.is_available })
  }

  return {
    items,
    loading,
    error,
    fetchFoodItems,
    addFoodItem,
    updateFoodItem,
    deleteFoodItem,
    uploadFoodImage,
    toggleAvailability,
  }
}
