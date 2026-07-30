<!-- CxNaiveUiEmpty: 包装 naive-ui NEmpty；description/size 均为其 prop 原样透传 -->
<template>
  <NEmpty v-bind="naiveProps" :class="ns.b()" data-testid="cx-naive-ui-empty" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { NEmpty } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiEmpty', inheritAttrs: false })

const ns = useCxBEM('naive-ui-empty')
const naiveProps = useNaiveUiProps(useAttrs())
</script>
