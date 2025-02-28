import request from '@/utils/request'

// 获取养殖池预警信息列表
export function listByPastureType(pastureType) {
  return request({
    url: '/agriculture/alert/listByPastureType/' + pastureType,
    method: 'get'
  })
}
