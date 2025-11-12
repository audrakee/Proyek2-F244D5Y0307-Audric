# StoryMap — SPA Web API + Maps

Proyek ini memenuhi 4 kriteria submission:
1) **SPA + Transisi Halaman**: Hash routing + View Transition API.
2) **Data & Marker pada Peta**: Menampilkan daftar cerita dan marker pada peta (Leaflet) termasuk **layer control (≥2 tile layer)** dan sinkronisasi list→marker.
3) **Tambah Data Baru**: Form upload + pilih lokasi melalui klik peta, validasi input, dan opsi **kamera (getUserMedia)**.
4) **Aksesibilitas**: Alt text, elemen semantik, label form, **skip to content**, dan dapat dioperasikan via keyboard. Tampilan responsif untuk mobile (≥375px), tablet (≥768px), desktop (≥1024px).

## Menjalankan
```bash
npm install
npm run dev
# buka http://localhost:5173
```

> Endpoint API: `https://story-api.dicoding.dev/v1`  
> VAPID Public Key (web push): ada pada `STUDENT.txt`.

## Alur Utama
- **Daftar/Masuk** → token disimpan di `localStorage`.
- **Beranda** → ambil `/stories?page&size&location=1` lalu tampilkan di list + peta. Klik tombol "Lihat di peta" menyorot marker (sinkronisasi).
- **Tambah** → klik peta untuk set `lat/lon`, unggah foto atau gunakan kamera, validasi ukuran ≤ 1MB, kirim ke `/stories` (jika login) atau `/stories/guest` (fallback).
- **Detail** → tampilkan detail + peta lokasi jika ada.
- **Notifikasi Web Push** → tombol "Aktifkan Notifikasi" mendaftarkan subscription ke `/notifications/subscribe` menggunakan VAPID public key dari instruksi.

## Aksesibilitas
- Alt text pada semua gambar konten.
- Elemen semantik (`header`, `main`, `footer`, `nav`, `section`, `article`).
- Label pada semua input + `aria-required` & `role="alert"` pada pesan error.
- Skip link dan fokus ring terlihat.
- Keyboard-friendly: semua kontrol dapat diakses via tab.
- Responsif (tanpa elemen bertumpuk) pada 375/768/1024px.
