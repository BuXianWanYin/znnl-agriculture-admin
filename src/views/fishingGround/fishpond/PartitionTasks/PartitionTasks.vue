<template>
    <!-- 
    分区任务页面
    -->
    <div class="app-container-gray">
      <el-row class="box">
        <el-col :span="4" class="left">
          <search-menu title="养殖批次" :fun="listBatch" search-parma="batchName" search-placeholder="请输入批次名称" key-name="batchId" label-name="batchName" @select="handleSelect" />
        </el-col>
        <el-col :span="20" class="right">
          <task :batch-id="batchId"></task>
        </el-col>
      </el-row>
    </div>
  </template>
  <script>
// 引入分区养殖批次任务页面
import Task from "@/views/fishingGround/Task/task";
import SearchMenu from "@/views/fishingGround/fishpond/PartitionTasks/SearchMenu.vue";
import { listLand } from "@/api/agriculture/land";
import { listBatch } from "@/api/fishingGround/batch";

export default {
  components: { Task, SearchMenu },
  data() {
    return {
      listBatch,
      batchId: null,
      activeMenu: {
        isActive: true,  // Add this to enable default selection
        name: 'batchId',
        value: ''
      }
    };
  },
  created() {
    // Initialize with default selection
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
      this.batchId = Number(e.batchId);
    }
  },
};
  </script>
  <style lang="scss" scoped>
  .box {
    padding: 15px;
  }
  .left {
    background: #fff;
    border-radius: 10px 0 0 10px;
  }
  .right {
    background: #fff;
    height:calc(100vh - 84px - 30px);
    border-radius: 0 10px 10px 0;
    border-left: 1px solid #eee;
    padding: 0 15px;
    overflow: auto;
  }
  </style>
  