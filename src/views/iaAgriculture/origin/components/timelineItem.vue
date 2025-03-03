<template>
 <div class="timeline-item">
    <div class="timeline-node">
        <div class="check-circle">
            <i class="el-icon-check"></i>
        </div>
        <div class="node-info">
            <div class="task-name">{{ task.taskName }}</div>

            <el-tag @click="handleTrace" size="small" :type="getStatusType(task.status)">
                  
                  {{ getStatusText(task.status) }}
                    <i class="el-icon-info"></i>
              </el-tag>

            <div class="finish-date">{{ task.actualFinish }}</div>
        </div>
    </div>
    <el-dialog
        :title="task.taskName || '任务追溯'"
        :visible.sync="dialogVisible"
        width="1000px"
        :close-on-click-modal="false"
        :append-to-body="true"
        custom-class="trace-dialog"
    >
        <div class="trace-info">
            <div class="info-section">
                <h3>
                    <i class="el-icon-info"></i>
                    基本信息
                </h3>
                <div class="info-row">
                    <i class="el-icon-user"></i>
                    <span class="label">负责人：</span>
                    <span class="value">{{ task.taskHeadName }}</span>
                </div>
            </div>
            
            <div class="info-section">
                <h3>
                    <i class="el-icon-date"></i>
                    时间信息
                </h3>
                <div class="time-info-wrapper">
                    <div class="info-row time-row">
                        <i class="el-icon-time"></i>
                        <span class="label">计划时间：</span>
                        <span class="value">{{ task.planStart }} ~ {{ task.planFinish }}</span>
                    </div>
                    <div class="info-row time-row">
                        <i class="el-icon-time"></i>
                        <span class="label">实际时间：</span>
                        <span class="value">{{ task.actualStart }} ~ {{ task.actualFinish }}</span>
                    </div>
                </div>
            </div>

            <div class="info-section">
                <h3>
                    <i class="el-icon-data-line"></i>
                    {{ isAquaculture ? '水质信息统计' : '环境信息统计' }}
                </h3>
                <el-table 
                    :data="task.environmentData" 
                    border 
                    style="width: 100%"
                    :header-cell-style="{background:'#f5f7fa'}"
                    size="small"
                >
                    <el-table-column prop="day" label="日期" width="120">
                        <template slot-scope="scope">
                            <span>{{ parseTime(scope.row.day,"{y}-{m}-{d}") }}</span>
                        </template>
                    </el-table-column>
                    <template v-if="isAquaculture">
                        <el-table-column prop="water_quality" label="水质" width="100"></el-table-column>
                        <el-table-column prop="avg_water_temp" label="平均水温" width="100"></el-table-column>
                        <el-table-column prop="oxygen_content" label="含氧量" width="100"></el-table-column>
                        <el-table-column prop="ph_value" label="pH值" width="100"></el-table-column>
                        <el-table-column prop="nitrite_content" label="亚硝酸盐含量" width="100"></el-table-column>
                    </template>
                    <template v-else>
                        <el-table-column prop="avg_temperature" label="平均温度" width="100"></el-table-column>
                        <el-table-column prop="avg_humidity" label="平均湿度" width="100"></el-table-column>
                        <el-table-column prop="avg_airquality" label="空气质量" width="100"></el-table-column>
                        <el-table-column prop="avg_pressure" label="大气压强" width="100"></el-table-column>
                        <el-table-column prop="avg_lux" label="光照" width="100"></el-table-column>
                        <el-table-column prop="avg_soil_temperature" label="土壤温度" width="100"></el-table-column>
                    </template>
                </el-table>
            </div>
        </div>
    </el-dialog>
</div>
</template>

<script>
export default {
    name: 'TimelineItem',
    props: {
        task: {
            type: Object,
            required: true
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
                // case "3": return "已完成";
                case "3": return "追溯";
                default: return "未知状态";
            }
        },
        getStatusType(status) {
            switch (status) {
                case "1": return "info";
                case "2": return "warning";
                case "3": return "success";
                // case "4": return "success";
                default: return "info";
            }
        },
        handleTrace() {
            this.dialogVisible = true;
        }
    },
    computed: {
        isAquaculture() {
            return this.task?.greenhouseName?.substring(0, 2) === '鱼棚';
        }
    }
}
</script>

<style lang="scss" scoped>
.timeline-item {
    position: relative;
    display: inline-block;
    vertical-align: top;
    text-align: center;
    width: 16.666%;  // 确保每个item占据相等宽度
    padding: 0;
    margin: 0;
    font-size: 0;  // 消除inline-block间隙
    
    .timeline-node {
        text-align: center;
        padding: 10px 0;
        position: relative;
        z-index: 2;
        
        .check-circle {
            width: 20px;
            height: 20px;
            background-color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 8px;
            border: 2px solid #409EFF;
            position: relative;
            z-index: 2;
            
            i {
                color: #409EFF;
                font-size: 12px;
                transform: scale(0.9);
            }
        }

        .node-info {
            position: relative;
            z-index: 2;
            font-size: 14px;  // 重置字体大小
            
            .task-name {
                color: #303133;
                margin-bottom: 4px;
            }

            .finish-date {
                font-size: 12px;
                color: #909399;
            }
        }
    }

    &::before {
        content: '';
        position: absolute;
        top: 20px;
        left: 0;
        right: 0;
        width: 100%;
        height: 2px;
        background-color: #409EFF;
        z-index: 1;
    }
}

.task-card {
    margin-top: 20px;
}

.trace-info {
    padding: 15px;  // 减小整体内边距
    
    .info-section {
        margin-bottom: 15px;  // 减小section之间的间距
        background: #fff;
        border-radius: 8px;
        padding: 15px;  // 减小section的内边距
        box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
        
        &:last-child {
            margin-bottom: 0;
        }
        
        h3 {
            font-size: 16px;
            color: #303133;
            margin-bottom: 15px;  // 减小标题下方间距
            padding-bottom: 10px;
            border-bottom: 1px solid #EBEEF5;
            display: flex;
            align-items: center;

            i {
                margin-right: 8px;
                color: #409EFF;
            }
        }
    }

    .time-info-wrapper {
        display: flex;
        gap: 15px;  // 两个时间信息之间的间距
        
        .info-row {
            flex: 1;  // 让两个时间信息框占据相等宽度
            margin-bottom: 0;  // 移除底部间距
        }
    }
    
    .info-row {
        display: flex;
        align-items: center;
        margin-bottom: 10px;  // 减小行间距
        padding: 8px 12px;  // 适当减小内边距
        background: #f8f9fa;
        border-radius: 4px;
        
        &:last-child {
            margin-bottom: 0;
        }
        
        i {
            color: #409EFF;
            margin-right: 8px;
            font-size: 16px;
        }
        
        .label {
            color: #606266;
            margin-right: 8px;
            min-width: 70px;
            font-weight: 500;
        }
        
        .value {
            color: #303133;
        }
    }
}

:deep(.trace-dialog) {
    .el-dialog__header {
        background: #f5f7fa;
        padding: 15px 20px;
        border-bottom: 1px solid #e4e7ed;
        margin-right: 0;
        border-radius: 4px 4px 0 0;
    }

    .el-dialog__body {
        padding: 20px;
    }

    .el-table {
        margin-top: 10px;
        
        th {
            background-color: #f5f7fa !important;
            color: #606266;
            font-weight: 500;
        }
    }
}

.timeline-item {
    .timeline-node {
        .check-circle {
            transition: all 0.3s;
            &:hover {
                transform: scale(1.1);
                box-shadow: 0 0 8px rgba(64,158,255,0.4);
            }
        }

        .node-info {
            .task-name {
                font-weight: 500;
                margin-bottom: 8px;
            }

            .el-tag {
                cursor: pointer;
                transition: all 0.3s;
                margin: 5px 0;
                
                &:hover {
                    transform: scale(1.05);
                }
            }

            .finish-date {
                margin-top: 5px;
            }
        }
    }
}
</style>
