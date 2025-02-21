<template>
    <div class="app-container-sm">
        <el-card class="card-margin-bottom">
            <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px"
                class="form-minus-bottom">
                <el-form-item label="作物名称" prop="cropName">
                    <el-input v-model="queryParams.cropName" placeholder="请输入作物名称" clearable size="small"
                        @keyup.enter.native="handleQuery" />
                </el-form-item>
                <el-form-item label="种质名称" prop="germplasmName">
                    <el-input v-model="queryParams.germplasmName" placeholder="请输入种质名称" clearable size="small"
                        @keyup.enter.native="handleQuery" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                    <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
                </el-form-item>
                <el-form-item class="fr"> 
                    <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                        v-hasPermi="['agriculture:germplasm:add']">新增</el-button>
                    <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
                        v-hasPermi="['agriculture:germplasm:export']">导出</el-button>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="card-padding-bottom">
            <el-row :gutter="24">
                <el-col :span="6" v-for="(item, index) in germplasmList" :key="index">
                    <el-card class="germplasm-card" shadow="hover">
                        <div class="germplasm-card-header">
                            <div class="header-content">
                                <div class="section-name">种质信息</div>
                                <div class="germplasm-name">{{ item.germplasmName }}</div>
                            </div>
                        </div>

                        <div class="germplasm-image" @click="previewImage(`${image.baseUrl + item.germplasmImg}`, item)">
                            <img :src="`${image.baseUrl + item.germplasmImg}`" alt="种质图片"/>
                        </div>
                        
                        <div class="germplasm-card-content">
                            <div class="germplasm-info">
                                <div class="info-group">
                                    <div class="info-row">
                                        <div class="info-item">
                                            <i class="el-icon-menu"></i>
                                            <span class="label">作物名称：</span>
                                            <span class="value">{{ item.cropName }}</span>
                                        </div>
                                        <div class="info-item">
                                            <i class="el-icon-edit-outline"></i>
                                            <span class="label">英文名称：</span>
                                            <span class="value">{{ item.cropEnName }}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="info-group">
                                    <div class="info-row">
                                        <div class="info-item">
                                            <i class="el-icon-document"></i>
                                            <span class="label">种质名称：</span>
                                            <span class="value">{{ item.germplasmName }}</span>
                                        </div>
                                        <div class="info-item">
                                            <i class="el-icon-tickets"></i>
                                            <span class="label">种质英文：</span>
                                            <span class="value">{{ item.germplasmEnName }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="germplasm-card-actions">
                            <el-button size="small" type="primary" icon="el-icon-edit"
                                @click="handleUpdate(item)" 
                                v-hasPermi="['agriculture:germplasm:edit']">修改</el-button>
                            <el-button size="small" type="danger" icon="el-icon-delete"
                                @click="handleDelete(item)" 
                                v-hasPermi="['agriculture:germplasm:remove']">删除</el-button>
                            <el-button size="small" plain type="warning" icon="el-icon-s-claim"
                                @click="showStandardJob(item)" 
                                v-hasPermi="['agriculture:germplasm:jobProcess']">作业流程</el-button>
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <el-dialog title="作业流程" :visible.sync="showStandardJobComponent" width="40%" append-to-body
                @close="closeStandardJob">
                <standard-job :germplasmId="currentGermplasmId" v-if="showStandardJobComponent" />
            </el-dialog>
            <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
                :limit.sync="queryParams.pageSize" @pagination="getList" />
        </el-card>
        <!-- 添加或修改种质对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="作物名称" prop="cropName">
                    <el-input v-model="form.cropName" placeholder="请输入作物名称" />
                </el-form-item>
                <el-form-item label="作物英文名称" prop="cropEnName">
                    <el-input v-model="form.cropEnName" placeholder="请输入作物英文名称" />
                </el-form-item>
                <el-form-item label="种质名称" prop="germplasmName">
                    <el-input v-model="form.germplasmName" placeholder="请输入种质名称" />
                </el-form-item>
                <el-form-item label="种质英文名称" prop="germplasmEnName">
                    <el-input v-model="form.germplasmEnName" placeholder="请输入种质英文名称" />
                </el-form-item>
                <el-form-item label="种质图片" prop="germplasmImg">
                    <div v-if="form.germplasmImg">
                        <!-- 已有图片时显示图片和删除按钮 -->
                        <div class="image-preview">
                            <img style="width:148px;height:148px;" :src="`${image.baseUrl + form.germplasmImg}`" />
                            <!-- 点击时将图片值设为 null，从而清除图片 -->
                            <i class="el-icon-close delete-icon" @click="form.germplasmImg = null"></i>
                        </div>
                    </div>
                    <!-- 没有图片时显示上传组件 -->
                    <imageUpload 
                        v-else 
                        v-model="form.germplasmImg"
                        :limit="1"
                        @change="validateField('germplasmImg')"
                    />
                </el-form-item>
                <el-form-item label="宣传语" prop="germplasmDes">
                    <el-input v-model="form.germplasmDes" type="textarea" placeholder="请输入内容" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitForm">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
            </div>
        </el-dialog>
        <!-- 图片预览对话框 -->
        <el-dialog :title="image.title" :visible.sync="image.open" width="240px">
            <img style="width:200px;height:200px;" :src="image.imgUrl" />
        </el-dialog>
    </div>
</template>

<script>
    import {
        listGermplasm,
        getGermplasm,
        delGermplasm,
        addGermplasm,
        updateGermplasm
    } from "@/api/agriculture/germplasm";
    import StandardJob from "./components/StandardJob";

    export default {
        name: "Germplasm",
        components: {
            StandardJob
        },
        data() {
            return {
                showStandardJobComponent: false, // 控制组件显示的变量
                currentGermplasmId: null, // 当前选中的种质ID
                //图片预览
                image: {
                    baseUrl: window.location.origin + process.env.VUE_APP_BASE_API,
                    open: false,
                    imgUrl: '',
                    title: ''
                },
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
                // 种质表格数据
                germplasmList: [],
                // 弹出层标题
                title: "",
                // 是否显示弹出层
                open: false,
                // 查询参数
                queryParams: {
                    pageNum: 1,
                    pageSize: 10,
                    cropName: null,
                    germplasmName: null,
                },
                // 表单参数
                form: {},
                // 表单校验
                rules: {
                    germplasmId: [{
                        required: true,
                        message: "种质ID不能为空",
                        trigger: "blur"
                    }],
                    cropName: [{
                        required: true,
                        message: "作物名称不能为空",
                        trigger: "blur"
                    }],
                    cropEnName: [{
                        required: true,
                        message: "作物英文名称不能为空",
                        trigger: "blur"
                    }],
                    germplasmName: [{
                        required: true,
                        message: "种质名称不能为空",
                        trigger: "blur"
                    }],
                    germplasmEnName: [{
                        required: true,
                        message: "种质英文名称不能为空",
                        trigger: "blur"
                    }],
                    germplasmImg: [{
                        required: true,
                        message: "种质图片不能为空",
                        trigger: ["blur","change"]
                    }],
                }
            };
        },
        created() {
            this.getList();
        },
        methods: {
            showStandardJob(row) {
                this.currentGermplasmId = row.germplasmId; // 获取当前行的种质ID
                this.showStandardJobComponent = true; // 显示组件
            },
            closeStandardJob() {
                this.showStandardJobComponent = false; // 关闭组件
            },
            /** 查询种质列表 */
            getList() {
                this.loading = true;
                listGermplasm(this.queryParams).then(response => {
                    this.germplasmList = response.rows;
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
                    germplasmId: null,
                    cropName: null,
                    cropEnName: null,
                    germplasmName: null,
                    germplasmEnName: null,
                    germplasmImg: null,
                    germplasmDes: null,
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
                this.title = "添加种质";
            },
            /** 修改按钮操作 */
            handleUpdate(row) {
                this.reset();
                const germplasmId = row.germplasmId || this.ids
                getGermplasm(germplasmId).then(response => {
                    this.form = response.data;
                    this.open = true;
                    this.title = "修改种质";
                });
            },
            /** 提交按钮 */
            submitForm() {
                this.$refs["form"].validate(valid => {
                    if (valid) {
                        if (this.form.germplasmId != null) {
                            updateGermplasm(this.form).then(response => {
                                this.$modal.msgSuccess("修改成功");
                                this.open = false;
                                this.getList();
                            });
                        } else {
                            addGermplasm(this.form).then(response => {
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
                const germplasmIds = row.germplasmId || this.ids;
                this.$modal.confirm('是否确认删除种质编号为"' + germplasmIds + '"的数据项？').then(function() {
                    return delGermplasm(germplasmIds);
                }).then(() => {
                    this.getList();
                    this.$modal.msgSuccess("删除成功");
                }).catch(() => {});
            },
            /** 图片预览按钮操作 */
            previewImage(imgUrl, row) {
                this.image.title = row.version
                this.image.open = true;
                this.image.imgUrl = imgUrl;
            },
            /** 导出按钮操作 */
            handleExport() {
                this.download('agriculture/germplasm/export', {
                    ...this.queryParams
                }, `germplasm_${new Date().getTime()}.xlsx`)
            },
            validateField(field) {
                // 手动触发特定字段的验证
                this.$refs.form.validateField(field);
            }
        }
    };
</script>

<style lang="scss" scoped>
.germplasm-card-grid {
    padding: 20px;
}

// 修改行和列的间距
.el-row {
    margin: 0 -12px; // 只设置水平方向的负边距
}

.el-col {
    padding: 0 12px; // 水平方向的内边距
    margin-bottom: 24px; // 添加垂直方向的下边距
}

.germplasm-card {
    height: 100%;
    background: white;
    border-radius: 12px;
    padding: 12px;
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    
    .germplasm-card-header {
        margin-bottom: 12px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        
        .header-content {
            .section-name {
                font-size: 12px;
                color: #909399;
                margin-bottom: 4px;
            }

            .germplasm-name {
                font-size: 14px;
                font-weight: 600;
                color: #333;
            }
        }
    }
    
    .germplasm-image {
        width: 100%;
        height: 180px;
        border-radius: 6px;
        overflow: hidden;
        cursor: pointer;
        margin-bottom: 12px;
        
        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .germplasm-card-content {
        padding: 0;
        
        .germplasm-info {
            display: flex;
            flex-direction: column;
            gap: 16px;

            .info-group {
                padding-bottom: 12px;
                
                &:first-child {
                    border-bottom: 1px dashed #ebeef5;
                }

                .info-row {
                    display: flex;
                    gap: 16px;
                    
                    .info-item {
                        flex: 1;
                        font-size: 12px;
                        display: flex;
                        align-items: center;
                        white-space: nowrap;

                        i {
                            color: #67C23A;
                            margin-right: 8px;
                            font-size: 14px;
                        }

                        .label {
                            color: #666;
                            margin-right: 8px;
                            min-width: 60px;
                        }

                        .value {
                            color: #333;
                            flex: 1;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                    }
                }
            }
        }
    }

    .germplasm-card-actions {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #ebeef5;
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        
        .el-button {
            padding: 4px 8px;
            height: 28px;
            border-radius: 4px;
            margin: 0;
            transition: all 0.3s ease;
            
            &.el-button--primary {
                background-color: #f2f6fc;
                border-color: transparent;
                color: #409eff;
                
                &:hover {
                    background-color: #409eff;
                    color: #ffffff;
                    transform: translateY(-2px);
                    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
                }
            }
            
            &.el-button--danger {
                background-color: #fef0f0;
                border-color: transparent;
                color: #f56c6c;
                
                &:hover {
                    background-color: #f56c6c;
                    color: #ffffff;
                    transform: translateY(-2px);
                    box-shadow: 0 2px 8px rgba(245, 108, 108, 0.2);
                }
            }
            
            &.el-button--warning {
                background-color: #fdf6ec;
                border-color: transparent;
                color: #e6a23c;
                
                &:hover {
                    background-color: #e6a23c;
                    color: #ffffff;
                    transform: translateY(-2px);
                    box-shadow: 0 2px 8px rgba(230, 162, 60, 0.2);
                }
            }
        }
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    }
}

// 响应式布局
@media screen and (max-width: 1600px) {
    .el-col {
        width: 33.33% !important;
    }
}

@media screen and (max-width: 1200px) {
    .el-col {
        width: 50% !important;
    }
}

@media screen and (max-width: 768px) {
    .el-col {
        width: 100% !important;
    }
}
</style>
