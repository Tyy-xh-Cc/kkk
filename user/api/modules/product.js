import request from '../request.js'

// 商品管理相关接口
export default {
  // 获取商品详情
  getProductDetail(productId) {
    return request({
      url: `/api/products/${productId}`,
      method: 'get'
    })
  },
  
  // 搜索商品
  searchProducts(params) {
    return request({
      url: '/api/products/search',
      method: 'get',
      params
    })
  },
  
  // 获取推荐商品
  getRecommendedProducts() {
    return request({
      url: '/api/products/recommended',
      method: 'get'
    })
  },
  
  // 获取热销商品
  getHotProducts(params) {
    return request({
      url: '/api/products/hot',
      method: 'get',
      params
    })
  },
  
  // 获取新品上市
  getNewProducts(params) {
    return request({
      url: '/api/products/new',
      method: 'get',
      params
    })
  },
  
  // 获取商品评价
  getProductReviews(productId, params) {
    return request({
      url: `/api/products/${productId}/reviews`,
      method: 'get',
      params
    })
  },
  
  // 提交商品评价
  submitProductReview(data) {
    return request({
      url: '/api/products/reviews',
      method: 'post',
      data
    })
  },
  
  // 获取商品规格
  getProductSpecifications(productId) {
    return request({
      url: `/api/products/${productId}/specifications`,
      method: 'get'
    })
  },
  
  // 检查商品库存
  checkProductStock(productId, quantity) {
    return request({
      url: `/api/products/${productId}/stock`,
      method: 'get',
      params: { quantity }
    })
  }
}