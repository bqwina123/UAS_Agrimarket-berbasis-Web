<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/authService'
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '@/services/db'

const router = useRouter()
const { user } = useAuth()

const items = ref(user.value ? getNotifications(user.value.id) : [])
const filterType = ref<string>('')

const filtered = computed(() => {
  if (!filterType.value) return items.value
  return items.value.filter(n => n.type === filterType.value)
})

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
}

function typeIcon(t: string): string {
  if (t === 'price_alert') return 'bi-graph-up-arrow text-danger'
  if (t === 'order_update') return 'bi-truck text-primary'
  if (t === 'promo') return 'bi-megaphone text-warning'
  if (t === 'new_product') return 'bi-bag-plus text-success'
  if (t === 'stock_empty') return 'bi-exclamation-triangle text-danger'
  if (t === 'cart') return 'bi-cart3 text-success'
  return 'bi-info-circle text-secondary'
}

function typeLabel(t: string): string {
  if (t === 'price_alert') return 'Harga'
  if (t === 'order_update') return 'Pesanan'
  if (t === 'promo') return 'Promo'
  if (t === 'new_product') return 'Produk Baru'
  if (t === 'stock_empty') return 'Stok Habis'
  if (t === 'cart') return 'Keranjang'
  return 'Sistem'
}

function handleMarkRead(n: { id: string; link?: string }) {
  markNotificationRead(n.id)
  if (n.link) router.push(n.link)
  if (user.value) items.value = getNotifications(user.value.id)
}

function handleMarkAll() {
  if (!user.value) return
  markAllNotificationsRead(user.value.id)
  items.value = getNotifications(user.value.id)
}

function handleDelete(id: string) {
  if (!confirm('Hapus notifikasi ini?')) return
  deleteNotification(id)
  if (user.value) items.value = getNotifications(user.value.id)
}

function reload() {
  if (user.value) items.value = getNotifications(user.value.id)
}

const unreadCount = computed(() => items.value.filter(n => !n.isRead).length)
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold"><i class="bi bi-bell text-success me-2"></i>Notifikasi</h2>
        <p class="text-muted mb-0">{{ unreadCount }} belum dibaca · {{ items.length }} total</p>
      </div>
      <div class="d-flex gap-2">
        <select v-model="filterType" class="form-select form-select-sm" style="max-width:160px;">
          <option value="">Semua</option>
          <option value="order_update">Pesanan</option>
          <option value="cart">Keranjang</option>
          <option value="price_alert">Harga</option>
          <option value="promo">Promo</option>
          <option value="new_product">Produk Baru</option>
          <option value="stock_empty">Stok Habis</option>
          <option value="system">Sistem</option>
        </select>
        <button v-if="unreadCount > 0" class="btn btn-sm btn-outline-success" @click="handleMarkAll"><i class="bi bi-check-all me-1"></i>Baca Semua</button>
      </div>
    </div>

    <div v-if="filtered.length === 0" class="text-center py-5 text-muted">
      <i class="bi bi-bell-slash fs-1 d-block mb-3"></i>
      <h5>Tidak ada notifikasi</h5>
    </div>

    <div class="list-group">
      <div v-for="n in filtered" :key="n.id" class="list-group-item border-0 shadow-sm mb-2 rounded-3" :class="{ 'bg-warning bg-opacity-10 border-start border-warning border-4': !n.isRead }">
        <div class="d-flex gap-3 align-items-start" @click="handleMarkRead(n)" style="cursor:pointer">
          <div class="fs-3"><i :class="typeIcon(n.type)"></i></div>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="fw-bold mb-1">{{ n.title }}</h6>
                <span class="badge bg-secondary bg-opacity-25 text-dark me-2 small">{{ typeLabel(n.type) }}</span>
              </div>
              <small class="text-muted text-nowrap">{{ formatDate(n.createdAt) }}</small>
            </div>
            <p class="mb-0 text-muted small">{{ n.message }}</p>
          </div>
          <div class="d-flex flex-column align-items-center gap-1">
            <span v-if="!n.isRead" class="badge bg-danger rounded-pill">baru</span>
            <button class="btn btn-sm btn-outline-danger p-1" @click.stop="handleDelete(n.id)" title="Hapus">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
