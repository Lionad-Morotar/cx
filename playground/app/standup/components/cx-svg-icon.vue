<!-- SVG sprite 图标引用器（原 CSvgIcon 迁移版，prefix 默认 cx-standup） -->
<template>
  <svg class="cx-cx-svg-icon cx-svg-icon" :class="kls" aria-hidden="true">
    <use :xlink:href="iconName"></use>
  </svg>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

defineOptions({ name: 'CxCxSvgIcon' })

const props = withDefaults(
  defineProps<{
    icon?: string
    iconClass?: string
    prefix?: string
    className?: string
  }>(),
  { prefix: 'cx-standup', className: '' },
)

const iconName = computed(() => `#${props.prefix}-${props.iconClass || props.icon}`)
const kls = computed(() => props.className)
</script>

<style scoped>
.cx-svg-icon {
  width: 1.2em;
  height: 1.2em;
  fill: currentColor;
  vertical-align: -0.18em;
  overflow: hidden;
}
</style>
