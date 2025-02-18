export default class WebSocketConnectMethod {
    static instance = null;

    constructor(config) {
        // 实现单例模式
        if (WebSocketConnectMethod.instance) {
            return WebSocketConnectMethod.instance;
        }
        WebSocketConnectMethod.instance = this;

        this.msgHandle = config.msgHandle || function(){}
        this.stateHandle = config.stateHandle || function(){}
        this.speechSocket = null
        this.userId = this.getOrCreateUserId()
        this.isConnecting = false // 添加连接状态标志
    }

    getOrCreateUserId() {
        let userId = sessionStorage.getItem('wsUserId')
        if (!userId) {
            // 生成纯数字ID：时间戳后8位 + 5位随机数
            const timestamp = Date.now().toString().slice(-8)
            const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
            userId = timestamp + random
            sessionStorage.setItem('wsUserId', userId)
        }
        return userId
    }

    wsStart() {
        // 如果正在连接或已经连接，则不重复连接
        if (this.isConnecting || this.speechSocket?.readyState === 1) {
            console.log('WebSocket已连接或正在连接中')
            return 1
        }

        const Uri = `ws://10.0.28.47:8081/ws/asr/${this.userId}`
        console.log('WebSocket连接地址:', Uri)

        if (!Uri.match(/wss?:\S*/)) {
            console.error("请检查WebSocket地址")
            return 0
        }

        if ('WebSocket' in window) {
            try {
                this.isConnecting = true
                this.speechSocket = new WebSocket(Uri)

                this.speechSocket.onopen = () => {
                    this.isConnecting = false
                    const request = {
                        chunk_size: [5, 10, 5],
                        wav_name: "h5",
                        is_speaking: true,
                        chunk_interval: 10,
                        mode: "2pass",
                        userId: this.userId
                    }
                    this.speechSocket.send(JSON.stringify(request))
                    this.stateHandle(0)
                }

                this.speechSocket.onmessage = (e) => {
                    try {
                        const data = JSON.parse(e.data)
                        if (data.userId && data.userId !== this.userId) {
                            return
                        }
                        this.msgHandle(e)
                    } catch (error) {
                        this.msgHandle(e)
                    }
                }

                this.speechSocket.onclose = () => {
                    this.isConnecting = false
                    this.stateHandle(1)
                    // 移除自动重连逻辑，由上层控制重连
                }

                this.speechSocket.onerror = () => this.stateHandle(2)

                return 1
            } catch(e) {
                this.isConnecting = false
                console.error("WebSocket连接失败:", e)
                return 0
            }
        }

        console.error('浏览器不支持WebSocket')
        return 0
    }

    wsSend(data) {
        if (this.speechSocket?.readyState === 1) {
            if (typeof data === 'string') {
                try {
                    const jsonData = JSON.parse(data)
                    jsonData.userId = this.userId
                    this.speechSocket.send(JSON.stringify(jsonData))
                } catch {
                    this.speechSocket.send(data)
                }
            } else {
                this.speechSocket.send(data)
            }
        }
    }

    wsStop() {
        if (this.speechSocket) {
            this.speechSocket.close()
        }
    }
}
