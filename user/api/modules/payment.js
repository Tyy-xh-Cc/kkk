import request from './request.js'

// 支付管理相关接口
export default {
  // 发起支付
  createPayment(data) {
    return request({
      url: '/api/payment/create',
      method: 'post',
      data
    })
  },
  
  // 查询支付状态
  checkPaymentStatus(paymentId) {
    return request({
      url: `/api/payment/${paymentId}/status`,
      method: 'get'
    })
  },
  
  // 取消支付
  cancelPayment(paymentId) {
    return request({
      url: `/api/payment/${paymentId}/cancel`,
      method: 'post'
    })
  },
  
  // 申请退款
  applyRefund(paymentId, data) {
    return request({
      url: `/api/payment/${paymentId}/refund`,
      method: 'post',
      data
    })
  },
  
  // 获取支付方式
  getPaymentMethods() {
    return request({
      url: '/api/payment/methods',
      method: 'get'
    })
  },
  
  // 获取支付二维码
  getPaymentQRCode(paymentId) {
    return request({
      url: `/api/payment/${paymentId}/qrcode`,
      method: 'get'
    })
  },
  
  // 支付宝支付
  alipayPayment(data) {
    return request({
      url: '/api/payment/alipay',
      method: 'post',
      data
    })
  },
  
  // 微信支付
  wechatPayment(data) {
    return request({
      url: '/api/payment/wechat',
      method: 'post',
      data
    })
  }
}