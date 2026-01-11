import request from '../request.js'

// 购物车管理相关接口
export default {
  // 获取购物车列表
  getCartItems() {
    return request({
      url: '/api/cart/items',
      method: 'get'
    })
  },
  
  // 添加商品到购物车
  addToCart(data) {
    return request({
      url: '/api/cart/items',
      method: 'post',
      data
    })
  },
  
  // 更新购物车商品数量
  updateCartItemQuantity(itemId, data) {
    return request({
      url: `/api/cart/items/${itemId}`,
      method: 'put',
      data
    })
  },
  
  // 删除购物车商品
  removeCartItem(itemId) {
    return request({
      url: `/api/cart/items/${itemId}`,
      method: 'delete'
    })
  },
  
  // 清空购物车
  clearCart() {
    return request({
      url: '/api/cart/clear',
      method: 'post'
    })
  },
  
  // 获取购物车商品数量
  getCartCount() {
    return request({
      url: '/api/cart/count',
      method: 'get'
    })
  },
  
  // 批量操作购物车
  batchCartOperation(data) {
    return request({
      url: '/api/cart/batch',
      method: 'post',
      data
    })
  },
  
  // 合并购物车（用户登录后）
  mergeCart(data) {
    return request({
      url: '/api/cart/merge',
      method: 'post',
      data
    })
  },
  
  // 获取购物车金额
  getCartAmount() {
    return request({
      url: '/api/cart/amount',
      method: 'get'
    })
  }
}