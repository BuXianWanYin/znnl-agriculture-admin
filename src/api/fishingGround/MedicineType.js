import request from '@/utils/request'

// 查询饵料类别列表
export function listMedicineType(query) {
  return request({
    url: '/fishPasture/MedicineType/list',
    method: 'get',
    params: query
  })
}

// 查询饵料类别详细
export function getMedicineType(MedicineTypeId) {
  return request({
    url: '/fishPasture/MedicineType/' + MedicineTypeId,
    method: 'get'
  })
}

// 新增饵料类别
export function addMedicineType(data) {
  return request({
    url: '/fishPasture/MedicineType',
    method: 'post',
    data: data
  })
}

// 修改饵料类别
export function updateMedicineType(data) {
  return request({
    url: '/fishPasture/MedicineType',
    method: 'put',
    data: data
  })
}

// 删除饵料类别
export function delMedicineType(MedicineTypeId) {
  return request({
    url: '/fishPasture/MedicineType/' + MedicineTypeId,
    method: 'delete'
  })
}
