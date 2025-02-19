<template>
    <div class="app-container-sm">

        <el-card class="card-margin-bottom">
            <el-form :inline="true" class="demo-form-inline">
                <el-form-item label="ID">
                    <el-input v-model="searchForm.id" placeholder="请输入ID" size="small"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" size="mini" @click="equipmentSearch">搜索</el-button>
                    <el-button icon="el-icon-refresh" size="mini" @click="equipmentReset">重置</el-button>
                </el-form-item>
                <el-form-item class="fr">
                    <el-button type="primary" plain icon="el-icon-plus" size="mini"
                        @click="equipmentEditAdd('新增')">新增</el-button>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="card-padding-bottom">
            <div class="equipment-grid">
                <el-row :gutter="20">
                    <el-col :span="8" v-for="(item, index) in equipmentData" :key="item.id">
                        <el-card class="equipment-card" shadow="hover">
                            <div class="card-header">
                                <span class="device-name">{{ item.deviceName }}</span>
                                <el-tag :type="item.status == 0 ? 'danger' : 'success'" size="small">
                                    {{ item.status == 0 ? '不在线' : '在线' }}
                                </el-tag>
                            </div>
                            <div class="card-content">
                                <div class="info-item">
                                    <i class="el-icon-cpu"></i>
                                    <span class="label">设备ID:</span>
                                    <span class="value">{{ item.id }}</span>
                                </div>
                                <div class="info-item">
                                    <i class="el-icon-link"></i>
                                    <span class="label">合约地址:</span>   
                                    <span class="value">{{ item.address }}</span>
                                </div>
                                <div class="info-item">
                                    <i class="el-icon-notebook-2"></i>
                                    <span class="label">备注:</span>
                                    <span class="value">{{ item.remark || '/' }}</span>
                                </div>
                            </div>
                            <div class="card-footer">
                                <el-button 
                                    size="small" 
                                    type="danger" 
                                    icon="el-icon-delete"
                                    @click="deleteData(item.id)"
                                    v-hasPermi="['agriculture:materialType:remove']">
                                    删除
                                </el-button>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
            <pagination 
                v-show="total>0" 
                :total="total" 
                :page.sync="pager.page"
                :limit.sync="pager.pages" 
                @pagination="handleCurrentChange" 
            />
        </el-card>
        <!-- 添加或修改农资类别对话 框 -->
        <!-- 新增/修改弹框 -->
        <el-dialog :title="dialogTitle" :visible.sync="equipmentEditDialog" width="30%">
            <el-form :model="equipmentForm" ref="equipmentForm" :rules="rules" label-width="120px">
                <el-form-item label="设备ID" prop="deviceId">
                    <el-input v-model="equipmentForm.deviceId" required placeholder="请输入设备ID"
                        class="manureInput"></el-input>
                </el-form-item>
                <el-form-item label="设备名称" prop="deviceName">
                    <el-input v-model="equipmentForm.deviceName" required placeholder="请输入设备名称"
                        class="manureInput"></el-input>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input type="textarea" v-model="equipmentForm.remark" :rows="3" class="manureInput"
                        placeholder="请输入备注信息"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click="equipmentEditDialog = false">关闭</el-button>
                <el-button type="success" size="small" @click="equipmentDoBtn">保存</el-button>
            </div>
        </el-dialog>
    </div>

</template>

<script>
    import http from "@/utils/request";

    export default {
        data() {
            return {
                equipmentForm: {
                    deviceId: "",
                    deviceName: "",
                    remark: "",
                    status: ""
                },
                rules: {
                    deviceId: [{
                        required: true,
                        message: '设备id不能为空',
                        trigger: 'blur'
                    }],
                    deviceName: [{
                        required: true,
                        message: '设备名称不能为空',
                        trigger: 'blur'
                    }],
                },
                equipmentEditDialog: false,

                dialogTitle: '新增', // 新增/修改
                searchForm: {
                    state: '',
                    id: ''
                },
                pager: {
                    pageSize: 10,
                    page: 1,
                    pages: 1,
                },
                total:null,
                equipmentData: [],
            }
        },
        async created() {
            await this.getListData()
        },
        methods: {
            async getListData() {
                try {
                    const {
                        data
                    } = await http.get('/device/list', {
                        params: {
                            ...this.pager,
                            ...this.searchForm
                        }
                    })
                    this.equipmentData = data.records
                    this.pager = {
                        page: data.current,
                        pageSize: data.size,
                        pages: data.pages,
                    }
                    this.total=data.total
                } catch (e) {
                    this.$message.error('网络错误请重试！');
                }
            },
            async equipmentSearch() {
                await this.getListData()
            },
            async equipmentReset() {
                this.searchForm = {
                    state: '',
                    id: ''
                }
                await this.getListData()
            },
            async handleCurrentChange(val) {
                this.pager.page = val;
                await this.getListData()
            },
            // 新增按钮显示弹框
            equipmentEditAdd(title) {
                this.dialogTitle = title
                // 新增重置
                this.equipmentForm = {
                    deviceId: '',
                    deviceName: "",
                    remark: "",
                    status: ""
                }
                this.equipmentEditDialog = true
            },
            //   弹框确定按钮
            equipmentDoBtn() {
                this.$refs.equipmentForm.validate((valid) => {
                    if (valid) {
                        http.post('/device/add', {
                            ...this.equipmentForm
                        }).then(res => {
                            this.getListData()
                            this.equipmentEditDialog = false
                        }).catch(err => {
                            this.$message.error('网络错误请重试！');
                        })
                    } else {
                        return false
                    }
                })
            },
            deleteData(id) {
                this.$confirm('确定要删除该条数据吗?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    http.delete('/device/delete', {
                        params: {
                            id
                        }
                    }).then(res => {
                        if (res.code === 0) {
                            this.$message({
                                type: 'success',
                                message: '删除成功'
                            });
                            this.getListData()
                        }
                    }).catch(err => {
                        this.$message({
                            type: 'error',
                            message: '删除失败'
                        });
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
        }
    }
</script>

<style lang="scss" scoped>
    // .manureInput {
    //     width: 300px;
    // }

    // .form-top {
    //     margin: 10px 10px 0;
    //     display: flex;
    //     justify-content: space-between;
    //     align-items: center;

    //     .demo-form-inline {
    //         height: 50px;
    //     }

    //     .inpname {
    //         width: 240px;
    //     }
    // }

    // .plant-do {
    //     // height: 100px;
    //     margin-left: 10px;
    //     display: flex;
    //     justify-content: space-between;
    //     align-items: center;

    //     .do-right {
    //         width: 40%;
    //         display: flex;
    //         justify-content: space-between;
    //         align-items: center;

    //         .desc-item {
    //             display: flex;
    //             align-items: center;
    //             font-size: 14px;

    //             p {
    //                 margin-right: 10px;
    //             }

    //             ul {
    //                 font-size: 12px;
    //                 display: flex;

    //                 .dot {
    //                     width: 10px;
    //                     height: 10px;
    //                 }

    //                 li {
    //                     height: 20px;
    //                     display: flex;
    //                     align-items: center;
    //                     margin-right: 8px;
    //                     width: 50px;

    //                     &:first-child {
    //                         color: #FA7C01;

    //                     }

    //                     &:nth-child(2) {
    //                         color: #0CBF5B;
    //                     }

    //                     &:nth-child(3) {
    //                         color: #019FE8;
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    // .plant-table {
    //     margin: 10px;
    // }

    // .table-content {

    //     // height: 100%;


    //     .do-text {
    //         font-size: 12px;
    //     }

    //     .txt-btn {
    //         font-size: 12px;
    //         margin: 0 5px;
    //     }
    // }

    // .page-block {
    //     display: flex;
    //     justify-content: flex-end;
    //     margin-top: 10px;
    // }

    .equipment-grid {
        margin-bottom: 20px;
    }

    .equipment-card {
        margin-bottom: 20px;
        transition: all 0.3s;

        &:hover {
            transform: translateY(-5px);
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;

            .device-name {
                font-size: 16px;
                font-weight: bold;
            }
        }

        .card-content {
            .info-item {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                
                i {
                    margin-right: 8px;
                    color: #409EFF;
                }

                .label {
                    color: #606266;
                    margin-right: 8px;
                    min-width: 70px;
                }

                .value {
                    color: #303133;
                    word-break: break-all;
                }
            }
        }

        .card-footer {
            margin-top: 15px;
            display: flex;
            justify-content: flex-end;
        }
    }
</style>
