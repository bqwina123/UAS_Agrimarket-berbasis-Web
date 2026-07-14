# UAS_Agrimarket-berbasis-Web
# 🌾 AgriMarket
## Aplikasi Marketplace Pertanian dengan Transparansi Harga Pasar

---

## 📖 Deskripsi Singkat

AgriMarket merupakan aplikasi marketplace pertanian berbasis web yang bertujuan menghubungkan petani secara langsung dengan pembeli tanpa melalui tengkulak. Aplikasi ini menyediakan informasi harga komoditas pertanian secara transparan berdasarkan data dari berbagai pasar tradisional sehingga petani dapat menentukan harga jual yang lebih kompetitif dan pembeli memperoleh informasi harga yang akurat.

---

# ✨ Fitur Utama

## 👤 Autentikasi Pengguna
- Registrasi akun
- Login
- Multi Role (Admin, Petani, Pembeli)
- Logout

## 🛒 Fitur Pembeli
- Melihat daftar komoditas
- Pencarian komoditas
- Filter komoditas
- Detail produk
- Keranjang belanja
- Checkout
- Konfirmasi pembayaran
- Riwayat transaksi
- Wishlist
- Notifikasi

## 🌱 Fitur Petani
- Dashboard petani
- Kelola produk
- Tambah produk
- Edit produk
- Hapus produk
- Melihat harga pasar
- Melihat pesanan masuk
- Mengubah status pesanan
- Riwayat penjualan

## ⚙️ Fitur Admin
- Dashboard Admin
- Manajemen Pengguna
- Manajemen Pasar
- Manajemen Komoditas
- Manajemen Harga
- Manajemen Transaksi
- Manajemen Ulasan
- Manajemen Promo
- Export Laporan
- Sinkronisasi Database

---

# 💻 Teknologi yang Digunakan

## Frontend
- Vue.js 3
- Vite
- Bootstrap 5
- CSS
- HTML5
- JavaScript

## Backend
- Node.js
- Express.js
- JWT Authentication
- bcryptjs

## Database
- PostgreSQL
- PostGIS

## Library
- Axios
- Chart.js
- Multer
- Express Validator
- Dotenv
- Cors

---

# 📋 Persyaratan Sistem

## Software

- Node.js 20 atau lebih baru
- PostgreSQL 16
- Git
- Visual Studio Code

## Browser

- Google Chrome
- Microsoft Edge
- Mozilla Firefox

## Operating System

- Windows 10/11
- Linux
- macOS

---

# ⚙️ Langkah Instalasi

## 1. Clone Repository

```bash
git clone https://github.com/username/agrimarket.git
```

## 2. Masuk ke Folder Project

```bash
cd agrimarket
```

## 3. Install Dependency

```bash
npm install
```

## 4. Buat File Environment

Buat file

```
.env
```

Contoh konfigurasi

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=agrimarket
DB_USER=postgres
DB_PASSWORD=password

JWT_SECRET=agrimarketsecret
```

## 5. Import Database

Import file

```
agrimarket.sql
```

ke PostgreSQL.

---

# ▶️ Cara Menjalankan Aplikasi

## Menjalankan Backend

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

## Menjalankan Frontend

```bash
npm run dev
```

Frontend berjalan pada

```
http://localhost:5173
```

---

# 👤 Akun Demo

## Admin

Email

```
admin@agrimarket.com
```

Password

```
admin123
```

---

## Petani

Email

```
petani@agrimarket.com
```

Password

```
petani123
```

---

## Pembeli

Email

```
pembeli@agrimarket.com
```

Password

```
pembeli123
```

---

# 🗄️ Struktur Database

Database menggunakan PostgreSQL.

Tabel utama yang digunakan:

```
users
categories
products
product_images
markets
market_prices
orders
order_items
transactions
reviews
addresses
wishlist
notifications
promotions
```

Relasi utama:

```
User
│
├── Products
├── Orders
├── Wishlist
├── Notifications
└── Reviews

Products
│
├── Category
├── Images
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

# 📁 Struktur Folder

```
agrimarket
│
├── backend
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── config
│   └── server.js
│
├── frontend
│   ├── src
│   ├── assets
│   ├── components
│   ├── views
│   ├── router
│   └── App.vue
│
├── database
│   └── agrimarket.sql
│
├── package.json
└── README.md
```

---

# 📸 Tampilan Aplikasi

- Halaman Beranda
- Login
- Registrasi
- Dashboard Admin
- Dashboard Petani
- Dashboard Pembeli
- Manajemen Pengguna
- Manajemen Pasar
- Manajemen Komoditas
- Manajemen Harga
- Marketplace
- Checkout
- Transaksi

---

# 👨‍💻 Pengembang

**Nama Proyek**

AgriMarket

**Dikembangkan oleh**

Program Studi Sistem Informasi

---

# 📄 Lisensi

Project ini dibuat untuk keperluan penelitian dan pembelajaran.
