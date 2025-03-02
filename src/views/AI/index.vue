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
                <div class="stat-value">{{ totalScans }}</div>
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
                <div class="stat-value">{{ successRate }}%</div>
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
                <div class="stat-value">{{ avgProcessTime }}s</div>
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
          <div v-if="currentImage" class="image-preview">
            <img :src="currentImage" class="preview-image" />
          </div>
          <div v-else class="empty-preview">
            <i class="el-icon-picture-outline"></i>
            <p>暂无图片</p>
          </div>
        </div>

        <!-- 底部缩略图预览 -->
        <div v-if="uploadedImages.length" class="thumbnail-list">
          <div 
            v-for="(img, index) in uploadedImages"
            :key="index"
            class="thumbnail-item"
            :class="{ active: currentImageIndex === index }"
            @click="selectImage(index)"
          >
            <img :src="img.url" />
            <el-button 
              class="delete-btn" 
              size="mini" 
              type="danger" 
              icon="el-icon-delete"
              @click.stop="removeImage(index)"
            ></el-button>
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
              <!-- 主要诊断结果 -->
              <div class="summary-main">
                <div class="summary-header">
                  <div class="diagnosis-result">
                    <i class="el-icon-warning-outline"></i>
                    <span class="diagnosis-text">{{ detailedResults[0].title }}</span>
                  </div>
                  <el-tag type="warning" effect="dark">{{ diagnosisConfidence }}% 可信度</el-tag>
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
                    :type="tag.type">
                    {{ tag.name }}
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
      totalScans: 1234,
      successRate: 95,
      avgProcessTime: 2.5,
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
      aiSuggestions: [
        '叶片边缘发黄卷曲',
        '茎秆出现褐色斑点',
        '根部有明显腐烂现象'
      ],
      resultView: 'summary',
      diagnosisConfidence: 85,
      confidenceColors: [
        {color: '#f56c6c', percentage: 20},
        {color: '#e6a23c', percentage: 40},
        {color: '#5cb87a', percentage: 60},
        {color: '#1989fa', percentage: 80},
        {color: '#67c23a', percentage: 100}
      ],
      diagnosisTags: [
        { name: '叶斑病', type: 'danger' },
        { name: '中度感染', type: 'warning' },
        { name: '需要处理', type: '' }
      ],
      activeResults: [0],
      detailedResults: [
        {
          title: '主要病害诊断',
          symptoms: '叶片出现褐色斑点，边缘发黄卷曲',
          causes: ['病菌感染', '环境潮湿', '养分失衡'],
          actions: [
            { content: '及时清除病叶', type: 'primary', color: '#409EFF' },
            { content: '控制环境湿度', type: 'success', color: '#67C23A' },
            { content: '补充营养元素', type: 'warning', color: '#E6A23C' }
          ]
        }
      ],
      similarCases: [
        {
          id: 1,
          image: 'path/to/image1.jpg',
          title: '相似案例 #1',
          description: '类似症状的成功治疗案例'
        }
      ],
      expertAdvice: [
        {
          title: '预防建议',
          type: 'success',
          content: '建议定期进行预防性喷药，保持通风'
        },
        {
          title: '注意事项',
          type: 'warning',
          content: '处理时注意防护，避免交叉感染'
        }
      ]
    }
  },
  methods: {
    handleImageUpload(e) {
      const files = Array.from(e.target.files)
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      files.forEach(file => {
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
            this.uploadedImages.push({
              url: e.target.result,
              file: compressedFile
            })
            if (!this.currentImage) {
              this.currentImage = e.target.result
              this.currentImageIndex = 0
            }
          }
          reader.readAsDataURL(compressedFile)
        })
      })
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
    removeImage(index) {
      this.uploadedImages.splice(index, 1)
      if (this.uploadedImages.length === 0) {
        this.currentImage = null
        this.currentImageIndex = -1
      } else if (this.currentImageIndex === index) {
        this.currentImageIndex = 0
        this.currentImage = this.uploadedImages[0].url
      }
    },
    selectImage(index) {
      this.currentImageIndex = index
      this.currentImage = this.uploadedImages[index].url
    },
    async startDetection() {
      if (!this.uploadedImages.length) {
        this.$message.warning('请先上传图片')
        return
      }

      this.isDetecting = true
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        this.results = [{
          name: '示例结果',
          description: '这是一个示例识别结果'
        }]
      } catch (error) {
        this.$message.error('检测失败，请重试')
      } finally {
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
}

.preview-image {
  max-width: 95%;
  max-height: 95%;
  object-fit: contain;
  display: block;
}

.thumbnail-list {
  display: flex;
  justify-content: flex-start;
  gap: 8px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
  flex-wrap: wrap;
  min-height: 80px;
}

.thumbnail-item {
  position: relative;
  width: 60px;
  height: 60px;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  margin-bottom: 8px;
}

.thumbnail-item.active {
  border-color: #409EFF;
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.thumbnail-item:hover .delete-btn {
  opacity: 1;
}

.recognition-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

.result-content {
  flex: 1;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  overflow-y: auto;
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
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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
</style>
