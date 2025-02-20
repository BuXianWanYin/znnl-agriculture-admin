<template>
  <transition name="fade-bounce-y" mode="out-in">
    <!-- 聊天窗口 -->
    <div v-show="showDia && !isLoginPage" id="bot-container">
      <div class="chat-window" v-show="showChat">
        <div class="chat-header">
          <div class="status-wrapper">
            <span class="status-indicator"></span>
            <span>小农机器人</span>
          </div>
          <button class="close-btn" @click="toggleChat">×</button>
        </div>

        <div class="chat-messages" ref="messagesContainer">
          <template v-for="(msg, index) in messagesWithTimestamp">
            <!-- 时间显示 -->
            <div v-if="shouldShowTimestamp(msg, index)"
                 :key="`time-${index}`"
                 class="message-timestamp">
              {{ formatMessageTime(msg.timestamp) }}
            </div>
            <!-- 消息气泡 -->
            <div :key="`msg-${index}`"
                 class="message-bubble"
                 :class="[msg.type]">
              <div class="avatar" v-if="msg.type === 'bot'">
                <svg class="icon" viewBox="0 0 1024 1024" width="24" height="24">
                  <path d="M814.2848 581.2736a164.7616 104.8576 90 1 0 209.7152 0 164.7616 104.8576 90 1 0-209.7152 0Z" fill="#0C61C6" p-id="9736"></path>
                  <path d="M5.3248 611.2256a164.7616 104.8576 90 1 0 209.7152 0 164.7616 104.8576 90 1 0-209.7152 0Z" fill="#0C61C6" p-id="9737"></path>
                  <path d="M514.6624 985.7536c256.4608 0 464.384-161.1776 464.384-423.3728 0-249.7024-210.432-411.2896-464.384-423.3728-42.752-6.2464 24.4224-112.0768 24.4224-112.0768S50.2784 132.1984 50.2784 562.3808c0 261.9392 207.9232 423.3728 464.384 423.3728z" fill="#2B83E2" p-id="9738"></path>
                  <path d="M140.1344 641.1776a374.528 314.5728 0 1 0 749.056 0 374.528 314.5728 0 1 0-749.056 0Z" fill="#FFFFFF" p-id="9739"></path>
                  <path d="M274.9952 641.1776a89.9072 59.904 90 1 0 119.808 0 89.9072 59.904 90 1 0-119.808 0Z" fill="#2B83E2" p-id="9740"></path>
                  <path d="M634.5216 641.1776a89.9072 59.904 90 1 0 119.808 0 89.9072 59.904 90 1 0-119.808 0Z" fill="#2B83E2" p-id="9741"></path>
                </svg>
              </div>
              <div class="bubble-content">
                <div class="message-text" v-html="processMessageText(msg.text)"></div>
                <div v-if="msg.type === 'bot' && (msg.ttsStatus === 'loading' || msg.audioUrl)"
                     class="text-to-speech-btn"
                     @click="handleTextToSpeech(msg)"
                     :class="{
                       'loading': msg.ttsStatus === 'loading',
                       'playing': msg.ttsStatus === 'playing'
                     }">
                  <svg v-if="!msg.ttsStatus" class="tts-icon" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
                  </svg>
                  <svg v-else-if="msg.ttsStatus === 'loading'" class="loading-icon" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z">
                      <animateTransform attributeName="transform"
                        attributeType="XML"
                        type="rotate"
                        dur="1s"
                        from="0 12 12"
                        to="360 12 12"
                        repeatCount="indefinite"/>
                    </path>
                  </svg>
                  <svg v-else class="playing-icon" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z"/>
                  </svg>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="chat-input">
          <textarea
            v-model="userInput"
            @keydown.enter.prevent="handleEnterPress"
            @input="adjustTextareaHeight"
            @keydown.delete="adjustTextareaHeight"
            @keydown.backspace="adjustTextareaHeight"
            placeholder="输入消息..."
            class="input-area"
            rows="1"
          ></textarea>
          <div class="button-group">
            <div class="voice-input-btn"
                 :class="{ 'listening': isChatListening }"
                 @click="handleChatVoiceClick">
              <div class="microphone-icon" :class="{ 'stop-icon': isChatListening }"></div>
            </div>
            <button class="send-btn" @click="sendMessage">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div id="Aurora-Dia--body" :style="cssVariables">
        <div id="Aurora-Dia--tips-wrapper">
          <div id="Aurora-Dia--tips" class="Aurora-Dia--tips">你好呀～</div>
        </div>
        <div class="voice-btn"
             :class="{ 'listening': isListening, 'show': isHovering || isListening }"
             @click="handleVoiceClick"
             @mouseenter="handleVoiceBtnHover(true)"
             @mouseleave="handleVoiceBtnHover(false)">
          <div class="microphone-icon" :class="{ 'stop-icon': isListening }"></div>
        </div>
        <div id="Aurora-Dia" class="Aurora-Dia"
             @mouseenter="handleDiaHover(true)"
             @mouseleave="handleDiaHover(false)"
             @click="handleDiaClick">
          <div id="Aurora-Dia--eyes" class="Aurora-Dia--eyes">
            <div id="Aurora-Dia--left-eye" class="Aurora-Dia--eye left"></div>
            <div id="Aurora-Dia--right-eye" class="Aurora-Dia--eye right"></div>
          </div>
        </div>
        <div class="Aurora-Dia--platform"></div>
      </div>
    </div>
  </transition>
</template>

<script>
import { AuroraDia } from '@/utils/aurora-dia'
export default {
  name: 'AUDia',
  data() {
    return {
      showDia: false,
      isListening: false,
      isChatListening: false,
      isHovering: false,
      diaInstance: null,
      theme: {
        gradient: {
          color_1: '#8f41e9',
          color_2: '#578cef',
          color_3: '#7aa2f7'
        },
        header_gradient_css: 'linear-gradient(130deg, #8f41e9 10%, #578cef 100%)'
      },
      eyesAnimationTimer: null,
      isInputListening: false,
      userInput: '',
      showChat: false,
      messages: [],
      userId: '',
      isLoadingHistory: false,
    }
  },

  computed: {
    cssVariables() {
      return `
        --aurora-dia--linear-gradient: ${this.theme.header_gradient_css};
        --aurora-dia--linear-gradient-hover: linear-gradient(
          to bottom,
          ${this.theme.gradient.color_2},
          ${this.theme.gradient.color_3}
        );
        --aurora-dia--platform-light: ${this.theme.gradient.color_3};
      `
    },
    shouldShowDiaElements() {
      return this.showDia && !this.isListening
    },
    messagesWithTimestamp() {
      return this.messages.map(msg => ({
        ...msg,
        timestamp: typeof msg.timestamp === 'number' ? msg.timestamp : new Date().getTime()
      }));
    },
    isLoginPage() {
      return this.$route.path === '/login' || this.$route.path === '/' || this.$route.path === '/originIndex'
    }
  },

  watch: {
    showChat: {
      async handler(newValue) {
        if (newValue && this.messages.length === 0) {
          // 创建欢迎消息
          const welcomeMessage = {
            type: 'bot',
            text: '你好！我是你的智能助手，有什么可以帮你的吗？',
            timestamp: new Date().getTime(),
            audioUrl: null,
            ttsStatus: 'loading'
          }

          // 添加消息
          this.messages.push(welcomeMessage)

          try {
            // 请求语音URL
            const audioUrl = await this.getVoiceUrl(welcomeMessage.text, welcomeMessage.timestamp)
            welcomeMessage.audioUrl = audioUrl
            welcomeMessage.ttsStatus = null

            // 保存欢迎消息到数据库
            await this.saveChatMessage(welcomeMessage)
          } catch (error) {
            console.error('处理欢迎消息失败:', error)
            welcomeMessage.ttsStatus = null
          }
        }
      },
      immediate: false
    }
  },

  mounted() {
    this.initializeBot()
    this.activateMotion()
    // 获取用户ID (这里假设从localStorage获取，你需要根据实际情况修改)
    this.userId = 1
    // 加载历史记录
    if (this.userId) {
      this.loadChatHistory()
    }
  },

  methods: {
    initializeBot() {
      try {
        // 延迟1秒执行初始化，确保DOM已完全加载
        setTimeout(() => {
          // 显示机器人
          this.showDia = true
          // 创建AuroraDia实例
          this.diaInstance = new AuroraDia()
          // 安装机器人软件，配置基本参数
          this.diaInstance.installSoftware({
            locale: 'zh-CN',
            containerId: 'Aurora-Dia--tips-wrapper',
            messageId: 'Aurora-Dia--tips'
          })
          // 启动机器人
          this.diaInstance.on()

          // 设置录音结束的回调函数
          this.diaInstance.onRecordingEnd((text, isChat, isAIResponse, isTyping = false) => {
            // 判断是否是聊天模式
            if (isChat) {
              // 判断是否需要打字机效果
              if (isTyping) {
                // 将识别的文本显示在输入框中
                this.userInput = text;
                // 等待DOM更新后调整输入框高度
                this.$nextTick(() => {
                  // 获取输入框元素
                  const textarea = document.querySelector('.input-area')
                  if (textarea) {
                    // 调整输入框高度
                    this.adjustTextareaHeight({ target: textarea })
                  }
                });
              } else if (isAIResponse) {
                // 处理AI的响应
                if (shouldUpdate) {
                  // 更新最后一条机器人消息
                  const lastBotMessage = this.messages.findLast(msg => msg.type === 'bot');
                  if (lastBotMessage) {
                    lastBotMessage.text = text;
                  }
                } else {
                  // 添加新的机器人消息
                  this.messages.push({
                    type: 'bot',
                    text: text
                  });
                }
                // 等待DOM更新后滚动到底部
                this.$nextTick(() => {
                  if (this.$refs.messagesContainer) {
                    this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
                  }
                });
              }
            }
          })
        }, 1000)
      } catch (error) {
        // 捕获并打印初始化过程中的错误
        console.error('初始化机器人失败:', error)
      }
    },

    handleVoiceBtnHover(hovering) {
      if (!this.isListening) {
        this.isHovering = hovering
      }

      if (!hovering && !document.querySelector('.Aurora-Dia:hover')) {
        const diaElement = document.querySelector('.Aurora-Dia')
        const platform = document.querySelector('.Aurora-Dia--platform')
        const topPlatform = document.querySelector('.Aurora-Dia--platform.top')

        diaElement.classList.remove('hover-effect')
        if (platform) platform.classList.remove('hover-effect')
        if (topPlatform) topPlatform.classList.remove('hover-effect')

        if (this.isListening) {
          this.handleClick()
        }
      } else if (hovering) {
        const diaElement = document.querySelector('.Aurora-Dia')
        const platform = document.querySelector('.Aurora-Dia--platform')
        const topPlatform = document.querySelector('.Aurora-Dia--platform.top')

        diaElement.classList.add('hover-effect')
        if (platform) platform.classList.add('hover-effect')
        if (topPlatform) topPlatform.classList.add('hover-effect')
      }
    },

    handleDiaHover(hovering) {
      if (!hovering) {
        if (!document.querySelector('.voice-btn:hover')) {
          this.isHovering = false
          const diaElement = document.querySelector('.Aurora-Dia')
          const platform = document.querySelector('.Aurora-Dia--platform')
          const topPlatform = document.querySelector('.Aurora-Dia--platform.top')

          diaElement.classList.remove('hover-effect')
          if (platform) platform.classList.remove('hover-effect')
          if (topPlatform) topPlatform.classList.remove('hover-effect')

          if (this.isListening) {
            this.handleClick()
          }
        }
      } else {
        this.isHovering = true
        const diaElement = document.querySelector('.Aurora-Dia')
        const platform = document.querySelector('.Aurora-Dia--platform')
        const topPlatform = document.querySelector('.Aurora-Dia--platform.top')

        diaElement.classList.add('hover-effect')
        if (platform) platform.classList.add('hover-effect')
        if (topPlatform) topPlatform.classList.add('hover-effect')
      }
    },

    // 处理语音识别的异步方法，isChatMode参数用于区分是否为聊天窗口模式
    async handleVoiceRecognition(isChatMode = false) {
      // 如果机器人实例不存在则直接返回
      if (!this.diaInstance) return

      try {
        // 判断当前是否正在录音（根据模式判断不同的状态）
        if (isChatMode ? !this.isChatListening : !this.isListening) {
          // 根据模式设置相应的录音状态
          if (isChatMode) {
            // 设置聊天窗口的录音状态为true
            this.isChatListening = true
          } else {
            // 设置普通模式的录音状态为true
            this.isListening = true
          }

          // 调用机器人实例开始录音
          await this.diaInstance.startListening(isChatMode)

          // 设置录音结束后的回调函数
          this.diaInstance.onRecordingEnd((text, isChat, isAIResponse, shouldUpdate = false) => {
            // 判断是否为聊天模式
            if (isChat) {
              // 判断是否为AI的响应
              if (isAIResponse) {
                // 判断是否需要更新已有消息
                if (shouldUpdate) {
                  // 查找最后一条机器人消息
                  const lastBotMessage = this.messages.findLast(msg => msg.type === 'bot');
                  if (lastBotMessage) {
                    // 更新最后一条机器人消息的内容
                    lastBotMessage.text = text;
                  }
                } else {
                  // 添加新的机器人消息到消息列表
                  this.messages.push({
                    type: 'bot',
                    text: text
                  });
                }
              } else {
                // 处理用户的语音输入
                // 将识别的文本设置到输入框
                this.userInput = text;
                // 等待DOM更新后调整输入框高度
                this.$nextTick(() => {
                  // 获取输入框元素
                  const textarea = document.querySelector('.input-area')
                  if (textarea) {
                    // 调整输入框高度
                    this.adjustTextareaHeight({ target: textarea })
                  }
                });

                // // 将用户消息添加到消息列表
                // this.messages.push({
                //   type: 'user',
                //   text: text
                // });
              }
              // 等待DOM更新后滚动到消息列表底部
              this.$nextTick(() => {
                if (this.$refs.messagesContainer) {
                  this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
                }
              });
            }
          })

        } else {
          // 如果已经在录音，则停止录音
          await this.diaInstance.stopListening(isChatMode)
          // 根据模式重置相应的录音状态
          if (isChatMode) {
            // 重置聊天窗口的录音状态
            this.isChatListening = false
          } else {
            // 重置普通模式的录音状态
            this.isListening = false
          }
        }
      } catch (error) {
        // 捕获并打印录音过程中的错误
        console.error('录音操作失败:', error)
        // 发生错误时重置录音状态
        if (isChatMode) {
          // 重置聊天窗口的录音状态
          this.isChatListening = false
        } else {
          // 重置普通模式的录音状态
          this.isListening = false
        }
      }
    },

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
    },

    handleInputVoice() {
      // 切换输入框语音识别状态
      this.isInputListening = !this.isInputListening
      // 触发点击事件
      this.handleClick()
    },

    // 格式化时间戳为后端所需格式
    formatTimestampForBackend(timestamp) {
      const date = new Date(timestamp)
      return date.getFullYear() +
        String(date.getMonth() + 1).padStart(2, '0') +
        String(date.getDate()).padStart(2, '0') +
        String(date.getHours()).padStart(2, '0') +
        String(date.getMinutes()).padStart(2, '0') +
        String(date.getSeconds()).padStart(2, '0')
    },

    // 获取语音URL
    async getVoiceUrl(text, timestamp) {
      // 处理文本：去除 HTML 标签、*号、-号和空格
      const processedText = text
        .replace(/<[^>]*>/g, '')  // 去除所有 HTML 标签
        .replace(/[*\-\s]/g, ''); // 去除*号、-号和空格
      
      console.log('处理后的文本:', processedText)
      const formattedTimestamp = this.formatTimestampForBackend(timestamp)

      try {
        const formData = new FormData()
        formData.append('timestamp', formattedTimestamp)

   
        formData.append('text', processedText) // 使用处理后的文本

        const response = await fetch('http://10.0.28.47:8081/cosy/voicepath', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          console.error('获取语音URL失败 - HTTP状态:', response.status)
          throw new Error('获取语音URL失败')
        }

        const audioUrl = await response.text()
        console.log('获取到的语音URL:', audioUrl)

        if (audioUrl === '失败') {
          console.error('后端返回失败状态')
          return null
        }

        return audioUrl
      } catch (error) {
        console.error('获取语音URL失败:', error)
        return null
      }
    },

    // 修改加载历史记录的方法，处理 create_time 字段
    async loadChatHistory() {
      if (this.isLoadingHistory) return

      this.isLoadingHistory = true
      try {
        const response = await fetch(`http://10.0.28.47:8081/ai/history?userId=${this.userId}`)
        if (!response.ok) {
          throw new Error('Failed to load chat history')
        }
        const history = await response.json()
        
        // 输出原始历史记录数据
        console.log('原始历史记录数据:', history)
        
        // 转换历史记录格式，使用 createTime 作为时间戳
        this.messages = history.map(msg => {
          const convertedMsg = {
            type: msg.type,
            text: msg.content,
            timestamp: msg.createTime ? new Date(msg.createTime).getTime() : 
                     (typeof msg.timestamp === 'number' ? msg.timestamp : new Date().getTime()),
            audioUrl: msg.audioUrl,
            ttsStatus: null
          }
            
          return convertedMsg
        })
        

      } catch (error) {
        console.error('加载聊天历史失败:', error)
      } finally {
        this.isLoadingHistory = false
      }
    },

    // 修改保存消息的方法，使用后端返回的 create_time
    async saveChatMessage(message) {
      try {
        const messageData = {
          type: message.type,
          content: message.text,
          audioUrl: message.audioUrl || null,
          timestamp: typeof message.timestamp === 'number' ? message.timestamp : new Date().getTime(),
          userId: this.userId
        }

        const response = await fetch('http://10.0.28.47:8081/ai/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messageData)
        })

        if (!response.ok) {
          throw new Error('Failed to save message')
        }

        // 获取后端返回的数据
        const savedMessage = await response.json()
        if (savedMessage.create_time) {
          message.timestamp = new Date(savedMessage.create_time).getTime()
        }
      } catch (error) {
        console.error('保存消息失败:', error)
      }
    },

    // 修改发送消息方法
    async sendMessage() {
      if (!this.userInput.trim()) return

      const currentInput = this.userInput.trim()
      const timestamp = new Date().getTime()

      // 创建用户消息对象
      const userMessage = {
        type: 'user',
        text: currentInput,
        timestamp: timestamp,
        audioUrl: null
      }

      // 添加到消息列表并保存
      this.messages.push(userMessage)
      await this.saveChatMessage(userMessage)

      this.userInput = ''

      const textarea = document.querySelector('.input-area')
      if (textarea) {
        textarea.style.height = '24px'
      }

      this.$nextTick(() => {
        if (this.$refs.messagesContainer) {
          this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight
        }
      })

      // 添加机器人思考中的消息
      const botMessage = {
        type: 'bot',
        text: '正在思考...',
        timestamp: new Date().getTime(),
        audioUrl: null,
        ttsStatus: 'loading'
      }
      this.messages.push(botMessage)

      try {
        const formData = new FormData()
        formData.append('prompt', currentInput)

        const response = await fetch('http://127.0.0.1:8081/ai/chatStream', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          console.error('AI响应请求失败:', response.status)
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let fullMessage = ''

        while (true) {
          const { done, value } = await reader.read()
          
          // 如果读取完成，开始获取语音URL
          if (done) {
            // 提前开始获取语音URL
            console.log('AI响应完成，开始获取语音URL...')
            
            const audioUrlPromise = this.getVoiceUrl(fullMessage, botMessage.timestamp)
            
            // 更新消息文本
            botMessage.text = fullMessage
            
            // 等待语音URL获取完成
            const audioUrl = await audioUrlPromise
            botMessage.audioUrl = audioUrl
            botMessage.ttsStatus = null
            console.log('更新消息的音频URL:', audioUrl)
            
            // 保存完整的机器人消息
            await this.saveChatMessage(botMessage)
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (!line.trim()) continue
            const jsonStr = line.replace(/^data:/, '').trim()
            try {
              const jsonData = JSON.parse(jsonStr)
              if (jsonData.response) {
                const newText = jsonData.response
                // 对所有内容进行处理
                if (newText.trim()) {
                  // 检查是否包含完整的 think 标签内容
                  if (newText.includes('<think>') && newText.includes('</think>')) {
                    // 处理完整的 think 内容，修正嵌套顺序
                    const textWithClass = newText.replace(
                      '<think>',
                      '<div class="thinkDiv">'
                    ).replace(
                      '</think>',
                      '</div>'
                    );
                    fullMessage += textWithClass;
                  }
                  // 检查是否只有 think 开始标签
                  else if (newText.includes('<think>')) {
                    // 修正嵌套顺序
                    const textWithClass = newText.replace(
                      '<think>',
                      '<div class="thinkDiv">'
                    );
                    fullMessage += textWithClass;
                  }
                  // 检查是否是 think 结束标签
                  else if (newText.includes('</think>')) {
                    // 分割结束标签后的内容
                    const [, afterThink] = newText.split('</think>');
                    if (afterThink?.trim()) {
                      // 修正结束标签的顺序，并添加后续内容
                      fullMessage += `</div><div class="aimessage">${afterThink}</div>`;
                    } else {
                      // 只添加结束标签
                      fullMessage += '</div>';
                    }
                  } else {
                    // 其他内容直接添加
                    fullMessage += newText;
                  }
                  botMessage.text = fullMessage;
                }

                this.$nextTick(() => {
                  if (this.$refs.messagesContainer) {
                    this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight
                  }
                })

                await new Promise(resolve => setTimeout(resolve, 50))
              }
            } catch (e) {
              console.error('解析响应数据失败:', e)
            }
          }
        }

      } catch (error) {
        console.error('发送消息失败:', error)
        botMessage.ttsStatus = null
      }
    },

    // 修改音频播放方法
    async handleTextToSpeech(message) {
      if (message.ttsStatus === 'playing') {
        console.log('暂停当前播放的音频')
        if (this.currentAudio) {
          this.currentAudio.pause()
          this.currentAudio = null
        }
        this.$set(message, 'ttsStatus', null)
        return
      }

      this.$set(message, 'ttsStatus', 'loading')

      try {
        if (!message.audioUrl) {
          console.log('未找到音频URL，正在获取...')
          message.audioUrl = await this.getVoiceUrl(message.text, message.timestamp)
        }

        if (message.audioUrl) {
          console.log('开始播放音频:', message.audioUrl)

          if (this.currentAudio) {
            console.log('停止之前的音频播放')
            this.currentAudio.pause()
          }

          const audio = new Audio(message.audioUrl)
          this.currentAudio = audio

          audio.onended = () => {
            console.log('音频播放完成')
            this.$set(message, 'ttsStatus', null)
            this.currentAudio = null
          }

          audio.onerror = (e) => {
            console.error('音频播放错误:', e)
            this.$set(message, 'ttsStatus', null)
            this.currentAudio = null
          }

          await audio.play()
          this.$set(message, 'ttsStatus', 'playing')
        } else {
          console.error('无法获取音频URL')
          throw new Error('获取音频URL失败')
        }
      } catch (error) {
        console.error('播放音频失败:', error)
        this.$set(message, 'ttsStatus', null)
      }
    },

    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.messagesContainer) {
          const container = this.$refs.messagesContainer
          const scrollOptions = {
            top: container.scrollHeight,
            behavior: 'smooth'
          }
          container.scrollTo(scrollOptions)
        }
      })
    },

    adjustTextareaHeight(e) {
      const textarea = e.target

      textarea.style.height = '24px'

      const scrollHeight = textarea.scrollHeight

      if (!textarea.value.trim()) {
        textarea.style.height = '24px'
        return
      }

      textarea.style.height = Math.min(scrollHeight, 100) + 'px'

      if (scrollHeight > 100) {
        const cursorPosition = textarea.selectionStart
        const textBeforeCursor = textarea.value.substring(0, cursorPosition)
        const dummyElement = document.createElement('textarea')
        dummyElement.style.cssText = window.getComputedStyle(textarea).cssText
        dummyElement.style.height = 'auto'
        dummyElement.style.position = 'absolute'
        dummyElement.style.visibility = 'hidden'
        dummyElement.value = textBeforeCursor
        document.body.appendChild(dummyElement)

        const cursorOffset = dummyElement.scrollHeight
        document.body.removeChild(dummyElement)

        const scrollOffset = Math.max(0, cursorOffset - 90)
        textarea.scrollTop = scrollOffset
      }
    },

    handleEnterPress(e) {
      if (e.shiftKey) {
        e.preventDefault()
        const textarea = e.target
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const value = textarea.value

        this.userInput = value.substring(0, start) + '\n' + value.substring(end)

        this.$nextTick(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1
          textarea.style.height = '24px'
          textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px'
        })
      } else {
        e.preventDefault()
        this.sendMessage()
      }
    },

    handleChatVoiceClick() {
      this.handleVoiceRecognition(true)
    },

    handleVoiceClick() {
      this.handleVoiceRecognition(false)
    },

    toggleChat() {
      this.showChat = !this.showChat
      // 清除输入框内容
      this.userInput = ''

      if (!this.showChat) {
        const diaBody = document.getElementById('Aurora-Dia--body')
        const platform = document.querySelector('.Aurora-Dia--platform')
        const voiceBtn = document.querySelector('.voice-btn')

        if (diaBody) diaBody.style.display = ''
        if (platform) platform.style.display = ''
        if (voiceBtn) voiceBtn.style.display = ''
      } else {
        // 当打开聊天窗口时，等待 DOM 更新后滚动到底部
        this.$nextTick(() => {
          if (this.$refs.messagesContainer) {
            this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
          }
        });
      }
    },

    handleDiaClick() {
      this.showChat = true
      // 清除输入框内容
      this.userInput = ''

      const diaBody = document.getElementById('Aurora-Dia--body')
      const platform = document.querySelector('.Aurora-Dia--platform')
      const voiceBtn = document.querySelector('.voice-btn')

      if (diaBody) diaBody.style.display = 'none'
      if (platform) platform.style.display = 'none'
      if (voiceBtn) voiceBtn.style.display = 'none'

      // 当点击打开聊天窗口时，等待 DOM 更新后滚动到底部
      this.$nextTick(() => {
        if (this.$refs.messagesContainer) {
          this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
        }
      });
    },

    // 修改判断是否显示时间戳的方法
    shouldShowTimestamp(currentMsg, index) {
      if (index === 0) return true;
      
      const prevMsg = this.messagesWithTimestamp[index - 1];
      const currentTime = currentMsg.timestamp;
      const prevTime = prevMsg.timestamp;
      
      // 如果消息间隔超过5分钟（300000毫秒），显示时间戳
      return currentTime - prevTime > 300000;
    },

    // 修改格式化时间显示的方法
    formatMessageTime(timestamp) {
      // 确保timestamp是数字类型
      if (typeof timestamp !== 'number') {
        console.warn('Invalid timestamp format:', timestamp);
        timestamp = new Date().getTime();
      }

      try {
        const messageDate = new Date(timestamp);
        // 验证日期是否有效
        if (isNaN(messageDate.getTime())) {
          console.error('Invalid date created from timestamp:', timestamp);
          return '时间未知';
        }

        const now = new Date();
        const isToday = messageDate.toDateString() === now.toDateString();
        const isYesterday = new Date(now - 86400000).toDateString() === messageDate.toDateString();

        // 格式化时间
        const timeStr = messageDate.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

        if (isToday) {
          return `今天 ${timeStr}`;
        } else if (isYesterday) {
          return `昨天 ${timeStr}`;
        } else {
          // 显示完整日期
          const dateStr = messageDate.toLocaleDateString('zh-CN', {
            month: 'numeric',
            day: 'numeric'
          });
          return `${dateStr} ${timeStr}`;
        }
      } catch (error) {
        console.error('Error formatting message time:', error);
        return '时间未知';
      }
    },

    processMessageText(text) {
      // 首先去除特殊符号，但保留 think 标签
      const cleanText = text.replace(/[-#*]/g, '');
      
      // 将文本按照 think 标签分割并处理
      const thinkMatches = cleanText.match(/<think>([\s\S]*?)<\/think>/g);
      if (thinkMatches) {
        thinkMatches.forEach((match, index) => {
          const content = match.replace(/<think>|<\/think>/g, '');
        });
      }
      
      const parts = cleanText.split(/(<think>[\s\S]*?<\/think>)/g);
      
      return parts.map(part => {     
        if (part.includes('<think>')) {
          // 提取并打印 think 标签中的内容
          const thinkContent = part.replace(/<think>|<\/think>/g, '');
          return part;
        } else if (part.trim()) {
          return part;
        }
        return '';
      }).join('');
    }
  }
}
</script>

<style lang="scss" scoped>
#bot-container {
  position: fixed;
  right: 20px;
  bottom: 0;
  z-index: 1000;
  width: 70px;
  height: 60px;
  box-sizing: content-box;
  pointer-events: auto;
}

#Aurora-Dia--body {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  --auora-dia--width: 65px;
  --auora-dia--height: 50px;
  --auora-dia--hover-height: 60px;
  --auora-dia--jump-1: 55px;
  --auora-dia--jump-2: 60px;
  --auora-dia--jump-3: 45px;
  --auora-dia--eye-top: 10px;
  --auora-dia--eye-height: 15px;
  --auora-dia--eye-width: 8px;
  --auora-dia--eye-top: 10px;
  --auora-dia--platform-size: var(--auora-dia--jump-2);
  --auora-dia--platform-size-shake-1: 75px;
  --auora-dia--platform-size-shake-2: 45px;
  --auora-dia--platform-top: -15px;
  --aurora-dia--linear-gradient: linear-gradient(130deg, #8f41e9 10%, #578cef 100%);
  --aurora-dia--linear-gradient-hover: linear-gradient(to bottom, #25b0cc, #3f60de);
  --aurora-dia--platform-light: #b712ac;
  position: relative;
  z-index: 999;
}

#bot-container .Aurora-Dia {
  position: absolute;
  bottom: 30px;
  width: var(--auora-dia--width);
  height: var(--auora-dia--height);
  border-radius: 45%;
  border: 4px solid var(--background-secondary, #fff);
  background-image: var(--aurora-dia--linear-gradient);
  animation: breathe-and-jump 3s linear infinite;
  cursor: pointer;
  z-index: 1;
  will-change: transform;
  transition: height  linear, transform  linear;
  overflow: hidden;
}

#bot-container .Aurora-Dia::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: var(--aurora-dia--linear-gradient-hover);
  opacity: 0;
  transition: opacity  linear;
}

#bot-container .Aurora-Dia.hover-effect {
  animation: shake-to-alert 0.5s linear;
  height: var(--auora-dia--hover-height);
  transform: translateY(-7px);
}

#bot-container .Aurora-Dia.hover-effect::before {
  opacity: 1;
}

#bot-container .Aurora-Dia--eyes > .Aurora-Dia--eye {
  position: absolute;
  top: var(--auora-dia--eye-top);
  width: var(--auora-dia--eye-width);
  height: var(--auora-dia--eye-height);
  border-radius: 15px;
  background-color: #fff;
  box-shadow: 0 0 7px rgba(255, 255, 255, 0.5);
  animation: blink 5s linear infinite;
  will-change: transform;
}

#bot-container .Aurora-Dia--eyes > .Aurora-Dia--eye.left {
  left: 25%;
}

#bot-container .Aurora-Dia--eyes > .Aurora-Dia--eye.right {
  right: 25%;
}

#bot-container .Aurora-Dia--eyes.moving > .Aurora-Dia--eye {
  animation: none;
}

#bot-container .Aurora-Dia--platform {
  position: relative;
  top: 0;
  transform: rotateX(70deg);
  width: var(--auora-dia--platform-size);
  height: var(--auora-dia--platform-size);
  box-shadow:
    0 0 var(--auora-dia--platform-size) var(--aurora-dia--platform-light),
    0 0 15px var(--aurora-dia--platform-light) inset;
  animation: jump-pulse 3s linear infinite;
  border-radius: 50%;
  transition: linear all;
}

#Aurora-Dia--tips-wrapper {
  position: absolute;
  right: 99px;
  bottom: 45px;
  width: 250px;
  height: auto;
  min-height: 70px;
  max-height: 200px;
  margin: -20px;
  padding: 5px 10px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.12);
  animation: tips-breathe 3s linear infinite;
  transition: all 0.3s linear;
  z-index: 100;
  overflow: hidden;
}

.Aurora-Dia--tips {
  position: relative;
  height: 100%;
  width: 100%;
  min-height: 60px;
  border-radius: 6px;
  padding: 0.5rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 800;
  background: var(--background-secondary, #fff);
  overflow-y: auto;
  word-break: break-all;
  line-height: 1.8;
  white-space: pre-wrap;
}

@keyframes breathe-and-jump {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes blink {
  0%, 95%, 100% {
    height: var(--auora-dia--eye-height);
    transform: translateY(0);
  }
  97.5% {
    height: 0;
    transform: translateY(var(--auora-dia--eye-height));
  }
}

@keyframes jump-pulse {
  0%, 100% {
    transform: rotateX(70deg) scale(1);
  }
  50% {
    transform: rotateX(70deg) scale(0.85);
  }
}

@keyframes shake-to-alert {
  0%, 100% {
    transform: translateY(-7px) rotate(0);
  }
  25% {
    transform: translateY(-7px) rotate(10deg);
  }
  75% {
    transform: translateY(-7px) rotate(-10deg);
  }
}

@keyframes shake-pulse {
  0%, 100% {
    transform: rotateX(70deg) scale(1);
  }
  50% {
    transform: rotateX(70deg) scale(1.2);
  }
}

@keyframes tips-breathe {
  0%, 100% {
    opacity: 0.86;
  }
  50% {
    opacity: 0.6;
  }
}

.fade-bounce-y-enter-active {
  transition: all 0.3s ease;
}

.fade-bounce-y-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.fade-bounce-y-enter-from,
.fade-bounce-y-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.voice-btn {
  position: absolute;
  top: -67px;
  right: 27%;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--aurora-dia--linear-gradient);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 200;
  opacity: 0;
  transform: translateY(10px);
  pointer-events: none;

  .microphone-icon {
    width: 16px;
    height: 16px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z'/%3E%3C/svg%3E");
    background-size: 16px;
    background-position: center;
    background-repeat: no-repeat;
    transition: all 0.3s;

    &.stop-icon {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M18,18H6V6H18V18Z'/%3E%3C/svg%3E");
    }
  }
}

.voice-btn.show {
  pointer-events: auto;
  opacity: 1;
  transform: translateY(0);
}

.voice-btn.listening {
  animation: pulse 1s infinite;
  background: #ff4444;
}

.microphone-icon {
  width: 16px;
  height: 16px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z'/%3E%3C/svg%3E");
  background-size: 16px;
  background-position: center;
  background-repeat: no-repeat;
  transition: all 0.3s;

  &.stop-icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M18,18H6V6H18V18Z'/%3E%3C/svg%3E");
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.Aurora-Dia--platform.top {
  position: absolute;
  top: -25px;
  transform: rotateX(-70deg) scale(0.8);
  opacity: 0;
  transition: 0.3s ease all;
  box-shadow:
    0 0 var(--auora-dia--platform-size) var(--aurora-dia--platform-light),
    0 0 15px var(--aurora-dia--platform-light) inset;
}

.Aurora-Dia:hover ~ .Aurora-Dia--platform.top {
  opacity: 0.3;
  box-shadow:
    0 0 var(--auora-dia--platform-size) var(--aurora-dia--platform-light),
    0 0 15px var(--aurora-dia--platform-light) inset;
}

.chat-window {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 550px;
  height: 680px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
}

.chat-header {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(2px);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(to bottom,
      rgba(0, 0, 0, 0.04),
      rgba(0, 0, 0, 0.01)
    );
  }

  .status-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #22c55e;
      box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
      display: inline-block;
    }

    span {
      font-size: 14px;
      color: #333;
    }
  }

  .close-btn {
    border: none;
    background: none;
    color: #999;
    cursor: pointer;
    font-size: 18px;
    padding: 4px;

    &:hover {
      color: #666;
    }
  }
}
.message-text {
  :deep(.thinkDiv) {
    color: #c20000;
    display: block;
    
    .think {
      color: inherit;  // 继承父元素的颜色
      display: block;
    }
  }
}

// 或者分开写，提高特异性
:deep(.message-text .thinkDiv),
:deep(.message-text .thinkDiv .think) {
  color: #c20000;
  display: block;
}

.chat-messages {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background: white;

  /* 隐藏滚动条 - Webkit 浏览器 */
  &::-webkit-scrollbar {
    display: none;
  }

  /* 隐藏滚动条 - Firefox */
  scrollbar-width: none;

  /* 隐藏滚动条 - IE/Edge */
  -ms-overflow-style: none;

  .message-bubble {
    display: flex;
    align-items: flex-start;
    margin: 16px;
    gap: 8px;

    &.user {
      flex-direction: row-reverse;
      
      .bubble-content {
        align-items: flex-end;
      }

      .message-text {
        background-color: #7aa2f7;
        color: white;
        border-radius: 12px 12px 0 12px;
      }
    }

    &.bot .message-text {
      background-color: #f5f5f5;
      border-radius: 12px 12px 12px 0;
    }

    .avatar {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0f0f0;
      border-radius: 50%;
    }

    .bubble-content {
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 70%;
    }

    .message-text {
      padding: 8px 12px;
      font-size: 13px;
      line-height: 1.4;
      color: #333;
      letter-spacing: 0.2px;
      white-space: pre-line;
      word-wrap: break-word;

      :deep(.aimessage) {
        padding: 4px 0;
      }
    }

    .text-to-speech-btn {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.2s;

      &:hover {
        opacity: 1;
      }

      svg {
        width: 16px;
        height: 16px;
        color: #666;
      }

      &.playing {
        animation: pulse-fade 1.5s ease-in-out infinite;

        svg {
          color: #7aa2f7;
        }
      }

      &.loading {
        opacity: 0.4;
        cursor: default;
      }
    }
  }
}

.chat-input {
  padding: 5px 10px;
  background: white;
  border-top: 1px solid #d1d0d04d;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 46px;

  .input-area {
    flex: 1;
    padding: 4px 12px;
    border: none;
    font-size: 13px;
    outline: none;
    background: transparent;
    resize: none;
    width: calc(100% + 18px);
    margin-right: -18px;
    min-height: 24px;
    max-height: 100px;
    overflow-y: scroll;
    vertical-align: middle;
    word-wrap: break-word;
    line-height: 1.4;
    font-family: inherit;
    color: #333;

    &::-webkit-scrollbar {
      display: none;
    }

    &::placeholder {
      color: #999;
      font-size: 13px;
      line-height: 1.4;
      font-family: inherit;
      opacity: 1;
      padding: 0;
      vertical-align: middle;
    }
  }

  .button-group {
    display: flex;
    gap: 4px;
    align-self: center;
  }

  .send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #666;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      color: #7aa2f7;
    }
  }
}
.voice-input-btn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  .microphone-icon {
    width: 16px;
    height: 16px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z'/%3E%3C/svg%3E");
    background-size: 16px;
    background-position: center;
    background-repeat: no-repeat;
    transition: all 0.3s;

    &.stop-icon {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M18,18H6V6H18V18Z'/%3E%3C/svg%3E");
    }
  }

  &:hover {
    background-color: #f5f5f5;
  }

  &.listening {
    background-color: #ff4444;
    .microphone-icon {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M18,18H6V6H18V18Z'/%3E%3C/svg%3E");
    }
  }
}

.send-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;

  &:hover {
    color: #7aa2f7;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.message-timestamp {
  text-align: center;
  margin: 16px 0;
  font-size: 12px;
  color: #999;
}

@keyframes pulse-fade {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}

// think 标签样式
:deep(.thinkDiv) {
  margin: 8px 0;
  color: #ccc;
}

:deep(think), :deep(.think) {
  display: block;
  background-color: #f5f7fa;
  border-left: 3px solid #7aa2f7;
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 4px;
  color: #ccc;
}
</style>
