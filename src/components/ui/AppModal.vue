<script setup lang="ts">
import { X } from '@lucide/vue'

withDefaults(
  defineProps<{ open: boolean; title: string; description?: string; closeable?: boolean }>(),
  {
    closeable: true,
  },
)
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
        @click.self="closeable && emit('close')"
      >
        <section
          class="max-h-[92dvh] w-full overflow-y-auto rounded-t-lg bg-paper shadow-2xl sm:max-w-lg sm:rounded-lg"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <header
            class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-black/[0.07] bg-paper px-5 py-4"
          >
            <div>
              <h2 class="font-display text-lg font-bold text-ink-950">{{ title }}</h2>
              <p v-if="description" class="mt-1 text-sm text-ink-600">{{ description }}</p>
            </div>
            <button
              v-if="closeable"
              class="focus-ring grid size-10 shrink-0 place-items-center rounded-lg text-ink-600 hover:bg-black/5"
              title="Tutup"
              @click="emit('close')"
            >
              <X :size="20" />
            </button>
          </header>
          <div class="p-5"><slot /></div>
          <footer
            v-if="$slots.footer"
            class="sticky bottom-0 flex justify-end gap-2 border-t border-black/[0.07] bg-paper px-5 py-4"
          >
            <slot name="footer" />
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 180ms ease;
}
.modal-enter-active section,
.modal-leave-active section {
  transition: transform 180ms ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from section,
.modal-leave-to section {
  transform: translateY(20px);
}
</style>
