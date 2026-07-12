<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/services/authService'
import { getOrders, getTransactionReport, getFarmerReport, getMarketPriceReport, getCommodities, getMarkets, getProducts } from '@/services/db'

const { isAdmin, isPetani, user } = useAuth()

const activeTab = ref<'transactions' | 'farmer' | 'prices'>('transactions')

const commodities = getCommodities()
const markets = getMarkets()

const transactionReport = computed(() => getTransactionReport())
const selectedCommodity = ref('')

const priceReport = computed(() => getMarketPriceReport(selectedCommodity.value || undefined))
const farmerReport = computed(() => user.value ? getFarmerReport(user.value.id) : null)

function formatPrice(p: number): string { return new Intl.NumberFormat('id-ID').format(p) }

function exportCSV() {
  const orders = transactionReport.value.orders
  let csv = 'ID,Tanggal,Total,Status\n'
  csv += orders.map(o => `${o.id.slice(-6).toUpperCase()},${o.createdAt.slice(0,10)},${o.totalPrice},${o.status}`).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'laporan_transaksi.csv'; a.click()
  URL.revokeObjectURL(url)
}

function printReport() { window.print() }
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold"><i class="bi bi-file-text text-success me-2"></i>Laporan</h2>
        <p class="text-muted mb-0">Ekspor data dan analisis</p>
      </div>
    </div>

    <ul class="nav nav-pills mb-4 gap-2">
      <li class="nav-item"><button class="nav-link" :class="{ active: activeTab === 'transactions' }" @click="activeTab = 'transactions'"><i class="bi bi-cart"></i> Transaksi</button></li>
      <li v-if="isPetani" class="nav-item"><button class="nav-link" :class="{ active: activeTab === 'farmer' }" @click="activeTab = 'farmer'"><i class="bi bi-person-workspace"></i> Penjualan Saya</button></li>
      <li class="nav-item"><button class="nav-link" :class="{ active: activeTab === 'prices' }" @click="activeTab = 'prices'"><i class="bi bi-graph-up"></i> Harga Pasar</button></li>
    </ul>

    <div v-if="activeTab === 'transactions'">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0 fw-bold">Laporan Transaksi</h5>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-success" @click="exportCSV"><i class="bi bi-download me-1"></i>Export CSV</button>
            <button class="btn btn-sm btn-outline-success" @click="printReport"><i class="bi bi-printer me-1"></i>Cetak</button>
          </div>
        </div>
        <div class="card-body">
          <div class="row g-3 mb-3">
            <div class="col-md-4"><div class="bg-light rounded-3 p-3 text-center"><small class="text-muted">Total Pesanan</small><div class="fs-3 fw-bold">{{ transactionReport.totalOrders }}</div></div></div>
            <div class="col-md-4"><div class="bg-light rounded-3 p-3 text-center"><small class="text-muted">Total Pendapatan</small><div class="fs-3 fw-bold text-success">Rp{{ formatPrice(transactionReport.totalRevenue) }}</div></div></div>
            <div class="col-md-4"><div class="bg-light rounded-3 p-3 text-center"><small class="text-muted">Rata-rata Pesanan</small><div class="fs-3 fw-bold">Rp{{ formatPrice(transactionReport.avgOrderValue) }}</div></div></div>
          </div>
          <div class="table-responsive" id="printTable">
            <table class="table table-hover">
              <thead class="table-success"><tr><th>ID</th><th>Tanggal</th><th>Status</th><th class="text-end">Total</th></tr></thead>
              <tbody>
                <tr v-for="o in transactionReport.orders" :key="o.id">
                  <td class="fw-semibold">#{{ o.id.slice(-6).toUpperCase() }}</td>
                  <td>{{ new Date(o.createdAt).toLocaleDateString('id-ID') }}</td>
                  <td><span class="badge" :class="o.status==='delivered'?'bg-success':'bg-info'">{{ o.status }}</span></td>
                  <td class="text-end fw-bold">Rp{{ formatPrice(o.totalPrice) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'farmer' && farmerReport">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h5 class="mb-0 fw-bold">Laporan Penjualan</h5></div>
        <div class="card-body">
          <div class="row g-3 mb-3">
            <div class="col-md-4"><div class="bg-light rounded-3 p-3 text-center"><small class="text-muted">Total Pesanan</small><div class="fs-3 fw-bold">{{ farmerReport.totalOrders }}</div></div></div>
            <div class="col-md-4"><div class="bg-light rounded-3 p-3 text-center"><small class="text-muted">Pendapatan</small><div class="fs-3 fw-bold text-success">Rp{{ formatPrice(farmerReport.totalRevenue) }}</div></div></div>
            <div class="col-md-4"><div class="bg-light rounded-3 p-3 text-center"><small class="text-muted">Produk Terjual</small><div class="fs-3 fw-bold">{{ farmerReport.totalProducts }}</div></div></div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'prices'">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0 fw-bold">Laporan Harga Pasar</h5>
          <select v-model="selectedCommodity" class="form-select w-auto">
            <option value="">Semua Komoditas</option>
            <option v-for="c in commodities" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="card-body">
          <div class="row g-3 mb-3">
            <div class="col-md-6"><div class="bg-light rounded-3 p-3 text-center"><small class="text-muted">Rata-rata Harga</small><div class="fs-3 fw-bold text-success">Rp{{ formatPrice(priceReport.avgPrice) }}</div></div></div>
            <div class="col-md-6"><div class="bg-light rounded-3 p-3 text-center"><small class="text-muted">Total Data</small><div class="fs-3 fw-bold">{{ priceReport.totalData }}</div></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
