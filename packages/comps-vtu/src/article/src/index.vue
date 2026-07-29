<template>
  <Article v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { Article } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { ArticleProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuArticle', inheritAttrs: false })

const ns = useCxBEM('vtu-article')
const vtuProps = useVtuProps<ArticleProps>(useAttrs(), 'cx-vtu-article')
</script>
