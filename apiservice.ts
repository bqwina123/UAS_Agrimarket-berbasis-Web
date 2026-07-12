const API_URL = 'http://localhost:3001/api'

function getToken(): string | null {
  return localStorage.getItem('agrimarket_token')
}

export function setToken(token: string) {
  localStorage.setItem('agrimarket_token', token)
}

export function clearToken() {
  localStorage.removeItem('agrimarket_token')
}

export async function request(method: string, path: string, body?: any, auth = false): Promise<any> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = 'Bearer ' + token
  }
  const res = await fetch(API_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

// ========== AUTH ==========
export const apiAuth = {
  login: (credential: string, password: string) => request('POST', '/auth/login', { credential, password }),
  register: (data: { name: string; email: string; phone: string; password: string; role: string; location: string }) => request('POST', '/auth/register', data),
  me: () => request('GET', '/auth/me', undefined, true),
  updateProfile: (data: { name?: string; location?: string; phone?: string; avatar?: string }) => request('PUT', '/auth/profile', data, true),
  changePassword: (oldPassword: string, newPassword: string) => request('PUT', '/auth/password', { oldPassword, newPassword }, true),
}

// ========== COMMODITIES ==========
export const apiCommodities = {
  getAll: () => request('GET', '/commodities'),
  getCategories: () => request('GET', '/commodities/categories'),
  create: (data: any) => request('POST', '/commodities', data, true),
  delete: (id: string) => request('DELETE', '/commodities/' + id, undefined, true),
}

// ========== MARKETS ==========
export const apiMarkets = {
  getAll: () => request('GET', '/markets'),
  getProvinces: () => request('GET', '/markets/provinces'),
  create: (data: any) => request('POST', '/markets', data, true),
  delete: (id: string) => request('DELETE', '/markets/' + id, undefined, true),
}

// ========== MARKET PRICES ==========
export const apiMarketPrices = {
  getAll: (params?: { commodityId?: string; marketId?: string }) => {
    let q = ''
    if (params?.commodityId) q += '?commodityId=' + params.commodityId
    if (params?.marketId) q += (q ? '&' : '?') + 'marketId=' + params.marketId
    return request('GET', '/market-prices' + q)
  },
  getAvg: (commodityId: string) => request('GET', '/market-prices/avg/' + commodityId),
  create: (data: any) => request('POST', '/market-prices', data, true),
  bulk: (data: any[]) => request('POST', '/market-prices/bulk', { data }, true),
  delete: (id: string) => request('DELETE', '/market-prices/' + id, undefined, true),
}

// ========== PRODUCTS ==========
export const apiProducts = {
  getAll: (params?: { farmerId?: string; available?: boolean }) => {
    let q = ''
    if (params?.farmerId) q += '?farmerId=' + params.farmerId
    if (params?.available) q += (q ? '&' : '?') + 'available=true'
    return request('GET', '/products' + q)
  },
  get: (id: string) => request('GET', '/products/' + id),
  create: (data: any) => request('POST', '/products', data, true),
  update: (id: string, data: any) => request('PUT', '/products/' + id, data, true),
  delete: (id: string) => request('DELETE', '/products/' + id, undefined, true),
}

// ========== CARTS ==========
export const apiCarts = {
  get: () => request('GET', '/carts', undefined, true),
  add: (productId: string, quantity: number) => request('POST', '/carts/add', { productId, quantity }, true),
  update: (productId: string, quantity: number) => request('PUT', '/carts/' + productId, { quantity }, true),
  remove: (productId: string) => request('DELETE', '/carts/' + productId, undefined, true),
  clear: () => request('DELETE', '/carts', undefined, true),
}

// ========== ORDERS ==========
export const apiOrders = {
  get: () => request('GET', '/orders', undefined, true),
  getAll: () => request('GET', '/orders/all', undefined, true),
  getItems: (id: string) => request('GET', '/orders/' + id + '/items'),
  create: (data: any) => request('POST', '/orders', data, true),
  updateStatus: (id: string, status: string) => request('PUT', '/orders/' + id + '/status', { status }, true),
  confirmDelivered: (id: string) => request('PUT', '/orders/' + id + '/confirm-delivered', {}, true),
  checkExpired: () => request('POST', '/orders/check-expired'),
}

// ========== PAYMENTS ==========
export const apiPayments = {
  get: () => request('GET', '/payments', undefined, true),
  getAll: () => request('GET', '/payments/all', undefined, true),
  uploadProof: (orderId: string, proofImage: string) => request('POST', '/payments/upload-proof', { orderId, proofImage }, true),
  verify: (paymentId: string, status: string) => request('PUT', '/payments/' + paymentId + '/verify', { status }, true),
}

// ========== SHIPPINGS ==========
export const apiShippings = {
  getByOrder: (orderId: string) => request('GET', '/shippings/order/' + orderId),
  create: (data: any) => request('POST', '/shippings', data, true),
}

// ========== REVIEWS ==========
export const apiReviews = {
  getByProduct: (productId: string) => request('GET', '/reviews/product/' + productId),
  getAvg: (productId: string) => request('GET', '/reviews/average/' + productId),
  getAll: () => request('GET', '/reviews/all', undefined, true),
  create: (productId: string, rating: number, comment: string) => request('POST', '/reviews', { productId, rating, comment }, true),
  delete: (id: string) => request('DELETE', '/reviews/' + id, undefined, true),
}

// ========== WISHLISTS ==========
export const apiWishlists = {
  get: () => request('GET', '/wishlists', undefined, true),
  toggle: (productId: string) => request('POST', '/wishlists/toggle', { productId }, true),
  add: (productId: string) => request('POST', '/wishlists', { productId }, true),
  remove: (productId: string) => request('DELETE', '/wishlists/' + productId, undefined, true),
}

// ========== ADDRESSES ==========
export const apiAddresses = {
  get: () => request('GET', '/addresses', undefined, true),
  create: (data: any) => request('POST', '/addresses', data, true),
  delete: (id: string) => request('DELETE', '/addresses/' + id, undefined, true),
}

// ========== NOTIFICATIONS ==========
export const apiNotifications = {
  get: () => request('GET', '/notifications', undefined, true),
  unreadCount: () => request('GET', '/notifications/unread-count', undefined, true),
  markRead: (id: string) => request('PUT', '/notifications/' + id + '/read', {}, true),
  markAllRead: () => request('PUT', '/notifications/read-all', {}, true),
}

// ========== USERS (Admin) ==========
export const apiUsers = {
  getAll: () => request('GET', '/users', undefined, true),
  create: (data: any) => request('POST', '/users', data, true),
  toggleActive: (id: string) => request('PUT', '/users/' + id + '/toggle-active', {}, true),
}

// ========== FARMLANDS ==========
export const apiFarmlands = {
  get: (farmerId: string) => request('GET', '/farmlands/' + farmerId),
  create: (data: any) => request('POST', '/farmlands', data, true),
  delete: (id: string) => request('DELETE', '/farmlands/' + id, undefined, true),
}

// ========== PRODUCT CATEGORIES ==========
export const apiProductCategories = {
  getAll: () => request('GET', '/product-categories'),
}

// ========== PRICE ALERTS ==========
export const apiPriceAlerts = {
  get: () => request('GET', '/price-alerts', undefined, true),
  toggle: (commodityId: string, direction?: string, targetPrice?: number) =>
    request('POST', '/price-alerts/toggle', { commodityId, direction, targetPrice }, true),
}

// ========== PRICE HISTORIES ==========
export const apiPriceHistories = {
  get: (commodityId: string, days: number = 30) => request('GET', '/price-histories/' + commodityId + '?days=' + days),
}

// ========== REPORTS ==========
export const apiReports = {
  transactions: (startDate?: string, endDate?: string) => {
    let q = ''
    if (startDate) q += '?startDate=' + startDate
    if (endDate) q += (q ? '&' : '?') + 'endDate=' + endDate
    return request('GET', '/reports/transactions' + q, undefined, true)
  },
  farmer: (farmerId: string) => request('GET', '/reports/farmer/' + farmerId),
}
