export class AuroraWaifu {
  constructor(options) {
    this.configs = {
      resourcePath: '/'
    }

    if (options?.resourcePath) this.configs.resourcePath = options.resourcePath

    Promise.all([this.injectResources('live2d.min.js')]).then(() => {
      new AuroraBotSoftware({
        apiPath: '/live2d_api/', //本地引用live2d api 在public文件夹
        locale: 'en',
        containerId: 'waifu-tips',
        messageId: 'waifu-tips'
      })
    })
  }

  async injectResources(url) {
    let tag = null
    return new Promise((resolve, reject) => {
      tag = document.createElement('script')
      tag.src = this.configs.resourcePath + url
      tag.onload = () => resolve(url)
      tag.onerror = () => reject(url)
      document.head.appendChild(tag)
    })
  }
}

/**
 * 启动机器人.
 */
import WebSocketConnectMethod from '../websocket-connector'

import { botAiStream } from '@/api/bot/botai'

export class AuroraDia {
  constructor() {
    this.configs = {
      locale: 'zh-CN',
      tips: {}
    }

    this.handleWSMessage = this.handleWSMessage.bind(this)
    this.handleWSState = this.handleWSState.bind(this)

    // 预初始化WebSocket
    this.initWebSocket()

    // DOM加载完成后又调用init()，其中可能再次初始化
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init())
    } else {
      this.init()
    }

    this.recordingEndCallback = null;
    this.offlineText = '';
    this.recText = '';
    this.software = null;
    this.eyesAnimationTimer = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recorder = null;
    this.audioContext = null;
    this.isRecording = false;
  }

  // 新增预初始化WebSocket方法
  async initWebSocket() {
    try {
      if (!WebSocketConnectMethod) {
        throw new Error('WebSocketConnectMethod not loaded')
      }

      this.wsConnector = new WebSocketConnectMethod({
        msgHandle: this.handleWSMessage,
        stateHandle: this.handleWSState
      })

      // 预连接WebSocket
      this.wsConnector.wsStart()
      console.log('WebSocket预连接初始化完成')
    } catch (error) {
      console.error('WebSocket预初始化失败:', error)
    }
  }

  async init() {
    try {
      if (typeof Recorder === 'undefined') {
        throw new Error('Recorder is not loaded')
      }

      this.recorder = new Recorder({
        type: "pcm",
        bitRate: 16,
        sampleRate: 16000,
        onProcess: this.handleRecordProcess.bind(this)
      })

      this.sampleBuffer = new Int16Array()
      this.recognitionText = ''
      this.isListening = false

      console.log('初始化成功')
    } catch (error) {
      console.error('初始化失败:', error)
    }
  }

  installSoftware(configs) {
    if (configs) {
      this.configs.locale = configs.locale
      this.configs.tips = configs.tips
    }
    this.software = new AuroraBotSoftware({
      locale: this.configs.locale,
      botScript: this.configs.tips,
      containerId: 'Aurora-Dia--tips-wrapper',
      messageId: 'Aurora-Dia--tips'
    })
    this.software.loadLocaleMessages()
    this.software.injectBotScripts()
  }

  on() {
    this.software.load()
    this.activateMotion()
  }

  activateMotion() {
    const leftEye = document.getElementById('Aurora-Dia--left-eye')
    const rightEye = document.getElementById('Aurora-Dia--right-eye')
    const eyesEl = document.getElementById('Aurora-Dia--eyes')
    const diaBody = document.getElementById('Aurora-Dia')

    if (leftEye && rightEye && eyesEl && diaBody) {
      let rafId = null

      document.addEventListener('mousemove', evt => {
        if (rafId) {
          cancelAnimationFrame(rafId)
        }

        rafId = requestAnimationFrame(() => {
          clearTimeout(this.eyesAnimationTimer)
          eyesEl.classList.add('moving')

          const viewportWidth = window.innerWidth
          const viewportHeight = window.innerHeight

          const diaRect = diaBody.getBoundingClientRect()
          const diaCenterX = diaRect.left + diaRect.width / 2
          const diaCenterY = diaRect.top + diaRect.height / 2

          const deltaX = evt.clientX - diaCenterX
          const deltaY = evt.clientY - diaCenterY

          const maxPossibleX = Math.max(diaCenterX, viewportWidth - diaCenterX)
          const maxPossibleY = Math.max(diaCenterY, viewportHeight - diaCenterY)

          const ratioX = Math.abs(deltaX) / maxPossibleX
          const ratioY = Math.abs(deltaY) / maxPossibleY

          const maxMoveBody = 15
          const bodyX = Math.sign(deltaX) * maxMoveBody * ratioX
          const bodyY = Math.sign(deltaY) * maxMoveBody * ratioY

          const maxMoveEyes = 25
          const eyesX = Math.sign(deltaX) * maxMoveEyes * ratioX
          const eyesY = Math.sign(deltaY) * maxMoveEyes * ratioY

          diaBody.style.transform = `translate(${bodyX}px, ${bodyY}px)`

          const relativeX = eyesX - bodyX
          const relativeY = eyesY - bodyY
          leftEye.style.transform = `translate(${relativeX}px, ${relativeY}px)`
          rightEye.style.transform = `translate(${relativeX}px, ${relativeY}px)`

          this.eyesAnimationTimer = setTimeout(() => {
            diaBody.style.transform = 'translate(0, 0)'
            leftEye.style.transform = 'translate(0, 0)'
            rightEye.style.transform = 'translate(0, 0)'
            eyesEl.classList.remove('moving')
          }, 3000)
        })
      })
    }
  }

  async startListening(isChatMode = false) {
    if (this.isListening) return

    try {
      // 重置识别文本
      this.recText = ''
      this.offlineText = ''
      
      // 如果WebSocket未连接或已断开，重新连接
      if (!this.wsConnector?.speechSocket || this.wsConnector.speechSocket.readyState !== 1) {
        await this.initWebSocket()
      }

      // 发送新的识别会话初始化请求
      const initRequest = {
        chunk_size: [5, 10, 5],
        wav_name: "h5",
        is_speaking: true,
        chunk_interval: 10,
        mode: "2pass",
        itn: true,
        userId: this.wsConnector.userId
      }
      this.wsConnector.wsSend(JSON.stringify(initRequest))

      // 检查录音器是否已初始化
      if (!this.recorder) {
        await this.init()
      }

      // 请求麦克风权限并打开录音设备
      await new Promise((resolve, reject) => {
        this.recorder.open(() => {
          resolve()
        }, (msg, isUserNotAllow) => {
          reject(new Error((isUserNotAllow ? 'UserNotAllow，' : '') + '无法录音:' + msg))
        })
      })

      // 开始录音
      this.recorder.start()
      // 设置录音状态标志
      this.isListening = true
      this.isRecording = true

      // 根据模式显示不同的提示
      if (!isChatMode) {
        this.software?.showMessage('我在听...', 3000)
      } else {
        console.log('聊天输入模式录音开始')
      }

      console.log('开始录音')
      return true

    } catch (error) {
      console.error('启动录音失败:', error)
      if (!isChatMode) {
        this.software?.showMessage('无法启动录音', 3000)
      }
      this.isListening = false
      this.isRecording = false
      throw error
    }
  }

  async stopListening(isChatMode = false) {
    // 如果当前没有在监听状态，直接返回
    if (!this.isListening) return

    try {
      // 停止录音并获取录音数据
      this.recorder.stop((blob, duration) => {
        console.log('录音结束，时长:', duration)

        // 构建语音识别请求参数
        const request = {
          chunk_size: [5, 10, 5],
          wav_name: "h5",
          is_speaking: false,
          chunk_interval: 10,
          mode: "2pass",
          itn: true,
          userId: this.wsConnector.userId
        }

        // 发送剩余的音频数据
        if (this.sampleBuffer.length > 0) {
          this.wsConnector.wsSend(this.sampleBuffer)
          this.sampleBuffer = new Int16Array()
        }

        // 发送结束请求
        this.wsConnector.wsSend(JSON.stringify(request))

        // 延迟处理识别结果
        setTimeout(async() => {
          if (this.recText) {
            if (isChatMode) {
              this.recordingEndCallback(this.recText,3000);
              // 聊天模式：使用打字机效果显示文本
              const completeText = this.recText.trim();
              // 最后一次调用，标记为最终结果
              if (this.recordingEndCallback) {
                  // 参数说明：
                // - completeText: 当前要显示的文本
                // - true: 表示正在输入中
                // - false: 表示不是最终结果
                // - true: 表示使用打字机效果
                this.recordingEndCallback(completeText, false, true, true);
              }
            } else {
              // 非聊天模式：显示识别结果并调用AI接口
              this.software?.showMessage(this.recText, 3000);
              this.software?.showMessage("我在思考...");

              if(this.recText == null || this.recText == '') return;

              // 准备发送给AI的数据
              const formData = new FormData();
              formData.append('prompt', this.recText);

              // 创建可中断的请求控制器
              this.controller = new AbortController();

              // 发送AI请求
              const response = await fetch('http://10.0.28.47:8081/ai/generateStream', {
                method: 'POST',
                body: formData,
                signal: this.controller.signal,
                headers: {
                   'Accept': 'text/event-stream',
                   'Cache-Control': 'no-cache',
                   'Connection': 'keep-alive'
                }
              });

              // 检查响应状态
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              // 处理流式响应
              const reader = response.body.getReader();
              const decoder = new TextDecoder();
              let fullMessage = '';

              // 循环读取响应流
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // 解码响应数据
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                // 处理每一行响应
                for (const line of lines) {
                  if (!line.trim()) continue;
                  const jsonStr = line.replace(/^data:/, '').trim();

                  try {
                    const jsonData = JSON.parse(jsonStr);
                    if (jsonData.response) {
                      // 逐字显示AI回复
                      const newText = jsonData.response;
                      for (const char of newText) {
                        fullMessage += char;
                        this.software?.showMessage(fullMessage);
                        await new Promise(resolve => setTimeout(resolve, 50));
                      }
                    }
                  } catch (e) {
                    console.error('Parsing error: ', e);
                  }
                }
              }
            }
          } else {
            // 未识别到文本时的处理
            if (!isChatMode) {
              this.software?.showMessage('未能识别，请重试', 3000)
            }
          }

          // 清理资源
          this.recText = ''
          this.recorder.close()
        }, 500)
      })

      // 设置监听状态为false
      this.isListening = false

    } catch (error) {
      // 错误处理
      console.error('停止录音失败:', error)
      if (!isChatMode) {
        this.software?.showMessage('停止录音失败', 3000)
      }
      this.isListening = false
    }
  }

  onRecordingEnd(callback) {
    this.recordingEndCallback = callback
  }

  handleRecordProcess(buffer) {
    if (!this.isListening) return

    const data48k = buffer[buffer.length-1]
    const array48k = new Array(data48k)
    const data16k = Recorder.SampleData(array48k, 48000, 16000).data

    this.sampleBuffer = Int16Array.from([...this.sampleBuffer, ...data16k])
    const chunkSize = 960

    while (this.sampleBuffer.length >= chunkSize) {
      const sendBuf = this.sampleBuffer.slice(0, chunkSize)
      this.sampleBuffer = this.sampleBuffer.slice(chunkSize)
      this.wsConnector.wsSend(sendBuf)
    }
  }

  handleWSMessage(e) {
    try {
      const data = JSON.parse(e.data)
      // 检查消息是否属于当前用户
      if (data.userId && data.userId !== this.wsConnector.userId) {
        return // 如果消息不属于当前用户，直接返回
      }

      if (data.text) {
        const newText = data.text
        const asrModel = data.mode
        const isFinal = data.is_final

        console.log('收到识别结果:', {
          text: newText,
          mode: asrModel,
          isFinal: isFinal,
          userId: data.userId
        })

        // 根据模式处理文本
        if (asrModel === "2pass-offline" || asrModel === "offline") {
          this.offlineText = newText
          this.recText = this.offlineText
        } else {
          if (isFinal) {
            this.recText = newText
          } else {
            this.recText = newText
          }
        }

        // 实时更新聊天输入框
        if (this.recordingEndCallback) {
          this.recordingEndCallback(this.recText, true, false, true)
        }

        // 非聊天模式下显示实时识别结果
        if (!this.isChatMode) {
          if (this.isRecording && !isFinal) {
            this.software?.showMessage("我在听~")
          }

          if (isFinal) {
            this.software?.showMessage(this.recText, 3000)
          }
        }

        console.log('当前识别文本:', this.recText)
      }
    } catch (error) {
      console.error('处理消息失败:', error)
    }
  }

  handleWSState(state) {
    switch (state) {
      case 0:
        console.log('WebSocket 连接成功')
        break
      case 1:
        console.log('WebSocket 连接关闭')
        this.recText = ''
        this.offlineText = ''
        // 连接关闭后自动重连
        setTimeout(() => this.initWebSocket(), 1000)
        break
      case 2:
        console.error('WebSocket 连接错误')
        // 连接错误后自动重连
        setTimeout(() => this.initWebSocket(), 1000)
        break
    }
  }

  handleRecognizedText(text) {
    // 这里可以添加对语音命令的处理逻辑
    if (text.includes('你好')) {
      this.software.showMessage('你好呀！很高兴见到你???????????????????', 3000)
    }
    // 添加其他的语音命令处理...
  }
}

class AuroraBotSoftware {
  constructor(config) {
    this.locale = config.locale
    this.botScript = config.botScript
    this.containerId = config.containerId
    this.messageId = config.messageId
    this.messages = null
    this.config = {
      botScript: config.botScript ? config.botScript : {},
      containerId: config.containerId ? config.containerId : '',
      messageId: config.messageId ? config.messageId : '',
      botId: 'Aurora-Did',
      locale: config.locale ? config.locale : 'en'
    }

    this.messageCacheKey = '__AURORA_BOT_MESSAGE__'
    this.mouseoverEventCacheKey = '__AURORA_BOT_MOUSE_OVER__'
    this.userAction = false
    this.userActionTimer = undefined
    this.messageTimer = undefined
    this.messages = []
    this.locales = {}
    this.botTips = {}
  }

  load() {
    this.loadLocaleMessages()
    this.injectBotScripts()
    this.messages = this.botTips.messages
    window.addEventListener('mousemove', () => (this.userAction = true))
    window.addEventListener('keydown', () => (this.userAction = true))
    sessionStorage.removeItem(this.messageCacheKey)

    setInterval(() => {
      if (this.userAction) {
        this.userAction = false
        clearInterval(this.userActionTimer)
        this.userActionTimer = undefined
      } else if (!this.userActionTimer) {
        this.userActionTimer = setInterval(() => {
          this.showMessage(this.randomSelection(this.messages), 6000, 9)
        }, 20000)
      }
    }, 1000)

    this.registerEventListener()
    setTimeout(() => {
      this.showWelcomeMessage()
    }, 3000)
  }

  injectBotScripts() {
    let botScriptKeys = []
    const botScript = this.config.botScript
    this.botTips = this.locales[this.config.locale]

    if (botScript !== undefined) {
      botScriptKeys = Object.keys(botScript)
      if (botScriptKeys.length > 0) {
        botScriptKeys.forEach(key => {
          this.botTips = { ...this.botTips, [key]: botScript[key] }
        })
      }
    }
  }

  registerEventListener() {
    document.addEventListener('copy', () => {
      this.showMessage(this.botTips.copy, 6000, 9)
    })
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden)
        this.showMessage(this.botTips.visibility_change, 6000, 9)
    })
    // Mouseover tips
    if (this.botTips.mouseover && this.botTips.mouseover.length > 0) {
      document.addEventListener('mouseover', event => {
        for (const mouseoverEvents of this.botTips.mouseover) {
          const selector = mouseoverEvents.selector
          let text = mouseoverEvents.text
          event.preventDefault()
          if (event.target && event.target instanceof HTMLElement) {
            if (!event.target.matches(selector)) continue
            // Avoid message keep popping.
            if (
              sessionStorage.getItem(this.mouseoverEventCacheKey) &&
              sessionStorage.getItem(this.mouseoverEventCacheKey) === selector
            )
              return

            text = this.randomSelection(text)
            text = text.replace('{text}', event.target.innerText)
            this.showMessage(text, 4000, 8)
            sessionStorage.setItem(this.mouseoverEventCacheKey, selector)
            setTimeout(() => {
              sessionStorage.removeItem(this.mouseoverEventCacheKey)
            }, 4000)
            return
          }
        }
      })
    }
    // onClick event
    if (this.botTips.click && this.botTips.click.length > 0) {
      document.addEventListener('click', event => {
        if (event.target && event.target instanceof HTMLElement)
          for (const mouseoverEvents of this.botTips.click) {
            const selector = mouseoverEvents.selector
            let text = mouseoverEvents.text
            if (event.target && event.target instanceof HTMLElement) {
              if (!event.target.matches(selector)) continue
              text = this.randomSelection(text)
              text = text.replace('{text}', event.target.innerText)
              this.showMessage(text, 4000, 8)
              return
            }
          }
      })
    }
    // Events
    if (this.botTips.events && this.botTips.events.length > 0) {
      this.botTips.events.forEach(event => {
        const now = new Date(),
          after = event.date.split('-')[0],
          before = event.date.split('-')[1] || after
        if (
          after.split('/')[0] <= now.getMonth() + 1 &&
          now.getMonth() + 1 <= before.split('/')[0] &&
          after.split('/')[1] <= now.getDate() &&
          now.getDate() <= before.split('/')[1]
        ) {
          event.text = this.randomSelection(event.text)
          event.text = event.text.replace('{year}', now.getFullYear())
          this.messages.push(event.text)
        }
      })
    }
  }

  showWelcomeMessage() {
    try {
      let text
      if (location.pathname === '/') {
        const now = new Date().getHours()
        if (now > 7 && now <= 11) text = this.botTips.welcome['7_11']
        else if (now > 11 && now <= 13) text = this.botTips.welcome['11_13']
        else if (now > 13 && now <= 17) text = this.botTips.welcome['13_17']
        else if (now > 17 && now <= 19) text = this.botTips.welcome['17_19']
        else if (now > 19 && now <= 21) text = this.botTips.welcome['19_21']
        else if (now > 21 && now <= 23) text = this.botTips.welcome['21_23']
        else text = this.botTips.welcome['24']
      } else {
        // 如果不是首页，使用默认欢迎语
        text = this.randomSelection(this.botTips.messages)
      }
      this.showMessage(text, 7000, 8)
    } catch (error) {
      console.error('显示欢迎消息失败:', error)
    }
  }

  loadLocaleMessages() {
    try {
      const messages = {
        'zh-CN': require('./messages/zh-CN.json')
      }
      this.locales = messages
      return messages
    } catch (error) {
      console.error('加载本地化消息失败:', error)
      return {}
    }
  }

  showMessage(text, timeout, priority) {
    const cacheMessage = sessionStorage.getItem(this.messageCacheKey) ?? ''
    if (!text || (cacheMessage !== '' && parseInt(cacheMessage) > priority))
      return
    if (this.messageTimer) {
      clearTimeout(this.messageTimer)
      this.messageTimer = undefined
    }

    sessionStorage.setItem(this.messageCacheKey, String(priority))

    text = this.randomSelection(text)

    if (text === 'showQuote') {
      this.showQuote()
      return
    }

    const tipsContainerEl = document.getElementById(this.config.containerId)
    const tipsEl = document.getElementById(this.config.messageId)
    let diaEl = document.createElement('null')
    if (this.config.botId)
      diaEl =
        document.getElementById(this.config.botId) ??
        document.createElement('null')

    if (tipsEl instanceof Element && tipsContainerEl instanceof Element) {
      tipsEl.innerHTML = text
      tipsContainerEl.classList.add('active')
      if (diaEl instanceof Element) diaEl.classList.add('active')
      this.messageTimer = setTimeout(() => {
        sessionStorage.removeItem(this.messageCacheKey)
        tipsContainerEl.classList.remove('active')
        if (diaEl instanceof Element) diaEl.classList.remove('active')
      }, timeout)
    }
  }

  randomSelection(obj) {
    return Array.isArray(obj)
      ? obj[Math.floor(Math.random() * obj.length)]
      : obj
  }

  showQuote() {
    if (this.config.locale === 'zh-CN' || this.config.locale === 'zh-TW') {
      this.getHitokoto()
    }
  }
}
