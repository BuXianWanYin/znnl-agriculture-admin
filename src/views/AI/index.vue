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
            v-for="(symptom, index) in commonSymptoms"
            :key="`symptom_${index}`"
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
              v-for="(suggestion, index) in fixedSuggestions"
              :key="`suggestion_${index}`"
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
                      <div v-for="n in 9" :key="`grid_${n}`" class="grid-cell"></div>
                    </div>
                    <div class="analysis-dots">
                      <span v-for="n in 5" :key="`dot_${n}`"></span>
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
                        :key="`cause_${index}`"
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
                        :key="`action_${index}`"
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
                <el-button type="primary" icon="el-icon-document" @click="exportReport">
                  导出报告
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
                <el-carousel-item 
                  v-for="(item, index) in filteredSimilarCases" 
                  :key="`case_${item.id}_${index}`">
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
                :key="`advice_${index}`"
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
      <div class="history-container">
        <!-- 搜索和筛选区域 -->
        <div class="history-header">
          <el-input
            v-model="historySearch"
            placeholder="搜索历史记录"
            prefix-icon="el-icon-search"
            clearable
            size="small"
            style="width: 200px"
          ></el-input>
          <el-select
            v-model="historyFilter"
            placeholder="筛选状态"
            size="small"
            style="width: 120px"
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="已处理" value="success"></el-option>
            <el-option label="未处理" value="warning"></el-option>
          </el-select>
          <el-button 
            type="danger" 
            size="small" 
            icon="el-icon-delete"
            @click="clearHistory"
          >
            清除历史
          </el-button>
        </div>

        <!-- 历史记录列表 -->
        <el-timeline v-loading="historyLoading">
          <el-timeline-item
            v-for="(history, index) in filteredHistory"
            :key="`history_${history.id || index}`"
            :timestamp="history.time"
            :type="history.status"
          >
            <el-card shadow="hover">
              <div class="history-item">
                <div class="history-info">
                  <h4>{{ history.name }}</h4>
                  <div class="history-details">
                    <p>
                      <i class="el-icon-warning-outline"></i>
                      诊断结果：{{ history.diagnosis }}
                    </p>
                    <p>
                      <i class="el-icon-data-analysis"></i>
                      可信度：{{ history.confidence }}%
                    </p>
                    <p>
                      <i class="el-icon-finished"></i>
                      处理状态：
                      <el-tag size="mini" :type="history.status === 'success' ? 'success' : 'warning'">
                        {{ history.treatment }}
                      </el-tag>
                    </p>
                  </div>
                </div>
                <div class="history-preview" v-if="history.image">
                  <img :src="history.image" alt="检测图片">
                </div>
              </div>
              <div class="history-actions">
                <el-button 
                  type="primary" 
                  size="mini" 
                  @click="loadHistoryResult(history)"
                >
                  查看详情
                </el-button>
                <el-button 
                  type="success" 
                  size="mini" 
                  v-if="history.status === 'warning'"
                  @click="markAsProcessed(history.id)"
                >
                  标记已处理
                </el-button>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>

        <!-- 分页 -->
        <div class="history-pagination">
          <el-pagination
            :current-page="historyPagination.currentPage"
            :page-size="historyPagination.pageSize"
            :total="historyPagination.total"
            layout="prev, pager, next"
            @current-change="handleHistoryPageChange"
          >
          </el-pagination>
        </div>
      </div>
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

    <!-- 在 template 最后添加帮助指南对话框 -->
    <el-dialog
      title="使用帮助"
      :visible.sync="showHelpDialog"
      width="60%"
      class="help-dialog"
    >
      <div class="help-content">
        <el-collapse v-model="activeHelp">
          <el-collapse-item title="基本使用流程" name="1">
            <div class="help-section">
              <div class="step-item">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h4>描述症状</h4>
                  <p>在左侧输入框中详细描述观察到的病虫害症状,可以:</p>
                  <ul>
                    <li>直接输入文字描述</li>
                    <li>点击快速选择常见症状</li>
                    <li>使用语音输入功能</li>
                  </ul>
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h4>上传图片</h4>
                  <p>上传清晰的病害部位图片:</p>
                  <ul>
                    <li>支持拖拽或点击上传</li>
                    <li>可以使用相机实时拍摄</li>
                    <li>建议图片尺寸不小于800x600</li>
                  </ul>
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h4>调整设置</h4>
                  <p>根据需要调整检测参数:</p>
                  <ul>
                    <li>选择检测模式(综合/植物/鱼类)</li>
                    <li>调整图像质量要求</li>
                    <li>选择检测精度级别</li>
                  </ul>
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">4</div>
                <div class="step-content">
                  <h4>开始识别</h4>
                  <p>点击"开始识别"按钮,等待AI分析结果</p>
                </div>
              </div>
            </div>
          </el-collapse-item>

          <el-collapse-item title="功能说明" name="2">
            <div class="features-grid">
              <div class="feature-card">
                <i class="el-icon-mic"></i>
                <h4>语音输入</h4>
                <p>支持语音识别,快速输入症状描述</p>
              </div>
              <div class="feature-card">
                <i class="el-icon-camera"></i>
                <h4>实时拍摄</h4>
                <p>可直接调用相机拍摄病害图片</p>
              </div>
              <div class="feature-card">
                <i class="el-icon-document"></i>
                <h4>报告导出</h4>
                <p>支持导出诊断报告PDF文件</p>
              </div>
              <div class="feature-card">
                <i class="el-icon-time"></i>
                <h4>历史记录</h4>
                <p>保存检测历史,方便后续查看</p>
              </div>
            </div>
          </el-collapse-item>

          <el-collapse-item title="使用技巧" name="3">
            <div class="tips-section">
              <div class="tip-item">
                <h4><i class="el-icon-info"></i> 提高识别准确率</h4>
                <ul>
                  <li>拍摄时保持光线充足</li>
                  <li>对准病害部位特写拍摄</li>
                  <li>避免模糊、过暗的图片</li>
                  <li>尽可能详细描述症状特征</li>
                </ul>
              </div>
              <div class="tip-item">
                <h4><i class="el-icon-warning"></i> 注意事项</h4>
                <ul>
                  <li>建议使用高精度模式进行重要诊断</li>
                  <li>诊断结果仅供参考,重要决策请咨询专家</li>
                  <li>定期进行预防性检查</li>
                </ul>
              </div>
            </div>
          </el-collapse-item>

          <el-collapse-item title="快捷键" name="4">
            <div class="shortcuts-grid">
              <div class="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>Enter</kbd>
                <span>开始识别</span>
              </div>
              <div class="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>V</kbd>
                <span>粘贴图片</span>
              </div>
              <div class="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>S</kbd>
                <span>保存报告</span>
              </div>
              <div class="shortcut-item">
                <kbd>H</kbd>
                <span>打开帮助</span>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
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
      historyLoading: false,
      historyPagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
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
      similarCases: {
        fish: [
          {
            id: 1,
            image: 'http://192.168.1.153:81/dev-api/profile/upload/2025/03/01/c456e339-3b24-4b28-8303-deabe93ebded.png',
            title: '罗非鱼常见病害',
            description: '鳃部发炎、体表发白，建议及时隔离治疗'
          },
          {
            id: 2,
            image: 'http://192.168.1.153:81/dev-api/profile/upload/2025/03/01/0bd276a8-b1aa-4000-8ce2-4fa8795c3fa1.png',
            title: '草鱼出血病',
            description: '体表出血点、行为异常，需要专业治疗'
          },
          {
            id: 3,
            image: 'http://192.168.1.153:81/dev-api/profile/upload/2025/03/01/24dc29ca-182e-40db-97fe-4bc9788579d9.png',
            title: '龙鱼鳞片病',
            description: '鳞片脱落、食欲下降，建议调整水质'
          },
          {
            id: 4,
            image: 'http://192.168.1.153:81/dev-api/profile/upload/2025/03/01/46eef39c-1690-4aab-bfe5-f9430d67d56b.png',
            title: '黄花鱼寄生虫病',
            description: '体表有白点、游动缓慢，需要药物治疗'
          },
          {
            id: 5,
            image: 'http://192.168.1.153:81/dev-api/profile/upload/2025/03/01/ed279b13-913b-4108-9f44-29fdc2437973.png',
            title: '鲤鱼水霉病',
            description: '体表有棉絮状物，及时用药并改善环境'
          }
        ],
        vegetables: [
          {
            id: 1,
            image: 'http://192.168.1.153:81/dev-api/profile/upload/2025/03/01/87b5365d-f709-4fda-ab7c-88db5c2c7808.png',
            title: '小白菜根腐病',
            description: '根部发黑腐烂，需要改良土壤并施药'
          },
          {
            id: 2,
            image: 'http://192.168.1.153:81/dev-api/profile/upload/2025/03/01/e346c20b-6931-4c17-a459-fb39bab95984.png',
            title: '番茄早疫病',
            description: '叶片褐斑、果实腐烂，及时喷施药剂'
          },
          {
            id: 3,
            image: 'http://192.168.1.153:81/dev-api/profile/upload/2025/03/01/07fd276f-bc55-4798-8bb3-b8f52baa6a9e.png',
            title: '胡萝卜根结线虫病',
            description: '根部畸形、生长缓慢，需要土壤消毒'
          },
          {
            id: 4,
            image: 'http://192.168.1.153:81/dev-api/profile/upload/2025/03/01/52db8e60-b3be-4a5a-9c19-68c10e6eb53e.png',
            title: '生菜灰霉病',
            description: '叶片腐烂发灰，控制湿度并用药防治'
          },
          {
            id: 5,
            image: 'http://192.168.1.153:81/dev-api/profile/upload/2025/03/01/08696a0d-966b-4fc4-931c-8937ceda7812.png',
            title: '西兰花黑腐病',
            description: '花球变黑、叶片黄化，需要综合防治'
          }
        ]
      },
      expertAdvice: [],
      chartInstance: null,
      processingTime: 0,
      processingTimer: null,
      statsData: {
        totalDetections: 1280,
        accuracy: '90%',
        avgProcessTime: '21.5s'
      },
      historySearch: '',
      historyFilter: '',
      showHelpDialog: false,
      activeHelp: ['1'], // 默认展开第一项
      cameraStream: null,
      showCamera: false,
      shortcuts: {
        startDetection: { key: 'Enter', ctrl: true, description: '开始识别' },
        openHelp: { key: 'h', description: '打开帮助' },
        saveReport: { key: 's', ctrl: true, description: '保存报告' },
        clearPrompt: { key: 'Delete', description: '清空描述' },
        openCamera: { key: 'c', description: '打开相机' }
      },
      fixedSuggestions: [
        "鱼类游动缓慢、食欲不振、体表有白点、经常浮在水面",
        "叶片发黄卷曲、茎秆腐烂、根部变黑、生长缓慢"
      ],
    }
  },
  computed: {
    showUrgencyTag() {
      return this.results && this.results.length > 0 && this.results[0].needTreatment;
    },
    filteredSimilarCases() {
      if (this.settings.mode === 'all') {
        return [...this.similarCases.fish, ...this.similarCases.vegetables];
      } else if (this.settings.mode === 'fish') {
        return this.similarCases.fish;
      } else {
        return this.similarCases.vegetables;
      }
    },
    filteredHistory() {
      let filtered = [...this.detectionHistory]
      
      // 搜索过滤
      if (this.historySearch) {
        const search = this.historySearch.toLowerCase()
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(search) ||
          item.diagnosis.toLowerCase().includes(search)
        )
      }
      
      // 状态过滤
      if (this.historyFilter) {
        filtered = filtered.filter(item => item.status === this.historyFilter)
      }
      
      // 更新总数
      this.historyPagination.total = filtered.length
      
      // 分页处理
      const start = (this.historyPagination.currentPage - 1) * this.historyPagination.pageSize
      const end = start + this.historyPagination.pageSize
      
      return filtered.slice(start, end)
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
      
      // 开始计时
      this.processingTimer = setInterval(() => {
        this.processingTime += 0.1
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
          // 优化分割逻辑，支持更多中文分隔符
          causes: response.diagnosis.primary_causes
            .split(/[。；,，、\s]+/)  // 支持句号、分号、逗号、顿号和空格
            .filter(cause => cause.trim()),
          recommendations: response.diagnosis.recommended_measures
            .split(/[。；,，、\s]+/)  // 使用相同的分隔符规则
            .filter(item => item.trim()),
          needTreatment: response.quick_check.urgency
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
          // 使用相同的分割逻辑保持一致性
          causes: response.diagnosis.primary_causes
            .split(/[。；,，、\s]+/)
            .filter(cause => cause.trim()),
          actions: response.diagnosis.recommended_measures
            .split(/[。；,，、\s]+/)
            .filter(measure => measure.trim())
            .map(measure => ({
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

        // 识别完成后执行高级设置功能
        await this.executeAdvancedSettings()

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
    // 添加新方法处理高级设置功能
    async executeAdvancedSettings() {
      const { enableMark, saveHistory, autoReport } = this.settings

      try {
        // 1. 启用病害标注
        if (enableMark && this.results[0]?.marks) {
          this.diseaseMarks = this.results[0].marks
        }

        // 2. 保存检测历史
        if (saveHistory) {
          await this.saveDetectionHistory()
        }

        // 3. 自动生成报告
        if (autoReport) {
          await this.exportReport()
        }

        // 如果有多个设置项被启用，显示执行成功提示
        const enabledSettings = [enableMark, saveHistory, autoReport].filter(Boolean).length
        if (enabledSettings > 1) {
          this.$message.success('高级功能执行完成')
        }

      } catch (error) {
        console.error('执行高级设置功能失败:', error)
        this.$message.error('部分高级功能执行失败')
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
    async toggleHistory() {
      this.showHistory = !this.showHistory
      if (this.showHistory) {
        await this.loadHistoryRecords()
      }
    },
    async loadHistoryRecords() {
      this.historyLoading = true
      try {
        const stored = localStorage.getItem('detectionHistory')
        if (stored) {
          this.detectionHistory = JSON.parse(stored)
        }
      } catch (error) {
        console.error('加载历史记录失败:', error)
        this.$message.error('加载历史记录失败')
      } finally {
        this.historyLoading = false
      }
    },
    async loadHistoryResult(history) {
      try {
        // 更新当前图片
        this.currentImage = history.image
        
        // 更新诊断结果
        this.results = [{
          name: history.diagnosis,
          description: history.results[0]?.description || '',
          confidence: history.confidence,
          causes: history.results[0]?.causes || [],
          recommendations: history.results[0]?.recommendations || [],
          needTreatment: history.status === 'warning'
        }]

        // 更新置信度
        this.diagnosisConfidence = history.confidence

        // 更新标签
        this.diagnosisTags = [
          { 
            name: history.diagnosis,
            type: history.status === 'warning' ? 'danger' : 'warning'
          }
        ]

        // 更新详细结果
        this.detailedResults = [{
          title: '历史诊断记录',
          symptoms: history.results[0]?.description || '',
          causes: history.results[0]?.causes || [],
          actions: (history.results[0]?.recommendations || []).map(rec => ({
            content: rec,
            type: 'primary',
            color: '#409EFF'
          }))
        }]

        // 更新专家建议
        this.expertAdvice = [
          {
            title: '注意事项',
            type: 'warning',
            content: history.results[0]?.attention_items || history.results[0]?.description || ''
          },
          {
            title: '预防建议',
            type: 'success',
            content: history.results[0]?.prevention_measures || history.results[0]?.recommendations?.join('；') || ''
          }
        ]

        // 更新症状描述
        this.prompt = history.prompt

        // 更新上传的图片
        if (history.image) {
          this.uploadedImages = [{
            url: history.image,
            file: null // 历史记录中可能没有原始文件
          }]
        }

        // 关闭历史记录抽屉
        this.showHistory = false
        
        this.$message.success('已加载历史记录')
      } catch (error) {
        console.error('加载历史结果失败:', error)
        this.$message.error('加载历史结果失败')
      }
    },
    async saveDetectionHistory() {
      if (!this.settings.saveHistory) return
      
      try {
        const historyData = {
          id: Date.now(),
          time: new Date().toLocaleString(),
          name: `${this.settings.mode === 'fish' ? '鱼类' : '植物'}疾病检测`,
          diagnosis: this.results[0]?.name || '未知',
          treatment: '未处理',
          status: 'warning',
          image: this.currentImage,
          prompt: this.prompt,
          results: this.results.map(result => ({
            name: result.name,
            description: result.description,
            causes: result.causes,
            recommendations: result.recommendations,
            attention_items: this.expertAdvice[0]?.content,  // 保存注意事项
            prevention_measures: this.expertAdvice[1]?.content  // 保存预防建议
          })),
          confidence: this.diagnosisConfidence
        }
        
        // 限制最多保存50条记录
        if (this.detectionHistory.length > 50) {
          this.detectionHistory = this.detectionHistory.slice(0, 50)
        }
        
        // 添加到历史记录
        this.detectionHistory.unshift(historyData)
        
        // 保存到本地存储
        localStorage.setItem('detectionHistory', JSON.stringify(this.detectionHistory))
        
      } catch (error) {
        console.error('保存历史记录失败:', error)
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
      this.showHelpDialog = true
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
    },
    handleHistoryPageChange(page) {
      this.historyPagination.currentPage = page
    },
    async markAsProcessed(id) {
      const index = this.detectionHistory.findIndex(item => item.id === id)
      if (index !== -1) {
        this.detectionHistory[index].status = 'success'
        this.detectionHistory[index].treatment = '已处理'
        
        // 更新本地存储
        localStorage.setItem('detectionHistory', JSON.stringify(this.detectionHistory))
        
        this.$message.success('已标记为处理完成')
      }
    },
    clearHistory() {
      this.$confirm('确定要清除所有历史记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.detectionHistory = []
        localStorage.removeItem('detectionHistory')
        this.$message.success('历史记录已清除')
      }).catch(() => {})
    },
    async exportReport() {
      // 创建报告内容
      const reportContent = document.createElement('div')
      reportContent.className = 'report-container'
      
      // 添加报告头部
      reportContent.innerHTML = `
        <div class="report-header">
          <h1>病害智能诊断报告</h1>
          <div class="report-meta">
            <p>检测时间：${new Date().toLocaleString()}</p>
            <p>报告编号：${Date.now().toString(36).toUpperCase()}</p>
          </div>
        </div>

        <div class="report-summary">
          <h2>诊断概要</h2>
          <div class="summary-content">
            <div class="diagnosis-result">
              <h3>主要病害：${this.results[0]?.name || '未知'}</h3>
              <p class="confidence">诊断可信度：${this.diagnosisConfidence}%</p>
            </div>
            <div class="image-section">
              <img src="${this.currentImage}" alt="检测图片" style="max-width: 300px;"/>
            </div>
          </div>
        </div>

        <div class="report-details">
          <h2>详细分析</h2>
          
          <div class="analysis-section">
            <h3>症状描述</h3>
            <p>${this.results[0]?.description || '无'}</p>
          </div>

          <div class="analysis-section">
            <h3>病因分析</h3>
            <ul>
              ${this.results[0]?.causes?.map(cause => `<li>${cause}</li>`).join('') || '<li>无数据</li>'}
            </ul>
          </div>

          <div class="analysis-section">
            <h3>建议措施</h3>
            <ul>
              ${this.results[0]?.recommendations?.map(rec => `<li>${rec}</li>`).join('') || '<li>无数据</li>'}
            </ul>
          </div>
        </div>

        <div class="report-footer">
          <p>注意：本报告由AI智能系统生成，仅供参考。如有疑问，请咨询专业人员。</p>
        </div>
      `

      // 添加报告样式
      const style = document.createElement('style')
      style.textContent = `
        .report-container {
          padding: 40px;
          font-family: Arial, sans-serif;
        }
        .report-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .report-header h1 {
          color: #333;
          margin-bottom: 15px;
        }
        .report-meta {
          color: #666;
          font-size: 14px;
        }
        .report-summary {
          margin: 30px 0;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .summary-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-top: 20px;
        }
        .diagnosis-result {
          flex: 1;
        }
        .confidence {
          color: #409EFF;
          font-weight: bold;
        }
        .analysis-section {
          margin: 20px 0;
        }
        .analysis-section h3 {
          color: #333;
          margin-bottom: 10px;
        }
        .analysis-section ul {
          padding-left: 20px;
        }
        .analysis-section li {
          margin-bottom: 8px;
          line-height: 1.5;
        }
        .report-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
      `
      
      reportContent.appendChild(style)

      // 配置PDF导出选项
      const opt = {
        margin: 1,
        filename: `病害诊断报告_${new Date().toLocaleDateString()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false
        },
        jsPDF: { 
          unit: 'cm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      }

      try {
        const loadingMessage = this.$message({
          message: '正在生成报告，请稍候...',
          type: 'info',
          duration: 0
        })

        // 等待图片加载完成
        await new Promise(resolve => {
          const img = new Image()
          img.onload = resolve
          img.src = this.currentImage
        })

        // 生成PDF
        await html2pdf().from(reportContent).set(opt).save()
        
        // 关闭加载消息
        loadingMessage.close()
        
        // 显示成功消息
        this.$message({
          message: '报告导出成功！',
          type: 'success',
          duration: 3000  // 3秒后自动关闭
        })
      } catch (error) {
        console.error('报告导出失败:', error)
        this.$message.error('报告导出失败，请重试')
      }
    },
    // 添加快捷键支持
    handleKeydown(e) {
      // 如果在输入框中，只响应 Ctrl 组合键
      const isInInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA'
      
      // 检查快捷键
      for (const [action, config] of Object.entries(this.shortcuts)) {
        const keyMatch = e.key.toLowerCase() === config.key.toLowerCase()
        const ctrlMatch = config.ctrl ? e.ctrlKey : true
        
        if (keyMatch && ctrlMatch) {
          // 在输入框中且不是 Ctrl 组合键时不触发
          if (isInInput && !config.ctrl) continue
          
          e.preventDefault()
          
          switch (action) {
            case 'startDetection':
              if (this.isDetecting) return
              this.startDetection()
              break
            case 'openHelp':
              this.showHelp()
              break
            case 'saveReport':
              if (this.results.length) {
                this.exportReport()
              }
              break
            case 'clearPrompt':
              if (!isInInput) return
              this.clearPrompt()
              break
            case 'openCamera':
              if (!this.showCamera) {
                this.openCamera()
              }
              break
          }
          break
        }
      }
    },
    // 修改 openCamera 方法
    async openCamera() {
      // 首先检查浏览器是否支持
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.$message.error('您的浏览器不支持摄像头功能，请使用现代浏览器')
        return
      }

      try {
        // 先检查权限状态
        const permissionStatus = await navigator.permissions.query({ name: 'camera' })
        if (permissionStatus.state === 'denied') {
          this.$message.error('摄像头权限被拒绝，请在浏览器设置中允许访问摄像头')
          return
        }

        // 尝试获取摄像头列表
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        
        if (videoDevices.length === 0) {
          this.$message.error('未检测到可用的摄像头设备')
          return
        }

        // 配置摄像头参数
        const constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'environment', // 优先使用后置摄像头
            // 如果设备支持，设置更多参数
            advanced: [{
              focusMode: 'continuous', // 自动对焦
              exposureMode: 'continuous', // 自动曝光
              whiteBalanceMode: 'continuous' // 自动白平衡
            }]
          }
        }

        // 请求摄像头权限并获取流
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        this.cameraStream = stream
        this.showCamera = true

        // 创建摄像头预览对话框
        await this.$confirm('', '实时拍摄', {
          customClass: 'camera-dialog',
          showCancelButton: true,
          cancelButtonText: '关闭',
          confirmButtonText: '拍照',
          closeOnClickModal: false,
          closeOnPressEscape: false,
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              this.takePhoto()
            }
            this.stopCamera()
            done()
          }
        }).catch(() => {
          // 用户取消时确保关闭摄像头
          this.stopCamera()
        })

        // 设置视频预览
        this.$nextTick(() => {
          const video = document.createElement('video')
          video.srcObject = stream
          video.autoplay = true
          video.playsInline = true // 防止在iOS上全屏播放
          video.style.width = '100%'
          video.style.maxHeight = '70vh'
          
          // 确保视频加载完成
          video.onloadedmetadata = () => {
            video.play().catch(err => {
              console.error('视频播放失败:', err)
              this.$message.error('视频预览启动失败')
              this.stopCamera()
            })
          }
          
          // 将视频预览添加到对话框
          const dialogContent = document.querySelector('.camera-dialog .el-message-box__content')
          if (dialogContent) {
            dialogContent.appendChild(video)
          } else {
            throw new Error('未找到预览容器')
          }
        })

      } catch (error) {
        console.error('摄像头访问错误:', error)
        
        // 根据错误类型显示不同的错误信息
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          this.$message.error('摄像头访问被拒绝，请允许浏览器访问摄像头')
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          this.$message.error('未找到可用的摄像头设备')
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          this.$message.error('摄像头可能被其他应用程序占用')
        } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
          this.$message.error('摄像头不支持请求的分辨率')
        } else {
          this.$message.error('摄像头启动失败：' + (error.message || '未知错误'))
        }
        
        // 确保清理资源
        this.stopCamera()
      }
    },

    // 新增拍照方法
    takePhoto() {
      if (!this.cameraStream) return
      
      // 创建 canvas 用于截图
      const video = document.querySelector('.camera-dialog video')
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // 绘制当前视频帧
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      
      // 转换为文件
      canvas.toBlob(blob => {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' })
        
        // 创建预览 URL
        const imageUrl = URL.createObjectURL(blob)
        
        // 添加到上传图片列表
        this.uploadedImages = [{
          url: imageUrl,
          file: file
        }]
        this.currentImage = imageUrl
        
        this.$message.success('拍照成功')
      }, 'image/jpeg', 0.8)
    },

    // 修改 stopCamera 方法，增加更多清理逻辑
    stopCamera() {
      if (this.cameraStream) {
        // 停止所有轨道
        this.cameraStream.getTracks().forEach(track => {
          track.stop()
          this.cameraStream.removeTrack(track)
        })
        this.cameraStream = null
      }
      
      // 移除视频元素
      const video = document.querySelector('.camera-dialog video')
      if (video) {
        video.srcObject = null
        video.remove()
      }
      
      this.showCamera = false
    }
  },
  created() {
    // 初始加载历史记录
    this.loadHistoryRecords()
  },
  mounted() {
    // 添加键盘事件监听
    document.addEventListener('keydown', this.handleKeydown)
  },
  beforeDestroy() {
    // 移除键盘事件监听
    document.removeEventListener('keydown', this.handleKeydown)
    this.stopCamera() // 确保在组件销毁时停止摄像头
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

.history-container {
  padding: 20px;
}

.history-header {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.history-item {
  display: flex;
  gap: 15px;
}

.history-info {
  flex: 1;
}

.history-info h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.history-details {
  color: #606266;
  font-size: 13px;
}

.history-details p {
  margin: 5px 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.history-preview {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
}

.history-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.history-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.history-pagination {
  margin-top: 20px;
  text-align: center;
}

/* 帮助对话框样式 */
.help-content {
  max-height: 70vh;
  overflow-y: auto;
}

.help-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px;
}

.step-item {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.step-number {
  width: 24px;
  height: 24px;
  background: #409EFF;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  margin: 0 0 8px 0;
  color: #303133;
}

.step-content ul {
  margin: 5px 0;
  padding-left: 20px;
  color: #606266;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 10px;
}

.feature-card {
  padding: 15px;
  border-radius: 8px;
  background: #f5f7fa;
  text-align: center;
}

.feature-card i {
  font-size: 24px;
  color: #409EFF;
  margin-bottom: 10px;
}

.feature-card h4 {
  margin: 10px 0;
  color: #303133;
}

.feature-card p {
  color: #606266;
  font-size: 13px;
}

.tips-section {
  padding: 10px;
}

.tip-item {
  margin-bottom: 20px;
}

.tip-item h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #303133;
  margin-bottom: 10px;
}

.tip-item i {
  color: #409EFF;
}

.tip-item ul {
  padding-left: 20px;
  color: #606266;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  padding: 10px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

kbd {
  background: #fff;
  border: 1px solid #d8dce5;
  border-radius: 4px;
  padding: 2px 6px;
  font-family: monospace;
  font-size: 12px;
  box-shadow: 0 1px 1px rgba(0,0,0,0.2);
}

.shortcut-item span {
  color: #606266;
  font-size: 13px;
}

/* 深色模式适配 */
.dark-mode .help-dialog {
  background: #2c2c2c;
}

.dark-mode .feature-card,
.dark-mode .shortcut-item {
  background: #363636;
}

.dark-mode kbd {
  background: #2c2c2c;
  border-color: #4a4a4a;
}

.dark-mode .tip-item ul,
.dark-mode .shortcut-item span {
  color: #a6a6a6;
}

/* 添加摄像头对话框样式 */
.camera-dialog {
  width: 90vw !important;
  max-width: 800px !important;
}

.camera-dialog .el-message-box__content {
  padding: 0;
  overflow: hidden;
  border-radius: 4px;
}

.camera-dialog .el-message-box__btns {
  padding: 12px;
  background: #f5f7fa;
}

.camera-dialog video {
  display: block;
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

/* 添加快捷键提示样式 */
.shortcut-hint {
  position: absolute;
  right: 8px;
  bottom: 4px;
  font-size: 10px;
  color: #909399;
  opacity: 0.7;
}
</style>
