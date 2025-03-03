<template>
    <div>
       
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
                
                <!-- 添加加载进度组件 -->
                <div class="loading-container" v-if="isLoading">
                    <div class="loading-circle">
                        <img :src="bottleImage" alt="溯源图片" class="bottle-image">
                        <div class="progress-circle" :style="{ background: `conic-gradient(#42b983 ${progress}%, transparent 0%)` }">
                            <div class="progress-inner">
                                <span class="progress-number">{{ progress }}%</span>
                                <span class="progress-text">追溯中</span>
                            </div>
                        </div>
                    </div>
                    <div class="trace-items">
                        <div class="trace-item" v-for="(item, index) in traceItems" :key="index"
                            :class="{ 'traced': progress >= item.threshold }" 
                            v-if="item.name">
                            <span class="item-name">{{ item.name }}：</span>
                            <span class="status-text">
                                <span class="status">可追溯</span>
                                <i class="el-icon-check"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 原有的内容 -->
        <div class="app-container-gray" v-if="showResult">
            <!-- 产地信息卡片组 -->
            <el-card class="info-cards-container">
                <div slot="header" class="clearfix">
                    <span>{{ type === 1 ? '养殖信息' : '产地信息' }}</span>
                    <span class="trace-tag">可追溯</span>
                </div>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-card class="info-card" shadow="hover">
                            <div class="card-header">
                                <i class="el-icon-house"></i>
                                <span>{{ type === 1 ? '鱼棚信息' : '大棚信息' }}</span>
                            </div>
                            <el-empty v-if="!ivPastureInfo" :description="type === 1 ? '暂无鱼棚信息' : '暂无大棚信息'"></el-empty>
                            <div v-else class="card-content">
                                <div class="info-item">
                                    <div class="label">{{ type === 1 ? '鱼棚名称' : '大棚名称' }}</div>
                                    <div class="value">{{ ivPastureInfo.name }}</div>
                                </div>
                                <div class="info-item">
                                    <div class="label">合约地址</div>
                                    <div class="value address">{{ ivPastureInfo.area }}</div>
                                </div>
                                <div class="info-item">
                                    <div class="label">{{ type === 1 ? '鱼棚位置' : '大棚位置' }}</div>
                                    <div class="value">{{ ivPastureInfo.position }}</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>

                    <el-col :span="8">
                        <el-card class="info-card" shadow="hover">
                            <div class="card-header">
                                <i class="el-icon-menu"></i>
                                <span>{{ type === 1 ? '养殖信息' : '分区信息' }}</span>
                            </div>
                            <el-empty v-if="!iaPartitionInfo" :description="type === 1 ? '暂无养殖信息' : '暂无分区信息'"></el-empty>
                            <div v-else class="card-content">
                                <div class="info-item">
                                    <div class="label">分区名称</div>
                                    <div class="value">{{ type === 1 ? iaPartitionInfo.name : iaPartitionInfo.name }}</div>
                                </div>
                                <div class="info-item">
                                    <div class="label">{{ type === 1 ? '养殖品种' : '种植品种' }}</div>
                                    <div class="value">{{ iaPartitionInfo.variety  }}</div>
                                </div>
                                <div class="info-item">
                                    <div class="label">{{ type === 1 ? '养殖日期' : '种植日期' }}</div>
                                    <div class="value">{{ iaPartitionInfo.dateT }}</div>
                                </div>
                                <!-- <div class="info-item">
                                    <div class="label">{{ type === 1 ? '养殖面积' : '种植面积' }}</div>
                                    <div class="value">{{ iaPartitionInfo.cropArea }}平方米</div>
                                </div> -->
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
                                    <div class="label">{{ type === 1 ? '捕捞日期' : '采摘日期' }}</div>
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
                    <span>{{ type === 1 ? '养殖环节' : '种植环节' }}</span>
                    <span class="trace-tag">可追溯</span>
                </div>
                <div class="horizontal-timeline-wrapper">
                    <div v-if="taskList.length" class="horizontal-timeline" :class="{'mobile-vertical-timeline': isMobile, 'two-row-timeline': !isMobile}">
                        <TimelineItem 
                            v-for="(item,index) in taskList" 
                            :tasks="taskList" 
                            :index="index" 
                            :task="item" 
                            :is-mobile="isMobile"
                            :key="index"
                            @show-details="handleShowDetails"
                        />
                    </div>
                    <el-empty v-else description="暂无任务数据"></el-empty>
                </div>
            </el-card>

            <!-- 环境信息卡片 -->
            <el-card class="environment-card">
                <div slot="header" class="clearfix">
                    <span>环境信息</span>
                    <span class="trace-tag">可追溯</span>
                    <el-select 
                        v-model="selectedTaskId" 
                        size="small" 
                        placeholder="请选择任务"
                        style="float: right; margin-left: auto; width: 150px"
                        @change="handleTaskChange"
                    >
                        <el-option
                            v-for="task in taskList"
                            :key="task.taskId"
                            :label="task.taskName"
                            :value="task.taskId"
                        />
                    </el-select>
                </div>
                <div class="env-info-container">
                    <div v-if="physicalNetworkMsg" class="warning-msg">
                        <i class="el-icon-warning"></i>
                        {{ physicalNetworkMsg }}
                    </div>

                    <div class="monitor-section">
                        <div class="section-title">
                            <i class="el-icon-monitor"></i>
                            环境监测
                        </div>
                        <div class="monitor-grid">
                            <div class="monitor-item">
                                <div class="item-label">环境温度</div>
                                <div class="item-value">
                                    <span class="number">{{ environmentData.temperature || 0 }}</span>
                                    <span class="unit">℃</span>
                                </div>
                            </div>
                            <div class="monitor-item">
                                <div class="item-label">环境湿度</div>
                                <div class="item-value">
                                    <span class="number">{{ environmentData.humidity || 0 }}</span>
                                    <span class="unit">%</span>
                                </div>
                            </div>
                            <div class="monitor-item">
                                <div class="item-label">光照强度</div>
                                <div class="item-value">
                                    <span class="number">{{ environmentData.lightLux || 0 }}</span>
                                    <span class="unit">lux</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="soil-section">
                        <div class="section-title">
                            <i class="el-icon-odometer"></i>
                            土壤检测
                        </div>
                        <div class="soil-grid">
                            <div class="soil-row">
                                <div class="soil-item">
                                    <div class="item-label">土壤PH</div>
                                    <div class="item-value">
                                        <span class="number">{{ environmentData.soilPh || 0 }}</span>
                                        <span class="unit">pH</span>
                                    </div>
                                </div>
                                <div class="soil-item">
                                    <div class="item-label">土壤温度</div>
                                    <div class="item-value">
                                        <span class="number">{{ environmentData.soilTemperature || 0 }}</span>
                                        <span class="unit">℃</span>
                                    </div>
                                </div>
                                <div class="soil-item">
                                    <div class="item-label">土壤湿度</div>
                                    <div class="item-value">
                                        <span class="number">{{ environmentData.humidity || 0 }}</span>
                                        <span class="unit">%</span>
                                    </div>
                                </div>
                                <div class="soil-item">
                                    <div class="item-label">电导率</div>
                                    <div class="item-value">
                                        <span class="number">{{ environmentData.soilConductivity || 0 }}</span>
                                        <span class="unit">mS/cm</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </el-card>

        </div>

        <!-- 添加任务详情对话框 -->
        <el-dialog
            title="任务详情"
            :visible.sync="dialogVisible"
            width="50%"
            :before-close="handleClose"
        >
            <div v-if="currentTask" class="task-detail">
                <div class="detail-item">
                    <span class="label">任务名称：</span>
                    <span>{{ currentTask.taskName }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">操作人：</span>
                    <span>{{ currentTask.taskHeadName }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">时间：</span>
                    <span>{{ currentTask.planStart }} 至 {{ currentTask.planFinish }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">状态：</span>
                    <el-tag :type="getStatusType(currentTask.status)">
                        {{ getStatusText(currentTask.status) }}
                    </el-tag>
                </div>
                
                <!-- 农资使用信息 -->
                <div class="resource-section">
                    <div class="section-title">农资使用：</div>
                    <div class="resource-list">
                        <el-tag 
                            v-for="(resource, index) in mockResources" 
                            :key="index"
                            class="resource-tag"
                        >
                            {{ resource.name }}: {{ resource.amount }}{{ resource.unit }}
                        </el-tag>
                    </div>
                </div>

                <!-- 图片展示区域 -->
                <div class="images-section">
                    <div class="section-title">工作照片：</div>
                    <div class="image-list">
                        <el-image 
                            v-for="(img, index) in mockImages" 
                            :key="index"
                            :src="img"
                            :preview-src-list="mockImages"
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
        </el-dialog>
    </div>
</template>


<script>
    import HeaderTop from "@/components/common/Header.vue";
    import TimelineItem from "@/views/iaAgriculture/origin/components/timelineItem.vue";
    import sf from "@/components/origin/sf";
    import environment from "@/components/origin/environment";
    import {
        listBatchTask,
    } from "@/api/agriculture/batchTask";
    import { getBatch } from "@/api/agriculture/batch";
    import { getGermplasm } from "@/api/agriculture/germplasm";
    //鱼的接口
    import { listBatchTask as listFishBatchTask } from "@/api/fishingGround/batchTask";
    import { getBatch as getFishBatch } from "@/api/fishingGround/batch";
    import { getGermplasm as getFishGermplasm } from "@/api/fishingGround/species";
    import http from "@/utils/request";
    import { getSoilSensorValuesByBatchIdAndDateRange } from "@/api/agriculture/value"; // 导入新方法
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
                type: 0, // 添加type字段，默认为0（菜）
                isLoading: false,
                progress: 0,
                progressTimer: null,
                bottleImage: require('@/assets/avatar.png'), // 请确保有这个图片资源
                traceItems: [
                    { name: '产地信息', threshold: 20 },
                    { name: '种植环节', threshold: 40 },
                    { name: '环境信息', threshold: 60 },    
                    { name: '', threshold: 80 }
                ],
                blockchainInfo: {},
                contractAddr: '',
                harvestTimestamp: '',
                processingTimestamp: '',
                isMobile: false,
                selectedTaskId: '', // 选中的任务ID
                environmentData: {
                    temperature: 0,
                    humidity: 0,
                    light: 0,
                    soilPh: 0,
                    soilTemperature: 0,
                    soilHumidity: 0,
                    conductivity: 0
                },
                physicalNetworkMsg: '',
                currentBatchId: null, // 添加一个属性来存储当前的 batchId
                dialogVisible: false,
                currentTask: null,
                // 模拟数据
                mockResources: [
                    { name: '有机肥', amount: '50', unit: 'kg' },
                    { name: '农药', amount: '2', unit: 'L' },
                    { name: '水', amount: '100', unit: 'L' }
                ],
                mockImages: [
                    require('@/assets/avatar.png'),
                    require('@/assets/avatar.png'),
                    require('@/assets/avatar.png')
                ]
            };
        },
        components: {
            HeaderTop,
            environment,
            TimelineItem
        },
        mounted() {
            this.checkDeviceType();
            window.addEventListener('resize', this.checkDeviceType);
            
            // 添加: 检查 URL 参数
            this.checkUrlParams();
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.checkDeviceType);
        },
        methods: {
            originSearch() {
                if (!this.originName) {
                    this.$message.warning('请输入溯源码');
                    return;
                }
                
                this.showResult = false;
                this.isLoading = true;
                this.progress = 0;
                
                // 启动进度动画
                this.startProgress();
                
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
                    // 确保进度动画至少运行2秒
                    setTimeout(() => {
                        this.stopProgress();
                        this.isLoading = false;
                        
                        if (res.data.code === 0) {
                            this.showResult = true;
                            this.type = res.data.data.type;
                            console.log('Type value:', this.type);

                            // 处理鱼棚/大棚信息
                            this.ivPastureInfo = this.mapInfo(res.data.data.ivPastureInfo, {
                                _greenhouseName: "name",
                                _greenhouseArea: "area",
                                _greenhousePosition: "position",
                            });
                            this.ivPastureInfo.area = res.data.data.contractAddr;

                            // 处理分区信息
                            if (this.type === 1) {
                                // 鱼的数据结构处理
                                const partitionInfo = res.data.data.iaPartitionInfo;
                                if (typeof partitionInfo === 'string') {
                                    try {
                                        // 提取Tuple中的值
                                        const matches = partitionInfo.match(/value\d+=([^,}]+)/g);
                                        if (matches) {
                                            this.iaPartitionInfo = {
                                                name: matches[2]?.split('=')[1] || '', // value3 (暂时设置，后续会被batchName覆盖)
                                                variety: '', // 这个会在getStepsList中通过品种接口获取
                                                dateT: matches[5]?.split('=')[1] || '', // value6
                                                id: matches[0]?.split('=')[1] || '', // value1
                                                greenhouseAddress: matches[6]?.split('=')[1] || '' // value7
                                            };
                                        }
                                    } catch (error) {
                                        console.error('解析分区信息失败:', error);
                                    }
                                }
                            } else {
                                // 菜的数据结构处理（保持原有逻辑）
                                this.iaPartitionInfo = this.mapInfo(res.data.data.iaPartitionInfo, {
                                    _partitionsName: "name",
                                    _plantingVarieties: "variety",
                                    _plantingDate: "dateT",
                                    _id: "id",
                                    _ofGreenhouse: "greenhouseAddress",
                                });
                            }

                            // 处理食品信息
                            if (this.type === 1) {
                                // 鱼的数据结构处理
                                const foodInfo = res.data.data.iaPartitionFoodSensorValueInfo;
                                if (foodInfo) {
                                    this.shopInfo = {
                                        name: foodInfo.productName,
                                        datet: foodInfo.processingTimestamp,
                                        quality: foodInfo.quality,
                                        weight: foodInfo.weight
                                    };
                                }
                            } else {
                                // 菜的数据结构处理（保持原有逻辑）
                                const sensorValueInfo = res.data.data.iaPartitionFoodSensorValueInfo[0]?.listValues || [];
                                this.shopInfo = this.mapInfo(sensorValueInfo, {
                                    foodName: "name",
                                    processingTimestamp: "datet",
                                    quality: "quality",
                                    weight: "weight",
                                });
                            }

                            // 处理日期格式
                            if (this.shopInfo.datet) {
                                this.shopInfo.datet = new Date(parseInt(this.shopInfo.datet)).toLocaleString();
                            }

                            // 处理质量等级
                            this.shopInfo.quality = this.shopInfo.quality === "2" ? "优秀" :
                                this.shopInfo.quality === "1" ? "及格" : "不合格";

                            this.tableData = res.data.data.map;
                            this.getStepsList(this.originName);

                            // 处理区块链相关信息
                            this.handleTraceabilityResponse(res);
                        } else {
                            this.showResult = false;
                            this.$message.error(res.data.msg);
                        }
                        console.log( res.data.data.iaPartitionInfo[0])
                        const data = {
                            "name":this.shopInfo.name,
                            "type":this.type,
                            "traceCode":this.originName
                        }
                        this.$http.post("/dev-api/iaPartitionFoodSensorValue/addAgricultureTraceRecord", data)
                        .then((res) => {
                        }).catch((error) => {
                            console.error("请求失败:", error);
                        })

                    }, 2000);
                })
                .catch((error) => {
                    this.stopProgress();
                    this.isLoading = false;
                    this.showResult = false;
                    console.error("请求失败:", error);
                    this.$message.error("数据加载失败，请稍后再试");
                });
            },
            async getProcessList(id) {
                try {
                    if (this.type === 1) {
                        // 鱼的处理逻辑
                        console.log('Requesting fish partition food detail for id:', id);
                        const response = await http.post('/fishPasture/fishPartitionFood/detail', {}, { params: { id } });
                        console.log('Fish Partition Food Detail response:', response);
                        
                        // 直接从响应对象中获取 fishPartitionId
                        return response.data.fishPartitionId;
                    } else {
                        // 菜的处理逻辑保持不变
                        const { data } = await http.post('/iaPartitionFood/detail', {}, { params: { id } });
                        return data.iaPartitionId;
                    }
                } catch (e) {
                    console.error('getProcessList error:', e);
                    this.$message.error('网络错误请重试！');
                    throw e;
                }
            },

            async getStepsList(id) {
                try {
                    const batchId = await this.getProcessList(id);
                    console.log('Got batchId:', batchId);
                    this.currentBatchId = batchId; // 保存 batchId

                    // 根据type选择不同的接口
                    const response = await (this.type === 1 ? listFishBatchTask : listBatchTask)({
                        pageNum: 1,
                        pageSize: 100,
                        batchId,
                    });
                    console.log('Batch tasks response:', response);

                    const { rows, total } = response;
                    this.taskList = rows;
            
                    // 如果有任务数据,自动选择第一个任务
                    if (this.taskList && this.taskList.length > 0) {
                        this.selectedTaskId = this.taskList[0].taskId;
                        // 触发任务选择变更,加载对应的环境数据
                        await this.handleTaskChange(this.selectedTaskId);
                    }

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
                    console.error("getStepsList error details:", error);
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
            },
            // 添加进度控制方法
            startProgress() {
                this.progressTimer = setInterval(() => {
                    if (this.progress < 99) {
                        this.progress += 1;
                    }
                }, 20);
            },
            
            stopProgress() {
                clearInterval(this.progressTimer);
                this.progress = 100;
                setTimeout(() => {
                    this.progress = 0;
                }, 500);
            },
            copyHash(text) {
                navigator.clipboard.writeText(text)
                    .then(() => {
                        this.$message.success('已复制到剪贴板');
                    })
                    .catch(() => {
                        this.$message.error('复制失败');
                    });
            },
            formatTimestamp(timestamp) {
                if (!timestamp) return '--';
                return new Date(parseInt(timestamp)).toLocaleString();
            },
            handleTraceabilityResponse(res) {
                if (res.data.code === 0) {
                    // 设置区块链相关信息
                    this.contractAddr = res.data.data.contractAddr;
                    this.harvestTimestamp = res.data.data.iaPartitionInfo.find(
                        item => item.name === '_harvestTimestamp'
                    )?.numericValue?.value;
                    this.processingTimestamp = res.data.data.iaPartitionFoodSensorValueInfo[0]?.listValues.find(
                        item => item.name === 'processingTimestamp'
                    )?.numericValue?.value;
                }
            },
            checkDeviceType() {
                this.isMobile = window.innerWidth <= 768;
            },
            // 修改 handleTaskChange 方法
            async handleTaskChange(taskId) {
                if (!this.currentBatchId) {
                    console.error('No batch ID available');
                    return;
                }

                const selectedTask = this.taskList.find(task => task.taskId === taskId);
                if (!selectedTask) return;

                // 使用实际开始和结束时间
                const startDate = selectedTask.actualStart;
                const endDate = selectedTask.actualFinish;

                // 打印请求参数
                console.log('请求参数:', { batchId: this.currentBatchId, startDate, endDate });

                try {
                    // 调用新接口获取土壤环境数据
                    const soilDataResponse = await getSoilSensorValuesByBatchIdAndDateRange(
                        this.currentBatchId, 
                        startDate, 
                        endDate
                    );
                    const soilData = soilDataResponse.rows || [];

                    // 计算不同环境数据的平均值
                    const averages = this.calculateAverages(soilData);

                    // 打印计算的平均值
                    console.log('计算的平均值:', averages);

                    // 更新环境数据
                    this.environmentData = {
                        ...this.environmentData,
                        ...averages
                    };
                } catch (error) {
                    console.error('获取环境数据失败:', error);
                    this.$message.error('获取环境数据失败');
                }
            },

            calculateAverages(data) {
                const total = data.length;
                if (total === 0) return {}; // 如果没有数据，返回空对象

                const sums = data.reduce((acc, item) => {
                    acc.temperature += parseFloat(item.temperature) || 0;
                    acc.humidity += parseFloat(item.humidity) || 0;
                    acc.lightLux += parseFloat(item.lightLux) || 0;
                    acc.soilMoisture += parseFloat(item.soilMoisture) || 0;
                    acc.soilTemperature += parseFloat(item.soilTemperature) || 0;
                    acc.soilPh += parseFloat(item.soilPh) || 0;
                    acc.soilConductivity += parseFloat(item.soilConductivity) || 0;

                    // 打印每个数据项的值
                    console.log('当前数据项:', item);

                    return acc;
                }, {
                    temperature: 0,
                    humidity: 0,
                    lightLux: 0,
                    soilMoisture: 0,
                    soilTemperature: 0,
                    soilPh: 0,
                    soilConductivity: 0
                });

                return {
                    temperature: (sums.temperature / total).toFixed(2),
                    humidity: (sums.humidity / total).toFixed(2),
                    lightLux: (sums.lightLux / total).toFixed(2),
                    soilMoisture: (sums.soilMoisture / total).toFixed(2),
                    soilTemperature: (sums.soilTemperature / total).toFixed(2),
                    soilPh: (sums.soilPh / total).toFixed(2),
                    soilConductivity: (sums.soilConductivity / total).toFixed(2)
                };
            },

            // 获取任务列表后的处理
            async afterGetTaskList() {
                if (this.taskList && this.taskList.length > 0) {
                    // 默认选中第一个任务
                    this.selectedTaskId = this.taskList[0].taskId;
                    await this.handleTaskChange(this.selectedTaskId);
                }
            },

            // 重写获取任务列表的方法
            async getTaskList() {
                // ... 原有的获取任务列表代码 ...
                const response = await (this.type === 1 ? listFishBatchTask : listBatchTask)({
                    pageNum: 1,
                    pageSize: 100,
                    batchId,
                });
                
                if (response.data) {
                    this.taskList = response.data;
                    await this.afterGetTaskList();
                }
            },
            handleShowDetails(task) {
                console.log('显示任务详情:', task);  // 用于调试
                this.currentTask = task;
                this.dialogVisible = true;
            },
            handleClose(done) {
                this.currentTask = null;
                done();
            },
            getStatusType(status) {
                const types = {
                    '1': 'info',
                    '2': 'warning',
                    '3': 'success'
                };
                return types[status] || 'info';
            },
            getStatusText(status) {
                const texts = {
                    '1': '未开始',
                    '2': '进行中',
                    '3': '已完成'
                };
                return texts[status] || '未知状态';
            },
            // 添加: 检查 URL 参数的方法
            checkUrlParams() {
                // 获取当前 URL 的查询参数
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code'); // 获取名为 'code' 的参数
                
                // 如果存在溯源码参数，自动触发查询
                if (code) {
                    this.originName = code;
                    this.originSearch();
                }
            },
        },
        computed: {
            // 删除原有的isAquaculture计算属性，因为现在直接使用type
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
    margin-top: 20px;
    background: #fff;

    ::v-deep .el-card__header {
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

            .el-select {
                margin-left: auto; // 将选择框推到右边
            }
        }
    }

    .env-info-container {
        padding: 20px;

        .env-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 15px;
            font-size: 16px;
            color: #333;

            i {
                color: #409EFF;
            }
        }

        .monitor-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }

        .soil-grid {
            .soil-row {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 15px;
            }
        }

        .monitor-item, .soil-item {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            text-align: left;

            .item-label {
                color: #666;
                font-size: 14px;
                margin-bottom: 10px;
            }

            .item-value {
                display: flex;
                align-items: baseline;
                gap: 4px;

                .number {
                    font-size: 20px;
                    font-weight: 500;
                    color: #333;
                }

                .unit {
                    font-size: 12px;
                    color: #999;
                }
            }
        }
    }
}

@media screen and (max-width: 768px) {
    .environment-card {
        .env-info-container {
            .monitor-grid,
            .soil-grid .soil-row {
                grid-template-columns: repeat(2, 1fr);
            }
        }
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
        background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
        border-radius: 50%;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        opacity: 0.6;
    }

    // 右下大圆
    &::after {
        content: '';
        position: absolute;
        right: -15%;
        bottom: -30%;
        width: 400px;
        height: 400px;
        background: linear-gradient(225deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
        border-radius: 50%;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        opacity: 0.5;
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
            background: linear-gradient(45deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
            border-radius: 50%;
            opacity: 0.4;
        }

        .circle-2 {
            position: absolute;
            right: 35%;
            bottom: 30%;
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%);
            border-radius: 50%;
            opacity: 0.3;
        }

        .circle-3 {
            position: absolute;
            left: 30%;
            top: 40%;
            width: 60px;
            height: 60px;
            background: linear-gradient(225deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%);
            border-radius: 50%;
            opacity: 0.35;
        }

        .circle-4 {
            position: absolute;
            right: 15%;
            top: 35%;
            width: 90px;
            height: 90px;
            background: linear-gradient(315deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%);
            border-radius: 50%;
            opacity: 0.25;
        }

        // 移除之前的 &::before 和 &::after
        &::before, &::after {
            display: none;
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

        &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.1) 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        &:hover {
            &::after {
                opacity: 1;
            }
            
            .module-content {
                transform: translateY(-2px);
            }
        }
        
        .module-content {
            position: relative;
            z-index: 1;
            transition: transform 0.3s ease;
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

.loading-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;

    .loading-circle {
        position: relative;
        width: 200px;
        height: 200px;
        margin-bottom: 40px;

        .bottle-image {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 60%;
            height: auto;
            z-index: 2;
        }

        .progress-circle {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            position: relative;
            transition: all 0.3s ease;

            &::before {
                content: '';
                position: absolute;
                top: 5px;
                left: 5px;
                right: 5px;
                bottom: 5px;
                background: white;
                border-radius: 50%;
            }
        }

        .progress-inner {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 1;

            .progress-number {
                display: block;
                font-size: 24px;
                font-weight: bold;
                color: #42b983;
            }

            .progress-text {
                display: block;
                font-size: 14px;
                color: #909399;
                margin-top: 5px;
            }
        }
    }

    .trace-items {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-top: 20px;

        .trace-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #909399;
            transition: all 0.3s ease;

            .item-name {
                min-width: 80px;
                text-align: right;
                font-size: 14px;
            }

            .status-text {
                display: flex;
                align-items: center;
                gap: 5px;
                opacity: 0.5;
                
                .status {
                    color: #67C23A;
                }

                i {
                    color: #67C23A;
                    font-size: 14px;
                    opacity: 0;
                    transform: scale(0);
                    transition: all 0.3s ease;
                }
            }

            &.traced {
                .status-text {
                    opacity: 1;
                    
                    i {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            }
        }
    }
}

.blockchain-card {
    margin: 20px 0;
    
    .el-card__header {
        .el-icon-info {
            margin-left: 8px;
            color: #909399;
            cursor: help;
        }
    }
    
    .blockchain-info {
        .info-row {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 6px;
            
            .label {
                min-width: 100px;
                color: #606266;
                font-size: 14px;
            }
            
            .value {
                flex: 1;
                color: #303133;
                font-family: monospace;
                
                &.hash {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    
                    .el-icon-document-copy {
                        cursor: pointer;
                        color: #409EFF;
                        
                        &:hover {
                            color: #66b1ff;
                        }
                    }
                }
            }
        }
        
        .blockchain-verify {
            text-align: center;
            margin-top: 20px;
        }
    }
}

.horizontal-timeline-wrapper {
    overflow: auto;
    padding: 20px 0;
    
    .horizontal-timeline {
        display: flex;
        position: relative;
        transition: all 0.3s ease;
        
        &.mobile-vertical-timeline {
            flex-direction: column;
            margin: 0 10px;
            
            &::before {
                content: '';
                position: absolute;
                top: 0;
                bottom: 0;
                left: 15px;
                width: 2px;
                background-color: #EBEEF5;
                z-index: 0;
            }
        }
        
        &.two-row-timeline {
            flex-wrap: wrap;
            justify-content: center;
            
            // 为两行布局添加样式
            ::v-deep .timeline-item {
                width: calc(20% - 20px);  // 改为20%，一行5个卡片
                margin: 10px;
                flex: 0 0 auto;
                
                @media screen and (max-width: 1600px) {
                    width: calc(20% - 20px);
                }
                
                @media screen and (max-width: 1400px) {
                    width: calc(25% - 20px);  // 小屏幕时4个卡片
                }
                
                @media screen and (max-width: 1200px) {
                    width: calc(33.33% - 20px);  // 更小屏幕时3个卡片
                }
                
                @media screen and (max-width: 992px) {
                    width: calc(50% - 20px);  // 最小屏幕时2个卡片
                }
            }
        }
    }
}

// Add mobile-specific styles
@media screen and (max-width: 768px) {
    .timeline-card {
        .horizontal-timeline-wrapper {
            padding: 10px 0;
            
            .horizontal-timeline {
                padding-left: 10px;
            }
        }
    }
}

.env-info-container {
    .env-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding: 0 10px;
    }

    .warning-msg {
        // ... existing styles ...
    }

    .monitor-section,
    .soil-section {
        // ... existing styles ...
    }
}

.task-detail {
    padding: 10px;

    .detail-item {
        margin-bottom: 15px;
        
        .label {
            font-weight: bold;
            color: #606266;
            margin-right: 10px;
        }
    }

    .resource-section,
    .images-section {
        margin-top: 20px;

        .section-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #303133;
            border-left: 3px solid #42b983;
            padding-left: 10px;
        }
    }

    .resource-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .resource-tag {
            margin: 4px;
        }
    }

    .image-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 10px;

        .task-image {
            width: 100%;
            height: 120px;
            border-radius: 4px;
            
            &:hover {
                cursor: pointer;
                transform: scale(1.05);
                transition: transform 0.3s;
            }
        }
    }
}

.el-dialog {
    .el-dialog__body {
        max-height: 70vh;
        overflow-y: auto;
    }
}
</style>
