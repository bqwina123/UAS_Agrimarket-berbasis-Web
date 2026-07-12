<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/services/authService'
import { useCart } from '@/services/cartService'
import { useWishlist } from '@/services/wishlistService'
import { getUnreadCount } from '@/services/db'

const route = useRoute()
const router = useRouter()
const { isLoggedIn, user, role, isAdmin, logout } = useAuth()
const { count: cartCount } = useCart()
const { count: wishlistCount } = useWishlist()

const unreadCount = computed(() => {
  void route.path // re-evaluate on route change
  return user.value?.id ? getUnreadCount(user.value.id) : 0
})

const navLinks = computed(() => {
  const links: { path: string; label: string; icon: string }[] = [
    { path: '/', label: 'Dashboard', icon: 'bi-house-door' },
    { path: '/marketplace', label: 'Marketplace', icon: 'bi-shop' },
    { path: '/harga', label: 'Harga', icon: 'bi-graph-up' },
  ]
  if (isLoggedIn.value) {
    links.push({ path: '/pesanan', label: 'Pesanan', icon: 'bi-truck' })
  }
  if (isAdmin.value) {
    links.push({ path: '/admin', label: 'Admin', icon: 'bi-shield-lock' })
  }
  return links
})

function roleBadge(r: string | null): string {
  if (r === 'petani') return '🌾 Petani'
  if (r === 'pembeli') return '🛒 Pembeli'
  if (r === 'admin') return '👑 Admin'
  return ''
}

function handleLogout() {
  logout()
  router.push('/')
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-success sticky-top shadow-lg">
    <div class="container">
      <router-link to="/" class="navbar-brand fw-bold fs-4">
        <i class="bi bi-flower1 me-2"></i>AgriMarket
      </router-link>
      <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li v-for="link in navLinks" :key="link.path" class="nav-item">
            <router-link :to="link.path" class="nav-link fs-5 px-3" :class="{ active: route.path === link.path }">
              <i :class="link.icon" class="me-1"></i>{{ link.label }}
            </router-link>
          </li>
        </ul>
        <div class="d-flex align-items-center gap-2">
          <router-link to="/cart" class="btn btn-outline-light position-relative">
            <i class="bi bi-cart3 fs-5"></i>
            <span v-if="cartCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark border border-light">{{ cartCount }}</span>
          </router-link>
          <router-link to="/wishlist" class="btn btn-outline-light position-relative">
            <i class="bi bi-heart fs-5"></i>
            <span v-if="wishlistCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">{{ wishlistCount }}</span>
          </router-link>
          <router-link to="/notifikasi" class="btn btn-outline-light position-relative">
            <i class="bi bi-bell fs-5"></i>
            <span v-if="unreadCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">{{ unreadCount }}</span>
          </router-link>

          <template v-if="isLoggedIn && user">
            <div class="dropdown">
              <button class="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2" data-bs-toggle="dropdown">
                <span class="badge bg-white text-success fs-6">{{ roleBadge(role) }}</span>
                <span class="fw-semibold">{{ user.name.split(' ')[0] }}</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow" style="min-width: 220px;">
                <li><router-link to="/profil" class="dropdown-item fs-5"><i class="bi bi-person-circle me-2 text-success"></i>Profil Saya</router-link></li>
                <li v-if="role === 'petani'"><router-link to="/petani" class="dropdown-item fs-5"><i class="bi bi-person-workspace me-2 text-success"></i>Dashboard Petani</router-link></li>
                <li v-if="role === 'pembeli'"><router-link to="/pembeli" class="dropdown-item fs-5"><i class="bi bi-person me-2 text-success"></i>Dashboard Pembeli</router-link></li>
                <li v-if="role === 'admin'"><router-link to="/admin" class="dropdown-item fs-5"><i class="bi bi-shield-lock me-2 text-danger"></i>Dashboard Admin</router-link></li>
                <li><router-link to="/laporan" class="dropdown-item fs-5"><i class="bi bi-file-text me-2 text-success"></i>Laporan</router-link></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger fs-5" href="#" @click.prevent="handleLogout"><i class="bi bi-box-arrow-left me-2"></i>Keluar</a></li>
              </ul>
            </div>
          </template>
          <template v-else>
            <router-link to="/masuk" class="btn btn-light text-success fw-semibold"><i class="bi bi-box-arrow-in-right me-1"></i>Masuk</router-link>
            <router-link to="/daftar" class="btn btn-outline-light fw-semibold"><i class="bi bi-person-plus me-1"></i>Daftar</router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.nav-link.active { font-weight: 700; background: rgba(255,255,255,0.15); border-radius: 8px; }
.navbar .btn { border-radius: 10px; }
</style>
