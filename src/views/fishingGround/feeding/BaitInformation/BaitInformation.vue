<template>
    <!--
    饵料信息管理页面
    -->
    <div class="app-container-sm">
        <el-card class="card-margin-bottom">
            <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px"
                class="form-minus-bottom">
                <el-form-item label="饵料名称" prop="baitName">
                    <el-input v-model="queryParams.baitName" placeholder="请输入饵料名称" clearable size="small"
                        @keyup.enter.native="handleQuery" />
                </el-form-item>
                <el-form-item label="饵料类别" prop="baitTypeId">
                    <el-select v-model="queryParams.baitTypeId" size="small" placeholder="请选择饵料类别" clearable
                        @change="handleQuery">
                        <el-option v-for="item in BaitTypeList" :key="item.baitTypeId"
                            :label="item.baitTypeName" :value="item.baitTypeId"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                    <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
                </el-form-item>
                <el-form-item class="fr">
                    <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                        v-hasPermi="['fishingGround:BaitInfo:add']">新增</el-button>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="card-padding-bottom">
            <div v-loading="loading">
                <el-row :gutter="16">
                    <el-col :span="24" v-for="item in BaitInfoList" :key="item.baitId" class="mb-16">
                        <el-card shadow="always" class="bait-card">
                            <div class="bait-content">
                                <div class="bait-main">
                                    <div class="bait-name">
                                        {{ item.baitName }}
                                    </div>
                                    <div class="bait-info">
                                        <span class="info-item">
                                            <i class="el-icon-price-tag"></i>
                                            编码：{{ item.baitCode }}
                                        </span>
                                        <span class="info-item">
                                            <i class="el-icon-collection-tag"></i>
                                            饵料类别：{{ getBaitTypeName(item.baitTypeId) }}
                                        </span>
                                        <span class="info-item">
                                            <i class="el-icon-box"></i>
                                            计量单位：{{ item.measureUnit }}
                                        </span>
                                    </div>
                                    <div class="bait-remark" v-if="item.remark">
                                        <i class="el-icon-document"></i>
                                        备注：{{ item.remark }}
                                    </div>
                                </div>
                                <div class="bait-actions">
                                    <el-button 
                                        size="small" 
                                        type="primary" 
                                        plain 
                                        icon="el-icon-edit"
                                        @click="handleUpdate(item)"
                                        v-hasPermi="['fishingGround:BaitInfo:edit']">修改</el-button>
                                    <el-button 
                                        size="small" 
                                        type="danger" 
                                        plain
                                        icon="el-icon-delete"
                                        @click="handleDelete(item)"
                                        v-hasPermi="['fishingGround:BaitInfo:remove']">删除</el-button>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>

            <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum"
                :limit.sync="queryParams.pageSize" @pagination="getList" />
        </el-card>
        <!-- 添加或修改饵料信息对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="饵料编码" prop="baitCode">
                    <el-input v-model="form.baitCode" placeholder="请输入饵料编码" />
                </el-form-item>
                <el-form-item label="饵料名称" prop="baitName">
                    <el-input v-model="form.baitName" placeholder="请输入饵料名称" />
                </el-form-item>
                <el-form-item label="饵料类别" prop="baitTypeId">
                    <el-select v-model="form.baitTypeId" placeholder="请选择饵料类别" class="display-block" clearable
                        @change="handleQuery">
                        <el-option v-for="item in BaitTypeList" :key="item.baitTypeId"
                            :label="item.baitTypeName" :value="item.baitTypeId"></el-option>
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
        listBaitInfo,
        getBaitInfo,
        delBaitInfo,
        addBaitInfo,
        updateBaitInfo
    } from "@/api/fishingGround/BaitInfo";
    import {
        listBaitType
    } from "@/api/fishingGround/BaitType";

    export default {
        name: "BaitInfo",
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
                BaitInfoList: [],
                // 弹出层标题
                title: "",
                // 是否显示弹出层
                open: false,
                // 农资类别数据源
                BaitTypeList: [],
                // 查询参数
                queryParams: {
                    pageNum: 1,
                    pageSize: 10,
                    baitCode: null,
                    baitName: null,
                    baitTypeId: null,
                    measureUnit: null,
                },
                // 表单参数
                form: {},
                // 表单校验
                rules: {
                    baitCode: [{
                        required: true,
                        message: "饵料编码不能为空",
                        trigger: "blur"
                    }],
                    baitName: [{
                        required: true,
                        message: "饵料名称不能为空",
                        trigger: "blur"
                    }],
                    baitTypeId: [{
                        required: true,
                        message: "饵料类别不能为空",
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
            this.getBaitTypeList();
        },
        methods: {
            /** 查询饵料信息列表 */
            getList() {
                this.loading = true;
                listBaitInfo(this.queryParams).then(response => {
                    this.BaitInfoList = response.rows;
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
                    baitId: null,
                    baitCode: null,
                    baitName: null,
                    baitTypeId: null,
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
            /** 获取饵料类别数据源信息 */
            getBaitTypeList() {
                listBaitType().then(response => {
                    this.BaitTypeList = response.rows;
                    console.log('Bait Type List:', response.rows);
                });
            },
            /** 根据饵料类别ID获取类别名称 */
            getBaitTypeName(baitTypeId) {
                const baitType = this.BaitTypeList.find(type => type.baitTypeId === baitTypeId);
                return baitType ? baitType.baitTypeName : baitTypeId;
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
                this.title = "添加饵料信息";
            },
            /** 修改按钮操作 */
            handleUpdate(row) {
                this.reset();
                const baitId = row.baitId || this.ids
                getBaitInfo(baitId).then(response => {
                    this.form = response.data;
                    this.open = true;
                    this.title = "修改饵料信息";
                });
            },
            /** 提交按钮 */
            submitForm() {
                this.$refs["form"].validate(valid => {
                    if (valid) {
                        if (this.form.baitId != null) {
                            updateBaitInfo(this.form).then(response => {
                                this.$modal.msgSuccess("修改成功");
                                this.open = false;
                                this.getList();
                            });
                        } else {
                            addBaitInfo(this.form).then(response => {
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
                const baitIds = row.baitId || this.ids;
                this.$modal.confirm('是否确认删除饵料"' + row.baitName + '"？').then(function() {
                    return delBaitInfo(baitIds);
                }).then(() => {
                    this.getList();
                    this.$modal.msgSuccess("删除成功");
                }).catch(() => {});
            },
            /** 导出按钮操作 */
            handleExport() {
                this.download('fishingGround/BaitInfo/export', {
                    ...this.queryParams
                }, `BaitInfo_${new Date().getTime()}.xlsx`)
            }
        }
    };
</script>

<style lang="scss" scoped>
.mb-16 {
    margin-bottom: 16px;
}

.bait-card {
    margin: 0;
    background: white;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;

    .bait-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;

        .bait-main {
            flex: 1;
            min-width: 0;

            .bait-name {
                font-size: 15px;
                font-weight: 600;
                color: #333;
                margin-bottom: 8px;
            }

            .bait-info {
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

            .bait-remark {
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

        .bait-actions {
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
    .bait-content {
        flex-direction: column;
        align-items: flex-start !important;
        
        .bait-info {
            flex-direction: column;
            gap: 8px !important;
        }
        
        .bait-actions {
            width: 100%;
            margin-top: 12px;
            justify-content: flex-end;
        }
    }
}
</style>
