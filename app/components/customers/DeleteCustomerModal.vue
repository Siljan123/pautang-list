<script setup lang="ts">
import { ref } from 'vue'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2, Loader2 } from 'lucide-vue-next'
import type { CustomerRow } from '@/composables/useCustomers'
import { useCustomers } from '@/composables/useCustomers'

const props = defineProps<{
  open: boolean
  customer: CustomerRow | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'deleted': [id: string]
}>()

const { deleteCustomer } = useCustomers()
const deleting = ref(false)
const errorMessage = ref('')

function formatCurrency(amount: number | undefined) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount || 0)
}

async function handleDelete() {
  if (!props.customer?.id) return
  deleting.value = true
  errorMessage.value = ''

  try {
    const { error } = await deleteCustomer(props.customer.id)
    if (error) {
      if (error.message?.includes('foreign key constraint') || error.code === '23503') {
        throw new Error(
          `Cannot delete ${props.customer.name} because they have existing transactions or payments linked to their account. Please delete their transactions first.`
        )
      }
      throw error
    }
    emit('deleted', props.customer.id)
    emit('update:open', false)
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to delete customer.'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <Sheet :open="open" @update:open="(val) => emit('update:open', val)">
    <SheetContent class="flex flex-col max-w-md overflow-y-auto">
      <SheetHeader class="border-b border-border pb-3">
        <SheetTitle class="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-lg">
          <AlertTriangle class="h-5 w-5 shrink-0" />
          Delete Customer
        </SheetTitle>
        <SheetDescription class="text-xs">
          This action will permanently remove the customer record.
        </SheetDescription>
      </SheetHeader>

      <div class="flex-1 space-y-4 py-4">
        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="p-3 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-400"
        >
          {{ errorMessage }}
        </div>

        <div v-if="customer" class="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-foreground text-sm">{{ customer.name }}</span>
            <span
              v-if="(customer.balance || 0) > 0"
              class="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
            >
              Unpaid: {{ formatCurrency(customer.balance) }}
            </span>
            <span
              v-else
              class="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
            >
              Zero Balance
            </span>
          </div>

          <p v-if="customer.contact_number" class="text-xs text-muted-foreground">
            Contact: <span class="font-medium text-foreground">{{ customer.contact_number }}</span>
          </p>
          <p v-if="customer.address" class="text-xs text-muted-foreground">
            Address: <span class="font-medium text-foreground">{{ customer.address }}</span>
          </p>
        </div>

        <p class="text-xs text-muted-foreground leading-relaxed">
          Are you sure you want to delete <strong class="text-foreground">{{ customer?.name }}</strong>?
          <span v-if="(customer?.balance || 0) > 0" class="block text-rose-600 dark:text-rose-400 mt-1">
            Note: This customer currently has an unpaid balance of {{ formatCurrency(customer?.balance) }}.
          </span>
        </p>
      </div>

      <SheetFooter class="border-t border-border pt-3 gap-2">
        <Button
          type="button"
          variant="outline"
          class="flex-1"
          :disabled="deleting"
          @click="emit('update:open', false)"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          class="flex-1 font-semibold"
          :disabled="deleting"
          @click="handleDelete"
        >
          <Loader2 v-if="deleting" class="h-4 w-4 mr-2 animate-spin" />
          <Trash2 v-else class="h-4 w-4 mr-2" />
          {{ deleting ? 'Deleting...' : 'Delete Customer' }}
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
