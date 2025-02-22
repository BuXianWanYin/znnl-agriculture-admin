<template>
    <div>
        <!-- 顶部 Banner -->
        <div class="origin-banner">
            <div class="decoration-circles">
                <div class="circle-1"></div>
                <div class="circle-2"></div>
                <div class="circle-3"></div>
                <div class="circle-4"></div>
            </div>
            <div class="banner-content">
                <div class="banner-title">
                    <i class="el-icon-shopping-bag-1"></i>
                    <span>鱼菜共生</span>
                </div>
                <div class="banner-subtitle">好食材不怕公开</div>
                <div class="banner-desc">看得见溯源匠心，吃得出健康安心</div>
            </div>
            <div class="banner-right">
                <div class="quality-circle">
                    <div class="center-icon">
                        <i class="el-icon-check"></i>
                    </div>
                    <div class="orbit-container">
                        <div class="orbit-item top"><span>绿色</span></div>
                        <div class="orbit-item right"><span>健康</span></div>
                        <div class="orbit-item bottom"><span>安全</span></div>
                        <div class="orbit-item left"><span>品质</span></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 追溯模块 -->
        <div class="trace-modules">
            <div class="module-item" v-for="(item, index) in traceModules" :key="index">
                <div class="module-content">
                    <div class="module-title">{{ item.title }}</div>
                    <div class="module-status">
                        <i class="el-icon-check"></i>
                        <span :style="{ color: '#59d181' }">可追溯</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 溯源码验证 -->
        <div class="trace-code">
            <div class="search-container">
                <div class="search-title">
                    <i class="el-icon-search"></i>
                    <span>溯源查询</span>
                </div>
                <div class="search-desc">输入溯源码，即可查询产品全程追溯信息</div>
                <div class="search-box">
                    <el-input
                        v-model="originName"
                        placeholder="请输入溯源码"
                        class="search-input"
                        @keyup.enter.native="originSearch"
                    >
                        <el-button 
                            slot="append" 
                            type="primary"
                            icon="el-icon-search"
                            @click="originSearch"
                            class="desktop-only"
                        >查询</el-button>
                    </el-input>
                </div>
                <div class="code-content" v-if="showResult">
                    <div class="result-text">
                        您查询的溯源码编号为：
                        <span class="code-number">{{ originName }}</span>
                        <el-tag type="success" class="verify-tag">
                            <i class="el-icon-check"></i>
                            核验通过
                        </el-tag>
                    </div>
                </div>
            </div>
        </div>

        <!-- 原有的内容 -->
        <div class="app-container-gray" v-if="showResult">
            <!-- 产地信息卡片组 -->
            <el-card class="info-cards-container">
                <div slot="header" class="clearfix">
                    <span>{{ isAquaculture ? '养殖信息' : '产地信息' }}</span>
                    <span class="trace-tag">可追溯</span>
                </div>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-card class="info-card" shadow="hover">
                            <div class="card-header">
                                <i class="el-icon-house"></i>
                                <span>{{ isAquaculture ? '鱼棚信息' : '大棚信息' }}</span>
                            </div>
                            <el-empty v-if="!ivPastureInfo" :description="isAquaculture ? '暂无鱼棚信息' : '暂无大棚信息'"></el-empty>
                            <div v-else class="card-content">
                                <div class="info-item">
                                    <div class="label">{{ isAquaculture ? '鱼棚名称' : '大棚名称' }}</div>
                                    <div class="value">{{ ivPastureInfo.name }}</div>
                                </div>
                                <div class="info-item">
                                    <div class="label">合约地址</div>
                                    <div class="value address">{{ ivPastureInfo.area }}</div>
                                </div>
                                <div class="info-item">
                                    <div class="label">{{ isAquaculture ? '鱼棚位置' : '大棚位置' }}</div>
                                    <div class="value">{{ ivPastureInfo.position }}</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>

                    <el-col :span="8">
                        <el-card class="info-card" shadow="hover">
                            <div class="card-header">
                                <i class="el-icon-menu"></i>
                                <span>{{ isAquaculture ? '养殖信息' : '分区信息' }}</span>
                            </div>
                            <el-empty v-if="!iaPartitionInfo" :description="isAquaculture ? '暂无养殖信息' : '暂无分区信息'"></el-empty>
                            <div v-else class="card-content">
                                <div class="info-item">
                                    <div class="label">{{ isAquaculture ? '养殖品种' : '分区名称' }}</div>
                                    <div class="value">{{ isAquaculture ? iaPartitionInfo.variety : iaPartitionInfo.name }}</div>
                                </div>
                                <div class="info-item" v-if="!isAquaculture">
                                    <div class="label">种植品种</div>
                                    <div class="value">{{ iaPartitionInfo.variety }}</div>
                                </div>
                                <div class="info-item">
                                    <div class="label">{{ isAquaculture ? '养殖日期' : '种植日期' }}</div>
                                    <div class="value">{{ iaPartitionInfo.dateT }}</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>

                    <el-col :span="8">
                        <el-card class="info-card" shadow="hover">
                            <div class="card-header">
                                <i class="el-icon-goods"></i>
                                <span>食品信息</span>
                            </div>
                            <el-empty v-if="!shopInfo" description="暂无商品信息"></el-empty>
                            <div v-else class="card-content">
                                <div class="info-item">
                                    <div class="label">食品名称</div>
                                    <div class="value">{{ shopInfo.name }}</div>
                                </div>
                             
                                <div class="info-item">
                                    <div class="label">{{ isAquaculture ? '捕捞日期' : '采摘日期' }}</div>
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

            <!-- 种植/养殖环节卡片 -->
            <el-card class="timeline-card">
                <div slot="header" class="clearfix">
                    <span>{{ isAquaculture ? '养殖环节' : '种植环节' }}</span>
                    <span class="trace-tag">可追溯</span>
                </div>
                <div class="horizontal-timeline-wrapper">
                    <div v-if="taskList.length" class="horizontal-timeline">
                        <TimelineItem v-for="(item,index) in taskList" :tasks="taskList" :index="index" :task="item" key="index"/>
                    </div>
                    <el-empty v-else description="暂无任务数据"></el-empty>
                </div>
            </el-card>

            <!-- 环境信息表格 -->
            <!-- <el-card class="environment-card">
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
            </el-card> -->
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
        listBatchTask,
    } from "@/api/agriculture/batchTask";
    import { getBatch } from "@/api/agriculture/batch";
    import { getGermplasm } from "@/api/agriculture/germplasm";
    import http from "@/utils/request";
    export default {
        data() {
            return {
                originName: '',
                showResult: false,
                tabStatus: 1,
                ivPastureInfo: {},
                iaPartitionInfo: {
                    variety: '',
                },
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
                },
                traceModules: [
                    { title: '产地信息' },
                    { title: '种植环节' },
                    { title: '环境信息' }
                ],
                // 测试数据开关，true 时强制显示鱼棚数据 falsh恢复正常
                testAquaculture: false,
                
                // 测试用的鱼棚数据
                testData: {
                    ivPastureInfo: {
                        name: "鱼棚A01",
                        area: "0x1234...5678",
                        position: "水产养殖区块1号"
                    },
                    iaPartitionInfo: {
                        variety: "加州鲈鱼",
                        dateT: "2024-03-20",
                    },
                    shopInfo: {
                        name: "精选加州鲈鱼",
                        datet: "2024-03-25",
                        quality: "优秀",
                        weight: "2.5"
                    },
                    environmentData: [
                        {
                            day: new Date().getTime(),
                            water_quality: "优",
                            avg_water_temp: "23℃",
                            oxygen_content: "7.5mg/L",
                            ph_value: "7.2",
                            nitrite_content: "0.02mg/L"
                        },
                        // 可以添加更多测试数据...
                    ],
                    taskList: [
                        {
                            taskId: "T001",
                            taskName: "投放鱼苗",
                            taskHeadName: "张三",
                            status: "3", // 已完成
                            planStart: "2024-03-20",
                            planFinish: "2024-03-20",
                            actualStart: "2024-03-20",
                            actualFinish: "2024-03-20",
                            greenhouseName: "鱼棚A01",
                            environmentData: [
                                {
                                    day: new Date().getTime(),
                                    water_quality: "优",
                                    avg_water_temp: "22℃",
                                    oxygen_content: "7.8mg/L",
                                    ph_value: "7.0",
                                    nitrite_content: "0.01mg/L"
                                }
                            ]
                        },
                        {
                            taskId: "T002",
                            taskName: "日常投喂",
                            taskHeadName: "李四",
                            status: "3", // 已完成
                            planStart: "2024-03-21",
                            planFinish: "2024-03-21",
                            actualStart: "2024-03-21",
                            actualFinish: "2024-03-21",
                            greenhouseName: "鱼棚A01",
                            environmentData: [
                                {
                                    day: new Date().getTime(),
                                    water_quality: "优",
                                    avg_water_temp: "23℃",
                                    oxygen_content: "7.5mg/L",
                                    ph_value: "7.2",
                                    nitrite_content: "0.02mg/L"
                                }
                            ]
                        },
                        {
                            taskId: "T003",
                            taskName: "水质检测",
                            taskHeadName: "王五",
                            status: "3", // 已完成
                            planStart: "2024-03-22",
                            planFinish: "2024-03-22",
                            actualStart: "2024-03-22",
                            actualFinish: "2024-03-22",
                            greenhouseName: "鱼棚A01",
                            environmentData: [
                                {
                                    day: new Date().getTime(),
                                    water_quality: "优",
                                    avg_water_temp: "23.5℃",
                                    oxygen_content: "7.6mg/L",
                                    ph_value: "7.1",
                                    nitrite_content: "0.015mg/L"
                                }
                            ]
                        },
                        {
                            taskId: "T004",
                            taskName: "疾病防控",
                            taskHeadName: "赵六",
                            status: "2", // 进行中
                            planStart: "2024-03-23",
                            planFinish: "2024-03-25",
                            actualStart: "2024-03-23",
                            actualFinish: null,
                            greenhouseName: "鱼棚A01",
                            environmentData: [
                                {
                                    day: new Date().getTime(),
                                    water_quality: "良",
                                    avg_water_temp: "23℃",
                                    oxygen_content: "7.4mg/L",
                                    ph_value: "7.3",
                                    nitrite_content: "0.025mg/L"
                                }
                            ]
                        }
                    ]
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
                if (!this.originName) {
                    this.$message.warning('请输入溯源码');
                    return;
                }
                
                // 测试模式下使用测试数据
                if (this.testAquaculture) {
                    this.showResult = true;
                    this.ivPastureInfo = this.testData.ivPastureInfo;
                    this.iaPartitionInfo = this.testData.iaPartitionInfo;
                    this.shopInfo = this.testData.shopInfo;
                    this.tableData = this.testData.environmentData;
                    this.taskList = this.testData.taskList;
                    return;
                }


                //分割


                this.showResult = false;
                localStorage.setItem("syInfo", this.originName);
                this.ivPastureInfo = {};
                this.iaPartitionInfo = { variety: '' };
                this.shopInfo = {};
                
                this.$http.get("/dev-api/iaPartitionFoodSensorValue/getTraceability", {
                    params: {
                        id: this.originName
                    },
                })
                .then((res) => {
                    if (res.data.code === 0) {
                        this.showResult = true;
                        this.ivPastureInfo = this.mapInfo(res.data.data.ivPastureInfo, {
                            _greenhouseName: "name",
                            _greenhouseArea: "area",
                            _greenhousePosition: "position",
                        });
                        this.ivPastureInfo.area = res.data.data.contractAddr;

                        this.iaPartitionInfo = this.mapInfo(res.data.data.iaPartitionInfo, {
                            _partitionsName: "name",
                            _plantingVarieties: "variety",
                            _plantingDate: "dateT",
                            _id: "id",
                            _ofGreenhouse: "greenhouseAddress",
                        });
                        this.getStepsList(this.originName)

                        this.tableData=res.data.data.map
                        const sensorValueInfo = res.data.data.iaPartitionFoodSensorValueInfo[0]?.listValues || [];
                        this.shopInfo = this.mapInfo(sensorValueInfo, {
                            foodName: "name",
                            processingTimestamp: "datet",
                            quality: "quality",
                            weight: "weight",
                        });

                        if (this.shopInfo.datet) {
                            this.shopInfo.datet = new Date(parseInt(this.shopInfo.datet)).toLocaleString();
                        }

                        this.shopInfo.quality = this.shopInfo.quality === "2" ? "优秀" :
                            this.shopInfo.quality === "1" ? "及格" : "不合格";
                    } else {
                        this.showResult = false;
                        this.$message.error(res.data.msg);
                    }
                })
                .catch((error) => {
                    this.showResult = false;
                    console.error("请求失败:", error);
                    this.$message.error("数据加载失败，请稍后再试");
                });
            },
            async getProcessList(id) {
                try {
                    const { data } = await http.post('/iaPartitionFood/detail', {}, {
                        params: { id }
                    });
                    return data.iaPartitionId;
                } catch (e) {
                    this.$message.error('网络错误请重试！');
                    throw e;
                }
            },

            async getStepsList(id) {
                try {
                    const batchId = await this.getProcessList(id);

                    const response = await listBatchTask({
                        pageNum: 1,
                        pageSize: 100,
                        batchId,
                    });

                    const batchDetails = await getBatch(batchId);

                    if (batchDetails.data.germplasmId) {
                        const germplasmDetails = await getGermplasm(batchDetails.data.germplasmId);
                        this.iaPartitionInfo.variety = germplasmDetails.data.cropName;
                    }

                    const { rows, total } = response;
                    this.taskList = rows;
                    this.total = total;
                    this.loading = false;
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
                    case "1": return "未开始";
                    case "2": return "进行中";
                    case "3": return "已完成";
                    default: return "未知状态";
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
                    iaPartitionFoodId: this.originName,
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
            },
            handleScan() {
                this.$message.info('扫一扫功能开发中...');
            }
        },
        computed: {
            isAquaculture() {
                // 使用测试开关
                if (this.testAquaculture) {
                    return true;
                }
                return this.ivPastureInfo?.name?.substring(0, 2) === '鱼棚';
            }
        },
    };
</script>

<style lang="scss" scoped>
.app-container-gray {
    padding: 20px;
    background-color: #f0f2f5;
    transition: all 0.3s ease-in-out;
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
    margin-bottom: 20px;
    
    .el-card__header {
        padding: 15px 20px;
        border-bottom: 1px solid #ebeef5;
        
        .clearfix {
            display: flex;
            align-items: center;
            gap: 10px;

            span {
                font-size: 16px;
                font-weight: 500;
            }

            .trace-tag {
                font-size: 12px;
                color: #67c23a;
                background: #f0f9eb;
                padding: 2px 6px;
                border-radius: 4px;
            }
        }
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
    // gap: 20px 40px;
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

.origin-banner {
    background: linear-gradient(135deg, #42b983 0%, #2f9 100%);
    padding: 40px 40px 80px;
    display: flex;
    justify-content: space-between;
    color: white;
    position: relative;
    overflow: hidden;
    box-shadow: inset 0 0 100px rgba(0,0,0,0.1);

    // 左上大圆
    &::before {
        content: '';
        position: absolute;
        left: -10%;
        top: -40%;
        width: 500px;
        height: 500px;
        background: rgba(255,255,255,0.1);
        border-radius: 50%;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.18);
    }

    // 右下大圆
    &::after {
        content: '';
        position: absolute;
        right: -15%;
        bottom: -30%;
        width: 400px;
        height: 400px;
        background: rgba(255,255,255,0.08);
        border-radius: 50%;
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.15);
    }

    // 添加更多装饰圆形
    .decoration-circles {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;

        // 右上小圆
        &::before {
            content: '';
            position: absolute;
            right: 25%;
            top: 10%;
            width: 120px;
            height: 120px;
            background: rgba(255,255,255,0.12);
            border-radius: 50%;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.15);
        }

        // 左下小圆
        &::after {
            content: '';
            position: absolute;
            left: 20%;
            bottom: 15%;
            width: 150px;
            height: 150px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.15);
        }

        // 额外的装饰圆形
        .circle-1 {
            position: absolute;
            left: 40%;
            top: 20%;
            width: 80px;
            height: 80px;
            background: rgba(57, 205, 129, 0.15);
            border-radius: 50%;
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            box-shadow: 0 4px 16px rgba(57, 205, 129, 0.08);
        }

        .circle-2 {
            position: absolute;
            right: 35%;
            bottom: 30%;
            width: 100px;
            height: 100px;
            background: rgba(57, 205, 129, 0.12);
            border-radius: 50%;
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            box-shadow: 0 4px 16px rgba(57, 205, 129, 0.06);
        }

        .circle-3 {
            position: absolute;
            left: 30%;
            top: 40%;
            width: 60px;
            height: 60px;
            background: rgba(57, 205, 129, 0.1);
            border-radius: 50%;
            backdrop-filter: blur(3px);
            -webkit-backdrop-filter: blur(3px);
            box-shadow: 0 4px 16px rgba(57, 205, 129, 0.05);
        }

        .circle-4 {
            position: absolute;
            right: 15%;
            top: 35%;
            width: 90px;
            height: 90px;
            background: rgba(57, 205, 129, 0.08);
            border-radius: 50%;
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            box-shadow: 0 4px 16px rgba(57, 205, 129, 0.04);
        }
    }

    .banner-content {
        position: relative;
        z-index: 2;

        .banner-title {
            display: inline-flex;
            align-items: center;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.18);
            padding: 8px 16px;
            border-radius: 20px;
            margin-bottom: 20px;
            
            i {
                margin-right: 8px;
                font-size: 20px;
            }

            span {
                font-size: 18px;
                font-weight: 500;
            }
        }

        .banner-subtitle {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 15px;
            text-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .banner-desc {
            font-size: 16px;
            opacity: 0.9;
            max-width: 400px;
        }
    }

    .banner-right {
        position: relative;
        z-index: 2;

        .quality-circle {
            position: relative;
            width: 200px;
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;

            .center-icon {
                position: relative;
                width: 80px;
                height: 80px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                z-index: 2;

                &::before {
                    content: '';
                    position: absolute;
                    top: -5px;
                    left: -5px;
                    right: -5px;
                    bottom: -5px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    z-index: -1;
                }

                i {
                    font-size: 36px;
                    color: #42b983;
                }
            }

            .orbit-container {
                position: absolute;
                width: 100%;
                height: 100%;
                animation: rotate 20s linear infinite;

                .orbit-item {
                    position: absolute;
                    width: 60px;
                    height: 60px;
                    background: rgba(255, 255, 255, 0.9);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
                    animation: counter-rotate 20s linear infinite;

                    span {
                        color: #42b983;
                        font-size: 14px;
                        font-weight: 500;
                    }

                    &.top {
                        top: 0;
                        left: 50%;
                        transform: translateX(-50%);
                    }

                    &.right {
                        top: 50%;
                        right: 0;
                        transform: translateY(-50%);
                    }

                    &.bottom {
                        bottom: 0;
                        left: 50%;
                        transform: translateX(-50%);
                    }

                    &.left {
                        top: 50%;
                        left: 0;
                        transform: translateY(-50%);
                    }

                    &::before {
                        content: '';
                        position: absolute;
                        top: -3px;
                        left: -3px;
                        right: -3px;
                        bottom: -3px;
                        border: 2px solid rgba(255, 255, 255, 0.3);
                        border-radius: 50%;
                    }
                }
            }
        }
    }
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@keyframes counter-rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(-360deg);
    }
}

// 恢复其他装饰圆形的颜色
.decoration-circles {
    .circle-1, .circle-2, .circle-3, .circle-4 {
        background: rgba(255, 255, 255, 0.1);
        box-shadow: none;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        border: none;
    }

    &::before, &::after {
        background: rgba(255, 255, 255, 0.1);
        box-shadow: none;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        border: none;
    }
}

.trace-modules {
    display: flex;
    justify-content: center;
    padding: 0 40px;
    margin-top: -40px;
    margin-bottom: 20px;
    position: relative;
    z-index: 2;
    transition: all 0.3s ease-in-out;

    .module-item {
        flex: 0 1 auto;
        min-width: 220px;
        text-align: center;
        padding: 20px 30px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 35px;
        margin: 0 15px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            // background: linear-gradient(90deg, #42b983, #2f9);
            opacity: 0;
            transition: opacity 0.3s;
        }

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.25);
            
            &::before {
                opacity: 1;
            }
            
            .module-content {
                .module-title {
                    color: #59d181;
                }
                
                .module-status {
                    color: #59d181;
                    
                    i {
                        color: #59d181;
                    }
                    
                    span {
                        color: #59d181;
                    }
                }
            }
        }

        .module-content {
            .module-title {
                font-size: 16px;
                font-weight: 500;
                margin-bottom: 10px;
                color: #303133;
                transition: color 0.3s ease;
            }

            .module-status {
                color: #67c23a;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.3s ease;
                
                i {
                    margin-right: 5px;
                    font-size: 12px;
                    background: #f0f9eb;
                    padding: 4px;
                    border-radius: 50%;
                    transition: color 0.3s ease;
                }

                span {
                    color: #67c23a;
                    transition: color 0.3s ease;
                }
            }
        }
    }
}

.trace-code {
    background: #ffffff;
    padding: 40px 0;

    .search-container {
        max-width: 800px;
        margin: 0 auto;
        text-align: center;
        padding: 0 20px;

        .search-title {
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #303133;
            
            i {
                font-size: 24px;
                margin-right: 10px;
                color: #42b983;
            }
            
            span {
                font-size: 24px;
                font-weight: 600;
            }
        }

        .search-desc {
            color: #909399;
            font-size: 14px;
            margin-bottom: 24px;
        }

        .search-box {
            max-width: 600px;
            margin: 0 auto;
            position: relative;

            ::v-deep .el-input {
                .el-input__inner {
                    height: 44px;
                    line-height: 44px;
                    font-size: 14px;
                    border-radius: 12px;
                    padding: 0 130px 0 20px;
                    border: 2px solid #E4E7ED;
                    background: rgba(255, 255, 255, 0.9);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;

                    &:focus {
                        border-color: #42b983;
                        background: white;
                        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
                    }

                    &::placeholder {
                        color: #909399;
                    }
                }

                .el-input-group__append {
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    padding: 0;
                    border: none;
                    background: none;

                    .el-button {
                        height: 36px;
                        padding: 0 20px;
                        border-radius: 6px;
                        font-size: 14px;
                        border: none;
                        background: #ffffff;
                        color: #42b983;
                        font-weight: 500;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                        transition: all 0.3s ease;
                        margin-left: 30px;

                        &:hover {
                            transform: translateY(-1px);
                            box-shadow: 0 4px 12px rgba(87, 87, 87, 0.5);
                        }

                        i {
                            margin-right: 4px;
                            font-size: 14px;
                        }
                    }
                }
            }
        }

        .code-content {
            margin-top: 30px;
            padding: 0 20px;

            .result-text {
                color: #606266;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;

                .code-number {
                    color: #42b983;
                    font-weight: 600;
                    font-size: 18px;
                }

                .verify-tag {
                    background: #67c23a;
                    color: white;
                    border: none;
                    border-radius: 20px;
                    padding: 0 15px;
                    height: 32px;
                    line-height: 32px;
                    font-size: 14px;

                    i {
                        margin-right: 4px;
                    }
                }
            }
        }
    }
}

.timeline-card {
    .clearfix {
        display: flex;
        align-items: center;
        gap: 10px;

        .trace-tag {
            font-size: 12px;
            color: #67c23a;
            background: #f0f9eb;
            padding: 2px 6px;
            border-radius: 4px;
        }
    }
}

// 响应式布局样式
@media screen and (max-width: 1600px) {
    .origin-banner {
        padding: 30px 30px 60px;
        
        .banner-content {
            .banner-subtitle {
                font-size: 32px;
            }
        }
        
        .banner-right {
            .quality-circle {
                width: 180px;
                height: 180px;
            }
        }
    }
    
    .trace-modules {
        .module-item {
            min-width: 200px;
            padding: 15px 25px;
        }
    }
}

@media screen and (max-width: 1200px) {
    .origin-banner {
        padding: 25px 25px 50px;
        flex-direction: column;
        align-items: center;
        text-align: center;
        
        .banner-content {
            margin-bottom: 30px;
            
            .banner-subtitle {
                font-size: 28px;
            }
            
            .banner-desc {
                font-size: 16px;
            }
        }
    }
    
    .trace-modules {
        flex-wrap: wrap;
        margin-top: -20px;
        
        .module-item {
            margin: 10px;
            min-width: calc(50% - 30px);
        }
    }
    
    .search-container {
        .search-box {
            .el-input {
                width: 100%;
            }
        }
    }
}

@media screen and (max-width: 768px) {
    .origin-banner {
        padding: 20px 20px 40px;
        
        .banner-content {
            margin-bottom: 0;
            width: 100%;
            
            .banner-title {
                padding: 6px 12px;
                justify-content: center;
                
                i {
                    font-size: 18px;
                }
                
                span {
                    font-size: 16px;
                }
            }
            
            .banner-subtitle {
                font-size: 24px;
            }
        }
        
        .banner-right {
            display: none;
        }
    }
    
    .trace-modules {
        padding: 0 10px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        flex-wrap: nowrap;
        gap: 8px;
        
        .module-item {
            min-width: auto;
            flex: 1;
            margin: 0;
            padding: 10px;
            border-radius: 16px;
            
            .module-content {
                .module-title {
                    font-size: 12px;
                    margin-bottom: 5px;
                }
                
                .module-status {
                    font-size: 12px;
                    
                    i {
                        font-size: 10px;
                        padding: 3px;
                    }
                    
                    span {
                        font-size: 12px;
                    }
                }
            }
        }
    }
    
    .trace-code {
        padding: 30px 0;
        
        .search-container {
            .search-title {
                i {
                    font-size: 20px;
                }
                
                span {
                    font-size: 20px;
                }
            }
            
            .search-desc {
                font-size: 14px;
            }

            .search-box {
                ::v-deep .el-input {
                    .el-input__inner {
                        padding-right: 15px;
                        border-radius: 8px;
                    }

                    .el-input-group__append {
                        display: none;
                    }
                }
            }
        }

        .code-content {
            margin-top: 25px;
            
            .result-text {
                flex-direction: column;
                align-items: center;
                gap: 10px;
                
                &::before {
                   
                    display: block;
                    color: #606266;
                    font-size: 14px;
                }
                
                .code-number {
                    display: block;
                    font-size: 16px;
                    color: #67c23a;
                    margin: 5px 0;
                }
                
                .verify-tag {
                    margin-top: 5px;
                }
            }
        }
    }

    .info-cards-container {
        .el-row {
            margin: 0 !important;
        }

        .el-col {
            width: 100% !important;
            padding: 0 !important;
            margin-bottom: 20px;

            &:last-child {
                margin-bottom: 0;
            }

            .info-card {
                height: auto;
                margin: 0;

                .card-content {
                    padding: 15px;
                }
            }
        }
    }
}

@media screen and (min-width: 769px) and (max-width: 1200px) {
    .info-cards-container {
        .el-row {
            margin: 0 -10px !important;
        }

        .el-col {
            width: 50% !important;
            padding: 0 10px !important;
            margin-bottom: 20px;

            &:last-child {
                width: 100% !important;
            }

            .info-card {
                height: auto;
                margin: 0;

                .card-content {
                    padding: 15px;
                }
            }
        }
    }
}

.search-box {
    .scan-icon {
        display: none;  // 默认隐藏
        font-size: 20px;
        color: #909399;
        cursor: pointer;
        padding: 0 8px;
        
        &:hover {
            color: #409EFF;
        }
    }
}

// 移动端样式
@media screen and (max-width: 768px) {
    .mobile-only {
        display: inline-block !important;
    }
    
    .desktop-only {
        display: none !important;
    }
    
    .search-box {
        ::v-deep .el-input {
            .el-input__inner {
                padding-right: 40px;  // 为扫描图标留出空间
            }
            
            .el-input__suffix {
                right: 5px;
            }
        }
    }
}

// 桌面端样式
@media screen and (min-width: 769px) {
    .mobile-only {
        display: none !important;
    }
    
    .desktop-only {
        display: inline-block !important;
    }
}
</style>
