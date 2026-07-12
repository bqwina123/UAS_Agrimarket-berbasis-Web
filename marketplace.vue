<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getProducts, getCommodities, getAvgPriceByCommodity, getPriceComparison, getMarkets } from '@/services/db'
import { useAuth } from '@/services/authService'
import { useCart } from '@/services/cartService'
import { useWishlist } from '@/services/wishlistService'
import { useReviews } from '@/services/reviewService'

const router = useRouter()
const { isLoggedIn } = useAuth()
const { count: cartCount, addToCart } = useCart()
const { isInWishlist, toggle } = useWishlist()
const { getAvgRating, getRatingCount } = useReviews()

const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref<'price' | 'name'>('price')
const showAvailableOnly = ref(true)

const commodities = getCommodities()
const categories = ['', ...new Set(commodities.map(c => c.category))]

const filtered = computed(() => {
  let result = [...getProducts()]
  if (showAvailableOnly.value) result = result.filter(p => p.isAvailable && p.stock > 0)
  if (selectedCategory.value) result = result.filter(p => {
    const c = commodities.find(cm => cm.id === p.commodityId)
    return c?.category === selectedCategory.value
  })
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(q))
  }
  if (sortBy.value === 'price') result.sort((a, b) => a.price - b.price)
  else result.sort((a, b) => a.name.localeCompare(b.name))
  return result
})

function formatPrice(p: number): string { return new Intl.NumberFormat('id-ID').format(p) }

function savingsPercent(price: number, commodityId: string): number {
  const marketAvg = getAvgPriceByCommodity(commodityId)
  if (marketAvg === 0) return 0
  return Math.round((1 - price / marketAvg) * 100)
}

async function handleAddToCart(product: any) {
  if (!isLoggedIn.value) {
    localStorage.setItem('redirect_after_login', '/cart')
    router.push('/masuk')
    return
  }
  await addToCart(product.id, 1)
  alert(`✓ ${product.name} ditambahkan ke keranjang!`)
}

function handleWishlistToggle(productId: string) {
  if (!isLoggedIn.value) { router.push('/masuk'); return }
  toggle(productId)
}

function goToDetail(id: string) { router.push('/produk/' + id) }

function stars(r: number): string {
  return '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r))
}

function getCategoryName(commodityId: string): string {
  return commodities.find(c => c.id === commodityId)?.category || ''
}
const expandedMarket = ref<string>('')
function toggleMarketPrices(productId: string) {
  expandedMarket.value = expandedMarket.value === productId ? '' : productId
}
function getMarketPricesForCommodity(commodityId: string) {
  return getPriceComparison(commodityId)
}
const marketCount = getMarkets().length
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold"><i class="bi bi-shop text-success me-2"></i>Marketplace Petani</h2>
        <p class="text-muted mb-0 fs-5">Beli langsung dari petani, harga lebih murah tanpa tengkulak</p>
      </div>
      <router-link to="/cart" class="btn btn-success position-relative btn-lg">
        <i class="bi bi-cart3"></i>
        <span v-if="cartCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{{ cartCount }}</span>
      </router-link>
    </div>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label fw-semibold fs-5">Cari Produk</label>
            <input v-model="searchQuery" class="form-control form-control-lg" placeholder="Nama produk...">
          </div>
          <div class="col-md-3">
            <label class="form-label fw-semibold fs-5">Kategori</label>
            <select v-model="selectedCategory" class="form-select form-select-lg">
              <option value="">Semua</option>
              <option v-for="c in categories.slice(1)" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label fw-semibold fs-5">Urutkan</label>
            <select v-model="sortBy" class="form-select form-select-lg">
              <option value="price">Harga Termurah</option>
              <option value="name">Nama A-Z</option>
            </select>
          </div>
          <div class="col-md-2">
            <div class="form-check mt-4">
              <input v-model="showAvailableOnly" id="avail" type="checkbox" class="form-check-input" style="width:1.3rem;height:1.3rem">
              <label for="avail" class="form-check-label fw-semibold fs-5">Tersedia</label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filtered.length === 0" class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-3"></i>
      <h5>Tidak ada produk ditemukan</h5>
    </div>

    <div class="row g-4">
      <div v-for="p in filtered" :key="p.id" class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm h-100 card-hover" style="cursor:pointer; transition: transform 0.2s;" @mouseenter="($event.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'" @mouseleave="($event.currentTarget as HTMLElement).style.transform = ''">
          <div style="height: 200px; overflow: hidden; border-radius: 12px 12px 0 0; background: #f8f9fa; display:flex;align-items:center;justify-content:center;" @click="goToDetail(p.id)">
            <img v-if="p.image && (p.image.startsWith('data:') || p.image.startsWith('http'))" :src="p.image" :alt="p.name" style="width:100%;height:100%;object-fit:cover">
            <span v-else-if="p.image" class="fs-1" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.1))">{{ p.image }}</span>
            <i v-else class="bi bi-image text-muted fs-1"></i>
          </div>
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-secondary fs-6">{{ getCategoryName(p.commodityId) }}</span>
              <button class="btn btn-sm p-1" @click.stop="handleWishlistToggle(p.id)">
                <i :class="isInWishlist(p.id) ? 'bi-heart-fill text-danger' : 'bi-heart'" class="fs-5"></i>
              </button>
            </div>
            <h5 class="fw-bold" @click="goToDetail(p.id)">{{ p.name }}</h5>
            <div class="mb-2">
              <span class="text-warning">{{ stars(getAvgRating(p.id)) }}</span>
              <span class="text-muted ms-1 small">({{ getRatingCount(p.id) }})</span>
            </div>
            <p class="text-muted small flex-grow-1">{{ p.description }}</p>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div>
                <span class="text-success fw-bold fs-4">Rp{{ formatPrice(p.price) }}</span>
                <span class="text-muted ms-1 small">/{{ p.unit }}</span>
              </div>
              <span v-if="getAvgPriceByCommodity(p.commodityId) > p.price" class="badge bg-danger fs-6">
                Hemat {{ savingsPercent(p.price, p.commodityId) }}%
              </span>
            </div>
            <div class="small text-muted d-flex align-items-center gap-2">
              <span>Rata-rata {{ marketCount }} pasar: <strong>Rp{{ formatPrice(getAvgPriceByCommodity(p.commodityId)) }}/{{ p.unit }}</strong></span>
              <button class="btn btn-sm btn-link text-success p-0" @click.stop="toggleMarketPrices(p.id)">
                <i class="bi bi-chevron-down" v-if="expandedMarket !== p.id"></i>
                <i class="bi bi-chevron-up" v-else></i>
              </button>
            </div>
            <div v-if="expandedMarket === p.id" class="mt-1 p-2 bg-light rounded-3 small" @click.stop style="max-height:160px;overflow-y:auto;">
              <div v-for="mp in getMarketPricesForCommodity(p.commodityId)" :key="mp.marketId" class="d-flex justify-content-between py-1">
                <span>{{ mp.marketName }}</span>
                <span class="fw-semibold text-success">Rp{{ formatPrice(mp.avgPrice) }}</span>
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <small class="text-muted">Stok: {{ p.stock > 0 ? p.stock + ' ' + p.unit : 'Habis' }}</small>
              <button :disabled="!p.isAvailable || p.stock === 0" class="btn btn-success" @click.stop="handleAddToCart(p)">
                <i class="bi bi-cart-plus me-1"></i>Beli
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
