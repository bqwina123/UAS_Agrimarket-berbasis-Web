import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: Dashboard },
    { path: '/marketplace', name: 'marketplace', component: () => import('@/views/Marketplace.vue') },
    { path: '/harga', name: 'harga', component: () => import('@/views/PriceComparison.vue') },
    { path: '/wishlist', name: 'wishlist', component: () => import('@/views/WishlistPage.vue') },
    { path: '/pesanan', name: 'pesanan', component: () => import('@/views/Orders.vue') },
    { path: '/notifikasi', name: 'notifikasi', component: () => import('@/views/Notifications.vue') },
    { path: '/masuk', name: 'masuk', component: () => import('@/views/Login.vue') },
    { path: '/daftar', name: 'daftar', component: () => import('@/views/Register.vue') },
    { path: '/profil', name: 'profil', component: () => import('@/views/Profile.vue') },
    { path: '/cart', name: 'cart', component: () => import('@/views/Cart.vue') },
    { path: '/checkout', name: 'checkout', component: () => import('@/views/Checkout.vue') },
    { path: '/produk/:id', name: 'produk', component: () => import('@/views/ProductDetail.vue') },
    { path: '/petani', name: 'petani', component: () => import('@/views/FarmerDashboard.vue') },
    { path: '/pembeli', name: 'pembeli', component: () => import('@/views/BuyerDashboard.vue') },
    { path: '/admin', name: 'admin', component: () => import('@/views/AdminDashboard.vue') },
    { path: '/laporan', name: 'laporan', component: () => import('@/views/Reports.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
