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
            <el-table v-loading="loading" :data="medicineInfoList">
                <el-table-column label="药品编码" align="center" prop="medicineCode" />
                <el-table-column label="药品名称" align="center" prop="medicineName" />
                <el-table-column label="药品类别" align="center" prop="medicineTypeId" />
                <el-table-column label="药品单位" align="center" prop="measureUnit" />
                <el-table-column label="备注" align="center" prop="remark" />
                <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                    <template slot-scope="scope">
                        <el-button size="small" class="padding-5" type="primary" icon="el-icon-edit"
                            @click="handleUpdate(scope.row)"
                            v-hasPermi="['agriculture:medicineInfo:edit']">修改</el-button>
                        <el-button size="small" class="padding-5" type="danger" icon="el-icon-delete"
                            @click="handleDelete(scope.row)"
                            v-hasPermi="['agriculture:medicineInfo:remove']">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum"
                :limit.sync="queryParams.pageSize" @pagination="getList" />
        </el-card>
        <!-- 添加或修改药品信息对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="药品编码" prop="medicineCode">
                    <el-input v-model="form.medicineCode" placeholder="请输入药品编码" />
                </el-form-item>
                <el-form-item label="药品名称" prop="medic  ineName">
                    <el-input v-model="form.medicineName" placeholder="请输入药品名称" />
                </el-form-item>
                <el-form-item label="药品类别" prop="medicineTypeId">
                    <el-select v-model="form.medicineTypeId" placeholder="请选择药品类别" class="display-block" clearable
                        @change="handleQuery">
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
            this.getList();
            this.getMedicineTypeList();
        },
        methods: {
            /** 查询药品信息列表 */
            getList() {
                this.loading = true;
                listMedicineInfo(this.queryParams).then(response => {
                    this.medicineInfoList = response.rows;
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
                listMedicineType().then(response => {
                    this.medicineTypeList = response.rows
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
            /** 修改按钮操作 */
            handleUpdate(row) {
                this.reset();
                const medicineId = row.medicineId || this.ids
                getMedicineInfo(medicineId).then(response => {
                    this.form = response.data;
                    this.open = true;
                    this.title = "修改药品信息";
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
                this.$modal.confirm('是否确认删除药品信息编号为"' + medicineIds + '"的数据项？').then(function() {
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
