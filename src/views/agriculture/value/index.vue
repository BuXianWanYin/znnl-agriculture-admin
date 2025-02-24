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
      <el-form-item label="大棚id，空为没有绑定大棚" prop="pastureId">
        <el-input
          v-model="queryParams.pastureId"
          placeholder="请输入大棚id，空为没有绑定大棚"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分区id，空为没有绑定分区" prop="batchId">
        <el-input
          v-model="queryParams.batchId"
          placeholder="请输入分区id，空为没有绑定分区"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="环境温度" prop="temperature">
        <el-input
          v-model="queryParams.temperature"
          placeholder="请输入环境温度"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="环境湿度" prop="humidity">
        <el-input
          v-model="queryParams.humidity"
          placeholder="请输入环境湿度"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="光照强度" prop="lightLux">
        <el-input
          v-model="queryParams.lightLux"
          placeholder="请输入光照强度"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="土壤湿度" prop="soilMoisture">
        <el-input
          v-model="queryParams.soilMoisture"
          placeholder="请输入土壤湿度"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="土壤温度" prop="soilTemperature">
        <el-input
          v-model="queryParams.soilTemperature"
          placeholder="请输入土壤温度"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="土壤ph值" prop="soilPh">
        <el-input
          v-model="queryParams.soilPh"
          placeholder="请输入土壤ph值"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="土壤电导率" prop="soilConductivity">
        <el-input
          v-model="queryParams.soilConductivity"
          placeholder="请输入土壤电导率"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="风向" prop="direction">
        <el-input
          v-model="queryParams.direction"
          placeholder="请输入风向"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="风速" prop="speed">
        <el-input
          v-model="queryParams.speed"
          placeholder="请输入风速"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="时间" prop="time">
        <el-input
          v-model="queryParams.time"
          placeholder="请输入时间"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
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
                    v-hasPermi="['agriculture:value:add']"
            >新增</el-button>
            <el-button
                    type="warning"
                    plain
                    icon="el-icon-download"
                    size="mini"
                    @click="handleExport"
                    v-hasPermi="['agriculture:value:export']"
            >导出</el-button>
        </el-form-item>
    </el-form>
      </el-card>
<el-card class="card-padding-bottom">
    <el-table v-loading="loading" :data="valueList" >
      <el-table-column label="设备id" align="center" prop="deviceId" />
      <el-table-column label="大棚id，空为没有绑定大棚" align="center" prop="pastureId" />
      <el-table-column label="分区id，空为没有绑定分区" align="center" prop="batchId" />
      <el-table-column label="环境温度" align="center" prop="temperature" />
      <el-table-column label="环境湿度" align="center" prop="humidity" />
      <el-table-column label="光照强度" align="center" prop="lightLux" />
      <el-table-column label="土壤湿度" align="center" prop="soilMoisture" />
      <el-table-column label="土壤温度" align="center" prop="soilTemperature" />
      <el-table-column label="土壤ph值" align="center" prop="soilPh" />
      <el-table-column label="土壤电导率" align="center" prop="soilConductivity" />
      <el-table-column label="风向" align="center" prop="direction" />
      <el-table-column label="风速" align="center" prop="speed" />
      <el-table-column label="时间" align="center" prop="time" />
      <el-table-column label="日期" align="center" prop="date" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            class="padding-5"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['agriculture:value:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="danger"
            class="padding-5"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['agriculture:value:remove']"
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
    <!-- 添加或修改菜的环境数据对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="设备id" prop="deviceId">
          <el-input v-model="form.deviceId" placeholder="请输入设备id" />
        </el-form-item>
        <el-form-item label="大棚id，空为没有绑定大棚" prop="pastureId">
          <el-input v-model="form.pastureId" placeholder="请输入大棚id，空为没有绑定大棚" />
        </el-form-item>
        <el-form-item label="分区id，空为没有绑定分区" prop="batchId">
          <el-input v-model="form.batchId" placeholder="请输入分区id，空为没有绑定分区" />
        </el-form-item>
        <el-form-item label="环境温度" prop="temperature">
          <el-input v-model="form.temperature" placeholder="请输入环境温度" />
        </el-form-item>
        <el-form-item label="环境湿度" prop="humidity">
          <el-input v-model="form.humidity" placeholder="请输入环境湿度" />
        </el-form-item>
        <el-form-item label="光照强度" prop="lightLux">
          <el-input v-model="form.lightLux" placeholder="请输入光照强度" />
        </el-form-item>
        <el-form-item label="土壤湿度" prop="soilMoisture">
          <el-input v-model="form.soilMoisture" placeholder="请输入土壤湿度" />
        </el-form-item>
        <el-form-item label="土壤温度" prop="soilTemperature">
          <el-input v-model="form.soilTemperature" placeholder="请输入土壤温度" />
        </el-form-item>
        <el-form-item label="土壤ph值" prop="soilPh">
          <el-input v-model="form.soilPh" placeholder="请输入土壤ph值" />
        </el-form-item>
        <el-form-item label="土壤电导率" prop="soilConductivity">
          <el-input v-model="form.soilConductivity" placeholder="请输入土壤电导率" />
        </el-form-item>
        <el-form-item label="风向" prop="direction">
          <el-input v-model="form.direction" placeholder="请输入风向" />
        </el-form-item>
        <el-form-item label="风速" prop="speed">
          <el-input v-model="form.speed" placeholder="请输入风速" />
        </el-form-item>
        <el-form-item label="时间" prop="time">
          <el-input v-model="form.time" placeholder="请输入时间" />
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
import { listValue, getValue, delValue, addValue, updateValue } from "@/api/agriculture/value";

export default {
  name: "Value",
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
      // 菜的环境数据表格数据
      valueList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        deviceId: null,
        pastureId: null,
        batchId: null,
        temperature: null,
        humidity: null,
        lightLux: null,
        soilMoisture: null,
        soilTemperature: null,
        soilPh: null,
        soilConductivity: null,
        direction: null,
        speed: null,
        time: null,
        date: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        time: [
          { required: true, message: "时间不能为空", trigger: "blur" }
        ],
        date: [
          { required: true, message: "日期不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询菜的环境数据列表 */
    getList() {
      this.loading = true;
      listValue(this.queryParams).then(response => {
        this.valueList = response.rows;
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
        pastureId: null,
        batchId: null,
        temperature: null,
        humidity: null,
        lightLux: null,
        soilMoisture: null,
        soilTemperature: null,
        soilPh: null,
        soilConductivity: null,
        direction: null,
        speed: null,
        time: null,
        date: null
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
      this.title = "添加菜的环境数据";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getValue(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改菜的环境数据";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateValue(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addValue(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除菜的环境数据编号为"' + ids + '"的数据项？').then(function() {
        return delValue(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('agriculture/value/export', {
        ...this.queryParams
      }, `value_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
