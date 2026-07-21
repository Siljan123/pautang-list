export const useAuth = () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  const loading = ref(false)
  const errorMsg = ref('')

  async function login(email: string, password: string) {
    errorMsg.value = ''
    loading.value = true

    try {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })

      await navigateTo('/authenticated/Dashboard')
    } catch (err: any) {
      errorMsg.value = err.data?.statusMessage || 'Login failed. Please try again.'
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    await navigateTo('/auth/login')
  }

  return {
    user,
    loading,
    errorMsg,
    login,
    logout
  }
}