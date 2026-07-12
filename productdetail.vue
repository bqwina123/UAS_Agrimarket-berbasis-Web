<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProduct, getAvgPriceByCommodity, getCommodity, getReviews, addReview, getPriceHistory, getPriceAlerts, togglePriceAlert, getPriceComparison, getMarkets } from '@/services/db'
import { useAuth } from '@/services/authService'
import { useWishlist } from '@/services/wishlistService'
import { useCart } from '@/services/cartService'

const route = useRoute()
const router = useRouter()
const { user, isLoggedIn, userId } = useAuth()
const { isInWishlist, toggle } = useWishlist()
const { count, addToCart } = useCart()

const productId = route.params.id as string
const product = getProduct(productId)

const avgRating = computed(() => {
  void refreshKey.value
  const r = getReviews(productId)
  return r.length > 0 ? r.reduce((s, i) => s + i.rating, 0) / r.length : 0
})
const reviews = computed(() => { void refreshKey.value; return getReviews(productId) })

const reviewRating = ref(5)
const reviewComment = ref('')
const showReviewForm = ref(false)
const refreshKey = ref(0)
const showMarketPrices = ref(false)

const chartDays = ref<7 | 30 | 90>(30)
const priceHistory = computed(() => {
  if (!product) return []
  return getPriceHistory(product.commodityId, chartDays.value)
})
const chartMax = computed(() => {
  if (priceHistory.value.length === 0) return 0
  return Math.max(...priceHistory.value.map(p => p.avgPrice)) * 1.15
})

const alerts = computed(() => userId.value ? getPriceAlerts(userId.value) : [])
const hasAlert = computed(() => product ? alerts.value.some(a => a.commodityId === product.commodityId && a.isActive) : false)

if (!product) router.push('/marketplace')

function formatPrice(p: number): string { return new Intl.NumberFormat('id-ID').format(p) }

function savingsPercent(price: number): number {
  const marketAvg = getAvgPriceByCommodity(product?.commodityId || '')
  if (!marketAvg) return 0
  return Math.round((1 - price / marketAvg) * 100)
}

function handleWishlistToggle() {
  if (!isLoggedIn.value) { localStorage.setItem('redirect_after_login', '/produk/' + productId); router.push('/masuk'); return }
  toggle(product.id)
}

async function handleAddToCart() {
  if (!product) return
  if (!isLoggedIn.value) { localStorage.setItem('redirect_after_login', '/cart'); router.push('/masuk'); return }
  await addToCart(product.id, 1)
  alert(product.name + ' ditambahkan ke keranjang!')
}

function handleAddReview() {
  if (!reviewComment.value) return
  const result = addReview({ productId: product.id, userId: user.value.id, userName: user.value.name, rating: reviewRating.value, comment: reviewComment.value })
  if (!result) { alert('Anda belum pernah membeli produk ini atau pesanan belum selesai.'); return }
  reviewComment.value = ''; reviewRating.value = 5; showReviewForm.value = false; window.scrollTo(0, 0); refreshKey.value++
}

function handleToggleAlert() {
  if (!product || !userId.value) { router.push('/masuk'); return }
  togglePriceAlert(userId.value, product.commodityId)
}

const marketPrices = computed(() => {
  if (!product) return []
  return getPriceComparison(product.commodityId)
})
const marketCount = computed(() => getMarkets().length)

function stars(n: number): string { return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n)) }
</script>

<template>
  <div class="container py-4" v-if="product">
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><router-link to="/marketplace" class="text-success">Marketplace</router-link></li>
        <li class="breadcrumb-item active fw-semibold">{{ product.name }}</li>
      </ol>
    </nav>

    <div class="row g-4">
      <div class="col-lg-6">
        <div style="border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); background:#f8f9fa;display:flex;align-items:center;justify-content:center;min-height:400px;">
          <img v-if="product.image && (product.image.startsWith('data:') || product.image.startsWith('http'))" :src="product.image" :alt="product.name" class="w-100" style="height: 400px; object-fit: cover;">
          <span v-else-if="product.image" class="fs-1" style="font-size:6rem!important;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.1))">{{ product.image }}</span>
          <i v-else class="bi bi-image text-muted" style="font-size:6rem"></i>
        </div>
      </div>
      <div class="col-lg-6">
        <span class="badge bg-secondary fs-6 mb-2">{{ product.commodityId }}</span>
        <h2 class="fw-bold">{{ product.name }}</h2>
        <div class="d-flex align-items-center gap-2 mb-3">
          <span class="text-warning fs-5">{{ stars(avgRating) }}</span>
          <span class="fw-semibold">{{ avgRating > 0 ? avgRating.toFixed(1) : '-' }}</span>
          <span class="text-muted">({{ reviews.length }} ulasan)</span>
        </div>

        <div class="p-4 bg-light rounded-3 mb-3">
          <div class="d-flex align-items-baseline gap-3">
            <span class="text-success fw-bold fs-2">Rp{{ formatPrice(product.price) }}</span>
            <span class="text-muted small">/{{ product.unit }}</span>
            <span v-if="getAvgPriceByCommodity(product.commodityId) > product.price" class="badge bg-danger fs-6">
              Hemat {{ savingsPercent(product.price) }}%
            </span>
          </div>
          <div class="mt-2 text-muted">
            Rata-rata {{ marketCount }} pasar: <strong>Rp{{ formatPrice(getAvgPriceByCommodity(product.commodityId)) }}/{{ product.unit }}</strong>
          </div>
          <div class="mt-2">
            <button class="btn btn-sm btn-outline-success" type="button" @click="showMarketPrices = !showMarketPrices">
              <i class="bi bi-list-ul me-1"></i>Lihat Harga per Pasar
            </button>
          </div>
          <div v-if="showMarketPrices" class="mt-2 p-2 bg-white rounded-3 border" style="max-height:240px;overflow-y:auto;">
            <div v-for="mp in marketPrices" :key="mp.marketId" class="d-flex justify-content-between align-items-center py-2 border-bottom small">
              <div>
                <span class="fw-semibold">{{ mp.marketName }}</span>
                <span class="text-muted ms-1">({{ mp.marketCity }})</span>
              </div>
              <div class="text-end">
                <span class="fw-bold text-success">Rp{{ formatPrice(mp.avgPrice) }}</span>
                <span :class="mp.trend === 'up' ? 'text-danger' : mp.trend === 'down' ? 'text-success' : 'text-secondary'" class="ms-1">
                  <i :class="'bi bi-arrow-' + (mp.trend === 'up' ? 'up' : mp.trend === 'down' ? 'down' : 'right') + '-short'"></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        <p class="text-muted fs-5">{{ product.description }}</p>

        <div class="d-flex align-items-center gap-2 mb-3">
          <span class="fw-semibold fs-5">Stok: {{ product.stock > 0 ? product.stock + ' ' + product.unit : 'Habis' }}</span>
          <span class="badge" :class="product.status === 'active' ? 'bg-success' : product.status === 'sold_out' ? 'bg-warning' : 'bg-secondary'">
            {{ product.status === 'active' ? 'Tersedia' : product.status === 'sold_out' ? 'Habis' : 'Nonaktif' }}
          </span>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-success btn-lg flex-grow-1" :disabled="product.status !== 'active'" @click="handleAddToCart">
            <i class="bi bi-cart-plus me-2"></i>Masukkan Keranjang
          </button>
          <button class="btn btn-outline-danger btn-lg" @click="handleWishlistToggle">
            <i :class="isInWishlist(product.id) ? 'bi-heart-fill' : 'bi-heart'"></i>
          </button>
          <button class="btn" :class="hasAlert ? 'btn-success' : 'btn-outline-success'" @click="handleToggleAlert" :title="hasAlert ? 'Nonaktifkan notifikasi' : 'Aktifkan notifikasi perubahan harga'">
            <i class="bi bi-bell" :class="hasAlert ? 'bi-bell-fill' : 'bi-bell'"></i>
          </button>
        </div>

        <div class="mt-4 p-3 bg-success bg-opacity-10 rounded-3 d-flex align-items-center gap-3">
          <i class="bi bi-truck fs-2 text-success"></i>
          <div>
            <span class="fw-semibold">Gratis Ongkir</span>
            <span class="d-block text-muted small">Untuk pembelian pertama + COD tersedia</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm mt-4">
      <div class="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-bold"><i class="bi bi-graph-up text-success me-2"></i>Tren Harga Pasar</h5>
        <div class="btn-group btn-group-sm">
          <button class="btn" :class="chartDays === 7 ? 'btn-success' : 'btn-outline-success'" @click="chartDays = 7">7 Hari</button>
          <button class="btn" :class="chartDays === 30 ? 'btn-success' : 'btn-outline-success'" @click="chartDays = 30">30 Hari</button>
          <button class="btn" :class="chartDays === 90 ? 'btn-success' : 'btn-outline-success'" @click="chartDays = 90">90 Hari</button>
        </div>
      </div>
      <div class="card-body">
        <div style="height: 200px;" class="d-flex align-items-end gap-1">
          <div v-for="(h, i) in priceHistory" :key="h.date" class="d-flex flex-column align-items-center" style="flex:1;min-width:3px;">
            <div class="w-100 rounded-top" :style="{ height: (h.avgPrice / chartMax * 100) + '%', backgroundColor: h.avgPrice >= priceHistory[Math.max(0, i-1)]?.avgPrice ? '#dc3545' : '#198754', minHeight: '3px', opacity: 0.7 }" :title="h.date + ': Rp' + formatPrice(h.avgPrice)"></div>
          </div>
        </div>
        <div class="text-center small text-muted mt-1">Tertinggi: Rp{{ formatPrice(Math.max(...priceHistory.map(p => p.avgPrice))) }} | Terendah: Rp{{ formatPrice(Math.min(...priceHistory.map(p => p.avgPrice))) }}</div>
      </div>
    </div>

    <div class="row mt-5">
      <div class="col-12">
        <h4 class="fw-bold mb-4"><i class="bi bi-star text-warning me-2"></i>Ulasan Pembeli ({{ reviews.length }})</h4>
        <div v-if="reviews.length === 0" class="text-muted mb-4">Belum ada ulasan untuk produk ini.</div>
        <div v-for="r in reviews" :key="r.id" class="card border-0 shadow-sm mb-2">
          <div class="card-body py-3">
            <div class="d-flex justify-content-between">
              <span class="fw-semibold">{{ r.userName }}</span>
              <span class="text-warning">{{ stars(r.rating) }}</span>
            </div>
            <p class="mb-1 text-muted">{{ r.comment }}</p>
            <small class="text-muted">{{ new Date(r.createdAt).toLocaleDateString('id-ID') }}</small>
          </div>
        </div>

        <div v-if="isLoggedIn && user" class="card border-0 shadow-sm mt-3">
          <div class="card-body">
            <button v-if="!showReviewForm" class="btn btn-success" @click="showReviewForm = true">
              <i class="bi bi-pencil me-1"></i>Tulis Ulasan
            </button>
            <form v-else @submit.prevent="handleAddReview">
              <div class="mb-2">
                <label class="form-label fw-semibold">Rating</label>
                <select v-model="reviewRating" class="form-select w-auto">
                  <option :value="5">★★★★★</option>
                  <option :value="4">★★★★☆</option>
                  <option :value="3">★★★☆☆</option>
                  <option :value="2">★★☆☆☆</option>
                  <option :value="1">★☆☆☆☆</option>
                </select>
              </div>
              <div class="mb-2">
                <textarea v-model="reviewComment" class="form-control" rows="2" placeholder="Bagikan pengalaman Anda..." required></textarea>
              </div>
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-success">Kirim</button>
                <button type="button" class="btn btn-outline-secondary" @click="showReviewForm = false">Batal</button>
              </div>
            </form>
          </div>
        </div>
        <div v-else-if="!isLoggedIn" class="mt-3">
          <router-link to="/masuk" class="btn btn-outline-success">
            <i class="bi bi-box-arrow-in-right me-1"></i>Masuk untuk memberi ulasan
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
