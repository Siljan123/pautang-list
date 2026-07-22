<script setup lang="ts">
import { ref } from 'vue'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Wallet,
  ArrowRight,
  TrendingUp,
  Receipt,
  CheckCircle2
} from 'lucide-vue-next'

definePageMeta({ layout: 'guest' })

const { login, loading, errorMsg } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)

async function handleSubmit() {
  if (!email.value || !password.value) return
  await login(email.value, password.value)
}
</script>

<template>
        <Card class="shadow-xl shadow-slate-950/10 dark:shadow-black/40 backdrop-blur-md bg-card/95 transition-all">
          <CardHeader class="space-y-1.5 pb-6">
            <div class="flex items-center justify-between">
              <CardTitle class="text-2xl font-bold tracking-tight">Sign In</CardTitle>
            </div>
            <CardDescription class="text-sm text-muted-foreground">
              Enter your registered credentials to access your ledger dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent class="space-y-4">
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <!-- Email Field -->
              <div class="space-y-2">
                <Label for="email" class="text-xs font-semibold text-foreground">Email Address</Label>
                <div class="relative">
                  <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    v-model="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    class="pl-10 h-10 transition-colors focus-visible:ring-2"
                  />
                </div>
              </div>

              <!-- Password Field -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <Label for="password" class="text-xs font-semibold text-foreground">Password</Label>
                  <a href="#" @click.prevent class="text-xs text-primary font-medium hover:underline focus:outline-none focus:ring-1 focus:ring-ring rounded">
                    Forgot password?
                  </a>
                </div>
                <div class="relative">
                  <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    placeholder="••••••••"
                    class="pl-10 pr-10 h-10 transition-colors focus-visible:ring-2"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md focus:outline-none"
                    @click="showPassword = !showPassword"
                    :title="showPassword ? 'Hide password' : 'Show password'"
                  >
                    <Eye v-if="!showPassword" class="h-4 w-4" />
                    <EyeOff v-else class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <!-- Remember Me Checkbox -->
              <div class="flex items-center justify-between pt-1">
                <label class="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    v-model="rememberMe"
                    class="h-4 w-4 rounded border-input text-primary focus:ring-ring focus:ring-2 focus:ring-offset-2 transition-all accent-primary cursor-pointer"
                  />
                  <span>Remember me on this device</span>
                </label>
              </div>

              <!-- Animated Error Message Banner -->
              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="transform -translate-y-2 opacity-0"
                enter-to-class="transform translate-y-0 opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="transform translate-y-0 opacity-100"
                leave-to-class="transform -translate-y-2 opacity-0"
              >
                <div
                  v-if="errorMsg"
                  class="flex items-start gap-3 p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs leading-relaxed"
                  role="alert"
                >
                  <AlertCircle class="h-4 w-4 shrink-0 mt-0.5" />
                  <div class="flex-1 font-medium">{{ errorMsg }}</div>
                </div>
              </Transition>

              <!-- Submit Button -->
              <Button
                type="submit"
                :disabled="loading"
                size="lg"
                class="w-full h-11 font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer group mt-2"
              >
                <template v-if="loading">
                  <Loader2 class="h-4 w-4 animate-spin mr-2" />
                  <span>Authenticating...</span>
                </template>
                <template v-else>
                  <span>Sign In</span>
                  <ArrowRight class="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </template>
              </Button>
            </form>
          </CardContent>

          <CardFooter class="flex flex-col space-y-4 pt-2 border-t border-border/40">
            <div class="flex items-center justify-center w-full gap-2 text-xs text-muted-foreground">
              <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
              <span>Protected by 256-bit encrypted connection</span>
            </div>
          </CardFooter>
        </Card>
</template>