import request from '@/utils/request'

// 查询药品用量列表
export function listCostMedicine(query) {
  return request({
    url: '/fishPasture/costMedicine/list',
    method: 'get',
    params: query
  })
}

// 查询药品用量详细
export function getCostMedicine(costId) {
  return request({
    url: '/fishPasture/costMedicine/' + costId,
    method: 'get'
  })
}

// 新增药品用量
export function addCostMedicine(data) {
  return request({
    url: '/fishPasture/costMedicine',
    method: 'post',
    data: data
  })
}

// 修改药品用量
export function updateCostMedicine(data) {
  return request({
    url: '/fishPasture/costMedicine',
    method: 'put',
    data: data
  })
}

// 删除药品用量
export function delCostMedicine(costId) {
  return request({
    url: '/fishPasture/costMedicine/' + costId,
    method: 'delete'
  })
}
