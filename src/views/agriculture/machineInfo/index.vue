<template>
    <div class="app-container-sm">
        <el-card class="card-margin-bottom">
            <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px"
                class="form-minus-bottom">
                <el-form-item label="农机名称" prop="machineName">
                    <el-input v-model="queryParams.machineName" placeholder="请输入农机名称" clearable size="small"
                        @keyup.enter.native="handleQuery" />
                </el-form-item>
                <el-form-item label="农机类别" prop="machineTypeId">
                    <el-select v-model="queryParams.machineTypeId" placeholder="请选择农机类别" clearable
                        @change="handleQuery">
                        <el-option v-for="item in machineTypeList" :key="item.machineTypeId"
                            :label="item.machineTypeName" :value="item.machineTypeId"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                    <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
                </el-form-item>
                <el-form-item class="fr">
                    <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                        v-hasPermi="['agriculture:machineInfo:add']">新增</el-button>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="card-padding-bottom">
            <div v-loading="loading">
                <el-row :gutter="16">
                    <el-col :span="24" v-for="item in machineInfoList" :key="item.machineId" class="mb-16">
                        <el-card shadow="always" class="machine-card">
                            <div class="machine-content">
                                <div class="machine-main">
                                    <div class="machine-name">
                                        {{ item.machineName }}
                                    </div>
                                    <div class="machine-info">
                                        <span class="info-item">
                                            <i class="el-icon-price-tag"></i>
                                            编码：{{ item.machineCode }}
                                        </span>
                                        <span class="info-item">
                                            <i class="el-icon-collection-tag"></i>
                                            农机类别：{{ machineTypeMap[item.machineTypeId] || item.machineTypeId }}
                                        </span>
                                        <span class="info-item">
                                            <i class="el-icon-box"></i>
                                            计量单位：{{ item.measureUnit }}
                                        </span>
                                    </div>
                                    <div class="machine-remark" v-if="item.remark">
                                        <i class="el-icon-document"></i>
                                        备注：{{ item.remark }}
                                    </div>
                                </div>
                                <div class="machine-actions">
                                    <el-button 
                                        size="small" 
                                        type="primary" 
                                        plain 
                                        icon="el-icon-edit"
                                        @click="handleUpdate(item)"
                                        v-hasPermi="['agriculture:machineInfo:edit']">修改</el-button>
                                    <el-button 
                                        size="small" 
                                        type="danger" 
                                        plain
                                        icon="el-icon-delete"
                                        @click="handleDelete(item)"
                                        v-hasPermi="['agriculture:machineInfo:remove']">删除</el-button>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>

            <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum"
                :limit.sync="queryParams.pageSize" @pagination="getList" />
        </el-card>
        <!-- 添加或修改农机信息对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="农机编码" prop="machineCode">
                    <el-input v-model="form.machineCode" placeholder="请输入农机编码" />
                </el-form-item>
                <el-form-item label="农机名称" prop="machineName">
                    <el-input v-model="form.machineName" placeholder="请输入农机名称" />
                </el-form-item>
                <el-form-item label="农机类别" prop="machineTypeId">
                    <el-select class="display-block" v-model="form.machineTypeId" placeholder="请选择农机类别" clearable
                        @change="handleQuery">
                        <el-option v-for="item in machineTypeList" :key="item.machineTypeId"
                            :label="item.machineTypeName" :value="item.machineTypeId"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="计量单位" prop="measureUnit">
                    <el-input v-model="form.measureUnit" placeholder="请输入计量单位" />
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitForm">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import {
        listMachineInfo,
        getMachineInfo,
        delMachineInfo,
        addMachineInfo,
        updateMachineInfo
    } from "@/api/agriculture/machineInfo";
    import {
        listMachineType,
        getMachineType
    } from "@/api/agriculture/machineType";

    export default {
        name: "MachineInfo",
        data() {
            return {
                // 遮罩层
                loading: true,
                // 选中数组
                ids: [],
                // 非单个禁用
                single: true,
                // 非多个禁用
                multiple: true,
                // 显示搜索条件
                showSearch: true,
                // 总条数
                total: 0,
                // 农机信息表格数据
                machineInfoList: [],
                // 弹出层标题
                title: "",
                // 是否显示弹出层
                open: false,
                // 农机类别数据源
                machineTypeList: [],
                // 查询参数
                queryParams: {
                    pageNum: 1,
                    pageSize: 10,
                    machineCode: null,
                    machineName: null,
                    machineTypeId: null,
                },
                // 表单参数
                form: {},
                // 表单校验
                rules: {
                    machineCode: [{
                        required: true,
                        message: "农机编码不能为空",
                        trigger: "blur"
                    }],
                    machineName: [{
                        required: true,
                        message: "农机名称不能为空",
                        trigger: "blur"
                    }],
                    machineTypeId: [{
                        required: true,
                        message: "农机类别不能为空",
                        trigger: "change"
                    }],
                    measureUnit: [{
                        required: true,
                        message: "计量单位不能为空",
                        trigger: "change"
                    }],
                    orderNum: [{
                        required: true,
                        message: "排序不能为空",
                        trigger: "blur"
                    }],
                    delFlag: [{
                        required: true,
                        message: "删除标志不能为空",
                        trigger: "blur"
                    }]
                },
                machineTypeMap: {}, // 存储农机类别名称的映射
            };
        },
        created() {
            this.getList();
            this.getMachineTypeList();
        },
        methods: {
            /** 查询农机信息列表 */
            getList() {
                this.loading = true;
                listMachineInfo(this.queryParams).then(async response => {
                    this.machineInfoList = response.rows;
                    
                    // 获取每个农机的类别详细信息
                    for (const item of this.machineInfoList) {
                        if (item.machineTypeId) {
                            try {
                                const typeResponse = await getMachineType(item.machineTypeId);
                                // 使用 machineTypeName 作为类别名称
                                this.$set(this.machineTypeMap, item.machineTypeId, typeResponse.data.machineTypeName);
                            } catch (error) {
                                console.error('获取农机类别详情失败:', error);
                            }
                        }
                    }
                    
                    this.total = response.total;
                    this.loading = false;
                });
            },
            // 取消按钮
            cancel() {
                this.open = false;
                this.reset();
            },
            // 表单重置
            reset() {
                this.form = {
                    machineId: null,
                    machineCode: null,
                    machineName: null,
                    machineTypeId: null,
                    measureUnit: null,
                    remark: null,
                    status: "0",
                    orderNum: null,
                    createBy: null,
                    createTime: null,
                    updateBy: null,
                    updateTime: null,
                    delFlag: null
                };
                this.resetForm("form");
            },
            /** 获取农机类别数据源信息 */
            getMachineTypeList() {
                listMachineType().then(response => {
                    this.machineTypeList = response.rows;
                });
            },
            /** 搜索按钮操作 */
            handleQuery() {
                this.queryParams.pageNum = 1;
                this.getList();
            },
            /** 重置按钮操作 */
            resetQuery() {
                this.resetForm("queryForm");
                this.handleQuery();
            },
            /** 新增按钮操作 */
            handleAdd() {
                this.reset();
                this.open = true;
                this.title = "添加农机信息";
            },
            /** 修改按钮操作 */
            handleUpdate(row) {
                this.reset();
                const machineId = row.machineId || this.ids
                getMachineInfo(machineId).then(response => {
                    this.form = response.data;
                    this.open = true;
                    this.title = "修改农机信息";
                });
            },
            /** 提交按钮 */
            submitForm() {
                this.$refs["form"].validate(valid => {
                    if (valid) {
                        if (this.form.machineId != null) {
                            updateMachineInfo(this.form).then(response => {
                                this.$modal.msgSuccess("修改成功");
                                this.open = false;
                                this.getList();
                            });
                        } else {
                            addMachineInfo(this.form).then(response => {
                                this.$modal.msgSuccess("新增成功");
                                this.open = false;
                                this.getList();
                            });
                        }
                    }
                });
            },
            /** 删除按钮操作 */
            handleDelete(row) {
                const machineIds = row.machineId || this.ids;
                this.$modal.confirm('是否确认删除农机"' + row.machineName + '"？').then(function() {
                    return delMachineInfo(machineIds);
                }).then(() => {
                    this.getList();
                    this.$modal.msgSuccess("删除成功");
                }).catch(() => {});
            },
            /** 导出按钮操作 */
            handleExport() {
                this.download('agriculture/machineInfo/export', {
                    ...this.queryParams
                }, `machineInfo_${new Date().getTime()}.xlsx`)
            }
        }
    };
</script>

<style lang="scss" scoped>
.mb-16 {
    margin-bottom: 16px;
}

.machine-card {
    margin: 0;
    background: white;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;

    .machine-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;

        .machine-main {
            flex: 1;
            min-width: 0;

            .machine-name {
                font-size: 15px;
                font-weight: 600;
                color: #333;
                margin-bottom: 8px;
            }

            .machine-info {
                display: flex;
                gap: 24px;
                
                .info-item {
                    display: flex;
                    align-items: center;
                    font-size: 13px;
                    color: #666;
                    white-space: nowrap;
                    
                    i {
                        color: #409EFF;
                        margin-right: 8px;
                        font-size: 14px;
                    }
                }
            }

            .machine-remark {
                display: flex;
                align-items: center;
                font-size: 13px;
                color: #666;
                margin-top: 8px;
                
                i {
                    color: #409EFF;
                    margin-right: 8px;
                    font-size: 14px;
                }
            }
        }

        .machine-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;

            .el-button {
                padding: 5px 10px;
                height: 28px;
                font-size: 12px;
            }
        }
    }
}

// 响应式布局
@media screen and (max-width: 768px) {
    .machine-content {
        flex-direction: column;
        align-items: flex-start !important;
        
        .machine-info {
            flex-direction: column;
            gap: 8px !important;
        }
        
        .machine-actions {
            width: 100%;
            margin-top: 12px;
            justify-content: flex-end;
        }
    }
}
</style>
