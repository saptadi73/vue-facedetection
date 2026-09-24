<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Camera, CameraOff, ScanFace } from '@lucide/vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import { useCamera } from '@/composables/useCamera'

const video = ref<HTMLVideoElement | null>(null)
const starting = ref(false)
const { isReady, error, startCamera, captureFrame, stopCamera } = useCamera()

async function start() {
  if (!video.value) return
  starting.value = true
  try {
    await startCamera(video.value)
  } catch {
    /* Error is exposed by the composable. */
  } finally {
    starting.value = false
  }
}
function capture() {
  if (!video.value) throw new Error('Kamera belum tersedia.')
  return captureFrame(video.value)
}
defineExpose({ capture, start, isReady })
onMounted(() => {
  /* Camera starts only after a user gesture for mobile browser compatibility. */
})
</script>

<template>
  <div class="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-ink-950 sm:aspect-[4/3]">
    <video ref="video" class="size-full scale-x-[-1] object-cover" muted playsinline />
    <div v-if="isReady" class="pointer-events-none absolute inset-0 grid place-items-center">
      <div
        class="relative h-[55%] w-[68%] rounded-[48%] border-2 border-white/80 shadow-[0_0_0_999px_rgba(18,32,28,0.28)]"
      >
        <span
          class="absolute -left-1 -top-1 size-7 rounded-tl-lg border-l-4 border-t-4 border-mint-500"
        />
        <span
          class="absolute -right-1 -top-1 size-7 rounded-tr-lg border-r-4 border-t-4 border-mint-500"
        />
        <span
          class="absolute -bottom-1 -left-1 size-7 rounded-bl-lg border-b-4 border-l-4 border-mint-500"
        />
        <span
          class="absolute -bottom-1 -right-1 size-7 rounded-br-lg border-b-4 border-r-4 border-mint-500"
        />
      </div>
      <p
        class="absolute bottom-5 rounded-full bg-ink-950/75 px-3 py-1.5 text-xs font-bold text-white"
      >
        Posisikan wajah di dalam bingkai
      </p>
    </div>
    <div
      v-else
      class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white"
    >
      <div class="grid size-16 place-items-center rounded-full bg-white/10">
        <CameraOff :size="28" />
      </div>
      <p class="mt-4 font-display text-lg font-bold">Kamera belum aktif</p>
      <p class="mt-2 max-w-xs text-sm leading-6 text-white/60">
        Izinkan akses kamera depan untuk memindai wajah Anda.
      </p>
      <BaseButton
        class="mt-5 bg-white !text-ink-950 hover:bg-mint-100"
        :loading="starting"
        @click="start"
        ><Camera :size="18" /> Aktifkan kamera</BaseButton
      >
    </div>
    <div
      v-if="error"
      class="absolute inset-x-3 bottom-3 rounded-lg bg-coral-500 p-3 text-sm font-semibold text-white"
    >
      <ScanFace :size="17" class="mr-2 inline" />{{ error }}
    </div>
  </div>
</template>
