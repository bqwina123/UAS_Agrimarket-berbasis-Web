<script setup lang="ts">
import { ref, computed } from 'vue'
import { getCommodities, getMarketPrices, getAvgPriceByCommodity } from '@/services/db'

const commodities = getCommodities()
const marketPrices = getMarketPrices()

const searchQuery = ref('')
const selectedCategory = ref('')
const categories = [...new Set(commodities.map(c => c.category))]

const filteredCommodities = computed(() => {
  return commodities.filter(c => {
    if (selectedCategory.value && c.category !== selectedCategory.value) return false
    if (searchQuery.value && !c.name.toLowerCase().includes(searchQuery.value.toLowerCase())) return false
    return true
  })
})

function formatPrice(p: number): string { return new Intl.NumberFormat('id-ID').format(p) }

function getPriceInfo(commodityId: string) {
  const avg = getAvgPriceByCommodity(commodityId)
  const prices = marketPrices.filter(mp => mp.commodityId === commodityId)
  const min = prices.length > 0 ? Math.min(...prices.map(p => p.avgPrice)) : 0
  const max = prices.length > 0 ? Math.max(...prices.map(p => p.avgPrice)) : 0
  const marketCount = prices.length
  const trend = prices.filter(p => p.trend === 'up').length > prices.filter(p => p.trend === 'down').length ? 'up' : prices.filter(p => p.trend === 'down').length > prices.filter(p => p.trend === 'up').length ? 'down' : 'stable'
  return { avg, min, max, marketCount, trend }
}

function trendIcon(t: string): string {
  if (t === 'up') return 'bi-arrow-up-circle-fill text-danger'
  if (t === 'down') return 'bi-arrow-down-circle-fill text-success'
  return 'bi-dash-circle-fill text-secondary'
}
</script>

<template>
  <div class="container py-4">
    <div class="text-center mb-4">
      <h2 class="fw-bold"><i class="bi bi-flower1 text-success me-2"></i>AgriMarket</h2>
      <p class="text-muted fs-5">Cari harga pasar & belanja hasil tani langsung dari petani</p>
    </div>

    <div class="row justify-content-center mb-4">
      <div class="col-md-8">
        <div class="input-group input-group-lg">
          <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-success"></i></span>
          <input v-model="searchQuery" class="form-control border-start-0 ps-0" placeholder="Cari komoditas...">
          <select v-model="selectedCategory" class="form-select" style="max-width: 180px;">
            <option value="">Semua</option>
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div v-for="c in filteredCommodities" :key="c.id" class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span class="fs-3 me-2">{{ c.image }}</span>
                <span class="badge bg-secondary">{{ c.category }}</span>
              </div>
              <i :class="trendIcon(getPriceInfo(c.id).trend)" class="fs-4"></i>
            </div>
            <h5 class="fw-bold mb-0">{{ c.name }}</h5>
            <div class="mt-2">
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted">Rata-rata</span>
                <span class="fw-bold fs-5 text-success">Rp{{ formatPrice(getPriceInfo(c.id).avg) }}/{{ c.unit }}</span>
              </div>
              <div class="d-flex justify-content-between small text-muted mt-1">
                <span>Rp{{ formatPrice(getPriceInfo(c.id).min) }}</span>
                <span>—</span>
                <span>Rp{{ formatPrice(getPriceInfo(c.id).max) }}</span>
              </div>
            </div>
            <div class="mt-2 d-flex justify-content-between align-items-center">
              <small class="text-muted"><i class="bi bi-shop me-1"></i>{{ getPriceInfo(c.id).marketCount }} pasar</small>
              <router-link :to="'/harga?c=' + c.id + '&mode=chart'" class="btn btn-sm btn-outline-success">Grafik</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredCommodities.length === 0" class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>
      <p>Komoditas tidak ditemukan</p>
    </div>
  </div>
</template>
