<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl'
}
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-xl leading-none">🛒</span>
    <span :class="[sizeClasses[props.size], 'font-semibold tracking-tight']">
      Pautang Inventory
    </span>
  </div>
</template>
