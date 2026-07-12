import { apiCommodities, apiMarkets, apiMarketPrices, apiProducts, apiProductCategories, apiOrders, apiUsers, apiFarmlands, request } from './apiService'

const DB_KEY = 'agrimarket_db'

async function syncTable(key: string, fetcher: () => Promise<any[]>, transform?: (item: any) => any) {
  try {
    const data = await fetcher()
    if (data && data.length > 0) {
      const db = JSON.parse(localStorage.getItem(DB_KEY) || '{}')
      db[key] = transform ? data.map(transform) : data
      localStorage.setItem(DB_KEY, JSON.stringify(db))
      return data.length
    }
  } catch (e) {
    console.warn('Sync failed for ' + key + ':', e)
  }
  return 0
}

export async function syncAllFromAPI() {
  const results = await Promise.all([
    syncTable('commodities', () => apiCommodities.getAll()),
    syncTable('markets', () => apiMarkets.getAll()),
    syncTable('products', () => apiProducts.getAll()),
    syncTable('marketPrices', () => apiMarketPrices.getAll()),
    syncTable('productCategories', () => apiProductCategories.getAll()),
    syncTable('users', () => apiUsers.getAll()),
  ])
  const total = results.reduce((s, v) => s + v, 0)
  if (total > 0) console.log('Synced ' + total + ' records from API')
  return total
}

export async function syncUsersToDB(): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const db = JSON.parse(localStorage.getItem(DB_KEY) || '{}')
    const users = db.users || []
    if (users.length === 0) return { success: false, error: 'Tidak ada user di aplikasi untuk disinkronisasi' }
    const res = await request('POST', '/users/sync', { users }, true)
    return { success: true, count: res.count }
  } catch (e: any) {
    return { success: false, error: e.message || 'Sync gagal' }
  }
}
