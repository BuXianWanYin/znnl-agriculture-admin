<template>
    <div class="app-container-sm">
        <el-card class="card-margin-bottom">
            <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px"
                class="form-minus-bottom">
                <el-form-item label="农资名称" prop="materialName">
                    <el-input v-model="queryParams.materialName" placeholder="请输入农资名称" clearable size="small"
                        @keyup.enter.native="handleQuery" />
                </el-form-item>
                <el-form-item label="农资类别" prop="materialTypeId">
                    <el-select v-model="queryParams.materialTypeId" size="small" placeholder="请选择农资类别" clearable
                        @change="handleQuery">
                        <el-option v-for="item in materialTypeList" :key="item.materialTypeId"
                            :label="item.materialTypeName" :value="item.materialTypeId"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                    <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
                </el-form-item>
                <el-form-item class="fr">
                    <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                        v-hasPermi="['agriculture:materialInfo:add']">新增</el-button>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="card-padding-bottom">
            <div v-loading="loading">
                <el-row :gutter="16">
                    <el-col :span="24" v-for="item in materialInfoList" :key="item.materialId" class="mb-16">
                        <el-card shadow="hover">
                            <div class="material-card">
                                <div class="material-info">
                                    <el-row :gutter="20">
                                        <el-col :span="8">
                                            <div class="info-item">
                                                <span class="label">农资编码：</span>
                                                <span class="value">{{ item.materialCode }}</span>
                                            </div>
                                        </el-col>
                                        <el-col :span="8">
                                            <div class="info-item">
                                                <span class="label">农资名称：</span>
                                                <span class="value">{{ item.materialName }}</span>
                                            </div>
                                        </el-col>
                                        <el-col :span="8">
                                            <div class="info-item">
                                                <span class="label">农资类别：</span>
                                                <span class="value">{{ item.materialTypeId }}</span>
                                            </div>
                                        </el-col>
                                        <el-col :span="8">
                                            <div class="info-item">
                                                <span class="label">计量单位：</span>
                                                <span class="value">{{ item.measureUnit }}</span>
                                            </div>
                                        </el-col>
                                        <el-col :span="16">
                                            <div class="info-item">
                                                <span class="label">备注：</span>
                                                <span class="value">{{ item.remark }}</span>
                                            </div>
                                        </el-col>
                                    </el-row>
                                </div>
                                <div class="material-actions">
                                    <el-button size="small" type="primary" icon="el-icon-edit"
                                        @click="handleUpdate(item)"
                                        v-hasPermi="['agriculture:materialInfo:edit']">修改</el-button>
                                    <el-button size="small" type="danger" icon="el-icon-delete"
                                        @click="handleDelete(item)"
                                        v-hasPermi="['agriculture:materialInfo:remove']">删除</el-button>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>

            <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum"
                :limit.sync="queryParams.pageSize" @pagination="getList" />
        </el-card>
        <!-- 添加或修改农资信息对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="农资编码" prop="materialCode">
                    <el-input v-model="form.materialCode" placeholder="请输入农资编码" />
                </el-form-item>
                <el-form-item label="农资名称" prop="materialName">
                    <el-input v-model="form.materialName" placeholder="请输入农资名称" />
                </el-form-item>
                <el-form-item label="农资类别" prop="materialTypeId">
                    <el-select v-model="form.materialTypeId" placeholder="请选择农资类别" class="display-block" clearable
                        @change="handleQuery">
                        <el-option v-for="item in materialTypeList" :key="item.materialTypeId"
                            :label="item.materialTypeName" :value="item.materialTypeId"></el-option>
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
        listMaterialInfo,
        getMaterialInfo,
        delMaterialInfo,
        addMaterialInfo,
        updateMaterialInfo
    } from "@/api/agriculture/materialInfo";
    import {
        listMaterialType
    } from "@/api/agriculture/materialType";

    export default {
        name: "MaterialInfo",
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
                materialInfoList: [],
                // 弹出层标题
                title: "",
                // 是否显示弹出层
                open: false,
                // 农资类别数据源
                materialTypeList: [],
                // 查询参数
                queryParams: {
                    pageNum: 1,
                    pageSize: 10,
                    materialCode: null,
                    materialName: null,
                    materialTypeId: null,
                    measureUnit: null,
                },
                // 表单参数
                form: {},
                // 表单校验
                rules: {
                    materialCode: [{
                        required: true,
                        message: "农资编码不能为空",
                        trigger: "blur"
                    }],
                    materialName: [{
                        required: true,
                        message: "农资名称不能为空",
                        trigger: "blur"
                    }],
                    materialTypeId: [{
                        required: true,
                        message: "农资类别不能为空",
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
            this.getList();
            this.getMaterialTypeList();
        },
        methods: {
            /** 查询农资信息列表 */
            getList() {
                this.loading = true;
                listMaterialInfo(this.queryParams).then(response => {
                    this.materialInfoList = response.rows;
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
                    materialId: null,
                    materialCode: null,
                    materialName: null,
                    materialTypeId: null,
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
            /** 获取农资类别数据源信息 */
            getMaterialTypeList() {
                listMaterialType().then(response => {
                    this.materialTypeList = response.rows
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
                this.title = "添加农资信息";
            },
            /** 修改按钮操作 */
            handleUpdate(row) {
                this.reset();
                const materialId = row.materialId || this.ids
                getMaterialInfo(materialId).then(response => {
                    this.form = response.data;
                    this.open = true;
                    this.title = "修改农资信息";
                });
            },
            /** 提交按钮 */
            submitForm() {
                this.$refs["form"].validate(valid => {
                    if (valid) {
                        if (this.form.materialId != null) {
                            updateMaterialInfo(this.form).then(response => {
                                this.$modal.msgSuccess("修改成功");
                                this.open = false;
                                this.getList();
                            });
                        } else {
                            addMaterialInfo(this.form).then(response => {
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
                const materialIds = row.materialId || this.ids;
                this.$modal.confirm('是否确认删除农资信息编号为"' + materialIds + '"的数据项？').then(function() {
                    return delMaterialInfo(materialIds);
                }).then(() => {
                    this.getList();
                    this.$modal.msgSuccess("删除成功");
                }).catch(() => {});
            },
            /** 导出按钮操作 */
            handleExport() {
                this.download('agriculture/materialInfo/export', {
                    ...this.queryParams
                }, `materialInfo_${new Date().getTime()}.xlsx`)
            }
        }
    };
</script>

<style scoped>
.mb-16 {
    margin-bottom: 16px;
}

.material-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.material-info {
    flex: 1;
}

.info-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.info-item:last-child {
    margin-bottom: 0;
}

.label {
    font-weight: bold;
    margin-right: 8px;
    color: #606266;
    white-space: nowrap;
}

.value {
    color: #333;
}

.material-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    border-top: 1px solid #EBEEF5;
    padding-top: 16px;
    margin-top: 8px;
}
</style>
