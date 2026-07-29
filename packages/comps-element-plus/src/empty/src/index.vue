<!-- CxElementPlusEmpty: 包装 EP ElEmpty；纯透传 -->
<template>
  <ElEmpty v-bind="epProps" :class="ns.b()" data-testid="cx-element-plus-empty" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ElEmpty } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusEmpty', inheritAttrs: false })

const ns = useCxBEM('element-plus-empty')
const epProps = useEpProps(useAttrs())
</script>
