<!-- 大棚页面 -->
<template>
    <div class="app-container-sm">
        <el-card class="search-card">
            <el-form :inline="true" class="search-form">
                <el-form-item label="大棚名称">
                    <el-input v-model="mcName" placeholder="请输入名称" size="small" class="search-input"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary"  size="small" @click="houseSearch"><svg-icon icon-class="ss"></svg-icon>搜索</el-button>
                    <el-button size="small" @click="resetName"><svg-icon icon-class="cz"></svg-icon>重置</el-button>
                </el-form-item>
                <el-form-item class="fr">
                    <el-button type="primary" plain size="small" @click="addHouse()"><svg-icon icon-class="xz"></svg-icon>新增</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card class="device-card">
            <div class="greenhouse-grid">
                <el-row :gutter="24">
                    <el-col :span="12" v-for="(item, index) in houseData" :key="index">
                        <div class="greenhouse-card">
                            <div class="card-header">
                                <span class="greenhouse-name">{{ item.name }}</span>
                                <div class="header-actions">
                                    <el-button size="mini" type="primary" 
                                        @click="addHouse(item.id)"
                                        v-hasPermi="['agriculture:batch:edit']"><svg-icon icon-class="xg"></svg-icon>修改</el-button>
                                    <el-button size="mini" type="danger" 
                                        @click="deleteData(item.id)"
                                        v-hasPermi="['agriculture:batch:remove']"><svg-icon icon-class="sc"></svg-icon>删除</el-button>
                                </div>
                            </div>
                            <div class="card-content">
                                <div class="info-item">
                                    <svg-icon icon-class="hydz"></svg-icon>
                                    <span class="label">合约地址</span>
                                    <span class="value">{{ item.contractAddr }}</span>
                                </div>
                                <div class="info-item">
                                    <svg-icon icon-class="mj"></svg-icon>
                                    <span class="label">面积</span>
                                    <span class="value">{{ item.area }}</span>
                                </div>
                                <div class="info-item">
                                    <svg-icon icon-class="sl"></svg-icon>
                                    <span class="label">最大区分数量</span>
                                    <span class="value">{{ item.bigBreedingQuantity }}</span>
                                </div>
                                <!-- <div class="info-item">
                                    <i class="el-icon-sunny"></i>
                                    <span class="label">平均温度</span>
                                    <span class="value">{{ getTodayAverage(item.id).temperature }}{{ getTodayAverage(item.id).temperature !== '/' ? '℃' : '' }}</span>
                                </div>
                                <div class="info-item">
                                    <i class="el-icon-umbrella"></i>
                                    <span class="label">平均湿度</span>
                                    <span class="value">{{ getTodayAverage(item.id).humidity }}{{ getTodayAverage(item.id).humidity !== '/' ? '%' : '' }}</span>
                                </div> -->
                                <div class="info-item">
                                    <svg-icon icon-class="fenqu"></svg-icon>
                                    <span class="label">位置</span>
                                    <span class="value">{{ item.address }}</span>
                                </div>
                            </div>
                            <div class="card-footer">
                                <el-button size="small" type="warning" plain 
                                    @click="houseCheck(item.id)"
                                    v-hasPermi="['agriculture:batch:edit']"><svg-icon icon-class="hjxq"></svg-icon>环境详情</el-button>
                            </div>
                        </div>
                    </el-col>
                </el-row>
            </div>
            <pagination 
                v-show="totalPage>0" 
                :total="totalPage" 
                :page.sync="currentPage"
                :limit.sync="pSize" 
                @pagination="handleCurrentChange" 
                class="pagination-container"
            />
        </el-card>

        <!-- 新增/修改弹框 -->
        <el-dialog :title="btnTxt == 1 ? '编辑' : btnTxt == 2 ? '详情' : '新增'" :visible.sync="houseEditDialog" width="40%">
            <el-form :model="houseDoForm" label-width="120px">
                <el-form-item label="大棚名称">
                    <el-input v-model="houseDoForm.name" required placeholder="请输入名称"
                        :disabled="btnTxt == 2 ? true : false"></el-input>
                </el-form-item>
                <el-form-item label="大棚面积">
                    <el-input v-model="houseDoForm.area" required placeholder="请输入大棚面积"
                        :disabled="btnTxt == 2 ? true : false"></el-input>
                </el-form-item>
                <el-form-item label="最大分区数量">
                    <el-input v-model="houseDoForm.bigBreedingQuantity" required placeholder="最大分区数量"
                        :disabled="btnTxt == 2 ? true : false"></el-input>
                </el-form-item>
                <el-form-item label="大棚位置">
                    <el-input v-model="houseDoForm.address" required placeholder="请输入大棚位置"
                        :disabled="btnTxt == 2 ? true : false"></el-input>
                </el-form-item>
                <el-form-item label="绑定设备">
                    <el-input v-if="btnTxt == 2" v-model="houseDoForm.deviceId" required :disabled="true"></el-input>
                    <el-select v-model="houseDoForm.deviceId" placeholder="请选择" size="small" v-else>
                        <el-option v-for="item in deviceOptions" :key="item.id" :label="item.deviceName"
                            :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="备注信息">
                    <el-input type="textarea" :disabled="btnTxt == 2 ? true : false" v-model="houseDoForm.description"
                        :rows="3" placeholder="请输入备注信息"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click="houseEditDialog = false">关闭</el-button>
                <el-button type="success" size="small" @click="houseDoBtn">确认</el-button>
            </div>
        </el-dialog>
        <!-- 大棚状态抽屉页面 -->
        <el-dialog title="大棚环境状态" :visible.sync="houseStatusDialog" width="50%">
            <div class="status-content">
                <el-table 
                    :data="statusData" 
                    :stripe="true" 
                    tooltip-effect="dark" 
                    border 
                    size="mini" 
                    style="width: 100%"
                    :header-cell-style="{ background: 'rgba(239, 249, 243, 1)', color: '#000' }">
                    <el-table-column prop="id" label="ID" width="80"> </el-table-column>
                    <el-table-column prop="temperature" label="空气温度(℃)"> </el-table-column>
                    <el-table-column prop="humidity" label="空气湿度(%)"> </el-table-column>
                    <el-table-column prop="lightLux" label="光照(lux)"> </el-table-column>
                    <el-table-column prop="direction" label="风向"> </el-table-column>
                    <el-table-column prop="speed" label="风速(m/s)"> </el-table-column>
                    <el-table-column label="记录时间" width="160">
                        <template slot-scope="scope">
                            {{ scope.row.date }} {{ scope.row.time }}
                        </template>
                    </el-table-column>
                </el-table>
                
                <!-- 分页组件 -->
                <div class="pagination-container">
                    <el-pagination
                        @size-change="handleStatusSizeChange"
                        @current-change="handleStatusCurrentChange"
                        :current-page="statusPagination.currentPage"
                        :page-sizes="[10, 20, 50, 100]"
                        :page-size="statusPagination.pageSize"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="statusPagination.total">
                    </el-pagination>
                </div>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click="houseStatusDialog = false">关闭</el-button>
                <el-button type="success" size="small" @click="houseDoBtn">确认</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { getValueByPastureId } from "@/api/agriculture/value";

export default {
    data() {
        return {
            btnTxt: 0,                    // 按钮文本标识：0-新增，1-编辑，2-详情
            houseStatusDialog: false,      // 大棚状态弹窗显示标志
            houseEditDialog: false,        // 大棚编辑弹窗显示标志
            mcName: '',                    // 搜索框中的大棚名称
            currentPage: 1,                // 当前页码
            totalPage: 0,                  // 总页数
            pSize: 10,                     // 每页显示条数
            houseData: [],                 // 大棚数据列表
            deviceOptions: [],             // 设备选项列表
            typeVal: '',                   // 类型值
            statusData: [],                // 状态数据列表
            stotal: 0,                     // 状态数据总数
            scurrentPage: 1,               // 状态数据当前页
            spSize: 10,                    // 状态数据每页条数
            checkId: 0,                    // 当前查看的大棚ID
            stateContent: '',              // 状态搜索内容
            houseDoForm: {                 // 大棚表单对象
                deviceId: '',              // 设备ID
                name: '',                  // 大棚名称
                address: '',               // 大棚地址
                bigBreedingQuantity: '',   // 最大分区数量
                area: '',                  // 面积
                description: ''            // 描述
            },
            sbId: '',                      // 设备ID临时存储
            sensorData: {},                // 存储所有大棚的传感器数据
            sensorDataMap: new Map(),      // 使用Map存储每个大棚的传感器数据
            todayAverages: {},             // 存储每个大棚的今日平均值
            loading: false,                // 加载状态
            queryParams: {                 // 查询参数
                pageNum: 1,                // 页码
                pageSize: 10,              // 每页大小
                keyword: undefined         // 搜索关键词
            },
            statusPagination: {      // 环境数据表格分页
                currentPage: 1,      // 当前页码
                pageSize: 10,        // 每页显示条数
                total: 0             // 总条数
            },
            originalStatusData: [],   // 保存原始数据用于分页
        }
    },
    mounted() {
        this.getHouseData()               // 页面加载时获取大棚数据
        this.devideData()                 // 获取设备数据
    },
    methods: {
        // 获取设备列表数据
        devideData() {
            this.$http.get("/dev-api/device/listAll").then(res => {
                this.deviceOptions = res.data.data
            })
        },

        // 计算今日平均温度和湿度
        calculateTodayAverages(pastureId, sensorData) {
            // 如果没有传感器数据，设置默认值
            if (!sensorData || !Array.isArray(sensorData) || sensorData.length === 0) {
                this.$set(this.todayAverages, pastureId, {
                    temperature: '/',
                    humidity: '/'
                });
                return;
            }
            
            // 获取今天的日期字符串
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            
            // 过滤出今天的数据
            const todayData = sensorData.filter(item => item.date === todayStr);
            
            // 如果有今天的数据，计算平均值
            if (todayData.length > 0) {
                const avgTemp = todayData.reduce((sum, item) => sum + parseFloat(item.temperature || 0), 0) / todayData.length;
                const avgHumidity = todayData.reduce((sum, item) => sum + parseFloat(item.humidity || 0), 0) / todayData.length;
                
                // 更新平均值
                this.$set(this.todayAverages, pastureId, {
                    temperature: avgTemp.toFixed(1),
                    humidity: avgHumidity.toFixed(1)
                });
            } else {
                // 如果没有今天的数据，设置默认值
                this.$set(this.todayAverages, pastureId, {
                    temperature: '/',
                    humidity: '/'
                });
            }
        },

        // 获取大棚列表数据
        getHouseData(val) {
            this.$http.post("/dev-api/iaPasture/page", {
                currentPage: this.currentPage,
                pageSize: this.pSize,
                keyword: val
            }).then(res => {
                this.houseData = res.data.data.records;
                this.totalPage = res.data.data.total;
                
                // 遍历每个大棚获取传感器数据
                this.houseData.forEach(house => {
                    getValueByPastureId(house.id).then(res => {
                        this.sensorData[house.id] = res || [];
                        this.calculateTodayAverages(house.id, res || []);
                        if (house === this.houseData[0]) {
                            this.statusData = res || [];
                        }
                    }).catch(() => {
                        this.calculateTodayAverages(house.id, []);
                    });
                });
            });
        },

        // 搜索大棚
        houseSearch() {
            this.getHouseData(this.mcName)
        },

        // 重置搜索条件
        resetName() {
            this.mcName = ""              // 清空搜索框
            this.getHouseData()           // 重新获取数据
        },

        // 处理每页显示数量变化
        handleSizeChange(val) {
            this.pSize = val
        },

        // 处理页码变化
        handleCurrentChange(val) {
            this.currentPage = val
            this.getHouseData()           // 重新获取数据
        },

        // 新增或编辑大棚
        addHouse(n) {
            if (n) {
                // 编辑模式
                this.btnTxt = 1
                // 获取大棚详情
                this.$http.post("/dev-api/iaPasture/detail?id=" + n).then(res => {
                    this.houseDoForm = res.data.data
                    // 获取该大棚的传感器数据
                    getValueByPastureId(n).then(response => {
                        this.sensorData = response.data;
                    }).catch(error => {
                        console.error('获取传感器数据失败:', error);
                    });
                })
                this.plantDetail(n)
            } else {
                // 新增模式
                this.houseDoForm = {
                    deviceId: '',
                    name: '',
                    address: '',
                    bigBreedingQuantity: '',
                    area: '',
                    description: ''
                },
                this.btnTxt = 0
            }
            this.houseEditDialog = true    // 显示弹窗
        },

        // 查看大棚详情
        houseDetail(id) {
            this.houseEditDialog = true;   // 显示弹窗
            this.btnTxt = 2;              // 设置为详情模式
            this.plantDetail(id)          // 获取详情数据
        },

        // 获取大棚详细信息
        plantDetail(n) {
            this.$http.post("/dev-api/iaPasture/detail?id=" + n).then(res => {
                this.houseDoForm = res.data.data;
                const dvId = res.data.data.devices;
                // 如果有绑定设备，设置设备名称
                if (dvId.length) {
                    this.sbId = dvId[0].id
                    this.deviceOptions.forEach(item => {
                        if (item.id == dvId[0].id) {
                            this.houseDoForm.deviceId = item.deviceName
                        }
                    })
                }
            })
        },

        // 状态列表每页数量变化处理
        sSizeChange(n) {
            this.spSize = n
        },

        // 状态列表页码变化处理
        sCurrentChange(n) {
            this.scurrentPage = n
            this.houseCheck(this.checkId)
        },

        // 处理环境数据，添加排序和分页
        handleStatusData(data) {
            // 深拷贝数据防止影响原数据
            this.originalStatusData = JSON.parse(JSON.stringify(data || []));
            
            // 按日期时间排序（升序）
            this.originalStatusData.sort((a, b) => {
                const timeA = `${a.date} ${a.time}`;
                const timeB = `${b.date} ${b.time}`;
                return new Date(timeA) - new Date(timeB);
            });
            
            // 更新总条数
            this.statusPagination.total = this.originalStatusData.length;
            
            // 更新当前页数据
            this.updateStatusPageData();
        },
        
        // 更新当前页数据
        updateStatusPageData() {
            const start = (this.statusPagination.currentPage - 1) * this.statusPagination.pageSize;
            const end = start + this.statusPagination.pageSize;
            this.statusData = this.originalStatusData.slice(start, end);
        },
        
        // 处理页码改变
        handleStatusCurrentChange(currentPage) {
            this.statusPagination.currentPage = currentPage;
            this.updateStatusPageData();
        },
        
        // 处理每页条数改变
        handleStatusSizeChange(pageSize) {
            this.statusPagination.pageSize = pageSize;
            this.statusPagination.currentPage = 1; // 重置到第一页
            this.updateStatusPageData();
        },
        
        // 修改查看大棚环境状态的方法
        houseCheck(n) {
            this.checkId = n;
            this.houseStatusDialog = true;
            // 使用已缓存的传感器数据并处理
            this.handleStatusData(this.sensorData[n]);
        },

        // 删除大棚
        deleteData(id) {
            this.$confirm('确定要删除该条数据吗?', '删除', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // 发送删除请求
                this.$http.post("/dev-api/iaPasture/delete?id=" + id).then(res => {
                    if (res.data.code == 0) {
                        this.getHouseData()    // 重新获取列表数据
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        });
                    }
                })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },

        // 弹框确定按钮处理
        houseDoBtn() {
            if (this.btnTxt == 0) {
                // 新增大棚
                this.$http.post("/dev-api/iaPasture/create", this.houseDoForm).then(res => {
                    if (res.data.code == 0) {
                        this.$message.success("数据新增成功");
                        this.houseEditDialog = false;
                        this.getHouseData()
                    } else {
                        this.$message.error(res.data.msg);
                    }
                })
            } else if (this.btnTxt == 1) {
                // 编辑大棚
                this.deviceOptions.forEach(item => {
                    if (item.id == this.sbId) {
                        this.houseDoForm.deviceId = item.id
                    }
                })
                this.$http.post("/dev-api/iaPasture/update", this.houseDoForm).then(res => {
                    if (res.data.code == 0) {
                        this.$message.success("数据修改成功");
                        this.houseEditDialog = false;
                        this.getHouseData()
                    }
                })
            } else {
                // 详情模式直接关闭
                this.houseEditDialog = false;
            }
        },

        // 状态页面搜索
        statusSearch() {
            this.houseCheck(this.checkId, this.stateContent)
        },

        // 获取指定大棚的今日平均值
        getTodayAverage(pastureId) {
            return this.todayAverages[pastureId] || { temperature: '/', humidity: '/' };
        },

        // 搜索按钮操作
        handleQuery() {
            this.queryParams.pageNum = 1;  // 重置页码
            this.getHouseData();           // 重新获取数据
        },
        
        // 重置按钮操作
        resetQuery() {
            this.resetForm("queryForm");    // 重置表单
            this.handleQuery();            // 重新查询
        },

        // 查看大棚详情
        viewHouseDetail(houseId) {
            // 获取大棚传感器数据
            getValueByPastureId(houseId).then(res => {
                this.statusData = res || [];
            }).catch(() => {
                this.statusData = [];
            });
        }
    }
}
</script>

<style lang="scss" scoped>
.app-container-sm {
    padding: 20px;
    background-color: #f0f2f5;
}

.search-card {
    margin-bottom: 20px;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    
    .search-form {
        display: flex;
        align-items: center;
        
        .search-input {
            width: 240px;
            .el-input__inner {
                border-radius: 8px;
            }
        }
        
        .el-button {
            border-radius: 8px;
            padding: 8px 16px;
            transition: all 0.3s;
            
            &:hover {
                transform: translateY(-1px);
            }
        }
        
        .fr {
            margin-left: auto;
        }
    }
}

.device-card {
    border-radius: 12px;
    box-shadow: none;
    background: #ffffff;
    border: none;
    
    .greenhouse-grid {
        margin: -12px;
        padding: 12px;
    }
    
    .greenhouse-card {
        background: #ffffff;
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 24px;
        transition: all 0.3s ease;
        border: 1px solid #ebeef5;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
        
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            
            .greenhouse-name {
                font-size: 18px;
                font-weight: 600;
                color: #333;
                transition: color 0.3s ease;
            }
            
            .header-actions {
                display: flex;
                gap: 8px;
                
                .el-button {
                    padding: 6px 12px;
                    height: 32px;
                    border-radius: 8px;
                    margin: 0;
                    transition: all 0.3s ease;
                    box-shadow: 
                        5px 5px 10px rgba(163, 177, 198, 0.4),
                        -5px -5px 10px rgba(255, 255, 255, 0.7);
                    
                    &.el-button--primary {
                        background-color: #f2f6fc;
                        border-color: transparent;
                        color: #409eff;
                        
                        &:hover {
                            transform: translateY(-2px);
                            box-shadow: 
                                8px 8px 15px rgba(163, 177, 198, 0.5),
                                -8px -8px 15px rgba(255, 255, 255, 0.8);
                        }
                        
                        &:active {
                            transform: translateY(0);
                            box-shadow: inset 
                                4px 4px 8px rgba(163, 177, 198, 0.4),
                                inset -4px -4px 8px rgba(255, 255, 255, 0.7);
                        }
                    }
                    
                    &.el-button--danger {
                        background-color: #fef0f0;
                        border-color: transparent;
                        color: #f56c6c;
                        
                        &:hover {
                            transform: translateY(-2px);
                            box-shadow: 
                                8px 8px 15px rgba(163, 177, 198, 0.5),
                                -8px -8px 15px rgba(255, 255, 255, 0.8);
                        }
                        
                        &:active {
                            transform: translateY(0);
                            box-shadow: inset 
                                4px 4px 8px rgba(163, 177, 198, 0.4),
                                inset -4px -4px 8px rgba(255, 255, 255, 0.7);
                        }
                    }
                }
            }
        }
        
        .card-content {
            .info-item {
                display: flex;
                align-items: center;
                margin-bottom: 12px;
                
                i {
                    font-size: 16px;
                    color: #007AFF;
                    margin-right: 8px;
                }
                
                .label {
                    color: #666;
                    width: 100px;
                    font-size: 14px;
                }
                
                .value {
                    color: #333;
                    flex: 1;
                    font-size: 14px;
                }
            }
        }
        
        .card-footer {
            margin-top: 20px;
            display: flex;
            justify-content: flex-end;
            
            .el-button {
                transition: all 0.3s ease;
                border-radius: 8px;
                box-shadow: 
                    5px 5px 10px rgba(163, 177, 198, 0.4),
                    -5px -5px 10px rgba(255, 255, 255, 0.7);
                
                &.el-button--warning {
                    background-color: #fdf6ec;
                    border-color: transparent;
                    color: #e6a23c;
                    
                    &:hover {
                        transform: translateY(-2px);
                        box-shadow: 
                            8px 8px 15px rgba(163, 177, 198, 0.5),
                            -8px -8px 15px rgba(255, 255, 255, 0.8);
                    }
                    
                    &:active {
                        transform: translateY(0);
                        box-shadow: inset 
                            4px 4px 8px rgba(163, 177, 198, 0.4),
                            inset -4px -4px 8px rgba(255, 255, 255, 0.7);
                    }
                }
            }
        }
    }
}

.pagination-container {
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
}

.status-content {
    padding: 10px;
}
</style>
