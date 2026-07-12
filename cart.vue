<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/authService'
import { useCart } from '@/services/cartService'

const router = useRouter()
const { isLoggedIn } = useAuth()
const { items, count, total, cartItems, removeFromCart: removeItem, updateCartQuantity: updateQuantity, clearCart } = useCart()

function formatPrice(p: number): string { return new Intl.NumberFormat('id-ID').format(p) }

function handleQuantityChange(productId: string, event: Event) {
  const target = event.target as HTMLInputElement
  const v = Number(target.value)
  if (isNaN(v) || v < 1) { target.value = String(cartItems.value.find(i => i.productId === productId)?.quantity || 1); return }
  updateQuantity(productId, v)
}

function handleCheckout() {
  if (!isLoggedIn.value) { localStorage.setItem('redirect_after_login', '/checkout'); router.push('/masuk'); return }
  if (cartItems.value.length > 0) router.push('/checkout')
}
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold"><i class="bi bi-cart3 text-success me-2"></i>Keranjang Belanja</h2>
        <p class="text-muted mb-0">{{ count }} item</p>
      </div>
    </div>

    <div v-if="cartItems.length === 0" class="text-center py-5 text-muted">
      <i class="bi bi-cart-x fs-1 d-block mb-3"></i>
      <h5>Keranjang masih kosong</h5>
      <router-link to="/marketplace" class="btn btn-success btn-lg mt-2"><i class="bi bi-shop me-2"></i>Belanja Sekarang</router-link>
    </div>

    <div v-else class="row g-4">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0 fw-bold">{{ cartItems.length }} Produk</h5>
            <button class="btn btn-sm btn-outline-danger" @click="clearCart()"><i class="bi bi-trash me-1"></i>Kosongkan</button>
          </div>
          <div v-for="item in cartItems" :key="item.productId" class="border-bottom">
            <div class="p-3">
              <div class="row align-items-center g-2">
                <div class="col-md-5">
                    <div class="d-flex align-items-center gap-3">
                      <div style="width:70px;height:70px;border-radius:10px;overflow:hidden;background:#f0f0f0;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <img v-if="item.image && (item.image.startsWith('data:') || item.image.startsWith('http'))" :src="item.image" :alt="item.productName" style="width:100%;height:100%;object-fit:cover">
                        <span v-else-if="item.image" class="fs-2">{{ item.image }}</span>
                        <i v-else class="bi bi-image text-muted"></i>
                      </div>
                    <div>
                      <h6 class="fw-semibold mb-1">{{ item.productName }}</h6>
                      <small class="text-muted">Rp{{ formatPrice(item.price) }}/{{ item.unit }}</small>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="input-group" style="max-width: 130px;">
                    <button class="btn btn-outline-secondary" @click="updateQuantity(item.productId, item.quantity - 1)">−</button>
                    <input type="number" :value="item.quantity" class="form-control text-center" min="1" :max="item.stock" @change="handleQuantityChange(item.productId, $event)">
                    <button class="btn btn-outline-secondary" @click="updateQuantity(item.productId, item.quantity + 1)">+</button>
                  </div>
                </div>
                <div class="col-md-2 text-center">
                  <span class="fw-bold text-success fs-5">Rp{{ formatPrice(item.price * item.quantity) }}</span>
                </div>
                <div class="col-md-2 text-end">
                  <button class="btn btn-sm btn-outline-danger" @click="removeItem(item.productId)"><i class="bi bi-x-lg"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white"><h5 class="mb-0 fw-bold">Ringkasan</h5></div>
          <div class="card-body">
            <div class="d-flex justify-content-between mb-2">
              <span>Total Item</span><span class="fw-bold">{{ count }}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span>Subtotal</span><span class="fw-bold text-success fs-4">Rp{{ formatPrice(total) }}</span>
            </div>
            <hr>
            <button class="btn btn-success btn-lg w-100 fw-semibold" @click="handleCheckout">
              <i class="bi bi-credit-card me-2"></i>Lanjut ke Pembayaran
            </button>
            <router-link to="/marketplace" class="btn btn-outline-success w-100 mt-2">
              <i class="bi bi-arrow-left me-1"></i>Lanjut Belanja
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
