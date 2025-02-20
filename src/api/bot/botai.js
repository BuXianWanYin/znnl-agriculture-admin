import request from '@/utils/request'

export function botAiStream(data) {
  return request({
    url: '/ai/chatStream',
    method: 'post',
    data: data,
    responseType: 'stream',
    headers: {
        'Accept': 'text/event-stream' // 声明希望接受 Event Stream
    }
  })
}