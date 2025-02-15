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
            </el-row>
            <el-row :gutter="10" class="margin-top-10">
                <el-col>
                    <data-panel title="最新环境数据">
                        <div class="env-cards-wrapper">
                            <el-row :gutter="20">
                                <el-col :span="4" v-for="(item, index) in latestEnvItems" :key="index">
                                    <div class="env-card">
                                        <div class="env-title">{{item.label}}</div>
                                        <div class="env-value">{{item.value}}</div>
                                        <div class="env-unit">{{item.unit}}</div>
                                    </div>
                                </el-col>
                            </el-row>
                            <div class="env-time">更新时间：{{latestUpdateTime}}</div>
                        </div>
                        <el-table :data="statusData">
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
                    { label: '空气质量', value: '2976.19', unit: 'ppm' },
                    { label: '温度', value: '27', unit: '℃' },
                    { label: '湿度', value: '35', unit: '%' },
                    { label: '气压', value: '100.24', unit: 'kPa' }
                ]
            };
        },
        computed: {
            latestUpdateTime() {
                return this.statusData && this.statusData.length > 0 
                    ? this.statusData[0].dateTime 
                    : '--'
            }
        },
        async mounted() {
            // await this.getBaseInfo();

            await this.getDate();
            lineChart(this.$refs.indexDeviceMonitorChart, {
                text: `溯源次数`,
                fontSize: 14,
                color: '#bbb'
            }, '溯源次数', {
                name: '溯源次数'
            }, this.traceInfo.date, this.traceInfo.num);
            pieChart(this.$refs.indexServiceMonitorChart, '农事任务', '任务进度(%)', this.taskInfo, 84.6);
            await this.getLandList();
            // this.addFeatures();
            this.houseCheck()
            pieChart(
                this.$refs.fishStatsChart, 
                '养殖状态', 
                '养殖进度(%)', 
                this.fishStatsInfo, 
                84.6
            );
        },
        methods: {
            // 查看列表分页
            sSizeChange(n) {
                this.spSize = n
            },
            sCurrentChange(n) {
                this.scurrentPage = n
                this.houseCheck(this.checkId)
            },
            houseCheck(n, val) {
                // this.checkId = n
                // this.houseStatusDialog = true
                this.$http.post("/dev-api/iaPasture/selectSensorValuePage", {
                    currentPage: this.scurrentPage,
                    pageSize: this.spSize,
                }).then(res => {
                    console.log(res)
                    this.statusData = res.data.data.records;
                    this.stotal = res.data.data.total
                    
                    // 更新卡片数据
                    if (this.statusData && this.statusData.length > 0) {
                        const latest = this.statusData[0];
                        this.latestEnvItems = [
                            { label: '空气质量', value: latest.airquality, unit: 'ppm' },
                            { label: '温度', value: latest.temperature, unit: '℃' },
                            { label: '湿度', value: latest.humidity, unit: '%' },
                            { label: '气压', value: latest.pressure, unit: 'kPa' }
                        ];
                    }
                })
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
            color: #409EFF;
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
        margin-top: 10px;
        text-align: left;
        padding-left: 10px;
    }
</style>
