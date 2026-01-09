// src/api/modules/order.js
import request from './api.js'

// 订单管理相关接口
export default {
  // 获取订单列表
  getOrderList(params) {
    return request({
      url: '/api/orders',
      method: 'get',
      params
    })
  },
  
  // 获取订单详情
  getOrderDetail(orderId) {
    return request({
      url: `/api/orders/${orderId}`,
      method: 'get'
    })
  },
  
  // 更新订单状态
  updateOrderStatus(orderId, status) {
    return request({
      url: `/api/orders/${orderId}/status`,
      method: 'put',
      data: { status }
    })
  },
  
  // 分配配送员
  assignDelivery(orderId, deliveryId) {
    return request({
      url: `/api/orders/${orderId}/assign`,
      method: 'post',
      data: { delivery_id: deliveryId }
    })
  },
  
  // 获取订单商品
  getOrderItems(orderId) {
    return request({
      url: `/api/orders/${orderId}/items`,
      method: 'get'
    })
  }
}