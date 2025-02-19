import request from '@/utils/request'

// 查询饵料类别列表
export function listBaitType(query) {
  return request({
    url: '/fishPasture/BaitType/list',
    method: 'get',
    params: query
  })
}

// 查询饵料类别详细
export function getBaitType(BaitTypeId) {
  return request({
    url: '/fishPasture/BaitType/' + BaitTypeId,
    method: 'get'
  })
}

// 新增饵料类别
export function addBaitType(data) {
  return request({
    url: '/fishPasture/BaitType',
    method: 'post',
    data: data
  })
}

// 修改饵料类别
export function updateBaitType(data) {
  return request({
    url: '/fishPasture/BaitType',
    method: 'put',
    data: data
  })
}

// 删除饵料类别
export function delBaitType(BaitTypeId) {
  return request({
    url: '/fishPasture/BaitType/' + BaitTypeId,
    method: 'delete'
  })
}
