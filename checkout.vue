<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/authService'
import { useCart } from '@/services/cartService'
import { getDefaultAddress, getAddresses, createOrder, createAddress } from '@/services/db'
import type { PaymentMethodType, Address } from '@/types'

const router = useRouter()
const { user, isLoggedIn, userId } = useAuth()
const { items, count, total, cartItems, clearCart } = useCart()

const selectedPayment = ref<PaymentMethodType>('transfer_bank')
const selectedShipping = ref('jne')
const notes = ref('')
const orderPlaced = ref(false)
const refreshAddr = ref(0)
const savedAddresses = computed<Address[]>(() => { void refreshAddr.value; return userId.value ? getAddresses(userId.value) : [] })
const selectedAddress = ref<string>('')
const showAddrForm = ref(false)
const newAddr = ref({ label: '', address: '', city: '', province: '', phone: '', isDefault: false })

const defaultAddr = computed(() => { void refreshAddr.value; return userId.value ? getDefaultAddress(userId.value) : undefined })

watch(defaultAddr, (d) => { if (d && !selectedAddress.value) selectedAddress.value = d.id }, { immediate: true })

function addNewAddress() {
  if (!newAddr.value.label || !newAddr.value.address || !newAddr.value.city) return
  const addr = createAddress({ userId: userId.value, ...newAddr.value })
  refreshAddr.value++
  selectedAddress.value = addr.id
  showAddrForm.value = false
  newAddr.value = { label: '', address: '', city: '', province: '', phone: '', isDefault: false }
}

const shippingOptions = [
  { code: 'jne', name: 'JNE Reguler', price: 25000, estimated: '2-3 hari' },
  { code: 'sicepat', name: 'SiCepat BEST', price: 30000, estimated: '1-2 hari' },
  { code: 'jnt', name: 'J&T Express', price: 20000, estimated: '2-4 hari' },
  { code: 'grab', name: 'Grab Same Day', price: 50000, estimated: 'Hari ini' },
  { code: 'pos', name: 'POS Indonesia', price: 15000, estimated: '3-5 hari' },
]

const shippingCost = computed(() => shippingOptions.find(s => s.code === selectedShipping.value)?.price || 0)
const grandTotal = computed(() => total.value + shippingCost.value)

const currentAddress = computed(() => savedAddresses.value.find(a => a.id === selectedAddress.value))

const paymentMethods = [
  { type: 'transfer_bank' as PaymentMethodType, label: 'Transfer Bank', icon: 'bi-bank', desc: 'BCA / Mandiri / BNI / BRI' },
  { type: 'virtual_account' as PaymentMethodType, label: 'Virtual Account', icon: 'bi-credit-card', desc: 'VA BCA / Mandiri / BNI' },
  { type: 'qris' as PaymentMethodType, label: 'QRIS', icon: 'bi-qr-code', desc: 'Scan QR dari aplikasi pembayaran' },
  { type: 'cod' as PaymentMethodType, label: 'Cash on Delivery', icon: 'bi-cash-stack', desc: 'Bayar tunai saat diterima' },
  { type: 'ewallet' as PaymentMethodType, label: 'E-Wallet', icon: 'bi-phone', desc: 'GoPay / OVO / DANA / LinkAja' },
]

if (!isLoggedIn.value) { localStorage.setItem('redirect_after_login', '/checkout'); router.push('/masuk') }

function formatPrice(p: number): string { return new Intl.NumberFormat('id-ID').format(p) }

function placeOrder() {
  if (!selectedAddress.value) { alert('Pilih alamat pengiriman!'); return }
  const farmerIds = [...new Set(cartItems.value.map(i => i.farmerId))]
  let order = null
  for (const farmerId of farmerIds) {
    const farmerItems = cartItems.value.filter(i => i.farmerId === farmerId)
    order = createOrder({
      buyerId: user.value?.id || '',
      farmerId,
      paymentMethod: selectedPayment.value,
      shippingMethod: selectedShipping.value,
      shippingCost: shippingCost.value,
      notes: notes.value + (currentAddress.value ? ' | Alamat: ' + currentAddress.value.label + ' - ' + currentAddress.value.address + ', ' + currentAddress.value.city : ''),
      items: farmerItems.map(i => ({
        productId: i.productId,
        commodityName: i.productName,
        quantity: i.quantity,
        unit: i.unit,
        price: i.price,
        subtotal: i.price * i.quantity,
        productImage: i.image,
      })),
    })
  }
  if (order) {
    orderPlaced.value = true
    clearCart()
    setTimeout(() => router.push('/pesanan'), 3000)
  }
}
</script>

<template>
  <div class="container py-4">
    <div v-if="orderPlaced" class="row justify-content-center">
      <div class="col-md-6">
        <div class="card border-0 shadow-lg text-center">
          <div class="card-body py-5">
            <div class="display-1 text-success mb-3"><i class="bi bi-check-circle-fill"></i></div>
            <h3 class="fw-bold">Pesanan Berhasil!</h3>
            <p class="text-muted fs-5">Terima kasih, pesanan Anda sedang diproses.</p>
            <div class="bg-light rounded-3 p-4 text-start mb-3">
              <div class="d-flex justify-content-between mb-2 fs-5"><span class="text-muted">Total</span><span class="fw-bold text-success">Rp{{ formatPrice(grandTotal) }}</span></div>
              <div class="d-flex justify-content-between mb-2"><span class="text-muted">Metode</span><span class="fw-semibold">{{ paymentMethods.find(p => p.type === selectedPayment)?.label }}</span></div>
              <div class="d-flex justify-content-between"><span class="text-muted">Pengiriman</span><span class="fw-semibold">{{ shippingOptions.find(s => s.code === selectedShipping)?.name }}</span></div>
            </div>
            <div v-if="selectedPayment === 'cod'" class="alert alert-info"><i class="bi bi-info-circle me-1"></i>Bayar saat barang diterima</div>
            <div v-else class="alert alert-warning"><i class="bi bi-info-circle me-1"></i>Lakukan pembayaran sesuai metode yang dipilih</div>
            <p class="text-muted small mt-3">Mengalihkan ke halaman pesanan...</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="row g-4">
      <div class="col-lg-7">
        <h3 class="fw-bold mb-4"><i class="bi bi-credit-card text-success me-2"></i>Checkout</h3>

        <div class="card border-0 shadow-sm mb-3">
          <div class="card-header bg-white d-flex justify-content-between">
            <h5 class="mb-0 fw-bold"><i class="bi bi-geo-alt text-success me-2"></i>Alamat Pengiriman</h5>
            <router-link to="/profil" class="btn btn-sm btn-outline-success">Kelola Alamat</router-link>
          </div>
          <div class="card-body">
            <div v-if="savedAddresses.length === 0 && !showAddrForm" class="text-muted">
              <p>Belum ada alamat tersimpan.</p>
              <button class="btn btn-sm btn-success" @click="showAddrForm = true">Tambah Alamat Baru</button>
            </div>
            <div v-if="showAddrForm" class="border rounded-3 p-3 mb-2 bg-light">
              <h6 class="fw-bold mb-2">Alamat Baru</h6>
              <div class="row g-2">
                <div class="col-md-4"><input v-model="newAddr.label" class="form-control form-control-sm" placeholder="Label (Rumah/Kantor)"></div>
                <div class="col-md-8"><input v-model="newAddr.address" class="form-control form-control-sm" placeholder="Alamat"></div>
                <div class="col-md-4"><input v-model="newAddr.city" class="form-control form-control-sm" placeholder="Kota"></div>
                <div class="col-md-4"><input v-model="newAddr.province" class="form-control form-control-sm" placeholder="Provinsi"></div>
                <div class="col-md-4"><input v-model="newAddr.phone" class="form-control form-control-sm" placeholder="No. Telepon"></div>
                <div class="col-12">
                  <div class="form-check">
                    <input v-model="newAddr.isDefault" id="isDefault" type="checkbox" class="form-check-input">
                    <label for="isDefault" class="form-check-label">Jadikan alamat utama</label>
                  </div>
                </div>
              </div>
              <div class="mt-2 d-flex gap-2">
                <button class="btn btn-sm btn-success" @click="addNewAddress">Simpan</button>
                <button class="btn btn-sm btn-outline-secondary" @click="showAddrForm = false">Batal</button>
              </div>
            </div>
            <div v-for="a in savedAddresses" :key="a.id" class="form-check border rounded-3 p-3 mb-2" :class="{ 'border-success bg-success bg-opacity-10': selectedAddress === a.id }">
              <input v-model="selectedAddress" :id="'addr-' + a.id" type="radio" class="form-check-input" :value="a.id">
              <label :for="'addr-' + a.id" class="form-check-label w-100">
                <div class="d-flex justify-content-between">
                  <span class="fw-semibold">{{ a.label }}</span>
                  <span v-if="a.isDefault" class="badge bg-success">Utama</span>
                </div>
                <small class="d-block text-muted">{{ a.address }}, {{ a.city }}, {{ a.province }}</small>
                <small class="d-block text-muted">{{ a.phone }}</small>
              </label>
            </div>
            <div v-if="savedAddresses.length > 0" class="mt-2">
              <button v-if="!showAddrForm" class="btn btn-sm btn-outline-success" @click="showAddrForm = true"><i class="bi bi-plus"></i> Alamat Lain</button>
            </div>
          </div>
        </div>

        <div class="card border-0 shadow-sm mb-3">
          <div class="card-header bg-white"><h5 class="mb-0 fw-bold"><i class="bi bi-truck text-success me-2"></i>Pengiriman</h5></div>
          <div class="card-body">
            <div v-for="s in shippingOptions" :key="s.code" class="form-check border rounded-3 p-3 mb-2" :class="{ 'border-success bg-success bg-opacity-10': selectedShipping === s.code }">
              <input v-model="selectedShipping" :id="'ship-' + s.code" type="radio" class="form-check-input" :value="s.code">
              <label :for="'ship-' + s.code" class="form-check-label w-100">
                <div class="d-flex justify-content-between">
                  <span class="fw-semibold">{{ s.name }}</span>
                  <span class="fw-bold text-success">Rp{{ formatPrice(s.price) }}</span>
                </div>
                <small class="text-muted">{{ s.estimated }}</small>
              </label>
            </div>
          </div>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white"><h5 class="mb-0 fw-bold"><i class="bi bi-wallet2 text-success me-2"></i>Pembayaran</h5></div>
          <div class="card-body">
            <div v-for="pm in paymentMethods" :key="pm.type" class="form-check border rounded-3 p-3 mb-2" :class="{ 'border-success bg-success bg-opacity-10': selectedPayment === pm.type }">
              <input v-model="selectedPayment" :id="'pm-' + pm.type" type="radio" class="form-check-input" :value="pm.type">
              <label :for="'pm-' + pm.type" class="form-check-label w-100">
                <div class="d-flex align-items-center gap-2">
                  <i :class="pm.icon + ' fs-4 text-success'"></i>
                  <div><span class="fw-semibold d-block">{{ pm.label }}</span><small class="text-muted">{{ pm.desc }}</small></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="card border-0 shadow-sm mt-3">
          <div class="card-header bg-white"><h5 class="mb-0 fw-bold"><i class="bi bi-pencil text-success me-2"></i>Catatan</h5></div>
          <div class="card-body">
            <textarea v-model="notes" class="form-control" rows="2" placeholder="Catatan untuk petani..."></textarea>
          </div>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white"><h5 class="mb-0 fw-bold">Ringkasan Pesanan</h5></div>
          <div class="card-body">
            <div v-if="currentAddress" class="bg-light rounded-3 p-2 mb-3 small">
              <span class="fw-semibold">{{ currentAddress.label }}</span>: {{ currentAddress.address }}, {{ currentAddress.city }}
            </div>
            <div v-for="item in cartItems" :key="item.productId" class="d-flex justify-content-between align-items-center mb-2">
              <div class="d-flex align-items-center gap-2">
                <div style="width:40px;height:40px;border-radius:8px;overflow:hidden;background:#f0f0f0;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <img v-if="item.image && (item.image.startsWith('data:') || item.image.startsWith('http'))" :src="item.image" :alt="item.productName" style="width:100%;height:100%;object-fit:cover">
                  <span v-else-if="item.image" class="fs-5">{{ item.image }}</span>
                  <i v-else class="bi bi-image text-muted small"></i>
                </div>
                <div>
                  <span class="fw-semibold">{{ item.productName }}</span>
                  <span class="d-block small text-muted">{{ item.quantity }} {{ item.unit }} x Rp{{ formatPrice(item.price) }}</span>
                </div>
              </div>
              <span class="fw-bold">Rp{{ formatPrice(item.price * item.quantity) }}</span>
            </div>
            <hr>
            <div class="d-flex justify-content-between mb-1"><span>Subtotal</span><span class="fw-bold">Rp{{ formatPrice(total) }}</span></div>
            <div class="d-flex justify-content-between mb-1"><span>Ongkir</span><span class="fw-bold">Rp{{ formatPrice(shippingCost) }}</span></div>
            <hr class="border-2 border-success">
            <div class="d-flex justify-content-between mb-3">
              <span class="fs-4 fw-bold">Total</span>
              <span class="fs-4 fw-bold text-success">Rp{{ formatPrice(grandTotal) }}</span>
            </div>
            <button class="btn btn-success btn-lg w-100 fw-semibold" @click="placeOrder">
              <i class="bi bi-check-lg me-2"></i>Buat Pesanan
            </button>
            <div class="text-center mt-2 small text-muted">
              <i class="bi bi-shield-check me-1 text-success"></i>Data Anda aman & terenkripsi
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
