import request from '@/utils/request'

// 查询作物批次列表
export function listBatch(query) {
  return request({
    url: '/fishPasture/batch/list',
    method: 'get',
    params: query
  })
}

// 查询作物批次详细
export function getBatch(batchId) {
  return request({
    url: '/fishPasture/batch/' + batchId,
    method: 'get'
  })
}

// 新增作物批次
export function addBatch(data) {
  return request({
    url: '/fishPasture/batch',
    method: 'post',
    data: data
  })
}

// 修改作物批次
export function updateBatch(data) {
  return request({
    url: '/fishPasture/batch',
    method: 'put',
    data: data
  })
}

// 删除作物批次
export function delBatch(batchId) {
  return request({
    url: '/fishPasture/batch/' + batchId,
    method: 'delete'
  })
}
