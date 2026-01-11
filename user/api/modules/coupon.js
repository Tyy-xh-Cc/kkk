import request from './request.js'

// 优惠券管理相关接口
export default {
  // 获取优惠券列表
  getCouponList(params) {
    return request({
      url: '/api/coupons',
      method: 'get',
      params
    })
  },
  
  // 领取优惠券
  receiveCoupon(couponId) {
    return request({
      url: `/api/coupons/${couponId}/receive`,
      method: 'post'
    })
  },
  
  // 使用优惠券
  useCoupon(couponId, data) {
    return request({
      url: `/api/coupons/${couponId}/use`,
      method: 'post',
      data
    })
  },
  
  // 获取可用优惠券
  getAvailableCoupons(params) {
    return request({
      url: '/api/coupons/available',
      method: 'get',
      params
    })
  },
  
  // 获取优惠券详情
  getCouponDetail(couponId) {
    return request({
      url: `/api/coupons/${couponId}`,
      method: 'get'
    })
  },
  
  // 获取用户优惠券
  getUserCoupons(params) {
    return request({
      url: '/api/user/coupons',
      method: 'get',
      params
    })
  },
  
  // 兑换优惠券（使用兑换码）
  exchangeCoupon(data) {
    return request({
      url: '/api/coupons/exchange',
      method: 'post',
      data
    })
  }
}