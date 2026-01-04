import request from '@/api'

// 餐厅管理相关接口
export default {
  // 获取餐厅列表
  getRestaurantList(params) {
    return request({
      url: '/api/restaurants',
      method: 'get',
      params
    })
  },
  
  // 获取餐厅详情
  getRestaurantDetail(id) {
    return request({
      url: `/api/restaurants/${id}`,
      method: 'get'
    })
  },
  
  // 新增餐厅
  addRestaurant(data) {
    return request({
      url: '/api/restaurants',
      method: 'post',
      data
    })
  },
  
  // 更新餐厅
  updateRestaurant(id, data) {
    return request({
      url: `/api/restaurants/${id}`,
      method: 'put',
      data
    })
  },
  
  // 更新餐厅状态
  updateRestaurantStatus(id, status) {
    return request({
      url: `/api/restaurants/${id}/status`,
      method: 'put',
      data: { status }
    })
  },
  
  // 上传餐厅图片
  uploadRestaurantImage(data) {
    return request({
      url: '/api/upload/restaurant',
      method: 'post',
      data,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}