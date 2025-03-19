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

              <!-- 饵料使用信息 -->
              <div class="resource-section" v-if="type === 1 && task.resources && getBaitResources.length > 0">
                <div class="section-title">饵料使用：</div>
                <div class="resource-list">
                  <el-tag 
                    v-for="(resource, index) in getBaitResources" 
                    :key="index"
                    size="mini"
                    class="resource-tag"
                  >
                    {{ resource.name }}: {{ resource.amount }}{{ resource.unit }}
                  </el-tag>
                </div>
              </div>

              <!-- 用药记录 -->
              <!-- <div class="resource-section" v-if="type === 1 && task.resources && getMedicineResources.length > 0">
                <div class="section-title">用药记录：</div>
                <div class="resource-list">
                  <el-tag 
                    v-for="(resource, index) in getMedicineResources" 
                    :key="index"
                    size="mini"
                    type="warning"
                    class="resource-tag"
                  >
                    {{ resource.name }}: {{ resource.amount }}{{ resource.unit }}
                  </el-tag>
                </div>
              </div> -->

              <!-- 农资使用信息 -->
              <div class="resource-section" v-if="type === 0 && displayResources && displayResources.length">
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
              <div v-if="task.taskImages && task.taskImages.trim()" class="images-section">
                <div class="section-title">工作照片：</div>
                <div class="image-list">
                  <el-image 
                    v-for="(image, index) in getImageArray(task.taskImages)"
                    :key="index"
                    :src="getImageUrl(image)"
                    :preview-src-list="getImageArray(task.taskImages).map(img => getImageUrl(img))"
                    fit="cover"
                    class="task-image"
                  />
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
      },
      type: {
        type: Number,
        required: true
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
        if (this.task.resources) {
          return this.task.resources;
        }
        return [];
      },
      displayMedicines() {
        if (this.type === 1 && this.task.medicines) {
          return this.task.medicines;
        }
        return [];
      },
      // 添加新的计算属性
      isLastItem() {
        return this.index === this.tasks.length - 1;
      },
      getBaitResources() {
        if (this.task.resources) {
          return this.task.resources.filter(r => r.type === 'bait');
        }
        return [];
      },
      getMedicineResources() {
        if (this.task.resources) {
          return this.task.resources.filter(r => r.type === 'medicine');
        }
        return [];
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
      getImageArray(images) {
        if (!images) return [];
        // 处理可能包含完整URL的图片路径
        return images.split(',').map(img => {
          img = img.trim();
          // 如果图片路径已经包含完整URL，需要移除它再处理
          if (img.startsWith(process.env.VUE_APP_BASE_API)) {
            img = img.replace(process.env.VUE_APP_BASE_API, '');
          }
          return img;
        }).filter(img => img);
      },
      getImageUrl(image) {
        if (!image) return '';
        // 移除可能存在的基础URL前缀
        let cleanPath = image;
        if (cleanPath.startsWith(process.env.VUE_APP_BASE_API)) {
          cleanPath = cleanPath.replace(process.env.VUE_APP_BASE_API, '');
        }
        // 确保路径以 /profile 开头
        if (!cleanPath.startsWith('/profile')) {
          cleanPath = '/profile' + cleanPath;
        }
        return process.env.VUE_APP_BASE_API + cleanPath;
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

        .image-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .task-image {
            width: 100%;
            height: 120px;
            border-radius: 4px;
            overflow: hidden;
            
            &::v-deep .el-image__inner {
              object-fit: cover;
              width: 100%;
              height: 100%;
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
    .image-list {
      flex-wrap: wrap;
      
      .task-image {
        width: 100%;
        height: 100px;
      }
    }
  }
  
  @media screen and (min-width: 481px) and (max-width: 768px) {
    .image-list {
      flex-wrap: wrap;
      
      .task-image {
        width: 100%;
        height: 110px;
      }
    }
  }
  </style>
  