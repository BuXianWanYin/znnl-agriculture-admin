import request from '@/utils/request'

// 查询鱼种列表
export function listGermplasm(query) {
    return request({
        url: '/fishPasture/species/list',
        method: 'get',
        params: query
    })
}

// 查询鱼种详细
export function getGermplasm(speciesId) {
    return request({
        url: '/fishPasture/species/' + speciesId,
        method: 'get'
    })
}

// 新增鱼种
export function addGermplasm(data) {
    return request({
        url: '/fishPasture/species',
        method: 'post',
        data: data
    })
}

// 修改鱼种
export function updateGermplasm(data) {
    return request({
        url: '/fishPasture/species',
        method: 'put',
        data: data
    })
}

// 删除鱼种
export function delGermplasm(speciesIdId) {
    return request({
        url: '/fishPasture/species/' + speciesIdId,
        method: 'delete'
    })
}

export function addData(data) {
    return request({
        url: '/fishPasture/species/ai/addData',
        method: 'post',
        data: data
    })
}

export function getData(speciesIdId) {
    return request({
        url: '/fishPasture/species/ai/getData/' + speciesIdId,
        method: 'get'
    })
}
