<template>
    <!--
     养殖棚管理页面
    -->
    <div class="list-content">
        <el-card class="card-margin-bottom">
            <div class="form-top">
                <el-form :inline="true" class="form-minus-bottom">
                    <el-form-item label="鱼池名称">
                        <el-input v-model="mcName" placeholder="请输入名称" size="small" class="inpname"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-search" size="mini" @click="houseSearch">搜索</el-button>
                        <el-button icon="el-icon-refresh" size="mini" @click="resetName">重置</el-button>
                    </el-form-item>
                </el-form>
                <div>
                    <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="addHouse()">新增</el-button>
                </div>
            </div>
        </el-card>
        <div class="plant-table">
            <el-row :gutter="20">
                <el-col :span="12" v-for="(item, index) in houseData" :key="index">
                    <el-card class="house-card" shadow="hover">
                        <div class="house-header">
                            <span class="house-title">{{ item.name }}</span>
                            <div class="house-actions">
                                <el-button size="mini" type="primary" icon="el-icon-edit"
                                    @click="addHouse(item.id)"
                                    v-hasPermi="['agriculture:batch:edit']">修改</el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete"
                                    @click="deleteData(item.id)"
                                    v-hasPermi="['agriculture:batch:remove']">删除</el-button>
                            </div>
                        </div>
                        <div class="house-content">
                            <div class="info-item">
                                <i class="el-icon-link icon"></i>
                                <span class="label">合约地址</span>
                                <span class="value">{{ item.contractAddr || '/' }}</span>
                            </div>
                            <div class="info-item">
                                <i class="el-icon-full-screen icon"></i>
                                <span class="label">面积</span>
                                <span class="value">{{ item.area ? item.area: '/' }}</span>
                            </div>
                            <div class="info-item">
                                <i class="el-icon-sunny icon"></i>
                                <span class="label">温度</span>
                                <span class="value">{{ item.temperature ? item.temperature + '℃' : '/' }}</span>
                            </div>
                            <div class="info-item">
                                <svg-icon icon-class="PH值" class="icon" />
                                <span class="label">PH值</span>
                                <span class="value">{{ item.phValue ? item.phValue + ' pH' : '/' }}</span>
                            </div>
                            <div class="info-item">
                                <svg-icon icon-class="含氧量" class="icon" />
                                <span class="label">含氧量</span>
                                <span class="value">{{ item.dissolvedOxygen ? item.dissolvedOxygen + ' mg/L' : '/' }}</span>
                            </div>
                            <div class="info-item">
                                <svg-icon icon-class="氨氮" class="icon" />
                                <span class="label">氨氮含量</span>
                                <span class="value">{{ item.nitrogen ? item.nitrogen + ' mg/L' : '/' }}</span>
                            </div>
                            <div class="info-item">
                                <svg-icon icon-class="亚硝酸盐" class="icon" />
                                <span class="label">亚硝酸盐</span>
                                <span class="value">{{ item.nitriteNitrogen ? item.nitriteNitrogen + ' mg/L' : '/' }}</span>
                            </div>
                            <div class="info-item">
                                <i class="el-icon-data-line icon"></i>
                                <span class="label">最大区分数量</span>
                                <span class="value">{{ item.bigBreedingQuantity || '/' }}</span>
                            </div>
                            <div class="info-item">
                                <i class="el-icon-location icon"></i>
                                <span class="label">位置</span>
                                <span class="value">{{ item.address || '/' }}</span>
                            </div>
                        </div>
                        <div class="house-footer">
                            <el-button size="small" plain type="warning" icon="el-icon-s-claim"
                                @click="houseCheck(item.id)"
                                v-hasPermi="['agriculture:batch:edit']">环境详情</el-button>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            <div class="page-block">
                <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                    :current-page="currentPage" :page-size="pSize" layout="total, prev, pager, next, jumper"
                    :total="totalPage">
                </el-pagination>
            </div>
        </div>
        <!-- 新增/修改弹框 -->
        <el-dialog :title="btnTxt == 1 ? '编辑' : btnTxt == 2 ? '详情' : '新增'" :visible.sync="houseEditDialog" width="40%">
            <el-form :model="houseDoForm" 
                     :rules="rules" 
                     ref="houseForm" 
                     label-width="120px">
                <el-form-item label="鱼池名称" prop="name">
                    <el-input v-model="houseDoForm.name" 
                             placeholder="请输入名称"
                             :disabled="btnTxt == 2 ? true : false">
                    </el-input>
                </el-form-item>
                <el-form-item label="鱼池面积" prop="area">
                    <el-input v-model="houseDoForm.area" 
                             placeholder="请输入鱼池面积"
                             :disabled="btnTxt == 2 ? true : false">
                    </el-input>
                </el-form-item>
                <el-form-item label="最大分区数量" prop="bigBreedingQuantity">
                    <el-input v-model="houseDoForm.bigBreedingQuantity" 
                             placeholder="最大分区数量"
                             :disabled="btnTxt == 2 ? true : false">
                    </el-input>
                </el-form-item>
                <el-form-item label="鱼池位置" prop="address">
                    <el-input v-model="houseDoForm.address" 
                             placeholder="请输入鱼池位置"
                             :disabled="btnTxt == 2 ? true : false">
                    </el-input>
                </el-form-item>
                <el-form-item label="绑定设备" prop="deviceId">
                    <el-input v-if="btnTxt == 2" 
                             v-model="houseDoForm.deviceId" 
                             :disabled="true">
                    </el-input>
                    <el-select v-else
                              v-model="houseDoForm.deviceId" 
                              placeholder="请选择" 
                              size="small">
                        <el-option v-for="item in deviceOptions" 
                                  :key="item.id" 
                                  :label="item.deviceName"
                                  :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="备注信息" prop="description">
                    <el-input type="textarea" 
                             :disabled="btnTxt == 2 ? true : false" 
                             v-model="houseDoForm.description"
                             :rows="3" 
                             placeholder="请输入备注信息">
                    </el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click="closeDialog">关闭</el-button>
                <el-button type="success" size="small" @click="submitForm('houseForm')">确认</el-button>
            </div>
        </el-dialog>
        <!-- 鱼池状态抽屉页面 -->
        <el-dialog title="鱼池状态抽屉" :visible.sync="houseStatusDialog" width="50%">
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
                    <!-- <el-table-column prop="humidity" label="湿度"> </el-table-column> -->
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
                // 表单验证规则
                rules: {
                    name: [
                        { required: true, message: '鱼池名称不能为空', trigger: 'blur' }
                    ],
                    area: [
                        { required: true, message: '鱼池面积不能为空', trigger: 'blur' }
                        // { pattern: /^[0-9]*$/, message: '请输入数字', trigger: 'blur' }
                    ],
                    bigBreedingQuantity: [
                        { required: true, message: '最大分区数量不能为空', trigger: 'blur' },
                        { pattern: /^[0-9]*$/, message: '请输入数字', trigger: 'blur' }
                    ],
                    address: [
                        { required: true, message: '鱼池位置不能为空', trigger: 'blur' }
                    ],
                    deviceId: [
                        { required: true, message: '请选择绑定设备', trigger: 'change' }
                    ]
                }
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
                this.$http.post("/dev-api/fishPasture/page", {
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
                    this.$http.post("/dev-api/fishPasture/detail?id=" + n).then(res => {
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
                this.$http.post("/dev-api/fishPasture/detail?id=" + n).then(res => {
                    console.log(res)
                    this.houseDoForm = res.data.data;
                    const dvId = res.data.data.devices;
                    if (dvId && dvId.length) {
                        this.houseDoForm.deviceId = dvId[0].id;  // 直接设置为设备ID而不是设备名称
                        this.sbId = dvId[0].id;
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
                this.$http.post("/dev-api/fishPasture/ivPastureSensorValuePage", {
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
                    this.$http.post("/dev-api/fishPasture/delete?id=" + id).then(res => {
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
            closeDialog() {
                this.$refs['houseForm'].resetFields();
                this.houseEditDialog = false;
            },
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        if (this.btnTxt == 0) {
                            // 新增
                            this.$http.post("/dev-api/fishPasture/create", this.houseDoForm).then(res => {
                                if (res.data.code == 0) {
                                    this.$message.success("数据新增成功");
                                    this.closeDialog();
                                    this.getHouseData();
                                } else {
                                    this.$message.error(res.data.msg);
                                }
                            })
                        } else if (this.btnTxt == 1) {
                            // 编辑
                            this.$http.post("/dev-api/fishPasture/update", this.houseDoForm).then(res => {
                                if (res.data.code == 0) {
                                    this.$message.success("数据修改成功");
                                    this.closeDialog();
                                    this.getHouseData();
                                } else {
                                    this.$message.error(res.data.msg);
                                }
                            })
                        }
                    } else {
                        return false;
                    }
                });
            },
            // 抽屉页面搜索
            statusSearch() {
                this.houseCheck(this.checkId, this.stateContent)
            },
        }
    }
</script>

<style lang="scss" scoped>
.list-content {
    padding: 20px;
    background-color: #f0f2f5;
}

.card-margin-bottom {
    margin-bottom: 20px;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
}

.house-card {
    background: #f0f2f5;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 24px;
    transition: all 0.3s ease;
    border: none;
    box-shadow: 
        8px 8px 15px rgba(163, 177, 198, 0.6),
        -8px -8px 15px rgba(255, 255, 255, 0.9);
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 
            12px 12px 20px rgba(163, 177, 198, 0.7),
            -12px -12px 20px rgba(255, 255, 255, 1);
    }
    
    .house-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        
        .house-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
        }
        
        .house-actions {
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
                }
            }
        }
    }
    
    .house-content {
        .info-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            
            .icon {
                font-size: 16px;
                color: #007AFF;
                margin-right: 8px;
                width: 16px;
                height: 16px;
                flex-shrink: 0;
                transition: all 0.3s ease;
                
                &:hover {
                    transform: scale(1.1);
                }
            }
            
            .label {
                color: #666;
                width: 100px;
                font-size: 14px;
                margin-right: 8px;
                flex-shrink: 0;
            }
            
            .value {
                color: #333;
                flex: 1;
                font-size: 14px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }
    
    .house-footer {
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
            }
        }
    }
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
    // height: 100px;
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

    // height: 100%;
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

// 更新图标样式，使用本地SVG文件
.icon-ph {
    background: url('~@/assets/icons/svg/PH值.svg') no-repeat center;
    display: inline-block;
    width: 16px;
    height: 16px;
}

.icon-oxygen {
    background: url('~@/assets/icons/svg/含氧量.svg') no-repeat center;
    display: inline-block;
    width: 16px;
    height: 16px;
}

.icon-ammonia {
    background: url('~@/assets/icons/svg/氨氮.svg') no-repeat center;
    display: inline-block;
    width: 16px;
    height: 16px;
}

.icon-nitrite {
    background: url('~@/assets/icons/svg/亚硝酸盐.svg') no-repeat center;
    display: inline-block;
    width: 16px;
    height: 16px;
}
</style>
