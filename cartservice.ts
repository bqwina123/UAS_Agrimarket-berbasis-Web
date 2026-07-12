import { ref, computed } from 'vue'
import { useAuth } from './authService'
import { apiCarts } from './apiService'
import { getCarts, addToCart as dbAddToCart, updateCartQuantity as dbUpdateQty, removeFromCart as dbRemoveFromCart, clearCart as dbClearCart } from './db'
import type { CartItem } from '@/types'

const cartItems = ref<CartItem[]>([])

async function apiAvailable(): Promise<boolean> {
  try {
    const res = await fetch('http://localhost:3001/api/commodities', { signal: AbortSignal.timeout(500) })
    return res.ok
  } catch { return false }
}

export function useCart() {
  const { userId } = useAuth()

  async function loadFromDB() {
    if (userId.value) {
      cartItems.value = getCarts(userId.value)
    } else {
      cartItems.value = []
    }
  }

  async function refresh() {
    if (!userId.value) { cartItems.value = []; return }
    await loadFromDB()
    if (await apiAvailable()) {
      try { cartItems.value = await apiCarts.get(); return } catch { /* ok */ }
    }
  }

  if (userId.value) refresh()

  const items = computed(() => cartItems.value)
  const count = computed(() => cartItems.value.reduce((s, i) => s + i.quantity, 0))
  const total = computed(() => cartItems.value.reduce((s, i) => s + i.price * i.quantity, 0))

  async function addToCart(productId: string, quantity: number) {
    if (userId.value) {
      cartItems.value = dbAddToCart(userId.value, { productId, quantity })
    }
    if (await apiAvailable()) {
      try { await apiCarts.add(productId, quantity); return } catch { /* ok */ }
    }
  }

  async function updateCartQuantity(productId: string, quantity: number) {
    if (userId.value) {
      cartItems.value = dbUpdateQty(userId.value, productId, quantity)
    }
    if (await apiAvailable()) {
      try { await apiCarts.update(productId, quantity); return } catch { /* ok */ }
    }
  }

  async function removeFromCart(productId: string) {
    if (userId.value) {
      cartItems.value = dbRemoveFromCart(userId.value, productId)
    }
    if (await apiAvailable()) {
      try { await apiCarts.remove(productId); return } catch { /* ok */ }
    }
  }

  async function clearCart() {
    if (userId.value) {
      dbClearCart(userId.value)
      cartItems.value = []
    }
    if (await apiAvailable()) {
      try { await apiCarts.clear(); return } catch { /* ok */ }
    }
  }

  return { items, count, total, cartItems, refresh, addToCart, updateCartQuantity, removeFromCart, clearCart }
}
