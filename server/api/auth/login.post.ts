import { z } from 'zod'
import { serverSupabaseClient } from '#supabase/server'

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Invalid input'
    })
  }

  const { email, password } = parsed.data
  const supabase = await serverSupabaseClient(event)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw createError({
      statusCode: 401,
      statusMessage: error.message
    })
  }

  return {
    user: data.user
  }
})