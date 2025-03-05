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


/**
 * 根据批次ID和日期范围查询水质环境数据
 */
export function selectFishWaterQualityByBatchIdAndDateRange(batchId, startDate, endDate) {
  return request({
    url: '/agriculture/quality/range',
    method: 'get',
    params: { batchId, startDate, endDate }
  });
}