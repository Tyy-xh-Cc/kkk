import request from './request.js'

// 用户管理相关接口
export default {
  // 用户登录
  login(data) {
    return request({
      url: '/api/user/login',
      method: 'post',
      data
    })
  },
  
  // 用户注册
  register(data) {
    return request({
      url: '/api/user/register',
      method: 'post',
      data
    })
  },
  
  // 获取用户信息
  getUserInfo() {
    return request({
      url: '/api/user/profile',
      method: 'get'
    })
  },
  
  // 更新用户信息
  updateUserInfo(data) {
    return request({
      url: '/api/user/profile',
      method: 'put',
      data
    })
  },
  
  // 修改密码
  changePassword(data) {
    return request({
      url: '/api/user/password',
      method: 'put',
      data
    })
  },
  
  // 更新头像
  updateAvatar(data) {
    return request({
      url: '/api/user/avatar',
      method: 'post',
      data,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 获取用户余额
  getBalance() {
    return request({
      url: '/api/user/balance',
      method: 'get'
    })
  },
  
  // 充值余额
  rechargeBalance(data) {
    return request({
      url: '/api/user/balance/recharge',
      method: 'post',
      data
    })
  },
  
  // 获取用户订单统计
  getUserStats() {
    return request({
      url: '/api/user/stats',
      method: 'get'
    })
  },
  
  // 退出登录
  logout() {
    return request({
      url: '/api/user/logout',
      method: 'post'
    })
  },
  
  // 获取用户收藏列表
  getFavorites(params) {
    return request({
      url: '/api/user/favorites',
      method: 'get',
      params
    })
  },
  
  // 添加收藏
  addFavorite(data) {
    return request({
      url: '/api/user/favorites',
      method: 'post',
      data
    })
  },
  
  // 删除收藏
  removeFavorite(favoriteId) {
    return request({
      url: `/api/user/favorites/${favoriteId}`,
      method: 'delete'
    })
  },
  
  // 获取用户优惠券
  getUserCoupons(params) {
    return request({
      url: '/api/user/coupons',
      method: 'get',
      params
    })
  }
}