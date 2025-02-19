<template>
    <div>
        <!-- 顶部导航 -->
        <header-top></header-top>
        <el-card class="card-margin-bottom">
            <el-form :inline="true" class="origin-form">
                <el-form-item label="合约地址/溯源码">
                    <el-input v-model="originName" placeholder="请输入合约地址/溯源码进行查询"></el-input>
                </el-form-item>
                <el-button type="success" @click="originSearch">查询</el-button>
            </el-form>
        </el-card>
        <div class="app-container-gray">
            <!-- 横向任务时间轴 -->
            <el-card class="timeline-card">
                <div slot="header" class="clearfix">
                    <span>任务列表</span>
                </div>
                <div class="horizontal-timeline-wrapper">
                    <div v-if="taskList.length" class="horizontal-timeline">
                        <TimelineItem v-for="(item,index) in taskList" :tasks="taskList" :index="index" :task="item" key="index"/>
                    </div>
                    <el-empty v-else description="暂无任务数据"></el-empty>
                </div>
            </el-card>

            <!-- 信息卡片组 -->
            <el-card class="info-cards-container">
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-card class="info-card" shadow="hover">
                            <div class="card-header">
                                <i class="el-icon-house"></i>
                                <span>大棚信息</span>
                            </div>
                            <el-empty v-if="!ivPastureInfo" description="暂无大棚信息"></el-empty>
                            <div v-else class="card-content">
                                <div class="info-item">
                                    <div class="label">大棚名称</div>
                                    <div class="value">{{ ivPastureInfo.name }}</div>
                                </div>
                                <div class="info-item">
                                    <div class="label">合约地址</div>
                                    <div class="value address">{{ ivPastureInfo.area }}</div>
                                </div>
                                <div class="info-item">
                                    <div class="label">大棚位置</div>
                                    <div class="value">{{ ivPastureInfo.position }}</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>

                    <el-col :span="8">
                        <el-card class="info-card" shadow="hover">
                            <div class="card-header">
                                <i class="el-icon-menu"></i>
                                <span>分区信息</span>
                            </div>
                            <el-empty v-if="!iaPartitionInfo" description="暂无分区信息"></el-empty>
                            <div v-else class="card-content">
                                <div class="info-item">
                                    <div class="label">分区名称</div>
                                    <div class="value">{{ iaPartitionInfo.name }}</div>
                                </div>
                                <div class="info-item">
                                    <div class="label">种植品种</div>
                                    <div class="value">{{ iaPartitionInfo.variety }}</div>
                                </div>
                                <div class="info-item">
                                    <div class="label">种植日期</div>
                                    <div class="value">{{ iaPartitionInfo.dateT }}</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>

                    <el-col :span="8">
                        <el-card class="info-card" shadow="hover">
                            <div class="card-header">
                                <i class="el-icon-goods"></i>
                                <span>商品信息</span>
                            </div>
                            <el-empty v-if="!shopInfo" description="暂无商品信息"></el-empty>
                            <div v-else class="card-content">
                                <div class="info-item">
                                    <div class="label">食品名称</div>
                                    <div class="value">{{ shopInfo.name }}</div>
                                </div>
                                <div class="info-item">
                                    <div class="label">加工日期</div>
                                    <div class="value">{{ shopInfo.datet }}</div>
                                </div>
                                <div class="info-item">
                                    <div class="label">食品质量</div>
                                    <div class="value">
                                        <el-tag :type="shopInfo.quality === '优秀' ? 'success' : shopInfo.quality === '及格' ? 'warning' : 'danger'">
                                            {{ shopInfo.quality }}
                                        </el-tag>
                                    </div>
                                </div>
                                <div class="info-item">
                                    <div class="label">食品重量</div>
                                    <div class="value">{{ shopInfo.weight }}kg</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </el-card>

            <!-- 环境信息表格 -->
            <el-card class="environment-card">
                <div slot="header">
                    <span>环境信息</span>
                </div>
                <div class="sf-content">
                    <el-table :data="tableData" border style="width: 100%">
                        <el-table-column prop="day" label="日期">
                            <template slot-scope="scope">
                                <span>{{ parseTime(scope.row.day,"{y}-{m}-{d}") }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="avg_temperature" label="平均温度"></el-table-column>
                        <el-table-column prop="avg_humidity" label="平均湿度"></el-table-column>
                        <el-table-column prop="avg_airquality" label="空气质量"></el-table-column>
                        <el-table-column prop="avg_pressure" label="大气压强"></el-table-column>
                        <el-table-column prop="avg_lux" label="光照"></el-table-column>
                        <el-table-column prop="avg_soil_temperature" label="土壤温度"></el-table-column>
                    </el-table>
                    <div class="page-block">
                        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                            :current-page="currentPage" :page-size="pSize"
                            layout="total, prev, pager, next, jumper" :total="totalPage">
                        </el-pagination>
                    </div>
                </div>
            </el-card>
        </div>

    </div>
</template>


<script>
    import HeaderTop from "@/components/common/Header.vue";
    import TimelineItem from "@/views/iaAgriculture/origin/components/timelineItem.vue";
    import sf from "@/components/origin/sf";
    import environment from "@/components/origin/environment";
    import {
        allBatchTask
    } from "@/api/agriculture/batchTask";
    import {
        listBatchTask
    } from "@/api/agriculture/batchTask";
    import http from "@/utils/request";
    export default {
        data() {
            return {
                originName: '',
                tabStatus: 1,
                ivPastureInfo: {},
                iaPartitionInfo: {},
                shopInfo: {},
                taskList: [],
                fertilizationSteps: [], // 存储施肥步骤
                activeStep: 0, // 当前激活的步骤索引
                tasks: [],
                envTime: "",
                entableData: [],
                tableData: [],
                currentPage: 1,
                pSize: 8,
                totalPage: 0,
                tableHeaderStyle: {
                    background: 'rgba(239, 249, 243, 1)',
                    color: '#000'
                }
            };
        },
        components: {
            HeaderTop,
            environment,
            TimelineItem
        },
        methods: {
            originSearch() {
                // 清理并设置新的溯源码
                localStorage.setItem("syInfo", this.originName);

                // 重置数据
                this.ivPastureInfo = {};
                this.iaPartitionInfo = {};
                this.shopInfo = {};
                this.iaPartitionFood
                // 发送请求获取追溯信息
                this.$http.get("/dev-api/iaPartitionFoodSensorValue/getTraceability", {
                        params: {
                            id: this.originName
                        },
                    })
                    .then((res) => {
                        if (res.data.code === 0) {
                            // 使用响应中的 contractAddr 作为大棚的合约地址
                            this.ivPastureInfo = this.mapInfo(res.data.data.ivPastureInfo, {
                                _greenhouseName: "name",
                                _greenhouseArea: "area",
                                _greenhousePosition: "position",
                            });
                            // 添加合约地址
                            this.ivPastureInfo.area = res.data.data.contractAddr;

                            this.iaPartitionInfo = this.mapInfo(res.data.data.iaPartitionInfo, {
                                _partitionsName: "name",
                                _plantingVarieties: "variety",
                                _plantingDate: "dateT",
                                _id: "id",
                                _ofGreenhouse: "greenhouseAddress", // 如果需要分区的大棚地址
                            });
                            this.getStepsList(this.originName)

                            this.tableData=res.data.data.map
                            // 处理 shopInfo 数据
                            const sensorValueInfo = res.data.data.iaPartitionFoodSensorValueInfo[0]?.listValues ||
                            [];
                            this.shopInfo = this.mapInfo(sensorValueInfo, {
                                foodName: "name",
                                processingTimestamp: "datet",
                                quality: "quality",
                                weight: "weight",
                            });

                            // 格式化日期和质量
                            if (this.shopInfo.datet) {
                                this.shopInfo.datet = new Date(parseInt(this.shopInfo.datet)).toLocaleString();
                            }

                            this.shopInfo.quality = this.shopInfo.quality === "2" ? "优秀" :
                                this.shopInfo.quality === "1" ? "及格" : "不合格";

                            // this.fetchData()
                        } else {
                            this.$message.error(res.data.msg);
                        }
                    })
                    .catch((error) => {
                        console.error("请求失败:", error);
                        this.$message.error("数据加载失败，请稍后再试");
                    });
            },
            async getProcessList(id) {
                try {
                    const {
                        data
                    } = await http.post('/iaPartitionFood/detail', {}, {
                        params: {
                            id
                        }
                    });
                    return data.iaPartitionId;
                } catch (e) {
                    this.$message.error('网络错误请重试！');
                    throw e; // 抛出异常，便于调用方捕获
                }
            },

            async getStepsList(id) {
                try {
                    const batchId = await this.getProcessList(id); // 等待获取批次ID

                    const response = await listBatchTask({
                        pageNum: 1,
                        pageSize: 100,
                        batchId,
                    });

                    const {
                        rows,
                        total
                    } = response;
                    this.taskList = rows;
                    this.total = total;
                    this.loading = false;
                    // 映射任务数据用于显示
                    this.tasks.data = this.taskList.map((item) => ({
                        text: item.taskName,
                        id: item.taskId,
                        start_date: new Date(`${item.planStart} 00:00:00`),
                        end_date: new Date(`${item.planFinish} 00:00:00`),
                        color: "#2b7",
                    }));
                } catch (error) {
                    console.error("获取任务列表失败:", error);
                    this.$message.error("任务列表加载失败，请稍后再试");
                }
            },

            getStatusText(status) {
                switch (status) {
                    case "1":
                        return "未开始";
                    case "2":
                        return "进行中";
                    case "3":
                        return "已完成";
                    default:
                        return "未知状态";
                }
            },
            mapInfo(data, fields) {
                const result = {};
                data.forEach((item) => {
                    const key = fields[item.name];
                    if (key) {
                        if (item.stringValue) {
                            result[key] = item.stringValue.value;
                        } else if (item.numericValue) {
                            result[key] = item.numericValue.value;
                        } else if (item.addressValue) {
                            result[key] = item.addressValue.value;
                        } else if (item.boolValue) {
                            result[key] = item.boolValue.value;
                        }
                    }
                });
                return result;
            },
            async fetchData(startTime = this.formatDate(new Date()), endTime = this.formatDate(new Date())) {
                const res = await this.$http.post("/dev-api/iaPartitionFoodSensorValue/getEnvironmentPage", {
                    iaPartitionFoodId: this.originName, // 使用搜索框中的溯源码
                    currentPage: this.currentPage,
                    pageSize: this.pSize,
                    startTime,
                    endTime
                });
                if (res.data.code === 0 && res.data.data.records.length > 0) {
                    this.entableData = this.transformData(res.data.data.records);
                    this.totalPage = res.data.data.total;
                } else {
                    this.$message.error("暂无数据");
                }
            },
            transformData(data) {
                return data.map(item => {
                    const obj = {};
                    item.listValues.forEach(t => {
                        if (t.name === "id") obj.id = t.numericValue.value;
                        if (t.name === "temperature") obj.temperature = t.stringValue.value;
                        if (t.name === "humidity") obj.humidity = t.stringValue.value;
                        if (t.name === "airquality") obj.airquality = t.stringValue.value;
                        if (t.name === "pressure") obj.pressure = t.stringValue.value;
                        if (t.name === "date") obj.dateT = t.stringValue.value;
                    });
                    return obj;
                });
            },
            handleSizeChange(val) {
                this.pSize = val;
                this.fetchData();
            },
            handleCurrentChange(val) {
                this.currentPage = val;
                this.fetchData();
            },
            formatDate(date) {
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, "0");
                const day = date.getDate().toString().padStart(2, "0");
                return `${year}-${month}-${day}`;
            },
            enSearch() {
                if (this.envTime && this.envTime.length === 2) {
                    const [start, end] = this.envTime.map(this.formatDate);
                    this.fetchData(start, end);
                } else {
                    this.$message.warning("请选择日期范围");
                }
            },
            resetFields() {
                this.envTime = "";
                this.fetchData();
            }

        },
    };
</script>

<style lang="scss" scoped>
.app-container-gray {
    padding: 20px;
    background-color: #f0f2f5;
}

.timeline-card {
    margin-bottom: 20px;
    .timeline-item-card {
        margin-bottom: 10px;
        h4 {
            margin: 0 0 10px 0;
            color: #303133;
        }
        p {
            margin: 5px 0;
            color: #606266;
            font-size: 14px;
        }
    }
}

.info-cards-container {
    margin: 20px 0;
    background: transparent;
    border: none;

    .el-card__body {
        padding: 0;
    }
}

.info-card {
    height: 350px; // 增加卡片高度

    transition: all 0.3s;
    position: relative;
    background: linear-gradient(to bottom, #ffffff, #f8f9fa);

    .card-header {
        padding: 15px 20px;
        border-bottom: 1px solid #ebeef5;
        background: linear-gradient(to right, #f5f7fa, #ffffff);
        display: flex;
        align-items: center;

        i {
            font-size: 18px;
            margin-right: 8px;
            color: #409EFF;
        }

        span {
            font-size: 16px;
            font-weight: 500;
            color: #303133;
        }
    }

    .card-content {
        padding: 20px;
        height: calc(100% - 56px);
        display: flex;
        flex-direction: column;
        justify-content: flex-start; // 改为从顶部开始布局

        .info-item {
            margin-bottom: 20px; // 增加项目间距

            &:last-child {
                margin-bottom: 0;
            }

            .label {
                color: #909399;
                font-size: 13px;
                margin-bottom: 6px; // 增加标签和值之间的间距
            }

            .value {
                color: #303133;
                font-size: 14px;
                font-weight: 500;
                line-height: 1.4; // 增加行高

                &.address {
                    font-family: monospace;
                    font-size: 13px;
                    word-break: break-all;
                    color: #409EFF;
                    cursor: pointer;

                    &:hover {
                        color: #66b1ff; // 只改变颜色，去掉下划线
                    }
                }
            }
        }
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
}

// 自定义 el-empty 样式
.el-empty {
    padding: 40px 0;
}

// 自定义 el-tag 样式
.el-tag {
    border-radius: 4px;
    padding: 0 8px;
}

@media screen and (max-width: 1200px) {
    .info-card {
        margin-bottom: 20px;
    }
}

.environment-card {
    .sf-content {
        .el-table {
            margin-bottom: 20px;
        }
    }
}

// Remove previous box, left, right styles
.el-timeline-item__node--primary {
    background-color: #409EFF;
}

.el-timeline-item__node--success {
    background-color: #67C23A;
}

.el-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

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
