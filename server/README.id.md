# SYI Chats — Server (Bahasa Indonesia)

Folder ini berisi server NestJS untuk proyek SYI Chats.

Panduan singkat ini mencakup setup, variabel environment, cara menjalankan, dan catatan penting tentang refresh token JWT serta index TTL MongoDB yang digunakan untuk pembersihan otomatis refresh token.

## Persyaratan

- Node.js (disarankan >= 18)
- npm atau yarn
- MongoDB (lokal atau remote)

## Setup cepat

1. Instal dependensi

```bash
npm install
```

2. Buat file `.env` (atau set environment variable di environment). Variabel minimal yang dibutuhkan:

```
JOSE_SECRET_KEY=your_jose_secret_here
DATABASE_URI=mongodb://localhost:27017/your-db
```

3. Jalankan di mode development

```bash
npm run start:dev
```

4. Build dan jalankan production

```bash
npm run build
npm run start:prod
```

## Catatan penting — refresh token dan TTL

- Aplikasi menyimpan refresh token di model Mongoose bernama `Refresher` (lihat `src/common/entities/refresher.token.schema.ts`).
- Schema menyediakan field `expires_at` (Date) dan sebuah TTL index single-field pada field tersebut:

```ts
refresherSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
```

- Aplikasi melakukan verifikasi refresh JWT (menggunakan `jose`) dan mengambil klaim `exp` (dalam detik). Service menyimpan `expires_at` berdasarkan nilai `exp` tersebut (dikonversi ke `Date`) sehingga MongoDB akan menghapus dokumen ketika token expired.

- Monitor TTL MongoDB berjalan secara periodik (sekitar setiap 60 detik), jadi penghapusan bisa sedikit tertunda setelah `expires_at`.

- Catatan untuk produksi: jika koneksi Mongoose diatur `autoIndex: false`, Mongoose tidak membuat index otomatis saat startup. Untuk memastikan index TTL dibuat, bisa:

  - Buat index manual di database, atau
  - Panggil `Model.syncIndexes()` sekali saat startup untuk model `Refresher`, atau
  - Aktifkan pembuatan index melalui tooling deploy.

## Konfigurasi JWT

- JWT dibuat menggunakan `jose` (lihat `src/common/helpers/jwt.service.ts`). Service menandatangani token dengan `JOSE_SECRET_KEY` dan mengatur expiration dengan string seperti `"15m"` atau `"7d"`.
- Exp dari refresh token digunakan sebagai sumber kebenaran (`canonical`) untuk field `expires_at` pada dokumen refresh agar ekspirasi token dan TTL DB tersinkron.

## Skrip berguna

- `npm run start:dev` — jalankan di mode watch/dev
- `npm run build` — kompilasi ke `dist/`
- `npm run start:prod` — jalankan hasil build production

## Saran lanjutan

- Untuk manajemen refresh token lebih ketat, buat endpoint yang menandai refresh token `is_used: true` saat dipakai dan cek flag tersebut saat reuse.
- Tambahkan `Model.syncIndexes()` pada inisialisasi jika ingin memastikan index dibuat otomatis di production.

Kalau mau, saya bisa tambahkan link dari README root repo ke file README di folder `server` ini.
