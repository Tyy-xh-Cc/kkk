import request from '../request.js'

// 餐厅管理相关接口
export default {
  // 获取餐厅列表（支持搜索、筛选、排序）
  getRestaurantList(params) {
    return request({
      url: '/api/paged/restaurants',
      method:'get',
      params
    })
  },
  
  // 搜索餐厅
  searchRestaurants(params) {
    return request({
      url: '/api/restaurants/search',
      method: 'get',
      params
    })
  },
  
  // 获取餐厅详情
  getRestaurantDetail(restaurantId) {
    return request({
      url: `/api/restaurants/${restaurantId}`,
      method: 'get'
    })
  },
  
  // 获取餐厅分类
  getRestaurantCategories(restaurantId) {
    return request({
      url: `/api/restaurants/${restaurantId}/categories`,
      method: 'get'
    })
  },
  
  // 获取餐厅商品列表
  getRestaurantProducts(restaurantId, params) {
    return request({
      url: `/api/restaurants/${restaurantId}/products`,
      method: 'get',
      params
    })
  },
  
  // 获取餐厅评价
  getRestaurantReviews(restaurantId, params) {
    return request({
      url: `/api/restaurants/${restaurantId}/reviews`,
      method: 'get',
      params
    })
  },
  
  // 提交餐厅评价
  submitRestaurantReview(data) {
    return request({
      url: '/api/restaurants/reviews',
      method: 'post',
      data
    })
  },
  
  // 获取附近餐厅
  getNearbyRestaurants(params) {
    return request({
      url: '/api/restaurants/nearby',
      method: 'get',
      params
    })
  },
  
  // 获取推荐餐厅
  getRecommendedRestaurants() {
    return request({
      url: '/api/restaurants/recommended',
      method: 'get'
    })
  },
  
  // 获取餐厅活动信息
  getRestaurantPromotions(restaurantId) {
    return request({
      url: `/api/restaurants/${restaurantId}/promotions`,
      method: 'get'
    })
  },
  
  // 获取餐厅营业状态
  getRestaurantStatus(restaurantId) {
    return request({
      url: `/api/restaurants/${restaurantId}/status`,
      method: 'get'
    })
  },
  
  // 关注/取消关注餐厅
  toggleFollowRestaurant(data) {
    return request({
      url: '/api/restaurants/follow',
      method: 'post',
      data
    })
  }
}