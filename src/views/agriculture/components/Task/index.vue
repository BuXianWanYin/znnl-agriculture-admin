<template>
    <div class="gantt-container">
        <div class="search">
            <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="100px">
                <el-form-item label="任务名称" prop="taskName">
                    <el-input v-model="queryParams.taskName" placeholder="请输入任务名称" clearable size="small"
                        @keyup.enter.native="handleQuery" />
                </el-form-item>
                <el-form-item label="计划开始日期" prop="psr">
                    <el-date-picker size="small" v-model="queryParams.psr" type="daterange" range-separator="-"
                        start-placeholder="时间范围开始" value-format="yyyy-MM-dd" end-placeholder="时间范围结束">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size="mini" @click="handleQuery"><svg-icon icon-class="ss"></svg-icon>搜索</el-button>
                    <el-button size="mini" @click="resetQuery"><svg-icon icon-class="cz"></svg-icon>重置</el-button>
                </el-form-item>
                <el-form-item class="fr">
                    <el-button 
                        class="width-90" 
                        v-if="tableBorder" 
                        type="primary"
                        :disabled="!checkPermi(['agriculture:batchTask:add'])" 
                        size="mini" 
                        plain 
                        icon="el-icon-plus"
                        @click="handleAdd">新增任务</el-button>
                    <el-button 
                        type="primary" 
                        @click="handleChange('table')" 
                        :plain="gantt" 
                        size="mini"
                        icon="el-icon-s-order">列表</el-button>
                    <el-button 
                        type="primary" 
                        @click="handleChange('gantt')" 
                        :plain="!gantt" 
                        size="mini"
                        icon="el-icon-s-unfold">甘特图</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="table">
            <div v-if="!gantt" class="task-list" v-loading="loading">
                <el-card 
                    v-for="task in taskList" 
                    :key="task.taskId"
                    class="task-card" 
                    :class="{'task-completed': task.status == 1}"
                    shadow="always"
                >
                    <div class="task-content">
                        <div class="task-main">
                            <div class="task-name" :class="{'task-name-completed': task.status == 1}">
                                {{ task.taskName }}
                            </div>
                            <div class="task-info">
                                <span class="info-item">
                                    <i class="el-icon-date"></i>
                                    计划时间：{{ parseTime(task.planStart, "{y}-{m}-{d}") }} 至 {{ parseTime(task.planFinish, "{y}-{m}-{d}") }}
                                </span>
                                <span class="info-item" v-if="shouldShowActualTime(task)">
                                    <i class="el-icon-time"></i>
                                    实际时间：{{ parseTime(task.actualStart, "{y}-{m}-{d}") }} 至 {{ parseTime(task.actualFinish, "{y}-{m}-{d}") }}
                                </span>
                            </div>
                        </div>

                        <div class="task-actions">
                            <dict-tag 
                                :options="dict.type.agriculture_batch_task_status" 
                                :value="task.status"
                                class="status-tag"
                            />
                            <div class="action-buttons">
                                <el-button 
                                    size="small" 
                                    type="primary" 
                                    plain 
                                    icon="el-icon-edit"
                                    @click="handleTask(task.taskId)" 
                                    v-if="!tableBorder"
                                    v-hasPermi="['agriculture:batchTask:query']">任务处理</el-button>
                                <el-button 
                                    size="small" 
                                    type="primary" 
                                    plain
                                    icon="el-icon-edit"
                                    @click="handleUpdate(task)" 
                                    v-if="tableBorder"
                                    v-hasPermi="['agriculture:batchTask:edit']">修改</el-button>
                                <el-button 
                                    size="small" 
                                    type="danger" 
                                    plain
                                    icon="el-icon-delete"
                                    @click="handleDelete(task)" 
                                    v-if="tableBorder"
                                    v-hasPermi="['agriculture:batchTask:remove']">删除</el-button>
                            </div>
                        </div>
                    </div>
                </el-card>
                
                <pagination 
                    v-show="total > 0" 
                    :total="total" 
                    :page.sync="queryParams.pageNum"
                    :limit.sync="queryParams.pageSize" 
                    @pagination="getList" 
                />
            </div>
            <gantt v-else class="gantt" :tasks="tasks"></gantt>
        </div>
        <!-- 添加或修改批次任务对话框 -->
        <el-dialog :title="title2" :visible.sync="open2" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="110px">
                <!-- <el-form-item label="批次ID" prop="batchId">
          <el-input v-model="form.batchId" placeholder="请输入批次ID" />
        </el-form-item> -->
                <el-form-item label="任务名称" prop="taskName">
                    <el-input v-model="form.taskName" placeholder="请输入任务名称" />
                </el-form-item>
                <el-form-item label="计划开始日期" prop="planStart">
                    <el-date-picker clearable class="w100" v-model="form.planStart" type="date"
                        value-format="yyyy-MM-dd" placeholder="选择计划开始日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="计划结束日期" prop="planFinish">
                    <el-date-picker clearable class="w100" v-model="form.planFinish" type="date"
                        value-format="yyyy-MM-dd" placeholder="选择计划结束日期">
                    </el-date-picker>
                </el-form-item>
                <!-- <el-form-item label="实际开始日期" prop="actualStart">
          <el-date-picker clearable size="small"
            v-model="form.actualStart"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择实际开始日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="实际结束日期" prop="actualFinish">
          <el-date-picker clearable size="small"
            v-model="form.actualFinish"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择实际结束日期">
          </el-date-picker>
        </el-form-item> -->
                <el-form-item label="任务详情" prop="remark">
                    <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitForm">确 定</el-button>
                <el-button @click="cancel2">取 消</el-button>
            </div>
        </el-dialog>
        <!-- 添加或修改批次任务对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="1100px" append-to-body v-if="open" @close="cancel">
            <task-detail :opr-type="oprType" :task-id="taskId"></task-detail>
        </el-dialog>
    </div>
</template>

<script>
    import {
        checkPermi
    } from '@/utils/permission';
    import {
        listBatchTask,
        getBatchTask,
        addBatchTask,
        updateBatchTask,
        delBatchTask
    } from "@/api/agriculture/batchTask";
    import TaskDetail from "../TaskDetail";
    import Gantt from "@/components/Gantt";
    export default {
        name: "BatchTask",
        components: {
            TaskDetail,
            Gantt
        },
        props: {
            batchId: [Number],
            tableBorder: {
                type: Boolean,
                default: false,
            },
        },
        dicts: ['agriculture_batch_task_status'],
        data() {
            return {
                //gantt
                gantt: false,
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
                // 批次任务表格数据
                taskList: [],
                open: false,
                title: '',
                //任务id
                taskId: null,
                //操作类型：add和update
                oprType: null,
                // 查询参数
                queryParams: {
                    pageNum: 1,
                    pageSize: 10,
                    taskName: null,
                    planStart: null,
                    planStartStart: null,
                    planStartEnd: null,
                    planFinish: null,
                    batchId: this.batchId,
                    psr: null,
                },
                tasks: {
                    data: [],
                },
                title2: '',
                open2: false,
                // 表单参数
                form: {},
                // 表单校验
                rules: {
                    taskName: [{
                        required: true,
                        message: "任务名称不能为空",
                        trigger: "blur"
                    }],
                    planStart: [{
                        required: true,
                        message: "计划开始日期不能为空",
                        trigger: "blur"
                    }],
                    planFinish: [{
                        required: true,
                        message: "计划结束日期不能为空",
                        trigger: "blur"
                    }],
                    actualStart: [{
                        required: true,
                        message: "实际开始日期不能为空",
                        trigger: "blur"
                    }],
                    actualFinish: [{
                        required: true,
                        message: "实际结束日期不能为空",
                        trigger: "blur"
                    }],
                }
            };
        },
        watch: {
            batchId: {
                handler: function(n, o) {
                    this.queryParams.batchId = n;
                    this.getList();
                },
            }
        },
        created() {
            this.getList();
            gantt.config.columns = [{
                name: "text",
                label: "任务名称",
                tree: true,
                width: "200"
            }, ];

            gantt.attachEvent("onTaskDblClick", (id, e) => {
                this.handleTask(Number(id)) //TODO: 【项目】导致甘特图左移
                return false;
            });
        },
        methods: {
            checkPermi,
            /** 查询批次任务列表 */
            getList() {
                this.loading = true;
                const {
                    queryParams: {
                        psr
                    },
                } = this;
                if (psr && Array.isArray(psr) && psr.length == 2) {
                    this.queryParams.params = {
                        planStartStart: psr[0],
                        planStartEnd: psr[1],
                    };
                } else {
                    this.queryParams.params = {
                        planStartStart: null,
                        planStartEnd: null,
                    };
                }
                listBatchTask(this.queryParams).then((response) => {
                    this.taskList = response.rows;
                    this.total = response.total;
                    this.loading = false;
                    this.tasks.data = this.taskList.map((item) => ({
                        text: item.taskName,
                        id: item.taskId,
                        start_date: new Date(`${item.planStart} 00:00:00`),
                        end_date: new Date(`${item.planFinish} 00:00:00`),
                        color: "#2b7",
                    }));
                });
            },
            // 取消按钮
            cancel2() {
                this.open2 = false;
                this.reset();
            },
            // 表单重置
            reset() {
                this.form = {
                    taskId: null,
                    batchId: null,
                    taskName: null,
                    planStart: null,
                    planFinish: null,
                    actualStart: null,
                    actualFinish: null,
                    taskDetail: null,
                    taskImages: null,
                    taskVideos: null,
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
            /** 处理任务按钮 */
            handleTask(taskId) {
                this.taskId = taskId;
                this.oprType = 'update';
                this.open = true;
                this.title = "编辑任务";
            },
            /** 新增按钮操作 */
            handleAdd() {
                this.reset();
                this.open2 = true;
                this.title2 = "添加批次任务";
                this.form.batchId = this.batchId;
            },
            /** 修改按钮操作 */
            handleUpdate(row) {
                this.reset();
                const taskId = row.taskId || this.ids
                getBatchTask(taskId).then(response => {
                    this.form = response.data;
                    this.open2 = true;
                    this.title2 = "修改批次任务";
                });
            },
            /** 提交按钮 */
            submitForm() {
                this.$refs["form"].validate(valid => {
                    if (valid) {
                        if (this.form.taskId != null) {
                            updateBatchTask(this.form).then(response => {
                                this.$modal.msgSuccess("修改成功");
                                this.open2 = false;
                                this.getList();
                            });
                        } else {
                            addBatchTask(this.form).then(response => {
                                this.$modal.msgSuccess("新增成功");
                                this.open2 = false;
                                this.getList();
                            });
                        }
                    }
                });
            },
            /** 删除按钮操作 */
            handleDelete(row) {
                const taskIds = row.taskId || this.ids;
                this.$modal
                    .confirm('是否确认删除批次任务编号为"' + taskIds + '"的数据项？')
                    .then(function() {
                        return delBatchTask(taskIds);
                    })
                    .then(() => {
                        this.getList();
                        this.$modal.msgSuccess("删除成功");
                    })
                    .catch(() => {});
            },
            /** 导出按钮操作 */
            handleExport() {
                this.download(
                    "agriculture/task/export", {
                        ...this.queryParams,
                    },
                    `task_${new Date().getTime()}.xlsx`
                );
            },
            /** 处理切换按钮操作 */
            handleChange(type) {
                if (type == "gantt") {
                    this.gantt = true;
                } else {
                    this.gantt = false;
                }
            },

            cancel() {
                this.getList();
            },
            shouldShowActualTime(task) {
                // 只有当实际开始时间存在，并且不是"未开始"状态时才显示
                return task.actualStart && 
                       !(task.actualStart === '未开始' || task.actualStart === '') && 
                       task.actualFinish && 
                       !(task.actualFinish === '未结束' || task.actualFinish === '');
            }
        },
    };
</script>
<style lang="scss" scoped>
    .gantt-container {
        height: 100%;
        display: flex;
        flex-direction: column;

        .search {
            background: #fff;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 16px;
            flex-shrink: 0; // 防止搜索框被压缩
        }

        .table {
            background: #fff;
            padding: 24px;
            border-radius: 8px;
            flex: 1; // 让表格区域占据剩余空间
            min-height: 0; // 重要：允许内容超出时滚动
            overflow: auto; // 添加滚动条

            .task-list {
                display: flex;
                flex-direction: column;
                gap: 12px;

                .task-card {
                    margin: 0;
                    background: white;
                    border-radius: 8px;
                    padding: 12px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
                    
                    &.task-completed {
                        border-left: 4px solid #67c23a;
                    }

                    .task-content {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        gap: 24px;

                        .task-main {
                            flex: 1;
                            min-width: 0; // 防止flex子元素溢出

                            .task-name {
                                font-size: 15px;
                                font-weight: 600;
                                color: #333;
                                margin-bottom: 8px;
                                
                                &.task-name-completed {
                                    color: #67c23a;
                                }
                            }

                            .task-info {
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
                        }

                        .task-actions {
                            display: flex;
                            align-items: center;
                            gap: 16px;
                            flex-shrink: 0;

                            .action-buttons {
                                display: flex;
                                gap: 8px;
                                
                                .el-button {
                                    padding: 5px 10px;
                                    height: 28px;
                                    font-size: 12px;
                                }
                            }
                        }
                    }
                }
            }

            // 添加甘特图容器样式
            .gantt {
                height: 100%;
                min-height: 400px; // 设置最小高度
                width: 100%;
                overflow: visible; // 确保甘特图内容不被裁剪
            }
        }
    }

    .pagination-container {
        height: 50px;
    }

    .search ::v-deep .el-form-item {
        margin-bottom: 0;
    }

    .search ::v-deep .el-form {
        flex: 1;
    }

    // 覆盖 Element UI 的默认标签样式
    ::v-deep .el-tag.el-tag--success {
        background-color: #f0f9eb;
        border-color: #e1f3d8;
        color: #67c23a;
    }

    // 覆盖 Element UI 的默认卡片阴影样式
    ::v-deep .el-card {
        &.is-always-shadow {
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
        }
    }

    // 响应式布局
    @media screen and (max-width: 1400px) {
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

        .task-content {
            flex-direction: column;
            align-items: flex-start !important;
            
            .task-info {
                flex-direction: column;
                gap: 8px !important;
            }
            
            .task-actions {
                width: 100%;
                margin-top: 12px;
                justify-content: flex-end;
            }
        }
    }
</style>
