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
                                            icon="zhongzhipici"
                                            backgroundColor="#73c0de"
                                            text="种植批次(批)"
                                            :value="baseInfo.batchCount"
                                            class="flex1">
                                        </data-box>
                                    </el-col>
                                    <el-col :span="8" class="h100 flex aic">
                                        <data-box
                                            icon="zhongzhizhonglei"
                                            backgroundColor="#91cc75"
                                            text="种植种类(种)"
                                            :value="baseInfo.germplasmCount"
                                            class="flex1">
                                        </data-box>
                                    </el-col>
                                    <el-col :span="8" class="h100 flex aic">
                                        <data-box
                                            icon="dapengshuliang"
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
                                            icon="yangzhipici"
                                            backgroundColor="#fac858"
                                            text="养殖批次(个)"
                                            :value="fishInfo.batchCount"
                                            class="flex1">
                                        </data-box>
                                    </el-col>
                                    <el-col :span="8" class="h100 flex aic">
                                        <data-box
                                            icon="yuleipingzhong"
                                            backgroundColor="#ee6666"
                                            text="鱼类品种(种)"
                                            :value="fishInfo.speciesCount"
                                            class="flex1">
                                        </data-box>
                                    </el-col>
                                    <el-col :span="8" class="h100 flex aic">
                                        <data-box
                                            icon="yupengshuliang"
                                            backgroundColor="#73c0de"
                                            text="鱼棚数量(个)"
                                            :value="fishInfo.pengCount"
                                            class="flex1">
                                        </data-box>
                                    </el-col>
                                </el-row>
                            </div>

                            <!-- 公共信息部分 -->
                            <div class="section-container">
                                <div class="section-title">公共信息</div>
                                <el-row :gutter="10" class="section-content">
                                    <el-col :span="8" class="h100 flex aic">
                                        <data-box
                                            icon="mianji"
                                            backgroundColor="#5470c6"
                                            text="基地总面积(亩)"
                                            :value="baseInfo.areaCount"
                                            class="flex1">
                                        </data-box>
                                    </el-col>
                                    <el-col :span="12" class="h100 flex aic">
                                        <data-box
                                            icon="renyuanzhongshu"
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
                    <data-panel title="种植统计" more="更多详情" link="Task">
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
                                            <div class="stats-title">养殖任务</div>
                                            <el-row :gutter="10">
                                                <el-col :span="12" v-for="item in fishStatsInfo" :key="item.name">
                                                    <data-box
                                                        icon="el-icon-s-promotion"
                                                        :backgroundColor="item.color || '#67C23A'"
                                                        :text="item.name+'(条)'"
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
                    <data-panel 
                        title="溯源统计" 
                        more="更多溯源" 
                        :moreLink="'http://192.168.1.153:81/originIndex'">
                        <div class="main main-large">
                            <div class="trace-header">
                                <div class="time-range-selector">
                                    <div class="time-range-tabs">
                                        <div 
                                            v-for="tab in timeTabs" 
                                            :key="tab.value"
                                            :class="['time-tab', { active: timeRange === tab.value }]"
                                            @click="handleTimeRangeChange(tab.value)"
                                        >
                                            {{ tab.label }}
                                        </div>
                                    </div>
                                </div>
                                <div class="trace-stats">
                                    <div class="stat-item">
                                        <div class="stat-value">{{ totalTraces }}</div>
                                        <div class="stat-label">总溯源次数</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-value">{{ currentPeriodTraces }}</div>
                                        <div class="stat-label">{{ timeRangeLabel }}溯源次数</div>
                                    </div>
                                </div>
                            </div>
                            <div class="trace-chart-container">
                                <div ref="indexDeviceMonitorChart" class="trace-chart"></div>
                            </div>
                        </div>
                    </data-panel>
                </el-col>
            </el-row>
            <el-row :gutter="10" class="margin-top-10">
                <el-col :span="12">
                    <data-panel title="蔬菜大棚环境监测">
                        <el-table :data="statusData" height="400">
                            <el-table-column prop="pastureName" label="大棚名称" width="100"> </el-table-column>
                            <el-table-column prop="batchName" label="分区名称" width="100"> </el-table-column>
                            <el-table-column prop="temperature" label="温度(℃)" width="80"> </el-table-column>
                            <el-table-column prop="humidity" label="湿度(%)" width="80"> </el-table-column>
                            <el-table-column prop="lightLux" label="光照(lux)" width="90"> </el-table-column>
                            <el-table-column prop="direction" label="风向" width="70"> </el-table-column>
                            <el-table-column prop="speed" label="风速(m/s)" width="90"> </el-table-column>
                            <el-table-column label="记录时间" min-width="150">
                                <template slot-scope="scope">
                                    {{ scope.row.date + ' ' + scope.row.time }}
                                </template>
                            </el-table-column>
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
                        <el-table :data="fishStatusData" height="400">
                            <el-table-column prop="fishPastureName" label="养殖棚" width="70"> </el-table-column>
                            <el-table-column prop="fishPastureBatchName" label="鱼池" width="80"> </el-table-column>
                            <el-table-column prop="waterTemperature" label="水温(℃)" width="70"> </el-table-column>
                            <el-table-column prop="waterPhValue" label="ph值" width="80"></el-table-column>
                            <el-table-column prop="waterOxygenContent" label="溶解氧(mg/L)" width="110"></el-table-column>
                            <el-table-column prop="waterAmmoniaNitrogenContent" label="氨氮(mg/L)" width="100"></el-table-column>
                            <el-table-column prop="waterNitriteContent" label="亚硝酸盐(mg/L)" width="120"></el-table-column>
                            <el-table-column label="记录日期" min-width="150">
                                <template slot-scope="scope">
                                    <span>{{ scope.row.date }} {{ scope.row.time }}</span>
                                </template>
                            </el-table-column>
                        </el-table>
                        <div class="page-block">
                            <el-pagination
                                @size-change="fishSizeChange"
                                @current-change="fishCurrentChange"
                                :current-page="fishCurrentPage"
                                :page-size="fishPageSize"
                                layout="total, sizes, prev, pager, next, jumper"
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
    } from "@/api/agriculture/dataStatistics";
    import { selectFishBaseInfo,
            selectFishTaskInfo
    } from "@/api/fishingGround/fishDataStatistics";
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
    import { listValue } from "@/api/agriculture/value";
    import { getHouse } from "@/api/iaAgriculture/greenHouse";
    import { getBatch } from "@/api/agriculture/batch";
    import { listSoilSensorValueVO } from '@/api/agriculture/soilsensorvaluevo'
    import { listQuality } from "@/api/agriculture/quality";
    import http from "@/utils/request";


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
                    { name: '未分配', value: 145, color: '#409EFF' },
                    { name: '已分配', value: 45, color: '#67C23A' },
                    { name: '进行中', value: 3, color: '#E6A23C' },
                    { name: '已完成', value: 0, color: '#F56C6C' }
                ],
                latestEnvItems: [
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
                        label: '光照',
                        value: '100.24',
                        unit: 'lux',
                        thresholds: {
                            good: { min: 50, max: 200 },
                            warning: { min: 20, max: 300 },
                            // 低于20或超过300为危险
                        }
                    },
                    {
                        label: '土壤湿度',
                        value: '35',
                        unit: '%',
                        thresholds: {
                            good: { min: 40, max: 70 },
                            warning: { min: 30, max: 80 },
                            // 低于30或超过80为危险
                        }
                    }
                ],
                activeTab: 'vegetables',
                fishStatusData: [],
                fishCurrentPage: 1,
                fishPageSize: 10,
                fishTotal: 0,
                timeRange: 'week', // 修改默认值为'week'而不是'month'
                traceabilityData: {
                    week: {
                        agriculture: new Array(7).fill(0),
                        fish: new Array(7).fill(0)
                    },
                    month: {
                        agriculture: new Array(30).fill(0), 
                        fish: new Array(30).fill(0)
                    },
                    year: {
                        agriculture: new Array(12).fill(0),
                        fish: new Array(12).fill(0)
                    }
                },
                timeTabs: [
                    { label: '周', value: 'week' },
                    { label: '月', value: 'month' },
                    { label: '年', value: 'year' }
                ],
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
            },
            timeRangeLabel() {
                const labels = {
                    week: '近一周',
                    month: '近一月',
                    year: '近一年'
                };
                return labels[this.timeRange];
            },
            totalTraces() {
                const data = this.traceabilityData[this.timeRange];
                return data.agriculture.reduce((a, b) => a + b, 0) + 
                       data.fish.reduce((a, b) => a + b, 0);
            },
            currentPeriodTraces() {
                const data = this.traceabilityData[this.timeRange];
                return data.agriculture.reduce((a, b) => a + b, 0) + 
                       data.fish.reduce((a, b) => a + b, 0);
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
            
            // Add this line to get fish environment data on component mount
            this.getFishEnvironmentData();
        },
        methods: {
            // 处理每页显示数量变化
            sSizeChange(val) {
                this.spSize = val;
                this.scurrentPage = 1;  // 重置到第一页
                this.houseCheck();
            },

            // 处理页码变化
            sCurrentChange(val) {
                this.scurrentPage = val;
                this.houseCheck();
            },

            // 获取大棚环境数据
            houseCheck() {
                const params = {
                    pageNum: this.scurrentPage,
                    pageSize: this.spSize,
                    orderByColumn: 'date,time',  // 按日期和时间排序
                    isAsc: 'desc'                 // 升序排序
                };
                
                listSoilSensorValueVO(params).then(response => {
                    let data;
                    if (Array.isArray(response)) {
                        data = response;
                        this.stotal = response.length;
                    } 
                    else if (response.rows) {
                        data = response.rows;
                        this.stotal = response.total;
                    }
                    else if (response.data) {
                        if (Array.isArray(response.data)) {
                            data = response.data;
                            this.stotal = response.data.length;
                        } else {
                            data = response.data.rows || [];
                            this.stotal = response.data.total || 0;
                        }
                    }

                    // 直接使用后端排序好的数据
                    this.statusData = data;
                }).catch(error => {
                    console.error('获取传感器数据失败:', error);
                    this.$message.error('获取传感器数据失败');
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
                // 修改获取溯源记录的部分
                try {
                    const res = await this.$http.get("/dev-api/iaPartitionFoodSensorValue/getAgricultureTraceRecord");
                    const rawData = res.data.data.data;
                    
                    // 处理数据按不同时间范围分类
                    this.processTraceabilityData(rawData);
                    
                    // 初始化图表
                    this.$nextTick(() => {
                        this.updateTraceabilityChart();
                    });
                } catch (error) {
                    console.error("获取溯源数据失败:", error);
                }

                //蔬菜基地信息
                const res = await selectBaseInfo()
                this.baseInfo = res.rows[0]

                // 获取养殖基地信息
                const fishRes = await selectFishBaseInfo()
                this.fishInfo = fishRes.rows[0]

                // 获取养殖任务状态信息
                const fishTaskRes = await selectFishTaskInfo()


                    //未分配
                    let fishwfp = fishTaskRes.rows.find(item => item.status == 0) ? fishTaskRes.rows.find(item => item.status == 0).num : 0;
                    //已分配
                    let fishyfp = fishTaskRes.rows.find(item => item.status == 1) ? fishTaskRes.rows.find(item => item.status == 1).num : 0;
                    //进行中
                    let fishjxz = fishTaskRes.rows.find(item => item.status == 2) ? fishTaskRes.rows.find(item => item.status == 2).num : 0;
                    //已完成
                    let fishywc = fishTaskRes.rows.find(item => item.status == 3) ? fishTaskRes.rows.find(item => item.status == 3).num : 0;

                    // 更新养殖状态信息数组
                    this.fishStatsInfo = [
                        { name: '未分配', value: fishwfp, color: '#909399' },
                        { name: '已分配', value: fishyfp, color: '#E6A23C' },
                        { name: '进行中', value: fishjxz, color: '#409EFF' },
                        { name: '已完成', value: fishywc, color: '#67C23A' }
                    ];


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
                const params = {
                    pageNum: this.fishCurrentPage,
                    pageSize: this.fishPageSize,
                    orderByColumn: 'date,time',  // 按日期和时间排序
                    isAsc: 'desc'                // 降序排序
                };

                listQuality(params).then(response => {
                    if (response.rows) {
                        this.fishStatusData = response.rows;
                        this.fishTotal = response.total;
                    }
                }).catch(error => {
                    console.error('获取养殖池数据失败:', error);
                    this.$message.error('获取养殖池数据失败');
                });
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
            },
            updateLatestEnvItems(latest) {
                this.latestEnvItems = [
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
                        label: '光照',
                        value: latest.lightLux,
                        unit: 'lux',
                        thresholds: {
                            good: { min: 50, max: 200 },
                            warning: { min: 20, max: 300 }
                        }
                    },
                    {
                        label: '土壤湿度',
                        value: latest.soilMoisture,
                        unit: '%',
                        thresholds: {
                            good: { min: 40, max: 70 },
                            warning: { min: 30, max: 80 }
                        }
                    }
                ];
            },
            handleMoreClick() {
                window.open('http://192.168.1.153:81/originIndex', '_blank');
            },
            // 添加新的方法用于处理数据
            processTraceabilityData(rawData) {
                if (!Array.isArray(rawData)) {
                    console.error('Invalid rawData:', rawData);
                    return;
                }

                const now = new Date();
                const periods = {
                    week: {
                        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6),
                        length: 7,
                        getIndex: (date) => Math.floor((date - periods.week.start) / (1000 * 60 * 60 * 24)),
                        getLabel: (i) => {
                            const d = new Date(now);
                            d.setDate(d.getDate() - (6 - i));
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                        }
                    },
                    month: {
                        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29),
                        length: 30,
                        getIndex: (date) => Math.floor((date - periods.month.start) / (1000 * 60 * 60 * 24)),
                        getLabel: (i) => {
                            const d = new Date(now);
                            d.setDate(d.getDate() - (29 - i));
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                        }
                    },
                    year: {
                        start: new Date(now.getFullYear(), now.getMonth() - 11, 1),
                        length: 12,
                        getIndex: (date) => date.getMonth() - periods.year.start.getMonth() + 
                                          (12 * (date.getFullYear() - periods.year.start.getFullYear())),
                        getLabel: (i) => {
                            const d = new Date(now);
                            d.setMonth(d.getMonth() - (11 - i));
                            return `${d.getMonth() + 1}月`;
                        }
                    }
                };

                // 重置数据
                ['week', 'month', 'year'].forEach(period => {
                    this.traceabilityData[period] = {
                        agriculture: new Array(periods[period].length).fill(0),
                        fish: new Array(periods[period].length).fill(0)
                    };
                });

                // 处理数据
                rawData.forEach(item => {
                    if (!item.queryDate) return;
                    
                    const date = new Date(Number(item.queryDate));
                    if (isNaN(date.getTime())) return;

                    const type = item.type === "0" ? 'agriculture' : 'fish';

                    // 更新各时间段的数据
                    Object.keys(periods).forEach(period => {
                        if (date >= periods[period].start && date <= now) {
                            const index = periods[period].getIndex(date);
                            if (index >= 0 && index < periods[period].length) {
                                this.traceabilityData[period][type][index]++;
                            }
                        }
                    });
                });
            },
            updateTraceabilityChart() {
                const chartDom = this.$refs.indexDeviceMonitorChart;
                if (!chartDom) return;

                const now = new Date();
                const periods = {
                    week: {
                        length: 7,
                        getLabel: (i) => {
                            const d = new Date(now);
                            d.setDate(d.getDate() - (6 - i));
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                        }
                    },
                    month: {
                        length: 30,
                        getLabel: (i) => {
                            const d = new Date(now);
                            d.setDate(d.getDate() - (29 - i));
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                        }
                    },
                    year: {
                        length: 12,
                        getLabel: (i) => {
                            const d = new Date(now);
                            d.setMonth(d.getMonth() - (11 - i));
                            return `${d.getMonth() + 1}月`;
                        }
                    }
                };

                const period = periods[this.timeRange];
                const xAxisData = Array.from({length: period.length}, (_, i) => period.getLabel(i));
                const seriesData = this.traceabilityData[this.timeRange];

                const maxValue = {
                    week: 100,
                    month: 1000,
                    year: 8000
                }[this.timeRange];

                const option = {
                    tooltip: {
                        trigger: 'axis',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderColor: '#eee',
                        borderWidth: 1,
                        textStyle: { color: '#666' },
                        formatter: function(params) {
                            let result = `<div style="font-weight:bold;margin-bottom:5px;">${params[0].axisValue}</div>`;
                            params.forEach(param => {
                                result += `<div style="display:flex;justify-content:space-between;align-items:center;margin:3px 0;">
                                    <span style="margin-right:15px;">
                                        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${param.color};margin-right:5px;"></span>
                                        ${param.seriesName}
                                    </span>
                                    <span style="font-weight:bold;">${param.value} 次</span>
                                </div>`;
                            });
                            return result;
                        }
                    },
                    legend: {
                        data: ['农产品', '水产品'],
                        right: 20,
                        top: 0,
                        textStyle: {
                            color: '#666'
                        }
                    },
                    grid: {
                        top: '30px',      // 减小顶部边距
                        left: '30px',     // 减小左侧边距
                        right: '20px',    // 减小右侧边距
                        bottom: '10px',   // 减小底部边距
                        containLabel: true // 确保包含坐标轴标签
                    },
                    xAxis: {
                        type: 'category',
                        data: xAxisData,
                        axisLine: {
                            lineStyle: { color: '#eee', width: 2 }
                        },
                        axisLabel: {
                            interval: this.timeRange === 'month' ? 2 : 0,
                            margin: 8,
                            color: '#666',
                            fontSize: 12,
                            formatter: function(value) {
                                return value;
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        boundaryGap: false
                    },
                    yAxis: {
                        type: 'value',
                        nameTextStyle: {
                            color: '#666',
                            fontSize: 12,
                            padding: [0, 0, 0, 0]  // 减小名称的内边距
                        },
                        splitLine: {
                            lineStyle: { 
                                color: '#eee',
                                type: 'dashed'
                            }
                        },
                        axisLabel: {
                            color: '#666',
                            fontSize: 12,
                            margin: 8,    // 减小标签与轴线的距离
                            formatter: '{value}'
                        },
                        axisTick: {
                            show: false
                        },
                        axisLine: {
                            show: false
                        },
                        min: 0,
                        max: maxValue,
                        interval: maxValue / 5  // 减少刻度数量，使用5等分
                    },
                    series: [
                        {
                            name: '农产品',
                            type: 'line',
                            smooth: true,
                            symbolSize: 6,  // 减小数据点的大小
                            data: seriesData.agriculture,
                            itemStyle: { color: '#91cc75' },
                            lineStyle: {
                                width: 2    // 减小线条宽度
                            },
                            areaStyle: {
                                color: {
                                    type: 'linear',
                                    x: 0, y: 0, x2: 0, y2: 1,
                                    colorStops: [
                                        { offset: 0, color: 'rgba(145, 204, 117, 0.3)' },
                                        { offset: 1, color: 'rgba(145, 204, 117, 0.1)' }
                                    ]
                                }
                            }
                        },
                        {
                            name: '水产品',
                            type: 'line',
                            smooth: true,
                            symbolSize: 6,  // 减小数据点的大小
                            data: seriesData.fish,
                            itemStyle: { color: '#5470c6' },
                            lineStyle: {
                                width: 2    // 减小线条宽度
                            },
                            areaStyle: {
                                color: {
                                    type: 'linear',
                                    x: 0, y: 0, x2: 0, y2: 1,
                                    colorStops: [
                                        { offset: 0, color: 'rgba(84, 112, 198, 0.3)' },
                                        { offset: 1, color: 'rgba(84, 112, 198, 0.1)' }
                                    ]
                                }
                            }
                        }
                    ]
                };

                const chart = this.$echarts.init(chartDom);
                chart.setOption(option);

                // 添加窗口大小变化的监听
                window.addEventListener('resize', () => {
                    chart.resize();
                });

                // 在组件销毁时移除监听器
                this.$once('hook:beforeDestroy', () => {
                    window.removeEventListener('resize', chart.resize);
                    chart.dispose();
                });
            },
            // 添加切换时间范围的方法
            handleTimeRangeChange(range) {
                this.timeRange = range;
                this.updateTraceabilityChart();
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
        border-radius: 12px;
        width: 100%;

        &.vegetable-cards, &.fish-cards {
            .el-row {
                margin-bottom: 10px;
                width: 100%;
                display: flex;
                justify-content: space-between;
            }

            .el-col {
                padding: 0 8px;
            }
        }

        .env-card {
            height: 100px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 15px 10px;
            border-radius: 16px;
            transition: all 0.3s ease;
            margin-bottom: 0;
            width: 100%;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);

            &:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
            }

            &.success {
                background: linear-gradient(145deg, rgba(103, 194, 58, 0.05), rgba(103, 194, 58, 0.15));
                .env-value { color: #67C23A; }
            }

            &.warning {
                background: linear-gradient(145deg, rgba(230, 162, 60, 0.05), rgba(230, 162, 60, 0.15));
                .env-value { color: #E6A23C; }
            }

            &.danger {
                background: linear-gradient(145deg, rgba(245, 108, 108, 0.05), rgba(245, 108, 108, 0.15));
                .env-value { color: #F56C6C; }
            }

            .env-title {
                color: #666;
                font-size: 13px;
                margin-bottom: 8px;
                text-align: center;
                font-weight: 500;
                letter-spacing: 0.3px;
            }

            .env-value {
                font-size: 24px;
                font-weight: 600;
                margin: 5px 0;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }

            .env-unit {
                color: #8c8c8c;
                font-size: 12px;
                margin-top: 2px;
                letter-spacing: 0.2px;
            }
        }

        .env-time {
            text-align: right;
            color: #8c8c8c;
            font-size: 12px;
            margin-top: 8px;
            letter-spacing: 0.2px;
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

    .env-cards-wrapper {
        &.fish-cards {
            .el-row {
                margin: 0 -8px; // 抵消padding的间距
                width: calc(100% + 16px); // 补偿margin的负值

                .el-col {
                    padding: 0 8px;
                    width: 20%; // 确保每个卡片占20%宽度

                    // 修复 el-col 的默认样式
                    @media only screen and (min-width: 768px) {
                        flex: 0 0 20%;
                        max-width: 20%;
                    }
                }
            }
        }
    }

    .trace-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
        margin-bottom: 20px;

        .time-range-selector {
            .time-range-tabs {
                display: flex;
                background: #f5f7fa;
                border-radius: 20px;
                padding: 3px;
                
                .time-tab {
                    padding: 6px 16px;
                    cursor: pointer;
                    border-radius: 17px;
                    font-size: 13px;
                    color: #606266;
                    transition: all 0.3s ease;
                    
                    &:hover {
                        color: #409EFF;
                    }
                    
                    &.active {
                        background: #409EFF;
                        color: white;
                        box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
                    }
                }
            }
        }

        .trace-stats {
            display: flex;
            gap: 24px;

            .stat-item {
                text-align: center;
                
                .stat-value {
                    font-size: 24px;
                    font-weight: 600;
                    color: #303133;
                    line-height: 1.2;
                    background: linear-gradient(45deg, #409EFF, #36D1DC);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                
                .stat-label {
                    font-size: 13px;
                    color: #909399;
                    margin-top: 4px;
                }
            }
        }
    }

    .trace-chart-container {
        height: calc(100% - 60px); // 减小头部区域的高度
        width: 100%;
        padding: 0; // 移除内边距

        .trace-chart {
            height: 100%;
            width: 100%;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.5);
        }
    }

    .main-large {
        position: relative;
        padding: 20px 0;
        height: calc(((100vh - 84px - #{$margin} * 4 - 51px * 3) / 3) * 2 + #{$margin});
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8));
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
    }
</style>
