<template>
  <!-- 文章卡片；正文流式中（is-streaming）空内容占位由样式层替换为骨架脉冲条 -->
  <Article
    v-bind="vtuProps"
    :class="[ns.b(), ns.is('streaming', streamingContent)]"
    data-testid="cx-vtu-article"
  />
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { Article } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { ArticleProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuArticle', inheritAttrs: false })

const ns = useCxBEM('vtu-article')
const attrs = useAttrs()
const vtuProps = useVtuProps<ArticleProps>(attrs, 'cx-vtu-article')

// 流式骨架标记：trigger 对未闭合的正文向 data 注入 _cx_streaming（下划线前缀，
// useVtuProps 已剥离不透传物料）；标记在时空内容占位转骨架渲染，
// 正文完整到达后标记移除、骨架一次性替换为完整内容
const streamingContent = computed(
  () => Array.isArray(attrs._cx_streaming) && attrs._cx_streaming.includes('content'),
)
</script>

<style scoped>
/* 流式正文骨架：藏起「暂无内容」文案但保留占位元素几何（避免布局跳动），
   以脉冲条示意内容生长；颜色取中性灰，深浅主题下均可辨识 */
.cx-vtu-article.is-streaming :deep([data-slot='empty-placeholder']) {
  color: transparent;
  user-select: none;
}

.cx-vtu-article.is-streaming :deep([data-slot='empty-placeholder'])::before {
  content: '';
  display: block;
  height: 1rem;
  border-radius: 0.375rem;
  background: linear-gradient(
    90deg,
    rgba(148, 163, 184, 0.18) 25%,
    rgba(148, 163, 184, 0.32) 50%,
    rgba(148, 163, 184, 0.18) 75%
  );
  background-size: 200% 100%;
  animation: cx-vtu-article-skeleton-pulse 1.4s ease-in-out infinite;
}

@keyframes cx-vtu-article-skeleton-pulse {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
