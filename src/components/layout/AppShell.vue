<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Banknote,
  CalendarDays,
  Camera,
  ChartNoAxesCombined,
  Clock3,
  Fingerprint,
  History,
  LogOut,
} from '@lucide/vue'

import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const nav = [
  { label: 'Ringkasan', to: '/', icon: ChartNoAxesCombined },
  { label: 'Presensi', to: '/attendance', icon: Camera },
  { label: 'Wajah', to: '/enrollment', icon: Fingerprint },
  { label: 'Riwayat', to: '/history', icon: History },
  { label: 'Cuti', to: '/time-off', icon: CalendarDays },
  { label: 'Lembur', to: '/overtime', icon: Clock3 },
  { label: 'Gaji', to: '/payslips', icon: Banknote },
]
const initials = computed(
  () =>
    auth.user?.name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'FW',
)
function logout() {
  auth.logout()
  router.replace('/login')
}
</script>

<template>
  <div class="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
    <aside
      class="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-black/[0.07] bg-paper/95 px-4 py-5 backdrop-blur lg:flex"
    >
      <div class="flex items-center gap-3 px-2">
        <div class="grid size-10 place-items-center rounded-lg bg-ink-950 text-white">
          <Fingerprint :size="22" />
        </div>
        <div>
          <p class="font-display font-extrabold">Facework</p>
          <p class="text-[11px] font-bold uppercase text-mint-600">People operations</p>
        </div>
      </div>
      <nav class="mt-8 space-y-1">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition"
          :class="
            route.path === item.to
              ? 'bg-mint-100 text-mint-600'
              : 'text-ink-600 hover:bg-black/[0.04] hover:text-ink-950'
          "
        >
          <component :is="item.icon" :size="18" />{{ item.label }}
        </RouterLink>
      </nav>
      <div class="mt-auto border-t border-black/[0.07] pt-4">
        <div class="flex items-center gap-3 px-2">
          <div
            class="grid size-9 place-items-center rounded-full bg-sun-400 text-xs font-extrabold"
          >
            {{ initials }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold">{{ auth.user?.name }}</p>
            <p class="truncate text-xs text-ink-600">{{ auth.employee?.name || 'Akun Odoo' }}</p>
          </div>
          <button
            class="focus-ring grid size-9 place-items-center rounded-lg text-ink-600 hover:bg-black/5"
            title="Keluar"
            @click="logout"
          >
            <LogOut :size="17" />
          </button>
        </div>
      </div>
    </aside>

    <div class="min-w-0 lg:col-start-2">
      <header
        class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-black/[0.07] bg-paper/90 px-4 backdrop-blur lg:hidden"
      >
        <div class="flex items-center gap-2.5">
          <div class="grid size-9 place-items-center rounded-lg bg-ink-950 text-white">
            <Fingerprint :size="19" />
          </div>
          <span class="font-display font-extrabold">Facework</span>
        </div>
        <button
          class="grid size-9 place-items-center rounded-full bg-sun-400 text-xs font-extrabold"
          title="Profil"
        >
          {{ initials }}
        </button>
      </header>
      <main class="mx-auto w-full max-w-7xl px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
        <RouterView v-slot="{ Component }"
          ><Transition name="page" mode="out-in"><component :is="Component" /></Transition
        ></RouterView>
      </main>
    </div>

    <nav
      class="fixed inset-x-0 bottom-0 z-40 flex overflow-x-auto border-t border-black/10 bg-paper/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <RouterLink
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        class="focus-ring flex min-w-[68px] flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[10px] font-bold"
        :class="route.path === item.to ? 'text-mint-600' : 'text-ink-600'"
      >
        <component :is="item.icon" :size="20" /><span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>
