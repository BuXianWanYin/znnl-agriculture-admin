<template>
    <div class="app-container-sm">
        <!-- 搜索栏改造 -->
        <el-card class="search-card">
            <el-form :inline="true" class="search-form">
                <el-form-item label="设备ID">
                    <el-input v-model="searchForm.id" placeholder="请输入设备ID" size="small"
                              class="search-input"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" size="small" @click="equipmentSearch"
                               class="search-btn">搜索
                    </el-button>
                    <el-button icon="el-icon-refresh" size="small" @click="equipmentReset" class="reset-btn">重置
                    </el-button>
                </el-form-item>
                <el-form-item class="fr">
                    <el-button type="primary" plain icon="el-icon-plus" size="small" @click="equipmentEditAdd('新增')"
                               class="add-btn">新增设备
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 设备卡片列表改造 -->
        <el-card class="device-card">
            <div class="equipment-grid">
                <el-row :gutter="24">
                    <el-col :span="8" v-for="(item, index) in equipmentData" :key="item.id">
                        <div class="equipment-card">
                            <div class="card-header">
                                <span class="device-name">{{ item.deviceName }}</span>
                                <el-tag :type="item.status == 0 ? 'danger' : 'success'" size="small" class="status-tag">
                                    {{ item.status == 0 ? '离线' : '在线' }}
                                </el-tag>
                            </div>
                            <div class="card-content">
                                <div class="info-item">
                                    <i class="el-icon-cpu"></i>
                                    <span class="label">设备ID</span>
                                    <span class="value">{{ item.id }}</span>
                                </div>
                                <div class="info-item">
                                    <i class="el-icon-location"></i>
                                    <span class="label">场区/分区</span>
                                    <span class="value">{{ item.pastureName || '-' }}/{{ item.batchName || '-' }}</span>
                                </div>
                                <div class="info-item">
                                    <i class="el-icon-monitor"></i>
                                    <span class="label">传感器序号</span>
                                    <span class="value">{{ item.sensorType || '-' }}</span>
                                </div>
                                <div class="info-item">
                                    <i class="el-icon-set-up"></i>
                                    <span class="label">传感器指令</span>
                                    <span class="value">{{ item.sensorCommand || '-' }}</span>
                                </div>
                                <div class="info-item">
                                    <i class="el-icon-link"></i>
                                    <span class="label">合约地址</span>
                                    <span class="value">{{ item.address }}</span>
                                </div>
                                <div class="info-item">
                                    <i class="el-icon-notebook-2"></i>
                                    <span class="label">备注</span>
                                    <span class="value">{{ item.remark || '暂无备注' }}</span>
                                </div>
                            </div>
                            <div class="card-footer">
                                <el-button
                                    size="small"
                                    type="text"
                                    icon="el-icon-edit"
                                    @click="handleEdit(item)"
                                    class="edit-btn">
                                    编辑
                                </el-button>
                                <el-button
                                    size="small"
                                    type="text"
                                    icon="el-icon-delete"
                                    @click="deleteData(item.id)"
                                    v-hasPermi="['agriculture:materialType:remove']"
                                    class="delete-btn">
                                    删除
                                </el-button>
                            </div>
                        </div>
                    </el-col>
                </el-row>
            </div>
            <pagination
                v-show="total>0"
                :total="total"
                :page.sync="pager.page"
                :limit.sync="pager.pages"
                @pagination="handleCurrentChange"
                class="pagination-container"
            />
        </el-card>

        <!-- 弹窗样式改造 -->
        <el-dialog :title="dialogTitle" :visible.sync="equipmentEditDialog" width="460px" custom-class="custom-dialog">
            <el-form :model="equipmentForm" ref="equipmentForm" :rules="rules" label-width="100px">
                <el-form-item label="设备名称" prop="deviceName">
                    <el-input v-model="equipmentForm.deviceName" placeholder="请输入设备名称"></el-input>
                </el-form-item>
                <el-form-item label="场区/分区" prop="areaIds">
                    <el-cascader
                        v-model="equipmentForm.areaIds"
                        :options="areaOptions"
                        :props="cascaderProps"
                        clearable
                        placeholder="请选择场区/分区"
                        @change="handleAreaChange">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="传感器序号" prop="sensorType">
                    <el-input v-model="equipmentForm.sensorType" placeholder="请输入传感器序号"></el-input>
                </el-form-item>
                <el-form-item label="传感器指令" prop="sensorCommand">
                    <el-input v-model="equipmentForm.sensorCommand" placeholder="请输入传感器指令"></el-input>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input type="textarea" v-model="equipmentForm.remark" :rows="3" placeholder="请输入备注信息"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="equipmentEditDialog = false">取 消</el-button>
                <el-button type="primary" @click="equipmentDoBtn">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import http from "@/utils/request";
import {listBatch as iaBatch} from "@/api/agriculture/batch";
import {listBatch as fishBatch} from "@/api/fishingGround/batch";

export default {
    data() {
        return {
            equipmentForm: {
                deviceName: "",
                areaIds: [],
                remark: "",
                status: "",
                sensorCommand: "",
                sensorType: ""
            },
            rules: {
                deviceName: [{
                    required: true,
                    message: '设备名称不能为空',
                    trigger: 'blur'
                }],
                areaIds: [{
                    required: true,
                    message: '请选择场区和分区',
                    trigger: 'change'
                }],
                sensorCommand: [{
                    required: true,
                    message: '传感器指令不能为空',
                    trigger: 'blur'
                }],
                sensorType: [{
                    required: true,
                    message: '传感器序号不能为空', 
                    trigger: 'blur'
                }]
            },
            equipmentEditDialog: false,

            dialogTitle: '新增', // 新增/修改
            searchForm: {
                state: '',
                id: ''
            },
            pager: {
                pageSize: 10,
                page: 1,
                pages: 1,
            },
            total: null,
            equipmentData: [],
            houeList: [],
            batchList: [],
            areaOptions: [],
            cascaderProps: {
                value: 'id',
                label: 'name',
                children: 'children',
                checkStrictly: false
            },
        }
    },
    async created() {
        await this.getListData()
        await this.initAreaOptions()
    },
    methods: {
        async getListData() {
            try {
                const { data } = await http.get('/device/list', {
                    params: {
                        ...this.pager,
                        ...this.searchForm
                    }
                });
                this.equipmentData = data.records;
                this.pager = {
                    page: data.current,
                    pageSize: data.size,
                    pages: data.pages,
                }
                this.total = data.total
            } catch (e) {
                console.error('获取设备列表失败:', e);
                this.$message.error('网络错误请重试！');
            }
        },
        async equipmentSearch() {
            await this.getListData()
        },
        async equipmentReset() {
            this.searchForm = {
                state: '',
                id: ''
            }
            this.equipmentForm = {
                deviceName: "",
                areaIds: [],
                remark: "",
                status: "",
                sensorCommand: "",
                sensorType: ""
            }
            await this.getListData()
        },
        async handleCurrentChange(val) {
            this.pager.page = val;
            await this.getListData()
        },
        // 新增按钮显示弹框
        async equipmentEditAdd(title) {
            this.dialogTitle = title
            // 新增重置
            this.equipmentForm = {
                deviceName: "",
                areaIds: [],
                remark: "",
                status: "",
                sensorCommand: "",
                sensorType: ""
            }
            // 获取场区和分区数据
            // await this.loadAreaAndBatchData();
            this.equipmentEditDialog = true
        },
        //   弹框确定按钮
        equipmentDoBtn() {
            this.$refs.equipmentForm.validate((valid) => {
                if (valid) {
                    // 判断选择的是大棚还是鱼棚
                    const isPasture = this.areaOptions.find(area => area.id === this.equipmentForm.areaIds[0])?.name.includes('大棚');
                    
                    const submitData = {
                        ...this.equipmentForm,
                        // 设置deviceId与sensorType相同
                        deviceId: this.equipmentForm.sensorType,
                        // 根据类型设置不同的字段名
                        [isPasture ? 'pastureId' : 'fishPastureId']: this.equipmentForm.areaIds[0],
                        [isPasture ? 'batchId' : 'fish_pasture_batch_id']: this.equipmentForm.areaIds[1]
                    };
                    
                    // 根据是否有id判断是新增还是编辑
                    const url = this.equipmentForm.id ? '/device/update' : '/device/add'
                    
                    http.post(url, submitData).then(res => {
                        this.$message.success(this.dialogTitle + '成功')
                        this.getListData()
                        this.equipmentEditDialog = false
                    }).catch(err => {
                        this.$message.error('网络错误请重试！')
                    })
                } else {
                    return false
                }
            })
        },
        deleteData(id) {
            this.$confirm('确定要删除该条数据吗?', '删除', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                http.delete('/device/delete', {
                    params: {
                        id
                    }
                }).then(res => {
                    if (res.code === 0) {
                        this.$message({
                            type: 'success',
                            message: '删除成功'
                        });
                        this.getListData()
                    }
                }).catch(err => {
                    this.$message({
                        type: 'error',
                        message: '删除失败'
                    });
                })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },
        handleAreaChange(value) {
            if (value && value.length === 2) {
                this.equipmentForm.landId = value[0];
                this.equipmentForm.batchId = value[1];
            } else {
                this.equipmentForm.landId = '';
                this.equipmentForm.batchId = '';
            }
        },
        async initAreaOptions() {
            try {
                const [houseResponse, fishResponse] = await Promise.all([
                    this.$http.get("/dev-api/iaPasture/list"),
                    this.$http.get("/dev-api/fishPasture/list")
                ]);
                
                const houses = [...houseResponse.data.data, ...fishResponse.data.data];
                
                // 转换数据结构为级联选择器格式
                this.areaOptions = await Promise.all(houses.map(async house => {
                    const queryParams = { landId: house.id };
                    try {
                        const [iaRes, fishRes] = await Promise.all([
                            iaBatch(queryParams),
                            fishBatch(queryParams)
                        ]);
                        
                        const batches = [...(iaRes.rows || []), ...(fishRes.rows || [])];
                        return {
                            id: house.id,
                            name: house.name,
                            children: batches.map(batch => ({
                                id: batch.batchId,
                                name: batch.batchName
                            }))
                        };
                    } catch (error) {
                        console.error('获取分区数据失败:', error);
                        return {
                            id: house.id,
                            name: house.name,
                            children: []
                        };
                    }
                }));
            } catch (error) {
                this.$message.error('初始化场区数据失败');
            }
        },
        async handleEdit(item) {
            this.dialogTitle = '编辑'
            // 获取场区和分区数据
            // await this.loadAreaAndBatchData();
            
            // 判断是大棚还是鱼塘的设备
            const areaIds = item.pastureId ? 
                [item.pastureId, item.batchId] : // 大棚设备
                [item.fishPastureId, item.fishPastureBatchId]; // 鱼塘设备

            this.equipmentForm = {
                id: item.id,
                deviceName: item.deviceName,
                areaIds: areaIds,
                remark: item.remark,
                status: item.status,
                sensorCommand: item.sensorCommand,
                sensorType: item.sensorType
            }
            this.equipmentEditDialog = true
        },
        // 新增加载场区和分区数据的方法
        async loadAreaAndBatchData() {
            try {
                const [iaPastureRes, fishPastureRes] = await Promise.all([
                    this.$http.get("/dev-api/iaPasture/list"),
                    this.$http.get("/dev-api/fishPasture/list")
                ]);
                
                const houses = [...iaPastureRes.data.data, ...fishPastureRes.data.data];
                
                // 转换数据结构为级联选择器格式
                this.areaOptions = await Promise.all(houses.map(async house => {
                    const queryParams = { landId: house.id };
                    try {
                        const [iaRes, fishRes] = await Promise.all([
                            iaBatch(queryParams),
                            fishBatch(queryParams)
                        ]);
                        
                        const batches = [...(iaRes.rows || []), ...(fishRes.rows || [])];
                        return {
                            id: house.id,
                            name: house.name,
                            children: batches.map(batch => ({
                                id: batch.batchId,
                                name: batch.batchName
                            }))
                        };
                    } catch (error) {
                        console.error('获取分区数据失败:', error);
                        return {
                            id: house.id,
                            name: house.name,
                            children: []
                        };
                    }
                }));
            } catch (error) {
                this.$message.error('加载场区数据失败');
            }
        },
    }
}
</script>

<style lang="scss" scoped>
.app-container-sm {
    padding: 20px;
    background-color: #f5f7fa;
}

.search-card {
    margin-bottom: 20px;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;

    .search-form {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .search-input {
            width: 240px;

            .el-input__inner {
                border-radius: 8px;
            }
        }

        .el-button {
            border-radius: 8px;
            padding: 8px 16px;
            transition: all 0.3s;

            &:hover {
                transform: translateY(-1px);
            }
        }

        .fr {
            margin-left: auto;
        }

        .add-btn {
            &:hover {
                opacity: 0.9;
            }

            &:active {
                opacity: 0.8;
            }
        }
    }
}

.device-card {
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;

    .equipment-grid {
        margin: -12px;
        padding: 12px;
    }

    .equipment-card {
        background: white;
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 24px;
        transition: all 0.3s ease;
        border: 1px solid rgba(0, 0, 0, 0.05);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);

        &:hover {
            background: rgba(250, 250, 250, 0.95);

            .card-header .device-name {
                color: #007AFF;
            }

            // .info-item i {
            //     transform: scale(1.1);
            // }
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;

            .device-name {
                font-size: 18px;
                font-weight: 600;
                color: #333;
                transition: color 0.3s ease;
            }

            .status-tag {
                border-radius: 6px;
                padding: 0px 8px;
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
        }

        .card-footer {
            margin-top: 20px;
            display: flex;
            justify-content: flex-end;
            gap: 16px; // 按钮之间的间距

            .edit-btn {
                color: #409EFF;
                transition: all 0.3s ease;

                &:hover {
                    color: #66b1ff;
                    transform: scale(1.05);
                }
            }

            .delete-btn {
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

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

.custom-dialog {
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
