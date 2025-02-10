<template>
  <transition name="fade-bounce-y" mode="out-in">
    <!-- 聊天窗口 -->
    <div v-show="showDia && !isLoginPage" id="bot-container">
      <div class="chat-window" v-show="showChat">
        <div class="chat-header">
          <div class="status-wrapper">
            <span class="status-indicator"></span>
            <span>BXWY</span>
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
            <!-- 消息内容 -->
            <div :key="`msg-${index}`"
                 :class="['message-wrapper', msg.type]">
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
              <div class="message-content">
                {{ msg.text }}
                <div v-if="msg.type === 'bot'" 
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
      messages: [
        {
          type: 'bot',
          text: '你好！我是你的智能助手，有什么可以帮你的吗？',
          timestamp: new Date().getTime(),
          audioUrl: null
        }
      ]
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
        timestamp: msg.timestamp || new Date().getTime()
      }));
    },
    isLoginPage() {
      return this.$route.path === '/login' || this.$route.path === '/'
    }
  },

  mounted() {
    this.initializeBot()
    this.activateMotion()
    this.loadHistoryMessages()
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
            // 设置语言为中文
            locale: 'zh-CN',
            // 配置提示信息
            tips: {
              // 随机显示的提示消息列表
              messages: [
                "你好呀！",
                "今天天气真不错~",
                "要不要休息一下？",
                "工作顺利吗？",
                "有什么可以帮你的吗？"
              ]
            },
            // 不同时段的欢迎语配置
            welcome: {
              "7_11": "早上好！一日之计在于晨，美好的一天就要开始了。",
              "11_13": "中午了，工作了一个上午，现在是午餐时间！",
              "13_17": "午后很容易犯困呢，今天的运动目标完成了吗？",
              "17_19": "傍晚了！窗外夕阳的景色很美丽呢，最美不过夕阳红~",
              "19_21": "晚上好，今天过得怎么样？",
              "21_23": ["已经这么晚了呀，早点休息吧，晚安~", "深夜时要爱护眼睛呀！"],
              "24": "你是夜猫子呀？这么晚还不睡觉，明天起的来嘛？"
            },
            // 特殊日期事件配置
            events: [
              {
                date: "01/01",
                text: "新年快乐！祝你在新的一年里事事顺心~"
              }
            ],
            // 复制文本时的提示语
            copy: "你都复制了些什么呀，要记得标明出处哦~",
            visibility_change: "欢迎回来，我好想你呀！",
            self: {
              name: "BXWY",
              role: "助手"
            }
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

    // 加载历史消息
    loadHistoryMessages() {
      const historyCookie = this.$cookies.get('chatHistory')
      if (historyCookie) {
        console.log('从Cookie加载历史消息:', historyCookie)
        this.messages = historyCookie
      } else {
        console.log('没有找到历史消息Cookie')
      }
    },

    // 保存历史消息到cookie
    saveHistoryMessages() {
      console.log('保存消息到Cookie:', this.messages)
      this.$cookies.set('chatHistory', this.messages, '6h')
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
      const formattedTimestamp = this.formatTimestampForBackend(timestamp)
      console.log('请求语音URL - 文本:', text)
      console.log('请求语音URL - 时间戳:', formattedTimestamp)

      try {
        const formData = new FormData()
        formData.append('timestamp', formattedTimestamp)
        formData.append('text', text)

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

    // 修改发送消息方法
    async sendMessage() {
      if (!this.userInput.trim()) return
      
      const currentInput = this.userInput.trim()
      const timestamp = new Date().getTime()
      
      console.log('发送新消息:', currentInput)
      console.log('消息时间戳:', timestamp)
      
      // 添加用户消息
      this.messages.push({
        type: 'user',
        text: currentInput,
        timestamp: timestamp,
        audioUrl: null
      })

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
        audioUrl: null
      }
      this.messages.push(botMessage)

      try {
        console.log('请求AI响应...')
        const formData = new FormData()
        formData.append('prompt', currentInput)

        const response = await fetch('http://10.0.28.47:8081/ai/generateStream', {
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

        console.log('开始读取流式响应...')
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (!line.trim()) continue
            const jsonStr = line.replace(/^data:/, '').trim()

            try {
              const jsonData = JSON.parse(jsonStr)
              if (jsonData.response) {
                const newText = jsonData.response
                fullMessage += newText
                botMessage.text = fullMessage
                
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
        
        console.log('AI响应完成，获取语音URL...')
        const audioUrl = await this.getVoiceUrl(fullMessage, botMessage.timestamp)
        botMessage.audioUrl = audioUrl
        console.log('更新消息的音频URL:', audioUrl)

        this.saveHistoryMessages()
        console.log('消息历史已保存到Cookie')
        
      } catch (error) {
        console.error('发送消息失败:', error)
        botMessage.text = '抱歉，我遇到了一些问题，请稍后再试。'
      }
    },

    // 修改音频播放方法
    async handleTextToSpeech(message) {
      console.log('准备播放音频 - 消息:', message)
      
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
      console.log('音频加载中...')

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
          console.log('音频开始播放')
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
      
      if (!this.showChat) {
        const diaBody = document.getElementById('Aurora-Dia--body')
        const platform = document.querySelector('.Aurora-Dia--platform')
        const voiceBtn = document.querySelector('.voice-btn')
        
        if (diaBody) diaBody.style.display = ''
        if (platform) platform.style.display = ''
        if (voiceBtn) voiceBtn.style.display = ''
      }
    },

    handleDiaClick() {
      this.showChat = true
      
      const diaBody = document.getElementById('Aurora-Dia--body')
      const platform = document.querySelector('.Aurora-Dia--platform')
      const voiceBtn = document.querySelector('.voice-btn')
      
      if (diaBody) diaBody.style.display = 'none'
      if (platform) platform.style.display = 'none'
      if (voiceBtn) voiceBtn.style.display = 'none'
    },

    // 判断是否需要显示时间戳
    shouldShowTimestamp(currentMsg, index) {
      if (index === 0) return true;
      
      const prevMsg = this.messagesWithTimestamp[index - 1];
      const currentTime = new Date(currentMsg.timestamp);
      const prevTime = new Date(prevMsg.timestamp);
      
      // 如果消息间隔超过5分钟，显示时间戳
      return currentTime - prevTime > 5 * 60 * 1000;
    },

    // 格式化时间显示
    formatMessageTime(timestamp) {
      const messageDate = new Date(timestamp);
      const now = new Date();
      const isToday = messageDate.toDateString() === now.toDateString();
      
      // 格式化时间
      const timeStr = messageDate.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      // 如果是今天的消息，只显示时间
      if (isToday) {
        return timeStr;
      }
      
      // 不是今天的消息，显示日期和时间
      const dateStr = messageDate.toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric'
      });
      return `${dateStr} ${timeStr}`;
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

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
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
  width: 14px;
  height: 14px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/></svg>');
  background-repeat: no-repeat;
  background-position: center;
  transition: all 0.3s ease;
}

.microphone-icon.stop-icon {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M6 6h12v12H6z"/></svg>');
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
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
  width: 350px;
  height: 480px;
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

  .message-wrapper {
    display: flex;
    margin-bottom: 24px;
    align-items: flex-start;
    
    .avatar {
      width: 32px;
      height: 32px;
      margin: 0 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      overflow: hidden;
      background: #f0f0f0;
      
      .avatar-img {
        width: 24px;
        height: 24px;
        object-fit: contain;
        border-radius: 50%;
      }
    }

    .message-content {
      position: relative;
      max-width: 70%;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.4;
      background: #f5f5f5;
      color: #333;
      letter-spacing:0.2px;
      white-space: pre-line;
      word-wrap: break-word;
      
      .text-to-speech-btn {
        position: absolute;
        right: 0;
        bottom: -20px;
        width: 20px;
        height: 20px;
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
          color: #666;
        }
        
        &.loading svg {
          color: #7aa2f7;
        }
        
        &.playing svg {
          color: #7aa2f7;
        }
      }
    }

    &.user {
      flex-direction: row-reverse;
      
      .avatar {
        display: none;
      }
      
      .message-content {
        background: #f0f0f0;
        margin-right: 8px;
      }
    }

    &.bot .message-content {
      background: #f5f5f5;
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
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z'/%3E%3Cpath fill='%23666' d='M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
    transition: all 0.3s;

    &.stop-icon {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M6 6h12v12H6z'/%3E%3C/svg%3E");
    }
  }

  &:hover {
    background-color: #f5f5f5;
  }

  &.listening {
    background-color: #ff4444;
    .microphone-icon {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M6 6h12v12H6z'/%3E%3C/svg%3E");
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
  margin: 8px 0;
  color: #999;
  font-size: 12px;
}
</style>

