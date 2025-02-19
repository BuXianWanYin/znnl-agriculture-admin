<template>
    <div class="container">
        <div class="index">
            <el-row :gutter="10">
                <el-col :span="8">
                    <data-panel title="基地概况">
                        <div class="main main-large">
                            <!-- 蔬菜部分 -->
                            <div class="section-container">
                                <div class="section-title">蔬菜基地</div>
                                <el-row :gutter="10" class="section-content">
                                    <el-col :span="8" class="h100 flex aic">
                                        <data-box 
                                            icon="el-icon-s-data"
                                            backgroundColor="#5470c6" 
                                            text="基地面积(亩)" 
                                            :value="baseInfo.areaCount"
                                            class="flex1">
                                        </data-box>
                                    </el-col>
                                    <el-col :span="8" class="h100 flex aic">
                                        <data-box 
                                            icon="el-icon-s-claim"
                                            backgroundColor="#73c0de" 
                                            text="种植批次(批)" 
                                            :value="baseInfo.batchCount"
                                            class="flex1">
                                        </data-box>
                                    </el-col>
                                    <el-col :span="8" class="h100 flex aic">
                                        <data-box 
                                            icon="el-icon-s-finance"
                                            backgroundColor="#91cc75" 
                                            text="种植种类(种)" 
                                            :value="baseInfo.germplasmCount"
                                            class="flex1">
                                        </data-box>
                                    </el-col>
                                    <el-col :span="8" class="h100 flex aic">
                                        <data-box 
                                            icon="el-icon-s-shop"
                                            backgroundColor="#3ba272" 
                                            text="大棚数量(个)" 
                                            :value="baseInfo.pengCount"
                                            class="flex1">
                                        </data-box>
                                    </el-col>
                                </el-row>
                            </div>

                            <!-- 养殖部分 -->
                            <div class="section-container">
                                <div class="section-title">养殖基地</div>
                                <el-row :gutter="10" class="section-content">
                                    <el-col :span="8" class="h100 flex aic">
                                        <data-box 
                                            icon="el-icon-s-grid"
                                            backgroundColor="#fac858" 
                                            text="养殖池(个)" 
                                            :value="fishInfo.pondCount"
                                            class="flex1">
                                        </data-box>
                                    </el-col>
                                    <el-col :span="8" class="h100 flex aic">
                                        <data-box 
                                            icon="el-icon-s-finance"
                                            backgroundColor="#ee6666" 
                                            text="鱼类品种(种)" 
                                            :value="fishInfo.speciesCount"
                                            class="flex1">
                                        </data-box>
                                    </el-col>
                                    <el-col :span="8" class="h100 flex aic">
                                        <data-box 
                                            icon="el-icon-s-custom"
                                            backgroundColor="#73c0de" 
                                            text="存栏数量(尾)" 
                                            :value="fishInfo.fishCount"
                                            class="flex1">
                                        </data-box>
                                    </el-col>
                                </el-row>
                            </div>

                            <!-- 公共信息部分 -->
                            <div class="section-container">
                                <div class="section-title">公共信息</div>
                                <el-row :gutter="10" class="section-content">
                                    <el-col :span="12" class="h100 flex aic">
                                        <data-box 
                                            icon="el-icon-s-custom"
                                            backgroundColor="#ee6666" 
                                            text="人员总数(位)" 
                                            :value="baseInfo.employeeCount"
                                            class="flex1">
                                        </data-box>
                                    </el-col>
                                </el-row>
                            </div>
                        </div>
                    </data-panel>
                </el-col>
                <el-col :span="8">
                    <data-panel title="鱼菜统计" more="更多详情" link="Task">
                        <div class="main main-large">
                            <el-row class="h100" :gutter="10">
                                <!-- 图表部分 -->
                                <el-col :md="12" class="h100">
                                    <div class="chart-container">
                                        <!-- 图表区域 -->
                                        <div ref="combinedStatsChart" class="chart-area"></div>
                                        
                                    </div>
                                </el-col>
                                <!-- 右侧数据展示部分保持不变 -->
                                <el-col :md="12" class="h100">
                                    <el-row class="h100 flex fdc">
                                        <!-- 种植统计数据 -->
                                        <div class="stats-section">
                                            <div class="stats-title">种植任务</div>
                                            <el-row :gutter="10">
                                                <el-col :span="12" v-for="item in taskInfo" :key="item.name">
                                                    <data-box 
                                                        icon="el-icon-s-promotion"
                                                        :backgroundColor="item.color || '#409EFF'"
                                                        :text="item.name+'(条)'"
                                                        :value="item.value"
                                                        :isBorder="false"
                                                        :isIcon="false">
                                                    </data-box>
                                                </el-col>
                                            </el-row>
                                        </div>
                                        <!-- 养殖统计数据 -->
                                        <div class="stats-section">
                                            <div class="stats-title">养殖状态</div>
                                            <el-row :gutter="10">
                                                <el-col :span="12" v-for="item in fishStatsInfo" :key="item.name">
                                                    <data-box 
                                                        icon="el-icon-s-promotion"
                                                        :backgroundColor="item.color || '#67C23A'"
                                                        :text="item.name+'(尾)'"
                                                        :value="item.value"
                                                        :isBorder="false"
                                                        :isIcon="false">
                                                    </data-box>
                                                </el-col>
                                            </el-row>
                                        </div>
                                    </el-row>
                                </el-col>
                            </el-row>
                        </div>
                    </data-panel>
                </el-col>
                <el-col :span="8">
                    <data-panel title="溯源统计" more="更多溯源" link="RecordCount">
                        <div class="main main-large">
                            <div ref="indexDeviceMonitorChart" class="h100"></div>
                        </div>
                    </data-panel>
                </el-col>
            </el-row>
            <el-row :gutter="10" class="margin-top-10">
                <el-col :span="12">
                    <data-panel title="蔬菜大棚环境监测">
                        <div class="env-cards-wrapper vegetable-cards">
                            <el-row :gutter="20">
                                <el-col :span="6" v-for="(item, index) in latestEnvItems" :key="index">
                                    <div class="env-card" :class="getStatusColor(item)">
                                        <div class="env-title">{{item.label}}</div>
                                        <div class="env-value">{{item.value}}</div>
                                        <div class="env-unit">{{item.unit}}</div>
                                    </div>
                                </el-col>
                            </el-row>
                            <div class="env-time">更新时间：{{latestUpdateTime}}</div>
                        </div>
                        <el-table :data="statusData" height="400" style="margin-top: 20px;">
                            <el-table-column prop="id" label="ID"> </el-table-column>
                            <el-table-column prop="airquality" label="空气质量"> </el-table-column>
                            <el-table-column prop="temperature" label="温度"> </el-table-column>
                            <el-table-column prop="humidity" label="湿度"> </el-table-column>
                            <el-table-column prop="pressure" label="气压"> </el-table-column>
                            <el-table-column prop="dateTime" label="记录日期"> </el-table-column>
                        </el-table>
                        <div class="page-block">
                            <el-pagination 
                                @size-change="sSizeChange" 
                                @current-change="sCurrentChange"
                                :current-page="scurrentPage" 
                                :page-size="20"
                                :page-sizes="[20, 40, 60, 80]"
                                layout="total, sizes, prev, pager, next, jumper" 
                                :total="stotal">
                            </el-pagination>
                        </div>
                    </data-panel>
                </el-col>

                <el-col :span="12">
                    <data-panel title="养殖池环境监测">
                        <div class="env-cards-wrapper fish-cards">
                            <el-row :gutter="20">
                                <el-col :span="4.8" v-for="(item, index) in fishEnvItems" :key="index">
                                    <div class="env-card" :class="getStatusColor(item)">
                                        <div class="env-title">{{item.label}}</div>
                                        <div class="env-value">{{item.value}}</div>
                                        <div class="env-unit">{{item.unit}}</div>
                                    </div>
                                </el-col>
                            </el-row>
                            <div class="env-time">更新时间：{{fishLatestUpdateTime}}</div>
                        </div>
                        <el-table :data="fishStatusData" height="400">
                            <el-table-column prop="id" label="ID"> </el-table-column>
                            <el-table-column prop="waterQuality" label="水质"></el-table-column>
                            <el-table-column prop="temperature" label="水温"></el-table-column>
                            <el-table-column prop="oxygen" label="含氧量"></el-table-column>
                            <el-table-column prop="ph" label="pH值"></el-table-column>        
                            <el-table-column prop="nitrite" label="亚硝酸盐含量"></el-table-column>
                            <el-table-column prop="dateTime" label="记录日期"> </el-table-column>
                        </el-table>
                        <div class="page-block">
                            <el-pagination 
                                @size-change="fishSizeChange" 
                                @current-change="fishCurrentChange"
                                :current-page="fishCurrentPage" 
                                :page-size="fishPageSize"
                                layout="jumper, prev, pager, next, total" 
                                :total="fishTotal">
                            </el-pagination>
                        </div>
                    </data-panel>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
    import {
        selectBaseInfo,
        selectDeviceInfo,
        selectDeviceJobInfo,
        selectRecordGroupByMonth,
        selectTaskInfo
    } from "@/api/agriculture/dataStatistics"
    import DataPanel from "./components/DataPanel";
    import DataBox from "./components/DataBox";
    import {
        lineChart,
        pieChart,
        barChart
    } from "./components/DataChart";
    import {
        listLand
    } from "@/api/agriculture/land";
    // import {listDevice} from "@/api/iot/device";
    import {
        getBaseinfoLimitOne
    } from "@/api/agriculture/baseinfo";

    export default {
        name: "",
        components: {
            DataPanel,
            DataBox,
        },
        data() {
            return {
                landList: [],
                // deviceList:[],
                baseUrl: process.env.VUE_APP_BASE_API,
                baseInfo: {
                    areaCount: 0,
                    germplasmCount: 0,
                    diCount: 0,
                    employeeCount: 0,
                    batchCount: 0,
                    pengCount: 0
                },
                deviceCountList: [],
                deviceTotal: 0,
                scurrentPage: 0,
                spSize: 20,
                stotal: 0,
                deviceJobInfo: [],
                traceInfo: {
                    date: [],
                    num: []
                },
                taskInfo: [
                    { name: '未分配', value: 0, color: '#909399' },
                    { name: '已分配', value: 0, color: '#E6A23C' },
                    { name: '进行中', value: 0, color: '#409EFF' },
                    { name: '已完成', value: 0, color: '#67C23A' }
                ],
                statusData: [],
                fishInfo: {
                    pondCount: 12,
                    speciesCount: 8,
                    fishCount: 25000
                },
                fishStatsInfo: [
                    { name: '在养', value: 145, color: '#409EFF' },
                    { name: '已出塘', value: 45, color: '#67C23A' },
                    { name: '生病', value: 3, color: '#E6A23C' },
                    { name: '死亡', value: 0, color: '#F56C6C' }
                ],
                latestEnvItems: [
                    { 
                        label: '空气质量', 
                        value: '2976.19', 
                        unit: 'ppm',
                        thresholds: {
                            good: { min: 0, max: 1000 },
                            warning: { min: 1000, max: 2000 },
                            // 超过2000为危险
                        }
                    },
                    { 
                        label: '温度', 
                        value: '27', 
                        unit: '℃',
                        thresholds: {
                            good: { min: 20, max: 30 },
                            warning: { min: 15, max: 35 },
                            // 低于15或超过35为危险
                        }
                    },
                    { 
                        label: '湿度', 
                        value: '35', 
                        unit: '%',
                        thresholds: {
                            good: { min: 40, max: 70 },
                            warning: { min: 30, max: 80 },
                            // 低于30或超过80为危险
                        }
                    },
                    { 
                        label: '气压', 
                        value: '100.24', 
                        unit: 'kPa',
                        thresholds: {
                            good: { min: 98, max: 102 },
                            warning: { min: 95, max: 105 },
                            // 低于95或超过105为危险
                        }
                    }
                ],
                activeTab: 'vegetables',
                fishEnvItems: [
                    { 
                        label: '水质', 
                        value: '优', 
                        unit: '',
                        thresholds: {
                            good: ['优'],
                            warning: ['良'],
                            // 其他为危险
                        }
                    },
                    { 
                        label: '水温', 
                        value: '25', 
                        unit: '℃',
                        thresholds: {
                            good: { min: 22, max: 28 },
                            warning: { min: 18, max: 32 },
                            // 低于18或超过32为危险
                        }
                    },
                    { 
                        label: '含氧量', 
                        value: '7.5', 
                        unit: 'mg/L',
                        thresholds: {
                            good: { min: 6, max: 9 },
                            warning: { min: 4, max: 11 },
                            // 低于4或超过11为危险
                        }
                    },
                    { 
                        label: 'pH值', 
                        value: '7.2', 
                        unit: '',
                        thresholds: {
                            good: { min: 6.5, max: 8.5 },
                            warning: { min: 6, max: 9 },
                            // 低于6或超过9为危险
                        }
                    },
                    { 
                        label: '亚硝酸盐含量', 
                        value: '0.05', 
                        unit: 'mg/L',
                        thresholds: {
                            good: { min: 0, max: 0.1 },
                            warning: { min: 0.1, max: 0.3 },
                            // 超过0.3为危险
                        }
                    }
                ],
                fishStatusData: [],
                fishCurrentPage: 1,
                fishPageSize: 10,
                fishTotal: 0
            };
        },
        computed: {
            latestUpdateTime() {
                return this.statusData && this.statusData.length > 0 
                    ? this.statusData[0].dateTime 
                    : '--'
            },
            fishLatestUpdateTime() {
                return this.fishStatusData && this.fishStatusData.length > 0 
                    ? this.fishStatusData[0].dateTime 
                    : '--'
            }
        },
        async mounted() {
            // await this.getBaseInfo();
            await this.getDate();
            
            // 使用新的组合图表初始化方法
            this.$nextTick(() => {
                this.initCombinedChart();
            });
            
            // 监听数据变化
            this.$watch(
                () => [...this.taskInfo, ...this.fishStatsInfo],
                () => {
                    this.$nextTick(() => {
                        this.initCombinedChart();
                    });
                },
                { deep: true }
            );
            this.houseCheck();
        },
        methods: {
            // 处理每页显示数量变化
            sSizeChange(n) {
                this.spSize = n;
                this.houseCheck();
            },
            
            // 处理页码变化
            sCurrentChange(n) {
                this.scurrentPage = n;
                this.houseCheck();
            },
            
            // 获取蔬菜大棚环境数据
            houseCheck() {
                this.$http.post("/dev-api/iaPasture/selectSensorValuePage", {
                    currentPage: this.scurrentPage,
                    pageSize: this.spSize,
                    orderBy: 'dateTime',
                    orderType: 'desc'
                }).then(res => {
                    if (res.data && res.data.data) {
                        this.statusData = res.data.data.records.sort((a, b) => {
                            return new Date(b.dateTime) - new Date(a.dateTime);
                        });
                        this.stotal = res.data.data.total;
                        
                        if (this.statusData && this.statusData.length > 0) {
                            const latest = this.statusData[0];
                            this.latestEnvItems = [
                                { 
                                    label: '空气质量', 
                                    value: latest.airquality, 
                                    unit: 'ppm',
                                    thresholds: {
                                        good: { min: 0, max: 1000 },
                                        warning: { min: 1000, max: 2000 }
                                    }
                                },
                                { 
                                    label: '温度', 
                                    value: latest.temperature, 
                                    unit: '℃',
                                    thresholds: {
                                        good: { min: 20, max: 30 },
                                        warning: { min: 15, max: 35 }
                                    }
                                },
                                { 
                                    label: '湿度', 
                                    value: latest.humidity, 
                                    unit: '%',
                                    thresholds: {
                                        good: { min: 40, max: 70 },
                                        warning: { min: 30, max: 80 }
                                    }
                                },
                                { 
                                    label: '气压', 
                                    value: latest.pressure, 
                                    unit: 'kPa',
                                    thresholds: {
                                        good: { min: 98, max: 102 },
                                        warning: { min: 95, max: 105 }
                                    }
                                }
                            ];
                        }
                    }
                }).catch(error => {
                    console.error('获取蔬菜大棚数据失败:', error);
                });
            },
            /** 初始化map */

            async getBaseInfo() {
                const {
                    data
                } = await getBaseinfoLimitOne();
                this.$zb = data.baseCoordinate.split(',');
            },

            async getLandList() {
                const {
                    rows
                } = await listLand();
                this.landList = rows;
            },
            // addFeatures() {
            //     this.landList.forEach(item => {
            //         let {
            //             landPath,
            //             fillColor,
            //             fillOpacity,
            //             strokeColor,
            //             strokeOpacity,
            //             strokeWeight,
            //             landName
            //         } = item;
            //         let path = landPath && landPath.split('|').map(item => item.split(','))
            //         let centerPoint = this.getAreaCenter(path);
            //         if (path) {
            //             this.map.add(new this.AMap.Polygon({
            //                 path,
            //                 fillColor,
            //                 fillOpacity,
            //                 strokeColor,
            //                 strokeOpacity,
            //                 strokeWeight
            //             }));
            //             this.map.add(new this.AMap.Text({
            //                 position: centerPoint,
            //                 anchor: 'center',
            //                 text: landName,
            //                 style: {
            //                     'background': 'none',
            //                     'border': 'none',
            //                     'color': '#fff'
            //                 }
            //             }))
            //         }
            //     });
            // },
            getAreaCenter(points) {
                var total = points.length;
                var X = 0,
                    Y = 0,
                    Z = 0;
                points.forEach(lnglat => {
                    var lng = (lnglat[0] * Math.PI) / 180;
                    var lat = (lnglat[1] * Math.PI) / 180;
                    var x, y, z;
                    x = Math.cos(lat) * Math.cos(lng);
                    y = Math.cos(lat) * Math.sin(lng);
                    z = Math.sin(lat);
                    X += x;
                    Y += y;
                    Z += z;
                });
                X = X / total;
                Y = Y / total;
                Z = Z / total;

                var Lng = Math.atan2(Y, X);
                var Hyp = Math.sqrt(X * X + Y * Y);
                var Lat = Math.atan2(Z, Hyp);
                return [
                    parseFloat((Lng * 180) / Math.PI),
                    parseFloat((Lat * 180) / Math.PI),
                ];
            },
            /** 获取首页统计数据 */
            async getDate() {
                //基地信息
                const res = await selectBaseInfo()
                this.baseInfo = res.rows[0]

                const res4 = await selectRecordGroupByMonth()
                res4.rows.forEach(item => {
                    this.traceInfo.date.push(item.date);
                    this.traceInfo.num.push(item.num);
                });

                const res5 = await selectTaskInfo()
                //未分配
                let wfp = res5.rows.find(item => item.status == 0) ? res5.rows.find(item => item.status == 0).num : 0;
                //已分配
                let yfp = res5.rows.find(item => item.status == 1) ? res5.rows.find(item => item.status == 1).num : 0;
                //进行中
                let jxz = res5.rows.find(item => item.status == 2) ? res5.rows.find(item => item.status == 2).num : 0;
                //已完成
                let ywc = res5.rows.find(item => item.status == 3) ? res5.rows.find(item => item.status == 3).num : 0;
                
                //任务进度
                this.$taskTotal = (wfp + yfp + ywc + jxz) == 0 ? 0 : (ywc * 100 / (wfp + yfp + ywc + jxz)).toFixed(2);
                
                // 更新任务信息数组
                this.taskInfo = [
                    { name: '未分配', value: wfp, color: '#909399' },
                    { name: '已分配', value: yfp, color: '#E6A23C' },
                    { name: '进行中', value: jxz, color: '#409EFF' },
                    { name: '已完成', value: ywc, color: '#67C23A' }
                ];

                // 初始化溯源图表
                lineChart(this.$refs.indexDeviceMonitorChart, {
                    text: `溯源次数`,
                    fontSize: 14,
                    color: '#bbb'
                }, '溯源次数', {
                    name: '溯源次数'
                }, this.traceInfo.date, this.traceInfo.num);
            },
            // 处理养殖池数据表格每页显示数量变化
            fishSizeChange(n) {
                this.fishPageSize = n;  // 更新每页显示数量
                this.getFishEnvironmentData();  // 重新获取养殖池环境数据
            },
            
            // 处理养殖池数据表格页码变化
            fishCurrentChange(n) {
                this.fishCurrentPage = n;  // 更新当前页码
                this.getFishEnvironmentData();  // 重新获取养殖池环境数据
            },
            
            // 获取养殖池环境数据
            getFishEnvironmentData() {
                // 发送请求获取养殖池数据   假数据 等待真数据
                this.$http.post("/dev-api/fishPond/sensorData", {
                    currentPage: this.fishCurrentPage, // 当前页码
                    pageSize: this.fishPageSize, // 每页数量
                    orderBy: 'dateTime', // 按日期排序
                    orderType: 'desc' // 降序排列（最新的在前）
                }).then(res => {
                    console.log('养殖池数据响应:', res); // 调试日志
                    if (res.data) {
                        // 更新表格数据
                        this.fishStatusData = res.data.records.sort((a, b) => {
                            return new Date(b.dateTime) - new Date(a.dateTime); // 按时间降序排序
                        });
                        this.fishTotal = res.data.total; // 更新总记录数
                        
                        // 如果有数据，更新环境监测卡片
                        if (this.fishStatusData && this.fishStatusData.length > 0) {
                            const latest = this.fishStatusData[0]; // 获取最新一条记录
                            // 更新养殖池环境监测卡片数据
                            this.fishEnvItems = [
                                { 
                                    label: '水质', 
                                    value: latest.waterQuality, 
                                    unit: '',
                                    thresholds: {
                                        good: ['优'], // 最佳水质
                                        warning: ['良'] // 可接受水质
                                    }
                                },
                                { 
                                    label: '水温', 
                                    value: latest.temperature, 
                                    unit: '℃',
                                    thresholds: {
                                        good: { min: 22, max: 28 }, // 适宜水温范围
                                        warning: { min: 18, max: 32 } // 可接受水温范围
                                    }
                                },
                                { 
                                    label: '含氧量', 
                                    value: latest.oxygen, 
                                    unit: 'mg/L',
                                    thresholds: {
                                        good: { min: 6, max: 9 }, // 适宜含氧量范围
                                        warning: { min: 4, max: 11 } // 可接受含氧量范围
                                    }
                                },
                                { 
                                    label: 'pH值', 
                                    value: latest.ph, 
                                    unit: '',
                                    thresholds: {
                                        good: { min: 6.5, max: 8.5 }, // 适宜pH值范围
                                        warning: { min: 6, max: 9 } // 可接受pH值范围
                                    }
                                },
                                { 
                                    label: '亚硝酸盐含量', 
                                    value: latest.nitrite, 
                                    unit: 'mg/L',
                                    thresholds: {
                                        good: { min: 0, max: 0.1 }, // 安全亚硝酸盐范围
                                        warning: { min: 0.1, max: 0.3 } // 警戒亚硝酸盐范围
                                    }
                                }
                            ];
                        }
                    }
                }).catch(error => {
                    console.error('获取养殖池数据失败:', error); // 错误日志
                });
            },
            // 根据监测值确定状态颜色
            getStatusColor(item) {
                console.log('获取状态颜色，项目:', item.label, '值:', item.value); // 调试日志
                
                // 水质特殊处理（因为是文字值）
                if (item.label === '水质') {
                    return item.thresholds.good.includes(item.value) ? 'success' : // 如果是优，显示绿色
                           item.thresholds.warning.includes(item.value) ? 'warning' : 'danger'; // 如果是良，显示黄色，否则红色
                }

                // 其他数值类型的处理
                const value = parseFloat(item.value);
                console.log('解析后的数值:', value); // 调试日志
                
                // 判断数值是否在不同范围内
                if (item.thresholds.good.min <= value && value <= item.thresholds.good.max) {
                    return 'success'; // 在最佳范围内，显示绿色
                } else if (item.thresholds.warning.min <= value && value <= item.thresholds.warning.max) {
                    return 'warning'; // 在警告范围内，显示黄色
                }
                return 'danger'; // 超出范围，显示红色
            },
            initCombinedChart() {
                const chartDom = this.$refs.combinedStatsChart;
                if (!chartDom) return;

                if (this.combinedChart) {
                    this.combinedChart.dispose();
                }

                this.combinedChart = this.$echarts.init(chartDom);
                
                // 更新颜色方案
                const colors = {
                    vegetables: ['#91CC75', '#73C0DE', '#5470C6', '#FAC858'], // 外圈：绿色系为主
                    fish: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE']  // 内圈：蓝色系为主
                };
                
                const option = {
                    tooltip: {
                        trigger: 'item',
                        formatter: function(params) {
                            // 根据系列名称添加不同的前缀
                            const title = params.seriesName === '种植任务' ? '种植任务' : '养殖状态';
                            // 使用 <br/> 进行换行，添加一些样式
                            return `<div style="font-weight: bold; margin-bottom: 3px;">${title}</div>` + 
                                   `${params.name}: ${params.value} (${params.percent}%)`;
                        },
                        show: false,  // 默认不显示tooltip
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',  // 设置背景色为半透明白色
                        borderColor: '#ccc',  // 设置边框颜色
                        borderWidth: 1,  // 设置边框宽度
                        padding: [5, 10],  // 设置内边距 [上下, 左右]
                        textStyle: {
                            color: '#333',  // 文字颜色
                            fontSize: 14    // 文字大小
                        }
                    },
                    legend: {
                        show: false  // 不显示图例
                    },
                    series: [
                        {
                            name: '种植任务',
                            type: 'pie',
                            radius: ['65%', '80%'],
                            center: ['50%', '50%'],
                            label: {
                                show: false
                            },
                            emphasis: {
                                label: {
                                    show: false
                                },
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            },
                            data: this.taskInfo.map((item, index) => ({
                                name: item.name,
                                value: item.value,
                                itemStyle: {
                                    color: colors.vegetables[index]
                                }
                            }))
                        },
                        {
                            name: '养殖状态',
                            type: 'pie',
                            radius: ['45%', '60%'],
                            center: ['50%', '50%'],
                            label: {
                                show: false
                            },
                            emphasis: {
                                label: {
                                    show: false
                                },
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            },
                            data: this.fishStatsInfo.map((item, index) => ({
                                name: item.name,
                                value: item.value,
                                itemStyle: {
                                    color: colors.fish[index]
                                }
                            }))
                        }
                    ]
                };
                
                // 添加鼠标事件监听
                this.combinedChart.on('mouseover', (params) => {
                    // 当鼠标悬停在某个扇形上时，显示该系列的tooltip
                    this.combinedChart.setOption({
                        tooltip: {
                            show: true
                        }
                    });
                });

                this.combinedChart.on('mouseout', (params) => {
                    // 当鼠标移出时，隐藏tooltip
                    this.combinedChart.setOption({
                        tooltip: {
                            show: false
                        }
                    });
                });
                
                this.combinedChart.setOption(option);

                window.addEventListener('resize', () => {
                    this.combinedChart && this.combinedChart.resize();
                });
            }
        },
    };
</script>

<style lang="scss" scoped>
    $margin: 10px;

    .container {
        background: #edeef0;
        overflow: hidden;
    }

    .index {
        height: calc(100vh - 84px - #{$margin} * 2);
        margin: $margin;
    }

    .main {
        box-sizing: border-box;
        height: calc((100vh - 84px - #{$margin} * 4 - 51px * 3) / 3);
        padding: 10px;
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);

        // 添加新的样式类用于更高的面板
        &.main-large {
            height: calc(((100vh - 84px - #{$margin} * 4 - 51px * 3) / 3) * 2 + #{$margin});
        }
    }

    .mapMain {
        box-sizing: border-box;
        height: calc(((100vh - 84px - #{$margin} * 4 - 51px * 3) / 3) * 2 + #{$margin} + 51px);
        padding: 5px;
        min-height: calc(180px * 2 + #{$margin} + 51px);
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
    }

    .data-panel {
        transition: all 0.3s ease;
        
        &:hover {
            transform: translateY(-5px);
        }
    }

    .el-table {
        background: transparent !important;
        margin-top: 15px;
        height: 440px !important;  // 调整表格高度
        
        ::v-deep .el-table__body-wrapper {
            overflow-y: auto;
            
            &::-webkit-scrollbar {
                width: 6px;
            }
            
            &::-webkit-scrollbar-thumb {
                background: #ddd;
                border-radius: 3px;
            }
            
            &::-webkit-scrollbar-track {
                background: #f5f5f5;
            }
        }
        
        ::v-deep .el-table__header-wrapper {
            th {
                background: rgba(64, 158, 255, 0.1);
                color: #606266;
                font-weight: 600;
            }
        }
        
        ::v-deep .el-table__body {
            td {
                padding: 8px 0;
            }
            
            tr:hover > td {
                background: rgba(64, 158, 255, 0.05);
            }
        }
    }

    .env-cards-wrapper {
        margin-bottom: 20px;
        padding: 15px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        width: 100%;
        
        // 蔬菜大棚卡片样式
        &.vegetable-cards {
            .el-row {
                margin-bottom: 10px;
                width: 100%;
                display: flex;
                justify-content: space-between;
            }
            
            .el-col {
                padding: 0 10px;
            }
        }
        
        // 养殖池卡片样式
        &.fish-cards {
            .el-row {
                margin: 0 -10px 10px -10px;
                width: calc(100% + 20px);
                display: flex;
                justify-content: flex-start;
            }
            
            .el-col {
                padding: 0 10px;
                flex: 1;
                max-width: 20%;
            }
        }
        
        .env-card {
            height: 100px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: rgba(255, 255, 255, 0.7);
            padding: 15px 10px;
            border-radius: 10px;
            transition: all 0.3s ease;
            border-left: 4px solid transparent;
            margin-bottom: 0;
            width: 100%;
            
            &:hover {
                transform: translateY(-3px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            &.success {
                border-left-color: #67C23A;
                .env-value { color: #67C23A; }
            }
            
            &.warning {
                border-left-color: #E6A23C;
                .env-value { color: #E6A23C; }
            }
            
            &.danger {
                border-left-color: #F56C6C;
                .env-value { color: #F56C6C; }
            }
            
            .env-title {
                color: #666;
                font-size: 13px;
                margin-bottom: 5px;
                text-align: center;
                white-space: nowrap;
                padding: 0 5px;
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .env-value {
                font-size: 20px;
                font-weight: bold;
                margin: 5px 0;
            }
            
            .env-unit {
                color: #999;
                font-size: 12px;
            }
        }
        
        .env-time {
            text-align: right;
            color: #999;
            font-size: 12px;
            margin-top: 5px;
        }
    }

    .page-block {
        margin: 20px 0;
        display: flex;
        justify-content: flex-start;  // 改为左对齐
        padding-left: 10px;           // 添加左边距
        
        .el-pagination {
            padding: 0;
            
            // 可选：调整分页组件内部元素的间距
            ::v-deep {
                .el-pagination__total {
                    margin-right: 16px;
                }
                
                .el-pagination__jump {
                    margin-left: 16px;
                }
            }
        }
    }

    .el-table {
        background: transparent !important;
        
        ::v-deep .el-table__body-wrapper {
            overflow-y: auto;
        }
    }

    .el-tabs {
        ::v-deep .el-tabs__header {
            margin: 0;
            padding-left: 10px;  // 添加左内边距以对齐标题
        }
        
        ::v-deep .el-tabs__nav-wrap {
            padding-top: 5px;  // 微调上边距使其与标题垂直对齐
        }

        .el-tabs__content {
            padding: 20px 0;
        }
    }

    .env-card {
        margin-bottom: 15px;
    }

    .equal-width-cards {
        .el-col {
            width: 20%; // 每个卡片占20%宽度
            padding: 0 10px; // 保持间距
        }
    }

    .el-table {
        height: 350px !important; // 稍微减小表格高度以适应新布局
    }

    .stats-section {
        flex: 1;
        padding: 10px 0;
        
        .stats-title {
            font-size: 14px;
            color: #606266;
            margin-bottom: 10px;
            padding-left: 10px;
            border-left: 3px solid #409EFF;
        }
    }

    .main {
        &.main-large {
            height: calc(((100vh - 84px - #{$margin} * 4 - 51px * 3) / 3) * 2 + #{$margin});
        }
    }

    .section-container {
        margin-bottom: 20px;
        
        &:last-child {
            margin-bottom: 0;
        }

        .section-title {
            font-size: 14px;
            color: #606266;
            margin-bottom: 15px;
            padding-left: 10px;
            border-left: 3px solid #409EFF;
            font-weight: 500;
        }

        .section-content {
            .el-col {
                margin-bottom: 15px;
                
                &:last-child {
                    margin-bottom: 0;
                }
            }
        }
    }

    .data-box {
        transition: all 0.3s ease;
        
        &:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
    }

    .chart-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center; // 水平居中
        justify-content: center; // 垂直居中
        
        .chart-area {
            width: 310px; // 增加宽度
            height: 310px; // 增加高度
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .stats-data {
            width: 100%; // 确保数据区域占满宽度
            padding: 0 20px;
            
            .stats-section {
                & + .stats-section {
                    margin-top: 15px;
                }
                
                .stats-title {
                    font-size: 14px;
                    color: #333;
                    margin-bottom: 10px;
                    position: relative;
                    padding-left: 10px;
                    
                    &:before {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 3px;
                        height: 14px;
                        background: #409EFF;
                    }
                }
                
                .stats-items {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    
                    .stats-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 8px 12px;
                        background: #F5F7FA;
                        border-radius: 4px;
                        
                        .item-name {
                            color: #606266;
                            font-size: 13px;
                        }
                        
                        .item-value {
                            color: #333;
                            font-size: 13px;
                            font-weight: 500;
                        }
                    }
                }
            }
        }
    }

    // 添加响应式布局支持
    @media screen and (max-width: 1400px) {
        .env-cards-wrapper {
            .env-card {
                .env-title {
                    font-size: 12px;
                }
                .env-value {
                    font-size: 18px;
                }
            }
        }
    }
</style>
