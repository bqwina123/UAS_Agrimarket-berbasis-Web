<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/services/authService'
import { getAddresses, createAddress, deleteAddress } from '@/services/db'
import type { Address } from '@/types'

const { user, updateProfile, changePassword } = useAuth()

const avatarInputRef = ref<HTMLElement | null>(null)

const editMode = ref(false)
const name = ref(user.value?.name || '')
const phone = ref(user.value?.phone || '')
const location = ref(user.value?.location || '')
const profileLoading = ref(false)

const oldPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const pwError = ref('')
const pwSuccess = ref('')
const pwLoading = ref(false)

const newAddress = ref({ label: '', address: '', city: '', province: '', phone: '' })
const showAddressForm = ref(false)

const addresses = ref<Address[]>(user.value ? getAddresses(user.value.id) : [])

async function saveProfile() {
  if (!user.value) return
  profileLoading.value = true
  await updateProfile({ name: name.value, phone: phone.value, location: location.value })
  profileLoading.value = false
  editMode.value = false
}

async function handleChangePassword() {
  pwError.value = ''; pwSuccess.value = ''
  if (newPassword.value !== confirmNewPassword.value) { pwError.value = 'Password baru tidak cocok'; return }
  pwLoading.value = true
  const result = await changePassword(oldPassword.value, newPassword.value)
  pwLoading.value = false
  if (result.success) {
    pwSuccess.value = 'Password berhasil diubah!'
    oldPassword.value = ''; newPassword.value = ''; confirmNewPassword.value = ''
  } else {
    pwError.value = result.error || 'Gagal mengubah password'
  }
}

function handleAddAddress() {
  if (!user.value) return
  createAddress({ ...newAddress.value, userId: user.value.id })
  addresses.value = getAddresses(user.value.id)
  newAddress.value = { label: '', address: '', city: '', province: '', phone: '' }
  showAddressForm.value = false
}

function handleDeleteAddress(id: string) {
  deleteAddress(id)
  addresses.value = getAddresses(user.value!.id)
}

function handleAvatarUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      await updateProfile({ avatar: e.target?.result as string })
    }
    reader.readAsDataURL(target.files[0])
  }
}
</script>

<template>
  <div class="container py-4" v-if="user">
    <h2 class="fw-bold mb-4"><i class="bi bi-person-circle text-success me-2"></i>Profil Saya</h2>

    <div class="row g-4">
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm text-center">
          <div class="card-body py-4">
            <div class="position-relative d-inline-block" style="cursor:pointer" @click="avatarInputRef?.click()">
              <div v-if="user.avatar" class="rounded-circle mb-3 overflow-hidden d-inline-flex" style="width: 100px; height: 100px;">
                <img :src="user.avatar" style="width:100%;height:100%;object-fit:cover">
              </div>
              <div v-else class="bg-success bg-opacity-10 text-success d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style="width: 100px; height: 100px; font-size: 2.5rem;">
                {{ user.name.charAt(0).toUpperCase() }}
              </div>
              <div class="position-absolute bottom-0 end-0 bg-dark bg-opacity-75 text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 30px; height: 30px; font-size: 0.8rem;">
                <i class="bi bi-camera"></i>
              </div>
            </div>
            <input type="file" accept="image/*" class="d-none" ref="avatarInputRef" @change="handleAvatarUpload">
            <h4 class="fw-bold">{{ user.name }}</h4>
            <span class="badge bg-success fs-6 px-3 py-2 mb-3">{{ user.role === 'petani' ? 'Petani' : user.role === 'pembeli' ? 'Pembeli' : 'Admin' }}</span>
            <p class="text-muted small mb-1"><i class="bi bi-envelope me-1"></i>{{ user.email }}</p>
            <p class="text-muted small mb-0"><i class="bi bi-phone me-1"></i>{{ user.phone }}</p>
            <p class="text-muted small"><i class="bi bi-geo-alt me-1"></i>{{ user.location }}</p>
          </div>
        </div>
      </div>

      <div class="col-lg-8">
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0 fw-bold"><i class="bi bi-pencil-square text-success me-2"></i>Informasi Profil</h5>
            <button class="btn btn-sm btn-outline-success" @click="editMode = !editMode">
              <i :class="editMode ? 'bi bi-x' : 'bi bi-pencil'"></i> {{ editMode ? 'Batal' : 'Edit' }}
            </button>
          </div>
          <div class="card-body">
            <div v-if="!editMode" class="row g-3">
              <div class="col-md-6"><label class="text-muted small">Nama</label><p class="fw-semibold mb-0">{{ user.name }}</p></div>
              <div class="col-md-6"><label class="text-muted small">Email</label><p class="fw-semibold mb-0">{{ user.email }}</p></div>
              <div class="col-md-6"><label class="text-muted small">Telepon</label><p class="fw-semibold mb-0">{{ user.phone }}</p></div>
              <div class="col-md-6"><label class="text-muted small">Lokasi</label><p class="fw-semibold mb-0">{{ user.location }}</p></div>
            </div>
            <form v-else @submit.prevent="saveProfile">
              <div class="row g-3">
                <div class="col-md-6"><label class="form-label">Nama</label><input v-model="name" class="form-control"></div>
                <div class="col-md-6"><label class="form-label">Telepon</label><input v-model="phone" class="form-control"></div>
                <div class="col-12"><label class="form-label">Lokasi</label><input v-model="location" class="form-control"></div>
              </div>
              <button type="submit" class="btn btn-success mt-3" :disabled="profileLoading"><i class="bi bi-check-lg me-1"></i>{{ profileLoading ? 'Menyimpan...' : 'Simpan' }}</button>
            </form>
          </div>
        </div>

        <div class="card border-0 shadow-sm mb-3">
          <div class="card-header bg-white">
            <h5 class="mb-0 fw-bold"><i class="bi bi-lock text-success me-2"></i>Ubah Password</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleChangePassword">
              <div class="row g-3">
                <div class="col-md-4"><input v-model="oldPassword" type="password" class="form-control" placeholder="Password lama"></div>
                <div class="col-md-4"><input v-model="newPassword" type="password" class="form-control" placeholder="Password baru"></div>
                <div class="col-md-4"><input v-model="confirmNewPassword" type="password" class="form-control" placeholder="Konfirmasi baru"></div>
              </div>
              <div v-if="pwError" class="alert alert-danger mt-2 py-1 small">{{ pwError }}</div>
              <div v-if="pwSuccess" class="alert alert-success mt-2 py-1 small">{{ pwSuccess }}</div>
              <button type="submit" class="btn btn-outline-success mt-2" :disabled="pwLoading"><i class="bi bi-arrow-repeat me-1"></i>{{ pwLoading ? 'Memproses...' : 'Ganti Password' }}</button>
            </form>
          </div>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0 fw-bold"><i class="bi bi-geo-alt text-success me-2"></i>Alamat Saya</h5>
            <button class="btn btn-sm btn-success" @click="showAddressForm = !showAddressForm">
              <i class="bi bi-plus-lg"></i> Tambah
            </button>
          </div>
          <div class="card-body">
            <div v-if="showAddressForm" class="mb-3 p-3 bg-light rounded-3">
              <form @submit.prevent="handleAddAddress">
                <div class="row g-2">
                  <div class="col-md-4"><input v-model="newAddress.label" class="form-control" placeholder="Label (Rumah/Kantor)" required></div>
                  <div class="col-md-8"><input v-model="newAddress.address" class="form-control" placeholder="Alamat" required></div>
                  <div class="col-md-4"><input v-model="newAddress.city" class="form-control" placeholder="Kota" required></div>
                  <div class="col-md-4"><input v-model="newAddress.province" class="form-control" placeholder="Provinsi" required></div>
                  <div class="col-md-4"><input v-model="newAddress.phone" class="form-control" placeholder="No. Telepon" required></div>
                </div>
                <button type="submit" class="btn btn-success btn-sm mt-2"><i class="bi bi-check me-1"></i>Simpan</button>
              </form>
            </div>
            <div v-if="addresses.length === 0" class="text-muted text-center py-3">Belum ada alamat tersimpan</div>
            <div v-for="a in addresses" :key="a.id" class="d-flex justify-content-between align-items-center p-3 border-bottom">
              <div>
                <span class="badge bg-success me-2">{{ a.label }}</span>
                <span class="fw-semibold">{{ a.address }}, {{ a.city }}, {{ a.province }}</span>
                <small class="d-block text-muted"><i class="bi bi-phone me-1"></i>{{ a.phone }}</small>
              </div>
              <button class="btn btn-sm btn-outline-danger" @click="handleDeleteAddress(a.id)"><i class="bi bi-trash"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
