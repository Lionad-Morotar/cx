<!-- CxElementPlusAvatar: 包装 EP ElAvatar；纯透传 -->
<template>
  <ElAvatar v-bind="epProps" :class="ns.b()" data-testid="cx-element-plus-avatar" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ElAvatar } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusAvatar', inheritAttrs: false })

const ns = useCxBEM('element-plus-avatar')
const epProps = useEpProps(useAttrs())
</script>
