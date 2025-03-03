<template>
  <div class="svg-icon" :style="{ fontSize: size + 'px' }">
    <svg class="icon" aria-hidden="true">
      <use :xlink:href="iconName"></use>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'SvgIcon',
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: [Number, String],
      default: 16
    }
  },
  computed: {
    iconName() {
      return `#${this.name}`;
    }
  }
};
</script>

<style scoped>
.svg-icon {
  display: inline-flex;
  align-items: center;
  color: inherit;
  font-style: normal;
  line-height: 0;
  text-align: center;
  text-transform: none;
}

.svg-icon svg {
  width: 1em;
  height: 1em;
  fill: currentColor;
  overflow: hidden;
}
</style>
