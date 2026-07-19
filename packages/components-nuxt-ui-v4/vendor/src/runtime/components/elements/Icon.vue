<template>
  <Icon v-bind="$props" />
</template>

<script lang="ts">
// @ts-nocheck —— vendored nuxt-ui v2 第三方源码（MIT），按原版携带，不参与类型质量门
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  props: {
    name: {
      type: String,
      required: true
    },
    mode: {
      type: String as PropType<'svg' | 'css'>,
      required: false,
      default: null
    },
    size: {
      type: [Number, String],
      required: false,
      default: null
    },
    customize: {
      type: Function,
      required: false,
      default: null
    }
  }
})
</script>
