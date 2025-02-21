<template>
    <!-- 
    药品信息管理页面 
    -->
    <div class="app-container-sm">
        <el-card class="card-margin-bottom">
            <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px"
                class="form-minus-bottom">
                <el-form-item label="药品名称" prop="medicineName">
                    <el-input v-model="queryParams.medicineName" placeholder="请输入药品名称" clearable size="small"
                        @keyup.enter.native="handleQuery" />
                </el-form-item>
                <el-form-item label="药品类别" prop="medicineTypeId">
                    <el-select v-model="queryParams.medicineTypeId" size="small" placeholder="请选择药品类别" clearable
                        @change="handleQuery">
                        <el-option v-for="item in medicineTypeList" :key="item.medicineTypeId"
                            :label="item.medicineTypeName" :value="item.medicineTypeId"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                    <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
                </el-form-item>
                <el-form-item class="fr">
                    <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                        v-hasPermi="['agriculture:medicineInfo:add']">新增</el-button>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="card-padding-bottom">
            <div v-loading="loading">
                <el-row :gutter="16">
                    <el-col :span="24" v-for="item in medicineInfoList" :key="item.medicineId" class="mb-16">
                        <el-card shadow="always" class="medicine-card">
                            <div class="medicine-content">
                                <div class="medicine-main">
                                    <div class="medicine-name">
                                        {{ item.medicineName }}
                                    </div>
                                    <div class="medicine-info">
                                        <span class="info-item">
                                            <i class="el-icon-price-tag"></i>
                                            编码：{{ item.medicineCode }}
                                        </span>
                                        <span class="info-item">
                                            <i class="el-icon-collection-tag"></i>
                                            药品类别：{{ item.medicineTypeName }}
                                        </span>
                                        <span class="info-item">
                                            <i class="el-icon-box"></i>
                                            计量单位：{{ item.measureUnit }}
                                        </span>
                                    </div>
                                    <div class="medicine-remark" v-if="item.remark">
                                        <i class="el-icon-document"></i>
                                        备注：{{ item.remark }}
                                    </div>
                                </div>
                                <div class="medicine-actions">
                                    <el-button 
                                        size="small" 
                                        type="primary" 
                                        plain 
                                        icon="el-icon-edit"
                                        @click="handleUpdate(item)"
                                        v-hasPermi="['agriculture:medicineInfo:edit']">修改</el-button>
                                    <el-button 
                                        size="small" 
                                        type="danger" 
                                        plain
                                        icon="el-icon-delete"
                                        @click="handleDelete(item)"
                                        v-hasPermi="['agriculture:medicineInfo:remove']">删除</el-button>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>

            <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum"
                :limit.sync="queryParams.pageSize" @pagination="getList" />
        </el-card>
        <!-- 添加或修改药品信息对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="药品编码" prop="medicineCode">
                    <el-input v-model="form.medicineCode" placeholder="请输入药品编码" />
                </el-form-item>
                <el-form-item label="药品名称" prop="medicineName">
                    <el-input v-model="form.medicineName" placeholder="请输入药品名称" />
                </el-form-item>
                <el-form-item label="药品类别" prop="medicineTypeId">
                    <el-select v-model="form.medicineTypeId" placeholder="请选择药品类别" class="display-block" clearable
                        @change="handleTypeChange">
                        <el-option v-for="item in medicineTypeList" :key="item.medicineTypeId"
                            :label="item.medicineTypeName" :value="item.medicineTypeId"></el-option>
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
        listMedicineInfo,
        getMedicineInfo,
        delMedicineInfo,
        addMedicineInfo,
        updateMedicineInfo
    } from "@/api/fishingGround/MedicineInfo";
    import {
        listMedicineType
    } from "@/api/fishingGround/MedicineType";

    export default {
        name: "MedicineInfo",
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
                // 农资信息表格数据
                medicineInfoList: [],
                // 弹出层标题
                title: "",
                // 是否显示弹出层
                open: false,
                // 农资类别数据源
                medicineTypeList: [],
                // 查询参数
                queryParams: {
                    pageNum: 1,
                    pageSize: 10,
                    medicineCode: null,
                    medicineName: null,
                    medicineTypeId: null,
                    measureUnit: null,
                },
                // 表单参数
                form: {},
                // 表单校验
                rules: {
                    medicineCode: [{
                        required: true,
                        message: "药品编码不能为空",
                        trigger: "blur"
                    }],
                    medicineName: [{
                        required: true,
                        message: "药品名称不能为空",
                        trigger: "blur"
                    }],
                    medicineTypeId: [{
                        required: true,
                        message: "药品类别不能为空",
                        trigger: "blur"
                    }],
                    measureUnit: [{
                        required: true,
                        message: "计量单位不能为空",
                        trigger: "blur"
                    }],
                    delFlag: [{
                        required: true,
                        message: "删除标志不能为空",
                        trigger: "blur"
                    }]
                }
            };
        },
        created() {
            this.getMedicineTypeList().then(() => {
                this.getList();
            });
        },
        methods: {
            /** 查询药品信息列表 */
            getList() {
                this.loading = true;
                listMedicineInfo(this.queryParams).then(response => {
                    // 为每个药品信息添加对应的类别名称
                    this.medicineInfoList = response.rows.map(item => ({
                        ...item,
                        medicineTypeName: this.medicineTypeList.find(type => type.medicineTypeId === item.medicineTypeId)?.medicineTypeName || '-'
                    }));
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
                    medicineId: null,
                    medicineCode: null,
                    medicineName: null,
                    medicineTypeId: null,
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
            /** 获取药品类别数据源信息 */
            getMedicineTypeList() {
                return listMedicineType().then(response => {
                    this.medicineTypeList = response.rows;
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
                this.title = "添加药品信息";
            },
            /** 药品类别选择改变时的处理 */
            handleTypeChange(value) {
                // 手动触发表单验证
                this.$refs.form.validateField('medicineTypeId');
            },
            /** 修改按钮操作 */
            handleUpdate(row) {
                this.reset();
                const medicineId = row.medicineId || this.ids
                getMedicineInfo(medicineId).then(response => {
                    this.form = response.data;
                    this.open = true;
                    this.title = "修改药品信息";
                    // 添加这一行，等待DOM更新后触发验证
                    this.$nextTick(() => {
                        if (this.$refs.form) {
                            this.$refs.form.clearValidate();
                        }
                    });
                });
            },
            /** 提交按钮 */
            submitForm() {
                this.$refs["form"].validate(valid => {
                    if (valid) {
                        if (this.form.medicineId != null) {
                            updateMedicineInfo(this.form).then(response => {
                                this.$modal.msgSuccess("修改成功");
                                this.open = false;
                                this.getList();
                            });
                        } else {
                            addMedicineInfo(this.form).then(response => {
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
                const medicineIds = row.medicineId || this.ids;
                const medicineName = row.medicineName;
                this.$modal.confirm('是否确认删除药品"' + medicineName + '"？').then(function() {
                    return delMedicineInfo(medicineIds);
                }).then(() => {
                    this.getList();
                    this.$modal.msgSuccess("删除成功");
                }).catch(() => {});
            },
            /** 导出按钮操作 */
            handleExport() {
                this.download('agriculture/medicineInfo/export', {
                    ...this.queryParams
                }, `medicineInfo_${new Date().getTime()}.xlsx`)
            }
        }
    };
</script>

<style lang="scss" scoped>
.mb-16 {
    margin-bottom: 16px;
}

.medicine-card {
    margin: 0;
    background: white;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;

    .medicine-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;

        .medicine-main {
            flex: 1;
            min-width: 0;

            .medicine-name {
                font-size: 15px;
                font-weight: 600;
                color: #333;
                margin-bottom: 8px;
            }

            .medicine-info {
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

            .medicine-remark {
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

        .medicine-actions {
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
    .medicine-content {
        flex-direction: column;
        align-items: flex-start !important;
        
        .medicine-info {
            flex-direction: column;
            gap: 8px !important;
        }
        
        .medicine-actions {
            width: 100%;
            margin-top: 12px;
            justify-content: flex-end;
        }
    }
}
</style>
