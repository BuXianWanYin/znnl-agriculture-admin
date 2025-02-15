<template>
    <!--
    分区养殖页面
    -->
    <div class="app-container-sm">
        <el-card class="card-margin-bottom">
            <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px"
                class="form-minus-bottom">
                <el-form-item label="批次名称" prop="batchName">
                    <el-input v-model="queryParams.batchName" placeholder="请输入批次名称" clearable size="small"
                        @keyup.enter.native="handleQuery" />
                </el-form-item>
                <el-form-item label="种质" prop="speciesId">
                    <el-select v-model="queryParams.speciesId" size="small" placeholder="请选择种质">
                        <el-option v-for="fishPasture in speciesList" :key="fishPasture.speciesId"
                            :label="fishPasture.fishName" :value="fishPasture.speciesId"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                    <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
                </el-form-item>
                <el-form-item class="fr">
                    <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                        v-hasPermi="['fishPasture:batch:add']">新增</el-button>
                    <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
                        v-hasPermi="['fishPasture:batch:export']">导出</el-button>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="card-padding-bottom">
            <el-table v-loading="loading" :data="batchList">
                <el-table-column type="index" label="序号"> </el-table-column>
                <el-table-column label="批次名称" align="center" prop="batchName" />
                <el-table-column label="种质" align="center" prop="speciesId">
                    <template slot-scope="scope">
                        <data-tag :options="speciesList" :value="scope.row.speciesId" labelName="fishName"
                            valueName="speciesId" type="" />
                    </template>
                </el-table-column>
                <el-table-column label="负责人" align="center" prop="batchHead">
                    <template slot-scope="scope">
                        <data-tag :options="userList" :value="scope.row.batchHead" labelName="userName"
                            valueName="userId" type="notag" />
                    </template>
                </el-table-column>
                <el-table-column label="种质图片" align="center" prop="introImg" width="180">
                    <template v-slot:default="{ row }">
                        <div class="image" @click="previewImage(`${image.baseUrl + row.fishSpeciesImg}`, row)">
                            <img style="width:50px;height:50px;" :src="`${image.baseUrl + row.fishSpeciesImg}`" />
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="所属鱼池" align="center" prop="landId">
                    <template slot-scope="scope">
                        {{ getLabel(scope.row.landId) }}
                        <!-- <data-tag :options="landList" :value="scope.row.landId" labelName="landName" valueName="landId"
              type="warning" /> -->
                    </template>
                </el-table-column>
                <el-table-column label="状态" align="center" prop="status">
                    <template slot-scope="scope">
                        {{ scope.row.status == 0 ? '未完成' : '已完成' }}
                    </template>
                </el-table-column>
                <!-- :options="scope.row.status==0?'未完成':'已完成'" -->
                <el-table-column label="养殖面积(亩)" align="center" prop="cropArea" />
                <el-table-column label="合约地址" align="center" prop="contractAddress" />
                <el-table-column label="开始时间" align="center" prop="startTime" width="180">
                    <template slot-scope="scope">
                        <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300">
                    <template slot-scope="scope">
                        <el-button size="small" class="padding-5" type="primary" icon="el-icon-edit"
                            @click="handleUpdate(scope.row)" v-hasPermi="['fishPasture:batch:edit']">修改</el-button>
                        <el-button size="small" class="padding-5" type="danger" icon="el-icon-delete"
                            @click="handleDelete(scope.row)" v-hasPermi="['fishPasture:batch:remove']">删除</el-button>
                        <el-button size="small" class="padding-5" plain type="warning" icon="el-icon-s-claim"
                            @click="handleBatchTask(scope.row)"
                            v-hasPermi="['fishPasture:batchTask:list']">批次任务</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
                :limit.sync="queryParams.pageSize" @pagination="getList" />
        </el-card>
        <!-- 添加或修改作物批次对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-alert class="margin-bottom-10" title="新建批次会根据选择种质的种植流程生成批次任务，新增完成可以到批次任务管理界面调整批次任务！" type="warning"
                effect="light" show-icon closable></el-alert>

            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="鱼池" prop="houeId">
                    <el-select v-model="form.landId" placeholder="请选择鱼池">
                        <el-option v-for="houe in houeList" :key="houe.id" :label="houe.name"
                            :value="houe.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="分区名称" prop="batchName">
                    <el-input v-model="form.batchName" placeholder="请输入分区名称" />
                </el-form-item>
                <el-form-item label="种质" prop="speciesId">
                    <el-select v-model="form.speciesId" placeholder="请选择种质">
                        <el-option v-for="fishPasture in speciesList" :key="fishPasture.speciesId"
                            :label="fishPasture.fishName" :value="fishPasture.speciesId"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="养殖面积" prop="cropArea">
                    <el-input v-model="form.cropArea" placeholder="请输入养殖面积">
                        <template slot="append">亩</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="开始时间" prop="startTime">
                    <el-date-picker clearable size="medium" v-model="form.startTime" type="date"
                        value-format="yyyy-MM-dd" placeholder="选择开始时间">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="负责人" prop="batchHead">
                    <el-select v-model="form.batchHead" placeholder="请选择负责人">
                        <el-option v-for="user in userList" :key="user.userId" :label="user.nickName"
                            :value="user.userId"></el-option>
                    </el-select>
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
        <!-- 种植计划对话框 -->
        <el-dialog v-if="batchTask.open" :title="batchTask.title" :visible.sync="batchTask.open" width="1300px">
            <div style="height:500px;width:100%;overflow:auto;">
                <task :batchId="this.batchTask.batchId" :tableBorder="true"></task>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import {
        listBatch,
        getBatch,
        delBatch,
        addBatch,
        updateBatch
    } from "@/api/fishingGround/batch";
    import {
        listGermplasm
    } from "@/api/fishingGround/species";
    import {
        listUser
    } from "@/api/system/user";
    import {
        listLand
    } from "@/api/agriculture/land";
    import Task from "@/views/fishingGround/Task/task";

    export default {
        name: "Batch",
        dicts: ['fishPasture_batch_task_status'],
        data() {
            return {
                //图片预览
                image: {
                    baseUrl: window.location.origin + process.env.VUE_APP_BASE_API,
                    open: false,
                    imgUrl: '',
                    title: ''
                },
                //养殖计划
                batchTask: {
                    open: false,
                    title: '',
                    batchId: null
                },
                houeList: [],
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
                // 作物批次表格数据
                batchList: [],
                //地块下拉数据
                landList: [],
                //种质下拉数据
                speciesList: [],
                //用户下拉数据
                userList: [],
                // 弹出层标题
                title: "",
                // 是否显示弹出层
                open: false,
                // 查询参数
                queryParams: {
                    pageNum: 1,
                    pageSize: 10,
                    batchName: null,
                    speciesId: null,
                    landId: null,
                },
                // 表单参数
                form: {},
                // 表单校验
                rules: {
                    batchName: [{
                        required: true,
                        message: "批次名称不能为空",
                        trigger: "blur"
                    }],
                    speciesId: [{
                        required: true,
                        message: "种质ID不能为空",
                        trigger: "blur"
                    }],
                    landId: [{
                        required: true,
                        message: "地块ID不能为空",
                        trigger: "blur"
                    }],
                    cropArea: [{
                        required: true,
                        message: "养殖面积不能为空",
                        trigger: "blur"
                    }],
                    startTime: [{
                        required: true,
                        message: "开始时间不能为空",
                        trigger: "blur"
                    }],
                    batchHead: [{
                        required: true,
                        message: "负责人不能为空",
                        trigger: "blur"
                    }],
                }
            };
        },
        created() {
            this.getList();
            this.getLandList();
            this.getspeciesList();
            this.getUserList();
            this.$http.get("/dev-api/fishPasture/list").then(res => {
                this.houeList = res.data.data;
                console.log(this.houe)
            })
        },
        methods: {
            /** 查询作物批次列表 */
            getLabel(landId) {
                const houe = this.houeList.find(item => item.id === landId);
                return houe ? houe.name : '未知鱼池';
            },
            getList() {
                this.loading = true;
                listBatch(this.queryParams).then(response => {
                    this.batchList = response.rows;
                    this.total = response.total;
                    this.loading = false;
                });
            },
            /** 查询地块列表 */
            getLandList() {
                listLand().then(response => {
                    this.landList = response.rows;
                });
            },
            /** 查询种质列表 */
            getspeciesList() {
                listGermplasm().then(response => {
                    this.speciesList = response.rows;
                });
            },
            /** 查询用户列表 */
            getUserList() {
                listUser().then(response => {
                    this.userList = response.rows;
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
                    batchId: null,
                    batchName: null,
                    speciesId: null,
                    landId: null,
                    cropArea: null,
                    startTime: null,
                    batchHead: null,
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
                this.title = "添加作物批次";
            },
            /** 修改按钮操作 */
            handleUpdate(row) {
                this.reset();
                const batchId = row.batchId || this.ids
                getBatch(batchId).then(response => {
                    this.form = response.data;
                    this.open = true;
                    this.title = "修改作物批次";
                });
            },
            /** 提交按钮 */
            submitForm() {
                this.$refs["form"].validate(valid => {
                    if (valid) {
                        if (this.form.batchId != null) {
                            updateBatch(this.form).then(response => {
                                this.$modal.msgSuccess("修改成功");
                                this.open = false;
                                this.getList();
                            });
                        } else {
                            addBatch(this.form).then(response => {
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
                const batchIds = row.batchId || this.ids;
                this.$modal.confirm('是否确认删除作物批次编号为"' + batchIds + '"的数据项？').then(function() {
                    return delBatch(batchIds);
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
                this.download('fishPasture/batch/export', {
                    ...this.queryParams
                }, `batch_${new Date().getTime()}.xlsx`)
            },
            /** 养殖计划按钮操作 */
            handleBatchTask(row) {
                this.batchTask.open = true;
                this.batchTask.title = '养殖计划';
                this.batchTask.batchId = row.batchId;
            }
        },
        components: {
            Task
        }
    };
</script>
<style lang="scss" scoped>
    ::v-deep .el-select {
        width: 100%;
    }

    ::v-deep .el-date-editor.el-input {
        width: 100%;
    }
</style>
