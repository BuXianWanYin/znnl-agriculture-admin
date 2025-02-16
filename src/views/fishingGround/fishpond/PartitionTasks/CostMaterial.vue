<template>
  <!--
   用于登记和管理饵料投喂的数据
    -->
  <div class="padding-bottom-10">
      <el-alert
          title="登记饵料投喂"
          type="info"
          show-icon
          description="此处可以登记饵料投喂"
      >
      </el-alert>
      <el-table
          v-loading="loading"
          :data="costBaitList"
          class="margin-top-10"
      >
          <el-table-column label="饵料名称" align="center" prop="baitId">
              <template v-slot:default="scope">
                  <data-tag
                      :options="BaitInfoList"
                      :value="scope.row.baitId"
                      labelName="baitName"
                      valueName="baitId"
                      type="notag"
                  />
              </template>
          </el-table-column>
          <el-table-column label="投喂数量" align="center" prop="baitCount"/>
          <el-table-column label="计量单位" align="center" prop="measureUnit"/>
          <el-table-column
              label="开始日期"
              align="center"
              prop="workingStart"
              width="140"
          >
              <template slot-scope="scope">
                  <span>{{ parseTime(scope.row.workingStart, "{y}-{m}-{d}") }}</span>
              </template>
          </el-table-column>
          <el-table-column
              label="结束日期"
              align="center"
              prop="workingFinish"
              width="140"
          >
              <template slot-scope="scope">
                  <span>{{ parseTime(scope.row.workingFinish, "{y}-{m}-{d}") }}</span>
              </template>
          </el-table-column>
          <el-table-column label="备注" align="center" prop="remark"/>
          <el-table-column
              label="操作"
              align="center"
              class-name="small-padding fixed-width"
          >
              <template #header>
                  <el-tag
                      @click="handleAdd"
                      v-hasPermi="['fishingGround:costBait:add']"
                      class="cursor-pointer"
                  >新增
                  </el-tag>
              </template>
              <template slot-scope="scope">
                  <el-button
                      size="mini"
                      type="text"
                      icon="el-icon-edit"
                      @click="handleUpdate(scope.row)"
                      v-hasPermi="['fishingGround:costBait:edit']"
                  >修改
                  </el-button
                  >
                  <el-button
                      size="mini"
                      type="text"
                      icon="el-icon-delete"
                      @click="handleDelete(scope.row)"
                      v-hasPermi="['fishingGround:costBait:remove']"
                  >删除
                  </el-button
                  >
              </template>
          </el-table-column>
      </el-table>

      <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
      />
      <!-- 添加或修改饵料用量对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
              <el-form-item label="饵料名称" prop="baitId">
                  <el-select
                      v-model="form.baitId"
                      placeholder="请选择饵料名称"
                      class="display-block"
                  >
                      <el-option
                          v-for="item in BaitInfoList"
                          :key="item.baitId"
                          :label="item.baitName"
                          :value="item.baitId"
                      >
                      </el-option>
                  </el-select>
              </el-form-item>
              <el-form-item label="使用数量" prop="baitCount">
                  <el-input v-model="form.baitCount" placeholder="请输入使用数量"/>
              </el-form-item>
              <!-- <el-form-item label="计量单位" prop="measureUnit">
                <el-input v-model="form.measureUnit" placeholder="请输入计量单位" />
              </el-form-item> -->
              <el-form-item label="开始日期" prop="workingStart">
                  <el-date-picker
                      clearable
                      class="w100"
                      v-model="form.workingStart"
                      type="date"
                      value-format="yyyy-MM-dd"
                      placeholder="选择开始日期"
                  >
                  </el-date-picker>
              </el-form-item>
              <el-form-item label="结束日期" prop="workingFinish">
                  <el-date-picker
                      clearable
                      class="w100"
                      v-model="form.workingFinish"
                      type="date"
                      value-format="yyyy-MM-dd"
                      placeholder="选择结束日期"
                  >
                  </el-date-picker>
              </el-form-item>
              <el-form-item label="备注" prop="baitCount">
                  <el-input v-model="form.remark" placeholder="请输入备注"/>
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
  listCostBait,
  getCostBait,
  delCostBait,
  addCostBait,
  updateCostBait,
} from "@/api/fishingGround/costBait";
import {listBaitInfo} from "@/api/fishingGround/BaitInfo";
import {addLog} from "@/api/agriculture/log";

export default {
  name: "CostBait",
  props: {
      taskId: {
          type: [Number, String],
      },
  },
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
          // 饵料用量表格数据
          costBaitList: [],
          BaitInfoList: [],
          // 弹出层标题
          title: "",
          // 是否显示弹出层
          open: false,
          // 查询参数
          queryParams: {
              pageNum: 1,
              pageSize: 10,
              taskId: this.taskId,
          },
          // 表单参数
          form: {},
          // 表单校验
          rules: {
              taskId: [
                  {required: true, message: "任务ID不能为空", trigger: "blur"},
              ],
              baitId: [
                  {required: true, message: "饵料ID不能为空", trigger: "blur"},
              ],
              baitCount: [
                  {required: true, message: "使用数量不能为空", trigger: "blur"},
              ],
              // measureUnit: [
              //   { required: true, message: "计量单位不能为空", trigger: "blur" },
              // ],
              workingStart: [
                  {required: true, message: "开始日期不能为空", trigger: "blur"},
              ],
              workingFinish: [
                  {required: true, message: "结束日期不能为空", trigger: "blur"},
              ],
          },
      };
  },
  created() {
      this.getList();
      this.getBaitInfoList();
  },
  methods: {
      /** 查询饵料用量列表 */
      getList() {
          this.loading = true;
          listCostBait(this.queryParams).then((response) => {
              this.costBaitList = response.rows;
              this.total = response.total;
              this.loading = false;
          });
      },
      /** 查询饵料列表 */
      getBaitInfoList() {
          listBaitInfo().then((response) => {
              this.BaitInfoList = response.rows;
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
              costId: null,
              taskId: this.taskId,
              baitId: null,
              baitCount: null,
              measureUnit: null,
              workingStart: null,
              workingFinish: null,
              remark: null,
              status: "0",
              orderNum: null,
              createBy: null,
              createTime: null,
              updateBy: null,
              updateTime: null,
              delFlag: null,
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
      /** 插入任务日志 */
      addTaskLog(des) {
          addLog({taskId: this.taskId, operDes: des})
          this.$emit('log')
      },
      /** 新增按钮操作 */
      handleAdd() {
          this.reset();
          this.open = true;
          this.title = "添加投喂用量";
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
          this.reset();
          const costId = row.costId || this.ids;
          getCostBait(costId).then((response) => {
              this.form = response.data;
              this.open = true;
              this.title = "修改投喂用量";
          });
      },
      /** 提交按钮 */
      submitForm() {
          this.$refs["form"].validate((valid) => {
              if (valid) {
                  if (this.form.costId != null) {
                      updateCostBait(this.form).then((response) => {
                          this.$modal.msgSuccess("修改成功");
                          this.addTaskLog("修改投喂用量")
                          this.open = false;
                          this.getList();
                      });
                  } else {
                      addCostBait(this.form).then((response) => {
                          this.$modal.msgSuccess("新增成功");
                          this.addTaskLog("新增投喂用量")
                          this.open = false;
                          this.getList();
                      });
                  }
              }
          });
      },
      /** 删除按钮操作 */
      handleDelete(row) {
          const costIds = row.costId || this.ids;
          this.$modal
              .confirm('是否确认删除投喂用量编号为"' + costIds + '"的数据项？')
              .then(function () {
                  return delCostBait(costIds);
              })
              .then(() => {
                  this.getList();
                  this.$modal.msgSuccess("删除成功");
                  this.addTaskLog("删除投喂用量")
              })
              .catch(() => {
              });
      },
      /** 导出按钮操作 */
      handleExport() {
          this.download(
              "fishPasture/costBait/export",
              {
                  ...this.queryParams,
              },
              `costBait_${new Date().getTime()}.xlsx`
          );
      },
  },
};
</script>
