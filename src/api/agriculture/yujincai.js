import request from '@/utils/request'

// 根据类型获取蔬菜大棚预警信息列表
export function listByPastureType(type) {
  return request({
    url: `/agriculture/alert/listByPastureType/${type}`,
    method: 'get'
  })
}

// 查询作物批次列表
// export function listBatch(query) {
//     return request({
//       url: '/fishPasture/batch/list',
//       method: 'get',
//       params: query
//     })
//   }


// 查询用户列表
export function listUser(query) {
    return request({
      url: '/system/user/list',
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