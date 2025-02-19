<template>
  <div class="app-container-gray">
    <el-row class="box">
      <el-col :span="4" class="left">
        <search-menu title="种植分区" :fun="listBatch" search-parma="batchName" search-placeholder="请输入批次名称" key-name="batchId" label-name="batchName" @select="handleSelect" />
      </el-col>
      <el-col :span="20" class="right">
        <task :batch-id="batchId"></task>
      </el-col>
    </el-row>
  </div>
</template>
<script>
//Take用来展示任务列表
//SearchMenu用来展示搜索菜单
import Task from "../components/Task";
import SearchMenu from "../components/SearchMenu";
import { listLand } from "@/api/agriculture/land";
import { listBatch} from "@/api/agriculture/batch";
export default {
  components: { Task,SearchMenu },
  data() {
    return {
      listBatch,
      batchId:null
    };
  },
  created(){
  },
  methods:{

    /** 处理菜单的点击 */
    handleSelect(e){
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

      // 如果想要更漂亮的控制台输出，可以使用 table
      console.table({
        '批次基本信息': {
          'ID': e.batchId,
          '名称': e.batchName,
          '负责人': e.batchHead,
          '面积': e.cropArea,
          '开始时间': e.startTime
        },
        '系统信息': {
          '创建人': e.createBy,
          '创建时间': e.createTime,
          '更新人': e.updateBy,
          '更新时间': e.updateTime,
          '状态': e.status
        },
        '其他信息': {
          '合约地址': e.contractAddress,
          '种质ID': e.germplasmId,
          '种质图片': e.germplasmImg,
          '备注': e.remark || '无'
        }
      });

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
