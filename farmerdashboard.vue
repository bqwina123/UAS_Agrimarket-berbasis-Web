<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/authService'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getProductsByFarmer, getOrdersByFarmer, getFarmerReport, getAvgPriceByCommodity, getCommodities, getMarketPrices, getMarkets, getNotifications, getUnreadCount, createProduct, updateProduct, deleteProduct, updateOrderStatus, getFarmlands, createFarmland, deleteFarmland, getPayments, getPaymentByOrder, farmerVerifyPayment, getOrder, getOrderItems, getReviewsByFarmer, getAvgRating, getProducts, getShippingByOrder, createShipping, addNotification, getPromos } from '@/services/db'
import type { Product, Order, FarmLand, ProductStatus } from '@/types'

const router = useRouter()
const { user, isLoggedIn, updateProfile } = useAuth()
if (!isLoggedIn.value) { router.push('/masuk'); }
const farmerId = computed(() => user.value?.id || '')
const refreshKey = ref(0)
const farmerAvatarRef = ref<HTMLElement | null>(null)
const products = computed(() => { void refreshKey.value; void farmerId.value; return getProductsByFarmer(farmerId.value) })
const orders = computed(() => { void refreshKey.value; void farmerId.value; return getOrdersByFarmer(farmerId.value) })
const farmlands = computed(() => { void refreshKey.value; void farmerId.value; return getFarmlands(farmerId.value) })
const report = computed(() => getFarmerReport(farmerId.value))
const commodities = computed(() => { void refreshKey.value; return getCommodities() })
const marketPrices = computed(() => { void refreshKey.value; return getMarketPrices() })
const markets = computed(() => { void refreshKey.value; return getMarkets() })
const notifications = computed(() => { void refreshKey.value; return getNotifications(farmerId.value) })
const unreadCount = computed(() => { void refreshKey.value; return getUnreadCount(farmerId.value) })

const activeTab = ref<'overview' | 'products' | 'orders' | 'land' | 'ulasan'>('overview')
const orderFilter = ref<'active' | 'history'>('active')
const activeOrders = computed(() => orders.value.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status)))
const historyOrders = computed(() => orders.value.filter(o => ['delivered', 'cancelled', 'expired'].includes(o.status)))
const activePromos = computed(() => getPromos().filter(p => p.isActive))
const orderData = computed(() => {
  const data: Record<string, { payment: ReturnType<typeof getPaymentByOrder>, items: ReturnType<typeof getOrderItems>, shipping: ReturnType<typeof getShippingByOrder>, order: ReturnType<typeof getOrder> }> = {}
  for (const o of orders.value) {
    data[o.id] = { payment: getPaymentByOrder(o.id), items: getOrderItems(o.id), shipping: getShippingByOrder(o.id), order: getOrder(o.id) }
  }
  return data
})

function reload() { refreshKey.value++ }

watch(activeTab, () => reload())

let pollTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => { pollTimer = setInterval(() => { if (!document.hidden) reload() }, 15000) })
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer) })

const showProductForm = ref(false)
const editProductId = ref<string | null>(null)
const newProduct = ref({ commodityId: '', name: '', description: '', price: 0, stock: 0, unit: 'kg', image: '', status: 'active' as ProductStatus })

const emojiList = ['🥕', '🌽', '🍚', '🌾', '🥬', '🍅', '🥔', '🧅', '🌶️', '🍌', '🥭', '🍊', '🥥', '🍋', '🧄', '🥜', '☕', '🌿']

function setProductEmoji(emoji: string) { newProduct.value.image = emoji }

function compressImage(base64: string, maxW = 800): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      let { width, height } = img
      if (width > maxW) { height *= maxW / width; width = maxW }
      c.width = width; c.height = height
      c.getContext('2d')!.drawImage(img, 0, 0, width, height)
      resolve(c.toDataURL('image/jpeg', 0.7))
    }
    img.src = base64
  })
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const reader = new FileReader()
    reader.onload = async (e) => { newProduct.value.image = await compressImage(e.target?.result as string) }
    reader.readAsDataURL(target.files[0])
  }
}

const showLandForm = ref(false)
const newLand = ref({ name: '', address: '', latitude: -7.5, longitude: 112.0, areaSize: 1, areaUnit: 'hektar' })
const mapContainer = ref<HTMLDivElement | null>(null)
let mapInstance: L.Map | null = null
let mapMarker: L.Marker | null = null

function destroyMap() {
  if (mapInstance) { mapInstance.remove(); mapInstance = null; mapMarker = null }
}

function initMap() {
  destroyMap()
  nextTick(() => {
    if (!mapContainer.value) return
    mapInstance = L.map(mapContainer.value, { center: [newLand.value.latitude, newLand.value.longitude], zoom: 10, zoomControl: true })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mapInstance)
    const icon = L.divIcon({ html: '📍', className: '', iconSize: [24, 24], iconAnchor: [12, 24] })
    mapMarker = L.marker([newLand.value.latitude, newLand.value.longitude], { draggable: true, icon }).addTo(mapInstance)
    mapMarker.on('dragend', () => {
      const p = mapMarker!.getLatLng()
      newLand.value.latitude = parseFloat(p.lat.toFixed(6))
      newLand.value.longitude = parseFloat(p.lng.toFixed(6))
    })
    mapInstance.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      newLand.value.latitude = parseFloat(lat.toFixed(6))
      newLand.value.longitude = parseFloat(lng.toFixed(6))
      if (mapMarker) mapMarker.setLatLng([lat, lng])
    })
    setTimeout(() => mapInstance?.invalidateSize(), 400)
  })
}

watch(showLandForm, (v) => { if (v) initMap(); else destroyMap() })

function formatPrice(p: number): string { return new Intl.NumberFormat('id-ID').format(p) }

function getMarketPriceAvg(commodityId: string): number { return getAvgPriceByCommodity(commodityId) }

function priceAdvice(commodityId: string, farmerPrice: number): string {
  const marketAvg = getMarketPriceAvg(commodityId)
  if (marketAvg === 0) return ''
  const diff = ((marketAvg - farmerPrice) / marketAvg) * 100
  if (diff < -20) return 'Harga terlalu rendah, naikkan!'
  if (diff > 10) return 'Harga kompetitif, lebih murah dari pasar'
  return 'Harga wajar'
}

function advBadge(commodityId: string, farmerPrice: number): string {
  const marketAvg = getMarketPriceAvg(commodityId)
  if (marketAvg === 0) return 'secondary'
  const diff = ((marketAvg - farmerPrice) / marketAvg) * 100
  if (diff < -20) return 'danger'
  if (diff > 10) return 'success'
  return 'info'
}

function getProductMarketPrices(commodityId: string) {
  return marketPrices.value.filter(mp => mp.commodityId === commodityId)
}
function minMarketPrice(commodityId: string): string {
  const a = getProductMarketPrices(commodityId).map(x => x.avgPrice)
  return a.length ? 'Rp' + formatPrice(Math.min(...a)) : '-'
}
function maxMarketPrice(commodityId: string): string {
  const a = getProductMarketPrices(commodityId).map(x => x.avgPrice)
  return a.length ? 'Rp' + formatPrice(Math.max(...a)) : '-'
}

function handleSaveProduct() {
  if (editProductId.value) {
    updateProduct(editProductId.value, newProduct.value)
    editProductId.value = null
  } else {
    createProduct({ ...newProduct.value, farmerId: farmerId.value })
  }
    newProduct.value = { commodityId: '', name: '', description: '', price: 0, stock: 0, unit: 'kg', image: '', status: 'active' }
  showProductForm.value = false
  reload()
}

function handleEditProduct(p: Product) {
    newProduct.value = { commodityId: p.commodityId, name: p.name, description: p.description, price: p.price, stock: p.stock, unit: p.unit, image: p.image, status: p.status }
  editProductId.value = p.id
  showProductForm.value = true
}

function handleDeleteProduct(id: string) {
  if (confirm('Hapus produk ini?')) { deleteProduct(id); reload() }
}

function setProductStatus(id: string, status: ProductStatus) {
  updateProduct(id, { status, isAvailable: status === 'active' })
  reload()
}

function handleSaveLand() {
  createFarmland({ ...newLand.value, farmerId: farmerId.value })
  newLand.value = { name: '', address: '', latitude: -7.5, longitude: 112.0, areaSize: 1, areaUnit: 'hektar' }
  showLandForm.value = false
  reload()
}

function handleDeleteLand(id: string) {
  if (confirm('Hapus lahan ini?')) { deleteFarmland(id); reload() }
}

function handleUpdateOrderStatus(id: string, status: 'confirmed') {
  updateOrderStatus(id, status)
  reload()
}

const shipModal = ref({ show: false, orderId: '', courier: '', trackingNumber: '' })
function openShipModal(orderId: string) {
  shipModal.value = { show: true, orderId, courier: '', trackingNumber: '' }
}
function handleShipProduct() {
  if (!shipModal.value.orderId || !shipModal.value.courier || !shipModal.value.trackingNumber) return
  const order = getOrder(shipModal.value.orderId)
  createShipping({ orderId: shipModal.value.orderId, courier: shipModal.value.courier, trackingNumber: shipModal.value.trackingNumber, estimatedDays: 3 })
  updateOrderStatus(shipModal.value.orderId, 'shipped')
  if (order) addNotification(order.buyerId, 'order_update', 'Pesanan Dikirim', 'Pesanan Anda telah dikirim. Silakan cek status pengiriman.', '/pesanan')
  shipModal.value = { show: false, orderId: '', courier: '', trackingNumber: '' }
  reload()
}

function handleVerifyPayment(orderId: string, status: 'verified' | 'rejected') {
  if (status === 'rejected' && !confirm('Tolak pembayaran ini?')) return
  farmerVerifyPayment(orderId, farmerId.value, status)
  reload()
}

function getPayment(orderId: string) { return getPaymentByOrder(orderId) }

const paymentPreview = ref<string | null>(null)
const paymentPhotos = ref<string[]>([])
const deliveryPreview = ref<string[]>([])
function previewPayment(orderId: string) {
  const p = getPaymentByOrder(orderId)
  if (p) {
    paymentPreview.value = p.proofImage || ''
    paymentPhotos.value = p.photos || []
  }
}
function previewDelivery(orderId: string) {
  const order = getOrder(orderId)
  if (order?.deliveryPhotos?.length) deliveryPreview.value = order.deliveryPhotos
}

const editProfileMode = ref(false)
const editName = ref('')
const editPhone = ref('')
const editLocation = ref('')
const editBio = ref('')
function toggleEditProfile() {
  if (!user.value) return
  editProfileMode.value = !editProfileMode.value
  if (editProfileMode.value) {
    editName.value = user.value.name || ''
    editPhone.value = user.value.phone || ''
    editLocation.value = user.value.location || ''
    editBio.value = user.value.bio || ''
  }
}
async function saveProfileEdit() {
  if (!user.value) return
  await updateProfile({ name: editName.value, phone: editPhone.value, location: editLocation.value, bio: editBio.value })
  editProfileMode.value = false
  reload()
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

function statusBadge(s: string): string {
  const m: Record<string,string> = { pending:'warning', confirmed:'info', shipped:'primary', delivered:'success', cancelled:'danger', expired:'dark' }
  return m[s] || 'secondary'
}
function statusLabel(s: string): string {
  const m: Record<string,string> = { pending:'Menunggu', confirmed:'Dikonfirmasi', shipped:'Dikirim', delivered:'Selesai', cancelled:'Dibatalkan', expired:'Kadaluarsa' }
  return m[s] || s
}
function getPaymentStatus(orderId: string): string {
  return getPayments().find(p => p.orderId === orderId)?.status || 'pending'
}

const totalRevenue = computed(() => report.value.totalRevenue)
const totalOrders = computed(() => report.value.totalOrders)
const totalProducts = computed(() => report.value.totalProducts)
const reviews = computed(() => { void refreshKey.value; return getReviewsByFarmer(farmerId.value) })
const avgRating = computed(() => {
  const r = reviews.value
  return r.length ? (r.reduce((s, i) => s + i.rating, 0) / r.length) : 0
})
const deliveredOrders = computed(() => orders.value.filter(o => o.status === 'delivered'))
const salesChartData = computed(() => {
  const days: { label: string; count: number; revenue: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const ds = d.toISOString().slice(0, 10)
    const dayOrders = deliveredOrders.value.filter(o => o.createdAt.slice(0, 10) === ds)
    days.push({
      label: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
      count: dayOrders.length,
      revenue: dayOrders.reduce((s, o) => s + o.totalPrice, 0),
    })
  }
  return days
})
const maxSalesCount = computed(() => Math.max(...salesChartData.value.map(d => d.count), 1))
const maxSalesRevenue = computed(() => Math.max(...salesChartData.value.map(d => d.revenue), 1))
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex align-items-center gap-3">
        <div class="position-relative" style="cursor:pointer" @click="farmerAvatarRef?.click()">
          <div v-if="user?.avatar" class="rounded-circle overflow-hidden" style="width: 50px; height: 50px;">
            <img :src="user.avatar" style="width:100%;height:100%;object-fit:cover">
          </div>
          <div v-else class="bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center rounded-circle fw-bold" style="width: 50px; height: 50px; font-size: 1.5rem;">
            {{ user?.name?.charAt(0)?.toUpperCase() || '?' }}
          </div>
          <div class="position-absolute bottom-0 end-0 bg-dark bg-opacity-75 text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 18px; height: 18px; font-size: 0.6rem;">
            <i class="bi bi-camera"></i>
          </div>
          <input type="file" accept="image/*" class="d-none" ref="farmerAvatarRef" @change="handleAvatarUpload">
        </div>
        <div>
          <h3 class="fw-bold mb-0"><i class="bi bi-person-workspace text-success me-2"></i>Dashboard Petani</h3>
          <p class="text-muted mb-0">Kelola produk, pantau harga pasar, & proses pesanan | {{ user?.name }}</p>
          <p v-if="user?.bio" class="small text-muted mt-1 mb-0"><i class="bi bi-quote me-1"></i>{{ user.bio }}</p>
        </div>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-outline-success" @click="toggleEditProfile" :title="editProfileMode ? 'Tutup' : 'Edit Profil'">
          <i class="bi" :class="editProfileMode ? 'bi-x-lg' : 'bi-pencil'"></i>
        </button>
        <router-link to="/notifikasi" class="btn btn-outline-success position-relative">
          <i class="bi bi-bell"></i> Notifikasi
          <span v-if="unreadCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{{ unreadCount }}</span>
        </router-link>
        <router-link to="/harga" class="btn btn-outline-success"><i class="bi bi-graph-up"></i> Harga Pasar</router-link>
      </div>
    </div>

    <div v-if="editProfileMode" class="card border-0 shadow-sm mb-3 p-3 bg-light">
      <div class="row g-2 align-items-end">
        <div class="col-md-4">
          <label class="form-label small fw-semibold">Nama</label>
          <input v-model="editName" class="form-control form-control-sm">
        </div>
        <div class="col-md-3">
          <label class="form-label small fw-semibold">No. HP</label>
          <input v-model="editPhone" class="form-control form-control-sm">
        </div>
        <div class="col-md-3">
          <label class="form-label small fw-semibold">Lokasi</label>
          <input v-model="editLocation" class="form-control form-control-sm">
        </div>
        <div class="col-md-2 d-flex gap-1">
          <button class="btn btn-sm btn-success" @click="saveProfileEdit"><i class="bi bi-check me-1"></i>Simpan</button>
          <button class="btn btn-sm btn-outline-secondary" @click="editProfileMode = false">Batal</button>
        </div>
        <div class="col-md-12 mt-2">
          <label class="form-label small fw-semibold">Bio</label>
          <textarea v-model="editBio" class="form-control form-control-sm" rows="2" placeholder="Cerita singkat tentang diri Anda..."></textarea>
        </div>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-4">
        <div class="card border-0 shadow-sm bg-success text-white h-100">
          <div class="card-body text-center py-3">
            <div class="fs-3 fw-bold">Rp{{ formatPrice(totalRevenue) }}</div>
            <div class="small opacity-75">Pendapatan</div>
          </div>
        </div>
      </div>
      <div class="col-4">
        <div class="card border-0 shadow-sm bg-primary text-white h-100">
          <div class="card-body text-center py-3">
            <div class="fs-3 fw-bold">{{ totalOrders }}</div>
            <div class="small opacity-75">Pesanan</div>
          </div>
        </div>
      </div>
      <div class="col-4">
        <div class="card border-0 shadow-sm bg-warning text-dark h-100">
          <div class="card-body text-center py-3">
            <div class="fs-3 fw-bold">{{ totalProducts }}</div>
            <div class="small opacity-75">Produk</div>
          </div>
        </div>
      </div>
    </div>

    <ul class="nav nav-pills mb-3 gap-2">
      <li class="nav-item"><button class="nav-link" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'"><i class="bi bi-grid"></i> Overview</button></li>
      <li class="nav-item"><button class="nav-link" :class="{ active: activeTab === 'products' }" @click="activeTab = 'products'"><i class="bi bi-box"></i> Produk</button></li>
      <li class="nav-item"><button class="nav-link" :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'"><i class="bi bi-truck"></i> Pesanan</button></li>
      <li class="nav-item"><button class="nav-link" :class="{ active: activeTab === 'land' }" @click="activeTab = 'land'"><i class="bi bi-geo-alt"></i> Lahan</button></li>
      <li class="nav-item"><button class="nav-link" :class="{ active: activeTab === 'ulasan' }" @click="activeTab = 'ulasan'"><i class="bi bi-star"></i> Ulasan <span v-if="reviews.length" class="badge bg-warning text-dark ms-1">{{ reviews.length }}</span></button></li>
    </ul>

    <div v-if="activeTab === 'overview'">
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-header bg-white fw-bold"><i class="bi bi-graph-up text-success me-2"></i>Bandingkan Harga Jual dengan Pasar</div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-success"><tr><th>Produk</th><th>Harga Jual</th><th>Rata-rata Pasar</th><th>Termurah</th><th>Termahal</th><th>Selisih</th><th>Rekomendasi</th></tr></thead>
              <tbody>
                <tr v-for="p in products" :key="p.id">
                  <td class="fw-semibold">{{ p.name }}</td>
                  <td class="text-success fw-bold">Rp{{ formatPrice(p.price) }}/{{ p.unit }}</td>
                  <td>Rp{{ formatPrice(getMarketPriceAvg(p.commodityId)) }}</td>
                  <td>{{ minMarketPrice(p.commodityId) }}</td>
                  <td>{{ maxMarketPrice(p.commodityId) }}</td>
                  <td><span :class="'badge bg-' + advBadge(p.commodityId, p.price)">{{ ((getMarketPriceAvg(p.commodityId) - p.price) / (getMarketPriceAvg(p.commodityId) || 1) * 100).toFixed(0) }}%</span></td>
                  <td><span :class="'badge bg-' + advBadge(p.commodityId, p.price)">{{ priceAdvice(p.commodityId, p.price) }}</span></td>
                </tr>
                <tr v-if="products.length === 0"><td colspan="7" class="text-center text-muted py-3">Belum ada produk. Tambah produk untuk melihat perbandingan harga.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-3">
        <div class="card-header bg-white fw-bold"><i class="bi bi-graph-up text-info me-2"></i>Harga Pasar Terkini</div>
        <div class="card-body p-2">
          <div class="row g-1">
            <div v-for="c in commodities" :key="c.id" class="col-md-3 col-6">
              <div class="d-flex align-items-center gap-2 p-2 rounded-3" style="background:#f8f9fa">
                <span class="fs-4">{{ c.image }}</span>
                <div class="small lh-sm">
                  <div class="fw-semibold">{{ c.name }}</div>
                  <div class="text-success fw-bold">Rp{{ formatPrice(getMarketPriceAvg(c.id)) }}/{{ c.unit }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="activePromos.length" class="card border-0 shadow-sm mb-3">
        <div class="card-header bg-white fw-bold text-warning"><i class="bi bi-megaphone me-2"></i>Promo Aktif</div>
        <div class="card-body p-2">
          <div v-for="p in activePromos" :key="p.id" class="p-2 border-bottom">
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-semibold small">{{ p.title }}</span>
              <span class="badge bg-danger">{{ p.code }}</span>
            </div>
            <small class="text-muted d-block">{{ p.description }}</small>
            <small class="text-success fw-bold">{{ p.discountType === 'percentage' ? p.discountValue + '%' : 'Rp' + p.discountValue.toLocaleString('id-ID') }} diskon</small>
            <small v-if="p.minPurchase > 0" class="text-muted"> &middot; Min. Rp{{ p.minPurchase.toLocaleString('id-ID') }}</small>
          </div>
        </div>
      </div>
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-header bg-white fw-bold"><i class="bi bi-bar-chart text-primary me-2"></i>Riwayat Penjualan (7 Hari Terakhir)</div>
        <div class="card-body">
          <div v-if="deliveredOrders.length === 0" class="text-center text-muted small py-3">Belum ada penjualan</div>
          <div v-else>
            <div class="d-flex align-items-end gap-2" style="height:120px;">
              <div v-for="d in salesChartData" :key="d.label" class="d-flex flex-column align-items-center flex-fill">
                <div class="w-100 rounded-top" :style="{ height: (d.count / maxSalesCount * 100) + '%', minHeight: d.count ? '8px' : '2px', backgroundColor: d.count > 0 ? '#198754' : '#e9ecef', opacity: 0.8 }" :title="d.label + ': ' + d.count + ' pesanan'"></div>
                <small class="text-muted mt-1" style="font-size:0.6rem;">{{ d.label }}</small>
              </div>
            </div>
            <div class="row g-2 mt-3 text-center">
              <div class="col-4"><small class="text-muted d-block">Total Pesanan</small><span class="fw-bold">{{ deliveredOrders.length }}</span></div>
              <div class="col-4"><small class="text-muted d-block">Total Pendapatan</small><span class="fw-bold text-success">Rp{{ formatPrice(deliveredOrders.reduce((s, o) => s + o.totalPrice, 0)) }}</span></div>
              <div class="col-4"><small class="text-muted d-block">Rata-rata per Pesanan</small><span class="fw-bold">Rp{{ formatPrice(deliveredOrders.length ? Math.round(deliveredOrders.reduce((s, o) => s + o.totalPrice, 0) / deliveredOrders.length) : 0) }}</span></div>
            </div>
          </div>
        </div>
      </div>
      <div class="row g-3">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white fw-bold"><i class="bi bi-clock-history text-success me-2"></i>Pesanan Terbaru</div>
            <div class="card-body p-0">
              <div v-for="o in orders.slice(0, 5)" :key="o.id" class="d-flex justify-content-between align-items-center p-3 border-bottom">
                <div><span class="fw-semibold">#{{ o.id.slice(-6).toUpperCase() }}</span><br><small class="text-muted">Rp{{ formatPrice(o.totalPrice) }}</small></div>
                <span :class="'badge bg-' + statusBadge(o.status) + ' fs-6'">{{ statusLabel(o.status) }}</span>
              </div>
              <div v-if="orders.length === 0" class="text-center py-3 text-muted">Belum ada pesanan</div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white fw-bold"><i class="bi bi-bell text-warning me-2"></i>Notifikasi Terbaru</div>
            <div class="card-body p-0">
              <div v-for="n in notifications.slice(0, 5)" :key="n.id" class="p-3 border-bottom" :class="n.isRead ? '' : 'bg-light'">
                <div class="d-flex justify-content-between">
                  <span class="fw-semibold small">{{ n.title }}</span>
                  <small class="text-muted">{{ new Date(n.createdAt).toLocaleDateString('id-ID') }}</small>
                </div>
                <small class="text-muted">{{ n.message }}</small>
              </div>
              <div v-if="notifications.length === 0" class="text-center py-3 text-muted">Belum ada notifikasi</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'products'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold mb-0">Produk Saya</h5>
        <button class="btn btn-success btn-sm" @click="showProductForm = !showProductForm; editProductId=null; newProduct={commodityId:'', name:'', description:'', price:0, stock:0, unit:'kg', image:'', status:'active'}">
          <i class="bi bi-plus-lg"></i> Tambah
        </button>
      </div>

      <div v-if="showProductForm" class="card border-0 shadow-sm mb-3">
        <div class="card-body">
          <form @submit.prevent="handleSaveProduct">
            <div class="row g-2">
              <div class="col-md-4"><input v-model="newProduct.name" class="form-control" placeholder="Nama produk" required></div>
              <div class="col-md-2"><input v-model="newProduct.price" type="number" class="form-control" placeholder="Harga" required></div>
              <div class="col-md-2"><input v-model="newProduct.stock" type="number" class="form-control" placeholder="Stok" required></div>
              <div class="col-md-2">
                <select v-model="newProduct.unit" class="form-select">
                  <option value="kg">kg</option><option value="liter">liter</option><option value="ikat">ikat</option><option value="sak">sak</option><option value="butir">butir</option>
                </select>
              </div>
              <div class="col-md-2">
                <select v-model="newProduct.commodityId" class="form-select" required>
                  <option value="">Pilih jenis</option>
                  <option v-for="c in commodities" :key="c.id" :value="c.id">{{ c.image }} {{ c.name }}</option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold">Foto Produk</label>
                <div class="d-flex align-items-center gap-2 flex-wrap">
                  <span v-for="e in emojiList" :key="e" class="fs-2" style="cursor:pointer" :class="newProduct.image === e ? 'border border-success rounded p-1' : ''" @click="setProductEmoji(e)">{{ e }}</span>
                  <label class="btn btn-outline-success btn-sm mb-0">
                    <i class="bi bi-camera"></i> Upload
                    <input type="file" accept="image/*" class="d-none" @change="handleFileUpload">
                  </label>
                  <span v-if="newProduct.image && newProduct.image.startsWith('data:')" class="ms-2"><img :src="newProduct.image" style="height:40px;width:40px;object-fit:cover;border-radius:8px"></span>
                </div>
              </div>
              <div class="col-12"><textarea v-model="newProduct.description" class="form-control" rows="2" placeholder="Deskripsi"></textarea></div>
              <div class="col-md-3">
                <select v-model="newProduct.status" class="form-select">
                  <option value="active">Aktif</option><option value="inactive">Nonaktif</option><option value="sold_out">Habis</option>
                </select>
              </div>
            </div>
            <button type="submit" class="btn btn-success btn-sm mt-2">{{ editProductId ? 'Update' : 'Simpan' }}</button>
          </form>
        </div>
      </div>

      <div class="row g-3">
        <div v-for="p in products" :key="p.id" class="col-md-6 col-lg-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div class="d-flex align-items-center gap-2">
                  <span v-if="p.image" class="fs-2">{{ p.image.startsWith('data:') ? '' : p.image }}<img v-if="p.image.startsWith('data:')" :src="p.image" style="height:36px;width:36px;object-fit:cover;border-radius:8px"></span>
                  <h6 class="fw-bold mb-0">{{ p.name }}</h6>
                </div>
                <span class="badge" :class="p.status === 'active' ? 'bg-success' : p.status === 'sold_out' ? 'bg-warning' : 'bg-secondary'">{{ p.status === 'active' ? 'Tersedia' : p.status === 'sold_out' ? 'Habis' : 'Nonaktif' }}</span>
              </div>
              <p v-if="p.description" class="text-muted small mt-1 mb-1">{{ p.description }}</p>
              <div class="d-flex justify-content-between align-items-center mt-2">
                <span class="fw-bold text-success fs-5">Rp{{ formatPrice(p.price) }}/{{ p.unit }}</span>
                <span class="text-muted small">Stok: {{ p.stock }}</span>
              </div>
              <div class="mt-2 d-flex gap-1 flex-wrap">
                <button class="btn btn-sm btn-outline-primary" @click="handleEditProduct(p)" title="Edit"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" @click="handleDeleteProduct(p.id)" title="Hapus"><i class="bi bi-trash"></i></button>
                <button class="btn btn-sm" :class="p.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'" @click="setProductStatus(p.id, p.status === 'active' ? 'inactive' : 'active')" :title="p.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'">
                  <i :class="p.status === 'active' ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
                <button v-if="p.status !== 'sold_out'" class="btn btn-sm btn-outline-warning" @click="setProductStatus(p.id, 'sold_out')" title="Tandai habis"><i class="bi bi-x-circle"></i></button>
                <button v-if="p.status === 'sold_out'" class="btn btn-sm btn-outline-success" @click="setProductStatus(p.id, 'active')" title="Aktifkan kembali"><i class="bi bi-arrow-counterclockwise"></i></button>
              </div>
              <div class="mt-2 small" v-if="p.isAvailable">
                <span class="text-muted">Pasar: Rp{{ formatPrice(getMarketPriceAvg(p.commodityId)) }}/{{ p.unit }}</span>
                <span :class="'badge bg-' + advBadge(p.commodityId, p.price) + ' ms-2'">{{ priceAdvice(p.commodityId, p.price) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="products.length === 0" class="col-12 text-center py-4 text-muted">
          <i class="bi bi-box fs-1 d-block mb-2"></i>
          <p>Belum ada produk. Tambah produk Anda!</p>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'orders'">
      <div class="d-flex gap-2 mb-3">
        <button class="btn btn-sm" :class="orderFilter === 'active' ? 'btn-success' : 'btn-outline-success'" @click="orderFilter = 'active'"><i class="bi bi-inbox me-1"></i>Pesanan Masuk ({{ activeOrders.length }})</button>
        <button class="btn btn-sm" :class="orderFilter === 'history' ? 'btn-secondary' : 'btn-outline-secondary'" @click="orderFilter = 'history'"><i class="bi bi-clock-history me-1"></i>Riwayat ({{ historyOrders.length }})</button>
      </div>

      <div v-if="orderFilter === 'active'">
        <div v-if="activeOrders.length === 0" class="text-center py-5 text-muted"><i class="bi bi-inbox fs-1 d-block mb-2"></i>Belum ada pesanan masuk</div>
        <div v-for="o in activeOrders" :key="o.id" class="card border-0 shadow-sm mb-2">
          <div class="card-body py-2">
            <div class="row align-items-center">
              <div class="col"><strong>#{{ o.id.slice(-6).toUpperCase() }}</strong><br><small class="text-muted">Rp{{ formatPrice(o.totalPrice) }}</small></div>
              <div class="col text-center">
                <small class="text-muted">{{ o.paymentMethod === 'cod' ? 'COD' : 'Transfer' }}</small>
                <template v-if="o.paymentMethod === 'cod'">
                  <small v-if="o.status === 'delivered'" class="text-success d-block fw-semibold">Lunas</small>
                  <small v-else class="text-info d-block fw-semibold">Bayar di Tempat</small>
                </template>
                <template v-else>
                  <small v-if="orderData[o.id]?.payment?.status === 'verified'" class="text-success d-block fw-semibold">Lunas</small>
                  <small v-else-if="orderData[o.id]?.payment?.status === 'rejected'" class="text-danger d-block fw-semibold">Ditolak</small>
                  <small v-else-if="orderData[o.id]?.payment?.proofImage" class="text-warning d-block fw-semibold">Menunggu Verifikasi</small>
                  <small v-else class="text-muted d-block fw-semibold">Belum bayar</small>
                </template>
              </div>
              <div class="col text-center"><span :class="'badge bg-' + statusBadge(o.status) + ' fs-6'">{{ statusLabel(o.status) }}</span></div>
              <div class="col text-end"><small class="text-muted">{{ new Date(o.createdAt).toLocaleDateString('id-ID') }}</small></div>
              <div class="col text-end">
                <button v-if="orderData[o.id]?.payment?.proofImage" class="btn btn-sm btn-outline-info me-1" @click="previewPayment(o.id)" title="Lihat Bukti Bayar"><i class="bi bi-eye"></i></button>
                <button v-if="o.status === 'pending'" class="btn btn-sm btn-success me-1" @click="handleUpdateOrderStatus(o.id, 'confirmed')">Konfirmasi</button>
                <template v-if="o.paymentMethod !== 'cod' && orderData[o.id]?.payment?.proofImage && orderData[o.id]?.payment?.status === 'pending'">
                  <button class="btn btn-sm btn-success me-1" @click="handleVerifyPayment(o.id, 'verified')">Terima</button>
                  <button class="btn btn-sm btn-danger me-1" @click="handleVerifyPayment(o.id, 'rejected')">Tolak</button>
                </template>
                <button v-if="o.status === 'delivered' && orderData[o.id]?.order?.deliveryPhotos?.length" class="btn btn-sm btn-outline-success me-1" @click="previewDelivery(o.id)" title="Lihat Bukti Produk"><i class="bi bi-image"></i></button>
                <button v-if="o.status === 'confirmed' && (o.paymentMethod === 'cod' || orderData[o.id]?.payment?.status === 'verified')" class="btn btn-sm btn-primary" @click="openShipModal(o.id)" title="Input no resi pengiriman">Kirim</button>
              </div>
            </div>
            <div class="mt-2 d-flex align-items-center gap-1 small">
              <span class="text-success" :class="o.status === 'pending' || o.status === 'confirmed' || o.status === 'shipped' || o.status === 'delivered' ? 'fw-bold' : 'text-muted'" style="font-size:0.7rem">✓ Dipesan</span>
              <span class="flex-grow-1 border-bottom border-2 mx-1" :class="o.status === 'confirmed' || o.status === 'shipped' || o.status === 'delivered' ? 'border-success' : 'border-secondary'"></span>
              <span :class="o.status === 'confirmed' || o.status === 'shipped' || o.status === 'delivered' ? 'text-success fw-bold' : 'text-muted'" style="font-size:0.7rem">{{ o.paymentMethod === 'cod' ? '✓ Dikonfirmasi' : (orderData[o.id]?.payment?.status === 'verified' ? '✓ Lunas' : 'Dikonfirmasi') }}</span>
              <span class="flex-grow-1 border-bottom border-2 mx-1" :class="o.status === 'shipped' || o.status === 'delivered' ? 'border-success' : 'border-secondary'"></span>
              <span :class="o.status === 'shipped' || o.status === 'delivered' ? 'text-success fw-bold' : 'text-muted'" style="font-size:0.7rem">{{ o.status === 'delivered' ? '✓ Dikirim' : 'Dikirim' }}</span>
              <span class="flex-grow-1 border-bottom border-2 mx-1" :class="o.status === 'delivered' ? 'border-success' : 'border-secondary'"></span>
              <span :class="o.status === 'delivered' ? 'text-success fw-bold' : 'text-muted'" style="font-size:0.7rem">{{ o.status === 'delivered' ? '✓ Selesai' : 'Selesai' }}</span>
            </div>
            <div v-if="(o.status === 'shipped' || o.status === 'delivered') && orderData[o.id]?.shipping" class="mt-1 small bg-light rounded-3 p-2">
              <i class="bi bi-truck text-primary me-1"></i>{{ orderData[o.id]?.shipping?.courier }} &middot; Resi: <strong>{{ orderData[o.id]?.shipping?.trackingNumber }}</strong>
            </div>
            <div class="mt-2 d-flex gap-2 flex-wrap">
              <div v-for="item in orderData[o.id]?.items" :key="item.id" class="d-flex align-items-center gap-2 bg-light rounded-3 p-1 px-2">
                <span v-if="item.productImage && !item.productImage.startsWith('data:') && !item.productImage.startsWith('http')" class="fs-6">{{ item.productImage }}</span>
                <img v-else-if="item.productImage" :src="item.productImage" style="width:24px;height:24px;object-fit:cover;border-radius:4px">
                <small class="fw-semibold">{{ item.commodityName }}</small>
                <small class="text-muted">{{ item.quantity }} {{ item.unit }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="orderFilter === 'history'">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white fw-bold"><i class="bi bi-clock-history text-secondary me-2"></i>Riwayat Pesanan ({{ historyOrders.length }})</div>
          <div class="card-body p-0" style="max-height:500px;overflow-y:auto">
            <div v-for="o in historyOrders" :key="o.id" class="p-3 border-bottom">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <span class="fw-semibold">#{{ o.id.slice(-6).toUpperCase() }}</span>
                  <small class="text-muted d-block">{{ new Date(o.createdAt).toLocaleDateString('id-ID') }} &middot; Rp{{ formatPrice(o.totalPrice) }}</small>
                  <small :class="'badge bg-' + statusBadge(o.status) + ' mt-1'">{{ statusLabel(o.status) }}</small>
                </div>
                <div class="d-flex gap-1">
                  <button v-if="orderData[o.id]?.order?.deliveryPhotos?.length" class="btn btn-sm btn-outline-success" @click="previewDelivery(o.id)" title="Lihat Bukti Produk"><i class="bi bi-image"></i></button>
                </div>
              </div>
              <div class="mt-2 d-flex gap-2 flex-wrap">
                <div v-for="item in orderData[o.id]?.items" :key="item.id" class="d-flex align-items-center gap-2 bg-light rounded-3 p-1 px-2">
                  <span v-if="item.productImage && !item.productImage.startsWith('data:') && !item.productImage.startsWith('http')" class="fs-6">{{ item.productImage }}</span>
                  <img v-else-if="item.productImage" :src="item.productImage" style="width:24px;height:24px;object-fit:cover;border-radius:4px">
                  <small class="fw-semibold">{{ item.commodityName }}</small>
                  <small class="text-muted">{{ item.quantity }} {{ item.unit }}</small>
                </div>
              </div>
            </div>
            <div v-if="historyOrders.length === 0" class="text-center py-4 text-muted"><i class="bi bi-clock fs-1 d-block mb-2"></i>Belum ada riwayat pesanan</div>
          </div>
        </div>
      </div>

      <div v-if="paymentPreview" class="modal d-block" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:1055;background:rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">Bukti Pembayaran & Foto Produk</h5><button class="btn-close" @click="paymentPreview = null; paymentPhotos = []"></button></div>
            <div class="modal-body">
              <h6 class="fw-semibold">Bukti Pembayaran</h6>
              <div class="text-center mb-3">
                <img :src="paymentPreview" style="max-width:100%;max-height:300px;border-radius:8px">
              </div>
              <h6 v-if="paymentPhotos.length" class="fw-semibold">Foto Produk</h6>
              <div v-if="paymentPhotos.length" class="d-flex gap-2 flex-wrap">
                <div v-for="(ph, i) in paymentPhotos" :key="i" style="width:100px;height:100px;overflow:hidden;border-radius:8px;border:1px solid #ddd;cursor:pointer" @click="paymentPreview = ph">
                  <img :src="ph" style="width:100%;height:100%;object-fit:cover">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="deliveryPreview.length" class="modal d-block" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:1055;background:rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">Bukti Penerimaan Produk</h5><button class="btn-close" @click="deliveryPreview = []"></button></div>
            <div class="modal-body">
              <div class="d-flex gap-2 flex-wrap">
                <div v-for="(ph, i) in deliveryPreview" :key="i" style="width:120px;height:120px;overflow:hidden;border-radius:8px;border:1px solid #ddd;">
                  <img :src="ph" style="width:100%;height:100%;object-fit:cover">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="shipModal.show" class="modal d-block" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:1055;background:rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title"><i class="bi bi-truck text-primary me-1"></i>Kirim Pesanan</h5><button class="btn-close" @click="shipModal.show = false"></button></div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">Kurir / Ekspedisi</label>
                <input v-model="shipModal.courier" class="form-control" placeholder="cth: JNE, J&T, SiCepat, Pos Indonesia" required>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">No. Resi / Tracking</label>
                <input v-model="shipModal.trackingNumber" class="form-control" placeholder="Masukkan no resi pengiriman" required>
              </div>
              <p class="text-muted small mb-0"><i class="bi bi-info-circle me-1"></i>Pembeli akan melihat info pengiriman ini dan bisa melacak pesanan.</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="shipModal.show = false">Batal</button>
              <button class="btn btn-primary" :disabled="!shipModal.courier || !shipModal.trackingNumber" @click="handleShipProduct"><i class="bi bi-send me-1"></i>Kirim</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="activeTab === 'ulasan'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold mb-0"><i class="bi bi-star text-warning me-2"></i>Ulasan Pembeli</h5>
        <span class="badge bg-warning text-dark fs-6" v-if="reviews.length"><i class="bi bi-star-fill me-1"></i>{{ avgRating.toFixed(1) }} &middot; {{ reviews.length }} ulasan</span>
      </div>
      <div v-if="reviews.length === 0" class="text-center py-5 text-muted"><i class="bi bi-star fs-1 d-block mb-2"></i>Belum ada ulasan dari pembeli</div>
      <div class="row g-3">
        <div v-for="r in reviews" :key="r.id" class="col-md-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <span class="fw-bold">{{ r.userName }}</span>
                  <div class="text-warning">
                    <span v-for="s in 5" :key="s" class="me-1" :class="s <= r.rating ? 'text-warning' : 'text-secondary'">&#9733;</span>
                  </div>
                </div>
                <small class="text-muted">{{ new Date(r.createdAt).toLocaleDateString('id-ID') }}</small>
              </div>
              <p class="text-muted small mt-2 mb-0">{{ r.comment }}</p>
              <small class="text-muted d-block mt-1">Produk: {{ getProducts().find(p => p.id === r.productId)?.name || 'Tidak diketahui' }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="activeTab === 'land'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold mb-0">Lahan Saya</h5>
        <button class="btn btn-success btn-sm" @click="showLandForm = !showLandForm"><i class="bi bi-plus-lg"></i> Tambah</button>
      </div>

      <div v-if="showLandForm" class="card border-0 shadow-sm mb-3">
        <div class="card-body">
          <form @submit.prevent="handleSaveLand">
            <div class="row g-2">
              <div class="col-md-4"><input v-model="newLand.name" class="form-control" placeholder="Nama lahan" required></div>
              <div class="col-md-6"><input v-model="newLand.address" class="form-control" placeholder="Alamat" required></div>
              <div class="col-md-2"><input v-model="newLand.areaSize" type="number" step="0.1" class="form-control" placeholder="Luas"></div>
              <div class="col-md-2">
                <select v-model="newLand.areaUnit" class="form-select"><option value="hektar">Hektar</option><option value="meter">Meter</option><option value="bahu">Bahu</option></select>
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold">Lokasi <small class="text-muted">(klik peta atau seret marker)</small></label>
                <div ref="mapContainer" style="height:320px;border-radius:12px;overflow:hidden;border:1px solid #ddd;"></div>
                <div class="d-flex gap-3 mt-2 small text-muted">
                  <span><i class="bi bi-geo-alt me-1"></i>Lat: <strong>{{ newLand.latitude }}</strong></span>
                  <span><i class="bi bi-geo-alt me-1"></i>Lng: <strong>{{ newLand.longitude }}</strong></span>
                </div>
              </div>
            </div>
            <button type="submit" class="btn btn-success btn-sm mt-2">Simpan</button>
          </form>
        </div>
      </div>

      <div class="row g-3">
        <div v-for="l in farmlands" :key="l.id" class="col-md-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <h6 class="fw-bold"><i class="bi bi-geo-alt-fill text-success me-1"></i>{{ l.name }}</h6>
                <button class="btn btn-sm btn-outline-danger" @click="handleDeleteLand(l.id)"><i class="bi bi-trash"></i></button>
              </div>
              <p class="text-muted mb-1">{{ l.address }}</p>
              <div class="d-flex gap-3 small">
                <span><i class="bi bi-arrows-angle-expand me-1"></i>{{ l.areaSize }} {{ l.areaUnit }}</span>
                <span><i class="bi bi-geo me-1"></i>{{ l.latitude }}, {{ l.longitude }}</span>
              </div>
              <a :href="'https://www.google.com/maps?q=' + l.latitude + ',' + l.longitude" target="_blank" class="btn btn-sm btn-outline-success mt-2"><i class="bi bi-map me-1"></i>Maps</a>
            </div>
          </div>
        </div>
        <div v-if="farmlands.length === 0" class="col-12 text-center py-4 text-muted">
          <i class="bi bi-map fs-1 d-block mb-2"></i>
          <p>Belum ada lahan terdaftar.</p>
        </div>
      </div>
    </div>
  </div>
</template>
