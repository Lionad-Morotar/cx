<template>
  <template v-if="isReRendering">
    <div :class="ns.e('placeholder-box')" :style="size" />
  </template>
  <div v-else :class="ns.b()">
    <USelectMenu
      ref="comp"
      v-bind="attrs"
      v-model="value"
      v-model:query="query"
      :options="options"
      label-key="label"
      value-key="value"
      @open="$emit('open')"
      @close="$emit('close')"
      @change="$emit('change', $event)"
    >
      <template v-if="safeIcon(inner.icon) || showSlot('leading')" #leading="x">
        <slot v-if="showSlot('leading')" name="leading" v-bind="x" />
        <CxIcon
          v-else-if="props.loading"
          name="i-heroicons-arrow-path-20-solid"
          class="animate-spin"
        />
        <CxIcon v-else :name="safeIcon(inner.icon)" />
      </template>
      <template v-for="(_, name) in useOmit($slots, ['leading'])" #[name]="x">
        <slot v-if="showSlot(name)" :name="name as unknown as string" v-bind="x" />
      </template>
    </USelectMenu>
  </div>
</template>

<script setup lang="ts">
import { CxIcon } from '@lionad/cx-vue'
import { omit as useOmit } from 'lodash-es'
import { isString } from '@vue/shared'

import { useAttrs, useTemplateRef, computed, ref, watch } from 'vue'

import { USelectMenu } from '../../../vendor/bridge'

import { CxEventDisplayCompKey, has } from '@lionad/cx-definition'
import { useCxSlot, useCxReRender, useCxBEM, safeIcon } from '@lionad/cx-vue'
import type { Placement } from '@popperjs/core'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxSelectMenu' })

type USelectMenuProps = ComponentProps<typeof USelectMenu>

const ns = useCxBEM('select-menu')
const inner = defineProps<{
  icon?: string
  trailingIcon?: string
}>()
const props = useAttrs() as USelectMenuProps & {
  comp: CxComponentRuntime
  dftValue?: string
  dftQuery?: string
  direction?: Placement
}

const { showSlot } = useCxSlot(props.comp)

const compRef: any = useTemplateRef('comp')
const ui = computed(() => {})

const value = ref()
const query = ref(props.dftQuery || '')

const getDftValue = () => {
  value.value = props.multiple
    ? isString(props.dftValue)
      ? [(props.dftValue || '').split(',')].filter(has)
      : []
    : props.dftValue || ''
}
watch(() => props.multiple, getDftValue, { immediate: true })

const options = computed(() => {
  return props.options || []
})

const attrs = computed(
  () =>
    ({
      icon: safeIcon(inner.icon),
      trailingIcon: safeIcon(inner.trailingIcon) || 'i-heroicons-chevron-down-20-solid',
      multiple: has(props.multiple),
      placeholder: props.placeholder || '',
      loading: has(props.loading) || false,
      disabled: has(props.loading) ? true : has(props.disabled),
      padded: props.padded === false ? false : true,
      variant: props.variant || 'outline',
      size: props.size,
      color: props.color,
      searchable: has(props.searchable),
      searchablePlaceholder: props.searchablePlaceholder || '',
      clearSearchOnClose: has(props.clearSearchOnClose),
      creatable: false,
      popper: {
        placement: props.direction || 'bottom',
        arrow: false,
      },
    }) as const,
)

const { isReRendering, size } = useCxReRender(compRef, () => props.direction)

defineExpose({
  [CxEventDisplayCompKey]: (toDisplayComp: CxComponentRuntime) => {
    if (!toDisplayComp) return
    const compsInOptionPanel = [
      ...(props.comp?.components?.default || []),
      ...(props.comp?.components?.empty || []),
    ]
    const isFind = compsInOptionPanel.some((comp) => comp.id === toDisplayComp.id)
    if (isFind) {
      // todo
      // openToast()
    }
  },
})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('select-menu') {
    // display: inline-block;
  }
}
</style>
