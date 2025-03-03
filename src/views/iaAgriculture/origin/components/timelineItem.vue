<template>
    <div class="timeline-item" :class="{'mobile-item': isMobile}">
      <!-- 桌面端横向时间轴 -->
      <div v-if="!isMobile" class="desktop-timeline-item">
        <div class="timeline-dot" :class="{ 'completed': isCompleted, 'in-progress': isInProgress }">
          <i class="el-icon-check" v-if="isCompleted"></i>
          <i class="el-icon-loading" v-else-if="isInProgress"></i>
        </div>
        <div class="timeline-connector" :class="{'active-connector': isCompleted || isInProgress}" v-if="index !== tasks.length - 1"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="timeline-title">{{ task.taskName }}</span>
            <el-tag size="small" :type="getStatusType" effect="dark">{{ getStatusText }}</el-tag>
          </div>
          
          
          <!-- 实际日期（如果有） -->
          <div class="timeline-date actual-date" v-if="task.actualStart || task.actualFinish">
            <span>{{ formatDate(task.actualStart) }} ~ {{ formatDate(task.actualFinish) }}</span>
          </div>
          
          <div class="timeline-desc" v-if="task.taskDesc">{{ task.taskDesc }}</div>
          <div class="timeline-info" v-if="task.taskHeadName">
            <span class="info-label">操作人：</span>
            <span class="info-value">{{ task.taskHeadName }}</span>
          </div>
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
              <!-- 添加负责人信息在卡片头部 -->
              <div class="task-operator" v-if="task.taskHeadName">
                <i class="el-icon-user"></i>
                <span>{{ task.taskHeadName }}</span>
              </div>
              <div class="task-date">{{ formatDate(task.planStart) }}</div>
              <div class="expand-icon">
                <i :class="expanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
              </div>
            </div>
          </div>
          
          <transition name="slide-fade">
            <div class="card-content" v-show="expanded">
              <!-- 计划日期范围 -->
              <div class="task-date-range" v-if="task.planStart || task.planFinish">
                <i class="el-icon-date"></i>
                <div class="date-content">
                  <!-- 实际日期 -->
                  <div class="date-item" v-if="task.actualStart || task.actualFinish">
                    <span class="label">日期：</span>
                    <span class="value">{{ formatDate(task.actualStart) }} ~ {{ formatDate(task.actualFinish) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="task-operator-details" v-if="task.taskHeadName">
                <i class="el-icon-user"></i>
                <span class="label">操作人：</span>
                <span class="value">{{ task.taskHeadName }}</span>
              </div>
              
              <div class="task-desc" v-if="task.taskDesc">
                <i class="el-icon-document"></i>
                <div class="desc-content">{{ task.taskDesc }}</div>
              </div>
              
              <div class="task-info" v-if="task.info">
                <i class="el-icon-info"></i>
                <div class="info-content">
                  <div v-for="(item, key) in parseTaskInfo" :key="key" class="info-item">
                    <span class="label">{{ item.label }}：</span>
                    <span class="value">{{ item.value }}</span>
                  </div>
                </div>
              </div>
              
              <div class="task-images" v-if="task.images && task.images.length">
                <i class="el-icon-picture-outline"></i>
                <div class="image-grid">
                  <el-image 
                    v-for="(img, index) in task.images" 
                    :key="index" 
                    :src="img" 
                    fit="cover"
                    :preview-src-list="task.images"
                    lazy>
                    <div slot="error" class="image-error">
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
        expanded: this.index === 0 // 默认展开第一个任务
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
    width: 100%;
    
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
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      border: 1px solid #EBEEF5;
      transition: box-shadow 0.3s ease;
      
      &.expanded {
        box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
      }
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 15px;
        background: #f9f9f9;
        cursor: pointer;
        transition: background 0.2s ease;
        
        &:hover {
          background: #f5f7fa;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .task-name {
            font-weight: 500;
            color: #303133;
            font-size: 14px;
          }
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          
          .task-operator {
            display: flex;
            align-items: center;
            font-size: 12px;
            color: #606266;
            
            i {
              font-size: 14px;
              margin-right: 3px;
              color: #909399;
            }
          }
          
          .task-date {
            font-size: 12px;
            color: #909399;
          }
          
          .expand-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            
            i {
              color: #909399;
              font-size: 14px;
              transition: transform 0.3s;
            }
          }
        }
      }
      
      .card-content {
        padding: 15px;
        border-top: 1px solid #EBEEF5;
        
        .task-date-range,
        .task-operator-details,
        .task-desc,
        .task-info,
        .task-images {
          display: flex;
          margin-bottom: 15px;
          font-size: 13px;
          
          i {
            margin-right: 8px;
            color: #909399;
            font-size: 16px;
            margin-top: 2px;
          }
        }
        
        .task-date-range {
          align-items: flex-start;
          
          .date-content {
            flex: 1;
            
            .date-item {
              margin-bottom: 4px;
              
              &:last-child {
                margin-bottom: 0;
              }
              
              .label {
                color: #606266;
                font-weight: 500;
                margin-right: 4px;
              }
              
              .value {
                color: #909399;
              }
              
              &:last-child .value {
                color: #67C23A;
              }
            }
          }
        }
        
        .task-operator-details {
          .label {
            color: #909399;
            margin-right: 4px;
          }
          
          .value {
            color: #606266;
            font-weight: 500;
          }
        }
        
        .task-desc {
          align-items: flex-start;
          
          .desc-content {
            flex: 1;
            color: #606266;
            line-height: 1.6;
          }
        }
        
        .task-info {
          align-items: flex-start;
          
          .info-content {
            flex: 1;
            
            .info-item {
              padding: 8px 12px;
              background: #f5f7fa;
              border-radius: 6px;
              margin-bottom: 8px;
              
              &:last-child {
                margin-bottom: 0;
              }
              
              .label {
                color: #909399;
              }
              
              .value {
                color: #606266;
                font-weight: 500;
              }
            }
          }
        }
        
        .task-images {
          align-items: flex-start;
          
          .image-grid {
            flex: 1;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            
            .el-image {
              width: calc(33.33% - 6px);
              height: 90px;
              border-radius: 6px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              transition: transform 0.2s;
              
              &:active {
                transform: scale(0.98);
              }
              
              .image-error {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 100%;
                background-color: #f5f7fa;
                color: #909399;
                
                i {
                  font-size: 24px;
                  margin: 0;
                }
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
  
  @media screen and (max-width: 768px) {
    .mobile-timeline-item {
      .timeline-card {
        .card-content {
          .task-images {
            .image-grid {
              .el-image {
                width: calc(33.33% - 6px);
                height: 80px;
              }
            }
          }
        }
      }
    }
  }
  
  @media screen and (max-width: 480px) {
    .mobile-timeline-item {
      .timeline-card {
        .card-header {
          flex-wrap: wrap;
          
          .header-left {
            margin-bottom: 5px;
            width: 100%;
          }
          
          .header-right {
            width: 100%;
            justify-content: space-between;
          }
        }
        
        .card-content {
          .task-images {
            .image-grid {
              .el-image {
                width: calc(50% - 4px);
                height: 100px;
              }
            }
          }
        }
      }
    }
  }
  </style>
  