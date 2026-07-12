<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/services/authService'
import { getUsers, getMarkets, getCommodities, getMarketPrices, getOrders, getProducts, getPayments, getShippings, createUser, createMarket, deleteMarket, createCommodity, deleteCommodity, upsertMarketPrice, getAvgPriceByCommodity, getTransactionReport, toggleUserActive, deleteUser, getAllReviews, deleteReview, bulkUpsertMarketPrice, getPromos, createPromo, updatePromo, deletePromo, deleteOrder } from '@/services/db'
import { syncAllFromAPI, syncUsersToDB } from '@/services/dataSync'
const syncing = ref(false)
const syncMsg = ref('')
async function handleSync() { syncing.value = true; syncMsg.value = ''; await syncAllFromAPI(); reloadAll(); syncing.value = false; syncMsg.value = 'Sinkronisasi selesai!' }
async function handleSyncUsers() { syncing.value = true; syncMsg.value = ''; const r = await syncUsersToDB(); if (r.success) { syncMsg.value = r.count + ' user disinkron ke database!'; reloadAll() } else { syncMsg.value = r.error || 'Gagal sinkron user' }; syncing.value = false }
import type { User, Market, Commodity, MarketPrice, Order, Product, Payment, Shipping, UserRole, Review, Promo } from '@/types'

const { user, updateProfile } = useAuth()
const adminAvatarRef = ref<HTMLElement | null>(null)
const activeTab = ref<'overview' | 'users' | 'markets' | 'commodities' | 'prices' | 'transactions' | 'reviews' | 'promo'>('overview')
const promos = ref<Promo[]>(getPromos())
const showPromoForm = ref(false)
const editingPromoId = ref<string | null>(null)
const promoForm = ref({ title: '', description: '', discountType: 'percentage' as 'percentage' | 'nominal', discountValue: 0, code: '', minPurchase: 0 })
function resetPromoForm() { promoForm.value = { title: '', description: '', discountType: 'percentage', discountValue: 0, code: '', minPurchase: 0 }; editingPromoId.value = null }
function openAddPromo() { resetPromoForm(); showPromoForm.value = true }
function openEditPromo(p: Promo) { promoForm.value = { title: p.title, description: p.description, discountType: p.discountType, discountValue: p.discountValue, code: p.code, minPurchase: p.minPurchase }; editingPromoId.value = p.id; showPromoForm.value = true }
function handleSavePromo() {
  const f = promoForm.value
  if (!f.title.trim() || !f.description.trim() || !f.code.trim() || f.discountValue <= 0) { alert('Isi semua field promo dengan benar!'); return }
  if (editingPromoId.value) { updatePromo(editingPromoId.value, f); alert('Promo berhasil diubah! Database berhasil diperbarui.') }
  else { createPromo(f); alert('Promo berhasil ditambahkan! Database berhasil diperbarui.') }
  showPromoForm.value = false; resetPromoForm(); promos.value = getPromos()
}
function handleDeletePromo(id: string) {
  if (!confirm('Hapus promo ini?')) return
  deletePromo(id); alert('Promo berhasil dihapus! Database berhasil diperbarui.'); promos.value = getPromos()
}
function handleTogglePromo(p: Promo) {
  updatePromo(p.id, { isActive: !p.isActive })
  promos.value = getPromos()
}

const users = ref<User[]>(getUsers())
const showSeedUsers = ref(false)
const realUsers = computed(() => showSeedUsers.value ? users.value : users.value.filter(u => !u.isSeed))
const markets = ref<Market[]>(getMarkets())
const commodities = ref<Commodity[]>(getCommodities())
const marketPrices = ref<MarketPrice[]>(getMarketPrices())
const orders = ref<Order[]>(getOrders())
const products = ref<Product[]>(getProducts())
const payments = ref<Payment[]>(getPayments())
const shippings = ref<Shipping[]>(getShippings())
const allReviews = ref<Review[]>(getAllReviews())
const report = computed(() => getTransactionReport())

const showUserForm = ref(false)
const showMarketForm = ref(false)
const showCommodityForm = ref(false)
const showBulkPrice = ref(false)
const bulkPriceText = ref('')
const newUser = ref({ email:'', phone:'', password:'', name:'', role:'pembeli' as UserRole, location:'' })
const confirmPassword = ref('')
const newMarket = ref({ name:'', city:'', province:'', type:'tradisional', latitude:-6.2, longitude:106.8 })
const newCommodity = ref({ name:'', category:'', unit:'kg', image:'', description:'' })

function formatPrice(p: number): string { return new Intl.NumberFormat('id-ID').format(p) }
function statusLabel(s: string): string {
  const m: Record<string,string> = { pending:'Menunggu', confirmed:'Dikonfirmasi', shipped:'Dikirim', delivered:'Selesai', cancelled:'Dibatalkan', expired:'Kadaluarsa' }
  return m[s] || s
}

function reloadAll() {
  users.value = getUsers()
  markets.value = getMarkets()
  commodities.value = getCommodities()
  marketPrices.value = getMarketPrices()
  orders.value = getOrders()
  products.value = getProducts()
  payments.value = getPayments()
  shippings.value = getShippings()
  allReviews.value = getAllReviews()
  promos.value = getPromos()
}

function handleCreateUser() {
  if (!newUser.value.password || newUser.value.password.length < 4) { alert('Password minimal 4 karakter'); return }
  if (newUser.value.password !== confirmPassword.value) { alert('Password dan konfirmasi password tidak cocok'); return }
  createUser(newUser.value); newUser.value = { email:'', phone:'', password:'', name:'', role:'pembeli', location:'' }; confirmPassword.value = ''; showUserForm.value = false; reloadAll()
}
function handleCreateMarket() { createMarket(newMarket.value); newMarket.value = { name:'', city:'', province:'', type:'tradisional', latitude:-6.2, longitude:106.8 }; showMarketForm.value = false; reloadAll() }
function handleDeleteMarket(id: string) { if (confirm('Hapus pasar?')) { deleteMarket(id); reloadAll() } }
function handleCreateCommodity() { createCommodity(newCommodity.value); newCommodity.value = { name:'', category:'', unit:'kg', image:'', description:'' }; showCommodityForm.value = false; reloadAll() }
function handleDeleteCommodity(id: string) { if (confirm('Hapus komoditas?')) { deleteCommodity(id); reloadAll() } }

function handleToggleUser(id: string) { toggleUserActive(id); reloadAll() }
function handleDeleteUser(id: string) { if (confirm('Hapus pengguna ini secara permanen? Semua data terkait akan ikut terhapus.')) { deleteUser(id); reloadAll() } }
function handleDeleteOrder(id: string) { if (confirm('Hapus transaksi ini?')) { deleteOrder(id); reloadAll() } }

function handleDeleteReview(id: string) { if (confirm('Hapus ulasan ini?')) { deleteReview(id); reloadAll() } }

function handleBulkPrice() {
  const lines = bulkPriceText.value.trim().split('\n')
  const data: { commodityId: string; marketId: string; avgPrice: number; minPrice: number; maxPrice: number; trend: 'up'|'down'|'stable' }[] = []
  for (const line of lines) {
    const parts = line.split(',')
    if (parts.length >= 3) {
      const com = commodities.value.find(c => c.name.toLowerCase() === parts[0].trim().toLowerCase())
      const mkt = markets.value.find(m => m.name.toLowerCase().includes(parts[1].trim().toLowerCase()))
      if (com && mkt) {
        const avg = parseInt(parts[2].trim())
        data.push({ commodityId: com.id, marketId: mkt.id, avgPrice: avg, minPrice: Math.round(avg * 0.8), maxPrice: Math.round(avg * 1.2), trend: 'stable' })
      }
    }
  }
  if (data.length > 0) {
    const count = bulkUpsertMarketPrice(data)
    alert(`${count} harga berhasil diupload!`)
    bulkPriceText.value = ''
    showBulkPrice.value = false
    reloadAll()
  } else { alert('Tidak ada data valid. Format: NamaKomoditas,NamaPasar,Harga') }
}

const totalRevenue = computed(() => report.value.totalRevenue)
const totalOrders = computed(() => report.value.totalOrders)

function printUsersPDF() {
  const rows = realUsers.value.map(u =>
    `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.location}</td><td>${u.isVerified ? 'Terverifikasi' : 'Pending'}</td><td>${u.isActive ? 'Aktif' : 'Nonaktif'}</td></tr>`
  ).join('')
  const html = `
    <html><head><title>Laporan Pengguna</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h2 { text-align: center; margin-bottom: 5px; }
      p { text-align: center; color: #666; margin-top: 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; font-size: 12px; }
      th { background: #28a745; color: #fff; }
    </style></head><body>
    <h2>Laporan Pengguna AgriMarket</h2>
    <p>Total: ${realUsers.value.length} pengguna — ${new Date().toLocaleDateString('id-ID')}</p>
    <table><thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Lokasi</th><th>Verifikasi</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
    </body></html>`
  const w = window.open('', '_blank')
  if (w) { w.document.write(html); w.document.close(); w.print() }
}
function exportCSV() {
  const headers = ['ID Pesanan', 'Pembeli', 'Total', 'Status', 'Tanggal']
  const rows = orders.value.map(o => [
    o.id.slice(-6).toUpperCase(),
    users.value.find(u => u.id === o.buyerId)?.name || o.buyerId,
    o.totalPrice,
    o.status,
    new Date(o.createdAt).toLocaleDateString('id-ID')
  ])
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'laporan-transaksi-' + new Date().toISOString().slice(0,10) + '.csv'
  a.click(); URL.revokeObjectURL(url)
}
function exportUsersCSV() {
  const headers = ['Nama', 'Email', 'Role', 'Lokasi', 'Status', 'Aktif']
  const rows = realUsers.value.map(u => [u.name, u.email, u.role, u.location, u.isVerified ? 'Terverifikasi' : 'Pending', u.isActive ? 'Aktif' : 'Nonaktif'])
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'laporan-pengguna-' + new Date().toISOString().slice(0,10) + '.csv'
  a.click(); URL.revokeObjectURL(url)
}
function exportPricesCSV() {
  const headers = ['Komoditas', 'Pasar', 'Harga Rata-rata', 'Harga Min', 'Harga Max', 'Trend']
  const rows = marketPrices.value.map(mp => [
    commodities.value.find(c => c.id === mp.commodityId)?.name || mp.commodityId,
    markets.value.find(m => m.id === mp.marketId)?.name || mp.marketId,
    mp.avgPrice, mp.minPrice, mp.maxPrice,
    mp.trend === 'up' ? 'Naik' : mp.trend === 'down' ? 'Turun' : 'Stabil'
  ])
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'laporan-harga-pasar-' + new Date().toISOString().slice(0,10) + '.csv'
  a.click(); URL.revokeObjectURL(url)
}

function handleAvatarUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      await updateProfile({ avatar: e.target?.result as string })
    }
    reader.readAsDataURL(target.files[0])
  }
}
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex align-items-center gap-3">
        <div class="position-relative" style="cursor:pointer" @click="adminAvatarRef?.click()">
          <div v-if="user?.avatar" class="rounded-circle overflow-hidden" style="width: 50px; height: 50px;">
            <img :src="user.avatar" style="width:100%;height:100%;object-fit:cover">
          </div>
          <div v-else class="bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center rounded-circle fw-bold" style="width: 50px; height: 50px; font-size: 1.5rem;">
            {{ user?.name?.charAt(0)?.toUpperCase() || '?' }}
          </div>
          <div class="position-absolute bottom-0 end-0 bg-dark bg-opacity-75 text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 18px; height: 18px; font-size: 0.6rem;">
            <i class="bi bi-camera"></i>
          </div>
          <input type="file" accept="image/*" class="d-none" ref="adminAvatarRef" @change="handleAvatarUpload">
        </div>
        <div>
          <h2 class="fw-bold mb-0"><i class="bi bi-shield-lock text-success me-2"></i>Dashboard Admin</h2>
          <p class="text-muted mb-0">Manajemen penuh platform AgriMarket</p>
        </div>
      </div>
      <button class="btn btn-outline-success" @click="handleSync" :disabled="syncing">
        <i class="bi bi-arrow-repeat me-1" :class="{ 'spin': syncing }"></i>{{ syncing ? 'Menyinkronkan...' : 'Sync Database' }}
      </button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3 col-6"><div class="card bg-primary text-white shadow-sm h-100"><div class="card-body text-center py-3"><div class="fs-3 fw-bold">{{ realUsers.length }}</div><div class="small opacity-75">Pengguna</div></div></div></div>
      <div class="col-md-3 col-6"><div class="card bg-success text-white shadow-sm h-100"><div class="card-body text-center py-3"><div class="fs-3 fw-bold">{{ commodities.length }}</div><div class="small opacity-75">Komoditas</div></div></div></div>
      <div class="col-md-3 col-6"><div class="card bg-warning text-dark shadow-sm h-100"><div class="card-body text-center py-3"><div class="fs-3 fw-bold">{{ markets.length }}</div><div class="small opacity-75">Pasar</div></div></div></div>
      <div class="col-md-3 col-6"><div class="card bg-info text-white shadow-sm h-100"><div class="card-body text-center py-3"><div class="fs-3 fw-bold">Rp{{ formatPrice(totalRevenue) }}</div><div class="small opacity-75">Total Transaksi</div></div></div></div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item"><button class="nav-link" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'"><i class="bi bi-grid"></i> Overview</button></li>
          <li class="nav-item"><button class="nav-link" :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'"><i class="bi bi-people"></i> User</button></li>
          <li class="nav-item"><button class="nav-link" :class="{ active: activeTab === 'markets' }" @click="activeTab = 'markets'"><i class="bi bi-shop"></i> Pasar</button></li>
          <li class="nav-item"><button class="nav-link" :class="{ active: activeTab === 'commodities' }" @click="activeTab = 'commodities'"><i class="bi bi-box"></i> Komoditas</button></li>
          <li class="nav-item"><button class="nav-link" :class="{ active: activeTab === 'prices' }" @click="activeTab = 'prices'"><i class="bi bi-graph-up"></i> Harga</button></li>
          <li class="nav-item"><button class="nav-link" :class="{ active: activeTab === 'transactions' }" @click="activeTab = 'transactions'"><i class="bi bi-cart"></i> Transaksi</button></li>
          <li class="nav-item"><button class="nav-link" :class="{ active: activeTab === 'reviews' }" @click="activeTab = 'reviews'"><i class="bi bi-star"></i> Ulasan</button></li>
          <li class="nav-item"><button class="nav-link" :class="{ active: activeTab === 'promo' }" @click="activeTab = 'promo'"><i class="bi bi-megaphone"></i> Promo</button></li>
        </ul>
      </div>

      <div class="card-body p-0">
        <div v-if="activeTab === 'overview'" class="p-3">
          <div class="card border-0 shadow-sm mb-3">
            <div class="card-header bg-white fw-bold"><i class="bi bi-graph-up text-info me-2"></i>Harga Pasar Terkini</div>
            <div class="card-body p-2">
              <div class="row g-1">
                <div v-for="c in commodities.slice(0, 8)" :key="c.id" class="col-md-3 col-6">
                  <div class="d-flex align-items-center gap-2 p-2 rounded-3" style="background:#f8f9fa">
                    <span class="fs-4">{{ c.image }}</span>
                    <div class="small lh-sm">
                      <div class="fw-semibold">{{ c.name }}</div>
                      <div class="text-success fw-bold">Rp{{ formatPrice(getAvgPriceByCommodity(c.id)) }}/{{ c.unit }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-6">
              <h6 class="fw-bold">Transaksi Terbaru</h6>
              <div v-for="o in orders.slice(0, 5)" :key="o.id" class="d-flex justify-content-between border-bottom py-2">
                <span>#{{ o.id.slice(-6).toUpperCase() }}</span>
                <span class="badge" :class="o.status === 'delivered' ? 'bg-success' : o.status === 'pending' ? 'bg-warning' : o.status === 'expired' ? 'bg-dark' : 'bg-info'">{{ o.status }}</span>
                <span class="fw-bold">Rp{{ formatPrice(o.totalPrice) }}</span>
              </div>
            </div>
            <div class="col-md-6">
              <h6 class="fw-bold">Ringkasan</h6>
              <div class="p-3 bg-light rounded-3">
                <div class="d-flex justify-content-between mb-2"><span>Total Pesanan</span><span class="fw-bold">{{ totalOrders }}</span></div>
                <div class="d-flex justify-content-between mb-2"><span>Total Pendapatan</span><span class="fw-bold text-success">Rp{{ formatPrice(totalRevenue) }}</span></div>
                <div class="d-flex justify-content-between mb-2"><span>Total Produk</span><span class="fw-bold">{{ products.length }}</span></div>
                <div class="d-flex justify-content-between mb-2"><span>Total Pengguna</span><span class="fw-bold">{{ realUsers.length }}</span></div>
                <div class="d-flex justify-content-between mb-2"><span>Total Petani</span><span class="fw-bold">{{ realUsers.filter(u => u.role === 'petani').length }}</span></div>
                <div class="d-flex justify-content-between mb-2"><span>Total Pembeli</span><span class="fw-bold">{{ realUsers.filter(u => u.role === 'pembeli').length }}</span></div>
                <div class="d-flex justify-content-between mb-2"><span>Total Komoditas</span><span class="fw-bold">{{ commodities.length }}</span></div>
                <div class="d-flex justify-content-between mb-2"><span>Total Pasar</span><span class="fw-bold">{{ markets.length }}</span></div>
                <div class="d-flex justify-content-between"><span>Rata-rata Pesanan</span><span class="fw-bold">Rp{{ formatPrice(totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0) }}</span></div>
              </div>
              <div class="mt-2 d-flex gap-2 flex-wrap">
                <button class="btn btn-sm btn-success" @click="exportCSV"><i class="bi bi-download"></i> Export Transaksi</button>
                <button class="btn btn-sm btn-info text-white" @click="exportPricesCSV"><i class="bi bi-download"></i> Export Harga</button>
                <button class="btn btn-sm btn-primary" @click="exportUsersCSV"><i class="bi bi-download"></i> Export Pengguna</button>
                <router-link to="/laporan" class="btn btn-sm btn-outline-success"><i class="bi bi-file-text"></i> Laporan Detail</router-link>
              </div>
            </div>
          </div>
          <div class="row g-3 mt-2">
            <div class="col-md-6">
              <h6 class="fw-bold">Statistik Produk</h6>
              <div class="p-3 bg-light rounded-3">
                <div class="d-flex justify-content-between mb-2"><span>Total Produk</span><span class="fw-bold">{{ products.length }}</span></div>
                <div class="d-flex justify-content-between mb-2"><span>Produk Tersedia</span><span class="fw-bold text-success">{{ products.filter(p => p.isAvailable).length }}</span></div>
                <div class="d-flex justify-content-between mb-2"><span>Produk Habis</span><span class="fw-bold text-danger">{{ products.filter(p => !p.isAvailable || p.stock <= 0).length }}</span></div>
                <div class="d-flex justify-content-between mb-2"><span>Total Petani</span><span class="fw-bold">{{ new Set(products.map(p => p.farmerId)).size }}</span></div>
                <div class="d-flex justify-content-between"><span>Rata-rata Harga</span><span class="fw-bold">Rp{{ formatPrice(products.length > 0 ? Math.round(products.reduce((s, p) => s + p.price, 0) / products.length) : 0) }}</span></div>
              </div>
            </div>
            <div class="col-md-6">
              <h6 class="fw-bold">Statistik Transaksi</h6>
              <div class="p-3 bg-light rounded-3">
                <div class="d-flex justify-content-between mb-2"><span>Total Pesanan</span><span class="fw-bold">{{ totalOrders }}</span></div>
                <div class="d-flex justify-content-between mb-2"><span>Selesai</span><span class="fw-bold text-success">{{ orders.filter(o => o.status === 'delivered').length }}</span></div>
                <div class="d-flex justify-content-between mb-2"><span>Diproses</span><span class="fw-bold text-info">{{ orders.filter(o => o.status === 'confirmed' || o.status === 'shipped').length }}</span></div>
                <div class="d-flex justify-content-between mb-2"><span>Menunggu</span><span class="fw-bold text-warning">{{ orders.filter(o => o.status === 'pending').length }}</span></div>
                <div class="d-flex justify-content-between"><span>Dibatalkan/Kadaluarsa</span><span class="fw-bold text-danger">{{ orders.filter(o => o.status === 'cancelled' || o.status === 'expired').length }}</span></div>
              </div>
            </div>
          </div>
          <div class="row g-3 mt-2">
            <div class="col-md-12">
              <h6 class="fw-bold">Statistik Harga Pasar</h6>
              <div class="p-3 bg-light rounded-3">
                <div class="row g-2">
                  <div class="col-md-3"><div class="d-flex justify-content-between"><span>Total Data Harga</span><span class="fw-bold">{{ marketPrices.length }}</span></div></div>
                  <div class="col-md-3"><div class="d-flex justify-content-between"><span>Komoditas</span><span class="fw-bold">{{ commodities.length }}</span></div></div>
                  <div class="col-md-3"><div class="d-flex justify-content-between"><span>Pasar</span><span class="fw-bold">{{ markets.length }}</span></div></div>
                  <div class="col-md-3"><div class="d-flex justify-content-between"><span>Trend Naik</span><span class="fw-bold text-danger">{{ marketPrices.filter(mp => mp.trend === 'up').length }}</span></div></div>
                  <div class="col-md-3"><div class="d-flex justify-content-between"><span>Trend Turun</span><span class="fw-bold text-success">{{ marketPrices.filter(mp => mp.trend === 'down').length }}</span></div></div>
                  <div class="col-md-3"><div class="d-flex justify-content-between"><span>Trend Stabil</span><span class="fw-bold text-secondary">{{ marketPrices.filter(mp => mp.trend === 'stable').length }}</span></div></div>
                  <div class="col-md-3"><div class="d-flex justify-content-between"><span>Harga Tertinggi</span><span class="fw-bold text-danger">Rp{{ formatPrice(Math.max(...marketPrices.map(mp => mp.avgPrice), 0)) }}</span></div></div>
                  <div class="col-md-3"><div class="d-flex justify-content-between"><span>Harga Terendah</span><span class="fw-bold text-success">Rp{{ formatPrice(Math.min(...marketPrices.map(mp => mp.avgPrice), 0)) }}</span></div></div>
                </div>
              </div>
              <div class="table-responsive mt-2">
                <table class="table table-sm table-bordered mb-0">
                  <thead class="table-info"><tr><th>Komoditas</th><th class="text-end">Rata-rata</th><th class="text-end">Tertinggi</th><th class="text-end">Terendah</th><th class="text-center">Trend</th></tr></thead>
                  <tbody>
                    <tr v-for="c in commodities" :key="c.id">
                      <td><span class="fw-semibold">{{ c.image }} {{ c.name }}</span></td>
                      <td class="text-end fw-bold">Rp{{ formatPrice(getAvgPriceByCommodity(c.id)) }}</td>
                      <td class="text-end text-danger">Rp{{ formatPrice(Math.max(...marketPrices.filter(mp => mp.commodityId === c.id).map(mp => mp.avgPrice), 0)) }}</td>
                      <td class="text-end text-success">Rp{{ formatPrice(Math.min(...marketPrices.filter(mp => mp.commodityId === c.id).map(mp => mp.avgPrice), 0)) }}</td>
                      <td class="text-center">
                        <span v-if="marketPrices.filter(mp => mp.commodityId === c.id).filter(mp => mp.trend === 'up').length > marketPrices.filter(mp => mp.commodityId === c.id).filter(mp => mp.trend === 'down').length" class="badge bg-danger">Naik</span>
                        <span v-else-if="marketPrices.filter(mp => mp.commodityId === c.id).filter(mp => mp.trend === 'down').length > marketPrices.filter(mp => mp.commodityId === c.id).filter(mp => mp.trend === 'up').length" class="badge bg-success">Turun</span>
                        <span v-else class="badge bg-secondary">Stabil</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'users'" class="p-3">
          <div class="d-flex justify-content-between mb-3">
            <span class="fw-bold">Daftar Pengguna ({{ realUsers.length }})</span>
            <div class="d-flex gap-2 flex-wrap">
              <button class="btn btn-sm btn-outline-primary" @click="handleSyncUsers" :disabled="syncing"><i class="bi bi-cloud-upload me-1"></i>Sync User ke DB</button>
              <button class="btn btn-sm btn-success" @click="showUserForm = !showUserForm"><i class="bi bi-plus"></i> Tambah</button>
              <button class="btn btn-sm btn-primary" @click="exportUsersCSV"><i class="bi bi-download"></i> Export CSV</button>
              <button class="btn btn-sm btn-danger" @click="printUsersPDF"><i class="bi bi-filetype-pdf"></i> PDF</button>
              <button class="btn btn-sm btn-outline-secondary" @click="showSeedUsers = !showSeedUsers"><i class="bi" :class="showSeedUsers ? 'bi-eye' : 'bi-eye-slash'"></i> Demo</button>
            </div>
          </div>
          <div v-if="syncMsg" class="alert alert-info py-2 small">{{ syncMsg }}</div>
          <div v-if="showUserForm" class="card mb-3">
            <div class="card-body">
              <div class="row g-2">
                <div class="col-md-3"><input v-model="newUser.name" class="form-control" placeholder="Nama"></div>
                <div class="col-md-3"><input v-model="newUser.email" class="form-control" placeholder="Email"></div>
                <div class="col-md-2"><input v-model="newUser.phone" class="form-control" placeholder="Telp"></div>
                <div class="col-md-2"><select v-model="newUser.role" class="form-select"><option value="pembeli">Pembeli</option><option value="petani">Petani</option><option value="admin">Admin</option></select></div>
                <div class="col-md-2"><input v-model="newUser.location" class="form-control" placeholder="Lokasi"></div>
                <div class="col-md-3"><input v-model="newUser.password" class="form-control" type="password" placeholder="Password"></div>
                <div class="col-md-3"><input v-model="confirmPassword" class="form-control" type="password" placeholder="Konfirmasi Password"></div>
              </div>
              <button class="btn btn-success btn-sm mt-2" @click="handleCreateUser"><i class="bi bi-check"></i> Simpan</button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-success"><tr><th>Nama</th><th>Email</th><th>Role</th><th>Lokasi</th><th>Status</th><th>Aktif</th><th>Aksi</th></tr></thead>
              <tbody>
                <tr v-for="u in realUsers" :key="u.id">
                  <td class="fw-semibold">{{ u.name }}</td><td>{{ u.email }}</td>
                  <td><span class="badge" :class="u.role==='admin'?'bg-danger':u.role==='petani'?'bg-success':'bg-primary'">{{ u.role }}</span></td>
                  <td>{{ u.location }}</td>
                  <td><span :class="'badge bg-' + (u.isVerified ? 'success' : 'warning')">{{ u.isVerified ? 'Terverifikasi' : 'Pending' }}</span></td>
                  <td><span :class="'badge bg-' + (u.isActive ? 'success' : 'danger')">{{ u.isActive ? 'Aktif' : 'Nonaktif' }}</span></td>
                  <td>
                    <div class="d-flex gap-1">
                      <button class="btn btn-sm" :class="u.isActive ? 'btn-outline-danger' : 'btn-outline-success'" @click="handleToggleUser(u.id)">
                        <i :class="u.isActive ? 'bi bi-ban' : 'bi bi-check-circle'"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" @click="handleDeleteUser(u.id)" title="Hapus permanen">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

          <div v-if="activeTab === 'markets'" class="p-3">
            <div class="d-flex justify-content-between mb-3">
              <span class="fw-bold">Daftar Pasar ({{ markets.length }})</span>
              <button class="btn btn-sm btn-success" @click="showMarketForm = !showMarketForm"><i class="bi bi-plus"></i> Tambah</button>
            </div>
            <div v-if="showMarketForm" class="card mb-3">
              <div class="card-body">
                <div class="row g-2">
                  <div class="col-md-3"><input v-model="newMarket.name" class="form-control" placeholder="Nama pasar"></div>
                  <div class="col-md-2"><input v-model="newMarket.city" class="form-control" placeholder="Kota"></div>
                  <div class="col-md-2"><input v-model="newMarket.province" class="form-control" placeholder="Provinsi"></div>
                  <div class="col-md-2"><select v-model="newMarket.type" class="form-select"><option value="tradisional">Tradisional</option><option value="induk">Induk</option></select></div>
                </div>
                <button class="btn btn-success btn-sm mt-2" @click="handleCreateMarket"><i class="bi bi-check"></i> Simpan</button>
              </div>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-success"><tr><th>Nama Pasar</th><th>Kota</th><th>Provinsi</th><th>Tipe</th><th>Data Harga</th><th>Aksi</th></tr></thead>
                <tbody>
                  <tr v-for="m in markets" :key="m.id">
                    <td class="fw-semibold">{{ m.name }}</td><td>{{ m.city }}</td><td>{{ m.province }}</td>
                    <td><span class="badge bg-secondary">{{ m.type }}</span></td>
                    <td class="text-center"><span class="badge bg-info">{{ marketPrices.filter(mp => mp.marketId === m.id).length }}</span></td>
                    <td><button class="btn btn-sm btn-outline-danger" @click="handleDeleteMarket(m.id)"><i class="bi bi-trash"></i></button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="activeTab === 'commodities'" class="p-3">
            <div class="d-flex justify-content-between mb-3">
              <span class="fw-bold">Daftar Komoditas ({{ commodities.length }})</span>
              <button class="btn btn-sm btn-success" @click="showCommodityForm = !showCommodityForm"><i class="bi bi-plus"></i> Tambah</button>
            </div>
            <div v-if="showCommodityForm" class="card mb-3">
              <div class="card-body">
                <div class="row g-2">
                  <div class="col-md-3"><input v-model="newCommodity.name" class="form-control" placeholder="Nama"></div>
                  <div class="col-md-2"><input v-model="newCommodity.category" class="form-control" placeholder="Kategori"></div>
                  <div class="col-md-1"><input v-model="newCommodity.unit" class="form-control" placeholder="Unit"></div>
                  <div class="col-md-4"><input v-model="newCommodity.description" class="form-control" placeholder="Deskripsi"></div>
                </div>
                <button class="btn btn-success btn-sm mt-2" @click="handleCreateCommodity"><i class="bi bi-check"></i> Simpan</button>
              </div>
            </div>
            <div v-for="c in commodities" :key="c.id" class="card border-0 shadow-sm mb-2">
              <div class="card-header bg-white d-flex justify-content-between align-items-center fw-bold">
                <span>{{ c.image }} {{ c.name }} <span class="text-muted small fw-normal">({{ c.category }} &middot; {{ c.unit }})</span></span>
                <div class="d-flex gap-1">
                  <span class="badge bg-success fs-6">Rp{{ formatPrice(getAvgPriceByCommodity(c.id)) }}/{{ c.unit }}</span>
                  <button class="btn btn-sm btn-outline-danger" @click="handleDeleteCommodity(c.id)"><i class="bi bi-trash"></i></button>
                </div>
              </div>
              <div class="card-body p-0">
                <table class="table table-sm table-bordered mb-0">
                  <thead class="table-info"><tr><th>Pasar</th><th class="text-end">Rata-rata</th><th class="text-end">Min</th><th class="text-end">Max</th><th class="text-center">Trend</th></tr></thead>
                  <tbody>
                    <tr v-for="mp in marketPrices.filter(mp => mp.commodityId === c.id)" :key="mp.id">
                      <td>{{ markets.find(m => m.id === mp.marketId)?.name || mp.marketId }}</td>
                      <td class="text-end fw-bold">Rp{{ formatPrice(mp.avgPrice) }}</td>
                      <td class="text-end text-muted">Rp{{ formatPrice(mp.minPrice) }}</td>
                      <td class="text-end text-muted">Rp{{ formatPrice(mp.maxPrice) }}</td>
                      <td class="text-center">
                        <span v-if="mp.trend==='up'" class="badge bg-danger">Naik</span>
                        <span v-else-if="mp.trend==='down'" class="badge bg-success">Turun</span>
                        <span v-else class="badge bg-secondary">Stabil</span>
                      </td>
                    </tr>
                    <tr v-if="marketPrices.filter(mp => mp.commodityId === c.id).length === 0">
                      <td colspan="5" class="text-center text-muted py-3">Belum ada data harga untuk komoditas ini</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        <div v-if="activeTab === 'prices'" class="p-3">
          <div class="d-flex justify-content-between mb-3">
            <span class="fw-bold">Data Harga ({{ marketPrices.length }})</span>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-info text-white" @click="exportPricesCSV"><i class="bi bi-download"></i> Export CSV</button>
              <button class="btn btn-sm btn-success" @click="showBulkPrice = !showBulkPrice"><i class="bi bi-upload"></i> Upload Bulk</button>
            </div>
          </div>
          <div v-if="showBulkPrice" class="card mb-3">
            <div class="card-body">
              <label class="form-label fw-semibold">Upload Harga Bulk</label>
              <p class="text-muted small">Format: NamaKomoditas,NamaPasar,Harga (setiap baris = 1 data)</p>
              <textarea v-model="bulkPriceText" class="form-control" rows="5" placeholder="Beras Premium,Pasar Induk Kramat Jati,14500&#10;Beras Medium,Pasar Induk Kramat Jati,12000&#10;Cabai Merah Keriting,Pasar Caringin,42000"></textarea>
              <button class="btn btn-success btn-sm mt-2" @click="handleBulkPrice"><i class="bi bi-cloud-upload"></i> Upload</button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-success"><tr><th>Komoditas</th><th>Pasar</th><th class="text-end">Rata-rata</th><th class="text-end">Min</th><th class="text-end">Max</th><th class="text-center">Trend</th></tr></thead>
              <tbody>
                <tr v-for="mp in marketPrices.slice(0, 50)" :key="mp.id">
                  <td>{{ commodities.find(c => c.id === mp.commodityId)?.name || mp.commodityId }}</td>
                  <td>{{ markets.find(m => m.id === mp.marketId)?.name || mp.marketId }}</td>
                  <td class="text-end fw-bold">Rp{{ formatPrice(mp.avgPrice) }}</td>
                  <td class="text-end text-muted">Rp{{ formatPrice(mp.minPrice) }}</td>
                  <td class="text-end text-muted">Rp{{ formatPrice(mp.maxPrice) }}</td>
                  <td class="text-center">
                    <span v-if="mp.trend==='up'" class="badge bg-danger">Naik</span>
                    <span v-else-if="mp.trend==='down'" class="badge bg-success">Turun</span>
                    <span v-else class="badge bg-secondary">Stabil</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="text-muted small text-center py-2">Menampilkan 50 dari {{ marketPrices.length }} data harga. <button class="btn btn-sm btn-link p-0 text-decoration-underline" @click="exportPricesCSV">Export semua ke CSV</button></div>
        </div>

        <div v-if="activeTab === 'transactions'" class="p-3">
          <div class="d-flex justify-content-between mb-3">
            <span class="fw-bold">Transaksi ({{ orders.length }})</span>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-success"><tr><th>ID</th><th>Pembeli</th><th>Petani</th><th>Total</th><th>Pembayaran</th><th>Status</th><th>Pengiriman</th><th>Aksi</th></tr></thead>
              <tbody>
                <tr v-for="o in orders" :key="o.id">
                  <td class="fw-semibold">#{{ o.id.slice(-6).toUpperCase() }}</td>
                  <td>{{ users.find(u => u.id === o.buyerId)?.name || o.buyerId }}</td>
                  <td>{{ users.find(u => u.id === o.farmerId)?.name || o.farmerId }}</td>
                  <td class="fw-bold text-success">Rp{{ formatPrice(o.totalPrice) }}</td>
                  <td>
                    <span :class="'badge bg-' + (payments.find(p => p.orderId === o.id)?.status === 'verified' ? 'success' : payments.find(p => p.orderId === o.id)?.status === 'rejected' ? 'danger' : 'warning')">
                      {{ payments.find(p => p.orderId === o.id)?.status === 'verified' ? 'Lunas' : payments.find(p => p.orderId === o.id)?.status === 'rejected' ? 'Ditolak' : payments.find(p => p.orderId === o.id)?.proofImage ? 'Menunggu Verifikasi' : 'Belum bayar' }}
                    </span>
                  </td>
                  <td><span class="badge" :class="o.status==='delivered'?'bg-success':o.status==='cancelled'?'bg-danger':o.status==='expired'?'bg-dark':o.status==='confirmed'?'bg-info':o.status==='shipped'?'bg-primary':'bg-warning'">{{ statusLabel(o.status) }}</span></td>
                  <td>
                    <span v-if="shippings.find(s => s.orderId === o.id)" class="badge bg-primary">{{ shippings.find(s => s.orderId === o.id)?.status }}</span>
                    <span v-else class="text-muted small">Belum dikirim</span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-outline-danger" @click="handleDeleteOrder(o.id)" title="Hapus transaksi"><i class="bi bi-trash"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="activeTab === 'promo'" class="p-3">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0"><i class="bi bi-megaphone text-warning me-2"></i>Mengelola Data Promo ({{ promos.length }})</h5>
            <button class="btn btn-success" @click="openAddPromo"><i class="bi bi-plus-lg me-1"></i>Tambah Promo</button>
          </div>

          <div v-if="showPromoForm" class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <h6 class="fw-semibold mb-3">{{ editingPromoId ? 'Edit Promo' : 'Promo Baru' }}</h6>
              <div class="row g-2">
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Judul Promo</label>
                  <input v-model="promoForm.title" class="form-control" placeholder="cth: Diskon Spesial">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Jenis Diskon</label>
                  <select v-model="promoForm.discountType" class="form-select">
                    <option value="percentage">Persen (%)</option>
                    <option value="nominal">Nominal (Rp)</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Nilai Diskon</label>
                  <input v-model.number="promoForm.discountValue" type="number" class="form-control" placeholder="10" min="0">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Kode Promo</label>
                  <input v-model="promoForm.code" class="form-control" placeholder="cth: DISKON10" style="text-transform:uppercase">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Min. Belanja (Rp)</label>
                  <input v-model.number="promoForm.minPurchase" type="number" class="form-control" placeholder="0 = tanpa minimal" min="0">
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold">Deskripsi Promo</label>
                  <textarea v-model="promoForm.description" class="form-control" rows="2" placeholder="Deskripsi promo..."></textarea>
                </div>
              </div>
              <div class="mt-3 d-flex gap-2">
                <button class="btn btn-success" @click="handleSavePromo"><i class="bi bi-check me-1"></i>{{ editingPromoId ? 'Simpan Perubahan' : 'Tambah Promo' }}</button>
                <button class="btn btn-secondary" @click="showPromoForm = false; resetPromoForm()">Batal</button>
              </div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-warning">
                <tr><th>Kode</th><th>Judul</th><th>Diskon</th><th>Min. Belanja</th><th>Status</th><th>Dibuat</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                <tr v-for="p in promos" :key="p.id">
                  <td><span class="badge bg-dark">{{ p.code }}</span></td>
                  <td class="fw-semibold">{{ p.title }}</td>
                  <td>{{ p.discountType === 'percentage' ? p.discountValue + '%' : 'Rp' + p.discountValue.toLocaleString('id-ID') }}</td>
                  <td>{{ p.minPurchase > 0 ? 'Rp' + p.minPurchase.toLocaleString('id-ID') : '-' }}</td>
                  <td>
                    <span :class="'badge ' + (p.isActive ? 'bg-success' : 'bg-secondary')" style="cursor:pointer" @click="handleTogglePromo(p)">
                      {{ p.isActive ? 'Aktif' : 'Nonaktif' }}
                    </span>
                  </td>
                  <td><small class="text-muted">{{ new Date(p.createdAt).toLocaleDateString('id-ID') }}</small></td>
                  <td>
                    <button class="btn btn-sm btn-outline-warning me-1" @click="openEditPromo(p)" title="Edit"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" @click="handleDeletePromo(p.id)" title="Hapus"><i class="bi bi-trash"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="promos.length === 0" class="text-center py-4 text-muted">Belum ada promo</div>
        </div>
        <div v-if="activeTab === 'reviews'" class="p-3">
          <div class="d-flex justify-content-between mb-3">
            <span class="fw-bold">Semua Ulasan ({{ allReviews.length }})</span>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-success"><tr><th>Produk</th><th>User</th><th>Rating</th><th>Komentar</th><th>Tanggal</th><th>Aksi</th></tr></thead>
              <tbody>
                <tr v-for="r in allReviews" :key="r.id">
                  <td>{{ products.find(p => p.id === r.productId)?.name || r.productId }}</td>
                  <td>{{ r.userName }}</td>
                  <td><span class="text-warning">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span></td>
                  <td>{{ r.comment }}</td>
                  <td>{{ new Date(r.createdAt).toLocaleDateString('id-ID') }}</td>
                  <td><button class="btn btn-sm btn-outline-danger" @click="handleDeleteReview(r.id)"><i class="bi bi-trash"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="allReviews.length === 0" class="text-center py-3 text-muted">Belum ada ulasan</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
