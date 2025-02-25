import request from '@/utils/request'

// 查询传感器数据列表（包含大棚和分区信息）
export function listSoilSensorValueVO(query) {
  return request({
    url: '/soilsensorvaluevo/values',
    method: 'get',
    params: query
  })
}