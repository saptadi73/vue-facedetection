<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, CircleCheck, ScanFace } from '@lucide/vue'

const props = defineProps<{ acceptedCount: number }>()

const guides = [
  { title: 'Hadap lurus', detail: 'Tatap kamera dengan posisi kepala tegak.', icon: ScanFace },
  { title: 'Miring ke kiri', detail: 'Putar wajah sedikit ke kiri Anda.', icon: ArrowLeft },
  { title: 'Miring ke kanan', detail: 'Putar wajah sedikit ke kanan Anda.', icon: ArrowRight },
  {
    title: 'Dagu sedikit naik',
    detail: 'Angkat dagu perlahan tanpa mendongak berlebihan.',
    icon: ArrowUp,
  },
  {
    title: 'Dagu sedikit turun',
    detail: 'Turunkan dagu perlahan dan tetap tatap kamera.',
    icon: ArrowDown,
  },
]

const currentIndex = computed(() => Math.min(props.acceptedCount, guides.length - 1))
const completed = computed(() => props.acceptedCount >= guides.length)
const currentGuide = computed(() => guides[currentIndex.value]!)
</script>

<template>
  <section
    class="rounded-lg border border-black/[0.07] bg-white p-4 shadow-[0_12px_35px_rgba(18,32,28,0.06)]"
  >
    <div class="flex items-start gap-3">
      <div
        class="grid size-11 shrink-0 place-items-center rounded-lg"
        :class="completed ? 'bg-mint-100 text-mint-600' : 'bg-sun-400/20 text-[#80620f]'"
      >
        <CircleCheck v-if="completed" :size="22" />
        <component :is="currentGuide.icon" v-else :size="22" />
      </div>
      <div>
        <p class="text-xs font-bold uppercase text-ink-600">
          Petunjuk foto {{ Math.min(acceptedCount + 1, guides.length) }} dari {{ guides.length }}
        </p>
        <p class="mt-1 font-display text-base font-extrabold">
          {{ completed ? 'Variasi sudut lengkap' : currentGuide.title }}
        </p>
        <p class="mt-1 text-xs leading-5 text-ink-600">
          {{
            completed
              ? 'Semua sudut wajib sudah diterima. Enrollment dapat diselesaikan.'
              : currentGuide.detail
          }}
        </p>
      </div>
    </div>
    <div class="mt-4 flex gap-1.5" aria-label="Progres variasi sudut">
      <span
        v-for="(_, index) in guides"
        :key="index"
        class="h-1.5 flex-1 rounded-full"
        :class="
          index < acceptedCount
            ? 'bg-mint-500'
            : index === currentIndex && !completed
              ? 'bg-sun-400'
              : 'bg-black/10'
        "
      />
    </div>
  </section>
</template>
