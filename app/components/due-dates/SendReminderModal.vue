<script setup lang="ts">
import { ref, computed, watch } from "vue"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Phone, Copy, CheckCheck, ExternalLink, X } from "lucide-vue-next"
import type { TransactionRow } from "@/composables/useTransactions"

const props = defineProps<{
  open: boolean
  transaction: TransactionRow | null
}>()

const emit = defineEmits<{
  "update:open": [val: boolean]
}>()

const copied = ref(false)

function getDaysOverdue(dateStr: string | null): number {
  if (!dateStr) return 0
  const loanDate = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - loanDate.getTime()) / (1000 * 60 * 60 * 24))
}

function daysLabel(days: number) {
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""}`
  const months = Math.floor(days / 30)
  const rem = days % 30
  if (months < 12) return rem > 0 ? `${months} month${months > 1 ? "s" : ""} and ${rem} day${rem !== 1 ? "s" : ""}` : `${months} month${months > 1 ? "s" : ""}`
  const years = Math.floor(months / 12)
  const remMonths = months % 12
  return remMonths > 0 ? `${years} year${years > 1 ? "s" : ""} and ${remMonths} month${remMonths > 1 ? "s" : ""}` : `${years} year${years > 1 ? "s" : ""}`
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount)
}

const reminderMessage = computed(() => {
  if (!props.transaction) return ""
  const name = props.transaction.customer?.name || "Borrower"
  const amount = formatCurrency(props.transaction.total_amount)
  const days = getDaysOverdue(props.transaction.date_utang || props.transaction.created_at)
  const duration = daysLabel(days)

  return `Hi ${name},

I hope you are doing well! Just a friendly reminder that your outstanding balance of ${amount} has been due for ${duration} already.

If you have any questions or need to arrange a payment schedule, please don't hesitate to reach out. We would be happy to discuss a flexible payment arrangement for you.

Looking forward to hearing from you soon. Thank you for your understanding!`
})

const contactNumber = computed(() => {
  if (!props.transaction?.customer?.contact_number) return null
  return props.transaction.customer.contact_number.replace(/\D/g, "")
})

const smsLink = computed(() => {
  if (!contactNumber.value) return null
  const encoded = encodeURIComponent(reminderMessage.value)
  return `sms:${contactNumber.value}?body=${encoded}`
})

const whatsappLink = computed(() => {
  if (!contactNumber.value) return null
  let num = contactNumber.value
  if (num.startsWith("0")) num = "63" + num.slice(1)
  const encoded = encodeURIComponent(reminderMessage.value)
  return `https://wa.me/${num}?text=${encoded}`
})

async function copyMessage() {
  await navigator.clipboard.writeText(reminderMessage.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2500)
}
</script>

<template>
  <Sheet :open="open" @update:open="(val) => emit('update:open', val)">
    <SheetContent class="flex flex-col overflow-y-auto max-w-md">
      <SheetHeader class="border-b pb-3">
        <SheetTitle class="flex items-center gap-2">
          <MessageSquare class="h-5 w-5 text-amber-600" />
          Send Payment Reminder
        </SheetTitle>
      </SheetHeader>

      <div class="flex-1 space-y-4 py-4 px-1">
        <!-- Borrower Info Strip -->
        <div v-if="transaction" class="rounded-xl border border-border bg-muted/30 p-3 flex items-start gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-orange-500 text-white font-bold text-sm shadow-xs">
            {{ (transaction.customer?.name || '?').slice(0, 2).toUpperCase() }}
          </div>
          <div class="flex flex-col gap-0.5 min-w-0">
            <span class="font-bold text-foreground text-sm leading-tight">{{ transaction.customer?.name || 'Unknown Borrower' }}</span>
            <span v-if="transaction.customer?.contact_number" class="text-xs text-muted-foreground flex items-center gap-1">
              <Phone class="h-3 w-3 shrink-0" />{{ transaction.customer.contact_number }}
            </span>
            <span class="text-xs font-semibold text-rose-600">
              Owes {{ formatCurrency(transaction.total_amount) }} •
              {{ daysLabel(getDaysOverdue(transaction.date_utang || transaction.created_at)) }} overdue
            </span>
          </div>
        </div>

        <!-- Generated Message -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-foreground">Generated Reminder Message</label>
            <button
              type="button"
              class="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              @click="copyMessage"
            >
              <component :is="copied ? CheckCheck : Copy" class="h-3.5 w-3.5" :class="copied ? 'text-emerald-600' : ''" />
              <span :class="copied ? 'text-emerald-600' : ''">{{ copied ? 'Copied!' : 'Copy' }}</span>
            </button>
          </div>
          <Textarea
            :model-value="reminderMessage"
            class="text-xs min-h-[180px] resize-none leading-relaxed"
            readonly
          />
        </div>

        <!-- Send Via -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-foreground">Send Via</p>

          <!-- No contact warning -->
          <div v-if="!contactNumber" class="flex items-center gap-2 text-[11px] bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700">
            <Phone class="h-3.5 w-3.5 shrink-0" />
            No contact number on file for this borrower. Copy the message manually.
          </div>

          <div v-else class="grid grid-cols-2 gap-2">
            <!-- SMS -->
            <a
              :href="smsLink || '#'"
              class="flex items-center justify-center gap-2 rounded-xl border border-border bg-background hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/30 p-3 text-xs font-semibold text-foreground hover:text-blue-700 dark:hover:text-blue-400 transition-all group"
            >
              <Phone class="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
              Send via SMS
              <ExternalLink class="h-3 w-3 text-muted-foreground" />
            </a>

            <!-- WhatsApp -->
            <a
              :href="whatsappLink || '#'"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center gap-2 rounded-xl border border-border bg-background hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-950/30 p-3 text-xs font-semibold text-foreground hover:text-green-700 dark:hover:text-green-400 transition-all group"
            >
              <MessageSquare class="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform" />
              WhatsApp
              <ExternalLink class="h-3 w-3 text-muted-foreground" />
            </a>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 pt-0">
        <Button variant="outline" class="w-full" @click="emit('update:open', false)">
          Close
        </Button>
      </div>
    </SheetContent>
  </Sheet>
</template>
