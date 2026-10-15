<script setup lang="ts">
import { computed, ref } from 'vue'
import { BookOpen, CheckCircle2, ChevronDown, Download, MapPin, ShieldCheck, TriangleAlert } from '@lucide/vue'
import AppCard from '@/components/ui/AppCard.vue'

const openSection = ref('attendance')
const sections = [
  {
    id: 'attendance',
    title: 'Presensi dengan wajah',
    icon: CheckCircle2,
    steps: [
      'Pastikan Anda sudah login dan wajah sudah terdaftar pada menu Wajah.',
      'Buka menu Presensi, izinkan akses kamera dan lokasi.',
      'Posisikan wajah di dalam area panduan, lalu tekan Check-in atau Check-out.',
      'Tunggu hasil verifikasi wajah, GPS, dan sinkronisasi ke Odoo.',
    ],
  },
  {
    id: 'enrollment',
    title: 'Pendaftaran wajah',
    icon: ShieldCheck,
    steps: [
      'Buka menu Wajah dan pilih mulai pendaftaran.',
      'Ambil beberapa sampel dari arah depan, kiri, kanan, atas, dan bawah.',
      'Pastikan pencahayaan cukup, wajah tidak tertutup, dan gambar tidak buram.',
      'Selesaikan pendaftaran sampai status wajah aktif ditampilkan.',
    ],
  },
  {
    id: 'requests',
    title: 'Cuti dan lembur',
    icon: BookOpen,
    steps: [
      'Gunakan menu Cuti untuk melihat jenis izin dan mengajukan time off.',
      'Isi tanggal, jenis cuti, dan keterangan secara lengkap.',
      'Gunakan menu Lembur untuk mengirim tanggal, durasi, dan keterangan lembur.',
      'Status pengajuan mengikuti proses persetujuan di Odoo.',
    ],
  },
]

const activeSection = computed(() => sections.find((section) => section.id === openSection.value))
function toggleSection(id: string) {
  openSection.value = openSection.value === id ? '' : id
}
</script>

<template>
  <div>
    <header class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm font-bold text-mint-600">Pusat bantuan</p>
        <h1 class="mt-1 font-display text-2xl font-extrabold sm:text-3xl">Panduan Facework</h1>
        <p class="mt-1 max-w-2xl text-sm text-ink-600">
          Ikuti panduan singkat untuk presensi wajah, pendaftaran wajah, cuti, lembur, dan gaji.
        </p>
      </div>
      <a
        href="/docs/FACEDETECTION_Panduan_Fungsional.docx"
        download
        class="focus-ring inline-flex min-h-11 items-center gap-2 rounded-lg bg-ink-950 px-4 text-sm font-bold text-white"
      >
        <Download :size="17" /> Download panduan
      </a>
    </header>

    <div class="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
      <AppCard>
        <div class="mb-4 flex items-center gap-3">
          <div class="grid size-10 place-items-center rounded-lg bg-mint-100 text-mint-600">
            <BookOpen :size="20" />
          </div>
          <div>
            <h2 class="font-display text-lg font-extrabold">Cara menggunakan aplikasi</h2>
            <p class="text-sm text-ink-600">Pilih topik untuk melihat langkah-langkahnya.</p>
          </div>
        </div>
        <div class="space-y-2">
          <div v-for="section in sections" :key="section.id" class="overflow-hidden rounded-lg border border-black/[0.07]">
            <button
              class="focus-ring flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-mint-50"
              @click="toggleSection(section.id)"
            >
              <component :is="section.icon" :size="18" class="text-mint-600" />
              <span class="flex-1 text-sm font-bold">{{ section.title }}</span>
              <ChevronDown :size="17" class="transition-transform" :class="openSection === section.id ? 'rotate-180' : ''" />
            </button>
            <ol v-if="openSection === section.id" class="space-y-3 border-t border-black/[0.06] bg-mint-50/50 px-5 py-4 text-sm text-ink-800">
              <li v-for="(step, index) in section.steps" :key="step" class="flex gap-3">
                <span class="grid size-6 shrink-0 place-items-center rounded-full bg-mint-600 text-xs font-extrabold text-white">{{ index + 1 }}</span>
                <span>{{ step }}</span>
              </li>
            </ol>
          </div>
        </div>
      </AppCard>

      <div class="space-y-4">
        <AppCard>
          <div class="flex items-start gap-3">
            <MapPin :size="20" class="mt-0.5 text-mint-600" />
            <div>
              <h2 class="font-display font-extrabold">Syarat presensi</h2>
              <p class="mt-2 text-sm leading-6 text-ink-600">Kamera dan lokasi harus diizinkan. Presensi hanya diterima jika wajah cocok dan posisi berada dalam area kerja yang diizinkan.</p>
            </div>
          </div>
        </AppCard>
        <AppCard>
          <div class="flex items-start gap-3">
            <TriangleAlert :size="20" class="mt-0.5 text-[#987518]" />
            <div>
              <h2 class="font-display font-extrabold">Jika presensi gagal</h2>
              <ul class="mt-2 list-disc space-y-1 pl-4 text-sm leading-6 text-ink-600">
                <li>Periksa izin kamera dan lokasi browser.</li>
                <li>Gunakan pencahayaan yang cukup dan lepaskan masker.</li>
                <li>Pastikan GPS akurat dan berada di lokasi kerja.</li>
                <li>Hubungi admin HR jika wajah belum terdaftar.</li>
              </ul>
            </div>
          </div>
        </AppCard>
      </div>
    </div>

    <AppCard class="mt-4 border-l-4 border-l-coral-500">
      <div class="flex items-start gap-3">
        <ShieldCheck :size="20" class="mt-0.5 text-coral-500" />
        <div>
          <h2 class="font-display font-extrabold">Prasyarat wajib sebelum presensi</h2>
          <ul class="mt-2 list-disc space-y-1 pl-4 text-sm leading-6 text-ink-600">
            <li>User harus memiliki akun Odoo yang aktif.</li>
            <li>Akun Odoo harus terhubung dengan data employee di Odoo.</li>
            <li>Foto wajah wajib di-upload/daftarkan terlebih dahulu melalui menu Wajah.</li>
            <li>Presensi tidak dapat dilakukan sebelum pendaftaran wajah selesai.</li>
          </ul>
        </div>
      </div>
    </AppCard>

    <AppCard class="mt-4">
      <h2 class="font-display text-lg font-extrabold">FAQ singkat</h2>
      <div class="mt-3 grid gap-3 text-sm text-ink-600 md:grid-cols-2">
        <p><strong class="text-ink-950">Apakah data presensi masuk Odoo?</strong><br />Ya, hasil presensi yang berhasil akan disinkronkan ke Odoo.</p>
        <p><strong class="text-ink-950">Mengapa lokasi harus aktif?</strong><br />GPS digunakan untuk memastikan presensi dilakukan di area kerja yang sah.</p>
        <p><strong class="text-ink-950">Apakah bisa mengulang check-in?</strong><br />Sistem mencegah presensi ganda pada periode yang sama.</p>
        <p><strong class="text-ink-950">Di mana melihat hasilnya?</strong><br />Gunakan menu Riwayat untuk melihat status dan waktu presensi.</p>
      </div>
    </AppCard>
  </div>
</template>
