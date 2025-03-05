<template>
  <ai-report
    :visible.sync="visible"
    :species-data="vegetableData"
    species-type="vegetable"
  />
</template>

<script>
import AIReport from '@/components/AI/AIReport.vue'

export default {
  components: {
    AIReport
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    vegetableData: {
      type: Object,
      required: true
    }
  }
}
</script> 