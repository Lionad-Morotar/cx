<!-- CxNaiveUiAvatar: 包装 naive-ui NAvatar；src/round/size 均为其 prop 原样透传；
     src 为空时 NAvatar 渲染内置人形图标占位 -->
<template>
  <NAvatar v-bind="naiveProps" :class="ns.b()" data-testid="cx-naive-ui-avatar" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { NAvatar } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiAvatar', inheritAttrs: false })

const ns = useCxBEM('naive-ui-avatar')
const naiveProps = useNaiveUiProps(useAttrs())
</script>
