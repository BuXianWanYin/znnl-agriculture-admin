<template>
  <div>
    <LayOut :bg="bg" :title="title">
      <template v-slot:two>
        <trace-pecent></trace-pecent>
      </template>
      <template v-slot:three>
        <trace-analyze></trace-analyze>
      </template>
      <template v-slot:six>
        <trace-code></trace-code>
      </template>
      <template v-slot:seven>
        <trace-map></trace-map>
      </template>
    </LayOut>
  </div>
</template>

<script>
import LayOut from "../layOut.vue";
import traceCode from './tracecode.vue'
import traceAnalyze from './traceanalyze'
import tracePecent from './tracepecent.vue'
import traceMap from './tracemap'
export default {
  components: {
    LayOut,
    traceCode,
    traceAnalyze,
    tracePecent,
    traceMap
  },
  data(){
    return{
      bg:require('../img/bg.png'),
      title:["溯源扫码占比","溯源统计分析",'','',"溯源扫码TOP5"],
    }
  }
}
</script>

<style lang="scss" scoped>
  ::v-deep .el-input__inner{
    background: rgba(32,60,73,.4)!important;
    border: none;
    color: #fff
  }
</style>
