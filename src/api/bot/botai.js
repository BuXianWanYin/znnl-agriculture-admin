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

export function botAiVoicepath(data) {
  return request({
    url: '/cosy/voicepath',
    method: 'post',
    data: data
  })
}

export function botAiHistory(userId) {
  return request({
    url: `/ai/history?userId=${userId}`,
    method: 'get',
  })
}

export function botAiMessage(messageData) {
  return request({
    url: '/ai/message',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(messageData)
  })
}

export function botAiIdentify(data) {
  return request({
    url: '/ai/identify',
    method: 'post',
    data: data
  })
}
