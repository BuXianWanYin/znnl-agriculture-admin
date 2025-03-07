import request from '@/utils/request'

// 查询土壤环境数据列表
export function listValue(query) {
  return request({
    url: '/agriculture/value/list',
    method: 'get',
    params: query
  })
}

// 查询土壤环境数据详细
export function getValue(id) {
  return request({
    url: '/agriculture/value/' + id,
    method: 'get'
  })
}

// 查询大棚数据列表
export function getValueByPastureId(pastureId) {
  return request({
    url: '/agriculture/value/pasture/' + pastureId,
    method: 'get'
  })
}

// 新增土壤环境数据
export function addValue(data) {
  return request({
    url: '/agriculture/value',
    method: 'post',
    data: data
  })
}

// 修改土壤环境数据
export function updateValue(data) {
  return request({
    url: '/agriculture/value',
    method: 'put',
    data: data
  })
}

// 删除土壤环境数据
export function delValue(id) {
  return request({
    url: '/agriculture/value/' + id,
    method: 'delete'
  })
}

/**
 * 根据批次ID和日期范围查询土壤环境数据
 */
export function getSoilSensorValuesByBatchIdAndDateRange(batchId, startDate, endDate) {
  return request({
    url: '/agriculture/value/range',
    method: 'get',
    params: { batchId, startDate, endDate }
  });
}

