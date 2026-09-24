<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { ArrowRight, CalendarDays, Camera, CheckCircle2, Clock3, MapPin } from '@lucide/vue'

import { attendanceApi } from '@/api/services'
import AppCard from '@/components/ui/AppCard.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import { useAuthStore } from '@/stores/auth'
import type { AttendanceResult } from '@/types/api'

const auth = useAuthStore()
const loading = ref(true)
const history = ref<AttendanceResult[]>([])
const greeting = computed(() =>
  new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }).format(
    new Date(),
  ),
)
const chartSeries = computed(() => [
  { name: 'Presensi', data: [8, 9, 7, 10, 9, 8, history.value.length] },
])
const chartOptions: ApexOptions = {
  chart: {
    toolbar: { show: false },
    sparkline: { enabled: false },
    fontFamily: 'Manrope Variable',
  },
  colors: ['#1b9a65'],
  stroke: { curve: 'smooth', width: 3 },
  grid: { borderColor: '#e7ece8', strokeDashArray: 4 },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { show: false },
  fill: { type: 'gradient', gradient: { opacityFrom: 0.28, opacityTo: 0.02 } },
  tooltip: { theme: 'light' },
}

onMounted(async () => {
  try {
    history.value = (
      await attendanceApi.history(auth.employee?.id ? String(auth.employee.id) : undefined, 10)
    ).items
  } catch {
    history.value = []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <header class="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="text-sm font-bold capitalize text-mint-600">{{ greeting }}</p>
        <h1 class="mt-1 font-display text-2xl font-extrabold sm:text-3xl">
          Halo, {{ auth.user?.name.split(' ')[0] }}
        </h1>
        <p class="mt-1 text-sm text-ink-600">Siap memulai hari kerja?</p>
      </div>
      <RouterLink
        to="/attendance"
        class="focus-ring inline-flex min-h-11 items-center gap-2 rounded-lg bg-ink-950 px-4 text-sm font-bold text-white"
        ><Camera :size="18" /> Presensi sekarang</RouterLink
      >
    </header>

    <div class="grid gap-3 sm:grid-cols-3">
      <AppCard
        ><div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-bold uppercase text-ink-600">Status hari ini</p>
            <p class="mt-2 text-xl font-extrabold">
              {{
                history[0]?.action === 'checkin'
                  ? 'Sudah masuk'
                  : history[0]?.action === 'checkout'
                    ? 'Sudah pulang'
                    : 'Belum presensi'
              }}
            </p>
          </div>
          <div class="grid size-11 place-items-center rounded-lg bg-mint-100 text-mint-600">
            <CheckCircle2 :size="22" />
          </div></div
      ></AppCard>
      <AppCard
        ><div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-bold uppercase text-ink-600">Aktivitas tercatat</p>
            <p class="mt-2 text-xl font-extrabold">{{ history.length }}</p>
          </div>
          <div class="grid size-11 place-items-center rounded-lg bg-sun-400/25 text-[#987518]">
            <Clock3 :size="22" />
          </div></div
      ></AppCard>
      <AppCard
        ><div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-bold uppercase text-ink-600">Employee ID</p>
            <p class="mt-2 text-xl font-extrabold">
              {{ auth.employee?.barcode || auth.employee?.id || '-' }}
            </p>
          </div>
          <div class="grid size-11 place-items-center rounded-lg bg-coral-500/10 text-coral-500">
            <MapPin :size="22" />
          </div></div
      ></AppCard>
    </div>

    <div class="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <AppCard
        ><div class="mb-2 flex items-center justify-between">
          <div>
            <p class="font-display text-lg font-extrabold">Aktivitas mingguan</p>
            <p class="text-sm text-ink-600">Rekap presensi tujuh hari</p>
          </div>
        </div>
        <VueApexCharts type="area" height="250" :options="chartOptions" :series="chartSeries"
      /></AppCard>
      <AppCard
        ><p class="font-display text-lg font-extrabold">Akses cepat</p>
        <div class="mt-4 space-y-2">
          <RouterLink
            v-for="item in [
              {
                label: 'Ajukan cuti',
                sub: 'Kelola izin dan cuti',
                to: '/time-off',
                icon: CalendarDays,
              },
              {
                label: 'Catat lembur',
                sub: 'Kirim jam kerja tambahan',
                to: '/overtime',
                icon: Clock3,
              },
            ]"
            :key="item.to"
            :to="item.to"
            class="focus-ring flex items-center gap-3 rounded-lg border border-black/[0.07] p-3 hover:bg-mint-50"
            ><div class="grid size-10 place-items-center rounded-lg bg-mint-100 text-mint-600">
              <component :is="item.icon" :size="19" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-bold">{{ item.label }}</p>
              <p class="text-xs text-ink-600">{{ item.sub }}</p>
            </div>
            <ArrowRight :size="17" class="text-ink-600"
          /></RouterLink></div
      ></AppCard>
    </div>

    <AppCard class="mt-4"
      ><div class="mb-4 flex items-center justify-between">
        <p class="font-display text-lg font-extrabold">Aktivitas terbaru</p>
        <RouterLink to="/history" class="text-sm font-bold text-mint-600">Lihat semua</RouterLink>
      </div>
      <LoadingSkeleton v-if="loading" :rows="3" />
      <div v-else-if="history.length" class="divide-y divide-black/[0.06]">
        <div
          v-for="item in history.slice(0, 4)"
          :key="item.attempt_id"
          class="flex items-center gap-3 py-3"
        >
          <div
            class="grid size-10 place-items-center rounded-lg"
            :class="
              item.action === 'checkin'
                ? 'bg-mint-100 text-mint-600'
                : 'bg-sun-400/20 text-[#987518]'
            "
          >
            <Clock3 :size="18" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-bold">
              {{ item.action === 'checkin' ? 'Check-in' : 'Check-out' }}
            </p>
            <p class="text-xs text-ink-600">
              {{ item.status }} · {{ Math.round((item.similarity || 0) * 100) }}% kemiripan
            </p>
          </div>
          <span class="text-xs font-semibold text-ink-600">#{{ item.attempt_id }}</span>
        </div>
      </div>
      <p v-else class="py-8 text-center text-sm text-ink-600">
        Belum ada aktivitas presensi.
      </p></AppCard
    >
  </div>
</template>
