export default class WebSocketConnectMethod {
  constructor(config) {
    this.msgHandle = config.msgHandle || function(){}
    this.stateHandle = config.stateHandle || function(){}
    this.speechSocket = null
  }

  wsStart() {
    const Uri = 'ws://127.0.0.1:8081/ws/asr/90'
    
    if (!Uri.match(/wss?:\S*/)) {
      console.error("请检查WebSocket地址")
      return 0
    }
    
    if ('WebSocket' in window) {
      try {
        this.speechSocket = new WebSocket(Uri)
        
        this.speechSocket.onopen = () => {
          // 发送初始化请求
          const request = {
            chunk_size: [5, 10, 5],
            wav_name: "h5",
            is_speaking: true,
            chunk_interval: 10,
            mode: "2pass"
          }
          this.speechSocket.send(JSON.stringify(request))
          this.stateHandle(0)
        }

        this.speechSocket.onclose = () => this.stateHandle(1)
        this.speechSocket.onmessage = (e) => this.msgHandle(e)
        this.speechSocket.onerror = () => this.stateHandle(2)

        return 1
      } catch(e) {
        console.error("WebSocket连接失败:", e)
        return 0
      }
    }
    
    console.error('浏览器不支持WebSocket')
    return 0
  }

  wsStop() {
    if (this.speechSocket) {
      this.speechSocket.close()
    }
  }

  wsSend(data) {
    if (this.speechSocket?.readyState === 1) {
      this.speechSocket.send(data)
    }
  }
} 