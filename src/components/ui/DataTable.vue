<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, Search } from '@lucide/vue'

interface Column {
  key: string
  label: string
  class?: string
}
const props = withDefaults(
  defineProps<{
    rows: T[]
    columns: Column[]
    searchKeys?: string[]
    searchPlaceholder?: string
    pageSize?: number
    emptyText?: string
  }>(),
  { pageSize: 8, emptyText: 'Belum ada data.' },
)

const query = ref('')
const page = ref(1)
const filtered = computed(() => {
  const term = query.value.trim().toLowerCase()
  if (!term) return props.rows
  const keys = props.searchKeys?.length
    ? props.searchKeys
    : props.columns.map((column) => column.key)
  return props.rows.filter((row) =>
    keys.some((key) =>
      String(row[key] ?? '')
        .toLowerCase()
        .includes(term),
    ),
  )
})
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / props.pageSize)))
const visibleRows = computed(() =>
  filtered.value.slice((page.value - 1) * props.pageSize, page.value * props.pageSize),
)
watch(query, () => {
  page.value = 1
})
watch(totalPages, (total) => {
  if (page.value > total) page.value = total
})
</script>

<template>
  <div>
    <label class="relative mb-4 block">
      <Search
        :size="17"
        class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-600"
      />
      <input
        v-model="query"
        class="field pl-10"
        :placeholder="searchPlaceholder || 'Cari data...'"
      />
    </label>

    <div class="space-y-2 md:hidden">
      <div
        v-for="(row, index) in visibleRows"
        :key="String(row.id ?? index)"
        class="rounded-lg border border-black/[0.07] bg-paper p-3.5"
      >
        <div
          v-for="column in columns"
          :key="column.key"
          class="flex justify-between gap-4 py-1.5 text-sm"
        >
          <span class="text-ink-600">{{ column.label }}</span>
          <span class="text-right font-semibold text-ink-950"
            ><slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">{{
              row[column.key] ?? '-'
            }}</slot></span
          >
        </div>
      </div>
    </div>

    <div class="hidden overflow-x-auto md:block">
      <table class="w-full border-collapse text-left text-sm">
        <thead>
          <tr class="border-b border-black/10 text-xs uppercase text-ink-600">
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-3 py-3 font-bold"
              :class="column.class"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in visibleRows"
            :key="String(row.id ?? index)"
            class="border-b border-black/[0.06] last:border-0"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-3 py-3.5"
              :class="column.class"
            >
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">{{
                row[column.key] ?? '-'
              }}</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!visibleRows.length" class="py-10 text-center text-sm text-ink-600">
      {{ emptyText }}
    </div>
    <footer
      v-if="filtered.length"
      class="mt-4 flex items-center justify-between border-t border-black/[0.07] pt-3 text-xs text-ink-600"
    >
      <span>{{ filtered.length }} data</span>
      <div class="flex items-center gap-2">
        <button
          class="focus-ring grid size-9 place-items-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
          title="Halaman sebelumnya"
          :disabled="page === 1"
          @click="page--"
        >
          <ChevronLeft :size="16" />
        </button>
        <span class="min-w-14 text-center">{{ page }} / {{ totalPages }}</span>
        <button
          class="focus-ring grid size-9 place-items-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
          title="Halaman berikutnya"
          :disabled="page === totalPages"
          @click="page++"
        >
          <ChevronRight :size="16" />
        </button>
      </div>
    </footer>
  </div>
</template>
