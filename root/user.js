// src/api/modules/user.js
import request from './api.js'

// 用户管理相关接口
export default {
  // 获取用户列表
  getUserList(params) {
    return request({
      url: '/api/paged/users',
      method: 'get',
      params
    })
  },
  
  // 获取用户详情
  getUserDetail(userId) {
    return request({
      url: `/api/users/${userId}`,
      method: 'get'
    })
  },
  
  // 更新用户状态
  updateUserStatus(userId, status) {
    return request({
      url: `/api/users/${userId}/status`,
      method: 'put',
      data: { status }
    })
  },
  
  // 用户充值
  rechargeUser(userId, balance) {
    return request({
      url: `/api/users/${userId}/recharge`,
      method: 'post',
      data: { balance }
    })
  },
  
  // 获取用户地址
  getUserAddresses(userId) {
    return request({
      url: `/api/users/${userId}/addresses`,
      method: 'get'
    })
  }
}