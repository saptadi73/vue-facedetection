<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Download, FileText } from '@lucide/vue'

import { hrApi } from '@/api/services'
import AppCard from '@/components/ui/AppCard.vue'
import DataTable from '@/components/ui/DataTable.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import type { PayslipItem } from '@/types/api'

const auth = useAuthStore()
const toast = useToastStore()
const rows = ref<PayslipItem[]>([])
const loading = ref(true)
const downloading = ref<number | null>(null)
const error = ref('')
const columns = [
  { key: 'name', label: 'Slip gaji' },
  { key: 'date_from', label: 'Periode mulai' },
  { key: 'date_to', label: 'Periode selesai' },
  { key: 'state', label: 'Status' },
  { key: 'actions', label: '' },
]
function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value))
}
async function load() {
  if (!auth.employee) return
  loading.value = true
  error.value = ''
  try {
    rows.value = (await hrApi.payslips(auth.employee.id)).items
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Slip gaji gagal dimuat.'
  } finally {
    loading.value = false
  }
}
async function download(item: PayslipItem) {
  downloading.value = item.id
  try {
    const blob = await hrApi.payslipPdf(item.id)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${item.name || `payslip-${item.id}`}.pdf`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('PDF berhasil diunduh', item.name)
  } catch (reason) {
    toast.error('Unduhan gagal', reason instanceof Error ? reason.message : 'PDF gagal diunduh.')
  } finally {
    downloading.value = null
  }
}
onMounted(load)
</script>

<template>
  <div>
    <header class="mb-5">
      <p class="text-sm font-bold text-mint-600">Payroll</p>
      <h1 class="mt-1 font-display text-2xl font-extrabold sm:text-3xl">Slip gaji</h1>
      <p class="mt-1 text-sm text-ink-600">Dokumen payroll resmi dari Odoo.</p>
    </header>
    <AppCard
      ><LoadingSkeleton v-if="loading" :rows="5" /><ErrorState
        v-else-if="error"
        :message="error"
        :loading="loading"
        @retry="load"
      /><DataTable
        v-else
        :rows="rows"
        :columns="columns"
        :search-keys="['name', 'state', 'date_from']"
        search-placeholder="Cari periode slip gaji..."
        empty-text="Belum ada slip gaji."
        ><template #cell-name="{ value }"
          ><span class="inline-flex items-center gap-2 font-bold"
            ><FileText :size="17" class="text-mint-600" />{{ value }}</span
          ></template
        ><template #cell-date_from="{ value }">{{ formatDate(String(value)) }}</template
        ><template #cell-date_to="{ value }">{{ formatDate(String(value)) }}</template
        ><template #cell-state="{ value }"
          ><span class="rounded-full bg-mint-100 px-2 py-1 text-xs font-bold text-mint-600">{{
            value
          }}</span></template
        ><template #cell-actions="{ row }"
          ><button
            class="focus-ring inline-flex items-center gap-1.5 text-xs font-bold text-mint-600 disabled:opacity-50"
            :disabled="downloading === row.id"
            @click="download(row)"
          >
            <Download :size="15" />{{ downloading === row.id ? 'Menyiapkan...' : 'PDF' }}
          </button></template
        ></DataTable
      ></AppCard
    >
  </div>
</template>
