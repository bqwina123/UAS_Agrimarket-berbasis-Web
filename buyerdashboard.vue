<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/authService'
import { getOrdersByBuyer, getWishlists, getProducts, getCommodities, getNotifications, getUnreadCount, getPriceAlerts, getOrderItems, getReviews, getPaymentsByUser, getShippingByOrder, uploadPaymentProof, confirmOrderDelivered, uploadDeliveryProof, addReview, removeFromWishlist, checkWishlistPriceDrops, getAvgPriceByCommodity, getPromos } from '@/services/db'
import { useCart } from '@/services/cartService'

const router = useRouter()
const { user, isLoggedIn, updateProfile } = useAuth()
const { count: cartCount, addToCart } = useCart()
const buyerId = computed(() => user.value?.id || '')
const refreshKey = ref(0)
const buyerAvatarRef = ref<HTMLElement | null>(null)

const orders = computed(() => { void refreshKey.value; return getOrdersByBuyer(buyerId.value) })
const wishlist = computed(() => getWishlists(buyerId.value))
const wishlistProducts = computed(() => wishlist.value.map(w => getProducts().find(p => p.id === w.productId)).filter(Boolean))
const priceDrops = computed(() => { void refreshKey.value; return buyerId.value ? checkWishlistPriceDrops(buyerId.value) : [] })
const notifications = computed(() => { void refreshKey.value; return getNotifications(buyerId.value) })
const unreadCount = computed(() => { void refreshKey.value; return getUnreadCount(buyerId.value) })
const priceAlerts = computed(() => { void refreshKey.value; return getPriceAlerts(buyerId.value) })

const activePromos = computed(() => getPromos().filter(p => p.isActive))

const totalSpent = computed(() => orders.value.reduce((s, o) => s + o.totalPrice, 0))
const totalOrders = computed(() => orders.value.length)
const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending').length)

const buyerOrderFilter = ref<'active' | 'history'>('active')
const activeBuyerOrders = computed(() => orders.value.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status)))
const historyBuyerOrders = computed(() => orders.value.filter(o => ['delivered', 'cancelled', 'expired'].includes(o.status)))
const orderData = computed(() => {
  const data: Record<string, { paymentStatus: string, payment: { proofImage?: string, status?: string } | undefined, items: ReturnType<typeof getOrderItems>, shipping: ReturnType<typeof getShippingByOrder> }> = {}
  const userPayments = getPaymentsByUser(buyerId.value)
  for (const o of orders.value) {
    const p = userPayments.find(pay => pay.orderId === o.id)
    data[o.id] = {
      paymentStatus: p?.status || 'pending',
      payment: p ? { proofImage: p.proofImage, status: p.status } : undefined,
      items: getOrderItems(o.id),
      shipping: getShippingByOrder(o.id)
    }
  }
  return data
})

const commodities = computed(() => { void refreshKey.value; return getCommodities() })
const commodityPrices = computed(() => {
  void refreshKey.value
  return commodities.value.map(c => ({
    ...c,
    avgPrice: getAvgPriceByCommodity(c.id)
  })).sort((a, b) => b.avgPrice - a.avgPrice)
})

function reload() { refreshKey.value++ }

let pollTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  if (!isLoggedIn.value) { router.push('/masuk'); return }
  pollTimer = setInterval(() => {
    if (!document.hidden) {
      refreshKey.value++
      import('@/services/db').then(m => m.generateWishlistPriceDropNotifications(buyerId.value))
    }
  }, 15000)
})
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer) })

const productSearch = ref('')
const cartToast = ref({ show: false, productName: '' })
const reviewModal = ref({ show: false, productId: '', orderId: '', rating: 5, comment: '' })
const uploadModal = ref({ show: false, orderId: '', proof: '', photos: [] as string[] })
const deliveryProofModal = ref({ show: false, orderId: '', photos: [] as string[] })

function getPaymentStatus(orderId: string): string {
  const p = getPaymentsByUser(buyerId.value).find(pay => pay.orderId === orderId)
  return p?.status || 'pending'
}
function getShippingInfo(orderId: string) { return getShippingByOrder(orderId) }

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
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = async (e) => { uploadModal.value.proof = await compressImage(e.target?.result as string) }
    reader.readAsDataURL(file)
  }
}
function handleProductPhotosUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const readers = Array.from(target.files).map(f => new Promise<string>((resolve) => {
      const r = new FileReader()
      r.onload = async (e) => resolve(await compressImage(e.target?.result as string))
      r.readAsDataURL(f)
    }))
    Promise.all(readers).then(results => { uploadModal.value.photos = results })
  }
}
function handleUploadProof() {
  if (!uploadModal.value.orderId || !uploadModal.value.proof) return
  uploadPaymentProof(uploadModal.value.orderId, buyerId.value, uploadModal.value.proof, (uploadModal.value.photos || []).length ? uploadModal.value.photos : undefined)
  uploadModal.value = { show: false, orderId: '', proof: '', photos: [] }
  alert('Bukti pembayaran berhasil diupload! Pesanan menunggu verifikasi petani.')
  reload()
}
function handleConfirmReceived(orderId: string) {
  if (confirm('Konfirmasi pesanan sudah diterima?')) { confirmOrderDelivered(orderId); reload() }
}

function handleDeliveryPhotosUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const readers = Array.from(target.files).map(f => new Promise<string>((resolve) => {
      const r = new FileReader()
      r.onload = async (e) => resolve(await compressImage(e.target?.result as string))
      r.readAsDataURL(f)
    }))
    Promise.all(readers).then(results => { deliveryProofModal.value.photos = results })
  }
}
function handleUploadDeliveryProof() {
  if (!deliveryProofModal.value.orderId || !deliveryProofModal.value.photos.length) return
  uploadDeliveryProof(deliveryProofModal.value.orderId, deliveryProofModal.value.photos)
  deliveryProofModal.value = { show: false, orderId: '', photos: [] }
  alert('Foto bukti penerimaan berhasil diupload!')
  reload()
}

function openReview(orderId: string) {
  const items = getOrderItems(orderId)
  const first = items[0]
  if (first?.productId) {
    reviewModal.value = { show: true, productId: first.productId, orderId, rating: 5, comment: '' }
  } else {
    alert('Tidak dapat menemukan produk untuk diulas')
  }
}
function submitReview() {
  const r = reviewModal.value
  if (!r.productId || !r.comment) { alert('Isi komentar ulasan'); return }
  const result = addReview({ productId: r.productId, userId: buyerId.value, userName: user.value?.name || '', rating: r.rating, comment: r.comment, orderId: r.orderId })
  r.show = false
  if (!result) { alert('Gagal mengirim ulasan'); return }
  alert('Ulasan berhasil dikirim!')
  reload()
}
const availableProducts = computed(() => {
  return getProducts().filter(p => p.isAvailable && p.stock > 0 && p.farmerId !== buyerId.value).filter(p => {
    if (productSearch.value) return p.name.toLowerCase().includes(productSearch.value.toLowerCase())
    return true
  })
})

function formatPrice(p: number): string { return new Intl.NumberFormat('id-ID').format(p) }

function handleRemoveWishlist(productId: string) {
  if (!productId) return
  if (confirm('Hapus dari favorit?')) { removeFromWishlist(buyerId.value, productId); reload() }
}

function getCategory(commodityId: string): string {
  return commodities.value.find(c => c.id === commodityId)?.category || ''
}

async function handleAddToCart(product: any) {
  if (!isLoggedIn.value) { router.push('/masuk'); return }
  await addToCart(product.id, 1)
  cartToast.value = { show: true, productName: product.name }
  setTimeout(() => { cartToast.value.show = false }, 4000)
}

function statusLabel(s: string): string {
  const m: Record<string,string> = { pending:'Menunggu', confirmed:'Dikonfirmasi', shipped:'Dikirim', delivered:'Selesai', cancelled:'Dibatalkan' }
  return m[s] || s
}
function statusBadge(s: string): string {
  const m: Record<string,string> = { pending:'warning', confirmed:'info', shipped:'primary', delivered:'success', cancelled:'danger' }
  return m[s] || 'secondary'
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
  if (target.files && target.files![0]) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      await updateProfile({ avatar: e.target?.result as string })
    }
    reader.readAsDataURL(target.files![0])
  }
}
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <div class="d-flex align-items-center gap-3">
        <div class="position-relative" style="cursor:pointer" @click="buyerAvatarRef?.click()">
          <div v-if="user?.avatar" class="rounded-circle overflow-hidden" style="width: 50px; height: 50px;">
            <img :src="user.avatar" style="width:100%;height:100%;object-fit:cover">
          </div>
          <div v-else class="bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center rounded-circle fw-bold" style="width: 50px; height: 50px; font-size: 1.5rem;">
            {{ user?.name?.charAt(0)?.toUpperCase() || '?' }}
          </div>
          <div class="position-absolute bottom-0 end-0 bg-dark bg-opacity-75 text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 18px; height: 18px; font-size: 0.6rem;">
            <i class="bi bi-camera"></i>
          </div>
          <input type="file" accept="image/*" class="d-none" ref="buyerAvatarRef" @change="handleAvatarUpload">
        </div>
        <div>
          <h3 class="fw-bold mb-0"><i class="bi bi-person text-success me-2"></i>Dashboard Pembeli</h3>
          <p class="text-muted mb-0">Selamat datang, {{ user?.name }}</p>
          <p v-if="user?.bio" class="small text-muted mt-1 mb-0"><i class="bi bi-quote me-1"></i>{{ user.bio }}</p>
        </div>
        <button class="btn btn-sm btn-outline-success" @click="toggleEditProfile" :title="editProfileMode ? 'Tutup' : 'Edit Profil'">
          <i class="bi" :class="editProfileMode ? 'bi-x-lg' : 'bi-pencil'"></i>
        </button>
      </div>
      <div class="d-flex gap-2">
        <router-link to="/notifikasi" class="btn btn-outline-success position-relative">
          <i class="bi bi-bell"></i>
          <span v-if="unreadCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{{ unreadCount }}</span>
        </router-link>
        <router-link to="/cart" class="btn btn-success position-relative">
          <i class="bi bi-cart3"></i>
          <span v-if="cartCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{{ cartCount }}</span>
        </router-link>
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
        <div class="card border-0 shadow-sm bg-primary text-white h-100">
          <div class="card-body text-center py-3">
            <div class="fs-3 fw-bold">{{ totalOrders }}</div>
            <div class="small opacity-75">Pesanan</div>
          </div>
        </div>
      </div>
      <div class="col-4">
        <div class="card border-0 shadow-sm bg-success text-white h-100">
          <div class="card-body text-center py-3">
            <div class="fs-3 fw-bold">Rp{{ formatPrice(totalSpent) }}</div>
            <div class="small opacity-75">Total Belanja</div>
          </div>
        </div>
      </div>
      <div class="col-4">
        <div class="card border-0 shadow-sm bg-warning text-dark h-100">
          <div class="card-body text-center py-3">
            <div class="fs-3 fw-bold">{{ pendingOrders }}</div>
            <div class="small opacity-75">Menunggu</div>
          </div>
        </div>
      </div>
    </div>

    <div class="d-flex gap-2 mb-3 flex-wrap">
      <router-link to="/marketplace" class="btn btn-success"><i class="bi bi-shop"></i> Marketplace</router-link>
      <router-link to="/pesanan" class="btn btn-outline-primary"><i class="bi bi-truck"></i> Pesanan Saya</router-link>
      <router-link to="/harga" class="btn btn-outline-info"><i class="bi bi-graph-up"></i> Harga Pasar</router-link>
    </div>

    <div class="card border-0 shadow-sm mb-3">
      <div class="card-header bg-white fw-bold"><i class="bi bi-graph-up text-info me-2"></i>Harga Pasar Terkini</div>
      <div class="card-body p-2">
        <div class="row g-1">
          <div v-for="c in commodityPrices.slice(0, 8)" :key="c.id" class="col-md-3 col-6">
            <div class="d-flex align-items-center gap-2 p-2 rounded-3" style="background:#f8f9fa">
              <span class="fs-4">{{ c.image }}</span>
              <div class="small lh-sm">
                <div class="fw-semibold">{{ c.name }}</div>
                <div class="text-success fw-bold">Rp{{ formatPrice(c.avgPrice) }}/{{ c.unit }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-header bg-white fw-bold"><i class="bi bi-shop text-success me-2"></i>Produk Petani Tersedia</div>
      <div class="card-body">
        <div class="mb-3">
          <input v-model="productSearch" class="form-control" placeholder="Cari produk...">
        </div>
        <div v-if="availableProducts.length === 0" class="text-center py-3 text-muted">Belum ada produk tersedia</div>
        <div class="row g-3">
          <div v-for="p in availableProducts" :key="p.id" class="col-md-4 col-6">
            <div class="card border h-100">
              <div class="card-body p-3">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <span v-if="p.image" class="fs-2">{{ p.image.startsWith('data:') ? '' : p.image }}<img v-if="p.image.startsWith('data:')" :src="p.image" style="height:32px;width:32px;object-fit:cover;border-radius:6px"></span>
                  <span class="badge bg-secondary small">{{ getCategory(p.commodityId) }}</span>
                </div>
                <h6 class="fw-bold mb-1">{{ p.name }}</h6>
                <p class="text-muted small mb-1">{{ p.description }}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="fw-bold text-success">Rp{{ formatPrice(p.price) }}/{{ p.unit }}</span>
                  <button class="btn btn-sm btn-success" @click="handleAddToCart(p)"><i class="bi bi-cart-plus"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-lg-7">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white d-flex justify-content-between align-items-center fw-bold">
            <span><i class="bi bi-clock-history text-success me-2"></i>Pesanan Saya</span>
          </div>
          <div class="card-body p-0">
            <div class="d-flex border-bottom">
              <button class="btn btn-sm flex-fill py-2 rounded-0" :class="buyerOrderFilter === 'active' ? 'btn-success' : 'btn-light'" @click="buyerOrderFilter = 'active'">
                <i class="bi bi-inbox me-1"></i>Pesanan Aktif ({{ activeBuyerOrders.length }})
              </button>
              <button class="btn btn-sm flex-fill py-2 rounded-0" :class="buyerOrderFilter === 'history' ? 'btn-secondary' : 'btn-light'" @click="buyerOrderFilter = 'history'">
                <i class="bi bi-clock-history me-1"></i>Riwayat ({{ historyBuyerOrders.length }})
              </button>
            </div>
            <div style="max-height:420px;overflow-y:auto">
              <div v-for="o in (buyerOrderFilter === 'active' ? activeBuyerOrders : historyBuyerOrders)" :key="o.id" class="p-3 border-bottom">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <span class="fw-semibold">#{{ o.id.slice(-6).toUpperCase() }}</span>
                    <small class="text-muted d-block">{{ new Date(o.createdAt).toLocaleDateString('id-ID') }} &middot; Rp{{ formatPrice(o.totalPrice) }}</small>
                    <template v-if="o.paymentMethod === 'cod'">
                      <small v-if="o.status === 'delivered'" class="text-success fw-semibold d-block"><i class="bi bi-check-circle"></i> Lunas (COD)</small>
                      <small v-else class="text-info fw-semibold d-block"><i class="bi bi-cash"></i> Bayar di Tempat</small>
                    </template>
                    <template v-else>
                      <small v-if="orderData[o.id]?.paymentStatus === 'verified'" class="text-success fw-semibold d-block"><i class="bi bi-check-circle"></i> Lunas</small>
                      <small v-else-if="orderData[o.id]?.paymentStatus === 'rejected'" class="text-danger fw-semibold d-block"><i class="bi bi-x-circle"></i> Ditolak</small>
                      <small v-else-if="orderData[o.id]?.payment?.proofImage" class="text-warning fw-semibold d-block"><i class="bi bi-clock"></i> Menunggu Verifikasi</small>
                      <small v-else-if="o.status !== 'cancelled' && o.status !== 'expired'" class="text-warning fw-semibold d-block"><i class="bi bi-clock"></i> Belum bayar</small>
                    </template>
                  </div>
                  <div class="d-flex gap-1 align-items-center flex-wrap">
                    <span :class="'badge bg-' + statusBadge(o.status) + ' fs-6'">{{ statusLabel(o.status) }}</span>
                    <button v-if="o.paymentMethod !== 'cod' && o.status !== 'cancelled' && o.status !== 'expired' && orderData[o.id]?.paymentStatus !== 'verified'" class="btn btn-sm btn-outline-primary" @click="uploadModal = { show: true, orderId: o.id, proof: '', photos: [] }" title="Upload Bukti Bayar"><i class="bi bi-upload"></i></button>
                    <button v-if="o.status === 'shipped'" class="btn btn-sm btn-success" @click="handleConfirmReceived(o.id)" title="Konfirmasi Diterima"><i class="bi bi-check-lg"></i></button>
                    <button v-if="o.status === 'delivered'" class="btn btn-sm btn-outline-primary" @click="deliveryProofModal = { show: true, orderId: o.id, photos: [] }" title="Upload Bukti Produk"><i class="bi bi-camera"></i></button>
                    <button v-if="o.status === 'delivered'" class="btn btn-sm btn-outline-warning" @click="openReview(o.id)" title="Beri Ulasan"><i class="bi bi-star"></i></button>
                  </div>
                </div>
                <div class="mt-2 d-flex align-items-center gap-1 small">
                  <span class="text-success" :class="o.status === 'pending' || o.status === 'confirmed' || o.status === 'shipped' || o.status === 'delivered' ? 'fw-bold' : 'text-muted'" style="font-size:0.7rem">✓ Dipesan</span>
                  <span class="flex-grow-1 border-bottom border-2 mx-1" :class="o.status === 'confirmed' || o.status === 'shipped' || o.status === 'delivered' ? 'border-success' : 'border-secondary'"></span>
                  <span :class="o.status === 'confirmed' || o.status === 'shipped' || o.status === 'delivered' ? 'text-success fw-bold' : 'text-muted'" style="font-size:0.7rem">{{ o.paymentMethod === 'cod' ? '✓ Dikonfirmasi' : (orderData[o.id]?.paymentStatus === 'verified' ? '✓ Lunas' : 'Dikonfirmasi') }}</span>
                  <span class="flex-grow-1 border-bottom border-2 mx-1" :class="o.status === 'shipped' || o.status === 'delivered' ? 'border-success' : 'border-secondary'"></span>
                  <span :class="o.status === 'shipped' || o.status === 'delivered' ? 'text-success fw-bold' : 'text-muted'" style="font-size:0.7rem">{{ o.status === 'delivered' ? '✓ Dikirim' : 'Dikirim' }}</span>
                  <span class="flex-grow-1 border-bottom border-2 mx-1" :class="o.status === 'delivered' ? 'border-success' : 'border-secondary'"></span>
                  <span :class="o.status === 'delivered' ? 'text-success fw-bold' : 'text-muted'" style="font-size:0.7rem">{{ o.status === 'delivered' ? '✓ Selesai' : 'Selesai' }}</span>
                </div>
                <div v-if="o.status === 'shipped' || o.status === 'delivered'" class="mt-1 small bg-light rounded-3 p-2">
                  <i class="bi bi-truck text-primary me-1"></i>
                  <span v-if="orderData[o.id]?.shipping">
                    {{ orderData[o.id]?.shipping?.courier }} &middot; Resi: <strong>{{ orderData[o.id]?.shipping?.trackingNumber }}</strong>
                  </span>
                  <span v-else class="text-muted">Produk sedang dalam perjalanan</span>
                </div>
                <div class="mt-2 d-flex gap-2 flex-wrap">
                  <div v-for="item in (orderData[o.id]?.items || [])" :key="item.id" class="d-flex align-items-center gap-2 bg-light rounded-3 p-1 px-2">
                    <span v-if="item.productImage && !item.productImage.startsWith('data:') && !item.productImage.startsWith('http')" class="fs-6">{{ item.productImage }}</span>
                    <img v-else-if="item.productImage" :src="item.productImage" style="width:24px;height:24px;object-fit:cover;border-radius:4px">
                    <small class="fw-semibold">{{ item.commodityName }}</small>
                    <small class="text-muted">{{ item.quantity }} {{ item.unit }}</small>
                  </div>
                </div>
              </div>
              <div v-if="orders.length === 0" class="text-center py-4 text-muted">
                <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                <p>Belum ada pesanan.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-header bg-white d-flex justify-content-between align-items-center fw-bold">
            <span><i class="bi bi-heart text-danger me-2"></i>Produk Favorit ({{ wishlistProducts.length }})</span>
            <router-link v-if="wishlistProducts.length > 3" to="/wishlist" class="btn btn-sm btn-outline-success">Lihat Semua</router-link>
          </div>
          <div class="card-body p-0">
            <div v-for="p in wishlistProducts.slice(0, 3)" :key="p?.id" class="d-flex align-items-center gap-2 p-3 border-bottom">
              <img v-if="p?.image && (p.image.startsWith('data:') || p.image.startsWith('http'))" :src="p.image" :alt="p?.name" class="rounded" style="width: 45px; height: 45px; object-fit: cover;">
              <span v-else-if="p?.image" class="fs-3">{{ p.image }}</span>
              <i v-else class="bi bi-image text-muted fs-3"></i>
              <div class="flex-grow-1">
                <span class="fw-semibold d-block small">{{ p?.name }}</span>
                <small class="text-success fw-bold">Rp{{ formatPrice(p?.price || 0) }}/{{ p?.unit }}</small>
              </div>
              <router-link :to="'/produk/' + p?.id" class="btn btn-sm btn-outline-success">Lihat</router-link>
              <button class="btn btn-sm btn-outline-danger" @click="handleRemoveWishlist(p!.id)" title="Hapus">
                <i class="bi bi-trash"></i>
              </button>
            </div>
            <div v-if="wishlistProducts.length === 0" class="text-center py-4 text-muted">Belum ada favorit</div>
          </div>
        </div>

        <div v-if="priceDrops.length > 0" class="card border-0 shadow-sm mb-3">
          <div class="card-header bg-white fw-bold text-danger"><i class="bi bi-arrow-down-circle me-2"></i>Harga Turun di Favorit!</div>
          <div class="card-body p-0">
            <div v-for="d in priceDrops" :key="d.productId" class="d-flex align-items-center gap-2 p-3 border-bottom">
              <div class="flex-grow-1">
                <span class="fw-semibold">{{ d.productName }}</span>
                <div class="small text-danger">
                  <i class="bi bi-arrow-down me-1"></i>Turun {{ d.dropPercent }}% (Rp{{ formatPrice(d.oldPrice) }} → Rp{{ formatPrice(d.newPrice) }})
                </div>
              </div>
              <router-link :to="'/produk/' + d.productId" class="btn btn-sm btn-danger">Beli</router-link>
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
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white fw-bold"><i class="bi bi-bell text-warning me-2"></i>Notifikasi</div>
          <div class="card-body p-0">
            <div v-for="n in notifications.slice(0, 3)" :key="n.id" class="p-3 border-bottom" :class="n.isRead ? '' : 'bg-light'" style="cursor:pointer" @click="n.link ? router.push(n.link) : null">
              <span class="fw-semibold small">{{ n.title }}</span>
              <small class="text-muted d-block">{{ n.message }}</small>
            </div>
            <div v-if="notifications.length === 0" class="text-center py-3 text-muted small">Belum ada notifikasi</div>
          </div>
        </div>
      </div>
    </div>


    <div v-if="cartToast.show" class="position-fixed bottom-0 end-0 p-3" style="z-index: 9999;">
      <div class="toast show border-0 shadow-lg" style="min-width: 280px;">
        <div class="toast-header bg-success text-white">
          <i class="bi bi-check-circle me-1"></i>
          <strong class="me-auto">Berhasil!</strong>
          <button class="btn-close btn-close-white" @click="cartToast.show = false"></button>
        </div>
        <div class="toast-body">
          <p class="mb-2">{{ cartToast.productName }} ditambahkan ke keranjang.</p>
          <div class="d-flex gap-2">
            <router-link to="/cart" class="btn btn-success btn-sm"><i class="bi bi-cart3 me-1"></i>Lihat Keranjang</router-link>
            <button class="btn btn-outline-success btn-sm" @click="cartToast.show = false">Lanjut Belanja</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="uploadModal.show" class="modal d-block" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:1055;background:rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header"><h5 class="modal-title"><i class="bi bi-credit-card text-success me-1"></i>Upload Bukti Pembayaran</h5><button class="btn-close" @click="uploadModal.show = false"></button></div>
          <div class="modal-body">
            <p class="text-muted small">Upload foto bukti transfer atau screenshot pembayaran Anda</p>
            <div class="mb-3">
              <label class="form-label fw-semibold">Bukti Pembayaran</label>
              <input type="file" accept="image/*" class="form-control" @change="handleFileUpload">
            </div>
            <div v-if="uploadModal.proof" class="text-center mb-3">
              <img :src="uploadModal.proof" style="max-height:200px;max-width:100%;border-radius:8px">
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Foto Produk <small class="text-muted">(opsional, bisa lebih dari 1)</small></label>
              <input type="file" accept="image/*" class="form-control" multiple @change="handleProductPhotosUpload">
            </div>
            <div v-if="uploadModal.photos.length" class="d-flex gap-2 flex-wrap">
              <div v-for="(ph, i) in uploadModal.photos" :key="i" style="width:70px;height:70px;overflow:hidden;border-radius:8px;border:1px solid #ddd;">
                <img :src="ph" style="width:100%;height:100%;object-fit:cover">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="uploadModal.show = false">Batal</button>
            <button class="btn btn-success" :disabled="!uploadModal.proof" @click="handleUploadProof"><i class="bi bi-check me-1"></i>Upload</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="deliveryProofModal.show" class="modal d-block" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:1055;background:rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header"><h5 class="modal-title"><i class="bi bi-camera text-success me-1"></i>Upload Bukti Produk Sampai</h5><button class="btn-close" @click="deliveryProofModal.show = false"></button></div>
          <div class="modal-body">
            <p class="text-muted small">Upload foto produk yang sudah Anda terima sebagai bukti bahwa produk sampai dengan baik</p>
            <div class="mb-3">
              <label class="form-label fw-semibold">Foto Produk</label>
              <input type="file" accept="image/*" class="form-control" multiple @change="handleDeliveryPhotosUpload">
            </div>
            <div v-if="deliveryProofModal.photos.length" class="d-flex gap-2 flex-wrap">
              <div v-for="(ph, i) in deliveryProofModal.photos" :key="i" style="width:70px;height:70px;overflow:hidden;border-radius:8px;border:1px solid #ddd;">
                <img :src="ph" style="width:100%;height:100%;object-fit:cover">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="deliveryProofModal.show = false">Batal</button>
            <button class="btn btn-success" :disabled="!deliveryProofModal.photos.length" @click="handleUploadDeliveryProof"><i class="bi bi-check me-1"></i>Upload</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="reviewModal.show" class="modal d-block" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:1055;background:rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header"><h5 class="modal-title"><i class="bi bi-star text-warning me-1"></i>Beri Ulasan</h5><button class="btn-close" @click="reviewModal.show = false"></button></div>
          <div class="modal-body">
            <div class="mb-3 text-center">
              <div class="d-flex justify-content-center gap-1 mb-2">
                <span v-for="s in 5" :key="s" class="fs-3" style="cursor:pointer" :class="s <= reviewModal.rating ? 'text-warning' : 'text-secondary'" @click="reviewModal.rating = s">&#9733;</span>
              </div>
              <small class="text-muted">Klik bintang untuk memberi nilai</small>
            </div>
            <textarea v-model="reviewModal.comment" class="form-control" rows="3" placeholder="Tulis ulasan Anda tentang produk ini..."></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="reviewModal.show = false">Batal</button>
            <button class="btn btn-warning" @click="submitReview"><i class="bi bi-send me-1"></i>Kirim Ulasan</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
