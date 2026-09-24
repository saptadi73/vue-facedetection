<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, Fingerprint, LockKeyhole, Server, UserRound } from '@lucide/vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const showPassword = ref(false)
const showAdvanced = ref(false)
const form = ref({ username: '', password: '', odoo_base_url: '', odoo_db: '' })

async function submit() {
  try {
    await auth.login({
      username: form.value.username,
      password: form.value.password,
      odoo_base_url: form.value.odoo_base_url || undefined,
      odoo_db: form.value.odoo_db || undefined,
    })
    router.replace('/')
  } catch {
    /* Error is rendered from the store. */
  }
}
</script>

<template>
  <main class="grid min-h-dvh lg:grid-cols-[1.05fr_0.95fr]">
    <section
      class="relative hidden overflow-hidden bg-ink-950 p-12 text-white lg:flex lg:flex-col lg:justify-between"
    >
      <div
        class="absolute inset-0 opacity-20"
        style="
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
          background-size: 48px 48px;
        "
      />
      <div class="relative flex items-center gap-3">
        <div class="grid size-11 place-items-center rounded-lg bg-mint-500">
          <Fingerprint :size="24" />
        </div>
        <span class="font-display text-xl font-extrabold">Facework</span>
      </div>
      <div class="relative max-w-xl">
        <p class="mb-5 text-sm font-bold uppercase text-mint-500">HR workspace</p>
        <h1 class="font-display text-5xl font-extrabold leading-[1.12]">
          Satu pintu untuk hari kerja Anda.
        </h1>
        <p class="mt-6 max-w-lg text-lg leading-8 text-white/65">
          Presensi wajah, pengajuan cuti, lembur, dan slip gaji terhubung langsung dengan Odoo.
        </p>
      </div>
      <p class="relative text-sm text-white/40">Terhubung aman melalui Face Attendance Service</p>
    </section>

    <section class="flex items-center justify-center px-5 py-10 sm:px-10">
      <div class="w-full max-w-md">
        <div class="mb-10 flex items-center gap-3 lg:hidden">
          <div class="grid size-11 place-items-center rounded-lg bg-ink-950 text-white">
            <Fingerprint :size="23" />
          </div>
          <span class="font-display text-xl font-extrabold">Facework</span>
        </div>
        <p class="text-sm font-bold text-mint-600">Selamat datang</p>
        <h1 class="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Masuk ke ruang kerja</h1>
        <p class="mt-3 text-sm leading-6 text-ink-600">Gunakan akun Odoo perusahaan Anda.</p>

        <form class="mt-8 space-y-4" @submit.prevent="submit">
          <label class="block text-sm font-bold text-ink-800"
            >Email atau username
            <span class="relative mt-2 block"
              ><UserRound
                :size="18"
                class="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-600" /><input
                v-model="form.username"
                class="field pl-11"
                autocomplete="username"
                required
                placeholder="nama@perusahaan.com"
            /></span>
          </label>
          <label class="block text-sm font-bold text-ink-800"
            >Password
            <span class="relative mt-2 block"
              ><LockKeyhole
                :size="18"
                class="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-600" /><input
                v-model="form.password"
                class="field px-11"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                placeholder="Password Odoo" /><button
                type="button"
                class="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center text-ink-600"
                :title="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" :size="18" /><Eye v-else :size="18" /></button
            ></span>
          </label>

          <button
            type="button"
            class="flex items-center gap-2 text-sm font-bold text-ink-600 hover:text-ink-950"
            @click="showAdvanced = !showAdvanced"
          >
            <Server :size="16" />{{ showAdvanced ? 'Sembunyikan' : 'Atur' }} koneksi Odoo
          </button>
          <div
            v-if="showAdvanced"
            class="grid gap-3 rounded-lg border border-black/[0.07] bg-white/60 p-3 sm:grid-cols-2"
          >
            <label class="text-xs font-bold text-ink-600"
              >Server<input
                v-model="form.odoo_base_url"
                class="field mt-1.5"
                placeholder="http://127.0.0.1:8070"
            /></label>
            <label class="text-xs font-bold text-ink-600"
              >Database<input v-model="form.odoo_db" class="field mt-1.5" placeholder="jabung"
            /></label>
          </div>
          <p
            v-if="auth.error"
            class="rounded-lg bg-coral-500/10 px-3.5 py-3 text-sm font-semibold text-coral-500"
          >
            {{ auth.error }}
          </p>
          <BaseButton type="submit" class="w-full" :loading="auth.loading">Masuk</BaseButton>
        </form>
      </div>
    </section>
  </main>
</template>
