export class AlertWebSocket {
    constructor() {
        this.clientId = this.generateClientId();
        this.url = `ws://localhost:8081/websocket/alert?clientId=${this.clientId}`;
        // 立即创建 WebSocket 实例
        this.ws = new WebSocket(this.url);
        
        // 在构造函数中设置默认的事件处理器
        this.ws.onopen = () => {
            console.log('消息推送WebSocket连接成功，clientId:', this.clientId);
        };
        
        this.ws.onmessage = (event) => {
            const alert = JSON.parse(event.data);
            this.handleAlert(alert);
        };
        
        this.ws.onclose = () => {
            console.log('消息推送WebSocket连接关闭');
            // 可以在这里实现重连逻辑
            setTimeout(() => this.connect(), 5000);
        };
        
        this.ws.onerror = (error) => {
            console.error('消息推送WebSocket错误:', error);
        };
    }

    generateClientId() {
        // 生成唯一的客户端ID，可以使用时间戳+随机数
        return 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    connect() {
        // 如果已经存在连接且连接是打开的，则不需要重新连接
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return;
        }
        
        // 如果存在旧连接，先关闭
        if (this.ws) {
            this.disconnect();
        }

        // 创建新的 WebSocket 连接
        this.ws = new WebSocket(this.url);
        
        // 重新绑定事件处理器
        this.ws.onopen = () => {
            console.log('消息推送WebSocket连接成功，clientId:', this.clientId);
        };
        
        this.ws.onmessage = (event) => {
            const alert = JSON.parse(event.data);
            this.handleAlert(alert);
        };
        
        this.ws.onclose = () => {
            console.log('消息推送WebSocket连接关闭');
            setTimeout(() => this.connect(), 5000);
        };
        
        this.ws.onerror = (error) => {
            console.error('消息推送WebSocket错误:', error);
        };
    }

    handleAlert(alert) {
        // 根据alert.alertLevel判断是预警还是报警
        if (alert.alertLevel === "1") {
            // 严重警告，可以播放警报声音、显示红色提示等
            this.handleSeriousAlert(alert);
        } else {
            // 普通预警，可以显示黄色提示等
            this.handleWarning(alert);
        }
    }

    handleSeriousAlert(alert) {
        // 实现严重警告的UI处理逻辑
        notification.error({
            message: '严重警告',
            description: alert.alertMessage,
            duration: 0
        });
        // 播放警报声
        const audio = new Audio('/alarm.mp3');
        audio.play();
    }

    handleWarning(alert) {
        // 实现普通预警的UI处理逻辑
        notification.warning({
            message: '预警提示',
            description: alert.alertMessage,
            duration: 10
        });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}