<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getCommodities, getMarketPrices, getMarkets, getAvgPriceByCommodity, getPriceComparison, getPriceHistory, getMarketProvinces, getMarketCities } from '@/services/db'

const route = useRoute()
const routeCommodity = route.query.c as string || ''

const commodities = getCommodities()
const markets = getMarkets()
const allPrices = getMarketPrices()

const selectedCommodity = ref(routeCommodity)
const selectedProvince = ref('')
const selectedCity = ref('')
const viewMode = ref<'table' | 'compare' | 'chart'>('table')
const chartDays = ref<7 | 30 | 90>(30)

const provinces = getMarketProvinces()
const cities = computed(() => {
  if (!selectedProvince.value) return []
  return markets.filter(m => m.province === selectedProvince.value).map(m => m.city)
})

const filteredPrices = computed(() => {
  let prices = allPrices
  if (selectedCommodity.value) prices = prices.filter(p => p.commodityId === selectedCommodity.value)
  const marketIds = new Set(markets
    .filter(m => (!selectedProvince.value || m.province === selectedProvince.value) && (!selectedCity.value || m.city === selectedCity.value))
    .map(m => m.id))
  if (selectedProvince.value || selectedCity.value) prices = prices.filter(p => marketIds.has(p.marketId))
  return prices
})

const comparisonData = computed(() => {
  if (!selectedCommodity.value) return []
  return getPriceComparison(selectedCommodity.value)
})

const priceHistory = computed(() => {
  if (!selectedCommodity.value) return []
  return getPriceHistory(selectedCommodity.value, chartDays.value)
})

const chartMax = computed(() => {
  if (priceHistory.value.length === 0) return 0
  return Math.max(...priceHistory.value.map(p => p.avgPrice)) * 1.15
})

function formatPrice(p: number): string { return new Intl.NumberFormat('id-ID').format(p) }
function getCommodityName(id: string): string { return commodities.find(c => c.id === id)?.name || id }
function getMarketName(id: string): string { return markets.find(m => m.id === id)?.name || id }

function trendBadge(t: string): string {
  if (t === 'up') return 'badge bg-danger'
  if (t === 'down') return 'badge bg-success'
  return 'badge bg-secondary'
}
function trendLabel(t: string): string {
  if (t === 'up') return 'Naik'
  if (t === 'down') return 'Turun'
  return 'Stabil'
}
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold"><i class="bi bi-graph-up text-success me-2"></i>Harga Pasar</h2>
        <p class="text-muted mb-0 fs-5">Bandingkan harga dari {{ markets.length }} pasar tradisional</p>
      </div>
    </div>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label fw-semibold">Komoditas</label>
            <select v-model="selectedCommodity" class="form-select form-select-lg">
              <option value="">Semua Komoditas</option>
              <option v-for="c in commodities" :key="c.id" :value="c.id">{{ c.image }} {{ c.name }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label fw-semibold">Provinsi</label>
            <select v-model="selectedProvince" class="form-select form-select-lg">
              <option value="">Semua Provinsi</option>
              <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label fw-semibold">Kota</label>
            <select v-model="selectedCity" class="form-select form-select-lg" :disabled="!selectedProvince">
              <option value="">Semua Kota</option>
              <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <div class="btn-group w-100">
              <button class="btn" :class="viewMode === 'table' ? 'btn-success' : 'btn-outline-success'" @click="viewMode = 'table'">Tabel</button>
              <button class="btn" :class="viewMode === 'compare' ? 'btn-success' : 'btn-outline-success'" @click="viewMode = 'compare'">Bandingkan</button>
              <button class="btn" :class="viewMode === 'chart' ? 'btn-success' : 'btn-outline-success'" @click="viewMode = 'chart'">Grafik</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="viewMode === 'table'" class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-success">
            <tr>
              <th>Komoditas</th>
              <th>Pasar</th>
              <th class="text-end">Rata-rata</th>
              <th class="text-end">Min</th>
              <th class="text-end">Max</th>
              <th class="text-center">Trend</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filteredPrices.slice(0, 100)" :key="p.id">
              <td class="fw-semibold">{{ getCommodityName(p.commodityId) }}</td>
              <td>{{ getMarketName(p.marketId) }}</td>
              <td class="text-end fw-bold text-success fs-5">Rp{{ formatPrice(p.avgPrice) }}</td>
              <td class="text-end text-muted">Rp{{ formatPrice(p.minPrice) }}</td>
              <td class="text-end text-muted">Rp{{ formatPrice(p.maxPrice) }}</td>
              <td class="text-center"><span :class="trendBadge(p.trend)">{{ trendLabel(p.trend) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer bg-white text-muted small text-center">Menampilkan 100 dari {{ filteredPrices.length }} data</div>
    </div>

    <div v-if="viewMode === 'compare' && selectedCommodity" class="card border-0 shadow-sm">
      <div class="card-header bg-white">
        <h5 class="mb-0 fw-bold">Perbandingan Harga: {{ getCommodityName(selectedCommodity) }}</h5>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-success">
            <tr>
              <th>Pasar</th>
              <th>Kota</th>
              <th>Provinsi</th>
              <th class="text-end">Harga</th>
              <th class="text-end">Min</th>
              <th class="text-end">Max</th>
              <th class="text-center">Trend</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in comparisonData" :key="p.id">
              <td class="fw-semibold">{{ p.marketName }}</td>
              <td>{{ p.marketCity }}</td>
              <td>{{ p.marketProvince }}</td>
              <td class="text-end fw-bold text-success fs-5">Rp{{ formatPrice(p.avgPrice) }}</td>
              <td class="text-end text-muted">Rp{{ formatPrice(p.minPrice) }}</td>
              <td class="text-end text-muted">Rp{{ formatPrice(p.maxPrice) }}</td>
              <td class="text-center"><span :class="trendBadge(p.trend)">{{ trendLabel(p.trend) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else-if="viewMode === 'compare' && !selectedCommodity" class="text-center py-5 text-muted">
      <h5>Pilih komoditas untuk membandingkan harga antar pasar</h5>
    </div>

    <div v-if="viewMode === 'chart'">
      <div v-if="!selectedCommodity" class="text-center py-5 text-muted">
        <h5>Pilih komoditas untuk melihat grafik tren harga</h5>
      </div>
      <div v-else class="card border-0 shadow-sm">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0 fw-bold">Tren Harga: {{ getCommodityName(selectedCommodity) }}</h5>
          <div class="btn-group btn-group-sm">
            <button class="btn" :class="chartDays === 7 ? 'btn-success' : 'btn-outline-success'" @click="chartDays = 7">7 Hari</button>
            <button class="btn" :class="chartDays === 30 ? 'btn-success' : 'btn-outline-success'" @click="chartDays = 30">30 Hari</button>
            <button class="btn" :class="chartDays === 90 ? 'btn-success' : 'btn-outline-success'" @click="chartDays = 90">90 Hari</button>
          </div>
        </div>
        <div class="card-body">
          <div style="height: 300px; position: relative;" class="d-flex align-items-end gap-1 px-2">
            <div v-for="(h, i) in priceHistory" :key="h.date" class="d-flex flex-column align-items-center" style="flex:1;min-width:4px;">
              <div class="w-100 rounded-top" 
                :style="{ height: (h.avgPrice / chartMax * 100) + '%', backgroundColor: h.avgPrice >= priceHistory[Math.max(0, i-1)]?.avgPrice ? '#dc3545' : '#198754', minHeight: '4px', opacity: 0.8 }"
                :title="h.date + ': Rp' + formatPrice(h.avgPrice)">
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-between small text-muted mt-2">
            <span>{{ priceHistory.length > 0 ? priceHistory[0].date : '' }}</span>
            <span>{{ priceHistory.length > 0 ? priceHistory[priceHistory.length - 1].date : '' }}</span>
          </div>
          <div class="d-flex flex-wrap gap-2 mt-3 justify-content-center">
            <span class="badge bg-danger">Naik</span>
            <span class="badge bg-success">Turun</span>
            <span class="text-muted ms-2">Tertinggi: Rp{{ formatPrice(Math.max(...priceHistory.map(p => p.avgPrice))) }}</span>
            <span class="text-muted">Terendah: Rp{{ formatPrice(Math.min(...priceHistory.map(p => p.avgPrice))) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
