<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="title"
    width="85%"
    class="ai-report-dialog"
    :close-on-click-modal="true"
    @close="handleClose"
  >
    <!-- 没有分析报告时显示的内容 -->
    <div v-if="!hasAnalysis" class="no-analysis-content">
      <el-empty description="暂无分析报告">
        <el-button type="primary" 
                   @click="startAnalysis" 
                   :loading="loading">
          {{ loading ? '分析中...' : '开始智能分析' }}
        </el-button>
      </el-empty>
    </div>

    <!-- 有分析报告时显示的内容 -->
    <div v-else class="ai-report-content">
      <el-row :gutter="20">
        <!-- 左侧内容 -->
        <el-col :span="6">
          <!-- 基本信息 -->
          <div class="info-card">
            <div class="image-wrapper">
              <img :src="getImageUrl" :alt="getName" class="subject-image">
            </div>
            <div class="info-content">
              <h2>{{ getName }}</h2>
              <div class="type-tag">{{ getTypeName }}</div>
              <div class="meta-info">
                <div><i class="el-icon-document"></i>编号：{{ reportId }}</div>
                <div><i class="el-icon-time"></i>生成时间：{{ generateTime }}</div>
              </div>
            </div>
          </div>

          <!-- 核心指标 -->
          <div class="metrics-card">
            <div class="section-title">
              <i class="el-icon-data-line"></i>
              <span>核心指标</span>
            </div>
            <div class="metrics-list">
              <div v-for="(metric, index) in coreMetrics" 
                   :key="index"
                   class="metric-item">
                <div class="metric-header">
                  <i :class="metric.icon"></i>
                  <span>{{ metric.name }}</span>
                  <span class="value">{{ metric.value }}</span>
                </div>
                <el-progress 
                  :percentage="metric.percentage"
                  :color="metric.color"
                  :show-text="false"
                  :stroke-width="4"
                />
              </div>
            </div>
          </div>
        </el-col>

        <!-- 中间内容 -->
        <el-col :span="12">
          <!-- 环境参数 -->
          <div class="params-card">
            <div class="section-title">
              <i class="el-icon-setting"></i>
              <span>环境参数</span>
            </div>
            <el-table :data="environmentData" 
                      style="width: 100%" 
                      :stripe="true"
                      size="mini"
                      border>
              <el-table-column prop="name" label="参数名称" width="120"/>
              <el-table-column prop="value" label="标准范围" width="120"/>
              <el-table-column prop="description" label="说明"/>
            </el-table>
          </div>

          <!-- 建议部分 -->
          <div class="suggestions-card">
            <div class="section-title">
              <i class="el-icon-s-opportunity"></i>
              <span>{{ fishData ? '养殖建议' : '种植建议' }}</span>
            </div>
            <div class="suggestions-grid">
              <div v-for="(suggestion, index) in suggestions" 
                   :key="index"
                   class="suggestion-item">
                <div class="suggestion-icon">
                  <i :class="suggestion.icon"></i>
                </div>
                <div class="suggestion-content">
                  <h4>{{ suggestion.title }}</h4>
                  <p>{{ suggestion.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 右侧内容 -->
        <el-col :span="6">
          <!-- 综合评估 -->
          <div class="analysis-card">
            <div class="section-title">
              <i class="el-icon-data-analysis"></i>
              <span>综合评估</span>
            </div>
            <div class="analysis-list">
              <div class="analysis-item">
                <h4>生长评估</h4>
                <p>{{ analysis.growth }}</p>
              </div>
              <div class="analysis-item">
                <h4>养殖难度</h4>
                <p>{{ analysis.difficulty }}</p>
              </div>
              <div class="analysis-item">
                <h4>综合建议</h4>
                <p>{{ analysis.suggestion }}</p>
              </div>
              <div class="analysis-item">
                <h4>市场分析</h4>
                <p>{{ analysis.market }}</p>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" 
                 icon="el-icon-download" 
                 @click="handleExport"
                 v-if="hasAnalysis">
        导出报告
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
    import { getData as getSpeciesData, addData as addSpeciesData } from "@/api/fishingGround/species";
    import { getData as getGermplasmData, addData as addGermplasmData } from "@/api/agriculture/germplasm";
export default {
  name: 'AIReport',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    fishData: {
      type: Object,
      default: null
    },
    vegetableData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: false,
      reportId: '',
      generateTime: '',
      coreMetrics: [],
      environmentData: [],
      suggestions: [],
      analysis: {
        growth: '',
        difficulty: '',
        suggestion: '',
        market: ''
      },
      hasAnalysis: false,
      loading: false
    }
  },
  computed: {
    title() {
      return `${this.getName} - 智能分析报告`
    },
    getName() {
      return this.fishData?.fishName || this.vegetableData?.cropName || '未知'
    },
    getTypeName() {
      return this.fishData?.fishSpeciesName || this.vegetableData?.germplasmName || '未知'
    },
    getId() {
      if (this.fishData) {
        return this.fishData.speciesId
      } else if (this.vegetableData) {
        return this.vegetableData.germplasmId
      }
      return null
    },
    getImageUrl() {
      const baseUrl = window.location.origin + process.env.VUE_APP_BASE_API
      const imgPath = this.fishData?.fishSpeciesImg || this.vegetableData?.germplasmImg
      return baseUrl + imgPath
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.initData()
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false
    },
    async initData() {
      try {
        // 检查是否已有分析报告
        const response = this.fishData 
          ? await getSpeciesData(this.getId)
          : await getGermplasmData(this.getId)

        if (response.data?.aiAnalysis) {
          // 如果已有分析报告，加载数据
          this.hasAnalysis = true
          const analysisData = response.data.aiAnalysis
          
          // 生成报告ID
          this.reportId = analysisData.reportId || ('AI' + Math.random().toString().slice(2, 8))
          
          // 设置生成时间
          this.generateTime = analysisData.generateTime || this.getCurrentTime()

          // 更新核心指标
          this.coreMetrics = analysisData.coreMetrics.map(metric => ({
            ...metric,
            icon: this.getMetricIcon(metric.name),
            color: this.getMetricColor(metric.type)
          }))

          // 更新其他数据
          this.environmentData = analysisData.environmentData
          this.suggestions = analysisData.suggestions.map(suggestion => ({
            ...suggestion,
            icon: this.getSuggestionIcon(suggestion.title)
          }))
          this.analysis = analysisData.analysis
        } else {
          // 如果没有分析报告，重置数据
          this.hasAnalysis = false
          this.resetData()
        }
      } catch (error) {
        this.$message.error('获取数据失败')
        console.error('获取数据失败:', error)
      }
    },
    getCurrentTime() {
      const now = new Date()
      return now.getFullYear() + '-' + 
        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
        String(now.getDate()).padStart(2, '0') + ' ' + 
        String(now.getHours()).padStart(2, '0') + ':' + 
        String(now.getMinutes()).padStart(2, '0')
    },
    resetData() {
      this.reportId = ''
      this.generateTime = ''
      this.coreMetrics = []
      this.environmentData = []
      this.suggestions = []
      this.analysis = {
        growth: '',
        difficulty: '',
        suggestion: '',
        market: ''
      }
    },
    async startAnalysis() {
      this.loading = true
      try {
        // 根据类型构建不同的参数
        const params = this.fishData 
          ? {
              speciesId: this.fishData.speciesId,
              fishSpeciesName: this.fishData.fishSpeciesName,
              fishName: this.fishData.fishName,
            }
          : {
              germplasmId: this.vegetableData.germplasmId,
              germplasmName: this.vegetableData.germplasmName,
              cropName: this.vegetableData.cropName,
            }
        
        // 使用重命名后的方法
        const response = this.fishData 
          ? await addSpeciesData(params)  // 鱼类分析
          : await addGermplasmData(params)  // 农作物分析

        if (response.code === 200) {
          // 重新加载数据
          await this.initData()
        }
      } catch (error) {
        this.$modal.msgError('开始分析失败')
        console.error('开始分析失败:', error)
      } finally {
        this.loading = false
      }
    },
    // 获取指标对应的图标
    getMetricIcon(name) {
      const iconMap = {
        '生长速度': 'el-icon-timer',
        '抗病能力': 'el-icon-first-aid-kit',
        '饲料转化率': 'el-icon-food',
        '肥料转化率': 'el-icon-box',
        '市场认可度': 'el-icon-shopping-cart-full'
      }
      return iconMap[name] || 'el-icon-data-line'
    },
    // 获取指标对应的颜色
    getMetricColor(type) {
      const colorMap = {
        primary: '#409EFF',
        success: '#67C23A',
        warning: '#E6A23C',
        info: '#909399'
      }
      return colorMap[type] || '#409EFF'
    },
    // 获取建议对应的图标
    getSuggestionIcon(title) {
      const iconMap = {
        '水质管理': 'el-icon-water-cup',
        '水分管理': 'el-icon-umbrella',
        '投喂管理': 'el-icon-food',
        '肥料管理': 'el-icon-box',
        '疾病防控': 'el-icon-first-aid-kit',
        '病虫害防治': 'el-icon-first-aid-kit',
        '环境监控': 'el-icon-monitor'
      }
      return iconMap[title] || 'el-icon-s-opportunity'
    },
    handleExport() {
      const exportData = {
        title: this.title,
        reportId: this.reportId,
        basicInfo: {
          name: this.getName,
          type: this.getTypeName,
          id: this.getId
        },
        coreMetrics: this.coreMetrics,
        environmentData: this.environmentData,
        suggestions: this.suggestions,
        analysis: this.analysis
      }

      this.$download(
        'common/export/aiReport',
        exportData,
        `AI分析报告_${this.getName}_${new Date().getTime()}.pdf`
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.ai-report-dialog {
  ::v-deep .el-dialog {
    max-width: 1400px;
    margin: 30px auto;
    
    .el-dialog__body {
      padding: 20px;
      height: 600px;
      overflow: hidden;
    }
  }
  
  .ai-report-content {
    height: 100%;

    .el-row {
      height: 100%;
      margin: 0 -10px;
      
      .el-col {
        height: 100%;
        padding: 0 10px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
    }

    .section-title {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      
      i {
        font-size: 16px;
        margin-right: 8px;
        color: #409EFF;
      }
      
      span {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
      }
    }

    // 左侧样式
    .info-card {
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      
      .image-wrapper {
        width: 140px;
        height: 100px;
        margin: 0 auto 16px;
        overflow: hidden;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 8px;
        }
      }
      
      .info-content {
        h2 {
          margin: 0 0 8px;
          font-size: 18px;
          color: #303133;
        }
        
        .type-tag {
          display: inline-block;
          padding: 2px 8px;
          background: #f0f9eb;
          color: #67c23a;
          border-radius: 4px;
          font-size: 13px;
          margin-bottom: 12px;
        }
        
        .meta-info {
          color: #909399;
          font-size: 13px;
          
          div {
            margin-bottom: 4px;
            
            i {
              margin-right: 4px;
            }
          }
        }
      }
    }

    .metrics-card {
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      flex: 1;
      
      .metrics-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        
        .metric-item {
          background: #f8f9fb;
          padding: 12px;
          border-radius: 6px;
          
          .metric-header {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            
            i {
              font-size: 16px;
              margin-right: 8px;
              color: #409EFF;
            }
            
            span {
              color: #606266;
              font-size: 13px;
            }
            
            .value {
              margin-left: auto;
              font-size: 15px;
              font-weight: 600;
              color: #303133;
            }
          }
        }
      }
    }

    // 右侧样式
    .params-card {
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      height: 50%;
      margin-bottom: 30px;
      
      ::v-deep .el-table {
        border-radius: 6px;
        overflow: hidden;
      }
    }

    .suggestions-card {
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      height: calc(58% - 30px);
      
      .suggestions-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr);
        gap: 12px;
        margin-top: 20px;
        height: calc(100% - 56px);
        
        .suggestion-item {
          background: #f8f9fb;
          padding: 12px;
          border-radius: 6px;
          display: flex;
          gap: 12px;
          
          .suggestion-icon {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            background: rgba(64,158,255,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            
            i {
              font-size: 16px;
              color: #409EFF;
            }
          }
          
          .suggestion-content {
            flex: 1;
            
            h4 {
              margin: 0 0 6px;
              font-size: 14px;
              color: #303133;
            }
            
            p {
              margin: 0;
              font-size: 12px;
              color: #606266;
              line-height: 1.6;
            }
          }
        }
      }
    }

    .analysis-card {
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      height: 100%;
      
      .analysis-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        
        .analysis-item {
          background: #f8f9fb;
          padding: 12px;
          border-radius: 6px;
          
          h4 {
            margin: 0 0 8px;
            font-size: 14px;
            color: #303133;
            display: flex;
            align-items: center;
            
            &::before {
              content: '';
              width: 4px;
              height: 14px;
              background: #409EFF;
              margin-right: 8px;
              border-radius: 2px;
            }
          }
          
          p {
            margin: 0;
            font-size: 12px;
            color: #606266;
            line-height: 1.6;
          }
        }
      }
    }
  }

  .no-analysis-content {
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;

    .el-button {
      min-width: 120px;
    }
  }
}
</style> 