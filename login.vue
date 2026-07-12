<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/authService'

const router = useRouter()
const { login } = useAuth()

const credential = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const loginMode = ref<'email' | 'phone'>('email')

async function handleLogin() {
  error.value = ''
  if (!credential.value || !password.value) { error.value = 'Isi semua field'; return }
  loading.value = true
  const result = await login(credential.value, password.value)
  loading.value = false
  if (result.success) {
    const target = localStorage.getItem('redirect_after_login') || '/'
    localStorage.removeItem('redirect_after_login')
    router.push(target)
  } else {
    error.value = result.error || 'Login gagal'
  }
}

function switchMode() {
  loginMode.value = loginMode.value === 'email' ? 'phone' : 'email'
  credential.value = ''
}
</script>

<template>
  <div class="min-vh-100 d-flex align-items-center py-4" style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%);">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-5">
          <div class="card border-0 shadow-lg" style="border-radius: 20px; overflow: hidden;">
            <div class="card-body p-4">
              <div class="text-center mb-3">
                <div class="bg-success text-white d-inline-flex align-items-center justify-content-center rounded-circle mb-2" style="width: 56px; height: 56px;">
                  <i class="bi bi-flower1 fs-3"></i>
                </div>
                <h4 class="fw-bold mb-1">Selamat Datang</h4>
                <p class="text-muted small">Masuk ke AgriMarket</p>
              </div>

              <form @submit.prevent="handleLogin">
                <div class="mb-2">
                  <label class="form-label small fw-semibold">{{ loginMode === 'email' ? 'Email' : 'Nomor Telepon' }}</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i :class="loginMode === 'email' ? 'bi bi-envelope' : 'bi bi-phone'" class="text-success"></i>
                    </span>
                    <input v-model="credential" :type="loginMode === 'email' ? 'email' : 'tel'" class="form-control border-start-0 ps-0" :placeholder="loginMode === 'email' ? 'contoh@email.com' : '0812xxxxxxx'" required>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="form-label small fw-semibold">Password</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="bi bi-lock text-success"></i>
                    </span>
                    <input v-model="password" type="password" class="form-control border-start-0 ps-0" placeholder="Masukkan password" required>
                  </div>
                </div>

                <div class="d-flex justify-content-between align-items-center mb-2">
                  <a href="#" class="text-success small text-decoration-none" @click.prevent="switchMode">
                    <i :class="loginMode === 'email' ? 'bi bi-phone' : 'bi bi-envelope'" class="me-1"></i>
                    Login pakai {{ loginMode === 'email' ? 'nomor HP' : 'email' }}
                  </a>
                </div>

                <div v-if="error" class="alert alert-danger py-1 small d-flex align-items-center gap-2">
                  <i class="bi bi-exclamation-circle"></i> {{ error }}
                </div>

                <button type="submit" class="btn btn-success w-100 fw-semibold" :disabled="loading" style="border-radius: 10px; padding: 10px;">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-box-arrow-in-right me-2"></i>
                  {{ loading ? 'Memproses...' : 'Masuk' }}
                </button>
              </form>

              <div class="text-center mt-3">
                <p class="mb-1 small">Belum punya akun?</p>
                <router-link to="/daftar" class="btn btn-outline-success w-100 fw-semibold" style="border-radius: 10px; padding: 9px;">
                  <i class="bi bi-person-plus me-2"></i>Daftar Akun Baru
                </router-link>
              </div>

              <div class="mt-3 p-2 bg-light rounded-3">
                <p class="text-muted small mb-1 text-center fw-semibold">Akun Demo</p>
                <div class="d-flex flex-wrap gap-1 justify-content-center">
                  <span class="badge bg-success px-2 py-1" style="cursor:pointer;font-size:0.75rem" @click="credential='admin@agrimarket.id'; password='admin123'">👑 Admin</span>
                  <span class="badge bg-primary px-2 py-1" style="cursor:pointer;font-size:0.75rem" @click="credential='budi@petani.id'; password='petani123'">🌾 Petani</span>
                  <span class="badge bg-warning text-dark px-2 py-1" style="cursor:pointer;font-size:0.75rem" @click="credential='ani@pembeli.id'; password='beli123'">🛒 Pembeli</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
