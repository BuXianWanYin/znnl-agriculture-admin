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
                                <div class="device-info">
                                    <div class="status-indicator" :class="{ 'online': item.status == 1 }"></div>
                                    <span class="device-name">{{ item.deviceName }}</span>
                                </div>
                                <el-tag :type="item.status == 0 ? 'danger' : 'success'" size="small" class="status-tag">
                                    {{ item.status == 0 ? '离线' : '在线' }}
                                </el-tag>
                            </div>
       
                            <div class="card-content">
                                <div class="info-grid">
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
                                        <i class="el-icon-connection"></i>
                                        <span class="label">传感器指令</span>
                                        <span class="value">{{ item.sensorCommand || '-' }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer">
                                <el-button
                                    size="small"
                                    type="text"
                                    @click="handleEdit(item)"
                                    class="edit-btn">
                                    <i class="el-icon-edit"></i> 编辑
                                </el-button>
                                <el-button
                                    size="small"
                                    type="text"
                                    class="delete-btn"
                                    @click="deleteData(item.id)"
                                    v-hasPermi="['agriculture:materialType:remove']">
                                    <i class="el-icon-delete"></i> 删除
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
import { getHouse } from "@/api/iaAgriculture/greenHouse";

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

                // 收集所有需要查询的 ID
                const pastureIds = new Set();
                const fishPastureIds = new Set();
                data.records.forEach(item => {
                    if (item.fishPastureId) {
                        fishPastureIds.add(item.fishPastureId);
                    } else if (item.pastureId) {
                        pastureIds.add(item.pastureId);
                    }
                });

                // 批量获取场区数据
                const [pastureData, fishPastureData] = await Promise.all([
                    pastureIds.size > 0 ? this.batchGetPastureData(Array.from(pastureIds)) : {},
                    fishPastureIds.size > 0 ? this.batchGetFishPastureData(Array.from(fishPastureIds)) : {}
                ]);

                // 映射数据
                this.equipmentData = data.records.map(item => {
                    let pastureName = '-', batchName = '-';
                    
                    if (item.fishPastureId) {
                        pastureName = fishPastureData[item.fishPastureId]?.name || '-';
                        batchName = fishPastureData[item.fishPastureId]?.batches?.[item.fishPastureBatchId] || '-';
                    } else {
                        pastureName = pastureData[item.pastureId]?.name || '-';
                        batchName = pastureData[item.pastureId]?.batches?.[item.batchId] || '-';
                    }

                    return {
                        ...item,
                        pastureName,
                        batchName,
                        areaType: item.fishPastureId ? 'fishPasture' : 'pasture'
                    };
                });

                this.pager = {
                    page: data.current,
                    pageSize: data.size,
                    pages: data.pages,
                };
                this.total = data.total;
            } catch (e) {
                console.error('获取设备列表失败:', e);
                this.$message.error('获取设备列表失败');
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
            await this.loadAreaAndBatchData();
            this.equipmentEditDialog = true
        },
        //   弹框确定按钮
        equipmentDoBtn() {
            this.$refs.equipmentForm.validate((valid) => {
                if (valid) {
                    // 构建提交数据
                    const submitData = {
                        ...this.equipmentForm,
                        deviceId: this.equipmentForm.sensorType, // 设置deviceId与sensorType相同
                    };

                    // 根据场区类型设置不同的字段
                    if (this.equipmentForm.areaIds && this.equipmentForm.areaIds.length === 2) {
                        const areaType = this.getAreaType(this.equipmentForm.areaIds[0]);
                        if (areaType === 'pasture') {
                            submitData.pastureId = this.equipmentForm.areaIds[0];
                            submitData.batchId = this.equipmentForm.areaIds[1];
                        } else {
                            submitData.fishPastureId = this.equipmentForm.areaIds[0];
                            submitData.fishPastureBatchId = this.equipmentForm.areaIds[1];
                        }
                    }

                    // 根据是否有id判断是新增还是编辑
                    const url = this.equipmentForm.id ? '/device/update' : '/device/add';
                    const method = this.equipmentForm.id ? 'put' : 'post';
                    
                    // 修改这里的请求方式
                    if (method === 'put') {
                        // 更新请求
                        http.put(url, submitData).then(res => {
                            this.$message.success(this.dialogTitle + '成功');
                            this.getListData();
                            this.equipmentEditDialog = false;
                        }).catch(err => {
                            this.$message.error('操作失败：' + (err.message || '网络错误'));
                        });
                    } else {
                        // 新增请求保持不变
                        http.post(url, submitData).then(res => {
                            this.$message.success(this.dialogTitle + '成功');
                            this.getListData();
                            this.equipmentEditDialog = false;
                        }).catch(err => {
                            this.$message.error('操作失败：' + (err.message || '网络错误'));
                        });
                    }
                }
            });
        },
        // 获取场区类型的辅助方法
        getAreaType(areaId) {
            console.log('areaId',areaId);
            console.log('areaOptions',this.areaOptions);
            const area = this.areaOptions.find(option => option.id == areaId);
            return area ? area.type : null;
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
                const areaId = value[0];
                const batchId = value[1];
                const area = this.areaOptions.find(opt => opt.id === areaId);
            }
        },
        async initAreaOptions() {
            try {
            
                // 先清空现有数据
                this.areaOptions = [];
                
                // 获取大棚和鱼塘数据
                const [houseResponse, fishResponse] = await Promise.all([
                    this.$http.get("/dev-api/iaPasture/list"),
                    this.$http.get("/dev-api/fishPasture/list")
                ]);

                const houseData = houseResponse.data.data || [];
                const fishData = fishResponse.data.data || [];

                // 处理大棚数据
                for (const house of houseData) {
                    try {
                        const batchRes = await iaBatch({ landId: house.id });
                        const option = {
                            id: house.id,
                            name: house.name,
                            type: 'pasture',
                            children: (batchRes.rows || []).map(batch => ({
                                id: batch.batchId,
                                name: batch.batchName,
                                parentId: house.id,
                                parentType: 'pasture'
                            }))
                        };
                        
                        this.areaOptions.push(option);
                    } catch (error) {
                        console.error(`获取大棚 ${house.name} 的分区数据失败:`, error);
                    }
                }

                // 处理鱼塘数据
                for (const fish of fishData) {
                    try {
                        const batchRes = await fishBatch({ landId: fish.id });
                        
                        const option = {
                            id: fish.id,
                            name: fish.name,
                            type: 'fishPasture',
                            children: (batchRes.rows || []).map(batch => ({
                                id: batch.batchId,
                                name: batch.batchName,
                                parentId: fish.id,
                                parentType: 'fishPasture'
                            }))
                        };
                        this.areaOptions.push(option);
                    } catch (error) {
                        console.error(`获取鱼塘 ${fish.name} 的分区数据失败:`, error);
                    }
                }

                console.log('this.areaOptions',this.areaOptions);
            } catch (error) {
                console.error('初始化场区数据失败:', error);
                this.$message.error('初始化场区数据失败');
            }
        },
        async handleEdit(item) {
            this.dialogTitle = '编辑';
            
            // 确保场区数据已加载
            if (!this.areaOptions.length) {
                await this.initAreaOptions();
            }

            // 根据区域类型确定正确的ID
            let areaIds = [];
            if (item.areaType === 'fishPasture') {
                areaIds = [item.fishPastureId, item.fishPastureBatchId];
            } else {
                areaIds = [item.pastureId, item.batchId];
            }

            // 验证选中的值是否在选项中存在
            const areaOption = this.areaOptions.find(opt => opt.id === areaIds[0]);
            if (!areaOption) {
                // 重新加载场区数据
                await this.initAreaOptions();
            }

            // 再次验证并设置表单数据
            const updatedAreaOption = this.areaOptions.find(opt => opt.id === areaIds[0]);
            if (updatedAreaOption) {
                const batchOption = updatedAreaOption.children.find(child => child.id === areaIds[1]);
                if (!batchOption) {
                    // 尝试重新获取分区数据
                    if (item.areaType === 'fishPasture') {
                        const { rows } = await fishBatch({ landId: areaIds[0] });
                        updatedAreaOption.children = rows.map(batch => ({
                            id: batch.batchId,
                            name: batch.batchName,
                            parentId: areaIds[0],
                            parentType: 'fishPasture'
                        }));
                    } else {
                        const { rows } = await iaBatch({ landId: areaIds[0] });
                        updatedAreaOption.children = rows.map(batch => ({
                            id: batch.batchId,
                            name: batch.batchName,
                            parentId: areaIds[0],
                            parentType: 'pasture'
                        }));
                    }
                }
            }

            this.equipmentForm = {
                id: item.id,
                deviceName: item.deviceName,
                areaIds: areaIds,
                remark: item.remark || '',
                status: item.status,
                sensorCommand: item.sensorCommand || '',
                sensorType: item.sensorType || '',
                deviceId: item.deviceId || ''
            };

            this.equipmentEditDialog = true;
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
                // this.areaOptions = await Promise.all(houses.map(async house => {
                //     const queryParams = { landId: house.id };
                //     try {
                //         const [iaRes, fishRes] = await Promise.all([
                //             iaBatch(queryParams),
                //             fishBatch(queryParams)
                //         ]);
                        
                //         const batches = [...(iaRes.rows || []), ...(fishRes.rows || [])];
                //         console.log('batches',batches);
                        
                //         return {
                //             id: house.id,
                //             name: house.name,
                //             type: house.type,
                //             children: batches.map(batch => ({
                //                 id: batch.batchId,
                //                 name: batch.batchName,
                //                 type: house.type
                //             }))
                //         };
                //     } catch (error) {
                //         console.error('获取分区数据失败:', error);
                //         return {
                //             id: house.id,
                //             name: house.name,
                //             type: house.type,
                //             children: []
                //         };
                //     }
                // }));
            } catch (error) {
                this.$message.error('加载场区数据失败');
            }
        },
        // 新增批量获取大棚数据的方法
        async batchGetPastureData(pastureIds) {
            const result = {};
            try {
                // 获取大棚信息
                const pastureRes = await Promise.all(
                    pastureIds.map(id => getHouse(id))
                );
                
                // 获取分区信息
                const batchRes = await Promise.all(
                    pastureIds.map(id => iaBatch({ landId: id }))
                );

                pastureIds.forEach((id, index) => {
                    const pasture = pastureRes[index]?.data;
                    const batches = batchRes[index]?.rows || [];
                    
                    result[id] = {
                        name: pasture?.name,
                        batches: batches.reduce((acc, batch) => {
                            acc[batch.batchId] = batch.batchName;
                            return acc;
                        }, {})
                    };
                });
            } catch (error) {
                console.error('批量获取大棚数据失败:', error);
            }
            return result;
        },
        // 新增批量获取鱼塘数据的方法
        async batchGetFishPastureData(fishPastureIds) {
            const result = {};
            try {
                // 获取鱼塘信息
                const fishRes = await Promise.all(
                    fishPastureIds.map(id => 
                        this.$http.post("/dev-api/fishPasture/detail", null, {
                            params: { id }
                        })
                    )
                );
                
                // 获取分区信息
                const batchRes = await Promise.all(
                    fishPastureIds.map(id => fishBatch({ landId: id }))
                );

                fishPastureIds.forEach((id, index) => {
                    const fish = fishRes[index]?.data?.data;
                    const batches = batchRes[index]?.rows || [];
                    
                    result[id] = {
                        name: fish?.name,
                        batches: batches.reduce((acc, batch) => {
                            acc[batch.batchId] = batch.batchName;
                            return acc;
                        }, {})
                    };
                });
            } catch (error) {
                console.error('批量获取鱼塘数据失败:', error);
            }
            return result;
        },
        getDeviceIconClass(sensorType) {
            const typeMap = {
                'temp': 'temperature',
                'hum': 'humidity',
                'co2': 'co2',
                'light': 'light'
            };
            return typeMap[sensorType] || 'default';
        },
        getDeviceIcon(sensorType) {
            const iconMap = {
                'temp': 'el-icon-thermometer',
                'hum': 'el-icon-water-drop',
                'co2': 'el-icon-wind-power',
                'light': 'el-icon-sunny'
            };
            return iconMap[sensorType] || 'el-icon-cpu';
        },
        getDeviceLabel(sensorType) {
            const labelMap = {
                'temp': '温度',
                'hum': '湿度',
                'co2': 'CO2浓度',
                'light': '光照强度'
            };
            return labelMap[sensorType] || '设备数据';
        }
    },
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
        padding: 24px;
        margin-bottom: 24px;
        transition: all 0.3s ease;
        border: 1px solid rgba(0, 0, 0, 0.05);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;

            .device-info {
                display: flex;
                align-items: center;
                gap: 12px;

                .status-indicator {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #ff4d4f;
                    position: relative;

                    &.online {
                        background: #52c41a;
                        
                        &::after {
                            content: '';
                            position: absolute;
                            width: 100%;
                            height: 100%;
                            border-radius: 50%;
                            background: inherit;
                            animation: pulse 2s infinite;
                        }
                    }
                }
            }
        }

        .device-main-info {
            display: flex;
            align-items: center;
            gap: 24px;
            margin: 24px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 12px;

            .device-icon {
                width: 64px;
                height: 64px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                
                &.temperature { background: #ffe7e7; color: #ff4d4f; }
                &.humidity { background: #e6f7ff; color: #1890ff; }
                &.co2 { background: #f6ffed; color: #52c41a; }
                &.light { background: #fff7e6; color: #faad14; }
                &.default { background: #f0f2f5; color: #666; }
            }

            .main-readings {
                flex: 1;
                
                .reading-value {
                    font-size: 28px;
                    font-weight: 600;
                    color: #262626;
                }

                .reading-label {
                    font-size: 14px;
                    color: #8c8c8c;
                    margin-top: 4px;
                }
            }
        }

        .card-content {
            .info-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
            }

            .info-item {
                display: flex;
                align-items: center;
                gap: 8px;
                
                i {
                    font-size: 16px;
                    color: #1890ff;
                }

                .label {
                    color: #8c8c8c;
                    font-size: 13px;
                    white-space: nowrap;
                }

                .value {
                    color: #262626;
                    font-size: 13px;
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
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

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 0.8;
    }
    70% {
        transform: scale(2);
        opacity: 0;
    }
    100% {
        transform: scale(2);
        opacity: 0;
    }
}
</style>