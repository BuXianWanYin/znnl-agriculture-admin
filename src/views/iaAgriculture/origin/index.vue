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
                    <span>智链兴农</span>
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
                            :type="type"
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

                    <!-- 水产养殖环境 -->
                    <div v-if="type === 1" class="monitor-section">
                        <div class="section-title">
                            <i class="el-icon-monitor"></i>
                            水质检测
                        </div>
                        <div class="monitor-grid">
                            <div class="monitor-item temperature">
                                <div class="item-bg">
                                    <svg viewBox="0 0 100 100" class="bg-icon">
                                        <path d="M45,20v40.5c-4.1,2.4-7,6.9-7,12c0,7.7,6.3,14,14,14s14-6.3,14-14c0-5.1-2.9-9.6-7-12V20c0-5.5-4.5-10-10-10 S45,14.5,45,20z M52,65.5c4.1,0,7.5,3.4,7.5,7.5s-3.4,7.5-7.5,7.5s-7.5-3.4-7.5-7.5S47.9,65.5,52,65.5z"/>
                                    </svg>
                                </div>
                                <div class="item-label">水温</div>
                                <div class="item-value">
                                    <span class="number">{{ environmentData.waterTemperature || 0 }}</span>
                                    <span class="unit">℃</span>
                                </div>
                            </div>
                            <div class="monitor-item ph">
                                <div class="item-bg">
                                    <svg viewBox="0 0 100 100" class="bg-icon">
                                        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="6"/>
                                        <text x="50" y="58" text-anchor="middle" font-size="24" fill="currentColor">pH</text>
                                    </svg>
                                </div>
                                <div class="item-label">pH值</div>
                                <div class="item-value">
                                    <span class="number">{{ environmentData.waterPh || 0 }}</span>
                                </div>
                            </div>
                            <div class="monitor-item oxygen">
                                <div class="item-bg">
                                    <svg viewBox="0 0 100 100" class="bg-icon">
                                        <circle cx="50" cy="50" r="30"/>
                                        <text x="50" y="58" text-anchor="middle" font-size="24" fill="#fff">O₂</text>
                                    </svg>
                                </div>
                                <div class="item-label">溶解氧</div>
                                <div class="item-value">
                                    <span class="number">{{ environmentData.dissolvedOxygen || 0 }}</span>
                                    <span class="unit">mg/L</span>
                                </div>
                            </div>
                            <div class="monitor-item ammonia">
                                <div class="item-bg">
                                    <svg viewBox="0 0 100 100" class="bg-icon">
                                        <text x="50" y="58" text-anchor="middle" font-size="24" fill="currentColor">NH₄</text>
                                    </svg>
                                </div>
                                <div class="item-label">氨氮含量</div>
                                <div class="item-value">
                                    <span class="number">{{ environmentData.ammoniaNitrogen || 0 }}</span>
                                    <span class="unit">mg/L</span>
                                </div>
                            </div>
                            <div class="monitor-item nitrite">
                                <div class="item-bg">
                                    <svg viewBox="0 0 100 100" class="bg-icon">
                                        <text x="50" y="58" text-anchor="middle" font-size="24" fill="currentColor">NO₂</text>
                                    </svg>
                                </div>
                                <div class="item-label">亚硝酸盐</div>
                                <div class="item-value">
                                    <span class="number">{{ environmentData.nitriteNitrogen || 0 }}</span>
                                    <span class="unit">mg/L</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 蔬菜种植环境(环境检测和土壤检测) -->
                    <template v-else>
                        <div class="monitor-section">
                            <div class="section-title">
                                <i class="el-icon-monitor"></i>
                                环境监测
                            </div>
                            <div class="monitor-grid">
                                <div class="monitor-item temperature">
                                    <div class="item-bg">
                                        <svg viewBox="0 0 100 100" class="bg-icon">
                                            <path d="M45,20v40.5c-4.1,2.4-7,6.9-7,12c0,7.7,6.3,14,14,14s14-6.3,14-14c0-5.1-2.9-9.6-7-12V20c0-5.5-4.5-10-10-10 S45,14.5,45,20z M52,65.5c4.1,0,7.5,3.4,7.5,7.5s-3.4,7.5-7.5,7.5s-7.5-3.4-7.5-7.5S47.9,65.5,52,65.5z"/>
                                        </svg>
                                    </div>
                                    <div class="item-label">环境温度</div>
                                    <div class="item-value">
                                        <span class="number">{{ environmentData.temperature || 0 }}</span>
                                        <span class="unit">℃</span>
                                    </div>
                                </div>
                                <div class="monitor-item humidity">
                                    <div class="item-bg">
                                        <svg viewBox="0 0 100 100" class="bg-icon">
                                            <path d="M50,15L35.7,36.9C29,47.5,29,54.5,29,58.2C29,71.9,38.3,83,50,83s21-11.1,21-24.8c0-3.7,0-10.7-6.7-21.3L50,15z"/>
                                        </svg>
                                    </div>
                                    <div class="item-label">环境湿度</div>
                                    <div class="item-value">
                                        <span class="number">{{ environmentData.humidity || 0 }}</span>
                                        <span class="unit">%</span>
                                    </div>
                                </div>
                                <div class="monitor-item light">
                                    <div class="item-bg">
                                        <svg viewBox="0 0 100 100" class="bg-icon">
                                            <circle cx="50" cy="50" r="20"/>
                                            <path d="M50,25V10 M50,90V75 M75,50H90 M10,50H25 M75,75L85,85 M15,15L25,25 M75,25L85,15 M15,85L25,75"/>
                                        </svg>
                                    </div>
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
                                <div class="soil-item ph">
                                    <div class="item-bg">
                                        <svg viewBox="0 0 100 100" class="bg-icon">
                                            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="6"/>
                                            <text x="50" y="58" text-anchor="middle" font-size="24" fill="currentColor">pH</text>
                                        </svg>
                                    </div>
                                    <div class="item-label">土壤PH</div>
                                    <div class="item-value">
                                        <span class="number">{{ environmentData.soilPh || 0 }}</span>
                                        <span class="unit">pH</span>
                                    </div>
                                </div>
                                <div class="soil-item temperature">
                                    <div class="item-bg">
                                        <svg viewBox="0 0 100 100" class="bg-icon">
                                            <path d="M40,10v50c-8,4-12,15-8,24s15,12,24,8s12-15,8-24c-1.4-3-3.8-5.6-7-7V10c0-5.5-4.5-10-10-10S40,4.5,40,10z"/>
                                            <circle cx="50" cy="70" r="6"/>
                                        </svg>
                                    </div>
                                    <div class="item-label">土壤温度</div>
                                    <div class="item-value">
                                        <span class="number">{{ environmentData.soilTemperature || 0 }}</span>
                                        <span class="unit">℃</span>
                                    </div>
                                </div>
                                <div class="soil-item humidity">
                                    <div class="item-bg">
                                        <svg viewBox="0 0 100 100" class="bg-icon">
                                            <path d="M50,15L35.7,36.9C29,47.5,29,54.5,29,58.2C29,71.9,38.3,83,50,83s21-11.1,21-24.8c0-3.7,0-10.7-6.7-21.3L50,15z"/>
                                        </svg>
                                    </div>
                                    <div class="item-label">土壤湿度</div>
                                    <div class="item-value">
                                        <span class="number">{{ environmentData.soilMoisture || 0 }}</span>
                                        <span class="unit">%</span>
                                    </div>
                                </div>
                                <div class="soil-item conductivity">
                                    <div class="item-bg">
                                        <svg viewBox="0 0 100 100" class="bg-icon">
                                            <path d="M20,50h15 M65,50h15"/>
                                            <path d="M35,50c0-8.3,6.7-15,15-15s15,6.7,15,15s-6.7,15-15,15S35,58.3,35,50z"/>
                                            <path d="M38,35l-8-8 M62,65l8,8 M62,35l8-8 M38,65l-8,8" stroke-width="2"/>
                                        </svg>
                                    </div>
                                    <div class="item-label">电导率</div>
                                    <div class="item-value">
                                        <span class="number">{{ environmentData.soilConductivity || 0 }}</span>
                                        <span class="unit">mS/cm</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
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
                    <span>{{ currentTask.actualStart }} 至 {{ currentTask.actualFinish }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">状态：</span>
                    <el-tag :type="getStatusType(currentTask.status)">
                        {{ getStatusText(currentTask.status) }}
                    </el-tag>
                </div>
                
                <!-- 农资/饵料使用信息 -->
                <div class="resource-section" v-if="mockResources && mockResources.length > 0">
                    <div class="section-title">{{ type === 1 ? '饵料使用' : '农资使用' }}：</div>
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

                <!-- 用药记录（仅鱼类显示） -->
                <div class="resource-section" v-if="type === 1 && mockMedicineData && mockMedicineData.length > 0">
                    <div class="section-title">用药记录：</div>
                    <div class="resource-list">
                        <el-tag 
                            v-for="(medicine, index) in mockMedicineData" 
                            :key="index"
                            class="resource-tag"
                            type="warning"
                        >
                            {{ medicine.medicineName }}: {{ medicine.dosage }}{{ medicine.unit }}
                        </el-tag>
                    </div>
                </div>

                <!-- Only show images section if taskImages exists and is not empty -->
                <div v-if="currentTask.taskImages && currentTask.taskImages.trim() && currentTask.taskImages !== '加载失败'" class="images-section">
                    <div class="section-title">工作照片：</div>
                    <div class="image-list">
                        <el-image 
                            v-for="(image, index) in currentTask.taskImages.split(',')"
                            :key="index"
                            :src="getImageUrl(image)"
                            :preview-src-list="currentTask.taskImages.split(',').map(img => getImageUrl(img))"
                            fit="cover"
                            class="task-image"
                        />
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
    import { getSoilSensorValuesByBatchIdAndDateRange } from "@/api/agriculture/value"; //土壤环境 环境
    import { selectFishWaterQualityByBatchIdAndDateRange } from "@/api/fishingGround/quality"; //水质数据
    import { listCostMaterial } from "@/api/agriculture/costMaterial"; 
    import { getMaterialInfo } from '@/api/agriculture/materialInfo'; 
    import { listCostBait } from '@/api/fishingGround/costBait';       //饵料用量
    import { getBaitInfo } from '@/api/fishingGround/BaitInfo';       //饵料详细
    import { listCostMedicine } from '@/api/fishingGround/costMedicine';       //药品用量
    import { getMedicineInfo } from '@/api/fishingGround/MedicineInfo'       //药品详细



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
                bottleImage: require('@/assets/logo/logo.png'), // 请确保有这个图片资源
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
                    waterTemperature: 0,
                    waterPh: 0,
                    dissolvedOxygen: 0,
                    ammoniaNitrogen: 0,
                    nitriteNitrogen: 0
                },
                physicalNetworkMsg: '',
                currentBatchId: null, // 添加一个属性来存储当前的 batchId
                dialogVisible: false,
                currentTask: null,
                // 模拟数据
                mockResources: [], // Remove mock data, we'll use real data
                mockImages: [
                    require('@/assets/avatar.png'),
                    require('@/assets/avatar.png'),
                    require('@/assets/avatar.png')
                ],
                mockMedicineData: [
                    {
                        medicineName: "测试药品1",
                        dosage: "100",
                        unit: "ml",
                        useTime: "2024-03-20",
                        operator: "张三"
                    },
                    {
                        medicineName: "测试药品2",
                        dosage: "200",
                        unit: "g",
                        useTime: "2024-03-21",
                        operator: "李四"
                    }
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
                                                name: matches[2]?.split('=')[1] || '', 
                                                variety: '', 
                                                dateT: matches[5]?.split('=')[1] || '',
                                                id: matches[0]?.split('=')[1] || '', 
                                                greenhouseAddress: matches[6]?.split('=')[1] || '' 
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
              
                        const data = {
                            "name":this.shopInfo.name,
                            "type":this.type,
                            "traceCode":this.originName
                        }
                        console.log(data)
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
                       
                        const response = await http.post('/fishPasture/fishPartitionFood/detail', {}, { params: { id } });
               
                        
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
                    this.currentBatchId = batchId;
                  
                    // 获取批次和品种信息
                    try {
                        const [batchResponse, germplasmResponse] = await this.getBatchAndGermplasmInfo(batchId);
                        
                        // 更新种植/养殖信息
                        if (batchResponse?.data && germplasmResponse?.data) {
                            this.iaPartitionInfo = {
                                ...this.iaPartitionInfo,
                                variety: this.type === 1 
                                    ? germplasmResponse.data.fishSpeciesName 
                                    : germplasmResponse.data.germplasmName || '',
                                dateT: batchResponse.data.startTime || '',
                            };
                        }
                    } catch (error) {
                        console.error(`获取${this.type === 1 ? '水产' : '蔬菜'}信息失败:`, error);
                    }

                    // 获取任务列表
                    const response = await (this.type === 1 ? listFishBatchTask : listBatchTask)({
                        pageNum: 1,
                        pageSize: 100,
                        batchId,
                    });

                    if (response.rows) {
                        // 预加载每个任务的详细信息
                        this.taskList = await Promise.all(response.rows.map(async (task) => {
                            // 预加载资源信息
                            const taskWithResources = await this.processTaskResources([task]);
                            const enrichedTask = taskWithResources[0];
                            
                            if (this.type === 1) {
                                // 预加载水产养殖特定信息
                                const [baitResponse, medicineResponse] = await Promise.all([
                                    listCostBait({
                                        pageNum: 1,
                                        pageSize: 10,
                                        taskId: task.taskId
                                    }),
                                    listCostMedicine({
                                        pageNum: 1,
                                        pageSize: 10,
                                        taskId: task.taskId
                                    })
                                ]);

                                // 处理饵料信息
                                const baitDetails = await Promise.all((baitResponse.rows || []).map(async (bait) => {
                                    const baitInfo = await getBaitInfo(bait.baitId);
                                    return {
                                        name: baitInfo.data.baitName,
                                        amount: bait.baitCount,
                                        unit: bait.measureUnit
                                    };
                                }));

                                // 处理药品信息
                                const medicineDetails = await Promise.all((medicineResponse.rows || []).map(async (medicine) => {
                                    const medicineInfo = await getMedicineInfo(medicine.medicineId);
                                    return {
                                        medicineName: medicineInfo.data.medicineName,
                                        dosage: medicine.medicineCount,
                                        unit: medicine.measureUnit
                                    };
                                }));

                                return {
                                    ...enrichedTask,
                                    baitDetails,
                                    medicineDetails
                                };
                            } else {
                                // 预加载农资信息
                                const materialResponse = await listCostMaterial({
                                    pageNum: 1,
                                    pageSize: 10,
                                    taskId: task.taskId
                                });

                                const materialDetails = await Promise.all((materialResponse.rows || []).map(async (material) => {
                                    const materialInfo = await getMaterialInfo(material.materialId);
                                    return {
                                        name: materialInfo.data.materialName,
                                        amount: material.materialCount,
                                        unit: material.measureUnit
                                    };
                                }));

                                return {
                                    ...enrichedTask,
                                    materialDetails
                                };
                            }
                        }));

                        // 默认选中第一个任务
                        if (this.taskList.length > 0) {
                            this.selectedTaskId = this.taskList[0].taskId;
                            await this.handleTaskChange(this.selectedTaskId);
                        }
                    }

                } catch (error) {
                    console.error("getStepsList error details:", error);
                    this.$message.error("任务列表加载失败，请稍后再试");
                }
            },

            // 获取批次和品种信息
            async getBatchAndGermplasmInfo(batchId) {
                if (this.type === 1) {
                    // 水产养殖
                    const batchResponse = await getFishBatch(batchId);
                  
                    let germplasmResponse = null;
                    if (batchResponse.data?.speciesId) {
                        germplasmResponse = await getFishGermplasm(batchResponse.data.speciesId);
                
                    }
                    
                    return [batchResponse, germplasmResponse];
                } else {
                    // 蔬菜种植
                    const batchResponse = await getBatch(batchId);
                   
                    
                    let germplasmResponse = null;
                    if (batchResponse.data?.germplasmId) {
                        germplasmResponse = await getGermplasm(batchResponse.data.germplasmId);
                    
                    }
                    
                    return [batchResponse, germplasmResponse];
                }
            },

            // 处理任务资源信息
            async processTaskResources(tasks) {
                return Promise.all(tasks.map(async (task) => {
                    try {
                        if (this.type === 1) {
                            // 水产养殖 - 获取饵料使用信息
                            const baitResponse = await listCostBait({
                                pageNum: 1,
                                pageSize: 10,
                                taskId: task.taskId
                            });
                            
                            let resources = [];
                            if (baitResponse.rows) {
                                for (const bait of baitResponse.rows) {
                                    try {
                                        const baitDetails = await getBaitInfo(bait.baitId);
                                        resources.push({
                                            name: baitDetails.data.baitName,
                                            amount: bait.baitCount,
                                            unit: bait.measureUnit,
                                            type: 'bait' // 标记为饵料
                                        });
                                    } catch (error) {
                                        console.error('获取饵料详情失败:', error);
                                    }
                                }
                            }
                            
                            // 获取药品使用信息
                            const medicineResponse = await listCostMedicine({
                                pageNum: 1,
                                pageSize: 10,
                                taskId: task.taskId
                            });

                            if (medicineResponse.rows) {
                                for (const medicine of medicineResponse.rows) {
                                    try {
                                        const medicineDetails = await getMedicineInfo(medicine.medicineId);
                                        resources.push({
                                            name: medicineDetails.data.medicineName,
                                            amount: medicine.medicineCount,
                                            unit: medicine.measureUnit,
                                            type: 'medicine' // 标记为药品
                                        });
                                    } catch (error) {
                                        console.error('获取药品详情失败:', error);
                                    }
                                }
                            }

                            return { ...task, resources };
                        } else {
                            // 蔬菜种植 - 获取农资使用信息
                            const costMaterialResponse = await listCostMaterial({
                                pageNum: 1,
                                pageSize: 10,
                                taskId: task.taskId
                            });

                            if (costMaterialResponse.rows) {
                                const resources = await Promise.all(costMaterialResponse.rows.map(async (material) => {
                                    const materialDetails = await getMaterialInfo(material.materialId);
                                    return {
                                        name: materialDetails.data.materialName,
                                        amount: material.materialCount,
                                        unit: material.measureUnit
                                    };
                                }));
                                return { ...task, resources };
                            }
                        }
                        return task;
                    } catch (error) {
                        console.error('处理任务资源信息失败:', error);
                        return task;
                    }
                }));
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
                    
                    // 修复数组处理
                    const partitionInfo = res.data.data.iaPartitionInfo;
                    if (Array.isArray(partitionInfo)) {
                        const harvestItem = partitionInfo.find(
                            item => item.name === '_harvestTimestamp'
                        );
                        this.harvestTimestamp = harvestItem?.numericValue?.value;
                    }

                    const sensorValueInfo = res.data.data.iaPartitionFoodSensorValueInfo;
                    if (Array.isArray(sensorValueInfo) && sensorValueInfo.length > 0) {
                        const processingItem = sensorValueInfo[0].listValues?.find(
                            item => item.name === 'processingTimestamp'
                        );
                        this.processingTimestamp = processingItem?.numericValue?.value;
                    } else if (sensorValueInfo && sensorValueInfo.processingTimestamp) {
                        // 处理非数组情况
                        this.processingTimestamp = sensorValueInfo.processingTimestamp;
                    }
                }
            },
            checkDeviceType() {
                this.isMobile = window.innerWidth <= 768;
            },
            // 修改 handleTaskChange 方法
            async handleTaskChange(taskId) {
                if (!this.currentBatchId) {
                    console.error('当前批次ID不存在');
                    return;
                }

                const selectedTask = this.taskList.find(task => task.taskId === taskId);
                if (!selectedTask) return;

                try {
                    if (this.type === 1) {
                        // 水产养殖数据
                     
                        const response = await selectFishWaterQualityByBatchIdAndDateRange(
                            this.currentBatchId,
                            selectedTask.actualStart,
                            selectedTask.actualFinish
                        );
                        
                       
                        
                        // 检查响应数据结构
                        if (response && response.data && response.data.rows) {
                            
                            const averages = this.calculateFishEnvironmentAverages(response.data.rows);
                            
                            
                            this.environmentData = {
                                ...this.environmentData,
                                waterTemperature: averages.waterTemperature,
                                waterPh: averages.waterPh,
                                dissolvedOxygen: averages.waterOxygenContent,
                                ammoniaNitrogen: averages.waterAmmoniaNitrogen,
                                nitriteNitrogen: averages.waterNitriteContent
                            };
                        } else if (response && Array.isArray(response)) {
                            // 如果响应直接是数组
                          
                            const averages = this.calculateFishEnvironmentAverages(response);
                           
                            
                            this.environmentData = {
                                ...this.environmentData,
                                waterTemperature: averages.waterTemperature,
                                waterPh: averages.waterPh,
                                dissolvedOxygen: averages.waterOxygenContent,
                                ammoniaNitrogen: averages.waterAmmoniaNitrogen,
                                nitriteNitrogen: averages.waterNitriteContent
                            };
                        } else {

                            if (response) {
                              
                            }
                        }
                     
                    } else {
                        // 蔬菜环境数据
                        const response = await getSoilSensorValuesByBatchIdAndDateRange(
                            this.currentBatchId,
                            selectedTask.actualStart,
                            selectedTask.actualFinish
                        );

                        if (response.rows && response.rows.length > 0) {
                            // 计算蔬菜环境数据平均值
                            const averages = this.calculatePlantEnvironmentAverages(response.rows);
                            this.environmentData = {
                                ...this.environmentData, // 保留其他数据
                                temperature: averages.temperature,
                                humidity: averages.humidity,
                                lightLux: averages.lightLux,
                                soilPh: averages.soilPh,
                                soilTemperature: averages.soilTemperature,
                                soilMoisture: averages.soilMoisture,
                                soilConductivity: averages.soilConductivity
                            };
                        }
                    }
                } catch (error) {
                    console.error('获取环境数据失败:', error);
                    console.error('错误详情:', {
                        message: error.message,
                        stack: error.stack
                    });
                    this.$message.error('获取环境数据失败');
                }
            },

            // 计算水产环境数据平均值
            calculateFishEnvironmentAverages(data) {
              
                if (!Array.isArray(data) || data.length === 0) {
                   
                    return {
                        waterTemperature: '0',
                        waterPh: '0',
                        waterOxygenContent: '0',
                        waterAmmoniaNitrogen: '0',
                        waterNitriteContent: '0'
                    };
                }

                try {
                    const sum = data.reduce((acc, item) => {
                       
                        return {
                            waterTemperature: acc.waterTemperature + parseFloat(item.waterTemperature || 0),
                            waterPh: acc.waterPh + parseFloat(item.waterPhValue || 0),
                            waterOxygenContent: acc.waterOxygenContent + parseFloat(item.waterOxygenContent || 0),
                            waterAmmoniaNitrogen: acc.waterAmmoniaNitrogen + parseFloat(item.waterAmmoniaNitrogenContent || 0),
                            waterNitriteContent: acc.waterNitriteContent + parseFloat(item.waterNitriteContent || 0)
                        };
                    }, {
                        waterTemperature: 0,
                        waterPh: 0,
                        waterOxygenContent: 0,
                        waterAmmoniaNitrogen: 0,
                        waterNitriteContent: 0
                    });

                    const count = data.length;
                    const averages = {
                        waterTemperature: (sum.waterTemperature / count).toFixed(1),
                        waterPh: (sum.waterPh / count).toFixed(2),
                        waterOxygenContent: (sum.waterOxygenContent / count).toFixed(2),
                        waterAmmoniaNitrogen: (sum.waterAmmoniaNitrogen / count).toFixed(3),
                        waterNitriteContent: (sum.waterNitriteContent / count).toFixed(2)
                    };

                  
                    return averages;
                } catch (error) {
                    console.error('计算平均值时出错:', error);
                    return {
                        waterTemperature: '0',
                        waterPh: '0',
                        waterOxygenContent: '0',
                        waterAmmoniaNitrogen: '0',
                        waterNitriteContent: '0'
                    };
                }
            },

            // 计算蔬菜环境数据平均值
            calculatePlantEnvironmentAverages(data) {
                if (!Array.isArray(data) || data.length === 0) {
                    return {
                        temperature: 0,
                        humidity: 0,
                        lightLux: 0,
                        soilPh: 0,
                        soilTemperature: 0,
                        soilMoisture: 0,
                        soilConductivity: 0
                    };
                }

                const sum = data.reduce((acc, item) => ({
                    temperature: acc.temperature + parseFloat(item.temperature || 0),
                    humidity: acc.humidity + parseFloat(item.humidity || 0),
                    lightLux: acc.lightLux + parseFloat(item.lightLux || 0),
                    soilPh: acc.soilPh + parseFloat(item.soilPh || 0),
                    soilTemperature: acc.soilTemperature + parseFloat(item.soilTemperature || 0),
                    soilMoisture: acc.soilMoisture + parseFloat(item.soilMoisture || 0),
                    soilConductivity: acc.soilConductivity + parseFloat(item.soilConductivity || 0)
                }), {
                    temperature: 0,
                    humidity: 0,
                    lightLux: 0,
                    soilPh: 0,
                    soilTemperature: 0,
                    soilMoisture: 0,
                    soilConductivity: 0
                });

                const count = data.length;
                return {
                    temperature: (sum.temperature / count).toFixed(1),
                    humidity: (sum.humidity / count).toFixed(1),
                    lightLux: (sum.lightLux / count).toFixed(0),
                    soilPh: (sum.soilPh / count).toFixed(1),
                    soilTemperature: (sum.soilTemperature / count).toFixed(1),
                    soilMoisture: (sum.soilMoisture / count).toFixed(1),
                    soilConductivity: (sum.soilConductivity / count).toFixed(0)
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
            async handleShowDetails(task) {
                // 直接使用预加载的数据
                this.currentTask = this.taskList.find(t => t.taskId === task.taskId);
                this.mockResources = this.type === 1 ? task.baitDetails : task.materialDetails;
                this.mockMedicineData = this.type === 1 ? task.medicineDetails : [];
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
            // 检查 URL 参数的方法
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
          
            getImageUrl(path) {

                if (path.startsWith('http://') || path.startsWith('https://')) {
                    return path;
                }
            
                return process.env.VUE_APP_BASE_API + path;
            },
        },
        computed: {
          
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

.monitor-section {
    .monitor-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-bottom: 30px;

        .monitor-item {
            position: relative;
            background: #fff;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            transition: all 0.3s ease;

            &::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                opacity: 0.1;
                transition: opacity 0.3s ease;
            }

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);

                &::before {
                    opacity: 0.15;
                }

                .item-bg .bg-icon {
                    opacity: 0.2;
                }
            }

            .item-bg {
                position: absolute;
                right: -20px;
                bottom: -20px;
                width: 120px;
                height: 120px;
                opacity: 0.1;

                .bg-icon {
                    width: 100%;
                    height: 100%;
                    opacity: 0.15;
                    transition: opacity 0.3s ease;
                }
            }

            .item-label {
                position: relative;
                color: #909399;
                font-size: 14px;
                margin-bottom: 8px;
            }

            .item-value {
                position: relative;
                display: flex;
                align-items: baseline;
                gap: 4px;

                .number {
                    font-size: 24px;
                    font-weight: 600;
                }

                .unit {
                    font-size: 14px;
                    color: #909399;
                }
            }

            &.temperature {
                background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 107, 107, 0.05) 100%);
                .item-bg {
                    color: #ff6b6b;
                }
                .item-value {
                    .number {
                        color: #ff6b6b;
                    }
                }
            }

            &.ph {
                background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.05) 100%);
                .item-bg {
                    color: #409eff;
                }
                .item-value {
                    .number {
                        color: #409eff;
                    }
                }
            }

            &.oxygen {
                background: linear-gradient(135deg, rgba(103, 194, 58, 0.1) 0%, rgba(103, 194, 58, 0.05) 100%);
                .item-bg {
                    color: #67c23a;
                }
                .item-value {
                    .number {
                        color: #67c23a;
                    }
                }
            }

            &.ammonia {
                background: linear-gradient(135deg, rgba(230, 162, 60, 0.1) 0%, rgba(230, 162, 60, 0.05) 100%);
                .item-bg {
                    color: #e6a23c;
                }
                .item-value {
                    .number {
                        color: #e6a23c;
                    }
                }
            }

            &.nitrite {
                background: linear-gradient(135deg, rgba(144, 147, 153, 0.1) 0%, rgba(144, 147, 153, 0.05) 100%);
                .item-bg {
                    color: #909399;
                }
                .item-value {
                    .number {
                        color: #909399;
                    }
                }
            }

            .item-label {
                color: #606266;
                font-size: 14px;
                margin-bottom: 10px;
            }

            .item-value {
                display: flex;
                align-items: baseline;
                gap: 4px;

                .number {
                    font-size: 24px;
                    font-weight: 500;
                }

                .unit {
                    font-size: 12px;
                    color: #909399;
                }
            }
        }
    }
}

// 响应式布局
@media screen and (max-width: 768px) {
    .monitor-section {
        .monitor-grid {
            grid-template-columns: repeat(1, 1fr);
            gap: 15px;
        }
    }
}

@media screen and (min-width: 769px) and (max-width: 1200px) {
    .monitor-section {
        .monitor-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
}

.soil-section {
    margin-top: 30px;

    .soil-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;

        .soil-item {
            position: relative;
            background: #fff;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            transition: all 0.3s ease;

            &::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                opacity: 0.1;
                transition: opacity 0.3s ease;
            }

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);

                &::before {
                    opacity: 0.15;
                }

                .item-bg .bg-icon {
                    opacity: 0.2;
                }
            }

            .item-bg {
                position: absolute;
                right: -20px;
                bottom: -20px;
                width: 120px;
                height: 120px;
                opacity: 0.1;

                .bg-icon {
                    width: 100%;
                    height: 100%;
                    opacity: 0.15;
                    transition: opacity 0.3s ease;
                }
            }

            .item-label {
                position: relative;
                color: #909399;
                font-size: 14px;
                margin-bottom: 8px;
            }

            .item-value {
                position: relative;
                display: flex;
                align-items: baseline;
                gap: 4px;

                .number {
                    font-size: 24px;
                    font-weight: 600;
                }

                .unit {
                    font-size: 14px;
                    color: #909399;
                }
            }

            // PH值卡片样式
            &.ph {
                background: linear-gradient(135deg, #f0f7ff 0%, #fff 100%);
                
                &::before {
                    background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
                }

                .item-value .number {
                    color: #9254de;
                }

                .bg-icon {
                    fill: none;
                    stroke: #9254de;
                    color: #9254de;
                }
            }

            // 土壤温度卡片样式
            &.temperature {
                background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
                
                &::before {
                    background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
                }

                .item-value .number {
                    color: #f56c6c;
                }

                .bg-icon {
                    fill: #f56c6c;
                }
            }

            // 土壤湿度卡片样式
            &.humidity {
                background: linear-gradient(135deg, #e6f7ff 0%, #fff 100%);
                
                &::before {
                    background: linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%);
                }

                .item-value .number {
                    color: #1890ff;
                }

                .bg-icon {
                    fill: #1890ff;
                }
            }

            // 电导率卡片样式
            &.conductivity {
                background: linear-gradient(135deg, #f6ffed 0%, #fff 100%);
                
                &::before {
                    background: linear-gradient(135deg, #52c41a 0%, #85d675 100%);
                }

                .item-value .number {
                    color: #52c41a;
                }

                .bg-icon {
                    fill: #52c41a;
                    stroke: #52c41a;
                }
            }
        }
    }
}

// 响应式布局
@media screen and (max-width: 768px) {
    .soil-section {
        .soil-grid {
            grid-template-columns: repeat(1, 1fr);
            gap: 15px;
        }
    }
}

@media screen and (min-width: 769px) and (max-width: 1200px) {
    .soil-section {
        .soil-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
}

.loading-circle {
    .blockchain-image {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 70%;  // 稍微调大一点以展示区块链图片的细节
        height: auto;
        z-index: 2;
        filter: drop-shadow(0 0 8px rgba(66, 185, 131, 0.2)); // 添加发光效果
        animation: pulse 2s infinite; // 添加脉冲动画
    }
}

@keyframes pulse {
    0% {
        opacity: 0.8;
        transform: translate(-50%, -50%) scale(0.95);
    }
    50% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.05);
    }
    100% {
        opacity: 0.8;
        transform: translate(-50%, -50%) scale(0.95);
    }
}

.medicine-section {
    margin-top: 20px;
    
    .section-title {
        font-weight: bold;
        margin-bottom: 10px;
    }
    
    .medicine-list {
        margin-top: 10px;
    }
}

// 添加鱼类特定的样式
.info-card {
    &.fish-card {
        background: linear-gradient(to bottom right, #ffffff, #f8fcff);
        border: 1px solid #e6f3ff;
        
        .card-header {
            background: linear-gradient(to right, #ecf5ff, #ffffff);
            border-bottom: 1px solid #e6f3ff;
            
            i {
                color: #409EFF;
                
                &.el-icon-house {
                    color: #67C23A; // 鱼棚图标使用绿色
                }
                
                &.el-icon-menu {
                    color: #409EFF; // 养殖信息图标使用蓝色
                }
                
                &.el-icon-goods {
                    color: #E6A23C; // 食品信息图标使用橙色
                }
            }
        }

        .card-content {
            .info-item {
                position: relative;
                padding: 12px;
                margin-bottom: 15px;
                background: rgba(236, 245, 255, 0.3);
                border-radius: 8px;
                transition: all 0.3s ease;

                &:hover {
                    background: rgba(236, 245, 255, 0.5);
                }

                .label {
                    color: #606266;
                    font-size: 13px;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 5px;

                    &::before {
                        content: '';
                        display: inline-block;
                        width: 4px;
                        height: 4px;
                        background: #409EFF;
                        border-radius: 50%;
                    }
                }

                .value {
                    color: #303133;
                    font-size: 14px;
                    font-weight: 500;

                    &.address {
                        font-family: monospace;
                        color: #409EFF;
                        font-size: 13px;
                        word-break: break-all;
                        padding: 8px;
                        background: rgba(255, 255, 255, 0.8);
                        border-radius: 4px;
                        border: 1px solid #e6f3ff;
                        
                        &:hover {
                            background: #ffffff;
                        }
                    }
                }
            }
        }
    }
}

// 养殖环节时间线样式
.timeline-card.fish-timeline {
    .horizontal-timeline {
        &::before {
            background: linear-gradient(to right, #409EFF, #67C23A);
        }
    }

    ::v-deep .timeline-item {
        .timeline-content {
            background: linear-gradient(to bottom right, #ffffff, #f8fcff);
            border: 1px solid #e6f3ff;
            
            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
            }

            .timeline-header {
                background: linear-gradient(to right, #ecf5ff, #ffffff);
                border-bottom: 1px solid #e6f3ff;
                padding: 12px 15px;
                
                .timeline-title {
                    color: #409EFF;
                    font-weight: 500;
                }
            }

            .timeline-body {
                padding: 12px 15px;
                
                .timeline-info {
                    margin-bottom: 8px;
                    color: #606266;
                    
                    &:last-child {
                        margin-bottom: 0;
                    }
                }
            }
        }

        .timeline-dot {
            background: #409EFF;
            border: 2px solid #ffffff;
            box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
        }
    }
}

// 水质监测卡片样式优化
.monitor-section {
    .monitor-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        padding: 20px;

        .monitor-item {
            background: linear-gradient(to bottom right, #ffffff, #f8fcff);
            border: 1px solid #e6f3ff;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);

                .item-bg {
                    transform: scale(1.05);
                }
            }

            .item-bg {
                position: absolute;
                right: -20px;
                bottom: -20px;
                width: 100px;
                height: 100px;
                opacity: 0.1;
                transition: all 0.3s ease;

                .bg-icon {
                    width: 100%;
                    height: 100%;
                    fill: currentColor;
                }
            }

            .item-label {
                font-size: 14px;
                color: #606266;
                margin-bottom: 10px;
                position: relative;
                z-index: 1;
            }

            .item-value {
                position: relative;
                z-index: 1;
                display: flex;
                align-items: baseline;
                gap: 4px;

                .number {
                    font-size: 24px;
                    font-weight: 600;
                    color: #409EFF;
                }

                .unit {
                    font-size: 12px;
                    color: #909399;
                }
            }

            // 为不同类型的监测项添加特定颜色
            &.temperature {
                color: #E6A23C;
                .number { color: #E6A23C; }
            }

            &.ph {
                color: #409EFF;
                .number { color: #409EFF; }
            }

            &.oxygen {
                color: #67C23A;
                .number { color: #67C23A; }
            }

            &.ammonia {
                color: #F56C6C;
                .number { color: #F56C6C; }
            }

            &.nitrite {
                color: #909399;
                .number { color: #909399; }
            }
        }
    }
}

// 任务详情对话框样式
.task-detail {
    .detail-item {
        margin-bottom: 20px;
        
        .label {
            color: #606266;
            font-size: 14px;
            margin-bottom: 8px;
        }
    }

    .resource-section {
        margin-top: 20px;
        
        .section-title {
            font-size: 14px;
            color: #606266;
            margin-bottom: 12px;
        }

        .resource-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            .resource-tag {
                margin: 0;
            }
        }
    }

    .images-section {
        margin-top: 20px;

        .section-title {
            font-size: 14px;
            color: #606266;
            margin-bottom: 12px;
        }

        .image-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 10px;

            .task-image {
                width: 100%;
                height: 120px;
                border-radius: 4px;
                object-fit: cover;
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                    transform: scale(1.05);
                }
            }
        }
    }
}

// 响应式调整
@media screen and (max-width: 768px) {
    .monitor-section {
        .monitor-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            padding: 10px;

            .monitor-item {
                padding: 15px;

                .item-value {
                    .number {
                        font-size: 20px;
                    }
                }
            }
        }
    }

    .task-detail {
        .images-section {
            .image-list {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    }
}

// 添加全局样式
:global(body.el-popup-parent--hidden) {
    padding-right: 17px; // 滚动条的宽度
}
</style>

