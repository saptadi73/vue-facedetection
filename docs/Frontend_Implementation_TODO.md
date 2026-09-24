# TODO Implementasi Frontend Facework

Dokumen ini digunakan untuk mengecek progres implementasi frontend Vue terhadap
FastAPI Face Detection dan modul HR Odoo.

## Penanda Status

- `[x]` selesai diimplementasikan dan lolos build lokal
- `[ ]` belum dikerjakan atau belum diverifikasi end-to-end
- Item dianggap selesai hanya setelah acceptance check terkait berhasil

## 1. Fondasi Project

- [x] Vue 3, TypeScript, Vite, Vue Router, dan Pinia tersedia
- [x] Tailwind CSS 4 terhubung melalui plugin Vite
- [x] Font Manrope dan Plus Jakarta Sans tersedia secara lokal
- [x] Library icon `@lucide/vue` tersedia
- [x] Axios client menggunakan standard response envelope FastAPI
- [x] ApexCharts dan wrapper Vue tersedia
- [x] Konfigurasi environment terdokumentasi dalam `.env.example`
- [x] Proxy development `/api` menuju FastAPI port `8000`
- [x] Production build berhasil dengan `npm run build`
- [ ] Tambahkan ESLint dan script `npm run lint`
- [ ] Tambahkan Vitest dan Vue Test Utils
- [ ] Tambahkan Playwright untuk E2E
- [ ] Tambahkan pipeline CI untuk type-check, test, dan build

Acceptance check:

```powershell
npm install
npm run type-check
npm run build
```

## 2. Design System dan Komponen Reusable

- [x] Tema warna, typography, spacing, dan focus state global
- [x] `BaseButton` dengan variant, loading, dan disabled state
- [x] `AppCard`
- [x] `AppModal` responsif sebagai bottom sheet pada mobile
- [x] `LoadingSkeleton`
- [x] `DataTable` dengan search dan pagination
- [x] Tampilan tabel berubah menjadi daftar mobile
- [x] `ConfirmDialog` dengan konfirmasi teks untuk aksi destruktif
- [x] Shell desktop dengan sidebar
- [x] Shell mobile dengan bottom navigation
- [x] Tambahkan reusable toast/notification queue
- [x] Tambahkan reusable empty state dan error state
- [ ] Audit aksesibilitas keyboard, screen reader, dan contrast
- [ ] Pastikan seluruh target sentuh mobile minimal 44x44 px

## 3. Authentication dan Session

- [x] Form login username/password Odoo
- [x] Input opsional Odoo base URL dan database
- [x] Access token dikirim sebagai Bearer token
- [x] Session disimpan di `sessionStorage`
- [x] Route guard untuk halaman protected
- [x] Redirect ke login ketika API mengembalikan HTTP 401
- [x] Logout membersihkan session
- [ ] Verifikasi login menggunakan instance Odoo staging
- [ ] Verifikasi akun tanpa employee mapping
- [ ] Verifikasi claim `is_hr_admin`
- [ ] Tambahkan penanganan token hampir kedaluwarsa
- [ ] Putuskan strategi refresh token atau login ulang
- [ ] Audit keamanan penyimpanan token untuk production

Acceptance check:

- Login valid membuka dashboard.
- Login invalid menampilkan pesan dari envelope FastAPI.
- Refresh browser mempertahankan session aktif.
- Token invalid atau kedaluwarsa mengarahkan user ke login.
- Logout mencegah akses ulang ke halaman protected.

## 4. Kamera dan Geolocation

- [x] Kamera depan dapat diminta melalui browser
- [x] Video memakai `playsInline`
- [x] Resolusi kamera dibatasi ke target 640x480
- [x] Stream dihentikan saat komponen dilepas
- [x] Frame dikonversi menjadi Base64 JPEG
- [x] Face guide overlay tersedia
- [x] Geolocation meminta high accuracy
- [x] Status akurasi GPS: baik, cukup, dan buruk
- [x] Presensi diblokir ketika GPS tidak tersedia atau lebih dari 50 meter
- [x] Tambahkan camera device selector
- [x] Tambahkan precheck brightness di browser
- [x] Tambahkan precheck blur di browser
- [x] Tambahkan indikator face area sebelum capture
- [ ] Uji permission kamera ditolak pada Android dan iOS
- [ ] Uji permission lokasi ditolak dan timeout
- [ ] Uji pergantian kamera depan/belakang pada perangkat nyata

## 5. Enrollment Wajah

- [x] Status enrollment employee dapat dimuat
- [x] Start enrollment untuk employee dari session login
- [x] Capture dan upload sample wajah
- [x] Tampilkan accepted/rejected dan reason codes
- [x] Progress minimum lima accepted sample
- [x] Finish enrollment setelah target sample tercapai
- [x] Employee bebas tidak tersedia pada mode self-service
- [x] Verifikasi flow lengkap dengan model ONNX aktif
- [x] Tampilkan blur, brightness, dan detector confidence setiap sample
- [x] Tampilkan petunjuk sudut wajah antar-sample
- [ ] Cegah double submit saat jaringan lambat
- [ ] Uji insufficient sample dan semua quality rejection
- [ ] Uji enrollment ulang setelah provider/model berubah

Acceptance check:

- Lima sample valid dapat menghasilkan status `completed`.
- Sample invalid menampilkan reason code yang dapat dipahami user.
- User tidak dapat melakukan enrollment untuk employee lain.

Verifikasi lokal 2026-09-24:

- ONNX Runtime `1.30.0` dengan `CPUExecutionProvider` aktif.
- Model InsightFace `w600k_r50.onnx` berhasil dimuat dari `models/face_embedding.onnx`.
- Health backend melaporkan `active_provider=onnx` dan `onnx_ready=true`.
- Test `test_enrollment_and_checkin_flow` lulus dengan lima template dan attendance match.

## 6. Attendance

- [x] Segmented control check-in/check-out
- [x] Capture wajah dan GPS dalam satu payload
- [x] UUID `event_id` dibuat untuk idempotency
- [x] Event ID dipertahankan selama request/retry yang sama
- [x] Hasil matched, similarity, status, GPS, dan sync Odoo ditampilkan
- [x] Riwayat attendance tersedia
- [x] Search dan pagination riwayat tersedia
- [x] Implementasikan retry network maksimal dua kali dengan backoff 500/1500 ms
- [ ] Bedakan UX untuk validation, not found, conflict, dan server error
- [ ] Tampilkan request ID untuk kebutuhan tracing
- [ ] Verifikasi duplicate check-in/check-out menghasilkan UX yang benar
- [ ] Verifikasi attendance di luar radius lokasi
- [ ] Verifikasi wajah tidak cocok dan lebih dari satu wajah
- [ ] Verifikasi idempotency saat request dikirim ulang
- [x] Hapus referensi frame Base64 setelah request selesai

Acceptance check:

- Check-in dan check-out valid tersinkron ke Odoo hanya satu kali.
- Attendance tidak dapat dikirim tanpa kamera dan GPS yang layak.
- Retry jaringan tidak membuat record attendance ganda.

## 7. Dashboard

- [x] Ringkasan status attendance
- [x] Aktivitas terbaru
- [x] Shortcut menuju cuti dan lembur
- [x] ApexCharts untuk aktivitas mingguan
- [x] Dashboard di-load secara lazy melalui router
- [ ] Gunakan data agregasi nyata dari backend untuk chart
- [ ] Definisikan endpoint statistik dashboard
- [ ] Tambahkan filter periode
- [ ] Tampilkan seluruh modul HR Odoo setelah endpoint tersedia
- [ ] Evaluasi ukuran bundle ApexCharts dan optimasi chunk bila diperlukan

## 8. Time Off

- [x] Daftar jenis cuti
- [x] Daftar pengajuan employee login
- [x] Form pengajuan cuti
- [x] Validasi tanggal selesai tidak sebelum tanggal mulai
- [x] Pembatalan memakai konfirmasi ganda
- [x] Status pengajuan ditampilkan
- [ ] Verifikasi create dan cancel pada Odoo staging
- [ ] Tampilkan saldo/alokasi cuti jika backend menyediakan data
- [ ] Tampilkan detail approval dan alasan penolakan
- [ ] Uji larangan akses employee lain
- [ ] Uji role HR admin untuk akses lintas employee

## 9. Overtime

- [x] Daftar pengajuan lembur
- [x] Form tanggal, durasi, dan keterangan
- [x] Durasi dibatasi sampai 24 jam
- [x] Status pengajuan ditampilkan
- [ ] Verifikasi create pada Odoo staging
- [ ] Tambahkan detail approval/rejection
- [ ] Tambahkan edit/cancel jika endpoint backend tersedia
- [ ] Uji larangan akses employee lain

## 10. Payroll

- [x] Daftar payslip employee login
- [x] Search dan pagination payslip
- [x] Download PDF melalui authenticated API request
- [ ] Verifikasi nama file dan isi PDF dari Odoo staging
- [ ] Tampilkan net wage hanya bila policy perusahaan mengizinkan
- [ ] Tambahkan filter tahun/periode
- [ ] Uji payslip milik employee lain menghasilkan HTTP 403

## 11. Responsive dan Browser Compatibility

- [x] Login diperiksa pada desktop dan viewport 390 px
- [x] Dashboard diperiksa pada viewport 375 px tanpa horizontal overflow
- [x] Navigasi utama tersedia pada mobile dan desktop
- [ ] Uji halaman attendance pada perangkat Android nyata
- [ ] Uji halaman attendance pada Safari iOS nyata
- [ ] Uji viewport 320, 360, 390, 768, 1024, dan 1440 px
- [ ] Uji orientation portrait dan landscape
- [ ] Uji safe area pada perangkat dengan notch
- [ ] Uji jaringan lambat dan mode offline
- [ ] Jalankan audit Lighthouse mobile

## 12. Error Handling dan Observability

- [x] API envelope di-unpack melalui helper terpusat
- [x] HTTP 401 ditangani secara global
- [x] Loading state tersedia pada operasi utama
- [x] Error lokal ditampilkan pada masing-masing halaman
- [x] Tambahkan toast global
- [ ] Tambahkan mapping error code backend ke pesan Bahasa Indonesia
- [ ] Tampilkan `request_id` atau `event_id` ketika operasi gagal
- [ ] Integrasikan error monitoring untuk production
- [ ] Pastikan password, token, dan image Base64 tidak masuk log
- [ ] Tambahkan analytics yang tidak menyimpan data biometrik

## 13. Automated Testing

- [ ] Unit test API envelope dan interceptor 401
- [ ] Unit test auth store hydrate/login/logout
- [ ] Unit test lifecycle kamera
- [ ] Unit test kategori akurasi GPS
- [ ] Unit test state enrollment accepted/rejected
- [ ] Component test modal dan confirm dialog
- [ ] Component test search/pagination `DataTable`
- [ ] E2E login sukses dan gagal
- [ ] E2E enrollment happy path dan insufficient sample
- [ ] E2E attendance matched dan not matched
- [ ] E2E GPS denied dan lokasi di luar radius
- [ ] E2E create/cancel cuti
- [ ] E2E create lembur
- [ ] E2E download payslip

## 14. Security dan Production Readiness

- [ ] Gunakan HTTPS frontend ke FastAPI
- [ ] Gunakan HTTPS FastAPI ke Odoo
- [ ] Konfigurasikan origin production secara eksplisit di FastAPI
- [ ] Pastikan tidak ada `API_KEY`, Odoo JWT, atau secret dalam `VITE_*`
- [ ] Verifikasi browser hanya menerima FastAPI access token
- [ ] Tambahkan Content Security Policy
- [ ] Tambahkan security headers di reverse proxy
- [ ] Audit dependency dengan `npm audit`
- [ ] Verifikasi authorization semua endpoint HR dan attendance
- [ ] Definisikan retention policy untuk foto dan data biometrik
- [ ] Dokumentasikan consent dan kebijakan privasi employee

## 15. Deployment Checklist

- [ ] Tentukan URL FastAPI production pada `VITE_API_BASE_URL`
- [ ] Jalankan `npm ci`
- [ ] Jalankan type-check, automated tests, dan production build
- [ ] Deploy isi folder `dist/` melalui web server
- [ ] Konfigurasikan SPA fallback ke `index.html`
- [ ] Konfigurasikan cache asset fingerprinted
- [ ] Jangan cache `index.html` terlalu lama
- [ ] Verifikasi health FastAPI sebelum membuka frontend
- [ ] Smoke test login, enrollment, attendance, cuti, lembur, dan payslip
- [ ] Siapkan rollback version

## Definition of Done

Satu fitur dapat ditandai selesai apabila:

- Kontrak request/response sesuai schema FastAPI aktual.
- Loading, empty, success, validation, dan server error state tersedia.
- Scope employee dan role telah diverifikasi.
- Tampilan lolos pemeriksaan mobile dan desktop.
- Test otomatis untuk jalur utama dan kegagalan kritis tersedia.
- Tidak ada secret atau data biometrik sensitif di log dan bundle browser.
- Type-check, test, dan production build berhasil di CI.
