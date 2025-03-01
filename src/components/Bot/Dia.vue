<template>
  <transition name="fade-bounce-y" mode="out-in">
    <!-- 聊天窗口 -->
    <div v-show="showDia && !isLoginPage" id="bot-container" :class="{ 'left-side': isLeftSide }">
      <div class="chat-window" v-show="showChat">
        <div class="chat-header">
          <div class="status-wrapper">
            <span class="status-indicator"></span>
            <span>小农机器人</span>
          </div>
          <div class="header-actions">
            <!-- 添加左右切换按钮 -->
            <button class="action-btn switch-side-btn" @click="toggleSide" :title="isLeftSide ? '切换到右侧' : '切换到左侧'">
              <!-- <svg-icon icon-class="jqryj" /> -->
            </button>
            <!-- 添加隐藏小人按钮 -->
            <button class="action-btn toggle-bot-btn" @click="toggleBot" :title="showBot ? '隐藏小人' : '显示小人'">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" :d="showBot ? 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' : 'M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z'"/>
              </svg>
            </button>
            <button class="close-btn" @click="toggleChat">×</button>
          </div>
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
                <!-- 机器人头像 -->
                <svg-icon icon-class="jqrtouxiang" />
              </div>
              <div class="bubble-content">
                <div class="message-text" v-html="msg.text"></div>
              </div>
            </div>
          </template>
        </div>

        <div class="chat-input">
          <!-- 移除图片预览区域 -->
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
              <div class="microphone-icon">
                <svg-icon :icon-class="isChatListening ? 'jqrstop' : 'jqrmkffa'" />
              </div>
            </div>
            <div class="upload-btn" :class="{ 'has-image': previewImage }">
              <div class="preview-thumbnail" v-if="previewImage" @click="$refs.fileInput.click()">
                <img :src="previewImage" alt="预览缩略图">
                <div class="image-actions">
                  <span class="delete-btn" @click.stop="cancelImageUpload">×</span>
                </div>
              </div>
              <template v-else>
                <input
                  type="file"
                  ref="fileInput"
                  accept="image/*"
                  class="file-input"
                  @change="handleImageUpload"
                >
                <!-- 上传图片图标 -->
                <svg-icon icon-class="jqrtupian" />
              </template>
            </div>
            <button class="send-btn" @click="sendMessage">
              <!-- 发送消息图标 -->
              <svg-icon icon-class="jqrfsxx" />
            </button>
          </div>
        </div>
      </div>
      <div id="Aurora-Dia--body" :style="cssVariables" v-show="showBot">
        <div id="Aurora-Dia--tips-wrapper">
          <div id="Aurora-Dia--tips" class="Aurora-Dia--tips">你好呀～</div>
        </div>
        <!-- 修改按钮布局 -->
        <div class="voice-btn"
             :class="{ 'listening': isListening, 'show': isHovering || isListening }"
             @click="handleVoiceClick"
             @mouseenter="handleVoiceBtnHover(true)"
             @mouseleave="handleVoiceBtnHover(false)">
          <div class="microphone-icon">
            <svg-icon :icon-class="isListening ? 'jqrstop' : 'jqrmkf'" />
          </div>
        </div>
        <div class="action-btn switch-side-btn"
             :class="{ 'show': isHovering }"
             @click="toggleSide"
             @mouseenter="handleVoiceBtnHover(true)"
             @mouseleave="handleVoiceBtnHover(false)"
             :title="isLeftSide ? '切换到右侧' : '切换到左侧'">
          <svg-icon :icon-class="isLeftSide ? 'jqryj' : 'jqrzj'" />
      
        </div>
        <div class="action-btn toggle-bot-btn"
             :class="{ 'show': isHovering }"
             @click="toggleBot"
             @mouseenter="handleVoiceBtnHover(true)"
             @mouseleave="handleVoiceBtnHover(false)"
             :title="showBot ? '隐藏小人' : '显示小人'">
          <svg-icon icon-class="jqrxhao" />
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
import {
    getToken
} from "@/utils/auth";
import { botAiVoicepath, botAiMessage, botAiHistory } from '@/api/bot/botai'
import { AlertWebSocket } from '@/utils/AlertWebSocket'
import { Notification } from 'element-ui';

// 在组件外部创建单例
let alertWsInstance = null;
let wsConnected = false;

export default {
  name: 'AUDia',
  data() {
    return {
      showDia: false,         // 控制机器人整体显示/隐藏
      isListening: false,     // 语音识别状态标志
      isChatListening: false, // 聊天窗口语音识别状态
      isHovering: false,      // 鼠标悬停状态
      diaInstance: null,      // Aurora-Dia 实例
      theme: {               // 主题配置
        gradient: {
          color_1: '#8f41e9', // 渐变色1
          color_2: '#578cef', // 渐变色2
          color_3: '#7aa2f7'  // 渐变色3
        },
        header_gradient_css: 'linear-gradient(130deg, #8f41e9 10%, #578cef 100%)' // 头部渐变样式
      },
      eyesAnimationTimer: null, // 眼睛动画定时器
      isInputListening: false,  // 输入框语音识别状态
      userInput: '',           // 用户输入内容
      showChat: false,         // 聊天窗口显示状态
      messages: [],            // 聊天消息数组
      userId: '',              // 用户ID
      isLoadingHistory: false, // 历史记录加载状态
      previewImage: null,      // 图片预览URL
      imageBlob: null,         // 图片二进制数据
      showBot: true,          // 机器人显示状态
      isLeftSide: false,      // 左侧显示状态
      alertWs: null,          // WebSocket实例
      isShowingAlert: false,  // 警告显示状态
      themeTransition: {      // 主题过渡颜色
        color_1: '#8f41e9',
        color_2: '#578cef',
        color_3: '#7aa2f7'
      },
      wsInitialized: false,   // WebSocket初始化状态
    }
  },

  computed: {
    cssVariables() {
      return `
        --aurora-dia--linear-gradient: linear-gradient(130deg, ${this.themeTransition.color_1} 10%, ${this.themeTransition.color_2} 100%);
        --aurora-dia--linear-gradient-hover: linear-gradient(
          to bottom,
          ${this.themeTransition.color_2},
          ${this.themeTransition.color_3}
        );
        --aurora-dia--platform-light: ${this.themeTransition.color_3};
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
            timestamp: new Date().getTime()
          }

          // 添加消息
          this.messages.push(welcomeMessage)

          try {
            // 保存欢迎消息到数据库
            await this.saveChatMessage(welcomeMessage)
          } catch (error) {
            console.error('处理欢迎消息失败:', error)
          }
        }
      },
      immediate: false
    },
    '$route'() {
      if (!wsConnected && !this.wsInitialized) {
        this.initAlertWebSocket();
      }
    }
  },

  mounted() {
    this.initializeBot()      // 初始化机器人
    this.activateMotion()     // 激活运动效果
    this.userId = 1           // 设置用户ID
    
    // 如果有用户ID则加载聊天历史
    if (this.userId) {
      this.loadChatHistory()
    }
    
    // 只在未初始化时创建WebSocket连接
    if (!this.wsInitialized) {
      this.initAlertWebSocket()
    }
  },

  beforeDestroy() {
    // 只在非热重载环境下断开连接
    if (!module.hot) {
        this.disconnectWebSocket();
    }
  },

  methods: {
    // 断开WebSocket连接
    disconnectWebSocket() {
      if (alertWsInstance) {
        alertWsInstance.disconnect();
        alertWsInstance = null;
        wsConnected = false;
        this.wsInitialized = false;
      }
    },

    // 初始化机器人
    initializeBot() {
      try {
        // 延迟1秒执行初始化，确保DOM已完全加载
        setTimeout(() => {
          this.showDia = true // 显示机器人
          
          // 创建AuroraDia实例并配置
          this.diaInstance = new AuroraDia()
          this.diaInstance.installSoftware({
            locale: 'zh-CN',
            containerId: 'Aurora-Dia--tips-wrapper',
            messageId: 'Aurora-Dia--tips',
            onMessage: (message) => {
              // 如果正在显示警告，则不显示其他消息
              if (this.isShowingAlert) {
                return false
              }
              return true
            }
          })
          
          // 启动机器人
          this.diaInstance.on()

          // 设置录音结束的回调函数
          this.diaInstance.onRecordingEnd((text, isChat, isAIResponse, isTyping = false) => {
            if (isChat) {
              if (isTyping) {
                // 将识别的文本显示在输入框中
                this.userInput = text;
                this.$nextTick(() => {
                  const textarea = document.querySelector('.input-area')
                  if (textarea) {
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
                // 滚动到底部
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
        console.error('初始化机器人失败:', error)
      }
    },

    // 处理悬停效果
    handleVoiceBtnHover(hovering) {
      // 如果不在录音状态，更新悬停状态
      if (!this.isListening) {
        this.isHovering = hovering
      }

      // 处理悬停效果的DOM元素
      if (!hovering && !document.querySelector('.Aurora-Dia:hover')) {
        const diaElement = document.querySelector('.Aurora-Dia')
        const platform = document.querySelector('.Aurora-Dia--platform')
        const topPlatform = document.querySelector('.Aurora-Dia--platform.top')

        // 移除悬停效果
        diaElement.classList.remove('hover-effect')
        if (platform) platform.classList.remove('hover-effect')
        if (topPlatform) topPlatform.classList.remove('hover-effect')

        if (this.isListening) {
          this.handleClick()
        }
      } else if (hovering) {
        // 添加悬停效果
        const diaElement = document.querySelector('.Aurora-Dia')
        const platform = document.querySelector('.Aurora-Dia--platform')
        const topPlatform = document.querySelector('.Aurora-Dia--platform.top')

        diaElement.classList.add('hover-effect')
        if (platform) platform.classList.add('hover-effect')
        if (topPlatform) topPlatform.classList.add('hover-effect')
      }
    },

    // 处理机器人主体的悬停效果
    handleDiaHover(hovering) {
      if (!hovering) {
        if (!document.querySelector('.voice-btn:hover')) {
          this.isHovering = false
          const diaElement = document.querySelector('.Aurora-Dia')
          const platform = document.querySelector('.Aurora-Dia--platform')
          const topPlatform = document.querySelector('.Aurora-Dia--platform.top')

          // 移除悬停效果
          diaElement.classList.remove('hover-effect')
          if (platform) platform.classList.remove('hover-effect')
          if (topPlatform) topPlatform.classList.remove('hover-effect')

          if (this.isListening) {
            this.handleClick()
          }
        }
      } else {
        // 添加悬停效果
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
            this.isChatListening = true
          } else {
            this.isListening = true
          }

          // 调用机器人实例开始录音
          await this.diaInstance.startListening(isChatMode)

          // 设置录音结束后的回调函数
          this.diaInstance.onRecordingEnd((text, isChat, isAIResponse, shouldUpdate = false) => {
            if (isChat) {
              if (isAIResponse) {
                if (shouldUpdate) {
                  // 更新最后一条机器人消息
                  const lastBotMessage = this.messages.findLast(msg => msg.type === 'bot');
                  if (lastBotMessage) {
                    lastBotMessage.text = text;
                    this.scrollToBottom();
                  }
                } else {
                  // 添加新的机器人消息
                  this.messages.push({
                    type: 'bot',
                    text: text
                  });
                  this.scrollToBottom();
                }
              } else {
                // 处理用户的语音输入
                this.userInput = text;
                this.$nextTick(() => {
                  const textarea = document.querySelector('.input-area')
                  if (textarea) {
                    this.adjustTextareaHeight({ target: textarea })
                  }
                });
              }
              // 滚动到消息列表底部
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
          // 重置录音状态
          if (isChatMode) {
            this.isChatListening = false
          } else {
            this.isListening = false
          }
        }
      } catch (error) {
        console.error('录音操作失败:', error)
        // 发生错误时重置录音状态
        if (isChatMode) {
          this.isChatListening = false
        } else {
          this.isListening = false
        }
      }
    },

    // 激活机器人的运动效果
    activateMotion() {
      // 获取眼睛和身体相关的DOM元素
      const leftEye = document.getElementById('Aurora-Dia--left-eye')
      const rightEye = document.getElementById('Aurora-Dia--right-eye')
      const eyesEl = document.getElementById('Aurora-Dia--eyes')
      const diaBody = document.getElementById('Aurora-Dia')

      if (leftEye && rightEye && eyesEl && diaBody) {
        let rafId = null

        // 添加鼠标移动事件监听
        document.addEventListener('mousemove', evt => {
          if (rafId) {
            cancelAnimationFrame(rafId)
          }

          rafId = requestAnimationFrame(() => {
            clearTimeout(this.eyesAnimationTimer)
            eyesEl.classList.add('moving')

            // 计算视口尺寸和中心点
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight
            const diaRect = diaBody.getBoundingClientRect()
            const diaCenterX = diaRect.left + diaRect.width / 2
            const diaCenterY = diaRect.top + diaRect.height / 2

            // 计算鼠标位置相对于中心点的偏移
            const deltaX = evt.clientX - diaCenterX
            const deltaY = evt.clientY - diaCenterY

            // 计算最大可能移动距离
            const maxPossibleX = Math.max(diaCenterX, viewportWidth - diaCenterX)
            const maxPossibleY = Math.max(diaCenterY, viewportHeight - diaCenterY)

            // 计算移动比例
            const ratioX = Math.abs(deltaX) / maxPossibleX
            const ratioY = Math.abs(deltaY) / maxPossibleY

            // 计算身体和眼睛的移动距离
            const maxMoveBody = 15
            const bodyX = Math.sign(deltaX) * maxMoveBody * ratioX
            const bodyY = Math.sign(deltaY) * maxMoveBody * ratioY

            const maxMoveEyes = 25
            const eyesX = Math.sign(deltaX) * maxMoveEyes * ratioX
            const eyesY = Math.sign(deltaY) * maxMoveEyes * ratioY

            // 应用变换
            diaBody.style.transform = `translate(${bodyX}px, ${bodyY}px)`

            const relativeX = eyesX - bodyX
            const relativeY = eyesY - bodyY
            leftEye.style.transform = `translate(${relativeX}px, ${relativeY}px)`
            rightEye.style.transform = `translate(${relativeX}px, ${relativeY}px)`

            // 设置定时器，3秒后重置位置
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

    // 处理输入框语音识别
    handleInputVoice() {
      this.isInputListening = !this.isInputListening
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

        const response = await botAiVoicepath(formData)

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

    // 加载历史聊天记录
    async loadChatHistory() {
      if (this.isLoadingHistory) return

      this.isLoadingHistory = true
      try {
        const response = await botAiHistory(this.userId)
        const history = response

        // 输出原始历史记录数据
        console.log('原始历史记录数据:', history)

        // 转换历史记录格式，使用 createTime 作为时间戳
        this.messages = history.map(msg => {
          const convertedMsg = {
            type: msg.type,
            text: msg.content,
            timestamp: msg.createTime ? new Date(msg.createTime).getTime() :
                     (typeof msg.timestamp === 'number' ? msg.timestamp : new Date().getTime())
          }
          return convertedMsg
        })
      } catch (error) {
        console.error('加载聊天历史失败:', error)
      } finally {
        this.isLoadingHistory = false
      }
    },

    // 保存聊天消息到后端
    async saveChatMessage(message) {
      try {
        const messageData = {
          type: message.type,
          content: message.text,
          timestamp: typeof message.timestamp === 'number' ? message.timestamp : new Date().getTime(),
          userId: this.userId
        }

        const response = await botAiMessage(messageData)

        // 获取后端返回的数据
        const savedMessage = response
        if (savedMessage.create_time) {
          message.timestamp = new Date(savedMessage.create_time).getTime()
        }
      } catch (error) {
        console.error('保存消息失败:', error)
      }
    },

    // 将URL转换为Blob对象
    async urlToBlob(url) {
      const response = await fetch(url);
      const blob = await response.blob();
      return blob;
    },

    // 发送消息
    async sendMessage() {
      if (!this.userInput.trim() && !this.previewImage) return;

      const timestamp = new Date().getTime();
      let messageText = this.userInput.trim();
      
      // 立即创建机器人消息对象
      let botMessage = {
        type: 'bot',
        text: '正在思考...',
        timestamp: new Date().getTime()
      };
      
      const formData = new FormData()
      formData.append('prompt', messageText)

      // 保存当前的输入内容和图片数据
      const currentInput = messageText;
      const currentImageBlob = this.imageBlob;
      const currentPreviewImage = this.previewImage;
      
      try {
        // 如果有图片，处理图片消息
        if (currentImageBlob) {
          messageText = currentInput ? 
            `${currentInput}\n<img src="${currentPreviewImage}" style="max-width: 150px; max-height: 150px;">` :
            `<img src="${currentPreviewImage}" style="max-width: 150px; max-height: 150px;">`;
        }

        // 创建用户消息对象
        const userMessage = {
          type: 'user',
          text: messageText,
          timestamp: timestamp
        };

        // 立即添加用户消息和机器人消息到列表
        this.messages.push(userMessage);
        this.messages.push(botMessage);
        
        // 立即滚动到底部并等待动画完成
        await this.scrollToBottom();

        // 保存用户消息
        await this.saveChatMessage(userMessage);

        // 清空输入框和图片数据
        this.userInput = '';
        this.previewImage = null;
        this.imageBlob = null;

        // 如果有图片，添加到请求中
        if (currentImageBlob) {
          formData.append('file', currentImageBlob, 'image.jpg');
        }

        // 发送请求到AI服务器
        const response = await fetch('http://192.168.1.153:8081/ai/chatVLStream', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullMessage = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // 更新最终消息
            botMessage.text = this.formatMessageWithTypingEffect(fullMessage);
            await this.saveChatMessage(botMessage);
            await this.scrollToBottom();
            break;
          }

          // 处理每个数据块
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.trim()) continue;
            
            const jsonStr = line.replace(/^data:\s*/, '').trim();
            if (jsonStr === '[DONE]') continue;

            try {
              const jsonData = JSON.parse(jsonStr);
              if (jsonData && typeof jsonData.response === 'string') {
                fullMessage += jsonData.response;
                botMessage.text = this.formatMessageWithTypingEffect(fullMessage);
                await this.scrollToBottom();
              }
            } catch (e) {
              console.log('处理数据时出错:', e);
              continue;
            }
          }
        }

      } catch (error) {
        console.error('发送消息失败:', error);
        if (botMessage) {
          botMessage.text = error.message || '发送失败，请重试';
          await this.scrollToBottom();
        }
        this.$message.error(error.message || '发送失败，请重试');
      }
    },

    // 异步滚动到底部方法
    async scrollToBottom() {
      return new Promise(resolve => {
        this.$nextTick(() => {
          if (this.$refs.messagesContainer) {
            const container = this.$refs.messagesContainer;
            // 创建滚动动画
            const scrollAnimation = container.animate([
              { scrollTop: container.scrollTop },
              { scrollTop: container.scrollHeight }
            ], {
              duration: 300,
              easing: 'ease-out'
            });
            
            scrollAnimation.onfinish = () => {
              container.scrollTop = container.scrollHeight;
              resolve();
            };
          } else {
            resolve();
          }
        });
      });
    },

    // 调整文本框高度
    adjustTextareaHeight(e) {
      const textarea = e.target

      textarea.style.height = '24px'
      const scrollHeight = textarea.scrollHeight

      // 如果文本框为空，重置高度
      if (!textarea.value.trim()) {
        textarea.style.height = '24px'
        return
      }

      // 设置文本框高度，最大100px
      textarea.style.height = Math.min(scrollHeight, 100) + 'px'

      // 如果内容超出100px，处理滚动位置
      if (scrollHeight > 100) {
        const cursorPosition = textarea.selectionStart
        const textBeforeCursor = textarea.value.substring(0, cursorPosition)
        
        // 创建临时文本框计算光标位置
        const dummyElement = document.createElement('textarea')
        dummyElement.style.cssText = window.getComputedStyle(textarea).cssText
        dummyElement.style.height = 'auto'
        dummyElement.style.position = 'absolute'
        dummyElement.style.visibility = 'hidden'
        dummyElement.value = textBeforeCursor
        document.body.appendChild(dummyElement)

        const cursorOffset = dummyElement.scrollHeight
        document.body.removeChild(dummyElement)

        // 调整滚动位置
        const scrollOffset = Math.max(0, cursorOffset - 90)
        textarea.scrollTop = scrollOffset
      }
    },

    // 处理回车键按下事件
    handleEnterPress(e) {
      if (e.shiftKey) {
        // Shift+Enter 插入换行
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
        // 直接回车发送消息
        e.preventDefault()
        this.sendMessage()
      }
    },

    // 处理聊天窗口语音按钮点击
    handleChatVoiceClick() {
      this.handleVoiceRecognition(true)
    },

    // 处理主界面语音按钮点击
    handleVoiceClick() {
      this.handleVoiceRecognition(false)
    },

    // 切换聊天窗口显示状态
    toggleChat() {
      this.showChat = !this.showChat;
      this.userInput = '';

      if (this.showChat) {
        // 打开聊天窗口时滚动到底部
        this.scrollToBottom();
      }

      if (!this.showChat) {
        // 隐藏聊天窗口时恢复机器人显示
        const diaBody = document.getElementById('Aurora-Dia--body')
        const platform = document.querySelector('.Aurora-Dia--platform')
        const voiceBtn = document.querySelector('.voice-btn')

        if (diaBody) diaBody.style.display = ''
        if (platform) platform.style.display = ''
        if (voiceBtn) voiceBtn.style.display = ''
      }
    },

    // 处理机器人点击事件
    handleDiaClick() {
      this.showChat = true;
      this.userInput = '';

      // 隐藏机器人相关元素
      const diaBody = document.getElementById('Aurora-Dia--body')
      const platform = document.querySelector('.Aurora-Dia--platform')
      const voiceBtn = document.querySelector('.voice-btn')

      if (diaBody) diaBody.style.display = 'none'
      if (platform) platform.style.display = 'none'
      if (voiceBtn) voiceBtn.style.display = 'none'

      // 点击打开聊天窗口时滚动到底部
      this.scrollToBottom();
    },

    // 判断是否显示时间戳
    shouldShowTimestamp(currentMsg, index) {
      if (index === 0) return true;

      const prevMsg = this.messagesWithTimestamp[index - 1];
      const currentTime = currentMsg.timestamp;
      const prevTime = prevMsg.timestamp;

      // 如果消息间隔超过5分钟（300000毫秒），显示时间戳
      return currentTime - prevTime > 300000;
    },

    // 格式化消息时间显示
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
    },

    // 修改图片上传处理方法，立即上传并获取URL
    async handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // 检查文件类型和大小
      if (!file.type.startsWith('image/')) {
        this.$message.error('请上传图片文件');
        return;
      }
      
      // 限制文件大小为 5MB
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.$message.error('图片大小不能超过 5MB');
        return;
      }

      try {
        // 压缩图片
        const { blob, previewUrl } = await this.compressImage(file);

        // 上传图片并获取URL
        const formData = new FormData();
        formData.append('file', blob, 'image.jpg');

        const response = await fetch(process.env.VUE_APP_BASE_API + "/common/upload", {
          method: 'POST',
          body: formData,
          headers: {
        Authorization: "Bearer " + getToken(),
      },
        });

        if (!response.ok) {
          throw new Error('上传图片失败');
        }

        const result = await response.json();
        if (!result.url) {
          throw new Error('上传成功但未返回图片地址');
        }

        // 存储图片URL和Blob数据
        this.previewImage = result.url; // 使用服务器返回的URL
        this.imageBlob = blob;
        
        // 清空文件输入框，允许重复上传相同文件
        this.$refs.fileInput.value = '';

      } catch (error) {
        console.error('上传图片失败:', error);
      }
    },

    // 取消图片上传
    cancelImageUpload() {
      this.previewImage = null;
      this.$refs.fileInput.value = '';
    },

    // 添加图片压缩方法
    compressImage(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 设置正方形尺寸，取较短边
            const size = 800; // 设置固定大小
            
            // 创建正方形画布
            canvas.width = size;
            canvas.height = size;
            
            // 计算裁剪区域
            let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
            if (img.width > img.height) {
              sx = (img.width - img.height) / 2;
              sWidth = img.height;
            } else {
              sy = (img.height - img.width) / 2;
              sHeight = img.width;
            }
            
            // 填充白色背景
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, size, size);
            
            // 绘制图片
            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size);
            
            // 转换为 Blob
            canvas.toBlob((blob) => {
              // 同时返回 Blob 和预览 URL
              resolve({
                blob: blob,
                previewUrl: URL.createObjectURL(blob)
              });
            }, 'image/jpeg', 0.8); // 使用 JPEG 格式，质量 0.8
          };
        };
      });
    },

    // 切换小人显示/隐藏
    toggleBot() {
      this.showBot = !this.showBot;
    },
    
    // 切换左右侧显示
    toggleSide() {
      const botContainer = document.getElementById('bot-container');
      const diaBody = document.getElementById('Aurora-Dia--body');
      
      if (!botContainer || !diaBody) return;
      
      botContainer.classList.add('moving');
      
      // 计算当前位置和目标位置
      const currentLeft = this.isLeftSide ? 20 : window.innerWidth - botContainer.offsetWidth - 20;
      const targetLeft = this.isLeftSide ? window.innerWidth - botContainer.offsetWidth - 20 : 20;
      
      // 修改关键帧，让机器人在底部移动
      const keyframes = [
        { 
          left: `${currentLeft}px`,
          bottom: '0px'
        },
        {
          left: `${(currentLeft + targetLeft) / 2}px`,
          bottom: '30px' // 降低抛物线的高度
        },
        {
          left: `${targetLeft}px`,
          bottom: '0px'
        }
      ];
      
      const options = {
        duration: 600,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards'
      };
      
      botContainer.animate(keyframes, options).onfinish = () => {
        this.isLeftSide = !this.isLeftSide;
        botContainer.classList.remove('moving');
      };
    },

    // 添加文字动画处理方法
    wrapTextWithAnimation(text, index = 0) {
      return `<div class="ai-paragraph" style="animation-delay: ${index * 100}ms">${text}</div>`;
    },

    // 修改格式化打字机效果的方法,移除特殊标签处理
    formatMessageWithTypingEffect(text) {
      // 将文本按段落分割并直接返回
      const paragraphs = text.split('\n').filter(p => p.trim())
      return paragraphs.map(paragraph => {
        return `<div class="ai-paragraph">${paragraph}</div>`
      }).join('')
    },

    // 初始化 AlertWebSocket
    initAlertWebSocket() {
      if (wsConnected || this.isLoginPage) {
        return;
      }

      try {
        // 如果是热重载，确保旧连接被清理
        if (module.hot && alertWsInstance) {
          this.disconnectWebSocket();
        }

        alertWsInstance = new AlertWebSocket();
        
        const componentInstance = this;
        
        // 重写警告处理方法
        alertWsInstance.handleSeriousAlert = function(alert) {
          // 立即更新状态
          componentInstance.isShowingAlert = true;
          
          // 立即开始颜色过渡
          const newTheme = {
            gradient: {
              color_1: '#CD0000',
              color_2: '#FF4444',
              color_3: '#FF6666'
            } 
          };
          componentInstance.updateThemeWithTransition(newTheme);
          
          const tipsElement = document.getElementById('Aurora-Dia--tips');
          if (tipsElement) {
            tipsElement.innerHTML = `⚠️ 严重警告：${alert.alertMessage}`;
            
            setTimeout(() => {
              const defaultTheme = {
                gradient: {
                  color_1: '#8f41e9',
                  color_2: '#578cef',
                  color_3: '#7aa2f7'
                }
              };
              componentInstance.updateThemeWithTransition(defaultTheme);
              
              setTimeout(() => {
                componentInstance.isShowingAlert = false;
                tipsElement.innerHTML = '你好呀～';
              }, 100);
            }, 15000);
          }
          
          componentInstance.$notify({
            title: '严重警告',
            message: alert.alertMessage,
            type: 'error',
            showClose: false,
            duration: 15000,
            position: 'top-right'
          });
        };
        
        alertWsInstance.handleWarning = function(alert) {
          componentInstance.isShowingAlert = true;
          
          const newTheme = {
            gradient: {
              color_1: '#FF8C00',
              color_2: '#FFA500',
              color_3: '#FFD700'
            }
          };
          componentInstance.updateThemeWithTransition(newTheme);
          
          const tipsElement = document.getElementById('Aurora-Dia--tips');
          if (tipsElement) {
            tipsElement.innerHTML = `⚠️ 预警提示：${alert.alertMessage}`;
            
            setTimeout(() => {
              const defaultTheme = {
                gradient: {
                  color_1: '#8f41e9',
                  color_2: '#578cef',
                  color_3: '#7aa2f7'
                }
              };
              componentInstance.updateThemeWithTransition(defaultTheme);
              
              setTimeout(() => {
                componentInstance.isShowingAlert = false;
                tipsElement.innerHTML = '你好呀～';
              }, 100);
            }, 15000);
          }
          
          componentInstance.$notify({
            title: '预警提示',
            message: alert.alertMessage,
            type: 'warning',
            showClose: false,
            duration: 15000
          });
        };

        // 添加连接状态监听
        const originalWsOnopen = alertWsInstance.ws.onopen;
        alertWsInstance.ws.onopen = function(event) {
          wsConnected = true;
          componentInstance.wsInitialized = true;
          if (originalWsOnopen) {
            originalWsOnopen.call(this, event);
          }
        };

        const originalWsOnclose = alertWsInstance.ws.onclose;
        alertWsInstance.ws.onclose = function(event) {
          wsConnected = false;
          componentInstance.wsInitialized = false;
          if (originalWsOnclose) {
            originalWsOnclose.call(this, event);
          }
        };
        
        this.alertWs = alertWsInstance;
        
      } catch (error) {
        console.error('初始化 AlertWebSocket 失败:', error);
        this.disconnectWebSocket();
      }
    },

    // 更新主题过渡方法
    async updateThemeWithTransition(newTheme) {
      const startColors = {
        color_1: this.themeTransition.color_1,
        color_2: this.themeTransition.color_2,
        color_3: this.themeTransition.color_3
      }
      
      const endColors = {
        color_1: newTheme.gradient.color_1,
        color_2: newTheme.gradient.color_2,
        color_3: newTheme.gradient.color_3
      }

      const startTime = performance.now()
      const duration = 3000 // 改为3秒的颜色过渡时间

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // 使用更快的缓动函数
        const easing = t => 1 - Math.pow(1 - t, 3)

        // 计算当前颜色
        Object.keys(startColors).forEach(key => {
          const start = this.hexToRgb(startColors[key])
          const end = this.hexToRgb(endColors[key])
          const current = {
            r: Math.round(start.r + (end.r - start.r) * easing(progress)),
            g: Math.round(start.g + (end.g - start.g) * easing(progress)),
            b: Math.round(start.b + (end.b - start.b) * easing(progress))
          }
          this.themeTransition[key] = this.rgbToHex(current)
        })

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    },

    // 添加颜色转换辅助方法
    hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    },

    rgbToHex(rgb) {
      return '#' + ['r', 'g', 'b'].map(key => {
        const hex = rgb[key].toString(16)
        return hex.length === 1 ? '0' + hex : hex
      }).join('')
    },
  }
}
</script>

<style lang="scss" scoped>
#bot-container {
  position: fixed;
  right: 20px;
  bottom: 0; // 确保容器固定在底部
  z-index: 2000;
  width: 70px;
  height: 60px;
  box-sizing: content-box;
  pointer-events: auto;
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  &.left-side {
    left: 20px;
    right: auto;
    
    .chat-window {
      left: 20px;
      right: auto;
      transform: translateX(0);
    }
    
    #Aurora-Dia--tips-wrapper {
      left: 99px;
      right: auto;
      transform: translateX(0);
    }
  }

  &.moving {
    transition: none;
    pointer-events: none;
    
    .chat-window,
    #Aurora-Dia--tips-wrapper {
      opacity: 0;
      pointer-events: none;
    }
    
    #Aurora-Dia--body {
      animation: bounce-rotate 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
  }
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
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 2000; // 提高 z-index
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
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--aurora-dia--linear-gradient);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0;
  pointer-events: none;
  z-index: 200;

  &.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
    pointer-events: auto;
  }

  &.listening {
    background: #ff4444;
    animation: pulse-center 1s infinite;
  }
}

@keyframes pulse-center {
  0% {
    transform: translateX(-50%) scale(1);
  }
  50% {
    transform: translateX(-50%) scale(1.05);
  }
  100% {
    transform: translateX(-50%) scale(1);
  }
}

.microphone-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(.svg-icon) {
    width: 16px;
    height: 16px;
    color: white;
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
  overflow: visible;
  z-index: 2000; // 提高 z-index
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.chat-header {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(2px);
  position: relative;
  z-index: 2;
  background: white;

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

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    background: none;
    color: #999;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
    
    &:hover {
      background-color: #f5f5f5;
      color: #666;
    }
  }

  .switch-side-btn {
    &:hover {
      color: #7aa2f7;
    }
  }

  .toggle-bot-btn {
    &:hover {
      color: #7aa2f7;
    }
  }
}
.message-text {
  :deep(.ai-paragraph) {
    display: block;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.chat-messages {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background: white;
  z-index: 1; // 添加 z-index
  position: relative; // 添加相对定位

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
    position: relative; // 添加相对定位
    z-index: 1; // 确保消息气泡可见

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
  position: relative;
  z-index: 2;

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
    display: flex;
    align-items: center;
    justify-content: center;

    :deep(.svg-icon) {
      width: 16px;
      height: 16px;
      color: #666;
      transition: all 0.3s;
    }
  }

  &:hover {
    background-color: #f5f5f5;
  }

  &.listening {
    background-color: #ff4444;
    .microphone-icon :deep(.svg-icon) {
      color: white;
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

.upload-btn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  color: #666;
  
  &:hover {
    background-color: #f5f5f5;
    color: #7aa2f7;
  }

  &.has-image:hover {
    .image-actions {
      opacity: 1;
    }
  }

  .preview-thumbnail {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-actions {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;

      .delete-btn {
        color: white;
        font-size: 16px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }
  
  .file-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
}

// 调整按钮组样式
.button-group {
  display: flex;
  gap: 4px;
  align-self: center;
}

.image-preview {
  padding: 8px;
  border-top: 1px solid #eee;
  
  .preview-wrapper {
    position: relative;
    display: inline-block;
    width: 100px;
    height: 100px;
    border-radius: 8px;
    overflow: hidden;
    background-color: #f5f5f5;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
      display: block;
    }
    
    .preview-actions {
      position: absolute;
      top: 4px;
      right: 4px;
      
      .cancel-btn {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.5);
        border: none;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: white;
        
        &:hover {
          background: rgba(0, 0, 0, 0.7);
        }
      }
    }
  }
}

// 修改消息中图片的样式
:deep(.message-text img) {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
  margin: 4px 0;
}

// 添加左侧显示样式
#bot-container.left-side {
  left: 20px;
  right: auto;
  
  .chat-window {
    left: 20px;
    right: auto;
  }
  
  #Aurora-Dia--tips-wrapper {
    left: 99px;
    right: auto;
  }
}

// 添加按钮组容器样式
.bot-action-buttons {
  position: absolute;
  top: -67px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 200;
  width: 130px; // 调整宽度以适应按钮布局
  margin: 0 auto; // 居中整个按钮组
}

// 修改按钮样式
.voice-btn,
.action-btn {
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--aurora-dia--linear-gradient);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0;
  transform: translateY(10px);
  pointer-events: none;
  color: white;
  z-index: 200;

  &.show {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  &:hover {
    filter: brightness(1.1);
  }
}

.toggle-bot-btn, .switch-side-btn {
  &.show {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
}

// 分别设置三个按钮的位置
.voice-btn {
  top: -67px;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  
  &.show {
    transform: translateX(-50%) translateY(0);
  }
}

.switch-side-btn {
  top: -55px;
  left: -15px;
  transform: translateY(10px);
  
  &.show {
    transform: translateY(0);
  }
}

.toggle-bot-btn {
  top: -55px;
  right: -15px;
  transform: translateY(10px);
  
  &.show {
    transform: translateY(0);
  }
}

@keyframes bounce-rotate {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(0.8);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(1em);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

