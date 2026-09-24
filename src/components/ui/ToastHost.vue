<script setup lang="ts">
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from '@lucide/vue'

import { useToastStore, type ToastVariant } from '@/stores/toast'

const toast = useToastStore()
const icons = { success: CircleCheck, error: CircleAlert, warning: TriangleAlert, info: Info }
const styles: Record<ToastVariant, { shell: string; icon: string }> = {
  success: { shell: 'border-mint-500/25', icon: 'bg-mint-100 text-mint-600' },
  error: { shell: 'border-coral-500/25', icon: 'bg-coral-500/10 text-coral-500' },
  warning: { shell: 'border-sun-400/40', icon: 'bg-sun-400/20 text-[#80620f]' },
  info: { shell: 'border-ink-600/20', icon: 'bg-black/[0.06] text-ink-600' },
}
</script>

<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed inset-x-3 top-3 z-[70] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4 sm:top-4 sm:w-[380px]"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup name="toast">
        <article
          v-for="item in toast.items"
          :key="item.id"
          class="pointer-events-auto flex w-full items-start gap-3 rounded-lg border bg-white p-3.5 shadow-[0_18px_50px_rgba(18,32,28,0.16)]"
          :class="styles[item.variant].shell"
          role="status"
        >
          <div
            class="grid size-9 shrink-0 place-items-center rounded-lg"
            :class="styles[item.variant].icon"
          >
            <component :is="icons[item.variant]" :size="18" />
          </div>
          <div class="min-w-0 flex-1 pt-0.5">
            <p class="text-sm font-extrabold text-ink-950">{{ item.title }}</p>
            <p v-if="item.message" class="mt-0.5 text-xs leading-5 text-ink-600">
              {{ item.message }}
            </p>
          </div>
          <button
            class="focus-ring grid size-8 shrink-0 place-items-center rounded-lg text-ink-600 hover:bg-black/5"
            title="Tutup notifikasi"
            @click="toast.remove(item.id)"
          >
            <X :size="16" />
          </button>
        </article>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.toast-move {
  transition: transform 180ms ease;
}
</style>
