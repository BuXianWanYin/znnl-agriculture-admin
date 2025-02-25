import request from '@/utils/request'

// 获取养殖池环境监测数据列表
export function listQuality(query) {
  return request({
    url: '/agriculture/quality/list',
    method: 'get',
    params: query
  })
}