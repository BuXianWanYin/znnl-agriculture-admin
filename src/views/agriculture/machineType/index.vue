<template>
  <div class="app-container-sm">
      <el-card class="card-margin-bottom">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px" class="form-minus-bottom">
      <el-form-item label="类别名称" prop="machineTypeName">
        <el-input
          v-model="queryParams.machineTypeName"
          placeholder="请输入农机类别名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
        <el-form-item class="fr">
            <el-button
                    type="primary"
                    plain
                    icon="el-icon-plus"
                    size="mini"
                    @click="handleAdd"
                    v-hasPermi="['agriculture:machineType:add']"
            >新增</el-button>
        </el-form-item>
    </el-form>
      </el-card>
<el-card class="card-padding-bottom">
    <div class="machine-type-grid">
        <el-card v-for="item in machineTypeList" 
                 :key="item.machineTypeId" 
                 class="machine-type-card"
                 shadow="hover">
            <div class="machine-type-content">
                <div class="machine-type-tag">农机类别</div>
                <div class="machine-type-header">
                    <span class="machine-type-name">{{ item.machineTypeName }}</span>
                    <span class="machine-type-order">排序: {{ item.orderNum }}</span>
                </div>
                <div class="machine-type-remark">备注：{{ item.remark || '' }}</div>
                <div class="machine-type-actions">
                    <el-button
                        size="small"
                        type="primary"
                        icon="el-icon-edit"
                        @click="handleUpdate(item)"
                        v-hasPermi="['agriculture:machineType:edit']"
                    >修改</el-button>
                    <el-button
                        size="small"
                        type="danger"
                        icon="el-icon-delete"
                        @click="handleDelete(item)"
                        v-hasPermi="['agriculture:machineType:remove']"
                    >删除</el-button>
                </div>
            </div>
        </el-card>
    </div>

    <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
    />
</el-card>
    <!-- 添加或修改农机类别对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="类别名称" prop="machineTypeName">
          <el-input v-model="form.machineTypeName" placeholder="请输入农机类别名称" />
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
import { listMachineType, getMachineType, delMachineType, addMachineType, updateMachineType } from "@/api/agriculture/machineType";

export default {
  name: "MachineType",
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
      // 农机类别表格数据
      machineTypeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        machineTypeName: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        machineTypeName: [
          { required: true, message: "农机类别名称不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询农机类别列表 */
    getList() {
      this.loading = true;
      listMachineType(this.queryParams).then(response => {
        this.machineTypeList = response.rows;
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
        machineTypeId: null,
        machineTypeName: null,
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
      this.title = "添加农机类别";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const machineTypeId = row.machineTypeId || this.ids
      getMachineType(machineTypeId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改农机类别";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.machineTypeId != null) {
            updateMachineType(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addMachineType(this.form).then(response => {
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
      const machineTypeIds = row.machineTypeId || this.ids;
      this.$modal.confirm('是否确认删除农机类别编号为"' + machineTypeIds + '"的数据项？').then(function() {
        return delMachineType(machineTypeIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('agriculture/machineType/export', {
        ...this.queryParams
      }, `machineType_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

<style lang="scss" scoped>
.machine-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 10px;
}

.machine-type-card {
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
}

.machine-type-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 10px;
}

.machine-type-tag {
  display: inline-block;
  padding: 2px 8px;
  background-color: #f5f5f5;
  color: #909399;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 8px;
  margin-left: -10px;
}

.machine-type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.machine-type-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.machine-type-order {
  color: #909399;
  font-size: 14px;
}

.machine-type-remark {
  color: #606266;
  min-height: 40px;
  font-size: 14px;
}

.machine-type-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
