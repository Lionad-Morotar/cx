<template>
  <div :class="ns.e('line-content')" class="cx-render-content" @click="focus">
    <!-- maybe refactor with https://www.npmjs.com/package/rich-string-parser -->
    <template v-if="content?.mention?.length">
      <template v-for="tag in content.mention" :key="tag.id">
        <UBadge
          :class="ns.e('mention-tag')"
          color="neutral"
          variant="subtle"
          :contenteditable="false"
          @click="handleTagClick(tag)"
          >{{ getTagDisplayText(tag) }}</UBadge
        >
      </template>
    </template>
    <span
      v-bind="$attrs"
      ref="contentRef"
      :class="ns.e('line-content-text')"
      :contenteditable="isEditable"
      .spellcheck="false"
      >{{ text }}</span
    >
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useCxNamespace } from '../../../../utils/namespace'
import { useVModel } from '@vueuse/core'
import { standupBus as emitter } from '../../../../utils/standup-bus'

import type { Content, Mention } from '../../types'

defineOptions({ name: 'CxRenderContent' })

const ns = useCxNamespace('todo-card')
const emits = defineEmits(['update:content'])
const props = withDefaults(
  defineProps<{
    content: Content
    disabled?: boolean
    readonly?: boolean
  }>(),
  {
    disabled: false,
    readonly: false,
  },
)
const contentRef = ref<HTMLElement | null>(null)
const content = useVModel(props, 'content', emits)
const isEditable = computed(() => !props.disabled && !props.readonly)

// Vue 插值天然转义文本；预 escape 会造成双重转义并在写回时嵌套恶化
const text = computed(() => content.value.content || '')

const getTagDisplayText = (x?: string | Mention) => {
  if (!x) return ''
  if (typeof x === 'string') return x
  return x?.text || ''
}

const focus = () => contentRef.value?.focus()

const handleTagClick = (tag: Mention) => {
  const text = getTagDisplayText(tag)
  const isTextIssueID = /^#\d+$/.test(text || '')
  if (isTextIssueID) {
    emitter.emit('highlight-issue-by-gitlab-id', text?.slice(1))
  }
}

defineExpose({
  focus,
  getValue: () => contentRef.value?.innerText,
})
</script>

<style>
.cx-todo-card {
  &__line-content {
    display: inline;
    cursor: text;
  }
  &__mention-tag {
    display: inline-block;
    margin-right: 4px;
    height: 25px;
    line-height: 24px;
    cursor: pointer;
  }
  &__line-content-text {
    display: inline;
    width: fit-content;
    height: 100%;
    line-height: inherit;
    font-size: inherit;
    outline: none;
    border: none;
    box-shadow: none;
  }
}
</style>
