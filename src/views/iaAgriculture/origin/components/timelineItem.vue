<template>
    <div class="timeline-item" :class="{'mobile-item': isMobile}">
      <!-- 桌面端横向时间轴 -->
      <div v-if="!isMobile" class="desktop-timeline-item">
        <div class="timeline-dot" :class="{ 'completed': isCompleted, 'in-progress': isInProgress }">
          <i class="el-icon-check" v-if="isCompleted"></i>
          <i class="el-icon-loading" v-else-if="isInProgress"></i>
        </div>
        <div class="timeline-connector" :class="{'active-connector': isCompleted || isInProgress}"></div>
        <div class="timeline-content">
          <div class="details-icon" @click="showDetails">
            <el-button type="text" icon="el-icon-info" circle></el-button>
          </div>
          <div class="timeline-header">
            <span class="timeline-title">{{ task.taskName }}</span>
            <el-tag size="small" :type="getStatusType" effect="dark">{{ getStatusText }}</el-tag>
          </div>
          
          
          <!-- 实际日期（如果有） -->
          <div class="timeline-date actual-date" v-if="task.actualStart || task.actualFinish">
            <span>{{ formatDate(task.actualStart) }} 至 {{ formatDate(task.actualFinish) }}</span>
          </div>
          
          <div class="timeline-desc" v-if="task.taskDesc">{{ task.taskDesc }}</div>
          <div class="timeline-images" v-if="task.images && task.images.length">
            <el-image 
              v-for="(img, index) in task.images" 
              :key="index" 
              :src="img" 
              fit="cover"
              :preview-src-list="task.images">
            </el-image>
          </div>
        </div>
      </div>
      
      <!-- 移动端垂直时间轴 -->
      <div v-else class="mobile-timeline-item">
        <div class="timeline-side">
          <div class="timeline-dot" :class="{ 'completed': isCompleted, 'in-progress': isInProgress }">
            <i class="el-icon-check" v-if="isCompleted"></i>
            <i class="el-icon-loading" v-else-if="isInProgress"></i>
          </div>
          <div class="timeline-line" v-if="index !== tasks.length - 1"></div>
        </div>
        
        <div class="timeline-card" :class="{'expanded': expanded}">
          <div class="card-header" @click="toggleExpand">
            <div class="header-left">
              <div class="task-name">{{ task.taskName }}</div>
              <el-tag size="mini" :type="getStatusType" effect="dark">{{ getStatusText }}</el-tag>
            </div>
            <div class="header-right">
              <div class="expand-icon">
                <i :class="expanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
              </div>
            </div>
          </div>
          
          <transition name="slide-fade">
            <div class="card-content" v-show="expanded">
              <!-- 基本信息 -->
              <div class="info-section">
                <div class="info-item">
                  <span class="label">操作人：</span>
                  <span class="value">{{ task.taskHeadName || '未指定' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">开始时间：</span>
                  <span class="value">{{ formatDate(task.actualStart) || '未开始' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">结束时间：</span>
                  <span class="value">{{ formatDate(task.actualFinish) || '未完成' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">任务状态：</span>
                  <el-tag size="mini" :type="getStatusType">{{ getStatusText }}</el-tag>
                </div>
              </div>

              <!-- 农资使用信息 -->
              <div class="resource-section" v-if="displayResources && displayResources.length">
                <div class="section-title">农资使用：</div>
                <div class="resource-list">
                  <el-tag 
                    v-for="(resource, index) in displayResources" 
                    :key="index"
                    size="mini"
                    class="resource-tag"
                  >
                    {{ resource.name }}: {{ resource.amount }}{{ resource.unit }}
                  </el-tag>
                </div>
              </div>

              <!-- 工作照片 -->
              <div class="images-section" v-if="task.taskImages">
                <div class="section-title">工作照片：</div>
                <div class="image-grid">
                  <el-image 
                    :src="getImageUrl(task.taskImages)"
                    :preview-src-list="[getImageUrl(task.taskImages)]"
                    fit="cover"
                    class="task-image"
                  >
                    <div slot="error" class="image-slot">
                      <i class="el-icon-picture-outline"></i>
                    </div>
                  </el-image>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TimelineItem',
    props: {
      task: {
        type: Object,
        required: true
      },
      index: {
        type: Number,
        required: true
      },
      tasks: {
        type: Array,
        required: true
      },
      isMobile: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        expanded: this.index === 0, // 默认展开第一个任务
        taskDetailsVisible: false,
        currentTask: null,
        // 添加测试数据
        mockResources: [
          { name: '复合肥', amount: '50', unit: 'kg' },
          { name: '农药', amount: '2', unit: 'L' },
          { name: '有机肥', amount: '100', unit: 'kg' }
        ]
      }
    },
    computed: {
      isCompleted() {
        return this.task.status === '3';
      },
      isInProgress() {
        return this.task.status === '2';
      },
      getStatusType() {
        const statusMap = {
          '1': 'info',    // 未开始
          '2': 'warning', // 进行中
          '3': 'success'  // 已完成
        };
        return statusMap[this.task.status] || 'info';
      },
      getStatusText() {
        const statusMap = {
          '1': '未开始',
          '2': '进行中',
          '3': '已完成'
        };
        return statusMap[this.task.status] || '未知状态';
      },
      parseTaskInfo() {
        if (!this.task.info) return [];
        
        try {
          const info = typeof this.task.info === 'string' 
            ? JSON.parse(this.task.info) 
            : this.task.info;
          
          return Object.keys(info).map(key => ({
            label: key,
            value: info[key]
          }));
        } catch (e) {
          console.error('解析任务信息失败:', e);
          return [];
        }
      },
      // 添加测试数据的计算属性
      displayResources() {
        return this.task.resources || this.mockResources;
      },
      // 添加新的计算属性
      isLastItem() {
        return this.index === this.tasks.length - 1;
      }
    },
    methods: {
      toggleExpand() {
        this.expanded = !this.expanded;
      },
      formatDate(dateStr) {
        if (!dateStr) return '';
        
        // 如果是标准日期格式，直接返回完整的年-月-日
        if (dateStr.length === 10 && dateStr.includes('-')) {
          return dateStr;  // 直接返回 YYYY-MM-DD 格式
        }
        
        // 否则返回原格式
        return dateStr;
      },
      showDetails() {
        this.$emit('show-details', this.task);
      },
      // 添加处理图片URL的方法
      getImageUrl(path) {
        if (!path) return '';
        // 如果是完整的URL，直接返回
        if (path.startsWith('http://') || path.startsWith('https://')) {
          return path;
        }
        // 否则添加基础API路径
        return process.env.VUE_APP_BASE_API + path;
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .timeline-item {
    position: relative;
    
    &.mobile-item {
      margin-bottom: 16px;
    }
  }
  
  // 桌面端横向时间轴样式
  .desktop-timeline-item {
    padding: 0 20px;
    min-width: 220px;
    text-align: center;
    position: relative;
    
    .timeline-connector {
      position: absolute;
      top: 10px;
      right: 0;
      width: 100%;
      height: 3px;
      background-color: #EBEEF5;
      z-index: 0;
      
      &.active-connector {
        background: linear-gradient(90deg, #67C23A, #EBEEF5);
      }
    }
    
    .timeline-dot {
      width: 22px;
      height: 22px;
      background-color: #EBEEF5;
      border-radius: 50%;
      margin: 0 auto 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
      border: 2px solid #fff;
      box-shadow: 0 0 0 2px rgba(0,0,0,0.05);
      
      &.completed {
        background-color: #67C23A;
        color: #fff;
        box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2);
      }
      
      &.in-progress {
        background-color: #E6A23C;
        color: #fff;
        box-shadow: 0 0 0 2px rgba(230, 162, 60, 0.2);
      }
      
      i {
        font-size: 12px;
      }
    }
    
    .timeline-content {
      margin-top: 15px;
      padding: 12px;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #EBEEF5;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      transition: transform 0.3s, box-shadow 0.3s;
      position: relative;
      
      .details-icon {
        position: absolute;
        top: 4px;
        right: 4px;
        z-index: 2;

        ::v-deep .el-button {
          padding: 5px;
          font-size: 16px;
          color: #909399;
          
          &:hover {
            color: #409EFF;
          }
        }
      }
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
      }
      
      .timeline-header {
        margin-bottom: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        
        .timeline-title {
          font-weight: 500;
          color: #303133;
          font-size: 15px;
        }
      }
      
      .timeline-date {
        font-size: 12px;
        color: #909399;
        margin-bottom: 6px;
        
        &.actual-date {
          color: #67C23A;
        }
        
        .date-label {
          color: #606266;
          font-weight: 500;
          margin-right: 4px;
        }
      }
      
      .timeline-desc {
        font-size: 12px;
        color: #606266;
        margin-bottom: 8px;
        max-width: 200px;
        text-align: center;
        margin-left: auto;
        margin-right: auto;
        line-height: 1.5;
      }
      
      .timeline-info {
        font-size: 12px;
        color: #909399;
        margin-bottom: 8px;
        
        .info-label {
          color: #606266;
          font-weight: 500;
          margin-right: 4px;
        }
        
        .info-value {
          color: #606266;
        }
      }
      
      .timeline-images {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: center;
        
        .el-image {
          width: 60px;
          height: 60px;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
          
          &:hover {
            transform: scale(1.05);
          }
        }
      }
    }
  }
  
  // 移动端垂直时间轴样式
  .mobile-timeline-item {
    display: flex;
    margin-left: 20px;
    position: relative;
    
    .timeline-side {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-right: 15px;
      margin-right: 5px;
      
      .timeline-dot {
        width: 24px;
        height: 24px;
        background-color: #EBEEF5;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
        border: 2px solid #fff;
        box-shadow: 0 0 0 2px rgba(0,0,0,0.05);
        transition: all 0.3s ease;
        
        &.completed {
          background-color: #67C23A;
          color: #fff;
        }
        
        &.in-progress {
          background-color: #E6A23C;
          color: #fff;
        }
        
        i {
          font-size: 12px;
        }
      }
      
      .timeline-line {
        width: 2px;
        flex-grow: 1;
        background-color: #EBEEF5;
        margin-top: 4px;
      }
    }
    
    .timeline-card {
      flex: 1;
      margin-left: 15px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
      transition: all 0.3s;
      
      &.expanded {
        box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
      }
      
      .card-header {
        padding: 12px 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        position: relative;
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .task-name {
            font-weight: 500;
            color: #303133;
          }
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
          
          .expand-icon {
            color: #909399;
            transition: transform 0.3s;
          }
        }
      }
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px 0 rgba(0,0,0,0.1);
      }
      
      .card-content {
        padding: 15px;
        border-top: 1px solid #EBEEF5;

        .info-section {
          margin-bottom: 20px;

          .info-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            font-size: 14px;

            .label {
              color: #909399;
              min-width: 70px;
            }

            .value {
              color: #303133;
            }
          }
        }

        .resource-section,
        .images-section {
          margin-bottom: 20px;

          .section-title {
            font-size: 14px;
            color: #606266;
            margin-bottom: 12px;
            font-weight: 500;
            border-left: 3px solid #42b983;
            padding-left: 8px;
          }
        }

        .resource-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .resource-tag {
            margin: 2px;
          }
        }

        .image-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr); // 改为两列显示
          gap: 8px;
          padding: 8px 0;
          
          .task-image {
            width: 100%;
            height: 120px; // 调整高度更合理
            border-radius: 4px;
            overflow: hidden;
            
            &::v-deep .el-image__inner {
              object-fit: cover;
              width: 100%;
              height: 100%;
            }
            
            .image-slot {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 100%;
              height: 100%;
              background: #f5f7fa;
              color: #909399;
              
              i {
                font-size: 24px;
              }
            }
          }
        }
      }
    }
  }
  
  // 动画效果
  .slide-fade-enter-active {
    transition: all 0.3s ease;
  }
  .slide-fade-leave-active {
    transition: all 0.2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  .slide-fade-enter, .slide-fade-leave-to {
    transform: translateY(-10px);
    opacity: 0;
  }
  
  // 针对不同屏幕尺寸优化显示
  @media screen and (max-width: 480px) {
    .image-grid {
      grid-template-columns: repeat(2, 1fr); // 小屏幕保持两列
      
      .task-image {
        height: 100px; // 更小屏幕上稍微降低高度
      }
    }
  }
  
  @media screen and (min-width: 481px) and (max-width: 768px) {
    .image-grid {
      grid-template-columns: repeat(3, 1fr); // 中等屏幕显示三列
      
      .task-image {
        height: 110px;
      }
    }
  }
  </style>
  