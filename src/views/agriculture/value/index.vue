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
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
</el-card>
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
    }
  }
};
</script>
