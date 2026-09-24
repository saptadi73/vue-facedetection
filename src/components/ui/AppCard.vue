<script setup lang="ts">
withDefaults(defineProps<{ padded?: boolean }>(), { padded: true })
</script>

<template>
  <section
    class="rounded-lg border border-black/[0.07] bg-white shadow-[0_12px_35px_rgba(18,32,28,0.06)]"
    :class="padded ? 'p-4 sm:p-5' : ''"
  >
    <slot />
  </section>
</template>
