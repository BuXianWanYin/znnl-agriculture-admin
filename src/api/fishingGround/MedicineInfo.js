import request from '@/utils/request'

// 查询饵料信息列表
export function listMedicineInfo(query) {
  return request({
    url: '/fishPasture/MedicineInfo/list',
    method: 'get',
    params: query
  })
}

// 查询饵料信息详细
export function getMedicineInfo(MedicineId) {
  return request({
    url: '/fishPasture/MedicineInfo/' + MedicineId,
    method: 'get'
  })
}

// 新增饵料信息
export function addMedicineInfo(data) {
  return request({
    url: '/fishPasture/MedicineInfo',
    method: 'post',
    data: data
  })
}

// 修改饵料信息
export function updateMedicineInfo(data) {
  return request({
    url: '/fishPasture/MedicineInfo',
    method: 'put',
    data: data
  })
}

// 删除饵料信息
export function delMedicineInfo(MedicineId) {
  return request({
    url: '/fishPasture/MedicineInfo/' + MedicineId,
    method: 'delete'
  })
}
