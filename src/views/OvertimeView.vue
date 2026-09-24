<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Clock3, Plus } from '@lucide/vue'

import { hrApi } from '@/api/services'
import AppCard from '@/components/ui/AppCard.vue'
import AppModal from '@/components/ui/AppModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import DataTable from '@/components/ui/DataTable.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import { useAuthStore } from '@/stores/auth'
import type { OvertimeItem } from '@/types/api'

const auth = useAuthStore()
const rows = ref<OvertimeItem[]>([])
const loading = ref(true)
const saving = ref(false)
const modalOpen = ref(false)
const error = ref('')
const form = ref({ date: '', duration_hours: 1, description: '' })
const columns = [
  { key: 'date', label: 'Tanggal' },
  { key: 'duration_hours', label: 'Durasi' },
  { key: 'description', label: 'Keterangan' },
  { key: 'state', label: 'Status' },
]
function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(value))
}
async function load() {
  if (!auth.employee) return
  loading.value = true
  try {
    rows.value = (await hrApi.overtime(auth.employee.id)).items
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Data lembur gagal dimuat.'
  } finally {
    loading.value = false
  }
}
async function createRequest() {
  if (!auth.employee) return
  saving.value = true
  try {
    await hrApi.createOvertime({ employee_id: auth.employee.id, ...form.value })
    modalOpen.value = false
    form.value = { date: '', duration_hours: 1, description: '' }
    await load()
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Pengajuan lembur gagal.'
  } finally {
    saving.value = false
  }
}
onMounted(load)
</script>

<template>
  <div>
    <header class="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="text-sm font-bold text-mint-600">Self service</p>
        <h1 class="mt-1 font-display text-2xl font-extrabold sm:text-3xl">Lembur</h1>
        <p class="mt-1 text-sm text-ink-600">Catat jam kerja tambahan untuk diproses HR.</p>
      </div>
      <BaseButton @click="modalOpen = true"><Plus :size="18" /> Ajukan lembur</BaseButton>
    </header>
    <p
      v-if="error"
      class="mb-4 rounded-lg bg-coral-500/10 p-3 text-sm font-semibold text-coral-500"
    >
      {{ error }}
    </p>
    <AppCard
      ><LoadingSkeleton v-if="loading" :rows="5" /><DataTable
        v-else
        :rows="rows"
        :columns="columns"
        :search-keys="['date', 'description', 'state']"
        search-placeholder="Cari lembur..."
        empty-text="Belum ada pengajuan lembur."
        ><template #cell-date="{ value }">{{ formatDate(String(value)) }}</template
        ><template #cell-duration_hours="{ value }"
          ><span class="font-bold">{{ value }} jam</span></template
        ><template #cell-state="{ value }"
          ><span class="rounded-full bg-sun-400/20 px-2 py-1 text-xs font-bold text-[#80620f]">{{
            value || 'Diajukan'
          }}</span></template
        ></DataTable
      ></AppCard
    >
    <AppModal
      :open="modalOpen"
      title="Ajukan lembur"
      description="Isi durasi aktual jam kerja tambahan."
      @close="modalOpen = false"
      ><form class="space-y-4" @submit.prevent="createRequest">
        <label class="block text-sm font-bold"
          >Tanggal<input v-model="form.date" type="date" class="field mt-2" required /></label
        ><label class="block text-sm font-bold"
          >Durasi (jam)<span class="mt-2 flex items-center gap-3"
            ><input
              v-model.number="form.duration_hours"
              type="range"
              min="0.5"
              max="24"
              step="0.5"
              class="w-full accent-mint-500"
            /><strong class="min-w-16 rounded-lg bg-mint-100 px-2 py-2 text-center text-mint-600"
              >{{ form.duration_hours }}j</strong
            ></span
          ></label
        ><label class="block text-sm font-bold"
          >Keterangan<textarea
            v-model="form.description"
            class="field mt-2 min-h-24"
            required
            placeholder="Pekerjaan yang diselesaikan"
          />
        </label>
        <div class="flex justify-end gap-2">
          <BaseButton variant="secondary" @click="modalOpen = false">Batal</BaseButton
          ><BaseButton type="submit" :loading="saving"><Clock3 :size="17" /> Kirim</BaseButton>
        </div>
      </form></AppModal
    >
  </div>
</template>
