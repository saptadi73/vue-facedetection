<script setup lang="ts">
import { LoaderCircle } from '@lucide/vue'

withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    type?: 'button' | 'submit'
    loading?: boolean
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    type: 'button',
  },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
    :class="{
      'bg-ink-950 text-white hover:bg-ink-800': variant === 'primary',
      'border border-black/10 bg-white text-ink-950 hover:bg-mint-50': variant === 'secondary',
      'bg-coral-500 text-white hover:bg-[#d95845]': variant === 'danger',
      'bg-transparent text-ink-600 hover:bg-black/5 hover:text-ink-950': variant === 'ghost',
    }"
  >
    <LoaderCircle v-if="loading" :size="17" class="animate-spin" />
    <slot />
  </button>
</template>
