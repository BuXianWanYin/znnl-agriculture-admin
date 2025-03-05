<template>
<!--
 鱼类管理页面
 -->
    <div class="app-container-sm">
        <el-card class="card-margin-bottom">
            <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px"
                class="form-minus-bottom">
                <el-form-item label="鱼名称" prop="fishName">
                    <el-input v-model="queryParams.fishName" placeholder="请输入鱼名称" clearable size="small"
                        @keyup.enter.native="handleQuery" />
                </el-form-item>
                <el-form-item label="鱼类名称" prop="fishSpeciesName">
                    <el-input v-model="queryParams.fishSpeciesName" placeholder="请输入鱼类名称" clearable size="small"
                        @keyup.enter.native="handleQuery" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                    <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
                </el-form-item>
                <el-form-item class="fr">
                    <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                        v-hasPermi="['fishPasture:species:add']">新增</el-button>
                    <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
                        v-hasPermi="['fishPasture:species:export']">导出</el-button>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="card-padding-bottom">
            <el-row :gutter="24">
                <el-col :span="6" v-for="(item, index) in speciesList" :key="index">
                    <el-card class="species-card" shadow="hover">
                        <div class="species-card-header">
                            <div class="header-content">
                                <div class="section-name">鱼类信息</div>
                                <div class="species-name">{{ item.fishName }}</div>
                            </div>
                        </div>

                        <div class="species-image" @click="previewImage(`${image.baseUrl + item.fishSpeciesImg}`, item)">
                            <img :src="`${image.baseUrl + item.fishSpeciesImg}`" alt="鱼类图片"/>
                        </div>
                        
                        <div class="species-card-content">
                            <div class="species-info">
                                <div class="info-group">
                                    <div class="info-row">
                                        <div class="info-item">
                                            <i class="el-icon-menu"></i>
                                            <span class="label">鱼名称：</span>
                                            <span class="value">{{ item.fishName }}</span>
                                        </div>
                                        <div class="info-item">
                                            <i class="el-icon-edit-outline"></i>
                                            <span class="label">英文名称：</span>
                                            <span class="value">{{ item.fishEnName }}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="info-group">
                                    <div class="info-row">
                                        <div class="info-item">
                                            <i class="el-icon-document"></i>
                                            <span class="label">鱼类名称：</span>
                                            <span class="value">{{ item.fishSpeciesName }}</span>
                                        </div>
                                        <div class="info-item">
                                            <i class="el-icon-tickets"></i>
                                            <span class="label">鱼类英文：</span>
                                            <span class="value">{{ item.fishSpeciesEnName }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="species-card-actions">
                            <el-button size="small" type="primary" icon="el-icon-edit"
                                @click="handleUpdate(item)" 
                                v-hasPermi="['fishPasture:species:edit']">修改</el-button>
                            <el-button size="small" type="danger" icon="el-icon-delete"
                                @click="handleDelete(item)" 
                                v-hasPermi="['fishPasture:species:remove']">删除</el-button>
                            <el-button size="small" plain type="warning" icon="el-icon-s-claim"
                                @click="showStandardJob(item)" 
                                v-hasPermi="['fishPasture:species:jobProcess']">作业流程</el-button>
                            <el-button size="small" plain type="success" icon="el-icon-s-data"
                                @click="showAIReport(item)"
                                v-hasPermi="['fishPasture:species:aiReport']">智能分析</el-button>
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <el-dialog title="作业流程" :visible.sync="showStandardJobComponent" width="40%" append-to-body
                @close="closeStandardJob">
                <standard-job :germplasm-id="currentspeciesId" :name="fishName" :typeName="fishSpeciesName" v-if="showStandardJobComponent" />
            </el-dialog>
            <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
                :limit.sync="queryParams.pageSize" @pagination="getList" />
        </el-card>
        <!-- 添加或修改种质对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="鱼名称" prop="fishName">
                    <el-input v-model="form.fishName" placeholder="请输入鱼名称" />
                </el-form-item>
                <el-form-item label="鱼英文名称" prop="fishEnName">
                    <el-input v-model="form.fishEnName" placeholder="请输入鱼英文名称" />
                </el-form-item>
                <el-form-item label="鱼类名称" prop="fishSpeciesName">
                    <el-input v-model="form.fishSpeciesName" placeholder="请输入鱼类名称" />
                </el-form-item>
                <el-form-item label="鱼类英文名称" prop="fishSpeciesEnName">
                    <el-input v-model="form.fishSpeciesEnName" placeholder="请输入鱼类英文名称" />
                </el-form-item>
                <el-form-item label="鱼类图片" prop="fishSpeciesImg">
                    <div v-if="form.fishSpeciesImg">
                        <!-- 已有图片时显示图片和删除按钮 -->
                        <div class="image-preview">
                            <img style="width:148px;height:148px;" :src="`${image.baseUrl + form.fishSpeciesImg}`" />
                            <!-- 点击时将图片值设为 null，从而清除图片 -->
                            <i class="el-icon-close delete-icon" @click="form.fishSpeciesImg = null"></i>
                        </div>
                    </div>
                    <!-- 没有图片时显示上传组件 -->
                    <imageUpload 
                        v-else 
                        v-model="form.fishSpeciesImg"
                        :limit="1"
                        @change="validateField('fishSpeciesImg')"
                    />
                </el-form-item>
                <el-form-item label="宣传语" prop="fishSpeciesDes">
                    <el-input v-model="form.fishSpeciesDes" type="textarea" placeholder="请输入内容" />
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
        <!-- 添加 AI 报告组件 -->
        <ai-report 
            :visible.sync="aiReportVisible"
            :fish-data="currentFishData"
        />
    </div>
</template>

<script>
    import {
        listGermplasm,
        getGermplasm,
        delGermplasm,
        addGermplasm,
        updateGermplasm
    } from "@/api/fishingGround/species";
    import GrowthProcess from "@/views/fishingGround/AdultFish/manage/GrowthProcess.vue"
    import AIReport from '@/components/AI/AIReport.vue'

    export default {
        name: "Germplasm",
        components: {
            'standard-job': GrowthProcess,
            'ai-report': AIReport
        },
        data() {
            return {
                showStandardJobComponent: false, // 控制组件显示的变量
                speciesId: null, // 当前选中的种质ID
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
                speciesList: [],
                // 弹出层标题
                title: "",
                // 是否显示弹出层
                open: false,
                // 查询参数
                queryParams: {
                    pageNum: 1,
                    pageSize: 10,
                    fishName: null,
                    fishSpeciesName: null,
                },
                // 表单参数
                form: {},
                // 表单校验
                rules: {
                    speciesId: [{
                        required: true,
                        message: "鱼类ID不能为空",
                        trigger: "blur"
                    }],
                    fishName: [{
                        required: true,
                        message: "鱼名称不能为空",
                        trigger: "blur"
                    }],
                    fishEnName: [{
                        required: true,
                        message: "鱼英文名称不能为空",
                        trigger: "blur"
                    }],
                    fishSpeciesName: [{
                        required: true,
                        message: "鱼类名称不能为空",
                        trigger: "blur"
                    }],
                    fishSpeciesEnName: [{
                        required: true,
                        message: "鱼类英文名称不能为空",
                        trigger: "blur"
                    }],
                    fishSpeciesImg: [{
                        required: true,
                        message: "鱼类图片不能为空",
                        trigger: ["blur", "change"]
                    }],
                },
                fishName: '', // 鱼名称
                fishSpeciesName: '', // 鱼类名称 
                aiReportVisible: false,
                currentFishData: null,
            };
        },
        created() {
            this.getList();
        },
        methods: {
            showStandardJob(row) {
                this.currentspeciesId = row.speciesId; // 获取当前行的鱼类ID
                this.fishName = row.fishName; // 获取当前行的鱼名称
                this.fishSpeciesName = row.fishSpeciesName; // 获取当前行的鱼类名称
                this.showStandardJobComponent = true; // 显示组件
            },
            closeStandardJob() {
                this.showStandardJobComponent = false; // 关闭组件
            },
            /** 查询鱼类列表 */
            getList() {
                this.loading = true;
                listGermplasm(this.queryParams).then(response => {
                    this.speciesList = response.rows;
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
                    speciesId: null,
                    fishName: null,
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
                this.title = "添加鱼类";
            },
            /** 修改按钮操作 */
            handleUpdate(row) {
                this.reset();
                const speciesId = row.speciesId || this.ids
                getGermplasm(speciesId).then(response => {
                    this.form = response.data;
                    this.open = true;
                    this.title = "修改鱼类";
                });
            },
            /** 提交按钮 */
            submitForm() {
                this.$refs["form"].validate(valid => {
                    if (valid) {
                        if (this.form.speciesId != null) {
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
                const speciesIds = row.speciesId || this.ids;
                this.$modal.confirm('是否确认删除鱼类编号为"' + speciesIds + '"的数据项？').then(function() {
                    return delGermplasm(speciesIds);
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
                this.download('fishPasture/species/export', {
                    ...this.queryParams
                }, `germplasm_${new Date().getTime()}.xlsx`)
            },
            validateField(field) {
                // 手动触发特定字段的验证
                this.$refs.form.validateField(field);
            },
            /** AI报告按钮操作 */
            showAIReport(row) {
                this.currentFishData = row
                this.aiReportVisible = true
            },
        }
    };
</script>
<!-- scoped 属性会为该样式添加一个特定的选择器，使得这些样式只应用于当前组件的元素 -->
<style lang="scss" scoped>
.species-card-grid {
    padding: 20px;
}

// 修改行和列的间距
.el-row {
    margin: 0 -12px;
}

.el-col {
    padding: 0 12px;
    margin-bottom: 24px;
}

.species-card {
    height: 100%;
    background: white;
    border-radius: 12px;
    padding: 12px;
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    
    .species-card-header {
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

            .species-name {
                font-size: 14px;
                font-weight: 600;
                color: #333;
            }
        }
    }
    
    .species-image {
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

    .species-card-content {
        padding: 0;
        
        .species-info {
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

    .species-card-actions {
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
            
            &.el-button--success {
                background-color: #f0f9eb;
                border-color: transparent;
                color: #67c23a;
                
                &:hover {
                    background-color: #67c23a;
                    color: #ffffff;
                    transform: translateY(-2px);
                    box-shadow: 0 2px 8px rgba(103, 194, 58, 0.2);
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

.ai-report-dialog {
    .ai-report-content {
        .report-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 24px;
            padding-bottom: 24px;
            border-bottom: 1px solid #EBEEF5;

            .fish-info {
                display: flex;
                align-items: center;
                gap: 16px;

                .fish-avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 8px;
                    object-fit: cover;
                }

                .fish-details {
                    h2 {
                        margin: 0 0 8px;
                        font-size: 24px;
                        color: #303133;
                    }
                    p {
                        margin: 0;
                        color: #909399;
                    }
                }
            }

            .report-meta {
                display: flex;
                flex-direction: column;
                gap: 8px;
                color: #909399;
                font-size: 14px;
            }
        }

        .data-overview {
            margin-bottom: 24px;

            .data-card {
                background: #F8F9FB;
                border-radius: 8px;
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;

                i {
                    font-size: 24px;
                    color: #409EFF;
                }

                .data-info {
                    display: flex;
                    flex-direction: column;

                    .label {
                        font-size: 14px;
                        color: #909399;
                    }

                    .value {
                        font-size: 18px;
                        color: #303133;
                        font-weight: 600;
                    }
                }
            }
        }

        .report-sections {
            .report-section {
                margin-bottom: 32px;

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 16px;

                    i {
                        font-size: 20px;
                        color: #409EFF;
                    }

                    h3 {
                        margin: 0;
                        font-size: 18px;
                        color: #303133;
                    }
                }

                .section-content {
                    background: #F8F9FB;
                    border-radius: 8px;
                    padding: 20px;

                    .growth-indicators {
                        margin-top: 16px;
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 16px;

                        .indicator {
                            .indicator-label {
                                display: block;
                                margin-bottom: 8px;
                                color: #606266;
                            }
                        }
                    }

                    .market-analysis {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 20px;

                        h4 {
                            margin: 0 0 12px;
                            color: #303133;
                        }

                        p {
                            margin: 0;
                            color: #606266;
                            line-height: 1.6;
                        }
                    }
                }
            }
        }
    }
}

@media screen and (max-width: 1200px) {
    .ai-report-dialog {
        .ai-report-content {
            .report-sections {
                .section-content {
                    .market-analysis {
                        grid-template-columns: 1fr;
                    }
                }
            }
        }
    }
}
</style>
