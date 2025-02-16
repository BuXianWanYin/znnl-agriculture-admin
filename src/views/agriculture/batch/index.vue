<!-- 分区 -->
<template>
    <div class="app-container-sm">
        <el-card class="card-margin-bottom">
            <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px"
                class="form-minus-bottom">
                <el-form-item label="批次名称" prop="batchName">
                    <el-input v-model="queryParams.batchName" placeholder="请输入批次名称" clearable size="small"
                        @keyup.enter.native="handleQuery" />
                </el-form-item>
                <el-form-item label="种质" prop="germplasmId">
                    <el-select v-model="queryParams.germplasmId" size="small" placeholder="请选择种质">
                        <el-option v-for="germplasm in germplasmList" :key="germplasm.germplasmId"
                            :label="germplasm.germplasmName" :value="germplasm.germplasmId"></el-option>
                    </el-select>
                </el-form-item>
                <!-- <el-form-item label="地块" prop="landId">
         <el-select v-model="queryParams.landId" size="small" placeholder="请选择地块">
            <el-option
              v-for="land in landList"
              :key="land.landId"
              :label="land.landName"
              :value="land.landId"
            ></el-option>
          </el-select>
      </el-form-item> -->
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                    <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
                </el-form-item>
                <el-form-item class="fr">
                    <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                        v-hasPermi="['agriculture:batch:add']">新增</el-button>
                    <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
                        v-hasPermi="['agriculture:batch:export']">导出</el-button>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="card-padding-bottom">
            <div v-loading="loading" class="batch-card-grid">
                <el-card v-for="(item, index) in batchList" 
                         :key="index" 
                         class="batch-card"
                         shadow="hover">
                    <div class="batch-card-header">
                        <div class="header-content">
                            <div class="section-name">分区名称</div>
                            <div class="batch-name">{{ item.batchName }}</div>
                        </div>
                        <el-tag :type="item.status == 0 ? 'warning' : 'success'">
                            {{ item.status == 0 ? '未完成' : '已完成' }}
                        </el-tag>
                    </div>
                    
                    <div class="batch-card-content">
                        <div class="batch-image" @click="previewImage(`${image.baseUrl + item.germplasmImg}`, item)">
                            <img :src="`${image.baseUrl + item.germplasmImg}`" alt="种质图片"/>
                        </div>
                        
                        <div class="batch-info">
                            <div class="info-item">
                                <span class="label">种质：</span>
                                <data-tag :options="germplasmList" 
                                         :value="item.germplasmId" 
                                         labelName="germplasmName"
                                         valueName="germplasmId" 
                                         type="" />
                            </div>
                            <div class="info-item">
                                <span class="label">负责人：</span>
                                <data-tag :options="userList" 
                                         :value="item.batchHead" 
                                         labelName="userName"
                                         valueName="userId" 
                                         type="notag" />
                            </div>
                            <div class="info-item">
                                <span class="label">所属大棚：</span>
                                <span>{{ getLabel(item.landId) }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">种植面积：</span>
                                <span>{{ item.cropArea }}亩</span>
                            </div>
                            <div class="info-item">
                                <span class="label">合约地址：</span>
                                <span>{{ item.contractAddress }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">开始时间：</span>
                                <span>{{ parseTime(item.startTime, '{y}-{m}-{d}') }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="batch-card-actions">
                        <el-button size="small" type="primary" icon="el-icon-edit"
                            @click="handleUpdate(item)" 
                            v-hasPermi="['agriculture:batch:edit']">修改</el-button>
                        <el-button size="small" type="danger" icon="el-icon-delete"
                            @click="handleDelete(item)" 
                            v-hasPermi="['agriculture:batch:remove']">删除</el-button>
                        <el-button size="small" plain type="warning" icon="el-icon-s-claim"
                            @click="handleBatchTask(item)"
                            v-hasPermi="['agriculture:batchTask:list']">批次任务</el-button>
                    </div>
                </el-card>
            </div>

            <pagination v-show="total > 0" 
                        :total="total" 
                        :page.sync="queryParams.pageNum"
                        :limit.sync="queryParams.pageSize" 
                        @pagination="getList" />
        </el-card>
        <!-- 添加或修改作物批次对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-alert class="margin-bottom-10" title="新建批次会根据选择种质的种植流程生成批次任务，新增完成可以到批次任务管理界面调整批次任务！" type="warning"
                effect="light" show-icon closable></el-alert>

            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="大棚" prop="houeId">
                    <el-select v-model="form.landId" placeholder="请选择大棚">
                        <el-option v-for="houe in houeList" :key="houe.id" :label="houe.name"
                            :value="houe.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="分区名称" prop="batchName">
                    <el-input v-model="form.batchName" placeholder="请输入分区名称" />
                </el-form-item>
                <el-form-item label="种质" prop="germplasmId">
                    <el-select v-model="form.germplasmId" placeholder="请选择种质">
                        <el-option v-for="germplasm in germplasmList" :key="germplasm.germplasmId"
                            :label="germplasm.cropName" :value="germplasm.germplasmId"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="种植面积" prop="cropArea">
                    <el-input v-model="form.cropArea" placeholder="请输入种植面积">
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
    } from "@/api/agriculture/batch";
    import {
        listGermplasm
    } from "@/api/agriculture/germplasm";
    import {
        listUser
    } from "@/api/system/user";
    import {
        listLand
    } from "@/api/agriculture/land";
    import Task from "../components/Task";

    export default {
        name: "Batch",
        dicts: ['agriculture_batch_task_status'],
        data() {
            return {
                //图片预览
                image: {
                    baseUrl: window.location.origin + process.env.VUE_APP_BASE_API,
                    open: false,
                    imgUrl: '',
                    title: ''
                },
                //种植计划
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
                germplasmList: [],
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
                    germplasmId: null,
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
                    germplasmId: [{
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
                        message: "种植面积不能为空",
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
            this.getGermplasmList();
            this.getUserList();
            this.$http.get("/dev-api/iaPasture/list").then(res => {
                this.houeList = res.data.data;
                console.log(this.houe)
            })
        },
        methods: {
            /** 查询作物批次列表 */
            getLabel(landId) {
                const houe = this.houeList.find(item => item.id === landId);
                return houe ? houe.name : '未知大棚';
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
            getGermplasmList() {
                listGermplasm().then(response => {
                    this.germplasmList = response.rows;
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
                    germplasmId: null,
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
                this.download('agriculture/batch/export', {
                    ...this.queryParams
                }, `batch_${new Date().getTime()}.xlsx`)
            },
            /** 种植计划按钮操作 */
            handleBatchTask(row) {
                this.batchTask.open = true;
                this.batchTask.title = '种植计划';
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

    .batch-card-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px; 
        padding: 20px;
    }

    .batch-card {
        background: #fff;
        border-radius: 8px;
        width: 100%;
        
        .batch-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 15px 20px;
            border-bottom: 1px solid #ebeef5;

            .header-content {
                .section-name {
                    font-size: 12px;
                    color: #909399;
                    margin-bottom: 4px;
                }

                .batch-name {
                    font-size: 16px;
                    font-weight: bold;
                    color: #303133;
                }
            }
        }

        .batch-card-content {
            padding: 20px;
            display: flex;
            flex-direction: row;
            gap: 20px;
            align-items: center;

            .batch-image {
                flex-shrink: 0;
                text-align: center;
                margin: 0 auto;
                width: 150px;
                height: 150px;
                overflow: hidden;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1),
                            0 2px 6px rgba(0, 0, 0, 0.08);
                background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
                padding: 4px;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                }
            }

            .batch-info {
                flex: 1;
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
                padding: 0 10px;

                .info-item {
                    display: flex;
                    align-items: flex-start;
                    font-size: 14px;

                    .label {
                        color: #606266;
                        min-width: 80px;
                        margin-right: 8px;
                    }

                    span {
                        word-break: break-all;
                        line-height: 1.4;
                    }
                }
            }
        }

        .batch-card-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            padding: 15px 20px;
            border-top: 1px solid #ebeef5;
        }
    }

    ::v-deep .el-card.is-hover-shadow:hover {
        box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
        transition: all 0.3s;
    }
</style>
