<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, ChevronUp } from 'lucide-vue-next'

// FAQ State
const activeFaq = ref<number | null>(0)

function toggleFaq(index: number) {
  activeFaq.value = activeFaq.value === index ? null : index
}

const faqs = [
  {
    question: "What is Pautang List?",
    answer: "Pautang List is a modern debt, credit, and loan management web application designed for sari-sari stores, small business owners, and individuals. It replaces traditional paper notebooks (listahan) with digital, real-time balance tracking."
  },
  {
    question: "Can I log partial payments when a customer pays in installments?",
    answer: "Yes! Pautang List allows you to record partial payments anytime. The system automatically recalculates the remaining collectible balance so you always know how much is left."
  },
  {
    question: "Is my store's financial data secure?",
    answer: "Absolutely. All transactions and customer records are securely stored and synced in real-time via Supabase with encrypted access control."
  },
  {
    question: "Can I access Pautang List on my mobile phone?",
    answer: "Yes, Pautang List is fully responsive and optimized for mobile phones, tablets, and desktop computers. No app download is required — just open it in your browser."
  },
  {
    question: "How do I get started?",
    answer: "Simply click 'Open Tracker' or 'Log In' at the top, sign in with your email account, and start recording your credit accounts in seconds!"
  }
]
</script>

<template>
  <section id="faq" class="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
        Frequently Asked Questions
      </h2>
      <p class="mt-3 text-muted-foreground text-sm">
        Got questions? Here's everything you need to know about Pautang List.
      </p>
    </div>

    <div class="space-y-4">
      <div
        v-for="(faq, idx) in faqs"
        :key="idx"
        class="rounded-xl border border-border bg-card overflow-hidden transition-colors"
      >
        <button
          @click="toggleFaq(idx)"
          type="button"
          class="w-full p-5 text-left font-bold text-foreground flex items-center justify-between gap-4 hover:bg-muted/40 transition-colors"
        >
          <span>{{ faq.question }}</span>
          <ChevronUp v-if="activeFaq === idx" class="h-5 w-5 text-emerald-600 shrink-0" />
          <ChevronDown v-else class="h-5 w-5 text-muted-foreground shrink-0" />
        </button>

        <div
          v-if="activeFaq === idx"
          class="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3"
        >
          {{ faq.answer }}
        </div>
      </div>
    </div>
  </section>
</template>
