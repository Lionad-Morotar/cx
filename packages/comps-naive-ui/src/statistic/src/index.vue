<!-- CxNaiveUiStatistic: 包装 naive-ui NStatistic；label/value/tabularNums 均为其 prop 原样透传 -->
<template>
  <NStatistic v-bind="naiveProps" :class="ns.b()" data-testid="cx-naive-ui-statistic" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { NStatistic } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiStatistic', inheritAttrs: false })

const ns = useCxBEM('naive-ui-statistic')
const naiveProps = useNaiveUiProps(useAttrs())
</script>
