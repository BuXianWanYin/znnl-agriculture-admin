import request from '@/utils/request'

// 获取养殖池预警信息列表
export function listByPastureType(pastureType, query) {
  return request({
    url: '/agriculture/alert/listByPastureType/' + pastureType,
    method: 'get',
    params: query
  })
}

// 修改预警信息状态
export function updateBaseinfo(data) {
  return request({
    url: '/agriculture/alert',
    method: 'put',
    data: data
  })
}

