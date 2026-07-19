<template>
  <UCommandPalette
    ref="cmpt"
    v-model="selected"
    :class="ns.b()"
    multiple
    nullable
    :autoselect="false"
    :placeholder="props.placeholder || '搜索...'"
    :icon="icon"
    :close-button="clearOpts"
    :groups="props.groups || []"
    :fuse="fuseOpts"
    @update:model-value="onSelect"
    @close="$emit('close')"
  >
    <template v-for="(_, name) in $slots" #[name]="x">
      <slot v-if="showSlot(name)" :name="name as unknown as string" v-bind="x" />
    </template>
  </UCommandPalette>
</template>

<script setup lang="ts">
import { useAttrs, computed, useTemplateRef, ref, watchEffect, unref } from 'vue'

import { useCxBEM, safeIcon } from '@lionad/cx-vue'

import { UCommandPalette } from '../../../../vendor/bridge'

/**
 * @see https://ui.nuxt.com/components/command-palette
 */
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'
import type { Item, GroupItem } from '../types'

defineOptions({ name: 'CxCommandPalette' })

type UCommandPaletteProps = ComponentProps<typeof UCommandPalette>

const ns = useCxBEM('command-palette')
const inner = defineProps<{
  icon?: string
}>()
const props = useAttrs() as UCommandPaletteProps & {
  cmpt: CxComponentRuntime
  clear?: boolean
  dftQuery?: string
}
const showSlot = (name: string) => props.cmpt?.components?.[name]?.length
const clearOpts = computed(() => {
  return (
    props.clear
      ? { icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }
      : null
  ) as any
})

const cmptRef = useTemplateRef('cmpt')

const isInited = ref(false)
watchEffect(() => {
  if (!isInited.value && props.dftQuery && unref((cmptRef.value as any)?.updateQuery)) {
    ;(cmptRef.value as any).updateQuery?.(props.dftQuery)
    isInited.value = true
  }
})

const selected = ref([])
const fuseOpts = computed(() => ({
  resultLimit: 6,
  fuseOptions: {
    threshold: 0.1,
    includeMatches: true,
    keys: ['title', 'description', 'keywords', 'tags', 'label', 'key'],
  },
}))

const icon = computed(() => safeIcon(inner.icon || 'i-tabler-search'))

function onSelect(item: Item) {
  console.log('onSelect', item)
  if (item.click) {
    item.click()
  } else if (item.to) {
    console.log('todo')
  } else if (item.href) {
    window.open(item.href, '_blank')
  }
}

defineExpose({
  query: computed(() => cmptRef.value?.query),
  updateQuery: (query: string) => (cmptRef.value as any).updateQuery?.(query),
  results: computed(() => (cmptRef.value as any).results),
})
</script>

<style lang="scss">
@use '../../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('command-palette') {
    // ...
  }
}
</style>
