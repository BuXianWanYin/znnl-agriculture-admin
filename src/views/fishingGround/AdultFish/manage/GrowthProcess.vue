<template>
    <!-- 
    成鱼过程详细页面 （作业流程）
    -->
    <div class="app-container-sm">
      <el-card class="card-margin-bottom">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" class="form-minus-bottom">
      <el-form-item label="作业名称" prop="jobName">
        <el-input
          v-model="queryParams.jobName"
          placeholder="请输入作业名称"
          clearable
          size="small"
          style="width: 160px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
      <el-form-item style="float: right">
        <el-button type="primary" plain icon="el-icon-plus" size="small" @click="handleAdd" v-hasPermi="['agriculture:standardJob:add']">新增</el-button>
        <el-button type="success" plain icon="el-icon-magic-stick" size="small" @click="handleAIGenerate">AI</el-button>
        <el-button type="warning" plain icon="el-icon-download" size="small" @click="handleExport" v-hasPermi="['agriculture:standardJob:export']">导出</el-button>
      </el-form-item>
    </el-form>
      </el-card>
<el-card>
      <el-table v-loading="loading" :data="standardJobList" >
        <el-table-column label="作业任务名称" align="center" prop="jobName" />
        <el-table-column label="起始" align="center" prop="jobStart" >
          <template #default="{row}">
              <div class="flex jcc aic"><span>第</span><span class="margin-lr-10 font-size-20 font-style-italic font-color-primary font-weight-bold">{{row.jobStart}}</span><dict-tag :options="dict.type.agriculture_cycle_unit" type="notag" :value="row.cycleUnit"/></div>
          </template>
        </el-table-column>
        <el-table-column label="结束周" align="center" prop="jobFinish">
          <template #default="{row}">
              <div class="flex jcc aic"><span>第</span><span class="margin-lr-10 font-size-20 font-style-italic font-color-primary font-weight-bold">{{row.jobFinish}}</span><dict-tag :options="dict.type.agriculture_cycle_unit" type="notag" :value="row.cycleUnit"/></div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['agriculture:standardJob:edit']"
            >修改</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['agriculture:standardJob:remove']"
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
      <!-- 添加或修改标准作业任务对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
        <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-form-item label="作业任务名称" prop="jobName">
            <el-input v-model="form.jobName" placeholder="请输入作业任务名称" />
          </el-form-item>
          <el-form-item label="作业周期单位" prop="cycleUnit">
            <el-select v-model="form.cycleUnit" placeholder="请选择作业周期单位" @change="handleSelectChange('cycleUnit')">
              <el-option
                v-for="dict in dict.type.agriculture_cycle_unit"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="label.startLabel" prop="jobStart">
            <el-input v-model="form.jobStart" :placeholder="`请输入${label.startLabel}`" />
          </el-form-item>
          <el-form-item :label="label.endLabel" prop="jobFinish">
            <el-input v-model="form.jobFinish" :placeholder="`请输入${label.endLabel}`" />
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
  // 查询标准作业任务列表,查询标准作业任务详细,删除标准作业任务,新增标准作业任务,修改标准作业任务 
  import { listStandardJob, getStandardJob, delStandardJob, addStandardJob, updateStandardJob,aiStandardJob } from "@/api/agriculture/standardJob";
  
  export default {
    name: "GrowthProcess",
    dicts: ['agriculture_cycle_unit'],
    props:{
      germplasmId:{
        type:Number,
        default:0
      },
      name:{
        type:String,
        default:""
      },
      typeName:{
        type:String,
        default:""
      }
    },
    data() {
      return {
        //label
        label:{
          startLabel:'起始周',
          endLabel:'结束周'
        },
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
        // 标准作业任务表格数据
        standardJobList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          jobName: null,
          cycleUnit: null,
          jobStart: null,
          jobFinish: null,
          germplasmId:this.germplasmId
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          jobName: [
            { required: true, message: "作业任务名称不能为空", trigger: "blur" }
          ],
          cycleUnit: [
            { required: true, message: "作业周期单位不能为空", trigger: "blur" }
          ],
          jobStart: [
            { required: true, message: "不能为空", trigger: "blur" }
          ],
          jobFinish: [
            { required: true, message: "不能为空", trigger: "blur" }
          ],
        }
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询标准作业任务列表 */
      getList() {
        this.loading = true;
        listStandardJob(this.queryParams).then(response => {
          this.standardJobList = response.rows;
          console.log(777,this.standardJobList);
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
          jobId: null,
          germplasmId: null,
          jobName: null,
          cycleUnit: null,
          jobStart: null,
          jobFinish: null,
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
        this.title = "添加标准作业任务";
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const jobId = row.jobId || this.ids
        getStandardJob(jobId).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "修改标准作业任务";
        });
      },
      /** 提交按钮 */
      submitForm() {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.jobId != null) {
              updateStandardJob(this.form).then(response => {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              });
            } else {
              this.form.germplasmId = this.germplasmId;
              addStandardJob(this.form).then(response => {
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
        const jobIds = row.jobId || this.ids;
        this.$modal.confirm('是否确认删除标准作业任务编号为"' + jobIds + '"的数据项？').then(function() {
          return delStandardJob(jobIds);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        }).catch(() => {});
      },
      /** 导出按钮操作 */
      handleExport() {
        this.download('agriculture/standardJob/export', {
          ...this.queryParams
        }, `standardJob_${new Date().getTime()}.xlsx`)
      },
      /** 选择控件操作 */
      handleCycleUnitChange(e){
        if(e==0){
          this.label.startLabel='起始天';
          this.label.endLabel='结束天';
        }else{
          this.label.startLabel='起始周';
          this.label.endLabel='结束周';
        }
      },
      // 作业周期单位 ,不用等鼠标事件焦点离开 就会进行校验
      handleSelectChange(field) {
                console.log('form values:', this.form);
                this.$refs.form.validateField(field);
            },
            /** AI生成按钮操作 */
    async handleAIGenerate() {
      this.$modal.msgSuccess("AI生成功能开发中 稍等。。。。。。");
      const dataFrom = {
        "germplasmId": this.germplasmId,
        "name": this.name,
        "typeName": this.typeName,
        "type":1
      }
      const data = await aiStandardJob(dataFrom)
      if(data.code == 200){
        this.getList()
      }
    }
  }
}
  </script>
  <style lang="scss" scoped>
  ::v-deep .el-select {
    width: 100%;
  }
  
  </style>
  