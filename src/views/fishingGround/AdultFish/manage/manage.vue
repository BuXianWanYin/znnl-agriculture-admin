 <template>
<!--
 管理成鱼页面
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
            <el-table v-loading="loading" :data="speciesList">
                <el-table-column type="index" label="序号"> </el-table-column>
                <el-table-column label="鱼名称" align="center" prop="fishName" />
                <el-table-column label="鱼英文名称" align="center" prop="fishEnName" />
                <el-table-column label="鱼类名称" align="center" prop="fishSpeciesName" />
                <el-table-column label="鱼类英文名称" align="center" prop="fishSpeciesEnName" />
                <el-table-column label="鱼类图片" align="center" prop="fishSpeciesImg" width="180">
                    <template v-slot:default="{ row }">
                        <div class="image" @click="previewImage(`${image.baseUrl + row.fishSpeciesImg}`, row)">
                            <img style="width:50px;height:50px;" :src="`${image.baseUrl + row.fishSpeciesImg}`" />
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" class="padding-5" icon="el-icon-edit"
                            @click="handleUpdate(scope.row)" v-hasPermi="['fishPasture:species:edit']">修改</el-button>
                        <el-button size="mini" type="danger" class="padding-5" icon="el-icon-delete"
                            @click="handleDelete(scope.row)"
                            v-hasPermi="['fishPasture:species:remove']">删除</el-button>
                        <el-button size="mini" type="success" class="padding-5" icon="el-icon-document"
                            @click="showStandardJob(scope.row)"
                            v-hasPermi="['fishPasture:species:jobProcess']">作业流程</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-dialog title="作业流程" :visible.sync="showStandardJobComponent" width="40%" append-to-body
                @close="closeStandardJob">
                <standard-job :speciesId="currentspeciesId" v-if="showStandardJobComponent" />
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
                    <imageUpload v-model="form.fishSpeciesImg" />
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
            GrowthProcess
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
                        trigger: "blur"
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
            }
        }
    };
</script>
