<!-- CxNaiveUiResult: 包装 naive-ui NResult；status/title/description/size 均为其 prop 原样透传 -->
<template>
  <NResult v-bind="naiveProps" :class="ns.b()" data-testid="cx-naive-ui-result" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { NResult } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiResult', inheritAttrs: false })

const ns = useCxBEM('naive-ui-result')
const naiveProps = useNaiveUiProps(useAttrs())
</script>
