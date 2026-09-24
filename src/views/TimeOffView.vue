<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { CalendarPlus, XCircle } from '@lucide/vue'

import { hrApi } from '@/api/services'
import AppCard from '@/components/ui/AppCard.vue'
import AppModal from '@/components/ui/AppModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import DataTable from '@/components/ui/DataTable.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import { useAuthStore } from '@/stores/auth'
import type { TimeOffItem, TimeOffType } from '@/types/api'

const auth = useAuthStore()
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const rows = ref<TimeOffItem[]>([])
const types = ref<TimeOffType[]>([])
const modalOpen = ref(false)
const cancelTarget = ref<TimeOffItem | null>(null)
const form = ref({ leave_type_id: '', date_from: '', date_to: '', description: '' })
const columns = [
  { key: 'leave_type', label: 'Jenis cuti' },
  { key: 'date_from', label: 'Mulai' },
  { key: 'date_to', label: 'Selesai' },
  { key: 'state', label: 'Status' },
  { key: 'actions', label: '' },
]

function leaveName(item: TimeOffItem) {
  if (item.leave_type) return item.leave_type
  if (Array.isArray(item.holiday_status_id)) return item.holiday_status_id[1]
  return item.name || '-'
}
function formatDate(value: string) {
  return value
    ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value))
    : '-'
}
async function load() {
  if (!auth.employee) return
  loading.value = true
  try {
    const [requests, leaveTypes] = await Promise.all([
      hrApi.timeOff(auth.employee.id),
      hrApi.timeOffTypes(),
    ])
    rows.value = requests.items
    types.value = leaveTypes.items
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Data cuti gagal dimuat.'
  } finally {
    loading.value = false
  }
}
async function createRequest() {
  if (!auth.employee) return
  saving.value = true
  try {
    await hrApi.createTimeOff({
      employee_id: auth.employee.id,
      leave_type_id: Number(form.value.leave_type_id),
      date_from: form.value.date_from,
      date_to: form.value.date_to,
      description: form.value.description,
    })
    modalOpen.value = false
    form.value = { leave_type_id: '', date_from: '', date_to: '', description: '' }
    await load()
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Pengajuan gagal dikirim.'
  } finally {
    saving.value = false
  }
}
async function cancelRequest() {
  if (!cancelTarget.value) return
  saving.value = true
  try {
    await hrApi.cancelTimeOff(cancelTarget.value.id)
    cancelTarget.value = null
    await load()
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Cuti gagal dibatalkan.'
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
        <h1 class="mt-1 font-display text-2xl font-extrabold sm:text-3xl">Cuti & izin</h1>
        <p class="mt-1 text-sm text-ink-600">Ajukan dan pantau status permintaan cuti.</p>
      </div>
      <BaseButton @click="modalOpen = true"><CalendarPlus :size="18" /> Ajukan cuti</BaseButton>
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
        :search-keys="['leave_type', 'state', 'date_from']"
        search-placeholder="Cari cuti atau status..."
        empty-text="Belum ada pengajuan cuti."
      >
        <template #cell-leave_type="{ row }">{{ leaveName(row) }}</template>
        <template #cell-date_from="{ value }">{{ formatDate(String(value)) }}</template>
        <template #cell-date_to="{ value }">{{ formatDate(String(value)) }}</template>
        <template #cell-state="{ value }"
          ><span
            class="rounded-full px-2 py-1 text-xs font-bold"
            :class="
              value === 'validate'
                ? 'bg-mint-100 text-mint-600'
                : value === 'refuse' || value === 'cancel'
                  ? 'bg-coral-500/10 text-coral-500'
                  : 'bg-sun-400/20 text-[#80620f]'
            "
            >{{ value }}</span
          ></template
        >
        <template #cell-actions="{ row }"
          ><button
            v-if="!['cancel', 'refuse', 'validate'].includes(String(row.state))"
            class="focus-ring inline-flex items-center gap-1 text-xs font-bold text-coral-500"
            @click="cancelTarget = row"
          >
            <XCircle :size="15" /> Batalkan
          </button></template
        >
      </DataTable></AppCard
    >

    <AppModal
      :open="modalOpen"
      title="Ajukan cuti"
      description="Permintaan akan diteruskan ke approval Odoo."
      @close="modalOpen = false"
    >
      <form class="space-y-4" @submit.prevent="createRequest">
        <label class="block text-sm font-bold"
          >Jenis cuti<select v-model="form.leave_type_id" class="field mt-2" required>
            <option value="" disabled>Pilih jenis cuti</option>
            <option v-for="type in types" :key="type.id" :value="type.id">{{ type.name }}</option>
          </select></label
        >
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="text-sm font-bold"
            >Tanggal mulai<input
              v-model="form.date_from"
              type="date"
              class="field mt-2"
              required /></label
          ><label class="text-sm font-bold"
            >Tanggal selesai<input
              v-model="form.date_to"
              type="date"
              class="field mt-2"
              :min="form.date_from"
              required
          /></label>
        </div>
        <label class="block text-sm font-bold"
          >Keterangan<textarea
            v-model="form.description"
            class="field mt-2 min-h-24 resize-y"
            required
            placeholder="Alasan pengajuan"
          />
        </label>
        <div class="flex justify-end gap-2">
          <BaseButton variant="secondary" @click="modalOpen = false">Batal</BaseButton
          ><BaseButton type="submit" :loading="saving">Kirim pengajuan</BaseButton>
        </div>
      </form>
    </AppModal>
    <ConfirmDialog
      :open="Boolean(cancelTarget)"
      title="Batalkan pengajuan?"
      message="Pengajuan ini akan dibatalkan di Odoo dan tindakan tidak dapat diurungkan."
      :loading="saving"
      @close="cancelTarget = null"
      @confirm="cancelRequest"
    />
  </div>
</template>
