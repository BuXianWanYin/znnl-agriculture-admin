<template>
    <div class="app-container-sm">
        <el-card class="card-margin-bottom">
            <el-tabs v-model="activeTab" @tab-click="handleTabClick">
                <el-tab-pane label="蔬菜大棚" name="greenhouse"></el-tab-pane>
                <el-tab-pane label="养殖池" name="fishpond"></el-tab-pane>
            </el-tabs>
            <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px"
                class="form-minus-bottom">
                <el-form-item label="创建时间">
                    <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd"
                        type="daterange" range-separator="-" start-placeholder="开始日期"
                        end-placeholder="结束日期"></el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                    <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
                </el-form-item>
                <el-form-item class="fr">

                    <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
                        v-hasPermi="['agriculture:info:export']">导出</el-button>
                </el-form-item>
            </el-form>
        </el-card>
        
        <div class="warning-cards-container" v-loading="loading">
            <el-row :gutter="20">
                <el-col :xs="24" :sm="12" v-for="(item, index) in infoList" :key="index">
                    <el-card class="warning-card" :class="getStatusClass(item.warningStatus)">
                        <div class="card-header">
                            <span class="greenhouse-name">{{ item.greenhouse }}</span>
                            <el-tag :type="getStatusType(item.warningStatus)" size="small">
                                {{ item.warningStatus }}
                            </el-tag>
                        </div>
                        
                        <div class="card-content">
                            <div class="info-item">
                                <i class="el-icon-plant"></i>
                                <span class="label">农作物批次:</span>
                                <span class="value">{{ item.cropBatch }}</span>
                            </div>
                            
                            <div class="info-item">
                                <i class="el-icon-map-location"></i>
                                <span class="label">预警分区:</span>
                                <span class="value">{{ item.partitionInfo }}</span>
                            </div>
                            
                            <div class="info-item">
                                <i class="el-icon-warning-outline"></i>
                                <span class="label">预警阈值:</span>
                                <span class="value">{{ item.thresholdValue }}</span>
                            </div>
                            
                            <div class="info-item">
                                <i class="el-icon-user"></i>
                                <span class="label">负责人:</span>
                                <span class="value">{{ item.responsiblePerson }}</span>
                            </div>
                            
                            <div class="time-info">
                                <div class="time-range">
                                    <i class="el-icon-time"></i>
                                    <span>{{ parseTime(item.startTime) }} 至 {{ parseTime(item.endTime) }}</span>
                                </div>
                                <div class="update-time">
                                    更新于: {{ parseTime(item.updatedAt) }}
                                </div>
                            </div>
                        </div>
                        
                        <div class="card-footer">

                            <!-- <el-button type="text" @click="handleUpdate(item)" v-hasPermi="['agriculture:info:edit']">
                                <i class="el-icon-edit"></i> 修改按钮
                            </el-button> -->
                            <!-- <el-button type="text" class="danger-text" @click="handleDelete(item)" v-hasPermi="['agriculture:info:remove']">
                                <i class="el-icon-delete"></i> 删除 按钮
                            </el-button> -->
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            
            <pagination 
                v-show="total>0" 
                :total="total" 
                :page.sync="queryParams.pageNum"
                :limit.sync="queryParams.pageSize" 
                @pagination="getList" 
            />
        </div>
        
        <!-- 添加或修改预警信息对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
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
        listInfo,
        getInfo,
        delInfo,
        addInfo,
        updateInfo
    } from "@/api/agriculture/info";

    export default {
        name: "Info",
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
                // 预警信息表格数据
                infoList: [],
                dateRange: [],
                // 弹出层标题
                title: "",
                // 是否显示弹出层
                open: false,
                // 查询参数
                queryParams: {
                    pageNum: 1,
                    pageSize: 10,
                    greenhouse: null,
                    cropBatch: null,
                    partitionInfo: null,
                    type: 'greenhouse'
                },
                // 表单参数
                form: {},
                // 表单校验
                rules: {},
                activeTab: 'greenhouse',
                fishpondData: [
                    {
                        id: 1,
                        greenhouse: '养殖池A',
                        cropBatch: '草鱼-A批次',
                        partitionInfo: '1号池',
                        thresholdValue: 'pH值>7.5',
                        warningStatus: '已处理',
                        responsiblePerson: '张三',
                        startTime: '2024-01-01',
                        endTime: '2024-01-02',
                        updatedAt: '2024-01-01 12:00:00'
                    },
                    {
                        id: 2,
                        greenhouse: '养殖池A',
                        cropBatch: '草鱼-A批次',
                        partitionInfo: '1号池',
                        thresholdValue: 'pH值>7.5',
                        warningStatus: '已处理',
                        responsiblePerson: '张三',
                        startTime: '2024-01-01',
                        endTime: '2024-01-02',
                        updatedAt: '2024-01-01 12:00:00'
                    },
                    {
                        id: 3,
                        greenhouse: '养殖池A',
                        cropBatch: '草鱼-A批次',
                        partitionInfo: '1号池',
                        thresholdValue: 'pH值>7.5',
                        warningStatus: '已处理',
                        responsiblePerson: '张三',
                        startTime: '2024-01-05',
                        endTime: '2024-01-06',
                        updatedAt: '2024-01-06 12:00:00'
                    },
                    {
                        id: 4,
                        greenhouse: '养殖池A',
                        cropBatch: '草鱼-A批次',
                        partitionInfo: '1号池',
                        thresholdValue: 'pH值>7.5',
                        warningStatus: '已处理',
                        responsiblePerson: '张三',
                        startTime: '2024-01-05',
                        endTime: '2024-01-06',
                        updatedAt: '2024-01-06 12:00:00'
                    }
                ]
            };
        },
        created() {
            this.getList();
        },
        methods: {
            handleTabClick() {
                this.queryParams.pageNum = 1;
                this.queryParams.type = this.activeTab;
                this.getList();
            },
            /** 查询预警信息列表 */
            getList() {
                this.loading = true;
                if (this.activeTab === 'fishpond') {
                    setTimeout(() => {
                        this.infoList = this.fishpondData;
                        this.total = this.fishpondData.length;
                        this.loading = false;
                    }, 500);
                } else {
                    listInfo(this.queryParams).then(response => {
                        this.infoList = response.rows;
                        this.total = response.total;
                        this.loading = false;
                    });
                }
            },
            // 取消按钮
            cancel() {
                this.open = false;
                this.reset();
            },
            // 表单重置
            reset() {
                this.form = {
                    id: null,
                    greenhouse: null,
                    cropBatch: null,
                    partitionInfo: null,
                    thresholdValue: null,
                    warningStatus: "0",
                    responsiblePerson: null,
                    handler: null,
                    startTime: null,
                    endTime: null,
                    createdAt: null,
                    updatedAt: null,
                    delFlag: null
                };
                this.resetForm("form");
            },
            /** 搜索按钮操作 */
            handleQuery() {
                this.dateRange = [];
                this.queryParams.pageNum = 1;
                this.getList();
            },
            /** 重置按钮操作 */
            resetQuery() {
                this.resetForm("queryForm");
                this.handleQuery();
            },
            /** 提交按钮 */
            submitForm() {
                this.$refs["form"].validate(valid => {
                    if (valid) {
                        if (this.form.id != null) {
                            updateInfo(this.form).then(response => {
                                this.$modal.msgSuccess("修改成功");
                                this.open = false;
                                this.getList();
                            });
                        } else {
                            addInfo(this.form).then(response => {
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
                const ids = row.id || this.ids;
                this.$modal.confirm('是否确认删除预警信息编号为"' + ids + '"的数据项？').then(function() {
                    return delInfo(ids);
                }).then(() => {
                    this.getList();
                    this.$modal.msgSuccess("删除成功");
                }).catch(() => {});
            },
            /** 导出按钮操作 */
            handleExport() {
                this.download('agriculture/info/export', {
                    ...this.queryParams
                }, `info_${new Date().getTime()}.xlsx`)
            },
            getStatusClass(status) {
                return {
                    'warning-active': status === '警告中',
                    'warning-resolved': status === '已解决',
                    'warning-pending': status === '待处理'
                }
            },
            getStatusType(status) {
                const statusMap = {
                    '警告中': 'danger',
                    '已解决': 'success',
                    '已处理': 'success',
                    '待处理': 'warning'
                }
                return statusMap[status] || 'info'
            }
        }
    };
</script>

<style lang="scss" scoped>
.app-container-sm {
    padding: 20px;
    background-color: #f5f7fa;
}

.card-margin-bottom {
    margin-bottom: 20px;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
}

.warning-cards-container {
    .el-row {
        margin: 0 -12px;
        
        .el-col {
            padding: 0 12px;
            margin-bottom: 24px;
        }
    }
    
    .warning-card {
        background: white;
        border-radius: 16px;
        padding: 20px;
        transition: all 0.3s ease;
        border: 1px solid rgba(0, 0, 0, 0.05);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        height: 100%;
        
        &:hover {
            background: rgba(250, 250, 250, 0.95);
            .card-header .greenhouse-name {
                color: #007AFF;
            }
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            
            .greenhouse-name {
                font-size: 18px;
                font-weight: 600;
                color: #333;
                transition: color 0.3s ease;
            }
            
            .el-tag {
                border-radius: 6px;
                padding: 0 8px;
            }
        }
        
        .card-content {
            .info-item {
                display: flex;
                align-items: center;
                margin-bottom: 12px;
                
                i {
                    font-size: 16px;
                    color: #007AFF;
                    margin-right: 8px;
                    transition: transform 0.3s ease;
                }
                
                .label {
                    color: #666;
                    width: 80px;
                    font-size: 14px;
                }
                
                .value {
                    color: #333;
                    flex: 1;
                    font-size: 14px;
                }
            }
            
            .time-info {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid rgba(0, 0, 0, 0.05);
                
                .time-range {
                    color: #666;
                    margin-bottom: 8px;
                    font-size: 14px;
                    
                    i {
                        color: #007AFF;
                        margin-right: 8px;
                    }
                }
                
                .update-time {
                    color: #999;
                    font-size: 12px;
                }
            }
        }
        
        .card-footer {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid rgba(0, 0, 0, 0.05);
            display: flex;
            justify-content: flex-end;
            
            .el-button {
                &.danger-text {
                    color: #FF3B30;
                    transition: all 0.3s ease;
                    
                    &:hover {
                        color: #FF2D55;
                        transform: scale(1.05);
                    }
                }
            }
        }
    }
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

// 弹窗样式
.el-dialog {
    border-radius: 16px;
    
    .el-dialog__header {
        padding: 20px;
        border-bottom: 1px solid #eee;
    }
    
    .el-dialog__body {
        padding: 24px;
    }
    
    .el-form-item {
        margin-bottom: 20px;
    }
    
    .el-input__inner {
        border-radius: 8px;
    }
    
    .el-textarea__inner {
        border-radius: 8px;
    }
    
    .dialog-footer {
        padding: 16px 20px;
        border-top: 1px solid #eee;
        
        .el-button {
            border-radius: 8px;
            padding: 8px 20px;
        }
    }
}
</style>
