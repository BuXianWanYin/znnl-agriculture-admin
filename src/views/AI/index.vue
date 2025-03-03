<template>
  <div class="ai-detection-container" :class="{ 'dark-mode': isDarkMode }">
    <div class="left-panel">
      <!-- 顶部统计卡片 -->
      <div class="stats-cards">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="el-icon-picture"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statsData.totalDetections }}</div>
                <div class="stat-label">总检测次数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card">
              <div class="stat-icon success">
                <i class="el-icon-check"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statsData.accuracy }}</div>
                <div class="stat-label">识别准确率</div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card">
              <div class="stat-icon warning">
                <i class="el-icon-time"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statsData.avgProcessTime }}</div>
                <div class="stat-label">平均处理时间</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 症状描述区域增强 -->
      <div class="description-area">
        <div class="section-header">
          <div class="section-title">
            <i class="el-icon-edit"></i>
            症状描述
          </div>
          <el-button-group>
            <el-button size="mini" icon="el-icon-mic" @click="startVoiceInput">
              语音输入
            </el-button>
            <el-button size="mini" icon="el-icon-delete" @click="clearPrompt">
              清空
            </el-button>
          </el-button-group>
        </div>
        <el-input
          type="textarea"
          v-model="prompt"
          :rows="4"
          placeholder="请描述您观察到的病虫害症状(如:叶片发黄、鱼类异常等)"
        ></el-input>
        
        <!-- 快速选择常见症状 -->
        <div class="quick-symptoms">
          <el-tag 
            v-for="symptom in commonSymptoms"
            :key="symptom"
            size="small"
            @click="addSymptom(symptom)"
            class="clickable-tag"
          >
            {{ symptom }}
          </el-tag>
        </div>

        <!-- AI 智能助手提示 -->
        <div class="ai-assistant" v-if="aiSuggestions.length">
          <div class="suggestion-title">
            <i class="el-icon-magic-stick"></i>
            AI 建议描述：
          </div>
          <div class="suggestions-list">
            <el-tag
              v-for="(suggestion, index) in aiSuggestions"
              :key="index"
              size="small"
              effect="plain"
              class="suggestion-tag"
              @click="useAiSuggestion(suggestion)"
            >
              {{ suggestion }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 图片上传区域增强 -->
      <div class="upload-section">
        <div class="section-header">
          <div class="section-title">
            <i class="el-icon-upload"></i>
            图片上传
          </div>
          <div class="upload-actions">
            <el-button-group>
              <el-button size="mini" icon="el-icon-camera-solid" @click="openCamera">
                拍照
              </el-button>
              <el-button size="mini" icon="el-icon-folder" @click="$refs.fileInput.click()">
                本地上传
              </el-button>
            </el-button-group>
          </div>
        </div>
        <div class="image-upload">
          <input 
            type="file"
            @change="handleImageUpload"
            accept="image/*"
            multiple
            ref="fileInput"
            style="display: none"
          />
          <div class="upload-content" @click="$refs.fileInput.click()">
            <i class="el-icon-upload"></i>
            <div class="upload-text">点击上传图片</div>
            <div class="upload-tips">
              <p>支持多图片上传</p>
              <p>建议图片尺寸不小于 800x600</p>
              <p>支持 JPG、PNG 格式</p>
            </div>
          </div>
        </div>

        <!-- 上传进度指示器 -->
        <div class="upload-progress" v-if="isUploading">
          <el-progress 
            :percentage="uploadProgress"
            :status="uploadStatus"
            :stroke-width="5"
          ></el-progress>
          <div class="progress-info">{{ uploadStatusText }}</div>
        </div>
      </div>

      <!-- 检测设置增强 -->
      <div class="detection-settings">
        <div class="section-header">
          <div class="section-title">
            <i class="el-icon-setting"></i>
            检测设置
          </div>
          <el-button size="mini" @click="showAdvancedSettings">
            高级设置
            <i class="el-icon-arrow-right"></i>
          </el-button>
        </div>
        <el-form :model="settings" label-width="100px" size="small">
          <el-form-item label="检测模式">
            <el-select v-model="settings.mode" style="width: 100%">
              <el-option label="综合检测" value="all"></el-option>
              <el-option label="植物病害" value="plant"></el-option>
              <el-option label="鱼类疾病" value="fish"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="图像质量">
            <el-slider 
              v-model="settings.quality" 
              :min="1" 
              :max="10"
              :format-tooltip="formatQuality"
              show-stops
            ></el-slider>
          </el-form-item>

          <el-form-item label="检测精度">
            <el-radio-group v-model="settings.precision" size="small">
              <el-radio-button label="fast">
                <i class="el-icon-lightning"></i> 快速
              </el-radio-button>
              <el-radio-button label="standard">
                <i class="el-icon-check"></i> 标准
              </el-radio-button>
              <el-radio-button label="high">
                <i class="el-icon-star"></i> 高精度
              </el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="高级设置">
            <div class="advanced-settings">
              <el-checkbox v-model="settings.enableMark">启用病害标注</el-checkbox>
              <el-checkbox v-model="settings.saveHistory">保存检测历史</el-checkbox>
              <el-checkbox v-model="settings.autoReport">自动生成报告</el-checkbox>
            </div>
          </el-form-item>
        </el-form>

        <!-- 新增模型选择 -->
        <div class="model-selection">
          <div class="model-title">选择识别模型：</div>
          <div class="model-cards">
            <div 
              v-for="model in aiModels"
              :key="model.id"
              class="model-card"
              :class="{ active: selectedModel === model.id }"
              @click="selectModel(model.id)"
            >
              <div class="model-icon">
                <i :class="model.icon"></i>
              </div>
              <div class="model-info">
                <div class="model-name">{{ model.name }}</div>
                <div class="model-desc">{{ model.description }}</div>
              </div>
              <el-tag size="mini" :type="model.tagType">{{ model.status }}</el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮增强 -->
      <div class="action-buttons">
        <el-button-group class="main-actions">
          <el-button 
            type="primary" 
            @click="startDetection"
            :loading="isDetecting"
            class="start-button"
          >
            <i class="el-icon-video-play"></i>
            {{ isDetecting ? '识别中...' : '开始识别' }}
            <span class="shortcut-tip">Ctrl + Enter</span>
          </el-button>
          <el-button 
            @click="exportReport"
            :disabled="!results.length"
          >
            <i class="el-icon-document"></i>
            导出报告
          </el-button>
        </el-button-group>
        
        <!-- 快捷操作栏 -->
        <div class="quick-actions">
          <el-tooltip content="查看历史记录" placement="top">
            <el-button 
              icon="el-icon-time" 
              circle
              @click="toggleHistory"
            ></el-button>
          </el-tooltip>
          <el-tooltip content="帮助指南" placement="top">
            <el-button 
              icon="el-icon-question" 
              circle
              @click="showHelp"
            ></el-button>
          </el-tooltip>
        </div>
      </div>
    </div>

    <div class="right-panel">
      <!-- 图片展示区域 -->
      <div class="image-display-section">
        <div class="preview-tools">
          <el-button-group>
            <el-button size="mini" icon="el-icon-picture"></el-button>
            <el-button size="mini" icon="el-icon-menu"></el-button>
          </el-button-group>
        </div>

        <!-- 主图片展示区 -->
        <div class="main-preview-area">
          <div v-if="currentImage" class="image-preview" :class="{ 'detecting': isDetecting }">
            <div v-if="isDetecting" class="loading-overlay">
              <div class="loading-container">
                <div class="ai-analysis-animation">
                  <div class="scan-container">
                    <div class="scan-beam"></div>
                    <div class="analysis-circles">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <div class="analysis-grid">
                      <div v-for="n in 9" :key="n" class="grid-cell"></div>
                    </div>
                    <div class="analysis-dots">
                      <span v-for="n in 5" :key="n"></span>
                    </div>
                  </div>
                </div>
                
                <div class="loading-status">
                  <div class="status-text">AI 智能分析中</div>
                  <div class="processing-time">{{ processingTime.toFixed(1) }}s</div>
                  <div class="progress-bar">
                    <div class="progress-inner"></div>
                  </div>
                </div>
              </div>
            </div>
            <img :src="currentImage" class="preview-image" />
            <div class="delete-overlay" v-if="!isDetecting">
              <el-button
                type="danger"
                circle
                icon="el-icon-delete"
                @click="removeImage"
              ></el-button>
            </div>
          </div>
          <div v-else class="empty-preview">
            <i class="el-icon-picture-outline"></i>
            <p>暂无图片</p>
          </div>
        </div>
      </div>

      <!-- 识别结果区域 -->
      <div class="recognition-section">
        <div class="section-header">
          <div class="section-title">
            <i class="el-icon-data-analysis"></i>
            识别结果
          </div>
          <el-radio-group v-model="resultView" size="mini">
            <el-radio-button label="summary">概要</el-radio-button>
            <el-radio-button label="detail">详细</el-radio-button>
          </el-radio-group>
        </div>

        <div class="result-content" v-if="!results.length">
          <el-empty description="暂无识别结果">
            <template #description>
              <p>上传图片并点击"开始识别"开始分析</p>
            </template>
          </el-empty>
        </div>

        <div v-else class="result-wrapper">
          <!-- 根据视图模式切换显示内容 -->
          <template v-if="resultView === 'summary'">
            <div class="result-summary">
              <div class="summary-header">
                <div class="diagnosis-result">
                  <i class="el-icon-warning-outline"></i>
                  <span class="diagnosis-text">{{ detailedResults[0].title }}</span>
                </div>
                <div class="diagnosis-status">
                  <el-tag type="warning" effect="dark">{{ diagnosisConfidence }}% 可信度</el-tag>
                </div>
              </div>
              
              <!-- 快速概览卡片 -->
              <el-row :gutter="20" class="summary-cards">
                <el-col :span="8">
                  <div class="summary-card">
                    <div class="card-title">
                      <i class="el-icon-document"></i>
                      症状概述
                    </div>
                    <div class="card-content">{{ detailedResults[0].symptoms }}</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="summary-card">
                    <div class="card-title">
                      <i class="el-icon-warning"></i>
                      主要原因
                    </div>
                    <div class="card-content">
                      <el-tag 
                        v-for="(cause, index) in detailedResults[0].causes" 
                        :key="index"
                        size="small"
                        class="cause-tag">
                        {{ cause }}
                      </el-tag>
                    </div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="summary-card">
                    <div class="card-title">
                      <i class="el-icon-s-operation"></i>
                      建议措施
                    </div>
                    <div class="card-content">
                      <div 
                        v-for="(action, index) in detailedResults[0].actions" 
                        :key="index"
                        class="action-item">
                        {{ action.content }}
                      </div>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>

            <!-- 快速操作按钮 -->
            <div class="summary-actions">
              <el-button-group>
                <el-button type="primary" icon="el-icon-document">
                  导出报告
                </el-button>
                <el-button type="success" icon="el-icon-share">
                  分享结果
                </el-button>
                <el-button icon="el-icon-more" @click="resultView = 'detail'">
                  查看详情
                </el-button>
              </el-button-group>
            </div>
          </template>

          <!-- 原有的详细视图内容 -->
          <template v-else>
            <!-- 诊断概要 -->
            <div class="diagnosis-summary">
              <div class="confidence-score">
                <el-progress type="dashboard" 
                  :percentage="diagnosisConfidence"
                  :color="confidenceColors">
                </el-progress>
                <div class="score-label">诊断可信度</div>
              </div>
              
              <div class="quick-diagnosis">
                <h3>快速诊断</h3>
                <div class="diagnosis-tags">
                  <el-tag 
                    v-for="(tag, index) in diagnosisTags" 
                    :key="index"
                    :type="tag.type"
                    class="diagnosis-tag"
                  >
                    {{ tag.name }}
                  </el-tag>
                  <el-tag 
                    v-show="showUrgencyTag" 
                    type="danger" 
                    effect="dark"
                    class="diagnosis-tag urgency-tag"
                  >
                    需要处理
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 详细分析结果 -->
            <el-collapse v-model="activeResults">
              <el-collapse-item 
                v-for="(result, index) in detailedResults" 
                :key="index"
                :title="result.title"
                :name="index">
                <div class="result-detail">
                  <div class="detail-item">
                    <h4>症状描述</h4>
                    <p>{{ result.symptoms }}</p>
                  </div>
                  
                  <div class="detail-item">
                    <h4>可能原因</h4>
                    <el-steps :active="2" simple>
                      <el-step 
                        v-for="(cause, idx) in result.causes"
                        :key="idx"
                        :title="cause">
                      </el-step>
                    </el-steps>
                  </div>

                  <div class="detail-item">
                    <h4>建议措施</h4>
                    <el-timeline>
                      <el-timeline-item
                        v-for="(action, idx) in result.actions"
                        :key="idx"
                        :type="action.type"
                        :color="action.color">
                        {{ action.content }}
                      </el-timeline-item>
                    </el-timeline>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>

            <!-- 相似案例 -->
            <div class="similar-cases">
              <div class="section-title">相似案例</div>
              <el-carousel :interval="4000" type="card" height="200px">
                <el-carousel-item v-for="item in similarCases" :key="item.id">
                  <el-card shadow="hover">
                    <img :src="item.image" class="case-image">
                    <div class="case-info">
                      <h4>{{ item.title }}</h4>
                      <p>{{ item.description }}</p>
                    </div>
                  </el-card>
                </el-carousel-item>
              </el-carousel>
            </div>

            <!-- 专家建议 -->
            <div class="expert-advice">
              <div class="section-title">专家建议</div>
              <el-alert
                v-for="(advice, index) in expertAdvice"
                :key="index"
                :title="advice.title"
                :type="advice.type"
                :description="advice.content"
                show-icon>
              </el-alert>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 历史记录抽屉 -->
    <el-drawer
      title="检测历史"
      :visible.sync="showHistory"
      direction="rtl"
      size="50%"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(history, index) in detectionHistory"
          :key="index"
          :timestamp="history.time"
          :type="history.status"
        >
          <el-card>
            <h4>{{ history.name }}</h4>
            <p>诊断结果：{{ history.diagnosis }}</p>
            <p>处理状态：{{ history.treatment }}</p>
            <el-button size="mini" @click="loadHistoryResult(history)">
              查看详情
            </el-button>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-drawer>

    <!-- 图片裁剪对话框 -->
    <el-dialog
      title="图片裁剪"
      :visible.sync="showCropper"
      width="50%"
    >
      <vue-cropper
        ref="cropper"
        :src="cropperImage"
        :aspect-ratio="1"
      ></vue-cropper>
      <span slot="footer">
        <el-button @click="showCropper = false">取消</el-button>
        <el-button type="primary" @click="confirmCrop">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import VueCropper from 'vue-cropper'
import { saveAs } from 'file-saver'
import html2pdf from 'html2pdf.js'
import {botAiIdentify} from '@/api/bot/botai'

export default {
  name: 'AiDetection',
  components: {
    VueCropper
  },
  data() {
    return {
      prompt: '',
      uploadedImages: [],
      currentImage: null,
      processedImage: null,
      settings: {
        mode: 'all',
        quality: 8,
        precision: 'standard',
        enableMark: true,
        saveHistory: true,
        autoReport: false
      },
      isDetecting: false,
      viewMode: 'single',
      isDarkMode: false,
      showHistory: false,
      showCropper: false,
      cropperImage: '',
      currentCropIndex: -1,
      diseaseMarks: [],
      results: [],
      detectionHistory: [],
      commonSymptoms: [
        '叶片发黄',
        '叶片卷曲',
        '茎秆腐烂',
        '根部变黑',
        '鱼类浮头',
        '鱼体发白',
        '生长缓慢',
        '食欲不振'
      ],
      currentImageIndex: -1,
      precisions: [
        { label: '快速检测', value: 'fast' },
        { label: '标准检测', value: 'standard' },
        { label: '高精度', value: 'high' }
      ],
      currentPrecision: 'standard',
      totalScans: 0,
      successRate: 0,
      avgProcessTime: 0,
      isUploading: false,
      uploadProgress: 0,
      uploadStatus: 'success',
      uploadStatusText: '',
      selectedModel: 'general',
      aiModels: [
        {
          id: 'general',
          name: '通用模型',
          description: '适用于大多数场景',
          icon: 'el-icon-cpu',
          status: '推荐',
          tagType: 'success'
        },
        {
          id: 'professional',
          name: '专业模型',
          description: '更高精度，处理更慢',
          icon: 'el-icon-magic-stick',
          status: '专业版',
          tagType: 'warning'
        }
      ],
      aiSuggestions: [],
      resultView: 'summary',
      diagnosisConfidence: 0,
      confidenceColors: [
        {color: '#f56c6c', percentage: 20},
        {color: '#e6a23c', percentage: 40},
        {color: '#5cb87a', percentage: 60},
        {color: '#1989fa', percentage: 80},
        {color: '#67c23a', percentage: 100}
      ],
      diagnosisTags: [],
      activeResults: [0],
      detailedResults: [],
      similarCases: [
        {
          id: 1,
          image: 'https://placeholder.com/300x200',
          title: '草鱼细菌性烂鳃病',
          description: '发病水温20-25℃,死亡率可达30%'
        },
        {
          id: 2,
          image: 'https://placeholder.com/300x200',
          title: '鲫鱼车轮虫病',
          description: '体表黏液增多,游动缓慢'
        },
        {
          id: 3,
          image: 'https://placeholder.com/300x200',
          title: '鲤鱼肠炎',
          description: '食欲不振,腹部膨大'
        },
        {
          id: 4,
          image: 'https://placeholder.com/300x200',
          title: '罗非鱼链球菌病',
          description: '眼球突出,体色发黑'
        }
      ],
      expertAdvice: [],
      chartInstance: null,
      processingTime: 0,
      processingTimer: null,
      // 统计数据
      statsData: {
        totalDetections: 1280,      // 总检测次数
        accuracy: '90%',            // 识别准确率
        avgProcessTime: '21.5s'      // 平均处理时间
      },
    }
  },
  computed: {
    showUrgencyTag() {
      return this.results && this.results.length > 0 && this.results[0].needTreatment;
    }
  },
  methods: {
    handleImageUpload(e) {
      const files = Array.from(e.target.files)
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      // 如果已经有图片，提示先删除现有图片
      if (this.uploadedImages.length > 0) {
        this.$message.warning('请先删除现有图片再上传新图片')
        e.target.value = '' // 清空input
        return
      }
      
      // 只处理第一张图片
      const file = files[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        this.$message.error(`${file.name} 不是有效的图片文件`)
        return
      }
      
      if (file.size > maxSize) {
        this.$message.error(`${file.name} 超过5MB限制`)
        return
      }

      // 压缩图片
      this.compressImage(file).then(compressedFile => {
        const reader = new FileReader()
        reader.onload = e => {
          this.uploadedImages = [{ // 直接替换数组，而不是push
            url: e.target.result,
            file: compressedFile
          }]
          this.currentImage = e.target.result
        }
        reader.readAsDataURL(compressedFile)
      })

      // 清空input值，允许重复选择同一文件
      e.target.value = ''
    },
    compressImage(file) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = e => {
          const img = new Image()
          img.src = e.target.result
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            
            // 计算压缩后的尺寸，最大宽度/高度为1200px
            let width = img.width
            let height = img.height
            const maxSize = 1200
            
            if (width > height && width > maxSize) {
              height = Math.round((height * maxSize) / width)
              width = maxSize
            } else if (height > maxSize) {
              width = Math.round((width * maxSize) / height)
              height = maxSize
            }
            
            canvas.width = width
            canvas.height = height
            
            // 绘制压缩后的图片
            ctx.drawImage(img, 0, 0, width, height)
            
            // 转换为文件
            canvas.toBlob(blob => {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            }, file.type, 0.8) // 0.8是压缩质量
          }
        }
      })
    },
    removeImage() {
      this.uploadedImages = []
      this.currentImage = null
    },
    async startDetection() {
      if (!this.prompt.trim()) {
        this.$message.warning('请输入症状描述')
        return
      }

      if (!this.uploadedImages.length) {
        this.$message.warning('请上传至少一张图片')
        return
      }

      this.isDetecting = true
      this.processingTime = 0
      
      this.processingTimer = setInterval(() => {
        this.processingTime = Number(this.processingTime.toFixed(1)) + 0.1
      }, 100)

      try {
        const formData = new FormData()
        formData.append('prompt', this.prompt.trim())
        
        this.uploadedImages.forEach((image, index) => {
          formData.append('file', image.file)
        })

        const response = await botAiIdentify(formData)

        console.log(response)
        
        // 转换感染程度
        const infectionLevelMap = {
          1: '轻度感染',
          2: '中度感染',
          3: '高度感染'
        }
        
        // 更新诊断结果
        this.results = [{
          name: response.quick_check.name,
          description: response.diagnosis.symptoms,
          confidence: response.diagnosis.confidence,
          causes: response.diagnosis.primary_causes.split('、').map(cause => cause.replace('。', '')),
          recommendations: response.diagnosis.recommended_measures
            .split(/[；,，、]/) // 支持分号、英文逗号和中文逗号
            .filter(item => item.trim()), // 过滤空字符串
          needTreatment: response.quick_check.urgency // 添加是否需要处理标志
        }]

        // 更新置信度和标签
        this.diagnosisConfidence = response.diagnosis.confidence
        this.diagnosisTags = [
          { 
            name: response.quick_check.name, 
            type: response.quick_check.urgency ? 'danger' : 'warning' 
          },
          { 
            name: `${infectionLevelMap[response.quick_check.infection_level] || '未知'}`, 
            type: 'warning' 
          }
        ]
        
        // 更新详细结果
        this.detailedResults = [{
          title: '主要病害诊断',
          symptoms: response.diagnosis.symptoms,
          causes: response.diagnosis.primary_causes.split('、').map(cause => cause.replace('。', '')),
          actions: response.diagnosis.recommended_measures.split('；').map(measure => ({
            content: measure,
            type: 'primary',
            color: '#409EFF'
          }))
        }]

        // 更新AI建议和专家建议
        if (response.suggestions) {
          // AI建议
          this.aiSuggestions = [
            response.suggestions.attention_items,
            response.suggestions.prevention_measures
          ].filter(Boolean)

          // 专家建议
          this.expertAdvice = [
            {
              title: '注意事项',
              type: 'warning',
              content: response.suggestions.attention_items
            },
            {
              title: '预防建议',
              type: 'success',
              content: response.suggestions.prevention_measures
            }
          ]
        }

        this.$message.success('识别完成')
      } catch (error) {
        console.error('识别失败:', error)
        this.$message.error('识别失败，请重试')
      } finally {
        if (this.processingTimer) {
          clearInterval(this.processingTimer)
          this.processingTimer = null
        }
        this.isDetecting = false
      }
    },
    getMarkStyle(mark) {
      return {
        left: mark.x + '%',
        top: mark.y + '%',
        width: mark.width + 'px',
        height: mark.height + 'px'
      }
    },
    getConfidenceStatus(confidence) {
      if (confidence >= 90) return 'success'
      if (confidence >= 70) return 'warning'
      return 'exception'
    },
    toggleHistory() {
      this.showHistory = !this.showHistory
    },
    loadHistoryResult(history) {
      // 实现历史结果加载逻辑
    },
    async exportReport() {
      const element = document.querySelector('.detection-results')
      const opt = {
        margin: 1,
        filename: '病害检测报告.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      }
      
      try {
        await html2pdf().set(opt).from(element).save()
        this.$message.success('报告导出成功')
      } catch (error) {
        this.$message.error('报告导出失败')
      }
    },
    addSymptom(symptom) {
      if (this.prompt) {
        this.prompt += '、' + symptom
      } else {
        this.prompt = symptom
      }
    },
    clearAll() {
      this.prompt = ''
      this.uploadedImages = []
      this.currentImage = null
      this.currentImageIndex = -1
      this.results = []
    },
    formatQuality(val) {
      const qualities = ['低', '较低', '普通', '较好', '极好']
      return qualities[Math.floor((val - 1) / 2)]
    },
    async captureCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        // 实现摄像头拍照逻辑
      } catch (error) {
        this.$message.error('无法访问摄像头')
      }
    },
    showAdvancedSettings() {
      // 实现高级设置对话框的显示逻辑
    },
    showHelp() {
      // 实现帮助指南对话框的显示逻辑
    },
    selectModel(modelId) {
      this.selectedModel = modelId
    },
    startVoiceInput() {
      // 实现语音输入逻辑
    },
    clearPrompt() {
      this.prompt = ''
    },
    openCamera() {
      // 实现打开摄像头逻辑
    },
    useAiSuggestion(suggestion) {
      if (this.prompt) {
        this.prompt += '、' + suggestion
      } else {
        this.prompt = suggestion
      }
    },
    confirmCrop() {
      if (!this.$refs.cropper) {
        return
      }
      
      this.$refs.cropper.getCropData(data => {
        // 获取裁剪后的图片数据
        const file = this.dataURLtoFile(data, 'cropped.jpg')
        this.uploadedImages.push({
          url: data,
          file: file
        })
        this.showCropper = false
      })
    },
    dataURLtoFile(dataurl, filename) {
      const arr = dataurl.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new File([u8arr], filename, { type: mime })
    },
    initChart() {
      // 确保在创建新实例前销毁旧实例
      if (this.chartInstance) {
        this.chartInstance.dispose()
      }
      // 初始化图表逻辑...
    },
    beforeDestroy() {
      if (this.chartInstance) {
        this.chartInstance.dispose()
        this.chartInstance = null
      }
    },
    handleButtonClick(event) {
      // 处理点击事件逻辑...
    }
  }
}
</script>

<style scoped>
.ai-detection-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  height: 100%;
}

.left-panel, .right-panel {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
}

.image-upload {
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 15px;
}

.upload-content {
  text-align: center;
  padding: 20px;
}

.upload-text {
  margin: 10px 0;
  font-size: 16px;
}

.upload-tips {
  color: #909399;
  font-size: 12px;
}

.image-display-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 400px;
  max-height: 800px;
}

.preview-tools {
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
}

.main-preview-area {
  flex: 1;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  position: relative;
  padding: 20px;
  min-height: 500px;
}

.image-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.preview-image {
  max-width: 95%;
  max-height: 95%;
  object-fit: contain;
  display: block;
}

.delete-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.image-preview:not(.detecting):hover .delete-overlay {
  opacity: 1;
  pointer-events: auto;
}

.empty-preview {
  text-align: center;
  color: #909399;
}

.empty-preview i {
  font-size: 48px;
  margin-bottom: 10px;
}

.dark-mode {
  background: #1a1a1a;
  color: #fff;
}

.dark-mode .left-panel,
.dark-mode .right-panel {
  background: #2c2c2c;
  border-color: #3a3a3a;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.disease-name {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.result-section {
  margin-bottom: 10px;
}

.section-content {
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

.horizontal-scroll {
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 5px;
}

.solution-steps {
  display: inline-flex;
  gap: 15px;
  padding: 0 5px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 200px;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #409EFF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  font-weight: bold;
  margin-bottom: 4px;
}

.prevention-items {
  display: inline-flex;
  gap: 15px;
  padding: 0 5px;
}

.prevention-item {
  min-width: 200px;
  padding: 10px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.prevention-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #303133;
}

.prevention-content {
  color: #606266;
  font-size: 14px;
}

/* 自定义滚动条样式 */
.horizontal-scroll::-webkit-scrollbar {
  height: 6px;
}

.horizontal-scroll::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.horizontal-scroll::-webkit-scrollbar-track {
  background: #f0f2f5;
}

.preview-content.compare {
  justify-content: space-between;
}

.image-container {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.disease-mark {
  position: absolute;
  border: 2px solid #f56c6c;
  border-radius: 4px;
  cursor: pointer;
}

.mark-label {
  position: absolute;
  top: -20px;
  left: 0;
  background: #f56c6c;
  color: white;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 12px;
}

.confidence-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .ai-detection-container {
    flex-direction: column;
  }
  
  .left-panel,
  .right-panel {
    width: 100%;
  }
  
  .preview-content.compare {
    flex-direction: column;
  }
}

.quick-symptoms {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.clickable-tag {
  cursor: pointer;
}

.clickable-tag:hover {
  background-color: #ecf5ff;
}

.detection-settings .el-form-item {
  margin-bottom: 15px;
}

/* 深色模式适配 */
.dark-mode .section-title {
  color: #ffffff;
}

.dark-mode .action-buttons {
  background: #2c2c2c;
  border-color: #3a3a3a;
}

.precision-buttons {
  display: flex;
  gap: 8px;
}

.precision-buttons .el-button {
  flex: 1;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #409EFF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-icon.success {
  background: #67C23A;
}

.stat-icon.warning {
  background: #E6A23C;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title i {
  font-size: 18px;
  color: #409EFF;
}

.model-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.model-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #DCDFE6;
  cursor: pointer;
  transition: all 0.3s;
}

.model-card:hover {
  border-color: #409EFF;
  background: #ecf5ff;
}

.model-card.active {
  border-color: #409EFF;
  background: #ecf5ff;
}

.model-icon {
  font-size: 24px;
  color: #409EFF;
}

.model-info {
  flex: 1;
}

.model-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.model-desc {
  font-size: 12px;
  color: #909399;
}

.main-actions {
  width: 100%;
  margin-bottom: 15px;
}

.start-button {
  flex: 2;
}

.shortcut-tip {
  position: absolute;
  right: 8px;
  bottom: 2px;
  font-size: 10px;
  opacity: 0.7;
}

.quick-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.ai-assistant {
  margin: 15px 0px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 6px;
}

.suggestion-title {
  margin-bottom: 8px;
  color: #409EFF;
  font-size: 13px;
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.suggestion-tag:hover {
  transform: translateY(-2px);
}

/* 修改操作按钮区域样式 */
.action-buttons {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}

.main-actions {
  width: 100%;
  margin-bottom: 15px;
}

.start-button {
  flex: 2;
}

/* 新增样式 */
.result-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.diagnosis-summary {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.confidence-score {
  text-align: center;
}

.score-label {
  margin-top: 10px;
  color: #606266;
}

.quick-diagnosis {
  flex: 1;
}

.diagnosis-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.diagnosis-tag {
  margin: 0 !important; /* 覆盖 element-ui 默认边距 */
}

.diagnosis-tag.urgency-tag {
  margin-left: 0 !important;
}

/* 标签颜色自定义 */
.el-tag--danger.urgency-tag {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
  color: white;
}

.result-detail {
  padding: 15px;
}

.detail-item {
  margin-bottom: 20px;
}

.detail-item h4 {
  margin-bottom: 10px;
  color: #303133;
}

.similar-cases {
  margin: 20px 0;
}

.case-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.case-info {
  padding: 10px 0;
}

.case-info h4 {
  margin: 0 0 5px 0;
}

.case-info p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.expert-advice {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.expert-advice .el-alert {
  margin-bottom: 10px;
}

/* 新增概要视图样式 */
.result-summary {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #EBEEF5;
}

.diagnosis-result {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
}

.diagnosis-result i {
  color: #E6A23C;
  font-size: 24px;
}

.summary-cards {
  margin-bottom: 30px;
}

.summary-card {
  height: 100%;
  padding: 15px;
  background: #F8F9FA;
  border-radius: 6px;
  transition: transform 0.3s;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: bold;
  color: #303133;
}

.card-title i {
  color: #409EFF;
}

.card-content {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.cause-tag {
  margin: 0 4px 4px 0;
}

.action-item {
  margin-bottom: 8px;
  padding-left: 12px;
  position: relative;
}

.action-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #409EFF;
}

.summary-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}

.summary-main {
  margin-bottom: 20px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  text-align: center;
  width: 100%;
  max-width: 300px;
}

.ai-analysis-animation {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  position: relative;
}

.scan-container {
  width: 100%;
  height: 100%;
  border: 2px solid rgba(64, 158, 255, 0.5);
  border-radius: 50%;
  position: relative;
  animation: rotate 10s linear infinite;
}

.scan-beam {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent,
    rgba(64, 158, 255, 0.8),
    #409EFF,
    rgba(64, 158, 255, 0.8),
    transparent
  );
  top: 50%;
  animation: scan 2s ease-in-out infinite;
}

.analysis-circles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.analysis-circles span {
  position: absolute;
  border: 1px solid #409EFF;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.analysis-circles span:nth-child(1) {
  width: 60%;
  height: 60%;
  left: 20%;
  top: 20%;
  animation-delay: 0s;
}

.analysis-circles span:nth-child(2) {
  width: 80%;
  height: 80%;
  left: 10%;
  top: 10%;
  animation-delay: 0.5s;
}

.analysis-circles span:nth-child(3) {
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  animation-delay: 1s;
}

.analysis-grid {
  position: absolute;
  width: 80%;
  height: 80%;
  left: 10%;
  top: 10%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  opacity: 0.5;
}

.grid-cell {
  background: rgba(64, 158, 255, 0.2);
  border: 1px solid rgba(64, 158, 255, 0.3);
  animation: flicker 3s infinite;
}

.analysis-dots span {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #409EFF;
  border-radius: 50%;
  animation: float 2s ease-in-out infinite;
}

.loading-status {
  margin-top: 30px;
  text-align: center;
  color: #fff;
}

.status-text {
  font-size: 18px;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
}

.processing-time {
  font-size: 32px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 15px;
}

.progress-bar {
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin: 0 auto;
  overflow: hidden;
}

.progress-inner {
  width: 50%;
  height: 100%;
  background: #409EFF;
  animation: progress 2s ease-in-out infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes scan {
  0%, 100% { transform: translateY(-50px) rotate(0deg); opacity: 0; }
  50% { transform: translateY(50px) rotate(180deg); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.7; }
}

@keyframes flicker {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.5; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

.diagnosis-status {
  display: flex;
  gap: 10px;
  align-items: center;
}

.urgency-tag {
  margin-left: 10px;
}
</style>
