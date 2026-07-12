<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/authService'
import { useWishlist } from '@/services/wishlistService'
import { getProducts, getAvgPriceByCommodity, getWishlistProductPrice } from '@/services/db'

const router = useRouter()
const { isLoggedIn } = useAuth()
if (!isLoggedIn.value) { router.push('/masuk') }
const { items, count, remove, isInWishlist } = useWishlist()

const wishlistProducts = computed(() => {
  return items.value.map(w => {
    const product = getProducts().find(p => p.id === w.productId)
    if (!product) return null
    const addedPrice = getWishlistProductPrice(w.productId)
    const currentPrice = product.price
    const hasPriceDrop = currentPrice < addedPrice
    const dropPercent = hasPriceDrop ? Math.round((1 - currentPrice / addedPrice) * 100) : 0
    return { ...product, wishlistId: w.id, addedAt: w.addedAt, addedPrice, dropPercent, hasPriceDrop }
  }).filter(Boolean)
})

function formatPrice(p: number): string { return new Intl.NumberFormat('id-ID').format(p) }

function getCategory(commodityId: string): string {
  const commodities = ['Pangan', 'Sayuran', 'Buah', 'Bumbu']
  return ''
}

function handleRemove(productId: string) {
  if (confirm('Hapus dari favorit?')) { remove(productId) }
}

function handleAddToCart(product: any) {
  router.push('/produk/' + product.id)
}

function stars(r: number): string {
  return '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r))
}
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold"><i class="bi bi-heart text-danger me-2"></i>Wishlist / Favorit</h2>
        <p class="text-muted mb-0 fs-5">{{ count }} produk tersimpan</p>
      </div>
      <router-link to="/marketplace" class="btn btn-success btn-lg">
        <i class="bi bi-shop me-1"></i>Belanja
      </router-link>
    </div>

    <div v-if="wishlistProducts.length === 0" class="text-center py-5 text-muted">
      <i class="bi bi-heartbreak fs-1 d-block mb-3"></i>
      <h5>Belum ada produk favorit</h5>
      <p class="text-muted">Tambahkan produk ke wishlist dari Marketplace</p>
      <router-link to="/marketplace" class="btn btn-success"><i class="bi bi-shop me-1"></i>Mulai Belanja</router-link>
    </div>

    <div class="row g-3">
      <div v-for="p in wishlistProducts" :key="p.id" class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <div style="height: 180px; overflow: hidden; border-radius: 12px 12px 0 0; background: #f8f9fa; display:flex;align-items:center;justify-content:center;" @click="router.push('/produk/' + p.id)">
            <img v-if="p.image && (p.image.startsWith('data:') || p.image.startsWith('http'))" :src="p.image" :alt="p.name" style="width:100%;height:100%;object-fit:cover">
            <span v-else-if="p.image" class="fs-1" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.1))">{{ p.image }}</span>
            <i v-else class="bi bi-image text-muted fs-1"></i>
          </div>
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start">
              <h5 class="fw-bold" @click="router.push('/produk/' + p.id)" style="cursor:pointer">{{ p.name }}</h5>
              <button class="btn btn-sm text-danger p-0" @click="handleRemove(p.id)" title="Hapus dari favorit">
                <i class="bi bi-x-lg fs-5"></i>
              </button>
            </div>
            <p class="text-muted small flex-grow-1">{{ p.description }}</p>

            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-success fw-bold fs-5">Rp{{ formatPrice(p.price) }}/{{ p.unit }}</span>
            </div>

            <div v-if="p.hasPriceDrop" class="p-2 bg-danger bg-opacity-10 rounded-3 mb-2">
              <span class="text-danger fw-semibold small">
                <i class="bi bi-arrow-down-circle me-1"></i>Harga turun {{ p.dropPercent }}%! (Rp{{ formatPrice(p.addedPrice) }} → Rp{{ formatPrice(p.price) }})
              </span>
            </div>
            <div v-else class="small text-muted mb-2">
              Harga saat ditambahkan: Rp{{ formatPrice(p.addedPrice) }}/{{ p.unit }}
            </div>

            <div class="d-flex gap-2">
              <router-link :to="'/produk/' + p.id" class="btn btn-success flex-grow-1">
                <i class="bi bi-cart-plus me-1"></i>Beli
              </router-link>
              <button class="btn btn-outline-danger" @click="handleRemove(p.id)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
