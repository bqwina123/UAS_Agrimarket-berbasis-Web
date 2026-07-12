<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/authService'
import { getOrdersByBuyer, getOrdersByFarmer, getPaymentsByUser, getShippingByOrder, getOrderItems, uploadPaymentProof, confirmOrderDelivered, uploadDeliveryProof, updateOrderStatus, addReview } from '@/services/db'
import { useCart } from '@/services/cartService'

const router = useRouter()
const { user, isLoggedIn, isPetani, isPembeli } = useAuth()
if (!isLoggedIn.value) { router.push('/masuk'); }
const { count } = useCart()
const userId = computed(() => user.value?.id || '')
const refreshKey = ref(0)

const orders = computed(() => {
  void refreshKey.value
  if (!userId.value) return []
  return isPetani.value ? getOrdersByFarmer(userId.value) : getOrdersByBuyer(userId.value)
})

function reload() { refreshKey.value++ }

const statusFilter = ref('')

const filtered = computed(() => {
  if (!statusFilter.value) return orders.value
  return orders.value.filter(o => o.status === statusFilter.value)
})

function formatPrice(p: number): string { return new Intl.NumberFormat('id-ID').format(p) }

const statusMap: Record<string, string> = { pending: 'Menunggu', confirmed: 'Dikonfirmasi', shipped: 'Dikirim', delivered: 'Selesai', cancelled: 'Dibatalkan', expired: 'Kadaluarsa' }
const badgeMap: Record<string, string> = { pending: 'warning', confirmed: 'info', shipped: 'primary', delivered: 'success', cancelled: 'danger', expired: 'dark' }

function getPaymentStatus(orderId: string) {
  const payments = getPaymentsByUser(user.value?.id ?? '')
  const p = payments.find(pay => pay.orderId === orderId)
  return p?.status || 'pending'
}

function getShippingInfo(orderId: string) {
  return getShippingByOrder(orderId)
}

const uploadModal = ref({ show: false, orderId: '', proof: '', photos: [] as string[] })
const deliveryProofModal = ref({ show: false, orderId: '', photos: [] as string[] })

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => { uploadModal.value.proof = e.target?.result as string }
    reader.readAsDataURL(target.files[0])
  }
}
function handleProductPhotosUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const readers = Array.from(target.files).map(f => new Promise<string>((resolve) => {
      const r = new FileReader()
      r.onload = (e) => resolve(e.target?.result as string)
      r.readAsDataURL(f)
    }))
    Promise.all(readers).then(results => { uploadModal.value.photos = results })
  }
}
function handleUploadProof() {
  if (!user.value || !uploadModal.value.orderId || !uploadModal.value.proof) return
  uploadPaymentProof(uploadModal.value.orderId, user.value.id, uploadModal.value.proof, (uploadModal.value.photos || []).length ? uploadModal.value.photos : undefined)
  uploadModal.value = { show: false, orderId: '', proof: '', photos: [] }
  reload()
}

function handleConfirmReceived(orderId: string) {
  if (confirm('Konfirmasi pesanan sudah diterima?')) {
    confirmOrderDelivered(orderId)
    reload()
  }
}

function handleDeliveryPhotosUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const readers = Array.from(target.files).map(f => new Promise<string>((resolve) => {
      const r = new FileReader()
      r.onload = (e) => resolve(e.target?.result as string)
      r.readAsDataURL(f)
    }))
    Promise.all(readers).then(results => { deliveryProofModal.value.photos = results })
  }
}
function handleUploadDeliveryProof() {
  if (!deliveryProofModal.value.orderId || !deliveryProofModal.value.photos.length) return
  uploadDeliveryProof(deliveryProofModal.value.orderId, deliveryProofModal.value.photos)
  deliveryProofModal.value = { show: false, orderId: '', photos: [] }
  reload()
}

function handleCancelOrder(orderId: string) {
  if (confirm('Batalkan pesanan ini?')) {
    updateOrderStatus(orderId, 'cancelled' as any)
    reload()
  }
}

const reviewModal = ref({ show: false, productId: '', orderId: '', rating: 5, comment: '' })

function openReview(orderId: string) {
  const items = getOrderItems(orderId)
  if (items.length > 0) {
    reviewModal.value = { show: true, productId: items[0].productId, orderId, rating: 5, comment: '' }
  }
}

function submitReview() {
  const r = reviewModal.value
  if (!r.productId || !r.comment) { alert('Isi komentar ulasan'); return }
  addReview({ productId: r.productId, userId: user.value?.id || '', userName: user.value?.name || '', rating: r.rating, comment: r.comment, orderId: r.orderId })
  reviewModal.value.show = false
  alert('Ulasan berhasil dikirim!')
  reload()
}
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold"><i class="bi bi-truck text-success me-2"></i>Pesanan Saya</h2>
        <p class="text-muted mb-0">Pantau status pesanan Anda</p>
      </div>
      <div class="d-flex gap-2">
        <select v-model="statusFilter" class="form-select w-auto">
          <option value="">Semua</option>
          <option v-for="(label, key) in statusMap" :key="key" :value="key">{{ label }}</option>
        </select>
        <router-link v-if="isPembeli" to="/cart" class="btn btn-success position-relative">
          <i class="bi bi-cart3"></i>
          <span v-if="count > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{{ count }}</span>
        </router-link>
      </div>
    </div>

    <div v-if="filtered.length === 0" class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-3"></i>
      <h5>Belum ada pesanan</h5>
      <p v-if="isPembeli" class="mb-3">Ayo mulai belanja hasil tani langsung dari petani!</p>
      <router-link v-if="isPembeli" to="/marketplace" class="btn btn-success btn-lg"><i class="bi bi-shop me-1"></i>Belanja Sekarang</router-link>
      <router-link v-if="isPetani" to="/petani" class="btn btn-success btn-lg"><i class="bi bi-box me-1"></i>Kelola Produk</router-link>
    </div>

    <div v-for="o in filtered" :key="o.id" class="card border-0 shadow-sm mb-3">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-lg-3">
            <span class="fw-bold fs-5">#{{ o.id.slice(-6).toUpperCase() }}</span>
            <small class="d-block text-muted">{{ new Date(o.createdAt).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) }}</small>
          </div>
          <div class="col-lg-2 text-center">
            <span class="fw-bold text-success fs-5">Rp{{ formatPrice(o.totalPrice) }}</span>
          </div>
          <div class="col-lg-2 text-center">
            <span :class="'badge bg-' + badgeMap[o.status] + ' fs-6 px-3 py-2'">{{ statusMap[o.status] }}</span>
            <small v-if="o.status === 'expired'" class="d-block text-muted mt-1">Melebihi 24 jam</small>
          </div>
          <div class="col-lg-2 text-center">
            <small class="d-block text-muted">{{ o.paymentMethod === 'cod' ? 'COD' : o.paymentMethod === 'transfer_bank' ? 'Transfer' : o.paymentMethod === 'qris' ? 'QRIS' : 'VA' }}</small>
            <template v-if="o.paymentMethod === 'cod'">
              <small v-if="o.status === 'delivered'" class="text-success fw-semibold">Lunas (COD)</small>
              <small v-else class="text-info fw-semibold">Bayar di Tempat</small>
            </template>
            <template v-else>
              <small v-if="getPaymentStatus(o.id) === 'verified'" class="text-success fw-semibold">Lunas</small>
              <small v-else-if="getPaymentStatus(o.id) === 'rejected'" class="text-danger fw-semibold">Ditolak</small>
              <small v-else-if="getPaymentsByUser(user.value?.id ?? '').find(p => p.orderId === o.id)?.proofImage" class="text-warning fw-semibold">Menunggu Verifikasi</small>
              <small v-else-if="o.status !== 'expired' && o.status !== 'cancelled'" class="text-warning fw-semibold">Belum bayar</small>
            </template>
          </div>
          <div class="col-lg-3 text-end">
            <div v-if="getShippingInfo(o.id)" class="mb-1">
              <small class="text-muted d-block">{{ getShippingInfo(o.id)?.courier }}</small>
              <small v-if="getShippingInfo(o.id)?.trackingNumber" class="fw-semibold">Resi: {{ getShippingInfo(o.id)?.trackingNumber }}</small>
            </div>
            <div class="d-flex gap-1 justify-content-end flex-wrap">
              <button v-if="o.status === 'pending' && isPembeli && o.paymentMethod !== 'cod' && getPaymentStatus(o.id) !== 'verified' && (!getPaymentsByUser(user.value?.id ?? '').find(p => p.orderId === o.id)?.proofImage || getPaymentStatus(o.id) === 'rejected')" class="btn btn-sm btn-outline-primary" @click="uploadModal = { show: true, orderId: o.id, proof: '', photos: [] }">
                Upload Bukti
              </button>
              <button v-if="o.status === 'shipped' && isPembeli" class="btn btn-sm btn-success" @click="handleConfirmReceived(o.id)">
                Konfirmasi Diterima
              </button>
              <button v-if="o.status === 'delivered' && isPembeli" class="btn btn-sm btn-outline-primary" @click="deliveryProofModal = { show: true, orderId: o.id, photos: [] }">
                <i class="bi bi-camera me-1"></i>Bukti Produk
              </button>
              <button v-if="o.status === 'delivered' && isPembeli" class="btn btn-sm btn-outline-warning" @click="openReview(o.id)">
                <i class="bi bi-star me-1"></i>Ulasan
              </button>
              <button v-if="o.status === 'pending' && isPembeli" class="btn btn-sm btn-outline-danger" @click="handleCancelOrder(o.id)">
                Batalkan
              </button>
            </div>
          </div>
          <div class="mt-2 d-flex align-items-center gap-1 small">
            <span class="text-success" :class="o.status === 'pending' || o.status === 'confirmed' || o.status === 'shipped' || o.status === 'delivered' ? 'fw-bold' : 'text-muted'" style="font-size:0.7rem">✓ Dipesan</span>
            <span class="flex-grow-1 border-bottom border-2 mx-1" :class="o.status === 'confirmed' || o.status === 'shipped' || o.status === 'delivered' ? 'border-success' : 'border-secondary'"></span>
            <span :class="o.status === 'confirmed' || o.status === 'shipped' || o.status === 'delivered' ? 'text-success fw-bold' : 'text-muted'" style="font-size:0.7rem">{{ o.paymentMethod === 'cod' ? '✓ Dikonfirmasi' : (getPaymentStatus(o.id) === 'verified' ? '✓ Lunas' : 'Dikonfirmasi') }}</span>
            <span class="flex-grow-1 border-bottom border-2 mx-1" :class="o.status === 'shipped' || o.status === 'delivered' ? 'border-success' : 'border-secondary'"></span>
            <span :class="o.status === 'shipped' || o.status === 'delivered' ? 'text-success fw-bold' : 'text-muted'" style="font-size:0.7rem">{{ o.status === 'delivered' ? '✓ Dikirim' : 'Dikirim' }}</span>
            <span class="flex-grow-1 border-bottom border-2 mx-1" :class="o.status === 'delivered' ? 'border-success' : 'border-secondary'"></span>
            <span :class="o.status === 'delivered' ? 'text-success fw-bold' : 'text-muted'" style="font-size:0.7rem">{{ o.status === 'delivered' ? '✓ Selesai' : 'Selesai' }}</span>
          </div>
          <div v-if="(o.status === 'shipped' || o.status === 'delivered') && getShippingInfo(o.id)" class="mt-1 small bg-light rounded-3 p-2">
            <i class="bi bi-truck text-primary me-1"></i>{{ getShippingInfo(o.id)?.courier }} &middot; Resi: <strong>{{ getShippingInfo(o.id)?.trackingNumber }}</strong>
          </div>
        </div>
        <div class="mt-3 d-flex gap-2 flex-wrap">
          <div v-for="item in getOrderItems(o.id)" :key="item.id" class="d-flex align-items-center gap-2 bg-light rounded-3 p-2" style="min-width:180px;">
            <div style="width:36px;height:36px;border-radius:6px;overflow:hidden;background:#e9ecef;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <img v-if="item.productImage && (item.productImage.startsWith('data:') || item.productImage.startsWith('http'))" :src="item.productImage" :alt="item.commodityName" style="width:100%;height:100%;object-fit:cover">
              <span v-else-if="item.productImage" class="fs-6">{{ item.productImage }}</span>
              <i v-else class="bi bi-box text-muted small"></i>
            </div>
            <div class="small">
              <span class="fw-semibold d-block">{{ item.commodityName }}</span>
              <span class="text-muted">{{ item.quantity }} {{ item.unit }} x Rp{{ formatPrice(item.price) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="uploadModal.show" class="modal d-block" style="background: rgba(0,0,0,0.5);">
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

    <div v-if="deliveryProofModal.show" class="modal d-block" style="background: rgba(0,0,0,0.5);">
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

    <div v-if="reviewModal.show" class="modal d-block" style="background: rgba(0,0,0,0.5);">
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
