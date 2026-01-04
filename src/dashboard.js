// src/api/modules/dashboard.js
import request from '@/api'

// 仪表盘相关接口
export default {
  // 获取统计数据
  getStats() {
    return request({
      url: '/api/dashboard/stats',
      method: 'get'
    })
  },
  
  // 获取最近订单
  getRecentOrders(params) {
    return request({
      url: '/api/dashboard/orders/recent',
      method: 'get',
      params
    })
  },
  
  // 获取热销商品
  getTopProducts(params) {
    return request({
      url: '/api/dashboard/products/top',
      method: 'get',
      params
    })
  }
}