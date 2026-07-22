<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User, Phone, MapPin, Loader2, UserPlus, Edit3 } from 'lucide-vue-next'
import { useCustomers, type CustomerRow } from '@/composables/useCustomers'

const props = defineProps<{
  open: boolean
  customer?: CustomerRow | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': [customer: CustomerRow]
}>()

const { addCustomer, updateCustomer } = useCustomers()

const isEditing = computed(() => !!props.customer?.id)

const form = ref({
  name: '',
  contact_number: '',
  address: '',
})

const submitting = ref(false)
const errorMessage = ref('')

watch(
  () => [props.open, props.customer],
  () => {
    if (props.open) {
      errorMessage.value = ''
      if (props.customer) {
        form.value = {
          name: props.customer.name || '',
          contact_number: props.customer.contact_number || '',
          address: props.customer.address || '',
        }
      } else {
        form.value = {
          name: '',
          contact_number: '',
          address: '',
        }
      }
    }
  },
  { immediate: true }
)

async function handleSubmit() {
  if (!form.value.name.trim()) {
    errorMessage.value = 'Customer name is required.'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    const payload = {
      name: form.value.name.trim(),
      contact_number: form.value.contact_number.trim() || null,
      address: form.value.address.trim() || null,
    }

    if (isEditing.value && props.customer?.id) {
      const { data, error } = await updateCustomer(props.customer.id, payload)
      if (error) throw error
      if (data) emit('success', data)
    } else {
      const { data, error } = await addCustomer(payload)
      if (error) throw error
      if (data) emit('success', data)
    }

    emit('update:open', false)
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to save customer. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Sheet :open="open" @update:open="(val) => emit('update:open', val)">
    <SheetContent class="flex flex-col max-w-md overflow-y-auto p-8">
      <SheetHeader class="border-b border-border pb-3">
        <SheetTitle class="flex items-center gap-2 text-lg">
          <component :is="isEditing ? Edit3 : UserPlus" class="h-5 w-5 text-primary" />
          {{ isEditing ? 'Edit Customer' : 'Add New Customer' }}
        </SheetTitle>
        <SheetDescription class="text-xs">
          {{ isEditing ? 'Update customer contact details below.' : 'Enter customer details to add them to your debtor list.' }}
        </SheetDescription>
      </SheetHeader>

      <form @submit.prevent="handleSubmit" class="flex-1 space-y-4 py-4">
        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="p-3 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-400"
        >
          {{ errorMessage }}
        </div>

        <!-- Name Field -->
        <div class="space-y-1.5">
          <Label for="cust-name" class="text-xs font-semibold flex items-center gap-1.5">
            <User class="h-3.5 w-3.5 text-muted-foreground" />
            Full Name <span class="text-rose-500">*</span>
          </Label>
          <Input
            id="cust-name"
            v-model="form.name"
            placeholder="e.g. Maria Santos"
            required
            class="h-9 text-sm"
          />
        </div>

        <!-- Contact Number Field -->
        <div class="space-y-1.5">
          <Label for="cust-phone" class="text-xs font-semibold flex items-center gap-1.5">
            <Phone class="h-3.5 w-3.5 text-muted-foreground" />
            Contact Number <span class="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Input
            id="cust-phone"
            v-model="form.contact_number"
            placeholder="e.g. 0917 123 4567"
            class="h-9 text-sm"
          />
        </div>

        <!-- Address Field -->
        <div class="space-y-1.5">
          <Label for="cust-address" class="text-xs font-semibold flex items-center gap-1.5">
            <MapPin class="h-3.5 w-3.5 text-muted-foreground" />
            Address <span class="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Textarea
            id="cust-address"
            v-model="form.address"
            placeholder="e.g. Block 5 Lot 12, Brgy. San Jose, Pasig City"
            rows="3"
            class="text-sm resize-none"
          />
        </div>
      </form>

      <SheetFooter class="border-t border-border pt-3 gap-2">
        <Button
          type="button"
          variant="outline"
          class="flex-1"
          :disabled="submitting"
          @click="emit('update:open', false)"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          class="flex-1 font-semibold"
          :disabled="submitting"
          @click="handleSubmit"
        >
          <Loader2 v-if="submitting" class="h-4 w-4 mr-2 animate-spin" />
          {{ submitting ? 'Saving...' : isEditing ? 'Update Customer' : 'Save Customer' }}
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
