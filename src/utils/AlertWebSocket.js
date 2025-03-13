// 添加全局变量来追踪 WebSocket 实例
let globalWsInstance = null;
let isHotReloading = false;

export class AlertWebSocket {
    constructor() {
        // 如果已经存在全局实例且不是热重载，直接返回该实例
        if (globalWsInstance && !isHotReloading) {
            return globalWsInstance;
        }

        this.clientId = this.generateClientId();
        this.url = `ws://192.168.31.201:8081/websocket/alert?clientId=${this.clientId}`;
        this.ws = new WebSocket(this.url);
        
        // 设置基本事件处理器
        this.setupEventHandlers();
        
        // 更新全局实例
        globalWsInstance = this;
        return this;
    }

    setupEventHandlers() {
        this.ws.onopen = () => {
            console.log('消息推送WebSocket连接成功，clientId:', this.clientId);
        };
        
        this.ws.onmessage = (event) => {
            const alert = JSON.parse(event.data);
            this.handleAlert(alert);
        };
        
        this.ws.onclose = () => {
            console.log('消息推送WebSocket连接关闭');
            // 只在非热重载情况下重连
            if (!isHotReloading) {
                setTimeout(() => this.connect(), 5000);
            }
        };
        
        this.ws.onerror = (error) => {
            console.error('消息推送WebSocket错误:', error);
        };
    }

    // 静态方法用于处理热重载
    static handleHotReload() {
        isHotReloading = true;
        if (globalWsInstance) {
            globalWsInstance.disconnect();
            globalWsInstance = null;
        }
        isHotReloading = false;
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
        this.setupEventHandlers();
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

// 添加热重载处理
if (module.hot) {
    module.hot.dispose(() => {
        AlertWebSocket.handleHotReload();
    });
}