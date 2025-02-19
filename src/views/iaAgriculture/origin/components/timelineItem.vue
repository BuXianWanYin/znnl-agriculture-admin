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
        :class="{'is-complete': task.actualFinish}">
        <div class="node-content"></div>
        <div class="node-line" v-if="index !== tasks.length - 1"></div>
        <div class="node-corner" v-if="(index + 1) % 6 === 0 && index !== tasks.length - 1"></div>
    </div>
    <el-card class="task-card" :body-style="{ padding: '10px' }">
        <div class="task-title">{{ task.taskName }}</div>
        <div class="task-dates">
            <div class="date-group" v-if="task.actualStart || task.actualFinish">
                <div class="date-label">实际时间</div>
                <div class="date-item" v-if="task.actualStart">
                    <i class="el-icon-date"></i>
                    <span>开始：{{ task.actualStart }}</span>
                </div>
                <div class="date-item" v-if="task.actualFinish">
                    <i class="el-icon-date"></i>
                    <span>结束：{{ task.actualFinish }}</span>
                </div>
            </div>
        </div>
        <div class="task-info">
            <span class="info-item">
                <i class="el-icon-user"></i>
                {{ task.taskHeadName || '未指定' }}
            </span>
            <span class="info-item">
                <i class="el-icon-tickets"></i>
                {{ task.batchName }}
            </span>
        </div>
    </el-card>
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
            default: () => ({}) // 修正空对象的返回
        },
        tasks: {
            type: Array,
            default: () => []
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

    .task-title {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 8px;
        color: #303133;
        padding-bottom: 8px;
        border-bottom: 1px solid #EBEEF5;
    }

    .task-dates {
        font-size: 12px;
        color: #606266;

        .date-group {
            margin-bottom: 8px;

            &:last-child {
                margin-bottom: 0;
            }

            .date-label {
                color: #909399;
                margin-bottom: 4px;
                font-weight: 500;
            }

            .date-item {
                display: flex;
                align-items: center;
                margin-bottom: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;

                i {
                    margin-right: 4px;
                    font-size: 12px;
                    color: #909399;
                }

                span {
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
        }
    }

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
        width: calc((100% - 200px) / 5);
    }
}

@media screen and (max-width: 1400px) {
    .timeline-item {
        width: calc((100% - 150px) / 4);
    }
}

@media screen and (max-width: 1200px) {
    .timeline-item {
        width: calc((100% - 100px) / 3);
    }
}

@media screen and (max-width: 992px) {
    .timeline-item {
        width: calc((100% - 50px) / 2);
    }
}

@media screen and (max-width: 768px) {
    .timeline-item {
        width: 100%;
    }
}
</style>
