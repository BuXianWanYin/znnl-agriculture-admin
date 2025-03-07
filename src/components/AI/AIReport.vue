<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="title"
    width="85%"
    class="ai-report-dialog"
    :close-on-click-modal="true"
    @close="handleClose"
  >
    <div v-loading="loading" 
         element-loading-text="加载中..."
         element-loading-background="rgba(255, 255, 255, 0.9)"
         class="report-container">
      <!-- 使用 v-show 代替 v-if 来避免重新渲染导致的闪烁 -->
      <div v-show="!loading && !hasAnalysis" class="no-analysis-content">
        <el-empty description="暂无分析报告">
          <el-button type="primary" 
                     @click="startAnalysis" 
                     :loading="analyzing">
            {{ analyzing ? '分析中...' : '开始智能分析' }}
          </el-button>
        </el-empty>
      </div>

      <div v-show="!loading && hasAnalysis" class="ai-report-content">
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
                    v-if="metric.percentage"
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
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" 
                 icon="el-icon-download" 
                 @click="handleExport"
                 v-show="!loading && hasAnalysis">
        导出报告
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
    import { getData as getSpeciesData, addData as addSpeciesData } from "@/api/fishingGround/species";
    import { getData as getGermplasmData, addData as addGermplasmData } from "@/api/agriculture/germplasm";
    import jsPDF from 'jspdf'
    import html2canvas from 'html2canvas'
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
      loading: false,    // 用于控制整体加载状态
      analyzing: false,  // 用于控制分析按钮状态
      initialized: false, // 用于控制初始化状态
      progressRules: {
        percentage: {
          type: Number,
          required: true,
          validator: function(value) {
            return value >= 0 && value <= 100
          }
        }
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
    visible: {
      immediate: true,
      async handler(val) {
        if (val && !this.initialized) {
          this.loading = true
          this.dialogVisible = true
          
          try {
            const getData = this.fishData ? getSpeciesData : getGermplasmData
            const response = await getData(this.getId)
            
            const data = response.data?.[0]
            const hasValidData = data && (
              data.growthRate || 
              data.diseaseResistance ||
              data.feedConversion ||
              data.marketAcceptance
            )

            if (hasValidData) {
              await this.initData(data)
              this.hasAnalysis = true
            } else {
              this.resetData()
              this.hasAnalysis = false
            }
          } catch (error) {
            console.error('检查分析报告失败:', error)
            this.resetData()
            this.hasAnalysis = false
          } finally {
            this.loading = false
            this.initialized = true
          }
        } else if (!val) {
          this.dialogVisible = false
          this.initialized = false
          this.resetData()
        }
      }
    },
    dialogVisible(val) {
      if (!val) {
        this.resetData()
      }
      this.$emit('update:visible', val)
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false
      this.resetData()
    },
    async initData(data) {
      if (!data) return

      try {
        // 生成报告ID
        this.reportId = data.id || ('AI' + Math.random().toString().slice(2, 8))
        
        // 设置生成时间
        this.generateTime = this.parseTime(data.createTime)

        // 只有当确实有数据时才更新各项指标
        if (data.growthRate || data.diseaseResistance || 
            data.feedConversion || data.marketAcceptance) {
          
          // 更新核心指标
          this.coreMetrics = [
            {
              name: '生长速度',
              value: (data.growthRate || 0) + '%',
              percentage: this.normalizePercentage(data.growthRate),
              type: 'primary'
            },
            {
              name: '抗病能力',
              value: (data.diseaseResistance || 0) + '%',
              percentage: this.normalizePercentage(data.diseaseResistance),
              type: 'success'
            },
            {
              name: this.fishData ? '饲料转化率' : '肥料转化率',
              value: (data.feedConversion || 0) + '%',
              percentage: this.normalizePercentage(data.feedConversion),
              type: 'warning'
            },
            {
              name: '市场认可度',
              value: (data.marketAcceptance || 0) + '%',
              percentage: this.normalizePercentage(data.marketAcceptance),
              type: 'info'
            }
          ].map(metric => ({
            ...metric,
            icon: this.getMetricIcon(metric.name),
            color: this.getMetricColor(metric.type)
          }))

          // 更新环境参数数据
          const envParams = this.fishData 
            ? [
                {
                  name: '水温要求',
                  value: this.parseJsonString(data.optimalWaterTemperature)?.[0] || '-',
                  description: this.parseJsonString(data.optimalWaterTemperature)?.[1] || '-'
                },
                {
                  name: '水体pH值',
                  value: this.parseJsonString(data.optimalWaterPh)?.[0] || '-',
                  description: this.parseJsonString(data.optimalWaterPh)?.[1] || '-'
                },
                {
                  name: '溶解氧',
                  value: this.parseJsonString(data.optimalDissolvedOxygen)?.[0] || '-',
                  description: this.parseJsonString(data.optimalDissolvedOxygen)?.[1] || '-'
                },
                {
                  name: '氨氮含量',
                  value: this.parseJsonString(data.optimalAmmonia)?.[0] || '-',
                  description: this.parseJsonString(data.optimalAmmonia)?.[1] || '-'
                }
              ]
            : [
                {
                  name: '温度要求',
                  value: this.parseJsonString(data.optimalTemperature)?.[0] || '-',
                  description: this.parseJsonString(data.optimalTemperature)?.[1] || '-'
                },
                {
                  name: '湿度要求',
                  value: this.parseJsonString(data.optimalHumidity)?.[0] || '-',
                  description: this.parseJsonString(data.optimalHumidity)?.[1] || '-'
                },
                {
                  name: '光照要求',
                  value: this.parseJsonString(data.optimalLight)?.[0] || '-',
                  description: this.parseJsonString(data.optimalLight)?.[1] || '-'
                },
                {
                  name: '土壤pH值',
                  value: this.parseJsonString(data.optimalSoilPh)?.[0] || '-',
                  description: this.parseJsonString(data.optimalSoilPh)?.[1] || '-'
                }
              ]

          this.environmentData = envParams

          // 更新建议数据
          this.suggestions = [
            {
              title: this.fishData ? '水质管理' : '水分管理',
              content: data.waterManagement
            },
            {
              title: this.fishData ? '投喂管理' : '肥料管理',
              content: data.feedingManagement
            },
            {
              title: '疾病防控',
              content: data.diseasePrevention
            },
            {
              title: '环境监控',
              content: data.environmentMonitoring
            }
          ].map(suggestion => ({
            ...suggestion,
            icon: this.getSuggestionIcon(suggestion.title)
          }))

          // 更新分析数据
          this.analysis = {
            growth: data.growthAssessment,
            difficulty: data.cultivationDifficulty,
            suggestion: data.generalRecommendations,
            market: data.marketAnalysis
          }
        }
      } catch (error) {
        console.error('初始化数据失败:', error)
        this.resetData()
      }
    },
    parseTime(time, pattern) {
      if (!time) {
        return ''
      }
      // 将时间字符串转换为本地时间
      const date = new Date(time)
      // 获取本地时区偏移量（分钟）
      const timezoneOffset = date.getTimezoneOffset()
      // 调整时间，加上时区偏移
      const localDate = new Date(date.getTime() - timezoneOffset * 60000)
      
      const year = localDate.getFullYear()
      const month = localDate.getMonth() + 1
      const day = localDate.getDate()
      const hour = localDate.getHours()
      const minute = localDate.getMinutes()

      if (pattern) {
        return pattern
          .replace('{y}', year)
          .replace('{m}', month.toString().padStart(2, '0'))
          .replace('{d}', day.toString().padStart(2, '0'))
          .replace('{h}', hour.toString().padStart(2, '0'))
          .replace('{i}', minute.toString().padStart(2, '0'))
      }

      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    },
    resetData() {
      // 重置时不改变 loading 状态
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
      this.hasAnalysis = false
    },
    async startAnalysis() {
      if (this.analyzing) return
      
      this.analyzing = true
      this.hasAnalysis = false
      
      try {
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
        
        const addData = this.fishData ? addSpeciesData : addGermplasmData
        const response = await addData(params)

        if (response.code === 200) {
          const getData = this.fishData ? getSpeciesData : getGermplasmData
          const dataResponse = await getData(this.getId)
          
          if (dataResponse.data?.[0]) {
            await this.initData(dataResponse.data[0])
            this.hasAnalysis = true
          }
        }
      } catch (error) {
        this.$modal.msgError('开始分析失败')
        console.error('开始分析失败:', error)
        this.resetData()
      } finally {
        this.analyzing = false
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
    async handleExport() {
      const loading = this.$loading({
        lock: true,
        text: '正在生成报告...',
        spinner: 'el-icon-loading',
        background: 'rgba(255, 255, 255, 0.7)'
      })

      try {
        // 获取要导出的内容元素
        const element = document.querySelector('.ai-report-content')
        if (!element) {
          throw new Error('找不到要导出的内容')
        }

        // 创建临时容器和样式
        const container = document.createElement('div')
        container.style.position = 'absolute'
        container.style.left = '-9999px'
        container.style.width = '800px' // 固定宽度以获得更好的布局
        container.style.backgroundColor = '#fff'
        container.style.padding = '40px'

        // 创建报告头部
        const header = document.createElement('div')
        header.style.textAlign = 'center'
        header.style.marginBottom = '30px'
        header.innerHTML = `
          <h1 style="font-size: 24px; margin-bottom: 20px;">${this.title}</h1>
          <div style="color: #666; font-size: 14px;">
            <span>报告编号：${this.reportId}</span>
            <span style="margin-left: 20px;">生成时间：${this.generateTime}</span>
          </div>
        `
        container.appendChild(header)

        // 克隆并优化内容
        const clone = element.cloneNode(true)
        
        // 移除不需要的元素和样式
        const elementsToRemove = clone.querySelectorAll('.el-button, .el-dialog__footer')
        elementsToRemove.forEach(el => el.remove())

        // 优化表格样式
        const tables = clone.querySelectorAll('.el-table')
        tables.forEach(table => {
          table.style.width = '100%'
          table.style.borderCollapse = 'collapse'
          table.style.marginBottom = '20px'
        })

        // 优化进度条样式
        const progressBars = clone.querySelectorAll('.el-progress')
        progressBars.forEach(bar => {
          bar.style.marginBottom = '10px'
        })

        // 优化卡片样式
        const cards = clone.querySelectorAll('.el-card')
        cards.forEach(card => {
          card.style.marginBottom = '20px'
          card.style.boxShadow = 'none'
          card.style.border = '1px solid #ebeef5'
        })

        container.appendChild(clone)
        document.body.appendChild(container)

        try {
          // 创建 PDF
          const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
            compress: true
          })

          // 转换为图片
          const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: container.offsetWidth,
            height: container.offsetHeight
          })

          // 获取页面尺寸
          const pageWidth = pdf.internal.pageSize.getWidth()
          const pageHeight = pdf.internal.pageSize.getHeight()

          // 计算图片尺寸
          const imgWidth = pageWidth - 20
          const imgHeight = (canvas.height * imgWidth) / canvas.width

          // 分页处理
          let heightLeft = imgHeight
          let position = 10
          let page = 1

          // 添加第一页
          pdf.addImage(canvas, 'JPEG', 10, position, imgWidth, imgHeight)
          heightLeft -= (pageHeight - position)

          // 添加后续页面
          while (heightLeft > 0) {
            pdf.addPage()
            page++
            pdf.addImage(canvas, 'JPEG', 10, position - imgHeight + heightLeft, imgWidth, imgHeight)
            heightLeft -= pageHeight
          }

          // 添加页码
          for (let i = 1; i <= page; i++) {
            pdf.setPage(i)
            pdf.setFontSize(10)
            pdf.setTextColor(128, 128, 128)
            pdf.text(`第 ${i} 页 / 共 ${page} 页`, pageWidth / 2, pageHeight - 10, { align: 'center' })
          }

          // 保存文件
          const fileName = `AI分析报告_${this.getName}_${this.parseTime(new Date(), '{y}{m}{d}{h}{i}')}.pdf`
          pdf.save(fileName)

          this.$message({
            message: '导出成功',
            type: 'success'
          })
        } finally {
          // 清理临时容器
          document.body.removeChild(container)
        }
      } catch (error) {
        console.error('导出报告失败:', error)
        this.$message({
          message: '导出失败：' + (error.message || '未知错误'),
          type: 'error'
        })
      } finally {
        loading.close()
      }
    },
    // 添加一个新的辅助方法来解析JSON字符串
    parseJsonString(jsonStr) {
      try {
        return JSON.parse(jsonStr)
      } catch (e) {
        console.warn('JSON解析失败:', e)
        return null
      }
    },
    normalizePercentage(value) {
      const num = Number(value || 0)
      // 确保值在 0-100 之间
      return Math.min(Math.max(num, 0), 100)
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
      max-height: calc(90vh - 120px);
      overflow: hidden;
    }
  }
  
  .report-container {
    height: 100%;
    position: relative;
  }
  
  .no-analysis-content,
  .ai-report-content {
    // 添加淡入淡出效果
    transition: opacity 0.3s ease;
    opacity: 1;
  }

  // 当正在加载时隐藏内容
  &[loading] {
    .no-analysis-content,
    .ai-report-content {
      opacity: 0;
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
        gap: 15px;
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
      padding: 12px;
      text-align: center;
      
      .image-wrapper {
        width: 140px;
        height: 90px;
        margin: 0 auto 12px;
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
          margin: 0 0 6px;
          font-size: 16px;
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
      height: 45%;
      margin-bottom: 15px;
      
      ::v-deep .el-table {
        border-radius: 6px;
        overflow: hidden;
      }
    }

    .suggestions-card {
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      height: calc(55% - 15px);
      
      .suggestions-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr);
        gap: 10px;
        margin-top: 15px;
        height: calc(100% - 56px);
        
        .suggestion-item {
          background: #f8f9fb;
          padding: 10px;
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
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
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
        gap: 10px;
        
        .analysis-item {
          background: #f8f9fb;
          padding: 10px;
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
            display: -webkit-box;
            -webkit-line-clamp: 4;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      }
    }
  }

  .no-analysis-content {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;

    .el-button {
      min-width: 120px;
    }
  }
}
</style> 