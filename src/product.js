// src/api/modules/product.js
import request from '@/api'

// 商品管理相关接口
export default {
  // 获取商品列表
  getProductList(params) {
    return request({
      url: '/api/products',
      method: 'get',
      params
    })
  },
  
  // 获取商品分类
  getCategories(restaurantId) {
    return request({
      url: '/api/product-categories',
      method: 'get',
      params: { restaurant_id: restaurantId }
    })
  },
  
  // 新增商品
  addProduct(data) {
    return request({
      url: '/api/products',
      method: 'post',
      data
    })
  },
  
  // 更新商品
  updateProduct(id, data) {
    return request({
      url: `/api/products/${id}`,
      method: 'put',
      data
    })
  },
  
  // 更新商品状态
  updateProductStatus(id, status) {
    return request({
      url: `/api/products/${id}/status`,
      method: 'put',
      data: { status }
    })
  }
}