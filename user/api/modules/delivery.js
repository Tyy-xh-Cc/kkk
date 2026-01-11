import request from '../request.js'

// 配送管理相关接口
export default {
  // 获取配送信息
  getDeliveryInfo(orderId) {
    return request({
      url: `/api/deliveries/order/${orderId}`,
      method: 'get'
    })
  },
  
  // 获取配送员信息
  getDeliveryPerson(deliveryId) {
    return request({
      url: `/api/deliveries/${deliveryId}`,
      method: 'get'
    })
  },
  
  // 实时追踪配送
  trackDelivery(orderId) {
    return request({
      url: `/api/deliveries/${orderId}/track`,
      method: 'get'
    })
  },
  
  // 获取附近配送员
  getNearbyDeliveryPersons(params) {
    return request({
      url: '/api/deliveries/nearby',
      method: 'get',
      params
    })
  },
  
  // 联系配送员
  contactDeliveryPerson(deliveryId) {
    return request({
      url: `/api/deliveries/${deliveryId}/contact`,
      method: 'get'
    })
  },
  
  // 评价配送员
  rateDeliveryPerson(deliveryId, data) {
    return request({
      url: `/api/deliveries/${deliveryId}/rate`,
      method: 'post',
      data
    })
  },
  
  // 获取配送员当前位置
  getDeliveryCurrentLocation(deliveryId) {
    return request({
      url: `/api/deliveries/${deliveryId}/location`,
      method: 'get'
    })
  },
  
  // 更新配送状态
  updateDeliveryStatus(deliveryId, data) {
    return request({
      url: `/api/deliveries/${deliveryId}/status`,
      method: 'put',
      data
    })
  }
}