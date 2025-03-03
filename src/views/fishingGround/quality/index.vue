<template>
  <div class="app-container-sm">
      <el-card class="card-margin-bottom">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px" class="form-minus-bottom">
      <el-form-item label="设备id" prop="deviceId">
        <el-input
          v-model="queryParams.deviceId"
          placeholder="请输入设备id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="鱼养殖棚id" prop="fishPastureId">
        <el-input
          v-model="queryParams.fishPastureId"
          placeholder="请输入鱼养殖棚id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="鱼分区(批次)id" prop="fishPastureBatchId">
        <el-input
          v-model="queryParams.fishPastureBatchId"
          placeholder="请输入鱼分区(批次)id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="水温" prop="waterTemperature">
        <el-input
          v-model="queryParams.waterTemperature"
          placeholder="请输入水温"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="ph值" prop="waterPhValue">
        <el-input
          v-model="queryParams.waterPhValue"
          placeholder="请输入ph值"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="时间" prop="time">
        <el-date-picker clearable size="small"
          v-model="queryParams.time"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="日期" prop="date">
        <el-input
          v-model="queryParams.date"
          placeholder="请输入日期"
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
                    v-hasPermi="['agriculture:quality:add']"
            >新增</el-button>
            <el-button
                    type="warning"
                    plain
                    icon="el-icon-download"
                    size="mini"
                    @click="handleExport"
                    v-hasPermi="['agriculture:quality:export']"
            >导出</el-button>
        </el-form-item>
    </el-form>
      </el-card>
<el-card class="card-padding-bottom">
    <el-table v-loading="loading" :data="qualityList" >
      <el-table-column label="设备id" align="center" prop="deviceId" />
      <el-table-column label="鱼养殖棚id" align="center" prop="fishPastureId" />
      <el-table-column label="鱼分区(批次)id" align="center" prop="fishPastureBatchId" />
      <el-table-column label="水温" align="center" prop="waterTemperature" />
      <el-table-column label="ph值" align="center" prop="waterPhValue" />
      <el-table-column label="含氧量" align="center" prop="waterOxygen content" />
      <el-table-column label="亚硝酸盐含量" align="center" prop="waterNitrite content" />
      <el-table-column label="时间" align="center" prop="time" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.time, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日期" align="center" prop="date" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            class="padding-5"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['agriculture:quality:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="danger"
            class="padding-5"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['agriculture:quality:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
</el-card>
    <!-- 添加或修改水质数据对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="设备id" prop="deviceId">
          <el-input v-model="form.deviceId" placeholder="请输入设备id" />
        </el-form-item>
        <el-form-item label="鱼养殖棚id" prop="fishPastureId">
          <el-input v-model="form.fishPastureId" placeholder="请输入鱼养殖棚id" />
        </el-form-item>
        <el-form-item label="鱼分区(批次)id" prop="fishPastureBatchId">
          <el-input v-model="form.fishPastureBatchId" placeholder="请输入鱼分区(批次)id" />
        </el-form-item>
        <el-form-item label="水温" prop="waterTemperature">
          <el-input v-model="form.waterTemperature" placeholder="请输入水温" />
        </el-form-item>
          <el-form-item label="ph值" prop="waterPhValue">
          <el-input v-model="form.waterPhValue" placeholder="请输入ph值" />
        </el-form-item>
        <el-form-item label="含氧量" prop="waterOxygencontent">
          <editor v-model="form.waterOxygencontent" :min-height="192"/>
        </el-form-item>
        <el-form-item label="亚硝酸盐含量" prop="waterNitritecontent">
          <editor v-model="form.waterNitritecontent" :min-height="192"/>
        </el-form-item>
        <el-form-item label="时间" prop="time">
          <el-date-picker clearable size="small"
            v-model="form.time"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-input v-model="form.date" placeholder="请输入日期" />
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
import { listQuality, getQuality, delQuality, addQuality, updateQuality } from "@/api/fishingGround/quality";

export default {
  name: "Quality",
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
      // 水质数据表格数据
      qualityList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        deviceId: null,
        fishPastureId: null,
        fishPastureBatchId: null,
        waterTemperature: null,
        waterPhValue: null,
        waterOxygencontent: null,
        waterNitritecontent: null,
        time: null,
        date: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        delFlag: [
          { required: true, message: "删除标志不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询水质数据列表 */
    getList() {
      this.loading = true;
      listQuality(this.queryParams).then(response => {
        this.qualityList = response.rows;
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
        id: null,
        deviceId: null,
        fishPastureId: null,
        fishPastureBatchId: null,
        waterTemperature: null,
        waterPhValue: null,
        waterOxygencontent: null,
        waterNitritecontent: null,
        time: null,
        date: null,
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
      this.title = "添加水质数据";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getQuality(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改水质数据";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateQuality(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addQuality(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除水质数据编号为"' + ids + '"的数据项？').then(function() {
        return delQuality(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('agriculture/quality/export', {
        ...this.queryParams
      }, `quality_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
