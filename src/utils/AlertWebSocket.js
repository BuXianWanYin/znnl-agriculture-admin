export class AlertWebSocket {
    constructor() {
        this.ws = null;
        this.url = `ws://localhost:8081/websocket/alert`;
    }

    connect() {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
            console.log('消息推送WebSocket连接成功');
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
        // 例如：显示红色弹窗、播放警报声等
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
        // 例如：显示黄色提示等
        notification.warning({
            message: '预警提示',
            description: alert.alertMessage,
            duration: 10
        });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}