<template>
  <div class="app-container-gray">
    <el-row class="box">
      <el-col :span="4" class="left">
        <search-menu 
          title="种植分区" 
          :fun="listBatch" 
          search-parma="batchName" 
          search-placeholder="请输入批次名称" 
          key-name="batchId" 
          label-name="batchName"
          :active-menu="{
            isActive: true,
            name: 'batchId',
            value: ''
          }"
          @select="handleSelect" 
        />
      </el-col>
      <el-col :span="20" class="right">
        <template v-if="batchId">
          <task :batch-id="batchId"></task>
        </template>
        <el-empty v-else description="暂无批次任务"></el-empty>
      </el-col>
    </el-row>
  </div>
</template>

<script>
//Task用来展示任务列表
//SearchMenu用来展示搜索菜单
import Task from "../components/Task";
import SearchMenu from "../components/SearchMenu";
import { listBatch } from "@/api/agriculture/batch";

export default {
  name: 'TaskManager',
  components: { Task, SearchMenu },
  data() {
    return {
      listBatch,
      batchId: null
    };
  },
  created() {
    this.initDefaultSelection();
  },
  methods: {
    /** 初始化默认选择第一个批次 */
    async initDefaultSelection() {
      const res = await this.listBatch({ pageNum: 1, pageSize: 16 });
      if (res.rows && res.rows.length > 0) {
        this.batchId = Number(res.rows[0].batchId);
      }
    },

    /** 处理菜单的点击 */
    handleSelect(e) {
      // 格式化输出选中的批次数据
      console.log('选中的批次数据:', {
        批次ID: e.batchId,
        批次名称: e.batchName,
        批次负责人: e.batchHead,
        合约地址: e.contractAddress,
        种植面积: e.cropArea,
        开始时间: e.startTime,
        创建时间: e.createTime,
        状态: e.status,
        备注: e.remark || '无'
      });

      this.batchId = Number(e.batchId);
    }
  }
};
</script>

<style lang="scss" scoped>
.box {
  padding: 15px;
  height: calc(100vh - 84px);
}

.left {
  background: #fff;
  border-radius: 10px 0 0 10px;
  height: 100%;
}

.right {
  background: #fff;
  height: 100%;
  border-radius: 0 10px 10px 0;
  border-left: 1px solid #eee;
  padding: 0 15px;
  overflow: auto;

  .el-empty {
    margin-top: 200px;
  }
}
</style>
