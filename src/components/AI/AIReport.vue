<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="title"
    width="85%"
    class="ai-report-dialog"
    :close-on-click-modal="true"
    @close="handleClose"
  >
    <div class="ai-report-content">
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
      <el-button type="primary" icon="el-icon-download" @click="handleExport">导出报告</el-button>
    </div>
  </el-dialog>
</template>

<script>
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
      coreMetrics: [
        {
          name: '生长速度',
          value: '85%',
          percentage: 85,
          icon: 'el-icon-timer',
          type: 'primary',
          color: '#409EFF'
        },
        {
          name: '抗病能力',
          value: '90%',
          percentage: 90,
          icon: 'el-icon-first-aid-kit',
          type: 'success',
          color: '#67C23A'
        },
        {
          name: '饲料转化率',
          value: '88%',
          percentage: 88,
          icon: 'el-icon-food',
          type: 'warning',
          color: '#E6A23C'
        },
        {
          name: '市场认可度',
          value: '92%',
          percentage: 92,
          icon: 'el-icon-shopping-cart-full',
          type: 'info',
          color: '#909399'
        }
      ],
      environmentData: [],
      suggestions: [],
      analysis: {
        growth: '',
        difficulty: '',
        suggestion: '',
        market: ''
      }
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
      return this.fishData?.speciesId || this.vegetableData?.germplasmId || '未知'
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
    initData() {
      // 生成报告ID
      this.reportId = 'AI' + Math.random().toString().slice(2, 8)
      
      // 设置生成时间
      const now = new Date()
      this.generateTime = now.getFullYear() + '-' + 
        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
        String(now.getDate()).padStart(2, '0') + ' ' + 
        String(now.getHours()).padStart(2, '0') + ':' + 
        String(now.getMinutes()).padStart(2, '0')

      // 更新核心指标的名称和图标
      if (this.fishData) {
        this.coreMetrics[2].name = '饲料转化率'
        this.coreMetrics[2].icon = 'el-icon-food'
      } else {
        this.coreMetrics[2].name = '肥料转化率'
        this.coreMetrics[2].icon = 'el-icon-box'
      }

      // 初始化环境参数数据
      if (this.fishData) {
        this.environmentData = [
          { name: '水温(℃)', value: '22-28', description: '最适生长温度范围' },
          { name: 'pH值', value: '6.5-8.5', description: '保持在此范围内可促进生长' },
          { name: '溶解氧(mg/L)', value: '≥5.0', description: '充足的溶解氧有利于增长' },
          { name: '氨氮(mg/L)', value: '≤0.5', description: '控制在安全范围内' },
          { name: '亚硝酸盐(mg/L)', value: '≤0.1', description: '需严格控制，过高会影响健康' }
        ]
        
        // 初始化养殖建议
        this.suggestions = [
          {
            icon: 'el-icon-water-cup',
            title: '水质管理',
            content: '保持水质稳定，溶解氧维持在5mg/L以上，定期检测氨氮、亚硝酸盐等指标。'
          },
          {
            icon: 'el-icon-food',
            title: '投喂管理',
            content: '建议每7点和16点进行投喂，日投喂量为2-3%，注意观察食欲情况。'
          },
          {
            icon: 'el-icon-first-aid-kit',
            title: '疾病防控',
            content: '定期消毒，保持良好养殖环境，发现异常及时处理。'
          },
          {
            icon: 'el-icon-monitor',
            title: '环境监控',
            content: '实时监测水温、pH值等关键指标，确保养殖环境稳定。'
          }
        ]
        
        // 初始化综合评估
        this.analysis = {
          growth: '生长周期约4-6个月，在适宜的环境条件下生长速度快，成活率高。养殖过程中需要注意水质管理和疾病防控。',
          difficulty: '养殖难度适中，适合规模化养殖。主要考虑因素包括水质管理、投喂管理和疾病防控。新手养殖户建议从小规模开始。',
          suggestion: '建议采用标准化养殖流程，定期监测水质指标，做好防疫工作。可以考虑与其他品种混养，提高单位产出。',
          market: '市场前景广阔，需求稳定，价格波动较小。建议关注市场行情，合理安排养殖计划。'
        }
      } else {
        this.environmentData = [
          { name: '温度(℃)', value: '22-28', description: '最适生长温度范围' },
          { name: '湿度(%)', value: '60-80', description: '适宜的湿度有利于生长' },
          { name: '光照(lux)', value: '200-300', description: '充足的光照促进光合作用' },
          { name: '风向', value: '通风良好', description: '保持适当通风' },
          { name: '风速(m/s)', value: '0-3', description: '避免强风影响生长' },
          { name: 'pH值', value: '6.5-8.5', description: '保持在此范围内可促进生长' }
        ]
        
        // 初始化种植建议
        this.suggestions = [
          {
            icon: 'el-icon-umbrella',
            title: '水分管理',
            content: '根据土壤墒情适时浇水，保持土壤湿润但不积水。'
          },
          {
            icon: 'el-icon-box',
            title: '肥料管理',
            content: '采用有机肥和化肥配合施用，注意氮磷钾比例平衡。'
          },
          {
            icon: 'el-icon-first-aid-kit',
            title: '病虫害防治',
            content: '采用综合防治措施，以预防为主，发现病虫害及时处理。'
          },
          {
            icon: 'el-icon-monitor',
            title: '环境监控',
            content: '实时监测土壤湿度、光照等关键指标，确保种植环境稳定。'
          }
        ]
        
        // 初始化综合评估
        this.analysis = {
          growth: '生长期约60-90天，适应性强，在适宜条件下生长快速。需要注意温度和水分管理，保证充足光照。',
          difficulty: '栽培难度较低，适合大众种植。重点关注水肥管理和病虫害防治。新手种植者可以选择此作物作为入门。',
          suggestion: '建议采用标准化种植技术，合理使用肥料，做好病虫害防治。可以考虑间作或轮作，提高土地利用率。',
          market: '市场前景广阔，需求稳定，价格波动较小。建议关注市场行情，合理安排种植计划。'
        }
      }
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
}
</style> 