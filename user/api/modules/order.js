import request from '../request.js'

// 订单管理相关接口
export default {
  // 创建订单
  createOrder(data) {
    return request({
      url: '/api/orders',
      method: 'post',
      data
    })
  },
  
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
  
  // 获取订单商品
  getOrderItems(orderId) {
    return request({
      url: `/api/orders/${orderId}/items`,
      method: 'get'
    })
  },
  
  // 取消订单
  cancelOrder(orderId) {
    return request({
      url: `/api/orders/${orderId}/cancel`,
      method: 'post'
    })
  },
  
  // 支付订单
  payOrder(orderId, data) {
    return request({
      url: `/api/orders/${orderId}/pay`,
      method: 'post',
      data
    })
  },
  
  // 确认收货
  confirmOrder(orderId) {
    return request({
      url: `/api/orders/${orderId}/confirm`,
      method: 'post'
    })
  },
  
  // 获取订单状态
  getOrderStatus(orderId) {
    return request({
      url: `/api/orders/${orderId}/status`,
      method: 'get'
    })
  },
  
  // 更新订单状态
  updateOrderStatus(orderId, data) {
    return request({
      url: `/api/orders/${orderId}/status`,
      method: 'put',
      data
    })
  },
  
  // 申请退款
  applyRefund(orderId, data) {
    return request({
      url: `/api/orders/${orderId}/refund`,
      method: 'post',
      data
    })
  },
  
  // 获取订单发票
  getOrderInvoice(orderId) {
    return request({
      url: `/api/orders/${orderId}/invoice`,
      method: 'get'
    })
  },
  
  // 申请发票
  applyInvoice(orderId, data) {
    return request({
      url: `/api/orders/${orderId}/invoice`,
      method: 'post',
      data
    })
  },
  
  // 评价订单
  rateOrder(orderId, data) {
    return request({
      url: `/api/orders/${orderId}/rate`,
      method: 'post',
      data
    })
  },
  
  // 再来一单
  reorder(orderId) {
    return request({
      url: `/api/orders/${orderId}/reorder`,
      method: 'post'
    })
  },
  
  // 获取订单统计
  getOrderStats() {
    return request({
      url: '/api/orders/stats',
      method: 'get'
    })
  },
  
  // 分配配送员
  assignDelivery(orderId, data) {
    return request({
      url: `/api/orders/${orderId}/assign`,
      method: 'post',
      data
    })
  },
  
  // 获取订单配送轨迹
  getOrderTrack(orderId) {
    return request({
      url: `/api/orders/${orderId}/track`,
      method: 'get'
    })
  }
}