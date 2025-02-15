<template>
    <div class="container">
        <div class="index">
            <el-row :gutter="10">
                <el-col :span="8">
                    <data-panel title="基地概况">
                        <div class="main flex fdc ">
                            <el-row :gutter="10" class="flex1">
                                <el-col :span="8" class="h100 flex aic"><data-box icon="el-icon-s-data"
                                        backgroundColor="#5470c6" text="基地面积(亩)" :value="baseInfo.areaCount"
                                        class="flex1"></data-box></el-col>
                                <el-col :span="8" class="h100 flex aic"><data-box icon="el-icon-s-finance"
                                        backgroundColor="#91cc75" text="种养种类(种)" :value="baseInfo.germplasmCount"
                                        class="flex1"></data-box></el-col>
                                <el-col :span="8" class="h100 flex aic"><data-box icon="el-icon-s-grid"
                                        backgroundColor="#fac858" text="地块数量(块)" :value="baseInfo.diCount"
                                        class="flex1"></data-box></el-col>
                            </el-row>
                            <el-row :gutter="10" class="margin-top-10 flex1">
                                <el-col :span="8" class="h100 flex aic"><data-box icon="el-icon-s-custom"
                                        backgroundColor="#ee6666" text="人员总数(位)" :value="baseInfo.employeeCount"
                                        class="flex1"></data-box></el-col>
                                <el-col :span="8" class="h100 flex aic"><data-box icon="el-icon-s-claim"
                                        backgroundColor="#73c0de" text="种植批次(批)" :value="baseInfo.batchCount"
                                        class="flex1"></data-box></el-col>
                                <el-col :span="8" class="h100 flex aic"><data-box icon="el-icon-s-shop"
                                        backgroundColor="#3ba272" text="大棚数量(个)" :value="baseInfo.pengCount"
                                        class="flex1"></data-box></el-col>
                            </el-row>
                        </div>
                    </data-panel>
                </el-col>
                <el-col :span="8">
                    <data-panel title="种植统计" more="更多详情" link="Task">
                        <div class="main">
                            <!-- <div ref="indexServiceMonitorChart" class="h100"></div> -->
                            <el-row class="h100" :gutter="10">
                                <el-col :md="10" class="h100">
                                    <div ref="indexServiceMonitorChart" class="h100"></div>
                                </el-col>
                                <el-col :md="7" class="h100 flex fdc jcsa">
                                    <data-box v-for="item in taskInfo.slice(0,2)" :key="item.name"
                                        icon="el-icon-s-promotion" backgroundColor="red" :text="item.name+'(条)'"
                                        :value="item.value" :isBorder="false" :isIcon="false"></data-box>
                                </el-col>
                                <el-col :md="7" class="h100 flex fdc jcsa">
                                    <data-box v-for="item in taskInfo.slice(2,4)" :key="item.name"
                                        icon="el-icon-s-promotion" backgroundColor="red" :text="item.name+'(条)'"
                                        :value="item.value" :isBorder="false" :isIcon="false"></data-box>
                                </el-col>
                            </el-row>
                        </div>
                    </data-panel>
                </el-col>
                <el-col :span="8">
                    <data-panel title="溯源统计" more="更多溯源" link="RecordCount">
                        <div class="main">
                            <div ref="indexDeviceMonitorChart" class="h100"></div>
                        </div>
                    </data-panel>
                </el-col>
            </el-row>
            <el-row :gutter="10" class="margin-top-10">
                <el-col :span="8">
                    <data-panel title="养殖概况">
                        <div class="main flex fdc">
                            <el-row :gutter="10" class="flex1">
                                <el-col :span="8" class="h100 flex aic">
                                    <data-box 
                                        icon="el-icon-s-data"
                                        backgroundColor="#5470c6" 
                                        text="养殖池数量(个)" 
                                        :value="fishInfo.pondCount"
                                        class="flex1">
                                    </data-box>
                                </el-col>
                                <el-col :span="8" class="h100 flex aic">
                                    <data-box 
                                        icon="el-icon-s-finance"
                                        backgroundColor="#91cc75" 
                                        text="鱼类品种(种)" 
                                        :value="fishInfo.speciesCount"
                                        class="flex1">
                                    </data-box>
                                </el-col>
                                <el-col :span="8" class="h100 flex aic">
                                    <data-box 
                                        icon="el-icon-s-grid"
                                        backgroundColor="#fac858" 
                                        text="存栏数量(尾)" 
                                        :value="fishInfo.fishCount"
                                        class="flex1">
                                    </data-box>
                                </el-col>
                            </el-row>
                        </div>
                    </data-panel>
                </el-col>
                <el-col :span="8">
                    <data-panel title="养殖统计" more="更多详情" link="FishStats">
                        <div class="main">
                            <el-row class="h100" :gutter="10">
                                <el-col :md="10" class="h100">
                                    <div ref="fishStatsChart" class="h100"></div>
                                </el-col>
                                <el-col :md="7" class="h100 flex fdc jcsa">
                                    <data-box 
                                        v-for="item in fishStatsInfo.slice(0,2)" 
                                        :key="item.name"
                                        icon="el-icon-s-promotion" 
                                        backgroundColor="red" 
                                        :text="item.name+'(尾)'"
                                        :value="item.value" 
                                        :isBorder="false" 
                                        :isIcon="false">
                                    </data-box>
                                </el-col>
                                <el-col :md="7" class="h100 flex fdc jcsa">
                                    <data-box 
                                        v-for="item in fishStatsInfo.slice(2,4)" 
                                        :key="item.name"
                                        icon="el-icon-s-promotion" 
                                        backgroundColor="red" 
                                        :text="item.name+'(尾)'"
                                        :value="item.value" 
                                        :isBorder="false" 
                                        :isIcon="false">
                                    </data-box>
                                </el-col>
                            </el-row>
                        </div>
                    </data-panel>
                </el-col>

                <el-col :span="8">
                    <data-panel title="养殖溯源统计" more="更多溯源" link="FishTraceability">
                        <div class="main">
                            <div ref="fishTraceChart" class="h100"></div>
                        </div>
                    </data-panel>
                </el-col>

            </el-row>
            <el-row :gutter="10" class="margin-top-10">
                <el-col :span="24">
                    <data-panel title="环境监测数据">
                        <el-tabs v-model="activeTab">
                     <!-- 蔬菜大棚环境数据 -->
                            <el-tab-pane label="蔬菜大棚" name="vegetables">
                                <div class="env-cards-wrapper">
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
                                <el-table :data="statusData" height="400">
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
                                        :page-size="spSize"
                                        layout="jumper, prev, pager, next, total" 
                                        :total="stotal">
                                    </el-pagination>
                                </div>
                            </el-tab-pane>

                            <!-- 养殖池环境数据 -->
                            <el-tab-pane label="养殖池" name="fishPond">
                                <div class="env-cards-wrapper">
                                    <el-row :gutter="20" class="equal-width-cards">
                                        <el-col v-for="(item, index) in fishEnvItems" :key="index">
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
                            </el-tab-pane>
                        </el-tabs>
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
                spSize: 10,
                stotal: 0,
                deviceJobInfo: [],
                traceInfo: {
                    date: [],
                    num: []
                },
                taskInfo: [],
                statusData: [],
                fishInfo: {
                    pondCount: 12,
                    speciesCount: 8,
                    fishCount: 25000
                },
                fishStatsInfo: [
                    { name: '在养', value: 145 },
                    { name: '已出塘', value: 45 },
                    { name: '生病', value: 3 },
                    { name: '死亡', value: 0 }
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
            // 初始化两个图表
            // 初始化种植溯源图表
            lineChart(this.$refs.indexDeviceMonitorChart, {
                text: `溯源次数`,  // 图表标题
                fontSize: 14,      // 标题字体大小
                color: '#bbb'      // 标题颜色
            }, '溯源次数',         // X轴标题
            {
                name: '溯源次数'   // 数据系列名称
            }, 
            this.traceInfo.date,   // X轴数据（日期数组）
            this.traceInfo.num);   // Y轴数据（次数数组）

            pieChart(this.$refs.indexServiceMonitorChart, '农事任务', '任务进度(%)', this.taskInfo, 84.6);
            await this.getLandList();
            // this.addFeatures();
            this.houseCheck();
            pieChart(
                this.$refs.fishStatsChart, 
                '养殖状态', 
                '养殖进度(%)', 
                this.fishStatsInfo, 
                84.6
            );
            this.getFishEnvironmentData();
            
            // 添加以下调试代码
            setTimeout(() => {
                console.log('Latest env items:', this.latestEnvItems);
                console.log('Fish env items:', this.fishEnvItems);
            }, 1000);
        },
        methods: {
            // 处理每页显示数量变化
            sSizeChange(n) {
                this.spSize = n; // 更新每页显示数量
                this.houseCheck(); // 重新获取数据
            },
            
            // 处理页码变化
            sCurrentChange(n) {
                this.scurrentPage = n; // 更新当前页码
                this.houseCheck(); // 重新获取数据
            },
            
            // 获取蔬菜大棚环境数据
            houseCheck() {
                // 发送请求获取环境数据
                this.$http.post("/dev-api/iaPasture/selectSensorValuePage", {
                    currentPage: this.scurrentPage, // 当前页码
                    pageSize: this.spSize, // 每页数量
                    orderBy: 'dateTime', // 按日期排序
                    orderType: 'desc' // 降序排列（最新的在前）
                }).then(res => {
                    console.log('蔬菜大棚数据响应:', res); // 调试日志
                    if (res.data && res.data.data) {
                        // 更新表格数据
                        this.statusData = res.data.data.records.sort((a, b) => {
                            return new Date(b.dateTime) - new Date(a.dateTime); // 按时间降序排序
                        });
                        this.stotal = res.data.data.total; // 更新总记录数
                        
                        // 如果有数据，更新环境监测卡片
                        if (this.statusData && this.statusData.length > 0) {
                            const latest = this.statusData[0]; // 获取最新一条记录
                            // 更新环境监测卡片数据
                            this.latestEnvItems = [
                                { 
                                    label: '空气质量', 
                                    value: latest.airquality, 
                                    unit: 'ppm',
                                    thresholds: {
                                        good: { min: 0, max: 1000 }, // 正常范围
                                        warning: { min: 1000, max: 2000 } // 警告范围
                                    }
                                },
                                { 
                                    label: '温度', 
                                    value: latest.temperature, 
                                    unit: '℃',
                                    thresholds: {
                                        good: { min: 20, max: 30 }, // 适宜温度范围
                                        warning: { min: 15, max: 35 } // 可接受温度范围
                                    }
                                },
                                { 
                                    label: '湿度', 
                                    value: latest.humidity, 
                                    unit: '%',
                                    thresholds: {
                                        good: { min: 40, max: 70 }, // 适宜湿度范围
                                        warning: { min: 30, max: 80 } // 可接受湿度范围
                                    }
                                },
                                { 
                                    label: '气压', 
                                    value: latest.pressure, 
                                    unit: 'kPa',
                                    thresholds: {
                                        good: { min: 98, max: 102 }, // 正常气压范围
                                        warning: { min: 95, max: 105 } // 可接受气压范围
                                    }
                                }
                            ];
                        }
                    }
                }).catch(error => {
                    console.error('获取蔬菜大棚数据失败:', error); // 错误日志
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
                let wfp = res5.rows.find(item => item.status == 0) ? res5.rows.find(item => item.status == 0).num :
                    0;
                //已分配
                let yfp = res5.rows.find(item => item.status == 1) ? res5.rows.find(item => item.status == 1).num :
                    0;
                //进行中
                let jxz = res5.rows.find(item => item.status == 2) ? res5.rows.find(item => item.status == 2).num :
                    0;
                //已完成
                let ywc = res5.rows.find(item => item.status == 3) ? res5.rows.find(item => item.status == 3).num :
                    0;
                //任务进度
                this.$taskTotal = (wfp + yfp + ywc + jxz) == 0 ? 0 : (ywc * 100 / (wfp + yfp + ywc + jxz)).toFixed(
                    2);
                this.taskInfo = [{
                    name: '未分配',
                    value: wfp
                }, {
                    name: '已分配',
                    value: yfp
                }, {
                    name: '进行中',
                    value: jxz
                }, {
                    name: '已完成',
                    value: ywc
                }]

                // Initialize both charts with the same data
                lineChart(this.$refs.indexDeviceMonitorChart, {
                    text: `溯源次数`,
                    fontSize: 14,
                    color: '#bbb'
                }, '溯源次数', {
                    name: '溯源次数'
                }, this.traceInfo.date, this.traceInfo.num);

                // 初始化养殖溯源图表（使用相同的数据源）
                lineChart(this.$refs.fishTraceChart, {
                    text: `养殖溯源次数`,  // 图表标题
                    fontSize: 14,          // 标题字体大小
                    color: '#bbb'          // 标题颜色
                }, '溯源次数',             // X轴标题
                {
                    name: '溯源次数'       // 数据系列名称
                }, 
                this.traceInfo.date,       // X轴数据（日期数组）
                this.traceInfo.num);       // Y轴数据（次数数组）
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
        padding: 10px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 8px;
    }

    .env-card {
        background: rgba(255, 255, 255, 0.7);
        padding: 15px;
        border-radius: 10px;
        text-align: center;
        transition: all 0.3s ease;
        border-left: 4px solid transparent !important;
        
        &.success {
            border-left-color: #67C23A !important;
            .env-value { color: #67C23A !important; }
        }
        
        &.warning {
            border-left-color: #E6A23C !important;
            .env-value { color: #E6A23C !important; }
        }
        
        &.danger {
            border-left-color: #F56C6C !important;
            .env-value { color: #F56C6C !important; }
        }
        
        &:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .env-title {
            color: #666;
            font-size: 14px;
        }
        
        .env-value {
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0;
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
        margin-top: 10px;
    }

    .page-block {
        margin: 15px 0;
        padding: 0 10px;
        
        .el-pagination {
            justify-content: flex-end;
            
            button {
                background: transparent;
                
                &:hover {
                    color: #409EFF;
                }
            }
            
            .el-pager li {
                background: transparent;
                
                &:hover {
                    color: #409EFF;
                }
                
                &.active {
                    color: #409EFF;
                    font-weight: bold;
                }
            }
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
</style>
