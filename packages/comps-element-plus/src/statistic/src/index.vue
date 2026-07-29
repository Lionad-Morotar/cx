<!-- CxElementPlusStatistic: 包装 EP ElStatistic；纯透传 -->
<template>
  <ElStatistic v-bind="epProps" :class="ns.b()" data-testid="cx-element-plus-statistic" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ElStatistic } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusStatistic', inheritAttrs: false })

const ns = useCxBEM('element-plus-statistic')
const epProps = useEpProps(useAttrs())
</script>
