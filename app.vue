<script setup lang="ts">
import { onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { syncAllFromAPI } from '@/services/dataSync'

onMounted(() => {
  syncAllFromAPI()
})
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <NavBar />
    <main class="flex-grow-1 bg-light">
      <router-view />
    </main>
    <footer class="bg-dark text-white py-4">
      <div class="container">
        <div class="row g-3">
          <div class="col-md-4">
            <h5 class="fw-bold text-success"><i class="bi bi-flower1 me-2"></i>AgriMarket</h5>
            <p class="small text-muted">Platform marketplace pertanian yang menghubungkan petani langsung dengan pembeli. Transparansi harga dari 500+ pasar tradisional.</p>
          </div>
          <div class="col-md-2">
            <h6 class="fw-bold">Menu</h6>
            <div class="d-flex flex-column gap-1 small">
              <router-link to="/" class="text-muted text-decoration-none">Dashboard</router-link>
              <router-link to="/marketplace" class="text-muted text-decoration-none">Marketplace</router-link>
              <router-link to="/harga" class="text-muted text-decoration-none">Harga Pasar</router-link>
              <router-link to="/laporan" class="text-muted text-decoration-none">Laporan</router-link>
            </div>
          </div>
          <div class="col-md-3">
            <h6 class="fw-bold">Akun</h6>
            <div class="d-flex flex-column gap-1 small">
              <router-link to="/profil" class="text-muted text-decoration-none">Profil</router-link>
              <router-link to="/pesanan" class="text-muted text-decoration-none">Pesanan</router-link>
              <router-link to="/notifikasi" class="text-muted text-decoration-none">Notifikasi</router-link>
            </div>
          </div>
          <div class="col-md-3">
            <h6 class="fw-bold">Kontak</h6>
            <div class="d-flex flex-column gap-1 small text-muted">
              <span><i class="bi bi-envelope me-1"></i>hello@agrimarket.id</span>
              <span><i class="bi bi-telephone me-1"></i>021-1234-5678</span>
              <span><i class="bi bi-geo-alt me-1"></i>Jakarta, Indonesia</span>
            </div>
          </div>
        </div>
        <hr class="border-secondary my-3">
        <div class="text-center small text-muted">
          <i class="bi bi-flower1 me-1 text-success"></i>
          AgriMarket &copy; 2026 - Transparansi Harga untuk Petani Indonesia
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f8f9fa;
}
.card { border-radius: 12px; }
.card-header { border-radius: 12px 12px 0 0 !important; }
.btn { border-radius: 10px; }
.form-control, .form-select { border-radius: 10px; }
.badge { font-weight: 500; }
.table > :not(caption) > * > * { vertical-align: middle; }
.modal { --bs-modal-border-radius: 16px; }
</style>
