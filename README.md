# 🎂 Kado Ulang Tahun — loml.exe

Web statis bergaya pixel. Isinya 5 level: kuis → tiup lilin → galeri → kupon gosok → surat.

## 1. Edit isinya (semua ada di `config.js`)
- `pengirim` → nama/panggilan kamu
- `tanggalJadian` → tanggal jadian asli (format `2025-10-01T00:00:00`), dipakai untuk penghitung hari bersama
- Soal no.1 (tanggal pertama ketemu) menerima jawaban apa pun
- `kuis[2].jawaban` & `petunjuk` → jawaban kencan pertama
- `foto` → caption tiap foto
- `kupon` & `surat` → sesuaikan sesukamu

## 2. Masukkan foto & lagu
- Foto: taruh di `assets/foto/` dengan nama `1.jpg`, `2.jpg`, … (harus sama persis dengan `config.js`).
  Kecilkan dulu ke ±1200px biar cepat dibuka (foto HP biasanya 3–5 MB).
- Lagu (opsional): `assets/lagu.mp3`, diputar saat surat muncul.

## 3. Tes dulu sebelum jam 00:00
Buka lokal dengan perintah ini, lalu akses http://localhost:8080/?preview
```bash
python3 -m http.server 8080
```
- `?preview` → lewati countdown
- `?lv=quiz` / `cake` / `gallery` / `coupon` / `letter` → langsung lompat ke level tertentu

## 4. Online-kan (gratis, ±1 menit)
1. Buka https://app.netlify.com/drop
2. Drag & drop **folder ini** ke halaman itu
3. Kirim link-nya ke dia (link **tanpa** `?preview`, biar countdown aktif sampai 00:00)

> Fitur tiup lilin butuh HTTPS (Netlify sudah otomatis) + izin mikrofon.
> Kalau mic ditolak, lilin tetap bisa dimatikan dengan tap.
