# UAS_Agrimarket-berbasis-Web
# 🌾 AgriMarket
## Aplikasi Marketplace Pertanian dengan Transparansi Harga Pasar

![Version](https://img.shields.io/badge/version-1.0-green)
![Platform](https://img.shields.io/badge/platform-Web-blue)
![Backend](https://img.shields.io/badge/backend-Node.js-success)
![Frontend](https://img.shields.io/badge/frontend-Vue.js-42b883)
![Database](https://img.shields.io/badge/database-PostgreSQL-blue)

---

## 📖 Deskripsi

**AgriMarket** merupakan aplikasi marketplace pertanian berbasis web yang dirancang untuk menghubungkan petani secara langsung dengan pembeli tanpa melalui perantara (tengkulak). Aplikasi ini menyediakan informasi harga komoditas dari berbagai pasar tradisional sehingga petani dapat menentukan harga jual yang lebih kompetitif dan pembeli memperoleh informasi harga yang transparan.

Aplikasi dikembangkan menggunakan **Node.js**, **Express.js**, **Vue.js**, dan **PostgreSQL** dengan metode **Rapid Application Development (RAD)**.

---

# 🎯 Tujuan Aplikasi

- Membantu petani menjual hasil panen secara langsung kepada pembeli.
- Menyediakan transparansi harga komoditas dari berbagai pasar.
- Mempermudah proses transaksi jual beli hasil pertanian.
- Memberikan informasi harga pasar secara real-time.
- Mengurangi ketergantungan petani terhadap tengkulak.

---

# ✨ Fitur Utama

## 👥 Autentikasi Pengguna
- Registrasi akun
- Login
- Logout
- Multi Role (Admin, Petani, Pembeli)
- Manajemen Profil

---

## 🛒 Fitur Pembeli

- Melihat daftar komoditas
- Melihat detail produk
- Pencarian produk
- Filter produk berdasarkan kategori
- Filter berdasarkan harga
- Melihat harga pasar
- Perbandingan harga pasar dengan harga petani
- Keranjang Belanja
- Checkout
- Konfirmasi pembayaran
- Riwayat transaksi
- Wishlist
- Notifikasi

---

## 🌱 Fitur Petani

- Dashboard Petani
- Tambah Produk
- Edit Produk
- Hapus Produk
- Kelola stok
- Melihat harga pasar
- Menerima pesanan
- Mengubah status pesanan
- Riwayat penjualan
- Notifikasi

---

## ⚙️ Fitur Admin

- Dashboard Admin
- Manajemen Pengguna
- Manajemen Pasar
- Manajemen Komoditas
- Manajemen Data Harga
- Upload Bulk Harga
- Export CSV Harga
- Manajemen Transaksi
- Manajemen Ulasan
- Manajemen Promo
- Sinkronisasi Database
- Export Laporan

---

# 🛠 Teknologi yang Digunakan

## Backend

- Node.js
- Express.js
- JWT Authentication
- bcryptjs
- Multer
- Express Validator

## Frontend

- Vue.js 3
- Vite
- Bootstrap 5
- HTML5
- CSS3
- JavaScript

## Database

- PostgreSQL
- PostGIS

## Library

- Axios
- Chart.js
- Dotenv
- Cors

---

# 💻 Persyaratan Sistem

## Software

- Node.js 20+
- PostgreSQL 16+
- Git
- Visual Studio Code

## Browser

- Google Chrome
- Microsoft Edge
- Mozilla Firefox

## Operating System

- Windows 10 / 11
- Linux
- macOS

---

# 📥 Instalasi

## 1. Clone Repository

```bash
git clone https://github.com/username/agrimarket.git
```

Masuk ke folder project

```bash
cd agrimarket
```

---

## 2. Install Dependency

Backend

```bash
npm install
```

Frontend

```bash
npm install
```

---

## 3. Konfigurasi Environment

Buat file

```text
.env
```

Isi file

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=agrimarket
DB_USER=postgres
DB_PASSWORD=password

JWT_SECRET=agrimarket_secret
```

---

## 4. Import Database

Buka PostgreSQL kemudian buat database

```
agrimarket
```

Import file

```
agrimarket.sql
```

---

# ▶️ Menjalankan Aplikasi

## Backend

```bash
npm run dev
```

atau

```bash
node server.js
```

Backend berjalan pada

```
http://localhost:3000
```

---

## Frontend

```bash
npm run dev
```

Frontend berjalan pada

```
http://localhost:5173
```

---

# 👤 Akun Demo

## Administrator

| Email | Password |
|--------|----------|
| admin@agrimarket.com | admin123 |

---

## Petani

| Email | Password |
|--------|----------|
| petani@agrimarket.com | petani123 |

---

## Pembeli

| Email | Password |
|--------|----------|
| pembeli@agrimarket.com | pembeli123 |

---

# 🗄 Struktur Database

Database menggunakan PostgreSQL.

## Tabel

- users
- categories
- products
- product_images
- markets
- market_prices
- orders
- order_items
- transactions
- reviews
- carts
- cart_items
- addresses
- wishlist
- notifications
- promotions

---

## Relasi Database

```
Users
│
├── Products
├── Orders
├── Wishlist
├── Notifications
└── Reviews

Products
│
├── Categories
├── Product Images
└── Order Items

Markets
│
└── Market Prices

Orders
│
├── Order Items
└── Transactions
```

---

# 📂 Struktur Folder

```
AgriMarket
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── uploads
│   ├── app.js
│   └── server.js
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── layouts
│   │   ├── router
│   │   ├── stores
│   │   ├── views
│   │   └── App.vue
│   └── vite.config.js
│
├── database
│   ├── agrimarket.sql
│   └── migration.sql
│
├── package.json
├── .env
├── .gitignore
└── README.md
```

---

# 📸 Tampilan Aplikasi

### Halaman Pembeli

- Beranda
- Detail Produk
- Keranjang Belanja
- Checkout
- Riwayat Pesanan

### Halaman Petani

- Dashboard
- Produk Saya
- Tambah Produk
- Riwayat Penjualan

### Halaman Admin

- Dashboard
- Manajemen Pengguna
- Manajemen Pasar
- Manajemen Komoditas
- Manajemen Data Harga
- Manajemen Transaksi
- Manajemen Promo

---

# 🧪 Pengujian Sistem

Metode pengujian yang digunakan adalah **Black Box Testing**.

Hasil pengujian menunjukkan seluruh fitur utama aplikasi berjalan sesuai dengan kebutuhan fungsional yang telah dirancang, meliputi:

- Registrasi
- Login
- Manajemen Produk
- Manajemen Pasar
- Manajemen Harga
- Keranjang Belanja
- Checkout
- Pembayaran
- Riwayat Transaksi
- Dashboard Admin

Seluruh skenario pengujian memperoleh status **Valid**.


# 📄 Lisensi

Proyek ini dikembangkan untuk keperluan penelitian dan pembelajaran. Penggunaan kode sumber diperbolehkan dengan tetap mencantumkan sumber pengembang.


