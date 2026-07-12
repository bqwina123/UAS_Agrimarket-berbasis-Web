import type { User, UserRole, Commodity, Market, MarketPrice, Product, Order, OrderStatus, OrderItem, Payment, PaymentMethodType, Review, Notification, CartItem, Address, WishlistItem, Shipping, Report, FarmLand, ProductCategory, PriceAlert, PriceHistory, ProductStatus, Promo } from '@/types'

const DB_KEY = 'agrimarket_db'
const DB_VERSION = 3

interface Database {
  _version?: number
  users: User[]
  commodities: Commodity[]
  markets: Market[]
  marketPrices: MarketPrice[]
  products: Product[]
  orders: Order[]
  orderItems: OrderItem[]
  payments: Payment[]
  reviews: Review[]
  notifications: Notification[]
  carts: CartItem[]
  addresses: Address[]
  wishlists: WishlistItem[]
  shippings: Shipping[]
  reports: Report[]
  farmlands: FarmLand[]
  productCategories: ProductCategory[]
  priceAlerts: PriceAlert[]
  priceHistories: PriceHistory[]
  promos: Promo[]
}

function now(): string {
  return new Date().toISOString()
}

function seedData(): Database {
  return {
    users: [
      { id: 'u1', email: 'admin@agrimarket.id', phone: '081111111111', password: 'admin123', name: 'Admin AgriMarket', role: 'admin', location: 'Jakarta', isVerified: true, isActive: true, isSeed: true, createdAt: '2024-01-01T00:00:00Z' },
      { id: 'u2', email: 'budi@petani.id', phone: '081234567890', password: 'petani123', name: 'Pak Budi', role: 'petani', location: 'Subang, Jawa Barat', isVerified: true, isActive: true, isSeed: true, createdAt: '2024-01-15T00:00:00Z' },
      { id: 'u3', email: 'sari@petani.id', phone: '081234567891', password: 'petani123', name: 'Bu Sari', role: 'petani', location: 'Garut, Jawa Barat', isVerified: true, isActive: true, isSeed: true, createdAt: '2024-02-20T00:00:00Z' },
      { id: 'u4', email: 'ahmad@petani.id', phone: '081234567892', password: 'petani123', name: 'Pak Ahmad', role: 'petani', location: 'Brebes, Jawa Tengah', isVerified: true, isActive: true, isSeed: true, createdAt: '2024-03-01T00:00:00Z' },
      { id: 'u5', email: 'ani@pembeli.id', phone: '081234567893', password: 'beli123', name: 'Ibu Ani', role: 'pembeli', location: 'Jakarta', isVerified: true, isActive: true, isSeed: true, createdAt: '2024-04-01T00:00:00Z' },
      { id: 'u6', email: 'rudi@pembeli.id', phone: '081234567894', password: 'beli123', name: 'Bapak Rudi', role: 'pembeli', location: 'Bandung', isVerified: true, isActive: true, isSeed: true, createdAt: '2024-04-15T00:00:00Z' },
    ],
    commodities: [
      { id: 'c1', name: 'Beras Premium', category: 'Pangan', unit: 'kg', image: '🌾', description: 'Beras kualitas premium', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'c2', name: 'Beras Medium', category: 'Pangan', unit: 'kg', image: '🌾', description: 'Beras kualitas medium', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'c3', name: 'Cabai Merah Keriting', category: 'Sayuran', unit: 'kg', image: '🌶️', description: 'Cabai merah keriting segar', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'c4', name: 'Cabai Rawit', category: 'Sayuran', unit: 'kg', image: '🌶️', description: 'Cabai rawit pedas', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'c5', name: 'Bawang Merah', category: 'Rempah', unit: 'kg', image: '🧅', description: 'Bawang merah kualitas bagus', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'c6', name: 'Bawang Putih', category: 'Rempah', unit: 'kg', image: '🧄', description: 'Bawang putih kating', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'c7', name: 'Tomat', category: 'Sayuran', unit: 'kg', image: '🍅', description: 'Tomat merah segar', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'c8', name: 'Kentang', category: 'Sayuran', unit: 'kg', image: '🥔', description: 'Kentang granola', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'c9', name: 'Wortel', category: 'Sayuran', unit: 'kg', image: '🥕', description: 'Wortel segar', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'c10', name: 'Telur Ayam', category: 'Pangan', unit: 'kg', image: '🥚', description: 'Telur ayam ras', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'c11', name: 'Daging Ayam', category: 'Pangan', unit: 'kg', image: '🍗', description: 'Ayam broiler segar', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'c12', name: 'Ikan Bandeng', category: 'Pangan', unit: 'kg', image: '🐟', description: 'Ikan bandeng segar', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'c13', name: 'Minyak Goreng', category: 'Pangan', unit: 'liter', image: '🫗', description: 'Minyak goreng kemasan', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'c14', name: 'Gula Pasir', category: 'Pangan', unit: 'kg', image: '🍚', description: 'Gula pasir putih', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'c15', name: 'Jagung', category: 'Pangan', unit: 'kg', image: '🌽', description: 'Jagung pipil kering', createdAt: '2024-01-01T00:00:00Z' },
    ],
    markets: [
      { id: 'm1', name: 'Pasar Induk Kramat Jati', city: 'Jakarta Timur', province: 'DKI Jakarta', type: 'induk', latitude: -6.2088, longitude: 106.8456, createdAt: '2024-01-01T00:00:00Z' },
      { id: 'm2', name: 'Pasar Tanah Abang', city: 'Jakarta Pusat', province: 'DKI Jakarta', type: 'tradisional', latitude: -6.1850, longitude: 106.8140, createdAt: '2024-01-01T00:00:00Z' },
      { id: 'm3', name: 'Pasar Caringin', city: 'Bandung', province: 'Jawa Barat', type: 'induk', latitude: -6.9147, longitude: 107.6098, createdAt: '2024-01-01T00:00:00Z' },
      { id: 'm4', name: 'Pasar Johar', city: 'Semarang', province: 'Jawa Tengah', type: 'tradisional', latitude: -6.9667, longitude: 110.4167, createdAt: '2024-01-01T00:00:00Z' },
      { id: 'm5', name: 'Pasar Induk Surabaya', city: 'Surabaya', province: 'Jawa Timur', type: 'induk', latitude: -7.2575, longitude: 112.7521, createdAt: '2024-01-01T00:00:00Z' },
      { id: 'm6', name: 'Pasar Gede Solo', city: 'Surakarta', province: 'Jawa Tengah', type: 'tradisional', latitude: -7.5755, longitude: 110.8243, createdAt: '2024-01-01T00:00:00Z' },
      { id: 'm7', name: 'Pasar Raya Padang', city: 'Padang', province: 'Sumatera Barat', type: 'tradisional', latitude: -0.9471, longitude: 100.4172, createdAt: '2024-01-01T00:00:00Z' },
      { id: 'm8', name: 'Pasar Terong Makassar', city: 'Makassar', province: 'Sulawesi Selatan', type: 'induk', latitude: -5.1477, longitude: 119.4322, createdAt: '2024-01-01T00:00:00Z' },
    ],
    marketPrices: (() => {
      const prices: MarketPrice[] = []
      const commodities = ['c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','c11','c12','c13','c14','c15']
      const markets = ['m1','m2','m3','m4','m5','m6','m7','m8']
      const basePrices: Record<string, number> = { c1:14000, c2:11500, c3:45000, c4:62000, c5:32000, c6:28000, c7:12000, c8:18000, c9:15000, c10:26000, c11:35000, c12:30000, c13:18000, c14:17000, c15:8000 }
      const trends: Array<'up'|'down'|'stable'> = ['up','down','stable']
      let id = 1
      for (const ci of commodities) {
        for (const mi of markets) {
          const base = basePrices[ci] || 10000
          const variance = Math.round(base * (Math.random() * 0.3 - 0.1))
          const avg = base + variance
          prices.push({
            id: `mp${id++}`, commodityId: ci, marketId: mi,
            avgPrice: avg, minPrice: Math.round(avg * 0.8), maxPrice: Math.round(avg * 1.2),
            trend: trends[Math.floor(Math.random() * 3)] || 'stable',
            date: now(),
          })
        }
      }
      return prices
    })(),
    products: [
      { id: 'p1', farmerId: 'u2', commodityId: 'c1', name: 'Beras Premium Pandan Wangi', description: 'Beras premium pulen dan wangi dari Subang', price: 12500, stock: 500, unit: 'kg', image: '🌾', isAvailable: true, status: 'active', createdAt: '2024-06-01T00:00:00Z' },
      { id: 'p2', farmerId: 'u2', commodityId: 'c2', name: 'Beras Medium IR 64', description: 'Beras medium kualitas baik untuk sehari-hari', price: 10000, stock: 800, unit: 'kg', image: '🌾', isAvailable: true, status: 'active', createdAt: '2024-06-01T00:00:00Z' },
      { id: 'p3', farmerId: 'u3', commodityId: 'c3', name: 'Cabai Merah Keriting Segar', description: 'Cabai merah dari perkebunan Garut', price: 38000, stock: 120, unit: 'kg', image: '🌶️', isAvailable: true, status: 'active', createdAt: '2024-06-05T00:00:00Z' },
      { id: 'p4', farmerId: 'u3', commodityId: 'c4', name: 'Cabai Rawit Merah', description: 'Cabai rawit dengan tingkat kepedasan tinggi', price: 55000, stock: 80, unit: 'kg', image: '🌶️', isAvailable: true, status: 'active', createdAt: '2024-06-05T00:00:00Z' },
      { id: 'p5', farmerId: 'u4', commodityId: 'c5', name: 'Bawang Merah Brebes', description: 'Bawang merah khas Brebes kering siap simpan', price: 28000, stock: 300, unit: 'kg', image: '🧅', isAvailable: true, status: 'active', createdAt: '2024-06-10T00:00:00Z' },
      { id: 'p6', farmerId: 'u4', commodityId: 'c6', name: 'Bawang Putih Kating', description: 'Bawang putih kating kualitas ekspor', price: 25000, stock: 200, unit: 'kg', image: '🧄', isAvailable: true, status: 'active', createdAt: '2024-06-10T00:00:00Z' },
      { id: 'p7', farmerId: 'u2', commodityId: 'c7', name: 'Tomat Merah Segar', description: 'Tomat merah dari dataran tinggi Malang', price: 9000, stock: 150, unit: 'kg', image: '🍅', isAvailable: true, status: 'active', createdAt: '2024-06-15T00:00:00Z' },
      { id: 'p8', farmerId: 'u2', commodityId: 'c8', name: 'Kentang Granola', description: 'Kentang granola kualitas bagus', price: 16000, stock: 400, unit: 'kg', image: '🥔', isAvailable: true, status: 'active', createdAt: '2024-06-15T00:00:00Z' },
      { id: 'p9', farmerId: 'u3', commodityId: 'c10', name: 'Telur Ayam Kampung', description: 'Telur ayam kampung fresh', price: 28000, stock: 200, unit: 'kg', image: '🥚', isAvailable: true, status: 'active', createdAt: '2024-06-20T00:00:00Z' },
      { id: 'p10', farmerId: 'u4', commodityId: 'c13', name: 'Minyak Goreng Kelapa', description: 'Minyak goreng kelapa kualitas premium', price: 17000, stock: 500, unit: 'liter', image: '🫗', isAvailable: true, status: 'active', createdAt: '2024-06-20T00:00:00Z' },
    ],
    orders: [
      { id: 'o1', buyerId: 'u5', farmerId: 'u2', status: 'delivered', totalPrice: 312500, paymentMethod: 'transfer_bank', shippingMethod: 'jne', shippingCost: 25000, notes: '', buyerConfirmed: true, createdAt: '2026-06-15T08:00:00Z', updatedAt: '2026-06-17T10:00:00Z' },
      { id: 'o2', buyerId: 'u6', farmerId: 'u4', status: 'shipped', totalPrice: 280000, paymentMethod: 'cod', shippingMethod: 'sicepat', shippingCost: 20000, notes: '', createdAt: '2026-06-18T09:00:00Z', updatedAt: '2026-06-20T14:00:00Z' },
      { id: 'o3', buyerId: 'u5', farmerId: 'u3', status: 'confirmed', totalPrice: 115000, paymentMethod: 'virtual_account', shippingMethod: 'jnt', shippingCost: 15000, notes: 'Diantar jam kerja', createdAt: '2026-06-20T10:00:00Z', updatedAt: '2026-06-20T10:00:00Z' },
      { id: 'o4', buyerId: 'u6', farmerId: 'u3', status: 'pending', totalPrice: 76000, paymentMethod: 'qris', shippingMethod: 'grab', shippingCost: 0, notes: '', createdAt: '2026-06-21T07:00:00Z', updatedAt: '2026-06-21T07:00:00Z' },
    ],
    orderItems: [
      { id: 'oi1', orderId: 'o1', productId: 'p1', commodityName: 'Beras Premium Pandan Wangi', quantity: 25, unit: 'kg', price: 12500, subtotal: 312500, productImage: '🌾' },
      { id: 'oi2', orderId: 'o2', productId: 'p5', commodityName: 'Bawang Merah Brebes', quantity: 10, unit: 'kg', price: 28000, subtotal: 280000, productImage: '🧅' },
      { id: 'oi3', orderId: 'o3', productId: 'p9', commodityName: 'Telur Ayam Kampung', quantity: 5, unit: 'kg', price: 23000, subtotal: 115000, productImage: '🥚' },
      { id: 'oi4', orderId: 'o4', productId: 'p3', commodityName: 'Cabai Merah Keriting Segar', quantity: 2, unit: 'kg', price: 38000, subtotal: 76000, productImage: '🌶️' },
    ],
    payments: [
      { id: 'pay1', orderId: 'o1', userId: 'u5', method: 'transfer_bank', amount: 312500, status: 'verified', proofImage: '', verifiedAt: '2026-06-15T12:00:00Z', verifiedBy: 'u1', createdAt: '2026-06-15T08:30:00Z' },
      { id: 'pay2', orderId: 'o2', userId: 'u6', method: 'cod', amount: 280000, status: 'pending', proofImage: '', createdAt: '2026-06-18T09:00:00Z' },
      { id: 'pay3', orderId: 'o3', userId: 'u5', method: 'virtual_account', amount: 115000, status: 'pending', proofImage: '', createdAt: '2026-06-20T10:00:00Z' },
    ],
    reviews: [
      { id: 'r1', productId: 'p1', userId: 'u5', userName: 'Ibu Ani', rating: 5, comment: 'Berasnya pulen dan wangi!', createdAt: '2026-06-18T10:00:00Z' },
      { id: 'r2', productId: 'p1', userId: 'u6', userName: 'Bapak Rudi', rating: 4, comment: 'Kualitas bagus, pengiriman cepat.', createdAt: '2026-06-17T14:00:00Z' },
      { id: 'r3', productId: 'p3', userId: 'u5', userName: 'Ibu Ani', rating: 5, comment: 'Cabai segar dan pedas!', createdAt: '2026-06-16T09:00:00Z' },
    ],
    notifications: [
      { id: 'n1', userId: 'u2', title: 'Harga Cabai Naik', message: 'Harga cabai naik 12% dalam 3 hari. Waktu tepat menjual!', type: 'price_alert', isRead: false, createdAt: '2026-06-21T06:00:00Z' },
      { id: 'n2', userId: 'u3', title: 'Pesanan Baru', message: 'Pesanan Cabai Merah dari Bapak Dwi masuk! Segera proses.', type: 'order_update', isRead: false, createdAt: '2026-06-21T07:00:00Z' },
      { id: 'n3', userId: 'u2', title: 'Harga Beras Stabil', message: 'Harga beras premium stabil di Rp14.000/kg', type: 'price_alert', isRead: true, createdAt: '2026-06-20T08:00:00Z' },
      { id: 'n4', userId: 'u5', title: 'Pembayaran Diverifikasi', message: 'Pembayaran pesanan Beras Premium telah diverifikasi.', type: 'order_update', isRead: false, createdAt: '2026-06-15T12:00:00Z' },
      { id: 'n5', userId: 'u6', title: 'Promo Spesial', message: 'Dapatkan diskon 10% untuk pembelian pertama!', type: 'system', isRead: true, createdAt: '2026-06-01T00:00:00Z' },
    ],
    carts: [],
    addresses: [
      { id: 'a1', userId: 'u5', label: 'Rumah', address: 'Jl. Merpati No. 10', city: 'Jakarta Selatan', province: 'DKI Jakarta', phone: '081234567893', isDefault: true },
      { id: 'a2', userId: 'u6', label: 'Kantor', address: 'Jl. Braga No. 25', city: 'Bandung', province: 'Jawa Barat', phone: '081234567894', isDefault: true },
      { id: 'a3', userId: 'u2', label: 'Sawah', address: 'Desa Cijambe', city: 'Subang', province: 'Jawa Barat', phone: '081234567890', isDefault: true },
    ],
    wishlists: [],
    shippings: [
      { id: 's1', orderId: 'o1', courier: 'JNE', trackingNumber: 'JNE001234567', status: 'delivered', estimatedDays: 3, deliveredAt: '2026-06-17T10:00:00Z' },
      { id: 's2', orderId: 'o2', courier: 'SiCepat', trackingNumber: 'SC001234568', status: 'shipping', estimatedDays: 2, deliveredAt: undefined },
    ],
    reports: [],
    farmlands: [
      { id: 'fl1', farmerId: 'u2', name: 'Sawah Cijambe', address: 'Desa Cijambe, Kec. Subang', latitude: -6.512, longitude: 107.645, areaSize: 2.5, areaUnit: 'hektar', createdAt: '2024-01-20T00:00:00Z' },
      { id: 'fl2', farmerId: 'u3', name: 'Kebun Garut', address: 'Kp. Cikandang, Garut', latitude: -7.214, longitude: 107.887, areaSize: 1.8, areaUnit: 'hektar', createdAt: '2024-03-01T00:00:00Z' },
      { id: 'fl3', farmerId: 'u4', name: 'Lahan Brebes', address: 'Ds. Kersana, Brebes', latitude: -6.874, longitude: 109.088, areaSize: 3.0, areaUnit: 'hektar', createdAt: '2024-03-15T00:00:00Z' },
    ],
    productCategories: [
      { id: 'pc1', name: 'Pangan Pokok', parentId: null, description: 'Beras, jagung, gandum', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'pc2', name: 'Sayuran', parentId: null, description: 'Sayuran segar', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'pc3', name: 'Rempah & Bumbu', parentId: null, description: 'Bawang, cabai, rempah', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'pc4', name: 'Buah', parentId: null, description: 'Buah-buahan segar', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'pc5', name: 'Protein', parentId: null, description: 'Telur, daging, ikan', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'pc6', name: 'Beras Premium', parentId: 'pc1', description: 'Beras kualitas premium', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'pc7', name: 'Beras Medium', parentId: 'pc1', description: 'Beras kualitas medium', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'pc8', name: 'Cabai', parentId: 'pc3', description: 'Cabai segar', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'pc9', name: 'Bawang', parentId: 'pc3', description: 'Bawang merah & putih', createdAt: '2024-01-01T00:00:00Z' },
    ],
    priceAlerts: [],
    promos: [
      { id: 'pr1', title: 'Diskon Spesial Akhir Pekan', description: 'Dapatkan diskon 10% untuk semua produk!', discountType: 'percentage', discountValue: 10, code: 'WEEKEND10', minPurchase: 50000, isActive: true, createdAt: '2026-06-01T00:00:00Z' },
      { id: 'pr2', title: 'Promo Petani Baru', description: 'Diskon Rp20.000 untuk pendaftar baru sebagai petani', discountType: 'nominal', discountValue: 20000, code: 'PETANI20', minPurchase: 0, isActive: true, createdAt: '2026-06-10T00:00:00Z' },
    ],
    priceHistories: (() => {
      const histories: PriceHistory[] = []
      const commodities = ['c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','c11','c12','c13','c14','c15']
      const markets = ['m1','m2','m3','m4','m5','m6','m7','m8']
      const basePrices: Record<string, number> = { c1:14000, c2:11500, c3:45000, c4:62000, c5:32000, c6:28000, c7:12000, c8:18000, c9:15000, c10:26000, c11:35000, c12:30000, c13:18000, c14:17000, c15:8000 }
      let hid = 1
      for (const ci of commodities) {
        for (const mi of markets) {
          const base = basePrices[ci] || 10000
          for (let d = 90; d >= 0; d--) {
            const date = new Date('2026-03-23')
            date.setDate(date.getDate() + d)
            const variance = Math.round(base * (Math.random() * 0.4 - 0.15))
            const price = base + variance
            histories.push({
              id: `ph${hid++}`, commodityId: ci, marketId: mi,
              price: Math.max(1000, price), date: date.toISOString().split('T')[0],
            })
          }
        }
      }
      return histories
    })(),
    _version: DB_VERSION,
  }
}

function loadDB(): Database {
  try {
    const saved = localStorage.getItem(DB_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed._version && parsed._version >= DB_VERSION) {
        if (!parsed.marketPrices || !parsed.marketPrices.length) {
          const fresh = seedData()
          fresh._version = DB_VERSION
          localStorage.setItem(DB_KEY, JSON.stringify(fresh))
          return fresh
        }
        if (!parsed.promos) parsed.promos = []
        return parsed
      }
    }
  } catch { /* ignore */ }
  const fresh = seedData()
  fresh._version = DB_VERSION
  localStorage.setItem(DB_KEY, JSON.stringify(fresh))
  return fresh
}

function saveDB(): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

let db = loadDB()

function uuid(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8) }

export function resetDB(): void {
  db = seedData()
  saveDB()
}

// =============== USERS ===============
export function getUsers(): User[] { return [...db.users] }
export function getUser(id: string): User | undefined { return db.users.find(u => u.id === id) }
export function getUserByEmail(email: string): User | undefined { return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) }
export function getUserByPhone(phone: string): User | undefined { return db.users.find(u => u.phone === phone) }

export function createUser(data: { email: string; phone: string; password: string; name: string; role: UserRole; location: string }): User {
  const user: User = { id: uuid(), ...data, isVerified: false, isActive: true, createdAt: now() }
  db.users.push(user); saveDB(); return user
}

export function updateUser(id: string, data: Partial<User>): User | undefined {
  const idx = db.users.findIndex(u => u.id === id)
  if (idx < 0) return undefined
  db.users[idx] = { ...db.users[idx], ...data } as User
  saveDB(); return db.users[idx]
}

export function verifyUser(id: string): User | undefined {
  return updateUser(id, { isVerified: true })
}

// =============== COMMODITIES ===============
export function getCommodities(): Commodity[] { return [...db.commodities] }
export function getCommodity(id: string): Commodity | undefined { return db.commodities.find(c => c.id === id) }
export function getCommoditiesByCategory(category: string): Commodity[] { return db.commodities.filter(c => c.category === category) }
export function getCommodityCategories(): string[] { return [...new Set(db.commodities.map(c => c.category))] }

export function createCommodity(data: { name: string; category: string; unit: string; image: string; description: string }): Commodity {
  const c: Commodity = { id: uuid(), ...data, createdAt: now() }
  db.commodities.push(c); saveDB(); return c
}

export function updateCommodity(id: string, data: Partial<Commodity>): Commodity | undefined {
  const idx = db.commodities.findIndex(c => c.id === id)
  if (idx < 0) return undefined
  db.commodities[idx] = { ...db.commodities[idx], ...data } as Commodity
  saveDB(); return db.commodities[idx]
}

export function deleteCommodity(id: string): boolean {
  const idx = db.commodities.findIndex(c => c.id === id)
  if (idx < 0) return false
  db.commodities.splice(idx, 1)
  db.marketPrices = db.marketPrices.filter(mp => mp.commodityId !== id)
  saveDB(); return true
}

// =============== MARKETS ===============
export function getMarkets(): Market[] { return [...db.markets] }
export function getMarket(id: string): Market | undefined { return db.markets.find(m => m.id === id) }
export function getMarketsByProvince(province: string): Market[] { return db.markets.filter(m => m.province === province) }
export function getMarketProvinces(): string[] { return [...new Set(db.markets.map(m => m.province))] }
export function getMarketCities(): string[] { return [...new Set(db.markets.map(m => m.city))] }

export function createMarket(data: { name: string; city: string; province: string; type: string; latitude: number; longitude: number }): Market {
  const m: Market = { id: uuid(), ...data, createdAt: now() }
  db.markets.push(m); saveDB(); return m
}

export function updateMarket(id: string, data: Partial<Market>): Market | undefined {
  const idx = db.markets.findIndex(m => m.id === id)
  if (idx < 0) return undefined
  db.markets[idx] = { ...db.markets[idx], ...data } as Market
  saveDB(); return db.markets[idx]
}

export function deleteMarket(id: string): boolean {
  const idx = db.markets.findIndex(m => m.id === id)
  if (idx < 0) return false
  db.markets.splice(idx, 1)
  db.marketPrices = db.marketPrices.filter(mp => mp.marketId !== id)
  saveDB(); return true
}

// =============== MARKET PRICES ===============
export function getMarketPrices(): MarketPrice[] { return [...db.marketPrices] }
export function getMarketPricesByCommodity(commodityId: string): MarketPrice[] { return db.marketPrices.filter(mp => mp.commodityId === commodityId) }
export function getMarketPricesByMarket(marketId: string): MarketPrice[] { return db.marketPrices.filter(mp => mp.marketId === marketId) }

export function getAvgPriceByCommodity(commodityId: string): number {
  const prices = db.marketPrices.filter(mp => mp.commodityId === commodityId)
  if (prices.length === 0) return 0
  return Math.round(prices.reduce((s, p) => s + p.avgPrice, 0) / prices.length)
}

export function getPriceByCommodityAndMarket(commodityId: string, marketId: string): MarketPrice | undefined {
  return db.marketPrices.find(mp => mp.commodityId === commodityId && mp.marketId === marketId)
}

export function getPriceComparison(commodityId: string) {
  const prices = getMarketPricesByCommodity(commodityId)
  return prices.map(mp => {
    const market = getMarket(mp.marketId)
    return { ...mp, marketName: market?.name || '', marketCity: market?.city || '', marketProvince: market?.province || '' }
  })
}

export function upsertMarketPrice(data: { commodityId: string; marketId: string; avgPrice: number; minPrice: number; maxPrice: number; trend: 'up'|'down'|'stable' }): MarketPrice {
  const trend = data.trend || 'stable'
  const existing = db.marketPrices.find(mp => mp.commodityId === data.commodityId && mp.marketId === data.marketId)
  if (existing) {
    Object.assign(existing, { ...data, trend, date: now() })
    saveDB(); return existing
  }
  const mp: MarketPrice = { id: uuid(), ...data, trend, date: now() }
  db.marketPrices.push(mp); saveDB(); return mp
}

export function deleteMarketPrice(id: string): boolean {
  const idx = db.marketPrices.findIndex(mp => mp.id === id)
  if (idx < 0) return false
  db.marketPrices.splice(idx, 1); saveDB(); return true
}

// =============== PRODUCTS ===============
export function getProducts(): Product[] { return [...db.products] }
export function getProduct(id: string): Product | undefined { return db.products.find(p => p.id === id) }
export function getProductsByFarmer(farmerId: string): Product[] { return db.products.filter(p => p.farmerId === farmerId) }
export function getProductsByCommodity(commodityId: string): Product[] { return db.products.filter(p => p.commodityId === commodityId) }
export function getAvailableProducts(): Product[] { return db.products.filter(p => p.isAvailable && p.stock > 0) }

export function createProduct(data: { farmerId: string; commodityId: string; name: string; description: string; price: number; stock: number; unit: string; image: string }): Product {
  const p: Product = { id: uuid(), ...data, isAvailable: true, status: 'active', createdAt: now() }
  db.products.push(p); saveDB()
  notifyNewProduct(p.id)
  return p
}

export function updateProduct(id: string, data: Partial<Product>): Product | undefined {
  const idx = db.products.findIndex(p => p.id === id)
  if (idx < 0) return undefined
  db.products[idx] = { ...db.products[idx], ...data } as Product
  saveDB(); return db.products[idx]
}

export function deleteProduct(id: string): boolean {
  const idx = db.products.findIndex(p => p.id === id)
  if (idx < 0) return false
  db.products.splice(idx, 1); saveDB(); return true
}

// =============== CARTS ===============
export function getCarts(userId: string): CartItem[] { return db.carts.filter(c => c.userId === userId) }

export function addToCart(userId: string, item: { productId: string; quantity: number }): CartItem[] {
  const product = getProduct(item.productId)
  if (!product) return getCarts(userId)
  const existing = db.carts.find(c => c.userId === userId && c.productId === item.productId)
  if (existing) {
    existing.quantity = Math.min(existing.quantity + item.quantity, product.stock)
  } else {
    db.carts.push({
      id: uuid(), userId, productId: item.productId, quantity: item.quantity,
      productName: product.name, price: product.price, unit: product.unit,
      farmerId: product.farmerId, image: product.image, stock: product.stock,
    })
  }
  addNotification(userId, 'cart', 'Ditambahkan ke Keranjang', product.name + ' ditambahkan ke keranjang belanja.', '/cart')
  saveDB(); return getCarts(userId)
}

export function updateCartQuantity(userId: string, productId: string, quantity: number): CartItem[] {
  const item = db.carts.find(c => c.userId === userId && c.productId === productId)
  if (item) { item.quantity = Math.max(1, Math.min(quantity, item.stock)); saveDB() }
  return getCarts(userId)
}

export function removeFromCart(userId: string, productId: string): CartItem[] {
  db.carts = db.carts.filter(c => !(c.userId === userId && c.productId === productId))
  saveDB(); return getCarts(userId)
}

export function clearCart(userId: string): void {
  db.carts = db.carts.filter(c => c.userId !== userId); saveDB()
}

// =============== ORDERS ===============
export function getOrders(): Order[] { return [...db.orders] }
export function getOrdersByBuyer(buyerId: string): Order[] { return db.orders.filter(o => o.buyerId === buyerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }
export function getOrdersByFarmer(farmerId: string): Order[] { return db.orders.filter(o => o.farmerId === farmerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }
export function getOrder(id: string): Order | undefined { return db.orders.find(o => o.id === id) }

export function createOrder(data: { buyerId: string; farmerId: string; paymentMethod: PaymentMethodType; shippingMethod: string; shippingCost: number; notes: string; items: { productId: string; commodityName: string; quantity: number; unit: string; price: number; subtotal: number; productImage?: string }[] }): Order | null {
  if (data.items.length === 0) return null
  const totalPrice = data.items.reduce((s, i) => s + i.subtotal, 0) + data.shippingCost
  const order: Order = {
    id: uuid(), ...data, status: 'pending', totalPrice, createdAt: now(), updatedAt: now(),
  }
  db.orders.push(order)
  for (const item of data.items) {
    const productImage = item.productImage || db.products.find(p => p.id === item.productId)?.image
    db.orderItems.push({ id: uuid(), orderId: order.id, productId: item.productId, commodityName: item.commodityName, quantity: item.quantity, unit: item.unit, price: item.price, subtotal: item.subtotal, productImage })
    const prod = db.products.find(p => p.id === item.productId)
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity)
      if (prod.stock === 0) notifyStockEmpty(prod.id)
    }
  }
  db.payments.push({ id: uuid(), orderId: order.id, userId: data.buyerId, method: data.paymentMethod, amount: totalPrice, status: 'pending', proofImage: '', createdAt: now() })
  addNotification(data.farmerId, 'order_update', 'Pesanan Baru', `Pesanan baru dari ${getUser(data.buyerId)?.name || ''} masuk! Segera proses.`, '/pesanan')
  addNotification(data.buyerId, 'order_update', 'Pesanan Dibuat', `Pesanan #${order.id.slice(-6).toUpperCase()} berhasil dibuat. Menunggu konfirmasi petani.`, '/pesanan')
  saveDB(); return order
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | undefined {
  const order = db.orders.find(o => o.id === id)
  if (!order) return undefined
  order.status = status; order.updatedAt = now()
  if (status === 'confirmed') {
    addNotification(order.buyerId, 'order_update', 'Pesanan Dikonfirmasi', `Pesanan #${id.slice(-6).toUpperCase()} telah dikonfirmasi petani. Segera diproses.`)
  }
  if (status === 'shipped') {
    addNotification(order.buyerId, 'order_update', 'Pesanan Dikirim', `Pesanan #${id.slice(-6).toUpperCase()} sedang dalam perjalanan.`)
  }
  if (status === 'delivered') {
    addNotification(order.buyerId, 'order_update', 'Pesanan Selesai', `Pesanan #${id.slice(-6).toUpperCase()} telah selesai. Terima kasih!`)
  }
  saveDB(); return order
}

export function getOrderItems(orderId: string): OrderItem[] { return db.orderItems.filter(i => i.orderId === orderId) }

// =============== PAYMENTS ===============
export function getPayments(): Payment[] { return [...db.payments] }
export function getPaymentsByUser(userId: string): Payment[] { return db.payments.filter(p => p.userId === userId) }
export function getPaymentByOrder(orderId: string): Payment | undefined { return db.payments.find(p => p.orderId === orderId) }

export function uploadPaymentProof(orderId: string, userId: string, proofImage: string, photos?: string[]): Payment | undefined {
  let payment = db.payments.find(p => p.orderId === orderId)
  if (!payment) {
    const order = getOrder(orderId)
    if (!order) return undefined
    payment = { id: uuid(), orderId, userId, method: order.paymentMethod, amount: order.totalPrice, status: 'pending', proofImage, photos, createdAt: now() }
    db.payments.push(payment)
  } else {
    payment.proofImage = proofImage
    if (photos) payment.photos = photos
    payment.status = 'pending'
  }
  const order = getOrder(orderId)
  if (order) {
    addNotification(order.farmerId, 'order_update', 'Bukti Pembayaran & Foto', `Pembeli mengupload bukti pembayaran dan foto produk untuk pesanan #${orderId.slice(-6).toUpperCase()}. Silakan cek dan konfirmasi.`)
  }
  saveDB(); return payment
}

export function verifyPayment(paymentId: string, adminId: string, status: 'verified' | 'rejected'): Payment | undefined {
  const payment = db.payments.find(p => p.id === paymentId)
  if (!payment) return undefined
  const order = db.orders.find(o => o.id === payment.orderId)
  payment.status = status
  payment.verifiedBy = adminId
  if (status === 'verified') {
    payment.verifiedAt = now()
    if (order && order.status === 'pending') order.status = 'confirmed'
    addNotification(payment.userId, 'order_update', 'Pembayaran Diverifikasi', `Pembayaran pesanan #${payment.orderId.slice(-6).toUpperCase()} telah diverifikasi.`)
    if (order) addNotification(order.farmerId, 'order_update', 'Pembayaran Dikonfirmasi', `Pembayaran untuk pesanan #${payment.orderId.slice(-6).toUpperCase()} telah dikonfirmasi admin. Segera proses pesanan.`)
  } else {
    addNotification(payment.userId, 'order_update', 'Pembayaran Ditolak', `Pembayaran pesanan #${payment.orderId.slice(-6).toUpperCase()} ditolak. Silakan upload ulang bukti pembayaran.`)
  }
  saveDB(); return payment
}

export function farmerVerifyPayment(orderId: string, farmerId: string, status: 'verified' | 'rejected'): Payment | undefined {
  const order = db.orders.find(o => o.id === orderId)
  if (!order || order.farmerId !== farmerId) return undefined
  const payment = db.payments.find(p => p.orderId === orderId)
  if (!payment) return undefined
  payment.status = status
  payment.verifiedBy = farmerId
  if (status === 'verified') {
    payment.verifiedAt = now()
    addNotification(payment.userId, 'order_update', 'Pembayaran Diterima Petani', `Pembayaran pesanan #${orderId.slice(-6).toUpperCase()} telah diterima petani. Pesanan segera diproses.`)
    addNotification(order.farmerId, 'order_update', 'Pembayaran Dikonfirmasi', `Anda telah menerima pembayaran untuk pesanan #${orderId.slice(-6).toUpperCase()}. Segera kirim pesanan.`)
  } else {
    addNotification(payment.userId, 'order_update', 'Pembayaran Ditolak Petani', `Pembayaran pesanan #${orderId.slice(-6).toUpperCase()} ditolak. Silakan upload ulang bukti pembayaran.`)
    addNotification(order.farmerId, 'order_update', 'Pembayaran Ditolak', `Anda telah menolak pembayaran untuk pesanan #${orderId.slice(-6).toUpperCase()}.`)
  }
  saveDB(); return payment
}

// =============== SHIPPING ===============
export function getShippings(): Shipping[] { return [...db.shippings] }
export function getShippingByOrder(orderId: string): Shipping | undefined { return db.shippings.find(s => s.orderId === orderId) }

export function createShipping(data: { orderId: string; courier: string; trackingNumber: string; estimatedDays: number }): Shipping {
  const s: Shipping = { id: uuid(), ...data, status: 'pending', deliveredAt: undefined }
  db.shippings.push(s)
  const order = db.orders.find(o => o.id === data.orderId)
  if (order) {
    order.status = 'shipped'; order.updatedAt = now()
    addNotification(order.buyerId, 'order_update', 'Pesanan Dikirim', `Pesanan #${data.orderId.slice(-6).toUpperCase()} dikirim via ${data.courier} (Resi: ${data.trackingNumber}). Lacak pesanan Anda!`)
    addNotification(order.farmerId, 'order_update', 'Pesanan Dikirim', `Pesanan #${data.orderId.slice(-6).toUpperCase()} telah dikirim.`)
  }
  saveDB(); return s
}

export function updateShippingStatus(orderId: string, status: string): Shipping | undefined {
  const s = db.shippings.find(s => s.orderId === orderId)
  if (!s) return undefined
  s.status = status
  if (status === 'delivered') { s.deliveredAt = now(); const o = db.orders.find(o => o.id === orderId); if (o) { o.status = 'delivered'; o.updatedAt = now() } }
  saveDB(); return s
}

// =============== REVIEWS ===============
export function getReviews(productId: string): Review[] { return db.reviews.filter(r => r.productId === productId) }
export function getReviewsByFarmer(farmerId: string): Review[] {
  const farmerProductIds = db.products.filter(p => p.farmerId === farmerId).map(p => p.id)
  return db.reviews.filter(r => farmerProductIds.includes(r.productId))
}
export function getAvgRating(productId: string): number {
  const r = getReviews(productId); return r.length ? r.reduce((s, i) => s + i.rating, 0) / r.length : 0
}
export function getRatingCount(productId: string): number { return getReviews(productId).length }

export function addReview(data: { productId: string; userId: string; userName: string; rating: number; comment: string; orderId?: string }): Review | null {
  if (!canReviewProduct(data.userId, data.productId)) return null
  const r: Review = { id: uuid(), ...data, createdAt: now() }
  db.reviews.push(r); saveDB()
  const product = db.products.find(p => p.id === data.productId)
  if (product) {
    addNotification(product.farmerId, 'order_update', 'Ulasan Baru', `${data.userName} memberikan ulasan ${data.rating} bintang untuk produk ${product.name}.`)
  }
  return r
}

export function deleteReview(id: string): boolean {
  const idx = db.reviews.findIndex(r => r.id === id)
  if (idx < 0) return false; db.reviews.splice(idx, 1); saveDB(); return true
}

// =============== WISHLISTS ===============
export function getWishlists(userId: string): WishlistItem[] { return db.wishlists.filter(w => w.userId === userId) }
export function isInWishlist(userId: string, productId: string): boolean { return db.wishlists.some(w => w.userId === userId && w.productId === productId) }

export function toggleWishlist(userId: string, productId: string): WishlistItem[] {
  const idx = db.wishlists.findIndex(w => w.userId === userId && w.productId === productId)
  if (idx >= 0) db.wishlists.splice(idx, 1)
  else db.wishlists.push({ id: uuid(), userId, productId, addedAt: now() })
  saveDB(); return getWishlists(userId)
}
export function removeFromWishlist(userId: string, productId: string): WishlistItem[] {
  const idx = db.wishlists.findIndex(w => w.userId === userId && w.productId === productId)
  if (idx >= 0) db.wishlists.splice(idx, 1)
  saveDB(); return getWishlists(userId)
}
export function addWishlist(userId: string, productId: string): WishlistItem[] {
  if (!db.wishlists.some(w => w.userId === userId && w.productId === productId)) {
    db.wishlists.push({ id: uuid(), userId, productId, addedAt: now() })
  }
  saveDB(); return getWishlists(userId)
}
export function getWishlistProductPrice(productId: string): number {
  const product = db.products.find(p => p.id === productId)
  return product?.price || 0
}
export function checkWishlistPriceDrops(userId: string): { productId: string; productName: string; dropPercent: number; oldPrice: number; newPrice: number }[] {
  return []
}
export function generateWishlistPriceDropNotifications(userId: string): void {
  const drops = checkWishlistPriceDrops(userId)
  for (const d of drops) {
    const existing = db.notifications.some(n =>
      n.userId === userId && n.type === 'price_alert' && n.message.includes(d.productName) && n.message.includes('turun')
    )
    if (!existing) {
      addNotification(userId, 'price_alert', 'Harga Turun! ' + d.productName,
        'Harga ' + d.productName + ' turun ' + d.dropPercent + '%! Rp' + d.oldPrice.toLocaleString('id-ID') + ' → Rp' + d.newPrice.toLocaleString('id-ID') + '. Yuk beli sekarang!')
    }
  }
}

// =============== ADDRESSES ===============
export function getAddresses(userId: string): Address[] { return db.addresses.filter(a => a.userId === userId) }
export function getDefaultAddress(userId: string): Address | undefined { return db.addresses.find(a => a.userId === userId && a.isDefault) }

export function createAddress(data: { userId: string; label: string; address: string; city: string; province: string; phone: string; isDefault?: boolean }): Address {
  if (data.isDefault) db.addresses.forEach(a => { if (a.userId === data.userId) a.isDefault = false })
  const a: Address = { id: uuid(), ...data, isDefault: data.isDefault || false }
  db.addresses.push(a); saveDB(); return a
}

export function deleteAddress(id: string): boolean {
  const idx = db.addresses.findIndex(a => a.id === id)
  if (idx < 0) return false; db.addresses.splice(idx, 1); saveDB(); return true
}

// =============== NOTIFICATIONS ===============
export function getNotifications(userId: string): Notification[] {
  return db.notifications.filter(n => n.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
export function getUnreadCount(userId: string): number { return db.notifications.filter(n => n.userId === userId && !n.isRead).length }

export function addNotification(userId: string, type: Notification['type'], title: string, message: string, link?: string): Notification {
  const n: Notification = { id: uuid(), userId, title, message, type, isRead: false, createdAt: now(), link }
  db.notifications.push(n); saveDB(); return n
}

export function markNotificationRead(id: string): void {
  const n = db.notifications.find(n => n.id === id); if (n) { n.isRead = true; saveDB() }
}

export function markAllNotificationsRead(userId: string): void {
  db.notifications.forEach(n => { if (n.userId === userId) n.isRead = true }); saveDB()
}

export function deleteNotification(id: string): boolean {
  const idx = db.notifications.findIndex(n => n.id === id)
  if (idx < 0) return false; db.notifications.splice(idx, 1); saveDB(); return true
}

export function notifyPromoToAll(title: string, message: string): void {
  const users = db.users.filter(u => !u.isSeed)
  for (const u of users) { addNotification(u.id, 'promo', title, message) }
}

// =============== PROMOS ===============
export function getPromos(): Promo[] {
  return [...db.promos].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
export function getPromo(id: string): Promo | undefined {
  return db.promos.find(p => p.id === id)
}
export function createPromo(data: { title: string; description: string; discountType: 'percentage' | 'nominal'; discountValue: number; code: string; minPurchase: number }): Promo {
  const promo: Promo = { id: uuid(), ...data, isActive: true, createdAt: now() }
  db.promos.push(promo); saveDB()
  const users = db.users.filter(u => !u.isSeed)
  for (const u of users) { addNotification(u.id, 'promo', 'Promo Baru: ' + promo.title, promo.description + ' — Gunakan kode: ' + promo.code) }
  return promo
}
export function updatePromo(id: string, data: Partial<Promo>): Promo | undefined {
  const promo = db.promos.find(p => p.id === id)
  if (!promo) return undefined
  Object.assign(promo, data); saveDB()
  const users = db.users.filter(u => !u.isSeed)
  for (const u of users) { addNotification(u.id, 'promo', 'Promo Diperbarui: ' + promo.title, 'Cek promo terbaru dari AgriMarket!') }
  return promo
}
export function deletePromo(id: string): boolean {
  const promo = db.promos.find(p => p.id === id)
  if (!promo) return false
  db.promos = db.promos.filter(p => p.id !== id); saveDB()
  const users = db.users.filter(u => !u.isSeed)
  for (const u of users) { addNotification(u.id, 'promo', 'Promo Berakhir: ' + promo.title, 'Promo ' + promo.title + ' telah berakhir. Terima kasih telah berpartisipasi!') }
  return true
}

export function notifyNewProduct(productId: string): void {
  const product = db.products.find(p => p.id === productId)
  if (!product) return
  const buyers = db.users.filter(u => u.role === 'pembeli' && !u.isSeed)
  for (const b of buyers) {
    addNotification(b.id, 'new_product', 'Produk Baru: ' + product.name,
      'Produk ' + product.name + ' tersedia mulai Rp' + product.price.toLocaleString('id-ID') + '/' + product.unit + '. Lihat di Marketplace!')
  }
}

export function notifyStockEmpty(productId: string): void {
  const product = db.products.find(p => p.id === productId)
  if (!product) return
  product.isAvailable = false
  product.status = 'inactive'
  addNotification(product.farmerId, 'stock_empty', 'Stok Habis: ' + product.name,
    'Produk ' + product.name + ' sudah habis terjual dan otomatis dinonaktifkan. Segera perbarui stok agar aktif kembali.')
  saveDB()
}

// =============== REPORTS ===============
export function getTransactionReport(startDate?: string, endDate?: string) {
  let orders = [...db.orders]
  if (startDate) orders = orders.filter(o => o.createdAt >= startDate)
  if (endDate) orders = orders.filter(o => o.createdAt <= endDate)
  const totalRevenue = orders.reduce((s, o) => s + o.totalPrice, 0)
  const totalOrders = orders.length
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
  return { orders, totalRevenue, totalOrders, avgOrderValue }
}

export function getFarmerReport(farmerId: string) {
  const orders = db.orders.filter(o => o.farmerId === farmerId)
  const products = db.products.filter(p => p.farmerId === farmerId)
  const totalRevenue = orders.reduce((s, o) => s + o.totalPrice, 0)
  const totalOrders = orders.length
  const totalProducts = products.length
  return { orders, products, totalRevenue, totalOrders, totalProducts }
}

export function getMarketPriceReport(commodityId?: string) {
  let prices = [...db.marketPrices]
  if (commodityId) prices = prices.filter(p => p.commodityId === commodityId)
  const avgPrice = prices.length > 0 ? Math.round(prices.reduce((s, p) => s + p.avgPrice, 0) / prices.length) : 0
  return { prices, avgPrice, totalData: prices.length }
}

// =============== FARMLANDS ===============
export function getFarmlands(farmerId: string): FarmLand[] { return db.farmlands.filter(f => f.farmerId === farmerId) }
export function createFarmland(data: { farmerId: string; name: string; address: string; latitude: number; longitude: number; areaSize: number; areaUnit: string }): FarmLand {
  const f: FarmLand = { id: uuid(), ...data, createdAt: now() }
  db.farmlands.push(f); saveDB(); return f
}
export function deleteFarmland(id: string): boolean {
  const idx = db.farmlands.findIndex(f => f.id === id)
  if (idx < 0) return false; db.farmlands.splice(idx, 1); saveDB(); return true
}

// =============== PRODUCT CATEGORIES ===============
export function getProductCategories(): ProductCategory[] { return [...db.productCategories] }
export function getRootCategories(): ProductCategory[] { return db.productCategories.filter(c => c.parentId === null) }
export function getChildCategories(parentId: string): ProductCategory[] { return db.productCategories.filter(c => c.parentId === parentId) }
export function getCategoryHierarchy(): ProductCategory[] {
  const roots = getRootCategories()
  const result: ProductCategory[] = []
  for (const r of roots) {
    result.push(r)
    const children = getChildCategories(r.id)
    result.push(...children.map(c => ({ ...c, name: `-- ${c.name}` })))
  }
  return result
}

// =============== PRICE ALERTS ===============
export function getPriceAlerts(userId: string): PriceAlert[] { return db.priceAlerts.filter(a => a.userId === userId) }
export function getPriceAlertsByCommodity(commodityId: string): PriceAlert[] { return db.priceAlerts.filter(a => a.commodityId === commodityId && a.isActive) }

export function togglePriceAlert(userId: string, commodityId: string, direction?: 'up'|'down'|'any', targetPrice?: number): PriceAlert[] {
  const existing = db.priceAlerts.find(a => a.userId === userId && a.commodityId === commodityId)
  if (existing) {
    existing.isActive = !existing.isActive
    if (existing.isActive && direction) existing.direction = direction
    if (existing.isActive && targetPrice) existing.targetPrice = targetPrice
  } else {
    db.priceAlerts.push({ id: uuid(), userId, commodityId, direction: direction || 'any', targetPrice, isActive: true, createdAt: now() })
  }
  saveDB(); return getPriceAlerts(userId)
}

export function deletePriceAlert(id: string): boolean {
  const idx = db.priceAlerts.findIndex(a => a.id === id)
  if (idx < 0) return false; db.priceAlerts.splice(idx, 1); saveDB(); return true
}

// =============== PRICE HISTORY for Charts ===============
export function getPriceHistory(commodityId: string, days: number = 30): { date: string; avgPrice: number }[] {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceStr = since.toISOString().split('T')[0]
  const records = db.priceHistories.filter(h => h.commodityId === commodityId && h.date >= sinceStr)
  const byDate: Record<string, number[]> = {}
  for (const r of records) {
    if (!byDate[r.date]) byDate[r.date] = []
    byDate[r.date].push(r.price)
  }
  return Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, prices]) => ({
    date, avgPrice: Math.round(prices.reduce((s, p) => s + p, 0) / prices.length)
  }))
}

export function getPriceHistoryForProduct(commodityId: string, days: number = 30): { date: string; avgPrice: number }[] {
  return getPriceHistory(commodityId, days)
}

// =============== REVIEW VALIDATION ===============
export function canReviewProduct(userId: string, productId: string): boolean {
  const product = getProduct(productId)
  if (!product) return false
  return db.orders.some(o =>
    o.buyerId === userId &&
    o.status === 'delivered' &&
    db.orderItems.some(oi => oi.orderId === o.id && oi.productId === productId)
  )
}

// =============== AUTO-CANCEL EXPIRED ORDERS ===============
export function checkExpiredOrders(): void {
  const now_ = new Date()
  for (const order of db.orders) {
    if (order.status !== 'pending') continue
    const created = new Date(order.createdAt)
    const hoursDiff = (now_.getTime() - created.getTime()) / (1000 * 60 * 60)
    if (hoursDiff >= 24) {
      order.status = 'expired'
      order.autoCancelledAt = now()
      order.updatedAt = now()
      addNotification(order.buyerId, 'order_update', 'Pesanan Dibatalkan', `Pesanan #${order.id.slice(-6).toUpperCase()} dibatalkan otomatis karena melebihi batas waktu pembayaran 24 jam.`)
    }
  }
  saveDB()
}

// =============== BULK MARKET PRICE ===============
export function bulkUpsertMarketPrice(data: { commodityId: string; marketId: string; avgPrice: number; minPrice: number; maxPrice: number; trend: 'up'|'down'|'stable' }[]): number {
  let count = 0
  for (const d of data) {
    upsertMarketPrice(d)
    count++
  }
  return count
}

// =============== DELETE USER ===============
export function deleteUser(userId: string): boolean {
  const idx = db.users.findIndex(u => u.id === userId)
  if (idx < 0) return false
  db.users.splice(idx, 1)
  db.orders = db.orders.filter(o => o.buyerId !== userId && o.farmerId !== userId)
  db.products = db.products.filter(p => p.farmerId !== userId)
  db.reviews = db.reviews.filter(r => r.userId !== userId)
  db.addresses = db.addresses.filter(a => a.userId !== userId)
  db.payments = db.payments.filter(p => p.userId !== userId)
  db.wishlists = db.wishlists.filter(w => w.userId !== userId)
  db.carts = db.carts.filter(c => c.userId !== userId)
  db.farmlands = db.farmlands.filter(f => f.farmerId !== userId)
  db.notifications = db.notifications.filter(n => n.userId !== userId)
  db.priceAlerts = db.priceAlerts.filter(p => p.userId !== userId)
  saveDB(); return true
}

// =============== TOGGLE USER ACTIVE ===============
export function toggleUserActive(userId: string): User | undefined {
  const user = db.users.find(u => u.id === userId)
  if (!user) return undefined
  user.isActive = !user.isActive
  saveDB(); return user
}

// =============== CONFIRM ORDER DELIVERED ===============
export function confirmOrderDelivered(orderId: string): Order | undefined {
  const order = db.orders.find(o => o.id === orderId)
  if (!order || order.status !== 'shipped') return undefined
  order.status = 'delivered'
  order.buyerConfirmed = true
  order.updatedAt = now()
  if (order.paymentMethod === 'cod') {
    const payment = db.payments.find(p => p.orderId === orderId)
    if (payment) { payment.status = 'verified'; payment.verifiedAt = now() }
  }
  addNotification(order.farmerId, 'order_update', 'Pesanan Selesai', `Pesanan #${orderId.slice(-6).toUpperCase()} telah dikonfirmasi diterima pembeli.`)
  saveDB(); return order
}

// =============== DELETE ORDER ===============
export function deleteOrder(orderId: string): boolean {
  const idx = db.orders.findIndex(o => o.id === orderId)
  if (idx < 0) return false
  db.orders.splice(idx, 1)
  db.orderItems = db.orderItems.filter(oi => oi.orderId !== orderId)
  db.payments = db.payments.filter(p => p.orderId !== orderId)
  db.shippings = db.shippings.filter(s => s.orderId !== orderId)
  saveDB(); return true
}

export function uploadDeliveryProof(orderId: string, photos: string[]): Order | undefined {
  const order = db.orders.find(o => o.id === orderId)
  if (!order || order.status !== 'delivered') return undefined
  order.deliveryPhotos = [...(order.deliveryPhotos || []), ...photos]
  order.updatedAt = now()
  addNotification(order.farmerId, 'order_update', 'Foto Bukti Produk', `Pembeli mengupload foto bukti produk untuk pesanan #${orderId.slice(-6).toUpperCase()}. Produk telah sampai dengan baik.`)
  saveDB(); return order
}

// =============== DELETE REVIEW (ADMIN) ===============
export function getAllReviews() { return [...db.reviews] }
