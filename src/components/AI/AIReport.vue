<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="title"
    width="60%"
    class="ai-report-dialog"
    :close-on-click-modal="true"
    @close="handleClose"
  >
    <div class="ai-report-content">
      <!-- 顶部信息卡片 -->
      <div class="report-header-card">
        <div class="header-left">
          <div class="image-wrapper">
            <img :src="getImageUrl" :alt="getName" class="subject-image">
          </div>
          <div class="basic-info">
            <div class="info-title">
              <h2>{{ getName }}</h2>
              <span class="type-name">{{ getTypeName }}</span>
            </div>
            <div class="report-meta">
              <div class="meta-item">
                <i class="el-icon-document"></i>
                <span>编号: {{ reportId }}</span>
              </div>
              <div class="meta-item">
                <i class="el-icon-time"></i>
                <span>生成时间: {{ generateTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 核心指标 -->
      <div class="core-metrics">
        <div class="section-title">
          <i class="el-icon-data-line"></i>
          <span>核心指标</span>
        </div>
        <el-row :gutter="20">
          <el-col :span="6" v-for="(metric, index) in coreMetrics" :key="index">
            <div class="metric-card" :class="metric.type">
              <div class="metric-icon">
                <i :class="metric.icon"></i>
              </div>
              <div class="metric-info">
                <div class="metric-name">{{ metric.name }}</div>
                <div class="metric-value">{{ metric.value }}</div>
                <el-progress 
                  :percentage="metric.percentage"
                  :color="metric.color"
                  :show-text="false"
                  :stroke-width="4"
                />
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 环境参数 -->
      <div class="environment-params">
        <div class="section-title">
          <i class="el-icon-setting"></i>
          <span>环境参数</span>
        </div>
        <el-table :data="environmentData" style="width: 100%" :stripe="true">
          <el-table-column prop="name" label="参数名称" width="180"/>
          <el-table-column prop="value" label="标准范围"/>
          <el-table-column prop="description" label="说明"/>
        </el-table>
      </div>

      <!-- 养殖建议 -->
      <div class="breeding-suggestions">
        <div class="section-title">
          <i class="el-icon-s-opportunity"></i>
          <span>养殖建议</span>
        </div>
        <div class="suggestions-container">
          <div class="suggestion-card" v-for="(suggestion, index) in suggestions" :key="index">
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

      <!-- 市场前景 -->
      <div class="market-analysis">
        <div class="section-title">
          <i class="el-icon-data-analysis"></i>
          <span>综合评估</span>
        </div>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="analysis-card">
              <h3>生长评估</h3>
              <p>{{ analysis.growth }}</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="analysis-card">
              <h3>养殖难度</h3>
              <p>{{ analysis.difficulty }}</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="analysis-card">
              <h3>综合建议</h3>
              <p>{{ analysis.suggestion }}</p>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 添加底部按钮 -->
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
        suggestion: ''
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

      // 根据传入的数据初始化核心指标
      this.coreMetrics = [
        {
          name: '生长速度',
          value: this.fishData?.growthRate || this.vegetableData?.growthRate || '85%',
          percentage: Number((this.fishData?.growthRate || this.vegetableData?.growthRate || '85%').replace('%','')),
          icon: 'el-icon-timer',
          type: 'primary',
          color: '#409EFF'
        },
        {
          name: '抗病能力',
          value: this.fishData?.diseaseResistance || this.vegetableData?.diseaseResistance || '90%',
          percentage: Number((this.fishData?.diseaseResistance || this.vegetableData?.diseaseResistance || '90%').replace('%','')),
          icon: 'el-icon-first-aid-kit',
          type: 'success',
          color: '#67C23A'
        },
        {
          name: this.fishData ? '饲料转化率' : '肥料转化率',
          value: this.fishData?.feedConversion || this.vegetableData?.fertilizerConversion || '88%',
          percentage: Number((this.fishData?.feedConversion || this.vegetableData?.fertilizerConversion || '88%').replace('%','')),
          icon: this.fishData ? 'el-icon-food' : 'el-icon-box',
          type: 'warning',
          color: '#E6A23C'
        },
        {
          name: '市场认可度',
          value: this.fishData?.marketAcceptance || this.vegetableData?.marketAcceptance || '92%',
          percentage: Number((this.fishData?.marketAcceptance || this.vegetableData?.marketAcceptance || '92%').replace('%','')),
          icon: 'el-icon-shopping-cart-full',
          type: 'info',
          color: '#909399'
        }
      ]

      // 初始化环境参数数据
      if (this.fishData) {
        this.environmentData = [
          { name: '水温(℃)', value: '22-28', description: '最适生长温度范围' },
          { name: 'pH值', value: '6.5-8.5', description: '保持在此范围内可促进生长' },
          { name: '溶解氧(mg/L)', value: '≥5.0', description: '充足的溶解氧有利于增长' },
          { name: '氨氮(mg/L)', value: '≤0.5', description: '控制在安全范围内' },
          { name: '亚硝酸盐(mg/L)', value: '≤0.1', description: '需严格控制，过高会影响健康' }
        ]
      } else {
        this.environmentData = [
          { name: '温度(℃)', value: '22-28', description: '最适生长温度范围' },
          { name: '湿度(%)', value: '60-80', description: '适宜的湿度有利于生长' },
          { name: '光照(lux)', value: '200-300', description: '充足的光照促进光合作用' },
          { name: '风向', value: '通风良好', description: '保持适当通风' },
          { name: '风速(m/s)', value: '0-3', description: '避免强风影响生长' },
          { name: 'pH值', value: '6.5-8.5', description: '保持在此范围内可促进生长' },
          { name: '土壤含水量(%)', value: '65-75', description: '保持适宜的土壤湿度' }
        ]
      }

      // 初始化养殖/种植建议
      if (this.fishData) {
        this.suggestions = [
          {
            icon: 'el-icon-water-cup',
            title: '水质管理',
            content: this.fishData.waterManagement || '保持水质稳定，溶解氧维持在5mg/L以上，定期检测氨氮、亚硝酸盐等指标。'
          },
          {
            icon: 'el-icon-food',
            title: '投喂管理',
            content: this.fishData.feedingManagement || '建议每7点和16点进行投喂，日投喂量为2-3%，注意观察食欲情况。'
          },
          {
            icon: 'el-icon-first-aid-kit',
            title: '疾病防控',
            content: this.fishData.diseaseControl || '定期消毒，保持良好养殖环境，发现异常及时处理。'
          }
        ]
      } else {
        this.suggestions = [
          {
            icon: 'el-icon-umbrella',
            title: '水分管理',
            content: this.vegetableData?.waterManagement || '根据土壤墒情适时浇水，保持土壤湿润但不积水。'
          },
          {
            icon: 'el-icon-box',
            title: '肥料管理',
            content: this.vegetableData?.fertilizationManagement || '采用有机肥和化肥配合施用，注意氮磷钾比例平衡。'
          },
          {
            icon: 'el-icon-first-aid-kit',
            title: '病虫害防治',
            content: this.vegetableData?.pestControl || '采用综合防治措施，以预防为主，发现病虫害及时处理。'
          }
        ]
      }

      // 初始化综合评估
      if (this.fishData) {
        this.analysis = {
          growth: '生长周期约4-6个月，在适宜的环境条件下生长速度快，成活率高。养殖过程中需要注意水质管理和疾病防控。',
          difficulty: '养殖难度适中，适合规模化养殖。主要考虑因素包括水质管理、投喂管理和疾病防控。新手养殖户建议从小规模开始。',
          suggestion: '建议采用标准化养殖流程，定期监测水质指标，做好防疫工作。可以考虑与其他品种混养，提高单位产出。'
        }
      } else {
        this.analysis = {
          growth: '生长期约60-90天，适应性强，在适宜条件下生长快速。需要注意温度和水分管理，保证充足光照。',
          difficulty: '栽培难度较低，适合大众种植。重点关注水肥管理和病虫害防治。新手种植者可以选择此作物作为入门。',
          suggestion: '建议采用标准化种植技术，合理使用肥料，做好病虫害防治。可以考虑间作或轮作，提高土地利用率。'
        }
      }
    },
    handleExport() {
      // 准备导出数据
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

      // 调用下载方法
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
    max-width: 1000px;
    margin: 0 auto;
    background: #f5f7fa;
    border-radius: 8px;
    
    .el-dialog__header {
      padding: 20px;
      border-bottom: 1px solid #ebeef5;
      background: #fff;
      border-radius: 8px 8px 0 0;
    }
    
    .el-dialog__body {
      padding: 20px;
    }
  }
  
  .ai-report-content {
    .report-header-card {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);

      .header-left {
        display: flex;
        gap: 24px;
        align-items: center;

        .image-wrapper {
          flex-shrink: 0;
          width: 100px;
          height: 100px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #ebeef5;
          
          .subject-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            background: #f8f9fb;
          }
        }

        .basic-info {
          flex: 1;
          
          .info-title {
            margin-bottom: 16px;
            
            h2 {
              margin: 0 0 8px;
              font-size: 20px;
              color: #303133;
              font-weight: 600;
            }

            .type-name {
              display: inline-block;
              padding: 2px 8px;
              background: #f0f9eb;
              color: #67c23a;
              border-radius: 4px;
              font-size: 14px;
            }
          }

          .report-meta {
            display: flex;
            gap: 24px;
            
            .meta-item {
              color: #909399;
              font-size: 14px;
              display: flex;
              align-items: center;
              
              i {
                margin-right: 6px;
                font-size: 16px;
              }
            }
          }
        }
      }
    }

    .section-title {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      
      i {
        font-size: 20px;
        margin-right: 8px;
        color: #409EFF;
      }
      
      span {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .core-metrics {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);

      .metric-card {
        background: #f8f9fb;
        border-radius: 8px;
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 16px;
        transition: all 0.3s;
        
        &:hover {
          transform: translateY(-2px);
        }

        .metric-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          
          i {
            font-size: 24px;
          }
        }

        .metric-info {
          flex: 1;
          
          .metric-name {
            font-size: 14px;
            color: #606266;
            margin-bottom: 4px;
          }
          
          .metric-value {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
          }
        }

        &.primary {
          .metric-icon {
            background: rgba(64,158,255,0.1);
            color: #409EFF;
          }
          .metric-value {
            color: #409EFF;
          }
        }

        &.success {
          .metric-icon {
            background: rgba(103,194,58,0.1);
            color: #67C23A;
          }
          .metric-value {
            color: #67C23A;
          }
        }

        &.warning {
          .metric-icon {
            background: rgba(230,162,60,0.1);
            color: #E6A23C;
          }
          .metric-value {
            color: #E6A23C;
          }
        }

        &.info {
          .metric-icon {
            background: rgba(144,147,153,0.1);
            color: #909399;
          }
          .metric-value {
            color: #909399;
          }
        }
      }

      .el-row {
        margin: 0 -10px;
        
        .el-col {
          padding: 0 10px;
        }
      }
    }

    .environment-params {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
    }

    .breeding-suggestions {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);

      .suggestions-container {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;

        .suggestion-card {
          background: #f8f9fb;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          gap: 16px;
          transition: all 0.3s;
          
          &:hover {
            transform: translateY(-2px);
          }

          .suggestion-icon {
            width: 48px;
            height: 48px;
            background: rgba(64,158,255,0.1);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            
            i {
              font-size: 24px;
              color: #409EFF;
            }
          }

          .suggestion-content {
            flex: 1;
            
            h4 {
              margin: 0 0 8px;
              font-size: 16px;
              color: #303133;
            }
            
            p {
              margin: 0;
              font-size: 14px;
              color: #606266;
              line-height: 1.6;
            }
          }
        }
      }
    }

    .market-analysis {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);

      .analysis-card {
        background: #f8f9fb;
        border-radius: 8px;
        padding: 16px;
        height: 100%;
        transition: all 0.3s;
        
        &:hover {
          transform: translateY(-2px);
        }

        h3 {
          margin: 0 0 12px;
          font-size: 16px;
          color: #303133;
          display: flex;
          align-items: center;
          
          &::before {
            content: '';
            display: inline-block;
            width: 4px;
            height: 16px;
            background: #409EFF;
            margin-right: 8px;
            border-radius: 2px;
          }
        }
        
        p {
          margin: 0;
          font-size: 14px;
          color: #606266;
          line-height: 1.6;
        }
      }

      .el-row {
        margin: 0 -10px;
        
        .el-col {
          padding: 0 10px;
        }
      }
    }
  }

  ::v-deep .el-dialog__footer {
    padding: 20px;
    border-top: 1px solid #ebeef5;
    text-align: center;  // 居中显示按钮
    
    .dialog-footer {
      .el-button {
        padding: 12px 24px;
        font-size: 14px;
        border-radius: 4px;
        transition: all 0.3s;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
        }
      }
    }
  }
}

// 响应式布局
@media screen and (max-width: 1200px) {
  .ai-report-dialog {
    ::v-deep .el-dialog {
      width: 70% !important;
    }
  }
}

@media screen and (max-width: 768px) {
  .ai-report-dialog {
    .ai-report-content {
      .report-header-card {
        .header-left {
          flex-direction: column;
          align-items: flex-start;
          
          .image-wrapper {
            margin: 0 auto;
          }
          
          .basic-info {
            width: 100%;
            
            .info-title {
              text-align: center;
            }
            
            .report-meta {
              flex-direction: column;
              gap: 8px;
            }
          }
        }
      }
    }
  }
}
</style> 