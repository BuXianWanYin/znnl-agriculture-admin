<!-- 大棚页面 -->
<template>
    <div class="app-container-sm">
        <el-card class="search-card">
            <el-form :inline="true" class="search-form">
                <el-form-item label="大棚名称">
                    <el-input v-model="mcName" placeholder="请输入名称" size="small" class="search-input"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" size="small" @click="houseSearch">搜索</el-button>
                    <el-button icon="el-icon-refresh" size="small" @click="resetName">重置</el-button>
                </el-form-item>
                <el-form-item class="fr">
                    <el-button type="primary" plain icon="el-icon-plus" size="small" @click="addHouse()">新增</el-button>
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
                                    <el-button size="mini" type="primary" icon="el-icon-edit"
                                        @click="addHouse(item.id)"
                                        v-hasPermi="['agriculture:batch:edit']">修改</el-button>
                                    <el-button size="mini" type="danger" icon="el-icon-delete"
                                        @click="deleteData(item.id)"
                                        v-hasPermi="['agriculture:batch:remove']">删除</el-button>
                                </div>
                            </div>
                            <div class="card-content">
                                <div class="info-item">
                                    <i class="el-icon-link"></i>
                                    <span class="label">合约地址</span>
                                    <span class="value">{{ item.contractAddr }}</span>
                                </div>
                                <div class="info-item">
                                    <i class="el-icon-full-screen"></i>
                                    <span class="label">面积</span>
                                    <span class="value">{{ item.area }}</span>
                                </div>
                                <div class="info-item">
                                    <i class="el-icon-data-line"></i>
                                    <span class="label">最大区分数量</span>
                                    <span class="value">{{ item.bigBreedingQuantity }}</span>
                                </div>
                                <div class="info-item">
                                    <i class="el-icon-sunny"></i>
                                    <span class="label">温度</span>
                                    <span class="value">{{ item.temperature || '/' }}</span>
                                </div>
                                <div class="info-item">
                                    <i class="el-icon-umbrella"></i>
                                    <span class="label">湿度</span>
                                    <span class="value">{{ item.humidity || '/' }}</span>
                                </div>
                                <div class="info-item">
                                    <i class="el-icon-location"></i>
                                    <span class="label">位置</span>
                                    <span class="value">{{ item.address }}</span>
                                </div>
                            </div>
                            <div class="card-footer">
                                <el-button size="small" type="warning" plain icon="el-icon-s-claim"
                                    @click="houseCheck(item.id)"
                                    v-hasPermi="['agriculture:batch:edit']">环境详情</el-button>
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
        <el-dialog title="大棚状态抽屉" :visible.sync="houseStatusDialog" width="50%">
            <div class="status-content">
                <el-form :inline="true" class="demo-form-inline">
                    <el-form-item label="请搜索">
                        <el-input v-model="stateContent" placeholder="请搜索">
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="success" size="mini" @click="statusSearch">&nbsp;查询&nbsp;</el-button>
                    </el-form-item>
                </el-form>
                <el-table :data="statusData" :stripe="true" tooltip-effect="dark" border size="mini" style="width: 100%"
                    :header-cell-style="{ background: 'rgba(239, 249, 243, 1)', color: '#000' }">
                    <el-table-column prop="id" label="ID"> </el-table-column>
                    <el-table-column prop="airquality" label="空气质量"> </el-table-column>
                    <el-table-column prop="temperature" label="温度"> </el-table-column>
                    <el-table-column prop="humidity" label="湿度"> </el-table-column>
                    <el-table-column prop="pressure" label="气压"> </el-table-column>
                    <el-table-column prop="dateTime" label="记录日期"> </el-table-column>
                </el-table>
                <div class="page-block">
                    <el-pagination @size-change="sSizeChange" @current-change="sCurrentChange"
                        :current-page="scurrentPage" :page-size="spSize" layout="total, prev, pager, next, jumper"
                        :total="stotal">
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
    export default {
        data() {
            return {
                btnTxt: 0,
                houseStatusDialog: false,
                houseEditDialog: false,
                mcName: '',
                currentPage: 1,
                totalPage: 0,
                pSize: 10,
                houseData: [],
                // 设备选择
                deviceOptions: [],
                typeVal: '',
                statusData: [],
                // 状态弹框列表
                stotal: 0,
                scurrentPage: 1,
                spSize: 10,
                checkId: 0,
                stateContent: '',
                houseDoForm: {
                    deviceId: '',
                    name: '',
                    address: '',
                    // breedingQuantity:0,
                    bigBreedingQuantity: '',
                    area: '',
                    description: ''
                },
                sbId: '',
            }
        },
        mounted() {
            this.getHouseData()
            this.devideData()
        },
        methods: {
            devideData() {
                this.$http.get("/dev-api/device/listAll").then(res => {
                    console.log(res)
                    this.deviceOptions = res.data.data
                })
            },
            getHouseData(val) {
                this.$http.post("/dev-api/iaPasture/page", {
                    currentPage: this.currentPage,
                    pageSize: this.pSize,
                    keyword: val
                }).then(res => {
                    console.log(res)
                    this.houseData = res.data.data.records
                    this.totalPage = res.data.data.total
                })
            },
            houseSearch() {
                this.getHouseData(this.mcName)
            },
            resetName() {
                this.mcName = ""
                this.getHouseData()
            },
            handleSizeChange(val) {
                this.pSize = val
                console.log(`每页 ${val} 条`);
            },
            handleCurrentChange(val) {
                this.currentPage = val
                console.log(`当前页: ${val}`);
                this.getHouseData()
            },
            // 新增按钮显示弹框
            addHouse(n) {
                if (n) {
                    console.log("编辑")
                    this.btnTxt = 1
                    this.$http.post("/dev-api/iaPasture/detail?id=" + n).then(res => {
                        console.log(res)
                        this.houseDoForm = res.data.data
                    })
                    this.plantDetail(n)
                } else {
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
                this.houseEditDialog = true
            },
            //   详情
            houseDetail(id) {
                this.houseEditDialog = true;
                this.btnTxt = 2;
                this.plantDetail(id)
            },
            plantDetail(n) {
                this.$http.post("/dev-api/iaPasture/detail?id=" + n).then(res => {
                    console.log(res)
                    this.houseDoForm = res.data.data;
                    const dvId = res.data.data.devices;
                    if (dvId.length) {
                        this.sbId = dvId[0].id
                        this.deviceOptions.forEach(item => {
                            if (item.id == dvId[0].id) {
                                console.log("详情id", res.data.data.id)
                                this.houseDoForm.deviceId = item.deviceName
                            }
                        })
                    }

                })
            },
            // 查看列表分页
            sSizeChange(n) {
                this.spSize = n
            },
            sCurrentChange(n) {
                this.scurrentPage = n
                this.houseCheck(this.checkId)
            },
            houseCheck(n, val) {
                this.checkId = n
                this.houseStatusDialog = true
                this.$http.post("/dev-api/iaPasture/ivPastureSensorValuePage", {
                    currentPage: this.scurrentPage,
                    keyword: this.mcName,
                    pageSize: this.spSize,
                    pastureId: n,
                    keyword: val
                }).then(res => {
                    console.log(res)
                    this.statusData = res.data.data.records;
                    this.stotal = res.data.data.total
                })
            },
            deleteData(id) {
                this.$confirm('确定要删除该条数据吗?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$http.post("/dev-api/iaPasture/delete?id=" + id).then(res => {
                        // console.log(res)
                        if (res.data.code == 0) {
                            this.getHouseData()
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
            //   弹框确定按钮
            houseDoBtn() {
                if (this.btnTxt == 0) {
                    this.$http.post("/dev-api/iaPasture/create", this.houseDoForm).then(res => {
                        console.log(res)
                        if (res.data.code == 0) {
                            this.$message.success("数据新增成功");
                            this.houseEditDialog = false;
                            this.getHouseData()
                        } else {
                            this.$message.error(res.data.msg);
                        }
                    })
                } else if (this.btnTxt == 1) {
                    console.log("确认编辑")
                    this.deviceOptions.forEach(item => {
                        if (item.id == this.sbId) {
                            this.houseDoForm.deviceId = item.id
                        }
                    })
                    this.$http.post("/dev-api/iaPasture/update", this.houseDoForm).then(res => {
                        console.log(res)
                        if (res.data.code == 0) {
                            this.$message.success("数据修改成功");
                            this.houseEditDialog = false;
                            this.getHouseData()
                        }
                    })
                } else {
                    this.houseEditDialog = false;
                }


            },
            // 抽屉页面搜索
            statusSearch() {
                this.houseCheck(this.checkId, this.stateContent)
            },
        }
    }
</script>

<style lang="scss" scoped>
.app-container-sm {
    padding: 20px;
    background-color: #f5f7fa;
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
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    
    .greenhouse-grid {
        margin: -12px;
        padding: 12px;
    }
    
    .greenhouse-card {
        background: white;
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 24px;
        transition: all 0.3s ease;
        border: 1px solid rgba(0, 0, 0, 0.05);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        
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
                opacity: 0;
                transition: opacity 0.3s ease;
                
                .el-button {
                    padding: 6px 12px;
                    height: 32px;
                    border-radius: 4px;
                    margin: 0;
                    
                    &.el-button--primary {
                        background-color: #f2f6fc;
                        border-color: transparent;
                        color: #409eff;
                        
                        &:hover {
                            background-color: #ecf5ff;
                        }
                    }
                    
                    &.el-button--danger {
                        background-color: #fef0f0;
                        border-color: transparent;
                        color: #f56c6c;
                        
                        &:hover {
                            background-color: #ffeded;
                        }
                    }
                }
            }
        }
        
        &:hover {
            background: rgba(250, 250, 250, 0.95);
            
            .card-header {
                .greenhouse-name {
                    color: #007AFF;
                }
                
                .header-actions {
                    opacity: 1;
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
                
                &:hover {
                    transform: scale(1.05);
                }
            }
        }
    }
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

.form-top {
    margin: 10px 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .demo-form-inline {
        height: 50px;
    }

    .inpname {
        width: 240px;
    }
}

.plant-do {
    margin-left: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .do-right {
        width: 40%;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .desc-item {
            display: flex;
            align-items: center;
            font-size: 14px;

            p {
                margin-right: 10px;
            }

            ul {
                font-size: 12px;
                display: flex;

                .dot {
                    width: 10px;
                    height: 10px;
                }

                li {
                    height: 20px;
                    display: flex;
                    align-items: center;
                    margin-right: 8px;
                    width: 50px;

                    &:first-child {
                        color: #FA7C01;

                    }

                    &:nth-child(2) {
                        color: #0CBF5B;
                    }

                    &:nth-child(3) {
                        color: #019FE8;
                    }
                }
            }
        }
    }
}

.plant-table {
    margin: 10px;
}

.table-content {
    .dp-name {
        color: #0CBF5B;
    }

    .do-text {
        font-size: 12px;
    }

    .txt-btn {
        font-size: 12px;
        margin: 0 5px;
    }
}

.page-block {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
}

.house-card {
    margin-bottom: 20px;
    
    .house-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        
        .house-title {
            font-size: 16px;
            font-weight: bold;
            color: #303133;
        }
    }
    
    .house-content {
        .info-item {
            margin-bottom: 8px;
            display: flex;
            
            .label {
                color: #909399;
                width: 150px;
                flex-shrink: 0;
                white-space: nowrap;
            }
            
            .value {
                color: #606266;
                flex: 1;
                word-break: break-all;
            }
        }
    }
    
    .house-footer {
        margin-top: 15px;
        text-align: right;
    }
}
</style>
