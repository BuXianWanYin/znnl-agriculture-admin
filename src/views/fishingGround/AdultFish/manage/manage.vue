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
            <el-row :gutter="20" v-loading="loading">
                <el-col :span="8" v-for="(item, index) in speciesList" :key="index" class="mb-20">
                    <el-card shadow="hover" class="species-card">
                        <div class="card-header">
                            <div class="image-container" @click="previewImage(`${image.baseUrl + item.fishSpeciesImg}`, item)">
                                <img :src="`${image.baseUrl + item.fishSpeciesImg}`" class="species-image" />
                            </div>
                        </div>
                        <div class="card-content">
                            <div class="content-row">
                                <span class="label">鱼名称：</span>
                                <span class="value">{{ item.fishName }}</span>
                            </div>
                            <div class="content-row">
                                <span class="label">英文名称：</span>
                                <span class="value">{{ item.fishEnName }}</span>
                            </div>
                            <div class="content-row">
                                <span class="label">鱼类名称：</span>
                                <span class="value">{{ item.fishSpeciesName }}</span>
                            </div>
                            <div class="content-row">
                                <span class="label">鱼类英文：</span>
                                <span class="value">{{ item.fishSpeciesEnName }}</span>
                            </div>
                        </div>
                        <div class="card-footer">
                            <el-button size="mini" type="primary" icon="el-icon-edit"
                                @click="handleUpdate(item)" v-hasPermi="['fishPasture:species:edit']">修改</el-button>
                            <el-button size="mini" type="danger" icon="el-icon-delete"
                                @click="handleDelete(item)" v-hasPermi="['fishPasture:species:remove']">删除</el-button>
                            <el-button size="mini" type="success" icon="el-icon-document"
                                @click="showStandardJob(item)" v-hasPermi="['fishPasture:species:jobProcess']">作业流程</el-button>
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <el-dialog title="作业流程" :visible.sync="showStandardJobComponent" width="40%" append-to-body
                @close="closeStandardJob">
                <standard-job :germplasm-id="currentspeciesId" v-if="showStandardJobComponent" />
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
                            <img style="width:50px;height:50px;" :src="`${image.baseUrl + form.fishSpeciesImg}`" />
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

    export default {
        name: "Germplasm",
        components: {
            'standard-job': GrowthProcess
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
                }
            };
        },
        created() {
            this.getList();
        },
        methods: {
            showStandardJob(row) {
                this.currentspeciesId = row.speciesId; // 获取当前行的鱼类ID
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
            }
        }
    };
</script>
<!-- scoped 属性会为该样式添加一个特定的选择器，使得这些样式只应用于当前组件的元素 -->
<style scoped>
.mb-20 {
    margin-bottom: 20px;
}

.species-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s;
}

.species-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.card-header {
    text-align: center;
    padding: 15px;
}

.image-container {
    cursor: pointer;
    overflow: hidden;
    margin: 0 auto;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    position: relative;
    background: linear-gradient(145deg, #f3f3f3, #ffffff);
    box-shadow: 
        -8px -8px 15px rgba(255, 255, 255, 0.7),
        8px 8px 15px rgba(0, 0, 0, 0.05),
        inset 0 0 0 2px rgba(255, 255, 255, 0.8);
}

.species-image {
    width: 140px;
    height: 140px;
    object-fit: cover;
    border-radius: 50%;
    padding: 5px;
}

.card-content {
    padding: 10px;
    flex-grow: 1;
}
   
.content-row {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
}

.label {
    color: #606266;
    width: 80px;
    font-size: 14px;
}

.value {
    color: #303133;
    flex: 1;
    font-size: 14px;
}

.card-footer {
    padding: 10px;
    text-align: center;
    border-top: 1px solid #EBEEF5;
}

.card-footer .el-button {
    margin: 0 5px;
}

.image-preview {
    position: relative;
    display: inline-block;
}

.delete-icon {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: #da212a;
    color: white;
    border-radius: 50%;
    padding: 2px;
    font-size: 12px;
    cursor: pointer;
    z-index: 1;
}

.delete-icon:hover {
    background-color: #f78989;
}
</style>
