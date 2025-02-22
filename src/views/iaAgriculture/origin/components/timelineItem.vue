<template>
 <div 
    :key="task.taskId"
    class="timeline-item"
    :class="{
        'line-start': index % 6 === 0,
        'line-end': (index + 1) % 6 === 0 || index === tasks.length - 1,
        'line-middle': index % 6 !== 0 && (index + 1) % 6 !== 0
    }">
    <div class="timeline-node"
        :class="{'is-complete': task.status === '3'}">
        <div class="node-content"></div>
        <div class="node-line" v-if="index !== tasks.length - 1"></div>
        <div class="node-corner" v-if="(index + 1) % 6 === 0 && index !== tasks.length - 1"></div>
    </div>
    <el-card class="task-card" :body-style="{ padding: '10px' }" shadow="hover">
        <div class="task-info">
            <div class="info-item">
                <i class="el-icon-info"></i>
                <el-tag size="small" :type="getStatusType(task.status)">
                    {{ getStatusText(task.status) }}
                </el-tag>
            </div>
            <el-button 
                type="primary" 
                size="mini" 
                @click="handleTrace"
            >追溯</el-button>
        </div>
    </el-card>
    
    <el-dialog
        :title="task.taskName || '任务追溯'"
        :visible.sync="dialogVisible"
        width="600px"
        :close-on-click-modal="false"
        :append-to-body="true"
    >
        <div class="trace-info">
            <div class="info-section">
                <h3>基本信息</h3>
                <div class="info-row">
                    <i class="el-icon-user"></i>
                    <span class="label">负责人：</span>
                    <span class="value">{{ task.taskHeadName }}</span>
                </div>
            </div>
            
            <div class="info-section">
                <h3>计划开始时间</h3>
                <div class="info-row time-row">
                    <i class="el-icon-date"></i>
                    <span class="value">{{ task.planStart }} ~ {{ task.planFinish }}</span>
                </div>
            </div>
            
            <div class="info-section">
                <h3>实际开始时间</h3>
                <div class="info-row time-row">
                    <i class="el-icon-date"></i>
                    <span class="value">{{ task.actualStart }} ~ {{ task.actualFinish }}</span>
                </div>
            </div>
        </div>
    </el-dialog>
</div>
</template>

<script>
export default {
    name: 'TimelineItem',
    props: {
        index: {
            type: Number,
            default: 0
        },
        task: {
            type: Object,
            required: true,
            default: () => ({})
        },
        tasks: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            dialogVisible: false
        }
    },
    methods: {
        getStatusText(status) {
            switch (status) {
                case "1": return "未开始";
                case "2": return "进行中";
                case "3": return "已完成";
                default: return "未知状态";
            }
        },
        getStatusType(status) {
            switch (status) {
                case "1": return "info";
                case "2": return "warning";
                case "3": return "success";
                default: return "info";
            }
        },
        handleTrace() {
            console.log('Opening dialog...'); // 添加调试日志
            this.dialogVisible = true;
        }
    }
}
</script>

<style lang="scss" scoped>
.horizontal-timeline-wrapper {
    padding: 20px 0;
    overflow: hidden;
}

.horizontal-timeline {
    display: flex;
    flex-wrap: wrap;
    gap: 20px 40px;
    padding: 0 20px;
}

.timeline-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: calc((100% - 250px) / 6);
    min-width: 220px;
    position: relative;
    margin-bottom: 40px;

    &.line-start {
        .timeline-node::before {
            display: none;
        }
    }

    &.line-end {
        .node-line {
            display: none;
        }
    }
}

.timeline-node {
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    width: 100%;

    .node-content {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #409EFF;
        z-index: 2;
        position: relative;
    }

    .node-line {
        position: absolute;
        left: 12px;
        width: calc(100% + 28px);
        height: 2px;
        background-color: #E4E7ED;
    }

    .node-corner {
        position: absolute;
        right: -40px;
        width: 2px;
        height: 40px;
        background-color: #E4E7ED;
        bottom: -40px;
        z-index: 1;
    }

    &.is-complete {
        .node-content {
            background-color: #67C23A;
        }
    }
}

.task-card {
    width: 100%;
    margin-bottom: 10px;

    .task-info {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #909399;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid #EBEEF5;

        .info-item {
            display: flex;
            align-items: center;
            max-width: 45%;

            i {
                margin-right: 4px;
                font-size: 12px;
            }

            span {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }
}

// 响应式布局
@media screen and (max-width: 1600px) {
    .timeline-item {
        width: calc((100% - 160px) / 4);
        
        .task-card {
            .task-title {
                font-size: 13px;
            }
        }
    }
}

@media screen and (max-width: 1200px) {
    .timeline-item {
        width: calc((100% - 120px) / 3);
    }
    
    .horizontal-timeline {
        gap: 15px 30px;
    }
}

@media screen and (max-width: 992px) {
    .timeline-item {
        width: calc((100% - 60px) / 2);
        
        .timeline-node {
            .node-corner {
                display: none;
            }
        }
    }
}

@media screen and (max-width: 768px) {
    .timeline-item {
        width: 100%;
        margin-bottom: 30px;
        
        .timeline-node {
            .node-line {
                display: none;
            }
        }
        
        .task-card {
            max-width: 400px;
            margin: 0 auto;
        }
    }
    
    .horizontal-timeline {
        padding: 0 15px;
    }
}

.trace-info {
    padding: 20px;
    
    .info-section {
        margin-bottom: 30px;
        
        &:last-child {
            margin-bottom: 0;
        }
        
        h3 {
            font-size: 16px;
            color: #303133;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #EBEEF5;
        }
    }
    
    .info-row {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        
        &:last-child {
            margin-bottom: 0;
        }
        
        i {
            color: #909399;
            margin-right: 10px;
            font-size: 16px;
        }
        
        .label {
            color: #909399;
            margin-right: 10px;
            min-width: 70px;
        }
        
        .value {
            color: #303133;
        }
        
        &.time-row {
            i {
                color: #909399;
                margin-right: 10px;
                font-size: 16px;
            }
        }
    }
}
</style>
