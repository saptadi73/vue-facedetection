<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { LogIn, LogOut, MapPin } from '@lucide/vue'

import { attendanceApi } from '@/api/services'
import AppCard from '@/components/ui/AppCard.vue'
import DataTable from '@/components/ui/DataTable.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import { useAuthStore } from '@/stores/auth'
import type { AttendanceResult } from '@/types/api'

const auth = useAuthStore()
const rows = ref<AttendanceResult[]>([])
const loading = ref(true)
const error = ref('')
const columns = [
  { key: 'action', label: 'Aktivitas' },
  { key: 'attempt_id', label: 'ID' },
  { key: 'similarity', label: 'Kecocokan' },
  { key: 'gps_accuracy_meters', label: 'Lokasi' },
  { key: 'status', label: 'Status' },
]
onMounted(async () => {
  try {
    rows.value = (
      await attendanceApi.history(auth.employee?.id ? String(auth.employee.id) : undefined, 100)
    ).items
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Riwayat gagal dimuat.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <header class="mb-5">
      <p class="text-sm font-bold text-mint-600">Audit kehadiran</p>
      <h1 class="mt-1 font-display text-2xl font-extrabold sm:text-3xl">Riwayat presensi</h1>
      <p class="mt-1 text-sm text-ink-600">Semua percobaan presensi yang tercatat.</p>
    </header>
    <p
      v-if="error"
      class="mb-4 rounded-lg bg-coral-500/10 p-3 text-sm font-semibold text-coral-500"
    >
      {{ error }}
    </p>
    <AppCard
      ><LoadingSkeleton v-if="loading" :rows="6" /><DataTable
        v-else
        :rows="rows"
        :columns="columns"
        :search-keys="['action', 'status', 'attempt_id']"
        search-placeholder="Cari aktivitas atau status..."
        empty-text="Belum ada riwayat presensi."
        ><template #cell-action="{ value }"
          ><span class="inline-flex items-center gap-2 font-bold"
            ><LogIn v-if="value === 'checkin'" :size="17" class="text-mint-600" /><LogOut
              v-else
              :size="17"
              class="text-[#987518]"
            />{{ value === 'checkin' ? 'Masuk' : 'Pulang' }}</span
          ></template
        ><template #cell-attempt_id="{ value }">#{{ value }}</template
        ><template #cell-similarity="{ value }"
          ><span class="font-bold">{{ Math.round(Number(value || 0) * 100) }}%</span></template
        ><template #cell-gps_accuracy_meters="{ value }"
          ><span class="inline-flex items-center gap-1"
            ><MapPin :size="14" /> ±{{ Math.round(Number(value || 0)) }} m</span
          ></template
        ><template #cell-status="{ value }"
          ><span
            class="rounded-full px-2 py-1 text-xs font-bold"
            :class="
              value === 'success' ? 'bg-mint-100 text-mint-600' : 'bg-coral-500/10 text-coral-500'
            "
            >{{ value }}</span
          ></template
        ></DataTable
      ></AppCard
    >
  </div>
</template>
