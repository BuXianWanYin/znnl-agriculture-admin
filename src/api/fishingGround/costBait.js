import request from '@/utils/request'

// 查询农资用量列表
export function listCostBait(query) {
  return request({
    url: '/fishPasture/costBait/list',
    method: 'get',
    params: query
  })
}

// 查询农资用量详细
export function getCostBait(costId) {
  return request({
    url: '/fishPasture/costBait/' + costId,
    method: 'get'
  })
}

// 新增农资用量
export function addCostBait(data) {
  return request({
    url: '/fishPasture/costBait',
    method: 'post',
    data: data
  })
}

// 修改农资用量
export function updateCostBait(data) {
  return request({
    url: '/fishPasture/costBait',
    method: 'put',
    data: data
  })
}

// 删除农资用量
export function delCostBait(costId) {
  return request({
    url: '/fishPasture/costBait/' + costId,
    method: 'delete'
  })
}
