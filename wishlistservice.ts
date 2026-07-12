import { ref, computed } from 'vue'
import { useAuth } from './authService'
import { apiWishlists } from './apiService'
import { addWishlist as dbAddWishlist, removeFromWishlist as dbRemoveWishlist, getWishlists as dbGetWishlists, getWishlistProductPrice } from './db'
import type { WishlistItem } from '@/types'

const wishlistItems = ref<WishlistItem[]>([])

export function useWishlist() {
  const { userId } = useAuth()

  function refresh() {
    if (!userId.value) { wishlistItems.value = []; return }
    wishlistItems.value = dbGetWishlists(userId.value)
  }

  if (userId.value) refresh()

  function toggle(productId: string) {
    if (!userId.value) return
    wishlistItems.value = dbGetWishlists(userId.value)
    const existing = wishlistItems.value.some(w => w.productId === productId)
    if (existing) {
      wishlistItems.value = dbRemoveWishlist(userId.value, productId)
    } else {
      wishlistItems.value = dbAddWishlist(userId.value, productId)
    }
    apiWishlists.toggle(productId).catch(() => {})
  }

  function add(productId: string) {
    if (!userId.value) return
    wishlistItems.value = dbAddWishlist(userId.value, productId)
    apiWishlists.add(productId).catch(() => {})
  }

  function remove(productId: string) {
    if (!userId.value) return
    wishlistItems.value = dbRemoveWishlist(userId.value, productId)
    apiWishlists.remove(productId).catch(() => {})
  }

  function isInWishlist(productId: string): boolean {
    return wishlistItems.value.some(w => w.productId === productId)
  }

  const count = computed(() => wishlistItems.value.length)

  return { items: wishlistItems, count, toggle, add, remove, isInWishlist, refresh }
}
