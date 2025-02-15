import request from '@/utils/request'

// 查询饵料信息列表
export function listBaitInfo(query) {
  return request({
    url: '/fishPasture/BaitInfo/list',
    method: 'get',
    params: query
  })
}

// 查询饵料信息详细
export function getBaitInfo(BaitId) {
  return request({
    url: '/fishPasture/BaitInfo/' + BaitId,
    method: 'get'
  })
}

// 新增饵料信息
export function addBaitInfo(data) {
  return request({
    url: '/fishPasture/BaitInfo',
    method: 'post',
    data: data
  })
}

// 修改饵料信息
export function updateBaitInfo(data) {
  return request({
    url: '/fishPasture/BaitInfo',
    method: 'put',
    data: data
  })
}

// 删除饵料信息
export function delBaitInfo(BaitId) {
  return request({
    url: '/fishPasture/BaitInfo/' + BaitId,
    method: 'delete'
  })
}
