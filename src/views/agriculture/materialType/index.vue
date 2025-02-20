<template>
    <div class="app-container-sm">
        <el-card class="card-margin-bottom">
            <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px"
                class="form-minus-bottom">
                <el-form-item label="类别名称" prop="materialTypeName">
                    <el-input v-model="queryParams.materialTypeName" placeholder="请输入农资类别名称" clearable size="small"
                        @keyup.enter.native="handleQuery" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                    <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
                </el-form-item>
                <el-form-item class="fr">
                    <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                        v-hasPermi="['agriculture:materialType:add']">新增</el-button>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="card-padding-bottom">
            <div v-loading="loading" class="material-type-grid">
                <el-row :gutter="24">
                    <el-col :span="8" v-for="item in materialTypeList" :key="item.materialTypeId">
                        <el-card class="material-type-card" shadow="hover">
                            <div class="material-type-card-header">
                                <div class="header-content">
                                    <div class="section-name">农资类别</div>
                                    <div class="type-name">{{ item.materialTypeName }}</div>
                                </div>
                                <div class="header-actions">
                                    <el-button
                                        size="small"
                                        type="primary"
                                        icon="el-icon-edit"
                                        @click="handleUpdate(item)"
                                        v-hasPermi="['agriculture:materialType:edit']"
                                    >修改</el-button>
                                    <el-button
                                        size="small"
                                        type="danger"
                                        icon="el-icon-delete"
                                        @click="handleDelete(item)"
                                        v-hasPermi="['agriculture:materialType:remove']"
                                    >删除</el-button>
                                </div>
                            </div>

                            <div class="material-type-card-content">
                                <div class="type-info">
                                    <div class="info-item" v-if="item.remark && item.remark !== '/'">
                                        <i class="el-icon-document"></i>
                                        <div class="remark-container">
                                            <span class="label nowrap">备注：</span>
                                            <span class="remark-content">{{ item.remark }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>

            <pagination
                v-show="total>0"
                :total="total"
                :page.sync="queryParams.pageNum"
                :limit.sync="queryParams.pageSize"
                @pagination="getList"
            />
        </el-card>
        <!-- 添加或修改农资类别对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="类别名称" prop="materialTypeName">
                    <el-input v-model="form.materialTypeName" placeholder="请输入农资类别名称" />
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
                </el-form-item>
                <el-form-item label="排序" prop="orderNum">
                    <el-input v-model="form.orderNum" placeholder="请输入排序" />
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
    import {
        listMaterialType,
        getMaterialType,
        delMaterialType,
        addMaterialType,
        updateMaterialType
    } from "@/api/agriculture/materialType";

    export default {
        name: "MaterialType",
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
                // 农资类别表格数据
                materialTypeList: [],
                // 弹出层标题
                title: "",
                // 是否显示弹出层
                open: false,
                // 查询参数
                queryParams: {
                    pageNum: 1,
                    pageSize: 10,
                    materialTypeName: null,
                },
                // 表单参数
                form: {},
                // 表单校验
                rules: {
                    materialTypeName: [{
                        required: true,
                        message: "农资类别名称不能为空",
                        trigger: "blur"
                    }],
                }
            };
        },
        created() {
            this.getList();
        },
        methods: {
            /** 查询农资类别列表 */
            getList() {
                this.loading = true;
                listMaterialType(this.queryParams).then(response => {
                    this.materialTypeList = response.rows;
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
                    materialTypeId: null,
                    materialTypeName: null,
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
                this.title = "添加农资类别";
            },
            /** 修改按钮操作 */
            handleUpdate(row) {
                this.reset();
                const materialTypeId = row.materialTypeId || this.ids
                getMaterialType(materialTypeId).then(response => {
                    this.form = response.data;
                    this.open = true;
                    this.title = "修改农资类别";
                });
            },
            /** 提交按钮 */
            submitForm() {
                this.$refs["form"].validate(valid => {
                    if (valid) {
                        if (this.form.materialTypeId != null) {
                            updateMaterialType(this.form).then(response => {
                                this.$modal.msgSuccess("修改成功");
                                this.open = false;
                                this.getList();
                            });
                        } else {
                            addMaterialType(this.form).then(response => {
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
                const materialTypeIds = row.materialTypeId || this.ids;
                this.$modal.confirm('是否确认删除农资类别编号为"' + materialTypeIds + '"的数据项？').then(function() {
                    return delMaterialType(materialTypeIds);
                }).then(() => {
                    this.getList();
                    this.$modal.msgSuccess("删除成功");
                }).catch(() => {});
            },
            /** 导出按钮操作 */
            handleExport() {
                this.download('agriculture/materialType/export', {
                    ...this.queryParams
                }, `materialType_${new Date().getTime()}.xlsx`)
            }
        }
    };
</script>

<style lang="scss" scoped>
.material-type-grid {
  padding: 20px;
  
  .el-row {
    margin: -12px;
    display: flex;
    flex-wrap: wrap;
  }
  
  .el-col {
    padding: 12px;
    display: flex;
  }
}

.material-type-card {
  flex: 1;  // 让卡片填充整个列空间
  display: flex;
  flex-direction: column;
  height: 100%;  // 确保卡片填充整个高度
  background: white;
  border-radius: 16px;
  padding: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  
  .material-type-card-header {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    .header-content {
      .section-name {
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
      }

      .type-name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }

    .header-actions {
      display: flex;
      gap: 8px;
      
      .el-button {
        padding: 6px 12px;
        height: 32px;
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
      }
    }
  }

  .material-type-card-content {
    flex: 1;  // 让内容区域填充剩余空间
    
    .type-info {
      .info-item {
        display: flex;
        align-items: flex-start;
        font-size: 13px;

        i {
          color: #409EFF;
          margin-right: 8px;
          font-size: 14px;
          margin-top: 3px;
        }

        .remark-container {
          flex: 1;
          display: flex;
          
          .label {
            white-space: nowrap;  // 防止"备注："换行
            color: #666;
            margin-right: 8px;
          }

          .remark-content {
            word-break: break-all;  // 允许在任意字符间换行
            white-space: pre-wrap;  // 保留空格和换行
          }
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
@media screen and (max-width: 1400px) {
  .el-col {
    width: 50% !important;
  }
}

@media screen and (max-width: 992px) {
  .el-col {
    width: 100% !important;
  }
}
</style>

.material-type-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 10px;
}

.material-type-tag {
  display: inline-block;
  padding: 2px 8px;
  background-color: #f5f5f5;
  color: #909399;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 8px;
  margin-left: -10px;
}

.material-type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.material-type-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.material-type-order {
  color: #909399;
  font-size: 14px;
}

.material-type-remark {
  color: #606266;
  min-height: 40px;
  font-size: 14px;
}

.material-type-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
