import request from '@/utils/request'

// 查询水质数据列表
export function listQuality(query) {
  return request({
    url: '/agriculture/quality/list',
    method: 'get',
    params: query
  })
}

// 查询水质数据详细
export function getQuality(id) {
  return request({
    url: '/agriculture/quality/' + id,
    method: 'get'
  })
}

// 新增水质数据
export function addQuality(data) {
  return request({
    url: '/agriculture/quality',
    method: 'post',
    data: data
  })
}

// 修改水质数据
export function updateQuality(data) {
  return request({
    url: '/agriculture/quality',
    method: 'put',
    data: data
  })
}

// 删除水质数据
export function delQuality(id) {
  return request({
    url: '/agriculture/quality/' + id,
    method: 'delete'
  })
}
