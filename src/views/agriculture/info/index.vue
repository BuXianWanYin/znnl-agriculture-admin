<template>
    <div class="app-container-sm">
        <!-- 顶部卡片：包含标签页和搜索表单 -->
        <el-card class="card-margin-bottom">
            <!-- 标签页切换：大棚和养殖池 -->
            <el-tabs v-model="activeTab" @tab-click="handleTabClick">
                <el-tab-pane label="蔬菜大棚" name="greenhouse"></el-tab-pane>
                <el-tab-pane label="养殖池" name="fishpond"></el-tab-pane>
            </el-tabs>
            
            <!-- 搜索表单 -->
            <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px"
                class="form-minus-bottom">
                <!-- 日期范围选择器 -->
                <el-form-item label="创建时间">
                    <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd"
                        type="daterange" range-separator="-" start-placeholder="开始日期"
                        end-placeholder="结束日期"></el-date-picker>
                </el-form-item>
                
                <!-- 搜索和重置按钮 -->
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                    <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
                </el-form-item>
                
                <!-- 导出按钮 -->
                <el-form-item class="fr">
                    <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
                        v-hasPermi="['agriculture:info:export']">导出</el-button>
                </el-form-item>
            </el-form>
        </el-card>
        
        <!-- 预警卡片列表容器 -->
        <div class="warning-cards-container" v-loading="loading">
            <el-row :gutter="20">
                <!-- 预警信息卡片循环 -->
                <el-col :xs="24" :sm="12" v-for="(item, index) in infoList" :key="index">
                    <el-card class="warning-card" :class="getStatusClass(item.warningStatus)">
                        <!-- 卡片头部：大棚名称和状态标签 -->
                        <div class="card-header">
                            <span class="greenhouse-name">{{ item.greenhouse }}</span>
                            <div class="status-controls">
                                <!-- 只在 status 不为 1 时显示编辑按钮 -->
                                <el-button
                                    v-if="item.status !== '1'"
                                    type="text"
                                    size="mini"
                                    @click="handleStatusChange(item)"
                                >编辑</el-button>
                                <!-- 只在 status 不为 1 时显示预警/报警标签 -->
                                <el-tag 
                                    v-if="item.status !== '1'" 
                                    :type="getStatusType(item.warningStatus)" 
                                    size="small" 
                                    class="mr8"
                                >
                                    {{ item.warningStatus }}
                                </el-tag>
                                <!-- 处理状态标签 -->
                                <el-tag :type="getProcessStatusType(item.status)" size="small">
                                    {{ getProcessStatusText(item.status) }}
                                </el-tag>
                            </div>
                        </div>
                        
                        <!-- 卡片内容区：预警详细信息 -->
                        <div class="card-content">
                            <!-- 各项信息条目 -->
                            <div class="info-item">
                                <i class="el-icon-plant"></i>
                                <span class="label">{{ activeTab === 'fishpond' ? '养殖批次:' : '农作物批次:' }}</span>
                                <span class="value">{{ item.cropBatch }}</span>
                            </div>
                            
                            <div class="info-item">
                                <i class="el-icon-map-location"></i>
                                <span class="label">预警分区:</span>
                                <span class="value">{{ item.partitionInfo }}</span>
                            </div>

                              <div class="info-item">
                                <i class="el-icon-bell"></i>
                                <span class="label">预警名称:</span>
                                <span class="value">{{ item.paramName }}</span>
                            </div>
                            
                            <div class="info-item">
                                <i class="el-icon-bell"></i>
                                <span class="label">预警类型:</span>
                                <span class="value">{{ item.alertType }}</span>
                            </div> 
                            
                            <div class="info-item">
                                <i class="el-icon-warning-outline"></i>
                                <span class="label">预警阈值:</span>
                                <span class="value">{{ item.thresholdValue }}</span>
                            </div>

                            <div class="info-item">
                                <i class="el-icon-bell"></i>
                                <span class="label">预警时间:</span>
                                <span class="value">{{ item.alertTime }}</span>
                            </div>
                            
                            <div class="info-item">
                                <i class="el-icon-user"></i>
                                <span class="label">负责人:</span>
                                <span class="value">{{ item.responsiblePerson }}</span>
                            </div>
                            
                            <div class="info-item">
                                <i class="el-icon-user"></i>
                                <span class="label">备注:</span>
                                <span class="value">{{ item.remark || '/' }}</span>  
                            </div>

                            <!-- 时间信息区域 -->
                            <div class="time-info">
                                <!-- <div class="time-range">
                                    <i class="el-icon-time"></i>
                                    <span>{{ parseTime(item.startTime) }} 至 {{ parseTime(item.endTime) }}</span>
                                </div> -->
                                <div class="update-time">
                                    更新于: {{ parseTime(item.updatedAt) }}
                                </div>
                            </div>
                        </div>
                        
                        <!-- 卡片底部：操作按钮区 -->
                        <div class="card-footer">
                            <!-- 预留的编辑和删除按钮位置 -->
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            
            <!-- 分页组件 -->
            <pagination 
                v-show="total>0" 
                :total="total" 
                :page.sync="queryParams.pageNum"
                :limit.sync="queryParams.pageSize" 
                @pagination="getList" 
            />
        </div>
        
        <!-- 修改状态的对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="状态" prop="status">
                    <el-select v-model="form.status" placeholder="请选择状态">
                        <el-option
                            v-for="dict in statusOptions"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                        />
                    </el-select>
                </el-form-item>
                
                <!-- 添加更新时间字段 -->
                <el-form-item label="更新时间" prop="alertTime">
                    <el-input v-model="form.alertTime" disabled />
                </el-form-item>

                <el-form-item label="备注" prop="remark">
                    <el-input
                        v-model="form.remark"
                        type="textarea"
                        placeholder="请输入备注"
                        maxlength="200"
                        show-word-limit
                    />
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
    import { listByPastureType as listVegetable, listUser } from "@/api/agriculture/yujincai";
    import { listByPastureType, updateBaseinfo } from "@/api/agriculture/yujinyu";

    export default {
        name: "Info",
        data() {
            return {
                loading: true,          // 加载状态
                ids: [],               // 选中的ID数组
                single: true,          // 是否为单选
                multiple: true,        // 是否为多选
                showSearch: true,      // 是否显示搜索条件
                total: 0,              // 数据总数
                infoList: [],          // 预警信息列表
                dateRange: [],         // 日期范围
                title: "",             // 弹窗标题
                open: false,           // 是否显示弹窗
                
                // 查询参数对象
                queryParams: {
                    pageNum: 1,
                    pageSize: 10,
                    greenhouse: null,
                    cropBatch: null,
                    partitionInfo: null,
                    type: 'greenhouse'
                },
                
                form: {
                    id: null,
                    status: '',
                    alertTime: '',
                    remark: ''
                },
                
                rules: {
                    status: [
                        { required: true, message: "请选择状态", trigger: "change" }
                    ],
                    alertTime: [
                        { required: true, message: "请选择修改时间", trigger: "change" }
                    ]
                },
                
                activeTab: 'greenhouse', // 当前激活的标签页
                fishpondData: [],        // 养殖池数据
                userList: [],             // 添加负责人列表数据
                statusOptions: [     //编辑的可选
                    { value: '0', label: '未处理' },
                    { value: '1', label: '已处理' }
                ]
            };
        },
        
        // 生命周期钩子：组件创建时获取列表数据
        created() {
            this.getList();
            this.getUserList(); // 获取负责人列表
        },
        
        methods: {
            // 标签页切换处理
            handleTabClick() {
                this.queryParams.pageNum = 1;
                this.queryParams.type = this.activeTab;
                this.getList();
            },
            
            // 获取预警信息列表
            getList() {
                this.loading = true;
                // 根据不同标签页获取不同数据
                if (this.activeTab === 'fishpond') {
                    // 获取养殖池数据
                    listByPastureType(1).then(response => {
                        this.infoList = response.rows.map(item => {
                            // 查找对应的负责人信息
                            const user = this.userList.find(user => user.userId === item.batchHead);
                            return {
                                id: item.id,
                                greenhouse: item.batchName,
                                cropBatch: item.batchName,
                                partitionInfo: `${item.batchHead}号池`,
                                paramName: item.paramName || '水温',
                                thresholdValue: item.alertMessage,
                                warningStatus: item.alertLevel === '1' ? '报警' : '预警',
                                responsiblePerson: user ? user.nickName : item.nickName || '未指定',
                                startTime: item.alertDate,
                                endTime: item.alertDate,
                                updatedAt: item.updateTime || item.alertTime,
                                alertTime: item.alertTime,
                                alertType: item.alertType,
                                remark: item.remark,
                                status: item.status
                            };
                        });
                        this.total = response.total;
                        this.loading = false;
                    });
                } else {
                    // 获取蔬菜大棚数据
                    listVegetable(0).then(response => {
                        this.infoList = response.rows.map(item => {
                            // 使用 batchHead 查找对应的负责人信息
                            const user = this.userList.find(user => user.userId === item.batchHead);
                            return {
                                id: item.id,
                                greenhouse: item.batchName,
                                cropBatch: item.batchName,
                                partitionInfo: `${item.batchHead}号棚`,
                                paramName: item.paramName || '温度',
                                thresholdValue: item.alertMessage,
                                warningStatus: item.alertLevel === '1' ? '报警' : '预警',
                                // 按优先级获取负责人名称：
                                // 1. 从 userList 中匹配的用户昵称
                                // 2. 数据中的 batchHeadName 字段
                                // 3. 数据中的 pastureHead 字段
                                // 4. 默认值 "未指定"
                                responsiblePerson: user ? user.nickName : (item.batchHeadName || item.pastureHead || '未指定'),
                                startTime: item.alertDate,
                                endTime: item.alertDate,
                                updatedAt: item.updateTime || item.alertTime,
                                alertTime: item.alertTime,
                                alertType: item.alertType,
                                remark: item.remark,
                                status: item.status
                            };
                        });
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
                    status: '',
                    alertTime: this.parseTime(new Date()), // 设置当前时间
                    remark: ''
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
                        const data = {
                            id: this.form.id,
                            status: this.form.status,
                            remark: this.form.remark,
                            // 添加更新时间
                            updateTime: this.form.alertTime
                        };
                        
                        // 调用更新接口
                        if (this.activeTab === 'fishpond') {
                            updateBaseinfo(data).then(response => {
                                this.$modal.msgSuccess("修改成功");
                                this.open = false;
                                this.getList();
                            });
                        } else {
                            // 处理蔬菜大棚的更新逻辑
                            updateBaseinfo(data).then(response => {
                                this.$modal.msgSuccess("修改成功");
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
            
            // 获取预警状态对应的样式类
            getStatusClass(status) {
                return {
                    'warning-active': status === '警告中',
                    'warning-resolved': status === '已解决',
                    'warning-pending': status === '待处理'
                }
            },
            
            // 获取预警状态对应的标签类型
            getStatusType(status) {
                const statusMap = {
                    '预警': 'warning',      // 黄色
                    '报警': 'danger',       // 红色
                    '已解决': 'success',    // 绿色
                    '已处理': 'success',    // 绿色
                    '待处理': 'warning'     // 黄色
                }
                return statusMap[status] || 'info'
            },

            // 添加获取负责人列表方法
            getUserList() {
                listUser().then(response => {
                    this.userList = response.rows || [];
                });
            },

            // 处理状态变更按钮点击
            handleStatusChange(row) {
                this.reset();
                this.form.id = row.id;
                this.form.status = row.status;
                // 设置当前时间
                this.form.alertTime = this.parseTime(new Date());
                this.form.remark = row.remark;
                this.title = "修改状态";
                this.open = true;
            },

            // 获取处理状态对应的标签类型
            getProcessStatusType(status) {
                return status === '0' ? 'warning' : 'success';
            },

            // 获取处理状态的显示文本
            getProcessStatusText(status) {
                return status === '0' ? '未处理' : '已处理';
            }
        }
    };
</script>

<style lang="scss" scoped>
// 容器样式
.app-container-sm {
    padding: 20px;
    background-color: #f5f7fa;
}

// 卡片基础样式
.card-margin-bottom {
    margin-bottom: 20px;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
}

// 预警卡片容器样式
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

            .status-controls {
                display: flex;
                align-items: center;
                gap: 8px;
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

// 分页容器样式
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

.mr8 {
    margin-right: 8px;
}

.status-controls {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-tag {
        margin-left: 8px;
    }
}
</style>
