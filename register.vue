<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/authService'
import type { UserRole } from '@/types'

const router = useRouter()
const { register } = useAuth()

const name = ref('')
const email = ref('')
const phone = ref('')
const location = ref('')
const password = ref('')
const confirmPassword = ref('')
const role = ref<UserRole>('pembeli')
const error = ref('')
const loading = ref(false)

async function handleRegister() {
  error.value = ''
  if (password.value !== confirmPassword.value) { error.value = 'Password tidak cocok'; return }
  if (password.value.length < 4) { error.value = 'Password minimal 4 karakter'; return }
  loading.value = true
  const result = await register({ name: name.value, email: email.value, phone: phone.value, password: password.value, role: role.value, location: location.value })
  loading.value = false
  if (result.success) router.push('/')
  else error.value = result.error || 'Registrasi gagal'
}
</script>

<template>
  <div class="min-vh-100 d-flex align-items-center py-4" style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%);">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card border-0 shadow-lg" style="border-radius: 20px; overflow: hidden;">
            <div class="card-body p-4">
              <div class="text-center mb-3">
                <div class="bg-success text-white d-inline-flex align-items-center justify-content-center rounded-circle mb-2" style="width: 56px; height: 56px;">
                  <i class="bi bi-person-plus fs-3"></i>
                </div>
                <h4 class="fw-bold mb-1">Daftar Akun</h4>
                <p class="text-muted small">Bergabung sebagai petani atau pembeli</p>
              </div>

              <form @submit.prevent="handleRegister">
                <div class="mb-2">
                  <label class="form-label small fw-semibold">Daftar Sebagai</label>
                  <div class="d-flex gap-2">
                    <label class="flex-fill">
                      <input v-model="role" type="radio" class="btn-check" value="petani" id="rolePetani" autocomplete="off">
                      <span class="btn btn-outline-success w-100 py-2" for="rolePetani">
                        <i class="bi bi-person-workspace d-block mb-0"></i><small>Petani</small>
                      </span>
                    </label>
                    <label class="flex-fill">
                      <input v-model="role" type="radio" class="btn-check" value="pembeli" id="rolePembeli" autocomplete="off">
                      <span class="btn btn-outline-success w-100 py-2" for="rolePembeli">
                        <i class="bi bi-person d-block mb-0"></i><small>Pembeli</small>
                      </span>
                    </label>
                  </div>
                </div>

                <div class="row g-2">
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Nama Lengkap</label>
                    <input v-model="name" type="text" class="form-control" placeholder="Nama Anda" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Email</label>
                    <input v-model="email" type="email" class="form-control" placeholder="contoh@email.com" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">No. Telepon</label>
                    <input v-model="phone" type="tel" class="form-control" placeholder="0812xxxxxx" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Lokasi</label>
                    <input v-model="location" type="text" class="form-control" placeholder="Kota, Provinsi" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Password</label>
                    <input v-model="password" type="password" class="form-control" placeholder="Min 4 karakter" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Konfirmasi</label>
                    <input v-model="confirmPassword" type="password" class="form-control" placeholder="Ulangi password" required>
                  </div>
                </div>

                <div v-if="error" class="alert alert-danger mt-2 py-1 small">{{ error }}</div>

                <button type="submit" class="btn btn-success w-100 mt-2 fw-semibold" :disabled="loading" style="border-radius: 10px; padding: 10px;">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-person-plus me-2"></i>
                  {{ loading ? 'Memproses...' : 'Daftar Sekarang' }}
                </button>
              </form>

              <div class="text-center mt-3">
                <p class="mb-0 small">Sudah punya akun? <router-link to="/masuk" class="text-success fw-semibold">Masuk</router-link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
