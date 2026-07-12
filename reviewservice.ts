import { getReviews as dbGetReviews, getAvgRating as dbGetAvg, getRatingCount as dbGetCount, addReview as dbAdd } from '@/services/db'

export function useReviews() {
  function getProductReviews(productId: string) { return dbGetReviews(productId) }
  function getAvgRating(productId: string) { return dbGetAvg(productId) }
  function getRatingCount(productId: string) { return dbGetCount(productId) }
  function addReview(data: { productId: string; userId: string; userName: string; rating: number; comment: string; orderId?: string }) { return dbAdd(data) }

  return { getProductReviews, getAvgRating, getRatingCount, addReview }
}
