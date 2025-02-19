<template>
  <div>
    <svg-icon icon-class="github" @click="goto" class="github-icon"/>
  </div>
</template>

<script>
export default {
  name: 'RuoYiGit',
  data() {
    return {
      url: 'https://gitee.com/y_project/RuoYi-Vue'
    }
  },
  methods: {
    goto() {
      window.open(this.url)
    }
  }
}
</script>

<style scoped>
.github-icon {
  font-size: 20px;
  cursor: pointer;
}
.github-icon:hover {
  color: #24292e;
}
</style>